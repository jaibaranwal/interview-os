import { Request, Response } from 'express';
import { KnowledgeService } from '../services/KnowledgeService';

export class CandidateController {
  private knowledgeService: KnowledgeService;

  constructor(knowledgeService: KnowledgeService = new KnowledgeService()) {
    this.knowledgeService = knowledgeService;
  }

  public getCandidates = (req: Request, res: Response): void => {
    const candidates = this.knowledgeService.getAllCandidates();
    res.status(200).json(candidates);
  };

  public getCandidateById = (req: Request, res: Response): void => {
    const { id } = req.params;
    const candidate = this.knowledgeService.getCandidateProfile(id);

    if (!candidate) {
      res.status(404).json({ error: 'Not Found', message: `Candidate with ID '${id}' not found.` });
      return;
    }

    res.status(200).json(candidate);
  };

  public getCurriculum = (req: Request, res: Response): void => {
    const curriculum = this.knowledgeService.getAllCurriculumDays();
    res.status(200).json(curriculum);
  };
}
