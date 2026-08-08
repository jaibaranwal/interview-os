import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { CandidateController } from '../controllers/CandidateController';

const router = Router();
const interviewController = new InterviewController();
const candidateController = new CandidateController();

// POST /api/interview - Primary adaptive interview endpoint
router.post('/interview', interviewController.handleInterview);

// Helper endpoints for frontend dashboard cockpit
router.get('/candidates', candidateController.getCandidates);
router.get('/candidates/:id', candidateController.getCandidateById);
router.get('/curriculum', candidateController.getCurriculum);

export default router;
