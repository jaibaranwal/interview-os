"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackEngine = void 0;
const CurriculumLoader_1 = require("../data/CurriculumLoader");
const LLMClient_1 = require("./LLMClient");
const logger_1 = require("../utils/logger");
class FeedbackEngine {
    curriculumLoader;
    llmClient;
    constructor(curriculumLoader = CurriculumLoader_1.CurriculumLoader.getInstance(), llmClient) {
        this.curriculumLoader = curriculumLoader;
        this.llmClient = llmClient || (0, LLMClient_1.getSharedLLMClient)();
    }
    async generateFeedback(candidate, memory) {
        const visitedDays = memory.getVisitedDays();
        const askedQuestions = memory.getAskedQuestions();
        const candidateAnswers = memory.getCandidateAnswers();
        const evaluations = memory.getEvaluations();
        const member = candidate.member;
        const visitedDayTitles = visitedDays.map((d) => {
            const dayData = this.curriculumLoader.getDayByNumber(d);
            return dayData ? `Day ${d}: ${dayData.title}` : `Day ${d}`;
        });
        const goodEvaluations = evaluations.filter((e) => e.score >= 60 || ['GOOD', 'EXCELLENT'].includes(e.correctness));
        // ── Prompt 29 Issue 1: Competency Grouping (Max 3 Strengths) ──
        const demonstratedConcepts = new Set();
        goodEvaluations.forEach((evalResult) => {
            if (evalResult.detected_concepts) {
                evalResult.detected_concepts.forEach((c) => {
                    if (c && c.length > 2)
                        demonstratedConcepts.add(c.toLowerCase());
                });
            }
        });
        const groupedStrengths = [];
        const conceptsArr = Array.from(demonstratedConcepts);
        const hasVectorConcepts = conceptsArr.some((c) => c.includes('vector') || c.includes('embedding') || c.includes('chroma') || c.includes('faiss') || c.includes('sentence transformer'));
        if (hasVectorConcepts) {
            groupedStrengths.push('Demonstrated practical awareness of vector embeddings, similarity search, and retrieval-augmented generation.');
        }
        const hasApiConcepts = conceptsArr.some((c) => c.includes('api') || c.includes('fastapi') || c.includes('endpoint') || c.includes('server') || c.includes('http'));
        if (hasApiConcepts) {
            groupedStrengths.push('Demonstrated understanding of building backend AI application services and API design.');
        }
        const hasEnvConcepts = conceptsArr.some((c) => c.includes('python') || c.includes('vs code') || c.includes('virtual environment') || c.includes('pylance') || c.includes('sqlite'));
        if (hasEnvConcepts) {
            groupedStrengths.push('Showed foundational proficiency in Python environment configuration and data management tooling.');
        }
        // Add generic grouped strength if good evaluations exist but fell outside categories
        if (goodEvaluations.length > 0 && groupedStrengths.length === 0) {
            const dayNames = visitedDayTitles.slice(0, 2).join(' and ');
            groupedStrengths.push(`Demonstrated solid technical understanding of core concepts in ${dayNames}.`);
        }
        const finalStrengths = groupedStrengths.length > 0
            ? groupedStrengths.slice(0, 3) // Prompt 29 Rule: MAXIMUM 3 STRENGTHS
            : ['No technical strengths demonstrated.'];
        // ── Prompt 29: Deduplicated Knowledge Gaps (Max 6 Bullets) ──
        const rawWeaknesses = memory.getWeaknesses();
        const uniqueWeaknesses = [];
        rawWeaknesses.forEach((w) => {
            const trimmed = w.trim();
            const isDuplicate = uniqueWeaknesses.some((existing) => existing.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(existing.toLowerCase()));
            if (!isDuplicate && !trimmed.toLowerCase().includes('no technical strengths')) {
                uniqueWeaknesses.push(trimmed.endsWith('.') ? trimmed : `${trimmed}.`);
            }
        });
        if (uniqueWeaknesses.length === 0) {
            const skippedMissions = candidate.missions.filter((m) => m.skipped);
            if (skippedMissions.length > 0) {
                uniqueWeaknesses.push(`Limited coverage of Day ${skippedMissions[0].day}: ${skippedMissions[0].title}.`);
            }
            else {
                uniqueWeaknesses.push('Opportunities to deepen architectural trade-off analysis in large-scale AI deployments.');
            }
        }
        const finalGaps = uniqueWeaknesses.slice(0, 6); // Prompt 29 Rule: MAXIMUM 6 BULLETS
        // ── Study Plan ──
        const next = [];
        visitedDays.forEach((dayNum) => {
            const dayData = this.curriculumLoader.getDayByNumber(dayNum);
            if (dayData && dayData.objectives.length > 0) {
                next.push(`Review Day ${dayNum} (${dayData.title}): Practice ${dayData.objectives[0]}`);
            }
        });
        if (next.length < 2) {
            next.push('Implement end-to-end evaluation metrics and observability using structured logging.');
        }
        // ── Prompt 29 Rule: Balanced Executive Summary reflecting overall performance ──
        const totalTurns = evaluations.length || 1;
        const goodTurns = goodEvaluations.length;
        const successRatio = goodTurns / totalTurns;
        const avgScore = memory.getAverageScore();
        let hiringRecommendation;
        let performanceTone;
        if (successRatio >= 0.70 && avgScore >= 75) {
            hiringRecommendation = 'Strong Hire';
            performanceTone = 'demonstrated strong, consistent technical performance across evaluated curriculum topics';
        }
        else if (successRatio >= 0.50 && avgScore >= 60) {
            hiringRecommendation = 'Hire';
            performanceTone = 'demonstrated solid technical understanding in key areas with minor implementation gaps';
        }
        else if (goodTurns > 0) {
            hiringRecommendation = 'Weak Pass';
            performanceTone = `demonstrated foundational awareness in isolated areas (answering ${goodTurns} of ${totalTurns} questions correctly), but struggled across core technical evaluation criteria`;
        }
        else {
            hiringRecommendation = 'Do Not Hire';
            performanceTone = 'struggled across all technical evaluation criteria and demonstrated no verified technical strengths';
        }
        const communicationAssessment = goodTurns > 0
            ? 'Candidate communicated technical concepts clearly when providing responses.'
            : 'Candidate struggled to articulate technical details and implementation specifics.';
        const topicsDemonstrated = visitedDayTitles;
        const allCohortDays = [1, 4, 7, 8, 10, 12, 14];
        const unvisitedDays = allCohortDays.filter((d) => !visitedDays.includes(d));
        const topicsSkipped = unvisitedDays.map((d) => {
            const dayData = this.curriculumLoader.getDayByNumber(d);
            return dayData ? `Day ${d}: ${dayData.title}` : `Day ${d}`;
        });
        const summary = `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed an interview covering ${visitedDays.length} topic${visitedDays.length !== 1 ? 's' : ''}. Candidate ${performanceTone}. Hiring Recommendation: ${hiringRecommendation}.`;
        const deterministicFeedback = {
            summary,
            strengths: finalStrengths,
            gaps: finalGaps,
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
                .slice(0, 300))
                .filter((a) => a.length > 5)
                .slice(-10);
            const prompt = `You are a Senior Technical Hiring Panel generating a final candidate evaluation report.

Candidate: ${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp)
Total Questions Attempted: ${totalTurns}
Successful Answers (Score >= 60): ${goodTurns} (${Math.round(successRatio * 100)}%)
Topics Evaluated: ${visitedDayTitles.join(', ')}
Demonstrated Concepts: ${conceptsArr.length > 0 ? conceptsArr.join(', ') : 'NONE'}
Documented Learning Gaps: ${uniqueWeaknesses.length > 0 ? uniqueWeaknesses.join('; ') : 'General implementation gaps'}
Candidate Answers: ${sanitizedAnswers.map((a, i) => `[${i + 1}] ${a}`).join(' | ')}

MANDATORY RULES — PROMPT 29 REPORT ACCURACY POLISH:
1. STRENGTHS (MAXIMUM 3 BULLETS): Group related concepts into broad competency-based bullet points (e.g. "Demonstrated understanding of building AI applications with FastAPI"). Do NOT list individual technology keywords. Max 3 bullets total.
2. LEARNING GAPS (MAXIMUM 6 BULLETS): Deduplicate and merge similar weaknesses. Max 6 bullets total.
3. BALANCED EXECUTIVE SUMMARY: If candidate answered <= 35% of questions correctly (e.g., 2/8 questions), the summary MUST be balanced/below-average reflecting their overall performance (do NOT sound overly positive!).

Generate a raw valid JSON hiring panel report:
{
  "summary": "${summary}",
  "strengths": ["<competency strength 1>", "<competency strength 2>"],
  "gaps": ["<deduplicated gap 1>", "<deduplicated gap 2>"],
  "next": ["<recommendation 1>", "<recommendation 2>"],
  "communicationAssessment": "${communicationAssessment}",
  "topicsDemonstrated": [${visitedDayTitles.map((t) => `"${t}"`).join(', ')}],
  "topicsSkipped": [${topicsSkipped.map((t) => `"${t}"`).join(', ')}],
  "hiringRecommendation": "${hiringRecommendation}"
}

Output ONLY raw valid JSON.`;
            const llmOutput = await this.llmClient.generate(prompt, '');
            const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.summary &&
                    Array.isArray(parsed.strengths) &&
                    Array.isArray(parsed.gaps) &&
                    Array.isArray(parsed.next)) {
                    // Enforce Prompt 29 constraints on LLM output
                    parsed.strengths = (parsed.strengths || []).slice(0, 3);
                    if (goodTurns === 0) {
                        parsed.strengths = ["No technical strengths demonstrated."];
                    }
                    parsed.gaps = (parsed.gaps || []).slice(0, 6);
                    parsed.hiringRecommendation = parsed.hiringRecommendation || hiringRecommendation;
                    logger_1.Logger.info(`Generated LLM-enhanced hiring panel report for session.`);
                    return parsed;
                }
            }
        }
        catch (err) {
            logger_1.Logger.warn('LLM feedback enhancement failed — using deterministic fallback.', err.message);
        }
        return deterministicFeedback;
    }
}
exports.FeedbackEngine = FeedbackEngine;
