export interface ResponseEvaluationResult {
  isEmpty: boolean;
  isShort: boolean;
  isDetailed: boolean;
  isUncertain: boolean;
  confidenceScore: number; // 0.0 to 1.0
  wordCount: number;
  quality: 'EMPTY' | 'POOR' | 'ADEQUATE' | 'EXEMPLARY';
  detectedUncertaintyKeywords: string[];
  detectedConfidenceKeywords: string[];
}

export class ResponseEvaluator {
  private uncertainKeywords = [
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

  private confidenceKeywords = [
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

  public evaluateResponse(message: string): ResponseEvaluationResult {
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
    const detectedUncertaintyKeywords = this.uncertainKeywords.filter((kw) =>
      lowerMessage.includes(kw)
    );

    // Detect confidence keywords
    const detectedConfidenceKeywords = this.confidenceKeywords.filter((kw) =>
      lowerMessage.includes(kw)
    );

    const isUncertain = detectedUncertaintyKeywords.length > 0;
    const isShort = wordCount < 8;
    const isDetailed = wordCount >= 25;

    // Calculate confidence score (0.0 to 1.0)
    let score = 0.5; // Base score for non-empty response

    // Adjust for length
    if (wordCount >= 25) score += 0.2;
    else if (wordCount < 8) score -= 0.2;

    // Adjust for confidence & uncertainty keywords
    score += detectedConfidenceKeywords.length * 0.1;
    score -= detectedUncertaintyKeywords.length * 0.2;

    const confidenceScore = Number(Math.min(1.0, Math.max(0.0, score)).toFixed(2));

    // Determine quality category
    let quality: 'EMPTY' | 'POOR' | 'ADEQUATE' | 'EXEMPLARY' = 'ADEQUATE';
    if (isShort || confidenceScore < 0.3) {
      quality = 'POOR';
    } else if (isDetailed && confidenceScore >= 0.7 && !isUncertain) {
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
