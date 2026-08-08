import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';

const router = Router();
const controller = new InterviewController();

// POST /api/interview - Single interview endpoint
router.post('/interview', controller.handleInterview);

export default router;
