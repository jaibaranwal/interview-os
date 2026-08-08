"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyEngine = void 0;
class DifficultyEngine {
    calculateInitialDifficulty(candidate) {
        const years = candidate.member.yearsExperience;
        let base = 1.0 + Math.min(2.5, years * 0.25);
        const edu = candidate.member.education.toLowerCase();
        if (edu.includes('ms') || edu.includes('master') || edu.includes('phd')) {
            base += 0.5;
        }
        else if (edu.includes('bs') || edu.includes('b.tech') || edu.includes('computer')) {
            base += 0.25;
        }
        return Number(Math.min(5.0, Math.max(1.0, base)).toFixed(2));
    }
    updateDifficulty(currentDifficulty, evaluation) {
        let delta = 0.0;
        switch (evaluation.quality) {
            case 'EXEMPLARY':
                delta = 0.4;
                break;
            case 'ADEQUATE':
                delta = 0.1;
                break;
            case 'POOR':
                delta = -0.3;
                break;
            case 'EMPTY':
                delta = -0.4;
                break;
        }
        // Additional adjustment based on confidence score
        if (evaluation.confidenceScore >= 0.8) {
            delta += 0.1;
        }
        else if (evaluation.isUncertain) {
            delta -= 0.1;
        }
        const updated = currentDifficulty + delta;
        return Number(Math.min(5.0, Math.max(1.0, updated)).toFixed(2));
    }
}
exports.DifficultyEngine = DifficultyEngine;
