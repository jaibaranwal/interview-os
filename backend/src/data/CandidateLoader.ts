import fs from 'fs';
import path from 'path';
import { CandidateProfile } from '../types';

export interface CandidatesData {
  candidates: CandidateProfile[];
}

export class CandidateLoader {
  private static instance: CandidateLoader;
  private candidates: CandidateProfile[] = [];

  private constructor() {
    const possiblePaths = [
      path.resolve(__dirname, '../../../candidates.json'),
      path.resolve(process.cwd(), 'candidates.json'),
      path.resolve(process.cwd(), '../candidates.json')
    ];

    let filePath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      throw new Error(`CandidateLoader: Could not locate candidates.json file.`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    if (Array.isArray(parsedData)) {
      this.candidates = parsedData as CandidateProfile[];
    } else if (parsedData && Array.isArray(parsedData.candidates)) {
      this.candidates = parsedData.candidates as CandidateProfile[];
    } else {
      throw new Error(`CandidateLoader: Invalid format in candidates.json`);
    }
  }

  public static getInstance(): CandidateLoader {
    if (!CandidateLoader.instance) {
      CandidateLoader.instance = new CandidateLoader();
    }
    return CandidateLoader.instance;
  }

  public getAllCandidates(): CandidateProfile[] {
    return this.candidates;
  }

  public getCandidateById(id: string): CandidateProfile | undefined {
    return this.candidates.find((c: CandidateProfile) => c.member.id === id);
  }

  public getCandidateByName(name: string): CandidateProfile | undefined {
    return this.candidates.find((c: CandidateProfile) =>
      c.member.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}
