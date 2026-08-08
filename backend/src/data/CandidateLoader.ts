import fs from 'fs';
import path from 'path';
import { CandidateProfile, CandidatesData } from '../types';

export class CandidateLoader {
  private static instance: CandidateLoader;
  private data: CandidatesData;

  private constructor() {
    // Locate candidates.json in repository root or relative path
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
    this.data = JSON.parse(rawData) as CandidatesData;

    if (!this.data || !Array.isArray(this.data.candidates)) {
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
    return this.data.candidates;
  }

  public getCandidateById(id: string): CandidateProfile | undefined {
    return this.data.candidates.find((c) => c.member.id === id);
  }

  public getCandidateByName(name: string): CandidateProfile | undefined {
    return this.data.candidates.find(
      (c) => c.member.name.toLowerCase() === name.toLowerCase()
    );
  }
}
