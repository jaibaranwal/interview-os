"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackEngine = void 0;
const CurriculumLoader_1 = require("../data/CurriculumLoader");
const LLMClient_1 = require("./LLMClient");
const logger_1 = require("../utils/logger");
class FeedbackEngine {
    curriculumLoader;
    llmClient;
    constructor(curriculumLoader = CurriculumLoader_1.CurriculumLoader.getInstance(), llmClient = new LLMClient_1.LLMClient()) {
        this.curriculumLoader = curriculumLoader;
        this.llmClient = llmClient;
    }
    async generateFeedback(candidate, memory) {
        const visitedDays = memory.getVisitedDays();
        const askedQuestions = memory.getAskedQuestions();
        const candidateAnswers = memory.getCandidateAnswers();
        const recordedStrengths = memory.getStrengths();
        const recordedWeaknesses = memory.getWeaknesses();
        const mistakes = memory.getMistakes();
        const member = candidate.member;
        // 1. Build deterministic fallbacks as baseline
        const visitedDayTitles = visitedDays.map((d) => {
            const dayData = this.curriculumLoader.getDayByNumber(d);
            return dayData ? `Day ${d}: ${dayData.title}` : `Day ${d}`;
        });
        const strengths = [];
        if (recordedStrengths.length > 0) {
            strengths.push(...recordedStrengths);
        }
        else {
            strengths.push(`Demonstrated solid engagement across ${visitedDays.length} evaluated cohort days (${visitedDayTitles.slice(0, 2).join(', ')}).`, `Effective communication of practical development experience in ${member.jobRole}.`);
        }
        const gaps = [];
        if (recordedWeaknesses.length > 0) {
            gaps.push(...recordedWeaknesses);
        }
        else {
            // Check skipped missions in candidate profile
            const skippedMissions = candidate.missions.filter((m) => m.skipped);
            if (skippedMissions.length > 0) {
                gaps.push(`Skipped key cohort module: Day ${skippedMissions[0].day} (${skippedMissions[0].title}).`);
            }
            else {
                gaps.push(`Opportunities to deepen architectural trade-off analysis in large-scale AI deployments.`);
            }
        }
        const next = [];
        visitedDays.forEach((dayNum) => {
            const dayData = this.curriculumLoader.getDayByNumber(dayNum);
            if (dayData && dayData.objectives.length > 0) {
                next.push(`Review Day ${dayNum} (${dayData.title}): Practice ${dayData.objectives[0]}`);
            }
        });
        if (next.length < 2) {
            next.push('Implement end-to-end evaluation metrics and observability logging using Prometheus & Grafana.');
        }
        const summary = `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed a ${askedQuestions.length}-question interview covering ${visitedDays.length} curriculum days (${visitedDayTitles.join(', ')}). Overall performance demonstrated clear technical capability with actionable growth areas.`;
        const deterministicFeedback = {
            summary,
            strengths: Array.from(new Set(strengths)).slice(0, 4),
            gaps: Array.from(new Set(gaps)).slice(0, 4),
            next: Array.from(new Set(next)).slice(0, 4)
        };
        // 2. Attempt LLM enhancement if client available
        try {
            const prompt = `You are a Senior Technical Interview Evaluator. Synthesize structured JSON feedback for ${member.name}.
Candidate Role: ${member.jobRole}
Evaluated Days: ${visitedDayTitles.join(', ')}
Total Questions Asked: ${askedQuestions.length}
Candidate Claims & Answers: ${candidateAnswers.map((a) => a.text).join(' | ')}

Output MUST be raw valid JSON matching:
{
  "summary": "2-sentence performance overview",
  "strengths": ["concise strength 1", "concise strength 2"],
  "gaps": ["concise gap 1", "concise gap 2"],
  "next": ["actionable next step 1", "actionable next step 2"]
}`;
            const llmOutput = await this.llmClient.generate(prompt, '');
            const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.summary &&
                    Array.isArray(parsed.strengths) &&
                    Array.isArray(parsed.gaps) &&
                    Array.isArray(parsed.next) &&
                    parsed.strengths.length > 0) {
                    logger_1.Logger.info(`Generated LLM-enhanced feedback for session.`);
                    return parsed;
                }
            }
        }
        catch (err) {
            logger_1.Logger.info(`LLM feedback enhancement skipped, using deterministic feedback engine output.`);
        }
        return deterministicFeedback;
    }
}
exports.FeedbackEngine = FeedbackEngine;
