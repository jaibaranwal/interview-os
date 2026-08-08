"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumLoader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CurriculumLoader {
    static instance;
    data;
    constructor() {
        const possiblePaths = [
            path_1.default.resolve(__dirname, '../../../curriculum.json'),
            path_1.default.resolve(process.cwd(), 'curriculum.json'),
            path_1.default.resolve(process.cwd(), '../curriculum.json')
        ];
        let filePath = '';
        for (const p of possiblePaths) {
            if (fs_1.default.existsSync(p)) {
                filePath = p;
                break;
            }
        }
        if (!filePath) {
            throw new Error(`CurriculumLoader: Could not locate curriculum.json file.`);
        }
        const rawData = fs_1.default.readFileSync(filePath, 'utf-8');
        this.data = JSON.parse(rawData);
        if (!this.data || !Array.isArray(this.data.days)) {
            throw new Error(`CurriculumLoader: Invalid format in curriculum.json`);
        }
    }
    static getInstance() {
        if (!CurriculumLoader.instance) {
            CurriculumLoader.instance = new CurriculumLoader();
        }
        return CurriculumLoader.instance;
    }
    getCurriculum() {
        return this.data;
    }
    getAllDays() {
        return this.data.days;
    }
    getDayByNumber(dayNumber) {
        return this.data.days.find((d) => d.day === dayNumber);
    }
    getModules() {
        return this.data.modules;
    }
    getDaysForModule(moduleNumber) {
        const moduleInfo = this.data.modules.find((m) => m.n === moduleNumber);
        if (!moduleInfo)
            return [];
        const [startDay, endDay] = moduleInfo.days;
        return this.data.days.filter((d) => d.day >= startDay && d.day <= endDay);
    }
}
exports.CurriculumLoader = CurriculumLoader;
