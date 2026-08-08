import { FeedbackObject, CandidateProfile, LLMEvaluationResult } from '../types';
import { ConversationMemory } from '../memory/ConversationMemory';
import { CurriculumLoader } from '../data/CurriculumLoader';
import { ILLMClient, getSharedLLMClient } from './LLMClient';
import { Logger } from '../utils/logger';

export interface IFeedbackEngine {
  generateFeedback(
    candidate: CandidateProfile,
    memory: ConversationMemory
  ): Promise<FeedbackObject>;
}

export class FeedbackEngine implements IFeedbackEngine {
  private curriculumLoader: CurriculumLoader;
  private llmClient: ILLMClient;

  constructor(
    curriculumLoader: CurriculumLoader = CurriculumLoader.getInstance(),
    llmClient?: ILLMClient
  ) {
    this.curriculumLoader = curriculumLoader;
    this.llmClient = llmClient || getSharedLLMClient();
  }

  public async generateFeedback(
    candidate: CandidateProfile,
    memory: ConversationMemory
  ): Promise<FeedbackObject> {
    const visitedDays = memory.getVisitedDays();
    const askedQuestions = memory.getAskedQuestions();
    const candidateAnswers = memory.getCandidateAnswers();
    const evaluations = memory.getEvaluations();
    const member = candidate.member;

    const visitedDayTitles = visitedDays.map((d) => {
      const dayData = this.curriculumLoader.getDayByNumber(d);
      return dayData ? `Day ${d}: ${dayData.title}` : `Day ${d}`;
    });

    // ── Prompt 27 Issue 1: Credit ALL Good / Successful Answers ──
    const goodEvaluations = evaluations.filter(
      (e) => e.score >= 60 || ['GOOD', 'EXCELLENT'].includes(e.correctness)
    );

    const verifiedStrengths: string[] = [];

    // Extract all demonstrated concepts and strengths from good evaluations
    goodEvaluations.forEach((evalResult) => {
      if (evalResult.detected_concepts && evalResult.detected_concepts.length > 0) {
        evalResult.detected_concepts.forEach((concept) => {
          if (concept && concept.length > 2) {
            verifiedStrengths.push(`Demonstrated understanding of ${concept}.`);
          }
        });
      }
      if (evalResult.strengths && evalResult.strengths.length > 0) {
        evalResult.strengths.forEach((s) => {
          if (s && !s.toLowerCase().includes('no technical strengths')) {
            verifiedStrengths.push(s.endsWith('.') ? s : `${s}.`);
          }
        });
      }
    });

    // Merge with memory strengths
    const memoryStrengths = memory.getStrengths();
    memoryStrengths.forEach((s) => {
      if (s && !s.toLowerCase().includes('no technical strengths')) {
        verifiedStrengths.push(s.endsWith('.') ? s : `${s}.`);
      }
    });

    const uniqueStrengths = Array.from(new Set(verifiedStrengths));

    const finalStrengths: string[] = [];
    if (uniqueStrengths.length > 0) {
      finalStrengths.push(...uniqueStrengths.slice(0, 4));
    } else {
      finalStrengths.push("No technical strengths demonstrated.");
    }

    // ── Knowledge Gaps ──
    const gaps: string[] = [];
    const memoryWeaknesses = memory.getWeaknesses();
    if (memoryWeaknesses.length > 0) {
      gaps.push(...memoryWeaknesses.slice(0, 4));
    } else {
      const skippedMissions = candidate.missions.filter((m) => m.skipped);
      if (skippedMissions.length > 0) {
        gaps.push(`Limited coverage of Day ${skippedMissions[0].day}: ${skippedMissions[0].title}.`);
      } else {
        gaps.push('Opportunities to deepen architectural trade-off analysis in large-scale AI deployments.');
      }
    }

    // ── Study Plan ──
    const next: string[] = [];
    visitedDays.forEach((dayNum) => {
      const dayData = this.curriculumLoader.getDayByNumber(dayNum);
      if (dayData && dayData.objectives.length > 0) {
        next.push(`Review Day ${dayNum} (${dayData.title}): Practice ${dayData.objectives[0]}`);
      }
    });
    if (next.length < 2) {
      next.push('Implement end-to-end evaluation metrics and observability using structured logging.');
    }

    // ── Hiring Recommendation & Communication Assessment ──
    const avgScore = memory.getAverageScore();
    let hiringRecommendation: string;
    if (avgScore >= 80) {
      hiringRecommendation = 'Strong Hire';
    } else if (avgScore >= 60) {
      hiringRecommendation = 'Hire';
    } else if (goodEvaluations.length > 0) {
      hiringRecommendation = 'Weak Pass';
    } else {
      hiringRecommendation = 'Do Not Hire';
    }

    const communicationAssessment = uniqueStrengths.length > 0
      ? 'Candidate communicated technical concepts clearly when providing responses.'
      : 'Candidate struggled to articulate technical details and implementation specifics.';

    const topicsDemonstrated = visitedDayTitles;
    const allCohortDays = [1, 4, 7, 8, 10, 12, 14];
    const unvisitedDays = allCohortDays.filter((d) => !visitedDays.includes(d));
    const topicsSkipped = unvisitedDays.map((d) => {
      const dayData = this.curriculumLoader.getDayByNumber(d);
      return dayData ? `Day ${d}: ${dayData.title}` : `Day ${d}`;
    });

    const hasGoodAnswers = uniqueStrengths.length > 0;
    const summary = hasGoodAnswers
      ? `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed a technical interview covering ${visitedDays.length} curriculum topic${visitedDays.length !== 1 ? 's' : ''}. Demonstrated verified technical understanding in key areas. Recommendation: ${hiringRecommendation}.`
      : `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed a technical interview covering ${visitedDays.length} curriculum topic${visitedDays.length !== 1 ? 's' : ''}. No verified technical strengths were demonstrated during the session. Recommendation: ${hiringRecommendation}.`;

    const deterministicFeedback: FeedbackObject = {
      summary,
      strengths: finalStrengths,
      gaps: Array.from(new Set(gaps)).slice(0, 4),
      next: Array.from(new Set(next)).slice(0, 4),
      communicationAssessment,
      topicsDemonstrated,
      topicsSkipped,
      hiringRecommendation
    };

    // Attempt LLM-enhanced feedback
    try {
      const sanitizedAnswers = candidateAnswers
        .map((a) => a.text
          .replace(/[\r\n\t]/g, ' ')
          .replace(/[<>{}[\]|\\^`]/g, '')
          .slice(0, 300)
        )
        .filter((a) => a.length > 5)
        .slice(-10);

      const prompt = `You are a Senior Technical Hiring Panel generating a final candidate evaluation report.

Candidate: ${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp)
Topics Evaluated: ${visitedDayTitles.join(', ')}
Questions Asked: ${askedQuestions.length}
Verified Demonstrated Strengths: ${hasGoodAnswers ? uniqueStrengths.join('; ') : 'NONE (Candidate provided no verified technical evidence)'}
Documented Learning Gaps: ${memoryWeaknesses.length > 0 ? memoryWeaknesses.join('; ') : 'General implementation gaps'}
Candidate Answers: ${sanitizedAnswers.map((a, i) => `[${i + 1}] ${a}`).join(' | ')}

MANDATORY RULES:
1. EVIDENCE-DRIVEN STRENGTHS: If verified demonstrated strengths exist above, you MUST credit them in "strengths". Only if NO verified strengths exist output "strengths": ["No technical strengths demonstrated."].
2. Never invent strengths that were not demonstrated by candidate.

Generate a raw valid JSON hiring panel report:
{
  "summary": "<2-sentence executive summary with recommendation>",
  "strengths": ["<strength 1>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "next": ["<recommendation 1>", "<recommendation 2>"],
  "communicationAssessment": "<1 sentence communication assessment>",
  "topicsDemonstrated": [${visitedDayTitles.map((t) => `"${t}"`).join(', ')}],
  "topicsSkipped": [${topicsSkipped.map((t) => `"${t}"`).join(', ')}],
  "hiringRecommendation": "${hiringRecommendation}"
}

Output ONLY raw valid JSON.`;

      const llmOutput = await this.llmClient.generate(prompt, '');
      const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as FeedbackObject;
        if (
          parsed.summary &&
          Array.isArray(parsed.strengths) &&
          Array.isArray(parsed.gaps) &&
          Array.isArray(parsed.next) &&
          parsed.strengths.length > 0
        ) {
          if (!hasGoodAnswers) {
            parsed.strengths = ["No technical strengths demonstrated."];
          } else if (parsed.strengths.includes("No technical strengths demonstrated.")) {
            parsed.strengths = finalStrengths;
          }
          parsed.hiringRecommendation = parsed.hiringRecommendation || hiringRecommendation;
          Logger.info(`Generated LLM-enhanced hiring panel report for session.`);
          return parsed;
        }
      }
    } catch (err: any) {
      Logger.warn('LLM feedback enhancement failed — using deterministic fallback.', err.message);
    }

    return deterministicFeedback;
  }
}
