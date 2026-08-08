import { LLMEvaluationResult, CurriculumDay } from '../types';
import { ILLMClient, LLMClient } from '../services/LLMClient';
import { Logger } from '../utils/logger';

export class ResponseEvaluator {
  private llmClient: ILLMClient;

  private invalidSpamRegex = /^(asdf|qwerty|zxcv|1234|abc|test|foo|bar|idk|dont know|i dont know|don't know|no idea|pass|dunno|\?+|\.+|\s*)$/i;

  constructor(llmClient: ILLMClient = new LLMClient()) {
    this.llmClient = llmClient;
  }

  public async evaluateResponse(
    candidateResponse: string,
    targetDay?: CurriculumDay,
    previousQuestion?: string
  ): Promise<LLMEvaluationResult> {
    const trimmed = (candidateResponse || '').trim();

    // 1. Fast Spam & Invalid Detection
    if (!trimmed || this.invalidSpamRegex.test(trimmed) || trimmed.length < 3) {
      return {
        score: 0,
        confidence: 10,
        correctness: 'INVALID',
        detected_concepts: [],
        missing_concepts: targetDay ? targetDay.objectives : ['Core Concepts'],
        strengths: [],
        weaknesses: ['Response was empty, irrelevant, or keyboard spam.'],
        follow_up_needed: true,
        recommended_difficulty: 'EASY',
        next_action: 'retry',
        raw_reasoning: 'Candidate response is invalid, empty, or keyboard spam.'
      };
    }

    // 2. Build Structured LLM Evaluation Prompt
    const dayTitle = targetDay ? `Day ${targetDay.day}: ${targetDay.title}` : 'AI Cohort Curriculum';
    const dayTools = targetDay ? targetDay.tools.join(', ') : 'Sentence Transformers, Vector Databases, Python';
    const dayObjectives = targetDay ? targetDay.objectives.join('; ') : 'Understood foundational AI concepts';

    const systemPrompt = `You are a Senior Technical Evaluation Engine assessing a candidate's answer in a technical interview.

Target Curriculum Topic: ${dayTitle}
Target Tools: ${dayTools}
Target Objectives: ${dayObjectives}
Previous Interviewer Question: "${previousQuestion || 'Explain your implementation'}"

Candidate Answer: "${trimmed}"

Evaluate the candidate's technical answer strictly against the target objectives and tools.
Return a valid JSON object matching this EXACT schema:
{
  "score": <number 0-100>,
  "confidence": <number 0-100>,
  "correctness": <"EXEMPLARY" | "ADEQUATE" | "WEAK" | "INVALID">,
  "detected_concepts": [<string array of concepts mentioned>],
  "missing_concepts": [<string array of missing key concepts>],
  "strengths": [<string array of demonstrated strengths>],
  "weaknesses": [<string array of weaknesses or gaps>],
  "follow_up_needed": <boolean>,
  "recommended_difficulty": <"EASY" | "MEDIUM" | "HARD" | "EXPERT">,
  "next_action": <"retry" | "follow_up" | "advance">
}

Rules:
- If answer is "I don't know", random text, or irrelevant, set score < 20, correctness "INVALID", and next_action "retry".
- If answer mentions relevant tools/concepts but lacks detail, set score 50-69, correctness "WEAK", and next_action "follow_up".
- If answer demonstrates solid technical understanding, set score >= 75, correctness "ADEQUATE" or "EXEMPLARY", and next_action "advance".
Output ONLY valid JSON with no extra text or markdown formatting.`;

    try {
      const llmOutput = await this.llmClient.generate(systemPrompt, '');
      const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as LLMEvaluationResult;
        if (typeof parsed.score === 'number' && parsed.next_action) {
          return {
            ...parsed,
            score: Math.min(100, Math.max(0, parsed.score)),
            confidence: Math.min(100, Math.max(0, parsed.confidence || 50))
          };
        }
      }
    } catch (err: any) {
      Logger.error('LLM evaluation parsing failed, using deterministic fallback evaluation:', err.message);
    }

    // 3. Fallback Heuristic Evaluation
    return this.fallbackEvaluation(trimmed, targetDay);
  }

  private fallbackEvaluation(response: string, targetDay?: CurriculumDay): LLMEvaluationResult {
    const lower = response.toLowerCase();
    const wordCount = response.split(/\s+/).length;

    // Check for "I don't know" phrases
    if (lower.includes("don't know") || lower.includes("dont know") || lower.includes("not sure") || wordCount < 4) {
      return {
        score: 20,
        confidence: 30,
        correctness: 'INVALID',
        detected_concepts: [],
        missing_concepts: targetDay ? targetDay.objectives : ['Core Concept Implementation'],
        strengths: [],
        weaknesses: ['Exhibited uncertainty or provided very brief response.'],
        follow_up_needed: true,
        recommended_difficulty: 'EASY',
        next_action: 'retry',
        raw_reasoning: 'Candidate expressed uncertainty or short response.'
      };
    }

    // Check for tool & objective keyword hits
    const detected: string[] = [];
    if (targetDay) {
      targetDay.tools.forEach((tool) => {
        if (lower.includes(tool.toLowerCase())) {
          detected.push(tool);
        }
      });
    }

    if (detected.length > 0 || wordCount >= 15) {
      return {
        score: wordCount >= 20 ? 85 : 75,
        confidence: 85,
        correctness: 'ADEQUATE',
        detected_concepts: detected.length > 0 ? detected : ['Technical Answer'],
        missing_concepts: [],
        strengths: ['Demonstrated understanding of target tools and implementation.'],
        weaknesses: [],
        follow_up_needed: false,
        recommended_difficulty: 'MEDIUM',
        next_action: 'advance',
        raw_reasoning: 'Satisfactory answer with tool hits.'
      };
    }

    return {
      score: 55,
      confidence: 60,
      correctness: 'WEAK',
      detected_concepts: ['General Explanation'],
      missing_concepts: targetDay ? targetDay.tools : ['Specific Tools'],
      strengths: ['Basic response provided.'],
      weaknesses: ['Lacks specific tool implementation details.'],
      follow_up_needed: true,
      recommended_difficulty: 'EASY',
      next_action: 'follow_up',
      raw_reasoning: 'Weak response requiring targeted follow-up.'
    };
  }
}
