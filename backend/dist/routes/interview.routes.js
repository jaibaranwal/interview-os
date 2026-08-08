"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InterviewController_1 = require("../controllers/InterviewController");
const router = (0, express_1.Router)();
const controller = new InterviewController_1.InterviewController();
// POST /api/interview - Single interview endpoint
router.post('/interview', controller.handleInterview);
exports.default = router;
