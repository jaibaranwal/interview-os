"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseEvaluator = void 0;
const LLMClient_1 = require("../services/LLMClient");
const logger_1 = require("../utils/logger");
class ResponseEvaluator {
    llmClient;
    constructor(llmClient) {
        this.llmClient = llmClient || (0, LLMClient_1.getSharedLLMClient)();
    }
    async evaluateResponse(candidateResponse, targetDay, previousQuestion, recentConversationContext, previousAnswer) {
        const trimmed = (candidateResponse || '').trim();
        const dayTitle = targetDay ? `Day ${targetDay.day}: ${targetDay.title}` : 'AI Cohort Curriculum';
        const dayTools = targetDay ? targetDay.tools.join(', ') : 'Sentence Transformers, Vector Databases, Python';
        const dayObjectives = targetDay ? targetDay.objectives.join('; ') : 'Understood foundational AI concepts';
        // Fast deterministic check before LLM call
        const fastCheck = this.performFastClassification(trimmed, previousAnswer);
        if (fastCheck) {
            logger_1.Logger.info(`Fast-path Evaluation: score=${fastCheck.score} classification=${fastCheck.correctness} action=${fastCheck.next_action}`);
            return fastCheck;
        }
        const conversationContextSection = recentConversationContext
            ? `\nRECENT CONVERSATION CONTEXT (last 3 turns):\n${recentConversationContext}\n`
            : '';
        const systemPrompt = `You are a Senior Technical Evaluation Engine assessing a candidate's response in an AI Engineering technical interview.

Target Topic: ${dayTitle}
Allowed Tools: ${dayTools}
Curriculum Objectives: ${dayObjectives}
Previous Interviewer Question: "${previousQuestion || 'Explain your technical implementation'}"
${conversationContextSection}

Evaluate the candidate's response strictly against the target curriculum objectives and tools.
Return ONLY a valid JSON object matching this EXACT schema — no markdown, no explanation text:
{
  "score": <integer 0-100>,
  "confidence": <integer 0-100>,
  "correctness": <"EXCELLENT" | "GOOD" | "WEAK" | "UNCERTAIN" | "GIBBERISH" | "OFF_TOPIC" | "PROFANITY" | "REFUSAL" | "LACK_OF_EXPERIENCE">,
  "detected_concepts": [<string array of technical concepts correctly mentioned>],
  "missing_concepts": [<string array of missing key curriculum concepts>],
  "strengths": [<string array, max 3>],
  "weaknesses": [<string array, max 3>],
  "next_action": <"retry" | "follow_up" | "advance">,
  "reason": <string, 1-2 sentences max>
}

MANDATORY CLASSIFICATION BUCKETS (select EXACTLY one):
1. PROFANITY: Swear words, insults, abusive language → "PROFANITY", score 0, next_action "retry".
2. GIBBERISH: Keyboard mashing ("asdf", "qwerty"), random letters, casual greetings ("hi", "hello", "hey") → "GIBBERISH", score 0, next_action "retry".
3. REFUSAL: Explicit refusal to answer ("I refuse to answer", "I won't answer", "nope", "no") → "REFUSAL", score 0, next_action "retry".
4. LACK_OF_EXPERIENCE: Candidate explicitly states they have never used or lack experience ("I never used Pandas", "haven't worked with Docker", "no experience") → "LACK_OF_EXPERIENCE", score 20, next_action "follow_up".
5. OFF_TOPIC: Answer is about food, weather, personal life, or non-technical chatter → "OFF_TOPIC", score 0, next_action "retry".
6. UNCERTAIN: Candidate explicitly states uncertainty ("I don't know", "not sure", "no idea", "pass", "idk") → "UNCERTAIN", score 10, next_action "retry".
7. WEAK: Mentions 1-2 relevant tools but lacks technical depth, misses core objectives, or < 20 words → "WEAK", score 30-59, next_action "follow_up".
8. GOOD: Demonstrates solid technical understanding of 50%+ of objectives, correct tool usage → "GOOD", score 60-84, next_action "advance".
9. EXCELLENT: Deep understanding of 80%+ of objectives, architecture trade-offs, configuration details → "EXCELLENT", score 85-100, next_action "advance".

Output ONLY valid JSON.`;
        try {
            const llmOutput = await this.llmClient.generate(systemPrompt, trimmed);
            const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (typeof parsed.score === 'number' && parsed.next_action && parsed.correctness) {
                    const correctness = this.normalizeClassification(parsed.correctness, parsed.score);
                    const next_action = (score, origAction) => {
                        if (score >= 60)
                            return 'advance';
                        if (score >= 20 || correctness === 'LACK_OF_EXPERIENCE')
                            return 'follow_up';
                        return 'retry';
                    };
                    logger_1.Logger.info(`Evaluation: score=${parsed.score} classification=${correctness} action=${next_action(parsed.score, parsed.next_action)}`);
                    return {
                        score: Math.min(100, Math.max(0, parsed.score)),
                        confidence: Math.min(100, Math.max(0, parsed.confidence || 80)),
                        correctness,
                        detected_concepts: parsed.detected_concepts || [],
                        missing_concepts: parsed.missing_concepts || [],
                        strengths: (parsed.strengths || []).slice(0, 3),
                        weaknesses: (parsed.weaknesses || []).slice(0, 3),
                        next_action: next_action(parsed.score, parsed.next_action),
                        reason: parsed.reason || `Evaluated as ${correctness}.`,
                        recommended_difficulty: parsed.recommended_difficulty || undefined,
                        raw_reasoning: jsonMatch[0]
                    };
                }
            }
            throw new Error(`LLM did not return valid evaluation JSON. Output: "${llmOutput.slice(0, 100)}"`);
        }
        catch (err) {
            logger_1.Logger.error('LLM evaluation failed — using fallback classifier:', err.message);
            return this.fallbackEvaluate(trimmed);
        }
    }
    performFastClassification(trimmed, previousAnswer) {
        const lower = trimmed.toLowerCase();
        // 1. Verbatim repeat detection
        if (previousAnswer && previousAnswer.trim().length > 5 && previousAnswer.trim().toLowerCase() === lower) {
            return {
                score: 0,
                confidence: 95,
                correctness: 'GIBBERISH',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Repeated previous answer verbatim'],
                next_action: 'retry',
                reason: 'Verbatim repetition of previous response detected.'
            };
        }
        // 2. Profanity check
        if (/\b(fuck|shit|bitch|asshole|cunt|bastard|dick|pussy)\b/i.test(lower)) {
            return {
                score: 0,
                confidence: 100,
                correctness: 'PROFANITY',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Profanity detected in response'],
                next_action: 'retry',
                reason: 'Profanity detected in candidate response.'
            };
        }
        // 3. Casual greetings / non-technical openers ("hi", "hello", "hey", "sup")
        if (/^(hi|hello|hey|greetings|howdy|sup|yo)$/i.test(lower)) {
            return {
                score: 0,
                confidence: 95,
                correctness: 'GIBBERISH',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Casual greeting provided instead of technical response'],
                next_action: 'retry',
                reason: 'Candidate provided a casual greeting instead of a technical response.'
            };
        }
        // 4. Gibberish / Keyboard mashing check
        if (!trimmed || trimmed.length < 2 || /^(asdf|qwerty|zxcv|1234|abc|test|foo|bar|\?+|\.+|[a-z]{1,4})$/i.test(trimmed)) {
            return {
                score: 0,
                confidence: 95,
                correctness: 'GIBBERISH',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Invalid response or keyboard mashing'],
                next_action: 'retry',
                reason: 'Response was invalid keyboard mashing or meaningless text.'
            };
        }
        // 5. Refusal / non-technical answers ("no", "nope", "nah", "maybe", "i refuse")
        if (/^(no|nope|nah|maybe|i refuse|i won't answer|i will not answer|refuse|nevermind)$/i.test(lower) || lower.includes('refuse to answer')) {
            return {
                score: 0,
                confidence: 95,
                correctness: 'REFUSAL',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Candidate refused or provided non-technical refusal'],
                next_action: 'retry',
                reason: 'Candidate explicitly refused or provided a non-technical refusal.'
            };
        }
        // 6. Lack of Experience ("I never used", "haven't worked with", "don't have experience", "didn't implement")
        if (/\b(never used|haven't worked|havent worked|don't have experience|dont have experience|didn't implement|didnt implement|never done|no experience|never worked|haven't used|havent used)\b/i.test(lower) ||
            lower.includes("never used") || lower.includes("no hands-on")) {
            return {
                score: 20,
                confidence: 95,
                correctness: 'LACK_OF_EXPERIENCE',
                detected_concepts: [],
                missing_concepts: ['Hands-on practical implementation experience'],
                strengths: [],
                weaknesses: ['Lacks practical hands-on experience with target technology'],
                next_action: 'follow_up',
                reason: 'Candidate indicated a lack of practical experience with the target technology.'
            };
        }
        // 7. Explicit uncertainty ("I don't know")
        if (lower.includes("don't know") || lower.includes("dont know") ||
            lower.includes("not sure") || lower.includes("no idea") ||
            lower === 'idk' || lower === 'pass' || lower === 'skip') {
            return {
                score: 10,
                confidence: 95,
                correctness: 'UNCERTAIN',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Expressed uncertainty'],
                next_action: 'retry',
                reason: 'Candidate explicitly stated uncertainty.'
            };
        }
        // 8. Off-topic check (food, sports, weather)
        if (/\b(pizza|burger|sushi|weather|rain|sun|football|basketball|movie|music|party|sleep)\b/i.test(lower) && !lower.includes('vector') && !lower.includes('model') && !lower.includes('data')) {
            return {
                score: 0,
                confidence: 90,
                correctness: 'OFF_TOPIC',
                detected_concepts: [],
                missing_concepts: [],
                strengths: [],
                weaknesses: ['Response is non-technical / off-topic'],
                next_action: 'retry',
                reason: 'Candidate response was off-topic non-technical discussion.'
            };
        }
        return null; // Defer to LLM for non-trivial responses
    }
    normalizeClassification(raw, score) {
        const upper = (raw || '').toUpperCase();
        if (['PROFANITY', 'GIBBERISH', 'REFUSAL', 'OFF_TOPIC', 'UNCERTAIN', 'WEAK', 'GOOD', 'EXCELLENT', 'LACK_OF_EXPERIENCE'].includes(upper)) {
            return upper;
        }
        if (upper === 'EXEMPLARY')
            return 'EXCELLENT';
        if (upper === 'ADEQUATE')
            return 'GOOD';
        if (upper === 'INVALID' || upper === 'NO_ATTEMPT')
            return 'GIBBERISH';
        if (score >= 85)
            return 'EXCELLENT';
        if (score >= 60)
            return 'GOOD';
        if (score >= 30)
            return 'WEAK';
        return 'GIBBERISH';
    }
    fallbackEvaluate(trimmed) {
        const fast = this.performFastClassification(trimmed);
        if (fast)
            return fast;
        const wordCount = trimmed.split(/\s+/).length;
        const isTechnical = /\b(model|vector|embedding|database|python|api|tensor|chroma|transformer|token|retrieval)\b/i.test(trimmed);
        if (isTechnical && wordCount >= 10) {
            return {
                score: 75,
                confidence: 70,
                correctness: 'GOOD',
                detected_concepts: ['Technical implementation'],
                missing_concepts: [],
                strengths: ['Provided relevant technical explanation'],
                weaknesses: [],
                next_action: 'advance',
                reason: 'Candidate provided a valid technical response.'
            };
        }
        else if (wordCount < 10) {
            return {
                score: 45,
                confidence: 70,
                correctness: 'WEAK',
                detected_concepts: [],
                missing_concepts: ['Implementation details'],
                strengths: [],
                weaknesses: ['Response lacked technical depth'],
                next_action: 'follow_up',
                reason: 'Response was brief and lacked implementation details.'
            };
        }
        return {
            score: 0,
            confidence: 70,
            correctness: 'GIBBERISH',
            detected_concepts: [],
            missing_concepts: [],
            strengths: [],
            weaknesses: ['Invalid response'],
            next_action: 'retry',
            reason: 'Response could not be evaluated.'
        };
    }
}
exports.ResponseEvaluator = ResponseEvaluator;
