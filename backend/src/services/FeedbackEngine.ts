import {
  FeedbackObject,
  CandidateProfile,
  LLMEvaluationResult,
  CompetencyScores,
  TopicPerformanceRecord
} from '../types';
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

    // ── Prompt 30 Requirement 3: Cumulative Evidence Weighting ──
    // Later strong answers outweigh earlier uncertainty.
    const topicEvaluationsMap = new Map<number, LLMEvaluationResult[]>();
    askedQuestions.forEach((q, idx) => {
      const evalResult = evaluations[idx];
      if (evalResult) {
        const list = topicEvaluationsMap.get(q.day) || [];
        list.push(evalResult);
        topicEvaluationsMap.set(q.day, list);
      }
    });

    // Compute max score achieved per topic (so late strong answers override early uncertainty)
    const topicPerformance: TopicPerformanceRecord[] = [];
    const bestScorePerDay = new Map<number, number>();

    visitedDays.forEach((dayNum) => {
      const evals = topicEvaluationsMap.get(dayNum) || [];
      let bestScore = 0;
      evals.forEach((e) => {
        if (e.score > bestScore) bestScore = e.score;
      });

      // If no evals recorded for day, default to average score or 50
      if (evals.length === 0) bestScore = 50;

      bestScorePerDay.set(dayNum, bestScore);

      // Convert 0-100 score to 1-5 rating
      const rating = Math.min(5, Math.max(1, Math.round(bestScore / 20)));
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

      const dayData = this.curriculumLoader.getDayByNumber(dayNum);
      const topicTitle = dayData ? `Day ${dayNum}: ${dayData.title}` : `Day ${dayNum}`;

      topicPerformance.push({
        topic: topicTitle,
        dayNum,
        stars,
        score: rating
      });
    });

    // ── Prompt 30 Requirement 1: 5 Core Competency Scores (1-5 scale) ──
    const goodEvaluations = evaluations.filter(
      (e) => e.score >= 60 || ['GOOD', 'EXCELLENT'].includes(e.correctness)
    );
    const totalTurns = Math.max(1, evaluations.length);

    // Cumulative evidence scoring (weighting best scores higher)
    const allScores = Array.from(bestScorePerDay.values());
    const avgBestScore = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 50;

    // Technical Understanding (1-5)
    const techRating = Math.min(5, Math.max(1, Math.round((avgBestScore / 100) * 5)));

    // Practical Implementation (1-5): based on detected concepts & good evaluations
    const hasImplementationDetails = goodEvaluations.some((e) => e.detected_concepts && e.detected_concepts.length >= 2);
    const implRating = hasImplementationDetails
      ? Math.min(5, techRating)
      : Math.max(1, techRating - 1);

    // System Design / Architecture (1-5)
    const hasArchDetails = goodEvaluations.some((e) =>
      e.score >= 70 || (e.detected_concepts || []).some((c) => c.toLowerCase().includes('vector') || c.toLowerCase().includes('rag') || c.toLowerCase().includes('fastapi'))
    );
    const archRating = hasArchDetails ? Math.min(5, techRating) : Math.max(1, techRating - 1);

    // Trade-off Analysis (1-5)
    const hasTradeoffDetails = evaluations.some((e) => e.score >= 75);
    const tradeoffRating = hasTradeoffDetails ? Math.min(5, techRating) : Math.max(1, Math.round(techRating * 0.8));

    // Communication Quality (1-5): based on absence of profanity/gibberish
    const badTurns = evaluations.filter((e) => ['PROFANITY', 'GIBBERISH', 'REFUSAL'].includes(e.correctness)).length;
    const commRating = Math.min(5, Math.max(1, Math.round(5 - (badTurns / totalTurns) * 3)));

    const averageCompetencyScore = Math.round(
      ((techRating + implRating + archRating + tradeoffRating + commRating) / 5) * 10
    ) / 10;

    const competencyScores: CompetencyScores = {
      technicalUnderstanding: techRating,
      practicalImplementation: implRating,
      systemDesignArchitecture: archRating,
      tradeoffAnalysis: tradeoffRating,
      communicationQuality: commRating,
      averageScore: averageCompetencyScore
    };

    // ── Prompt 30 Requirement 5: Competency-Based Hiring Thresholds ──
    let hiringRecommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire';
    if (averageCompetencyScore >= 4.5) {
      hiringRecommendation = 'Strong Hire';
    } else if (averageCompetencyScore >= 4.0) {
      hiringRecommendation = 'Hire';
    } else if (averageCompetencyScore >= 3.0) {
      hiringRecommendation = 'Lean Hire';
    } else if (averageCompetencyScore >= 2.5) {
      hiringRecommendation = 'Weak Pass';
    } else {
      hiringRecommendation = 'No Hire';
    }

    // ── Prompt 30 Requirement 9: Evaluation Confidence ──
    const technicalAnswerCount = evaluations.filter((e) => e.score >= 30).length;
    let confidence: 'High' | 'Medium' | 'Low';
    if (technicalAnswerCount >= 4) {
      confidence = 'High';
    } else if (technicalAnswerCount >= 2) {
      confidence = 'Medium';
    } else {
      confidence = 'Low';
    }

    // ── Prompt 30 Requirement 2 & 7: Evidence Aggregation (Max 3 Competency Strengths) ──
    const allDetectedConcepts = new Set<string>();
    goodEvaluations.forEach((e) => {
      (e.detected_concepts || []).forEach((c) => {
        if (c && c.length > 2) allDetectedConcepts.add(c.toLowerCase());
      });
    });

    const conceptsArr = Array.from(allDetectedConcepts);
    const aggregatedStrengths: string[] = [];

    const hasVectorTech = conceptsArr.some((c) =>
      c.includes('vector') || c.includes('embedding') || c.includes('chroma') || c.includes('faiss') || c.includes('sentence transformer')
    );
    if (hasVectorTech) {
      aggregatedStrengths.push('Demonstrated practical experience designing AI backend services using vector embeddings, similarity search, and ChromaDB.');
    }

    const hasApiTech = conceptsArr.some((c) =>
      c.includes('api') || c.includes('fastapi') || c.includes('endpoint') || c.includes('ollama') || c.includes('http')
    );
    if (hasApiTech) {
      aggregatedStrengths.push('Showed solid awareness of AI backend API architecture, reusable endpoints, and service deployment.');
    }

    const hasPythonTech = conceptsArr.some((c) =>
      c.includes('python') || c.includes('vs code') || c.includes('virtual environment') || c.includes('pylance') || c.includes('sqlite')
    );
    if (hasPythonTech) {
      aggregatedStrengths.push('Demonstrated proficiency in Python environment setup, virtual environments, and developer tooling.');
    }

    if (goodEvaluations.length > 0 && aggregatedStrengths.length === 0) {
      const topTopics = topicPerformance.filter((t) => t.score >= 3).map((t) => t.topic).slice(0, 2).join(' and ');
      aggregatedStrengths.push(`Demonstrated practical technical capability across ${topTopics || 'evaluated topics'}.`);
    }

    const finalStrengths = aggregatedStrengths.length > 0
      ? aggregatedStrengths.slice(0, 3) // MAX 3 BULLETS
      : ['No technical strengths demonstrated.'];

    // ── Prompt 30 Requirement 8: Areas for Growth (Max 5 Bullets, No False Gaps) ──
    // Do NOT include gaps for topics where candidate later demonstrated strong knowledge!
    const rawWeaknesses = memory.getWeaknesses();
    const genuineGaps: string[] = [];

    rawWeaknesses.forEach((w) => {
      const trimmed = w.trim();
      const isWeaknessOverridden = Array.from(bestScorePerDay.values()).some((score) => score >= 70);
      if (!isWeaknessOverridden || !trimmed.toLowerCase().includes('lacked technical depth')) {
        const isDup = genuineGaps.some((g) => g.toLowerCase().includes(trimmed.toLowerCase()));
        if (!isDup && !trimmed.toLowerCase().includes('no technical strengths')) {
          genuineGaps.push(trimmed.endsWith('.') ? trimmed : `${trimmed}.`);
        }
      }
    });

    if (genuineGaps.length === 0 && averageCompetencyScore < 4.0) {
      genuineGaps.push('Opportunities to deepen architectural trade-off analysis in large-scale AI deployments.');
    }

    const finalGaps = genuineGaps.slice(0, 5); // MAX 5 BULLETS

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

    // ── Prompt 30 Requirement 6: Evidence-Grounded Executive Summary ──
    const topTopicTitles = topicPerformance.filter((t) => t.score >= 3).map((t) => t.topic.replace(/^Day \d+: /, '')).join(', ');
    const summary = goodEvaluations.length > 0
      ? `${member.name} demonstrated practical knowledge of ${topTopicTitles || 'AI engineering fundamentals'}. Responses showed implementation experience and technical reasoning. Evaluation Confidence: ${confidence}. Hiring Recommendation: ${hiringRecommendation} (Avg Score: ${averageCompetencyScore}/5.0).`
      : `${member.name} completed the technical evaluation covering ${visitedDays.length} topics. Candidate struggled across evaluation criteria and demonstrated no verified technical strengths. Evaluation Confidence: ${confidence}. Hiring Recommendation: ${hiringRecommendation} (Avg Score: ${averageCompetencyScore}/5.0).`;

    const deterministicFeedback: FeedbackObject = {
      summary,
      competencyScores,
      strengths: finalStrengths,
      gaps: finalGaps,
      next: Array.from(new Set(next)).slice(0, 4),
      topicPerformance,
      hiringRecommendation,
      confidence,
      communicationAssessment: commRating >= 4 ? 'Clear and professional technical communication.' : 'Communication lacked technical depth in several turns.'
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
Competency Average Score: ${averageCompetencyScore}/5.0
Hiring Recommendation: ${hiringRecommendation}
Evaluation Confidence: ${confidence}
Topic Performance: ${topicPerformance.map((t) => `${t.topic}: ${t.stars}`).join('; ')}
Candidate Demonstrated Strengths: ${finalStrengths.join('; ')}
Documented Learning Gaps: ${finalGaps.length > 0 ? finalGaps.join('; ') : 'None'}
Candidate Answers: ${sanitizedAnswers.map((a, i) => `[${i + 1}] ${a}`).join(' | ')}

MANDATORY RULES — PROMPT 30 EVALUATION REPORT ENGINE:
1. SUMMARY: Write a 2-3 sentence evidence-grounded summary referencing specific candidate name, topics, and verified performance.
2. STRENGTHS (MAX 3 BULLETS): Output at most 3 competency-level merged bullet points.
3. GAPS (MAX 5 BULLETS): Output at most 5 genuine deduplicated learning gaps.

Generate a raw valid JSON hiring panel report:
{
  "summary": "${summary}",
  "competencyScores": {
    "technicalUnderstanding": ${techRating},
    "practicalImplementation": ${implRating},
    "systemDesignArchitecture": ${archRating},
    "tradeoffAnalysis": ${tradeoffRating},
    "communicationQuality": ${commRating},
    "averageScore": ${averageCompetencyScore}
  },
  "strengths": ${JSON.stringify(finalStrengths)},
  "gaps": ${JSON.stringify(finalGaps)},
  "next": ${JSON.stringify(deterministicFeedback.next)},
  "hiringRecommendation": "${hiringRecommendation}",
  "confidence": "${confidence}"
}

Output ONLY raw valid JSON.`;

      const llmOutput = await this.llmClient.generate(prompt, '');
      const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as FeedbackObject;
        if (
          parsed.summary &&
          Array.isArray(parsed.strengths) &&
          Array.isArray(parsed.gaps)
        ) {
          parsed.competencyScores = parsed.competencyScores || competencyScores;
          parsed.topicPerformance = topicPerformance;
          parsed.strengths = (parsed.strengths || []).slice(0, 3);
          parsed.gaps = (parsed.gaps || []).slice(0, 5);
          parsed.hiringRecommendation = hiringRecommendation;
          parsed.confidence = confidence;
          Logger.info(`Generated LLM-enhanced competency evaluation report for session.`);
          return parsed;
        }
      }
    } catch (err: any) {
      Logger.warn('LLM feedback enhancement failed — using deterministic fallback.', err.message);
    }

    return deterministicFeedback;
  }
}
