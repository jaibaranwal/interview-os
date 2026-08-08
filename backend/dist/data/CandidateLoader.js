"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateLoader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CandidateLoader {
    static instance;
    candidates = [];
    constructor() {
        const possiblePaths = [
            path_1.default.resolve(__dirname, '../../../candidates.json'),
            path_1.default.resolve(process.cwd(), 'candidates.json'),
            path_1.default.resolve(process.cwd(), '../candidates.json')
        ];
        let filePath = '';
        for (const p of possiblePaths) {
            if (fs_1.default.existsSync(p)) {
                filePath = p;
                break;
            }
        }
        if (!filePath) {
            throw new Error(`CandidateLoader: Could not locate candidates.json file.`);
        }
        const rawData = fs_1.default.readFileSync(filePath, 'utf-8');
        const parsedData = JSON.parse(rawData);
        if (Array.isArray(parsedData)) {
            this.candidates = parsedData;
        }
        else if (parsedData && Array.isArray(parsedData.candidates)) {
            this.candidates = parsedData.candidates;
        }
        else {
            throw new Error(`CandidateLoader: Invalid format in candidates.json`);
        }
    }
    static getInstance() {
        if (!CandidateLoader.instance) {
            CandidateLoader.instance = new CandidateLoader();
        }
        return CandidateLoader.instance;
    }
    getAllCandidates() {
        return this.candidates;
    }
    getCandidateById(id) {
        return this.candidates.find((c) => c.member.id === id);
    }
    getCandidateByName(name) {
        return this.candidates.find((c) => c.member.name.toLowerCase().includes(name.toLowerCase()));
    }
}
exports.CandidateLoader = CandidateLoader;
