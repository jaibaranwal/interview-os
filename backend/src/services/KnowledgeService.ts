import { CandidateLoader } from '../data/CandidateLoader';
import { CurriculumLoader } from '../data/CurriculumLoader';
import { CandidateProfile, CurriculumDay } from '../types';

export interface IKnowledgeService {
  getCandidateProfile(candidateId: string): CandidateProfile | undefined;
  getCandidateByName(name: string): CandidateProfile | undefined;
  getAllCandidates(): CandidateProfile[];
  getCurriculumDay(dayNumber: number): CurriculumDay | undefined;
  getAllCurriculumDays(): CurriculumDay[];
  getCompletedMissions(candidate: CandidateProfile): CandidateProfile['missions'];
}

export class KnowledgeService implements IKnowledgeService {
  private candidateLoader: CandidateLoader;
  private curriculumLoader: CurriculumLoader;

  constructor(
    candidateLoader: CandidateLoader = CandidateLoader.getInstance(),
    curriculumLoader: CurriculumLoader = CurriculumLoader.getInstance()
  ) {
    this.candidateLoader = candidateLoader;
    this.curriculumLoader = curriculumLoader;
  }

  public getCandidateProfile(candidateId: string): CandidateProfile | undefined {
    return this.candidateLoader.getCandidateById(candidateId);
  }

  public getCandidateByName(name: string): CandidateProfile | undefined {
    return this.candidateLoader.getCandidateByName(name);
  }

  public getAllCandidates(): CandidateProfile[] {
    return this.candidateLoader.getAllCandidates();
  }

  public getCurriculumDay(dayNumber: number): CurriculumDay | undefined {
    return this.curriculumLoader.getDayByNumber(dayNumber);
  }

  public getAllCurriculumDays(): CurriculumDay[] {
    return this.curriculumLoader.getAllDays();
  }

  public getCompletedMissions(candidate: CandidateProfile): CandidateProfile['missions'] {
    return candidate.missions.filter((m) => m.passed === true);
  }
}
