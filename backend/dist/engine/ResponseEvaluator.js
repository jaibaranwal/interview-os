"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseEvaluator = void 0;
class ResponseEvaluator {
    uncertainKeywords = [
        'maybe',
        'i think',
        'not sure',
        "don't know",
        'dont know',
        'guess',
        'unclear',
        'unsure',
        'i believe',
        'probably',
        'hard to say'
    ];
    confidenceKeywords = [
        'specifically',
        'built',
        'implemented',
        'configured',
        'because',
        'trade-off',
        'used',
        'architecture',
        'definitely',
        'verified',
        'deployed',
        'pipeline',
        'tested',
        'integrated'
    ];
    evaluateResponse(message) {
        const trimmed = (message || '').trim();
        if (!trimmed) {
            return {
                isEmpty: true,
                isShort: true,
                isDetailed: false,
                isUncertain: false,
                confidenceScore: 0.0,
                wordCount: 0,
                quality: 'EMPTY',
                detectedUncertaintyKeywords: [],
                detectedConfidenceKeywords: []
            };
        }
        const words = trimmed.split(/\s+/);
        const wordCount = words.length;
        const lowerMessage = trimmed.toLowerCase();
        // Detect uncertainty keywords
        const detectedUncertaintyKeywords = this.uncertainKeywords.filter((kw) => lowerMessage.includes(kw));
        // Detect confidence keywords
        const detectedConfidenceKeywords = this.confidenceKeywords.filter((kw) => lowerMessage.includes(kw));
        const isUncertain = detectedUncertaintyKeywords.length > 0;
        const isShort = wordCount < 4;
        const isDetailed = wordCount >= 15;
        // Calculate confidence score (0.0 to 1.0)
        let score = 0.5; // Base score for non-empty response
        // Adjust for length
        if (wordCount >= 15)
            score += 0.25;
        else if (wordCount < 4)
            score -= 0.3;
        // Adjust for confidence & uncertainty keywords
        score += detectedConfidenceKeywords.length * 0.15;
        score -= detectedUncertaintyKeywords.length * 0.2;
        const confidenceScore = Number(Math.min(1.0, Math.max(0.0, score)).toFixed(2));
        // Determine quality category
        let quality = 'ADEQUATE';
        if (isShort || confidenceScore < 0.25) {
            quality = 'POOR';
        }
        else if (isDetailed && confidenceScore >= 0.65 && !isUncertain) {
            quality = 'EXEMPLARY';
        }
        return {
            isEmpty: false,
            isShort,
            isDetailed,
            isUncertain,
            confidenceScore,
            wordCount,
            quality,
            detectedUncertaintyKeywords,
            detectedConfidenceKeywords
        };
    }
}
exports.ResponseEvaluator = ResponseEvaluator;
