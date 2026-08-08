import { CandidateProfile, CurriculumDay } from '../types';
import { InterviewPlanner } from '../services/InterviewPlanner';
import { CurriculumLoader } from '../data/CurriculumLoader';

export class CurriculumNavigator {
  private planner: InterviewPlanner;
  private loader: CurriculumLoader;

  constructor(
    planner: InterviewPlanner = new InterviewPlanner(),
    loader: CurriculumLoader = CurriculumLoader.getInstance()
  ) {
    this.planner = planner;
    this.loader = loader;
  }

  public getInitialDay(candidate: CandidateProfile): CurriculumDay {
    const plan = this.planner.createPlan(candidate);
    const firstDayNum = plan.targetDays[0] || 1;
    return this.loader.getDayByNumber(firstDayNum) || this.loader.getDayByNumber(1)!;
  }

  public getNextTargetDay(candidate: CandidateProfile, visitedDays: number[]): CurriculumDay {
    const nextDay = this.planner.selectNextTargetDay(candidate, visitedDays);
    return nextDay || this.loader.getDayByNumber(1)!;
  }

  public isCoverageComplete(
    visitedDays: number[],
    questionCount: number,
    evaluations: { score: number; correctness: string }[] = []
  ): boolean {
    return this.planner.hasSufficientCoverage(visitedDays, questionCount, evaluations);
  }
}
