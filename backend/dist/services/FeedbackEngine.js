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
        // Group evaluations by day to track best performance per topic
        const topicEvaluationsMap = new Map();
        askedQuestions.forEach((q, idx) => {
            const evalResult = evaluations[idx];
            if (evalResult) {
                const list = topicEvaluationsMap.get(q.day) || [];
                list.push(evalResult);
                topicEvaluationsMap.set(q.day, list);
            }
        });
        const topicPerformance = [];
        const bestScorePerDay = new Map();
        visitedDays.forEach((dayNum) => {
            const evals = topicEvaluationsMap.get(dayNum) || [];
            let bestScore = 0;
            evals.forEach((e) => {
                if (e.score > bestScore)
                    bestScore = e.score;
            });
            if (evals.length === 0)
                bestScore = 50;
            bestScorePerDay.set(dayNum, bestScore);
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
        // Compute 5 Core Competency Scores (1-5 scale)
        const goodEvaluations = evaluations.filter((e) => e.score >= 60 || ['GOOD', 'EXCELLENT'].includes(e.correctness));
        const totalTurns = Math.max(1, evaluations.length);
        const allBestScores = Array.from(bestScorePerDay.values());
        const avgBestScore = allBestScores.length > 0
            ? allBestScores.reduce((a, b) => a + b, 0) / allBestScores.length
            : 50;
        const techRating = Math.min(5, Math.max(1, Math.round((avgBestScore / 100) * 5)));
        const hasImpl = goodEvaluations.some((e) => e.detected_concepts && e.detected_concepts.length >= 2);
        const implRating = hasImpl ? Math.min(5, techRating) : Math.max(1, techRating - 1);
        const hasArch = goodEvaluations.some((e) => e.score >= 70 || (e.detected_concepts || []).some((c) => c.toLowerCase().includes('vector') || c.toLowerCase().includes('rag') || c.toLowerCase().includes('fastapi')));
        const archRating = hasArch ? Math.min(5, techRating) : Math.max(1, techRating - 1);
        const hasTradeoffs = evaluations.some((e) => e.score >= 75);
        const tradeoffRating = hasTradeoffs ? Math.min(5, techRating) : Math.max(1, Math.round(techRating * 0.8));
        const badTurns = evaluations.filter((e) => ['PROFANITY', 'GIBBERISH', 'REFUSAL'].includes(e.correctness)).length;
        const commRating = Math.min(5, Math.max(1, Math.round(5 - (badTurns / totalTurns) * 3)));
        const averageCompetencyScore = Math.round(((techRating + implRating + archRating + tradeoffRating + commRating) / 5) * 10) / 10;
        const competencyScores = {
            technicalUnderstanding: techRating,
            practicalImplementation: implRating,
            systemDesignArchitecture: archRating,
            tradeoffAnalysis: tradeoffRating,
            communicationQuality: commRating,
            averageScore: averageCompetencyScore
        };
        // Hiring Recommendation Thresholds
        let hiringRecommendation;
        if (averageCompetencyScore >= 4.5) {
            hiringRecommendation = 'Strong Hire';
        }
        else if (averageCompetencyScore >= 4.0) {
            hiringRecommendation = 'Hire';
        }
        else if (averageCompetencyScore >= 3.0) {
            hiringRecommendation = 'Lean Hire';
        }
        else if (averageCompetencyScore >= 2.5) {
            hiringRecommendation = 'Weak Pass';
        }
        else {
            hiringRecommendation = 'No Hire';
        }
        // Evaluation Confidence Score
        const technicalAnswerCount = evaluations.filter((e) => e.score >= 30).length;
        let confidence;
        if (technicalAnswerCount >= 4) {
            confidence = 'High';
        }
        else if (technicalAnswerCount >= 2) {
            confidence = 'Medium';
        }
        else {
            confidence = 'Low';
        }
        // ── Prompt 33 Goal 2: Evidence-Backed Strengths (Max 3) ──
        const demonstratedConcepts = new Set();
        goodEvaluations.forEach((e) => {
            (e.detected_concepts || []).forEach((c) => {
                if (c && c.length > 2)
                    demonstratedConcepts.add(c.toLowerCase());
            });
        });
        const conceptsArr = Array.from(demonstratedConcepts);
        const evidenceBackedStrengths = [];
        const hasEmbeddings = conceptsArr.some((c) => c.includes('vector') || c.includes('embedding') || c.includes('chroma') || c.includes('faiss') || c.includes('sentence transformer'));
        if (hasEmbeddings) {
            evidenceBackedStrengths.push('Demonstrated practical understanding of semantic retrieval by explaining cosine similarity, embedding persistence, metadata versioning and vector database architecture.');
        }
        const hasApi = conceptsArr.some((c) => c.includes('api') || c.includes('fastapi') || c.includes('endpoint') || c.includes('ollama') || c.includes('http'));
        if (hasApi) {
            evidenceBackedStrengths.push('Demonstrated solid technical grasp of AI service deployment by explaining FastAPI async handlers, health-check endpoints, and reusable API request schemas.');
        }
        const hasEnv = conceptsArr.some((c) => c.includes('python') || c.includes('vs code') || c.includes('virtual environment') || c.includes('pylance') || c.includes('sqlite'));
        if (hasEnv) {
            evidenceBackedStrengths.push('Demonstrated foundational proficiency in Python environment setup, virtual environment isolation (venv), debugging configuration (launch.json), and data tooling.');
        }
        if (goodEvaluations.length > 0 && evidenceBackedStrengths.length === 0) {
            evidenceBackedStrengths.push(`Demonstrated verified technical capability by providing accurate implementation details across ${visitedDayTitles.slice(0, 2).join(' and ')}.`);
        }
        const finalStrengths = evidenceBackedStrengths.length > 0
            ? evidenceBackedStrengths.slice(0, 3) // PROMPT 33 RULE: MAXIMUM 3 STRENGTHS
            : ['No technical strengths demonstrated.'];
        // ── Prompt 33 Goal 3: Specific Missing-Concept Weaknesses (Max 5) ──
        // Replace generic "lacked technical depth" with specific missing concepts
        const missingConceptsSet = new Set();
        evaluations.forEach((e) => {
            (e.missing_concepts || []).forEach((mc) => {
                if (mc && mc.length > 2 && !mc.toLowerCase().includes('lacked technical depth')) {
                    missingConceptsSet.add(mc.trim());
                }
            });
        });
        const specificWeaknesses = [];
        missingConceptsSet.forEach((mc) => {
            // Ensure missing concept was not later mastered
            const isMastered = conceptsArr.some((c) => c.includes(mc.toLowerCase()));
            if (!isMastered && specificWeaknesses.length < 5) {
                specificWeaknesses.push(mc.endsWith('.') ? mc : `${mc}.`);
            }
        });
        // If specific missing concepts were empty, construct specific gap statements from weak turns
        if (specificWeaknesses.length === 0) {
            evaluations.forEach((e, idx) => {
                if (e.score < 50 && specificWeaknesses.length < 5) {
                    const q = askedQuestions[idx];
                    const dayData = q ? this.curriculumLoader.getDayByNumber(q.day) : undefined;
                    const topicName = dayData ? dayData.title : 'evaluation topic';
                    specificWeaknesses.push(`Skipped lower-level configuration and trade-off specifics on ${topicName}.`);
                }
            });
        }
        if (specificWeaknesses.length === 0 && averageCompetencyScore < 4.5) {
            specificWeaknesses.push('Skipped detailed performance profiling and latency optimization trade-offs under high concurrency.');
        }
        const finalGaps = Array.from(new Set(specificWeaknesses)).slice(0, 5); // PROMPT 33 RULE: MAXIMUM 5 WEAKNESSES
        // ── Prompt 33 Goal 8: Focused Weak-Area Roadmap (Max 3 Items) ──
        // DO NOT suggest reviewing topics already mastered (score >= 4)
        const weakTopics = topicPerformance.filter((tp) => tp.score < 4);
        const focusedRoadmap = [];
        weakTopics.forEach((wt) => {
            const dayData = this.curriculumLoader.getDayByNumber(wt.dayNum);
            if (dayData && dayData.objectives.length > 0 && focusedRoadmap.length < 3) {
                focusedRoadmap.push(`Review Day ${wt.dayNum} (${dayData.title}): Practice ${dayData.objectives[0]}`);
            }
        });
        if (focusedRoadmap.length === 0 && averageCompetencyScore < 4.5) {
            focusedRoadmap.push('Implement end-to-end evaluation metrics and observability using structured logging and OpenTelemetry.');
        }
        const finalRoadmap = focusedRoadmap.slice(0, 3); // PROMPT 33 RULE: MAXIMUM 3 ROADMAP ITEMS
        // ── Prompt 38: Continuation Reasons for Dynamic Interview Length ──
        const continuationReasons = [];
        if (askedQuestions.length > 8) {
            if (confidence !== 'High') {
                continuationReasons.push(`Evaluation confidence was ${confidence} (High required) — gathered additional technical evidence.`);
            }
            if (goodEvaluations.length < 4) {
                continuationReasons.push(`Required additional implementation validation on core curriculum competencies.`);
            }
            if (visitedDays.length < 4) {
                continuationReasons.push(`Covered additional curriculum topic days to ensure technical breadth.`);
            }
            if (continuationReasons.length === 0) {
                continuationReasons.push(`Executed adaptive follow-up turns to thoroughly validate trade-off analysis.`);
            }
        }
        // ── Prompt 33 Goal 6: Interview Statistics ──
        const avgScore = memory.getAverageScore();
        const statistics = {
            questionsAsked: memory.getQuestionCount(),
            minQuestionsRequired: 8,
            goodAnswersCount: goodEvaluations.length,
            weakAnswersCount: evaluations.length - goodEvaluations.length,
            adaptiveFollowupsCount: evaluations.filter((e) => e.next_action === 'follow_up').length,
            topicsVisitedCount: visitedDays.length,
            averageResponseQuality: `${Math.round(avgScore)}%`,
            confidence,
            continuationReasons: continuationReasons.length > 0 ? continuationReasons : undefined
        };
        // ── Prompt 33 Goal 7: Hiring Panel Decision Breakdown ──
        const getRecForRating = (rating) => {
            if (rating >= 5)
                return 'Strong Hire';
            if (rating >= 4)
                return 'Hire';
            if (rating >= 3)
                return 'Lean Hire';
            if (rating >= 2)
                return 'Weak Pass';
            return 'No Hire';
        };
        const overallStars = '★'.repeat(Math.round(averageCompetencyScore)) + '☆'.repeat(5 - Math.round(averageCompetencyScore));
        const panelDecision = {
            technicalInterview: getRecForRating(techRating),
            architectureReview: getRecForRating(archRating),
            communication: commRating >= 4 ? 'Strong' : commRating >= 3 ? 'Satisfactory' : 'Needs Improvement',
            overallRecommendation: hiringRecommendation,
            overallStars
        };
        // ── Prompt 33 Goal 1 & 9: Evidence Summary & Layout Wording ──
        const summary = goodEvaluations.length > 0
            ? `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed a technical evaluation covering ${visitedDays.length} topics. Candidate demonstrated verified evidence in practical implementation and core architecture. Recommendation: ${hiringRecommendation} (${overallStars} ${averageCompetencyScore}/5.0).`
            : `${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp) completed a technical evaluation covering ${visitedDays.length} topics. Candidate struggled across technical evaluation criteria and demonstrated no verified evidence of competency. Recommendation: ${hiringRecommendation} (${overallStars} ${averageCompetencyScore}/5.0).`;
        const feedbackObject = {
            summary,
            competencyScores,
            strengths: finalStrengths,
            gaps: finalGaps,
            next: finalRoadmap,
            topicPerformance,
            hiringRecommendation,
            confidence,
            statistics,
            panelDecision,
            continuationReasons: continuationReasons.length > 0 ? continuationReasons : undefined,
            communicationAssessment: commRating >= 4 ? 'Clear and precise technical communication.' : 'Communication lacked depth on key implementation details.'
        };
        // Attempt LLM-enhanced feedback while guaranteeing Prompt 33 constraints
        try {
            const sanitizedAnswers = candidateAnswers
                .map((a) => a.text
                .replace(/[\r\n\t]/g, ' ')
                .replace(/[<>{}[\]|\\^`]/g, '')
                .slice(0, 300))
                .filter((a) => a.length > 5)
                .slice(-10);
            const prompt = `You are a Senior Technical Hiring Panel generating an executive-grade candidate evaluation report.

Candidate: ${member.name} (${member.jobRole}, ${member.yearsExperience} yrs exp)
Average Competency Score: ${averageCompetencyScore}/5.0 (${overallStars})
Hiring Recommendation: ${hiringRecommendation}
Evaluation Confidence: ${confidence}
Verified Evidence Strengths: ${finalStrengths.join('; ')}
Missing Concepts / Weaknesses: ${finalGaps.join('; ')}
Candidate Answers: ${sanitizedAnswers.map((a, i) => `[${i + 1}] ${a}`).join(' | ')}

MANDATORY CONSTRAINTS — PROMPT 33 EXECUTIVE REPORT ENGINE:
1. STRENGTHS (MAXIMUM 3 BULLETS): Must be evidence-backed referencing specific tools/concepts explained (e.g. "Demonstrated practical understanding of semantic retrieval by explaining cosine similarity...").
2. WEAKNESSES (MAXIMUM 5 BULLETS): Must be specific missing concepts actually observed (e.g. "Did not discuss environment variable management"). NEVER output generic statements like "Lacked technical depth".
3. ROADMAP (MAXIMUM 3 BULLETS): Recommend ONLY actual weak areas. Never suggest reviewing topics already mastered.

Generate a raw valid JSON report:
{
  "summary": "${summary}",
  "strengths": ${JSON.stringify(finalStrengths)},
  "gaps": ${JSON.stringify(finalGaps)},
  "next": ${JSON.stringify(finalRoadmap)},
  "hiringRecommendation": "${hiringRecommendation}",
  "confidence": "${confidence}"
}

Output ONLY raw valid JSON.`;
            const llmOutput = await this.llmClient.generate(prompt, '');
            const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.summary &&
                    Array.isArray(parsed.strengths) &&
                    Array.isArray(parsed.gaps)) {
                    parsed.competencyScores = competencyScores;
                    parsed.topicPerformance = topicPerformance;
                    parsed.statistics = statistics;
                    parsed.panelDecision = panelDecision;
                    parsed.strengths = (parsed.strengths || []).slice(0, 3);
                    parsed.gaps = (parsed.gaps || []).slice(0, 5);
                    parsed.next = (parsed.next || finalRoadmap).slice(0, 3);
                    parsed.hiringRecommendation = hiringRecommendation;
                    parsed.confidence = confidence;
                    logger_1.Logger.info(`Generated executive evidence report for session.`);
                    return parsed;
                }
            }
        }
        catch (err) {
            logger_1.Logger.warn('LLM feedback enhancement failed — using deterministic fallback.', err.message);
        }
        return feedbackObject;
    }
}
exports.FeedbackEngine = FeedbackEngine;
