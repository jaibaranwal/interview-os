import fs from 'fs';
import path from 'path';
import { CurriculumData, CurriculumDay, CurriculumModule } from '../types';

export class CurriculumLoader {
  private static instance: CurriculumLoader;
  private data: CurriculumData;

  private constructor() {
    const possiblePaths = [
      path.resolve(__dirname, '../../../curriculum.json'),
      path.resolve(process.cwd(), 'curriculum.json'),
      path.resolve(process.cwd(), '../curriculum.json')
    ];

    let filePath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      throw new Error(`CurriculumLoader: Could not locate curriculum.json file.`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    this.data = JSON.parse(rawData) as CurriculumData;

    if (!this.data || !Array.isArray(this.data.days)) {
      throw new Error(`CurriculumLoader: Invalid format in curriculum.json`);
    }
  }

  public static getInstance(): CurriculumLoader {
    if (!CurriculumLoader.instance) {
      CurriculumLoader.instance = new CurriculumLoader();
    }
    return CurriculumLoader.instance;
  }

  public getCurriculum(): CurriculumData {
    return this.data;
  }

  public getAllDays(): CurriculumDay[] {
    return this.data.days;
  }

  public getDayByNumber(dayNumber: number): CurriculumDay | undefined {
    return this.data.days.find((d) => d.day === dayNumber);
  }

  public getModules(): CurriculumModule[] {
    return this.data.modules;
  }

  public getDaysForModule(moduleNumber: number): CurriculumDay[] {
    const moduleInfo = this.data.modules.find((m) => m.n === moduleNumber);
    if (!moduleInfo) return [];
    const [startDay, endDay] = moduleInfo.days;
    return this.data.days.filter((d) => d.day >= startDay && d.day <= endDay);
  }
}
