import { CandidateProfile, CurriculumDay } from '../types';

export interface IKnowledgeService {
  getCandidateProfile(candidateId: string): CandidateProfile;
  getCurriculumDay(dayNumber: number): CurriculumDay;
  getCompletedMissions(candidate: CandidateProfile): CandidateProfile['missions'];
}

export class KnowledgeService implements IKnowledgeService {
  constructor() {
    // TODO: Inject CandidateLoader and CurriculumLoader dependencies
  }

  public getCandidateProfile(candidateId: string): CandidateProfile {
    // TODO: Future implementation to fetch candidate profile from dataset loader
    throw new Error("Not implemented");
  }

  public getCurriculumDay(dayNumber: number): CurriculumDay {
    // TODO: Future implementation to fetch curriculum day metadata
    throw new Error("Not implemented");
  }

  public getCompletedMissions(candidate: CandidateProfile): CandidateProfile['missions'] {
    // TODO: Future implementation to filter completed missions for candidate
    throw new Error("Not implemented");
  }
}
