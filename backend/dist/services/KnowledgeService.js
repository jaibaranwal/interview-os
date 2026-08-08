"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const CandidateLoader_1 = require("../data/CandidateLoader");
const CurriculumLoader_1 = require("../data/CurriculumLoader");
class KnowledgeService {
    candidateLoader;
    curriculumLoader;
    constructor(candidateLoader = CandidateLoader_1.CandidateLoader.getInstance(), curriculumLoader = CurriculumLoader_1.CurriculumLoader.getInstance()) {
        this.candidateLoader = candidateLoader;
        this.curriculumLoader = curriculumLoader;
    }
    getCandidateProfile(candidateId) {
        return this.candidateLoader.getCandidateById(candidateId);
    }
    getCandidateByName(name) {
        return this.candidateLoader.getCandidateByName(name);
    }
    getAllCandidates() {
        return this.candidateLoader.getAllCandidates();
    }
    getCurriculumDay(dayNumber) {
        return this.curriculumLoader.getDayByNumber(dayNumber);
    }
    getAllCurriculumDays() {
        return this.curriculumLoader.getAllDays();
    }
    getCompletedMissions(candidate) {
        return candidate.missions.filter((m) => m.passed === true);
    }
}
exports.KnowledgeService = KnowledgeService;
