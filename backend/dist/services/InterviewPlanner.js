"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewPlanner = void 0;
const CandidateAnalyzer_1 = require("../engine/CandidateAnalyzer");
const CurriculumLoader_1 = require("../data/CurriculumLoader");
class InterviewPlanner {
    candidateAnalyzer;
    curriculumLoader;
    constructor(candidateAnalyzer = new CandidateAnalyzer_1.CandidateAnalyzer(), curriculumLoader = CurriculumLoader_1.CurriculumLoader.getInstance()) {
        this.candidateAnalyzer = candidateAnalyzer;
        this.curriculumLoader = curriculumLoader;
    }
    createPlan(candidate) {
        const analysis = this.candidateAnalyzer.analyzeProfile(candidate);
        const allDays = this.curriculumLoader.getAllDays();
        const weakDayNums = analysis.weakTopics.map((t) => t.day);
        const strongDayNums = analysis.strongTopics.map((t) => t.day);
        const skippedDayNums = analysis.skippedDays;
        // Filter available days: completed days only, strictly excluding skipped days
        const eligibleDayNums = analysis.completedDays.filter((d) => !skippedDayNums.includes(d));
        // Selection Strategy:
        // Pick at least 2 weak days (if available) + at least 2 strong days to ensure >= 4 distinct days across curriculum
        const selectedDays = [];
        // 1. Add up to 2 weak days
        weakDayNums.forEach((dayNum) => {
            if (eligibleDayNums.includes(dayNum) && selectedDays.length < 2) {
                selectedDays.push(dayNum);
            }
        });
        // 2. Add strong days to reach at least 4 distinct days
        strongDayNums.forEach((dayNum) => {
            if (eligibleDayNums.includes(dayNum) && !selectedDays.includes(dayNum) && selectedDays.length < 4) {
                selectedDays.push(dayNum);
            }
        });
        // 3. Fallback: if < 4 days, pick remaining eligible completed days
        if (selectedDays.length < 4) {
            eligibleDayNums.forEach((dayNum) => {
                if (!selectedDays.includes(dayNum) && selectedDays.length < 4) {
                    selectedDays.push(dayNum);
                }
            });
        }
        // Sort target days chronologically
        selectedDays.sort((a, b) => a - b);
        // Build PlannedDayTarget objects
        const plannedDayTargets = selectedDays.map((dayNum) => {
            const dayData = this.curriculumLoader.getDayByNumber(dayNum);
            return {
                day: dayNum,
                title: dayData?.title || `Day ${dayNum}`,
                isWeakArea: weakDayNums.includes(dayNum),
                objectives: dayData?.objectives || [],
                tools: dayData?.tools || []
            };
        });
        return {
            targetDays: selectedDays,
            plannedDayTargets,
            plannedQuestionCount: Math.max(8, selectedDays.length * 2), // min 8 questions
            focusWeakAreas: weakDayNums.filter((d) => selectedDays.includes(d)),
            focusStrongAreas: strongDayNums.filter((d) => selectedDays.includes(d)),
            skippedDaysExcluded: skippedDayNums
        };
    }
    selectNextTargetDay(candidate, visitedDays) {
        const plan = this.createPlan(candidate);
        const unvisited = plan.targetDays.filter((d) => !visitedDays.includes(d));
        if (unvisited.length > 0) {
            return this.curriculumLoader.getDayByNumber(unvisited[0]);
        }
        // Fallback: pick any completed day not yet visited
        const completedUnvisited = candidate.missions
            .filter((m) => m.passed === true && !m.skipped && !visitedDays.includes(m.day))
            .map((m) => m.day);
        if (completedUnvisited.length > 0) {
            return this.curriculumLoader.getDayByNumber(completedUnvisited[0]);
        }
        // Secondary fallback: repeat a target day with remaining unasked objectives
        if (plan.targetDays.length > 0) {
            return this.curriculumLoader.getDayByNumber(plan.targetDays[visitedDays.length % plan.targetDays.length]);
        }
        return this.curriculumLoader.getDayByNumber(1);
    }
    hasSufficientCoverage(visitedDays, questionCount) {
        const distinctDaysCount = new Set(visitedDays).size;
        return (distinctDaysCount >= 4 && questionCount >= 6) || questionCount >= 8;
    }
}
exports.InterviewPlanner = InterviewPlanner;
