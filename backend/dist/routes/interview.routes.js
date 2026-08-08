"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InterviewController_1 = require("../controllers/InterviewController");
const CandidateController_1 = require("../controllers/CandidateController");
const router = (0, express_1.Router)();
const interviewController = new InterviewController_1.InterviewController();
const candidateController = new CandidateController_1.CandidateController();
// POST /api/interview - Primary adaptive interview endpoint
router.post('/interview', interviewController.handleInterview);
// Helper endpoints for frontend dashboard cockpit
router.get('/candidates', candidateController.getCandidates);
router.get('/candidates/:id', candidateController.getCandidateById);
router.get('/curriculum', candidateController.getCurriculum);
exports.default = router;
