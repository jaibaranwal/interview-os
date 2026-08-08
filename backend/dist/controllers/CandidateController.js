"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateController = void 0;
const KnowledgeService_1 = require("../services/KnowledgeService");
class CandidateController {
    knowledgeService;
    constructor(knowledgeService = new KnowledgeService_1.KnowledgeService()) {
        this.knowledgeService = knowledgeService;
    }
    getCandidates = (req, res) => {
        const candidates = this.knowledgeService.getAllCandidates();
        res.status(200).json(candidates);
    };
    getCandidateById = (req, res) => {
        const { id } = req.params;
        const candidate = this.knowledgeService.getCandidateProfile(id);
        if (!candidate) {
            res.status(404).json({ error: 'Not Found', message: `Candidate with ID '${id}' not found.` });
            return;
        }
        res.status(200).json(candidate);
    };
    getCurriculum = (req, res) => {
        const curriculum = this.knowledgeService.getAllCurriculumDays();
        res.status(200).json(curriculum);
    };
}
exports.CandidateController = CandidateController;
