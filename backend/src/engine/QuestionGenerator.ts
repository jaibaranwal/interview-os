import { CandidateProfile, CurriculumDay, LLMEvaluationResult } from '../types';
import { ILLMClient, getSharedLLMClient } from '../services/LLMClient';
import { AskedQuestionRecord } from '../memory/ConversationMemory';
import { Logger } from '../utils/logger';

export interface QuestionGeneratorContext {
  candidate: CandidateProfile;
  currentDay: CurriculumDay;
  currentState: string;
  evaluation?: LLMEvaluationResult;
  askedQuestions: AskedQuestionRecord[];
  lastCandidateAnswer?: string;
  recentConversationContext?: string;  // Last 3 Q&A turns formatted
  difficulty: number;
  retryCount: number;
  followUpCount: number;
  isConsecutiveInvalidAdvance?: boolean;
}

export class QuestionGenerator {
  private llmClient: ILLMClient;

  constructor(llmClient?: ILLMClient) {
    this.llmClient = llmClient || getSharedLLMClient();
  }

  public async generateQuestion(ctx: QuestionGeneratorContext): Promise<string> {
    const {
      candidate,
      currentDay,
      currentState,
      evaluation,
      askedQuestions,
      lastCandidateAnswer,
      recentConversationContext,
      difficulty,
      retryCount,
      followUpCount,
      isConsecutiveInvalidAdvance
    } = ctx;

    const dayTitle = `Day ${currentDay.day}: ${currentDay.title}`;
    const dayTools = currentDay.tools.join(', ');
    const dayObjectives = currentDay.objectives.join('; ');
    const correctness = evaluation?.correctness || 'UNKNOWN';

    // Prompt 26: Consecutive invalid answers polite topic advance
    if (isConsecutiveInvalidAdvance) {
      const toolsText = currentDay.tools.slice(0, 2).join(' and ');
      return `We've had trouble covering this section. Let's move on to the next topic: ${dayTitle}. To start, walk me through your approach to using ${toolsText}.`;
    }

    // Keep history of last 3 asked questions to forbid semantic repetition
    const recentAskedQuestions = askedQuestions.slice(-3);
    const previousQuestionsText = recentAskedQuestions.length > 0
      ? recentAskedQuestions.map((q) => `- [Day ${q.day}]: "${q.text.slice(0, 100)}${q.text.length > 100 ? '...' : ''}"`)
          .join('\n')
      : '(None — session start)';

    const conversationContextSection = recentConversationContext
      ? `\nRECENT CONVERSATION CONTEXT (last 3 turns):\n${recentConversationContext}\n`
      : '';

    const evaluationSection = evaluation
      ? [
          `Score: ${evaluation.score}/100`,
          `Classification: ${correctness}`,
          `Next Action: ${evaluation.next_action}`,
          `Detected Concepts: ${(evaluation.detected_concepts || []).join(', ') || 'none'}`,
          `Missing Concepts: ${(evaluation.missing_concepts || []).join(', ') || 'none'}`,
          `Reason: ${evaluation.reason}`
        ].join('\n')
      : 'N/A (initial turn / greeting)';

    const isLackOfExperience = correctness === 'LACK_OF_EXPERIENCE';
    const hasMeaningfulContent = ['GOOD', 'EXCELLENT'].includes(correctness) || (correctness === 'WEAK' && (evaluation?.score || 0) >= 30);

    const systemPrompt = `You are a Staff-level AI Engineering Interviewer conducting a technical interview with ${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs exp).

CURRENT TOPIC (STRICT GROUNDING REQUIREMENT):
Topic: ${dayTitle}
Allowed Tools FOR THIS TOPIC: ${dayTools}
Objectives FOR THIS TOPIC: ${dayObjectives}
Difficulty: ${difficulty.toFixed(1)} / 5.0
Interview State: ${currentState}
Classification of Candidate Answer: ${correctness}
${conversationContextSection}
LAST 3 QUESTIONS ASKED (MUST NOT REPEAT SEMANTICALLY OR VERBATIM):
${previousQuestionsText}

CANDIDATE'S LAST RESPONSE:
"${lastCandidateAnswer || '(session initialization)'}"

LAST EVALUATION:
${evaluationSection}

═══════════════════════════════════════════════════════
MANDATORY RULES — PROMPT 27 REALISM REFINEMENTS:
═══════════════════════════════════════════════════════

RULE 1 — STRICT TOPIC GROUNDING (NO TOPIC LEAKAGE):
  - You MUST ONLY ask about tools and objectives listed under "Allowed Tools FOR THIS TOPIC": ${dayTools}.
  - ABSOLUTE PROHIBITION: NEVER mention or reuse technologies from previous or future days.

RULE 2 — LACK OF EXPERIENCE CONCEPTUAL PIVOT:
  ${isLackOfExperience
    ? 'CRITICAL: Candidate explicitly stated they have NO practical experience with ' + dayTools + '. Do NOT ask "How did YOU configure..." or "Describe your implementation of...". Pivot naturally to a conceptual or hypothetical question, such as: "If you had to build this today, how would you approach it?" or "What do you know conceptually about this technology?"'
    : (hasMeaningfulContent
        ? 'The candidate provided technical content. You MAY reference their specific verified statements.'
        : 'CRITICAL: Candidate provided non-technical or invalid input (classified as ' + correctness + '). You MUST NOT say "Building on what you shared...", "Based on your answer...", "You mentioned...", or "As you noted...". Generate a clarification or simplified question instead.')}

RULE 3 — NATURAL INTERVIEWER OPENERS & DIVERSITY:
  - Never start consecutive questions with repetitive templates ("Can you explain...", "Could you describe...", "How specifically...").
  - Use varied, natural openers:
    * "Let's look at it from another angle..."
    * "Suppose you were implementing this today..."
    * "Walk me through your thought process..."
    * "Imagine you're designing this from scratch..."
    * "Can you reason through how this would work?"
    * "What would your approach be?"
    * "What trade-offs would you consider?"
    * "If you joined our team tomorrow, how would you solve this?"

RULE 4 — PROFESSIONAL TONALITY:
  - Stay calm, neutral, and professional. Never scold, lecture, teach, or echo profanity.
  - Keep response to 2-3 concise sentences maximum.

RULE 5 — PROGRESSIVE PROBING & NATURAL FLOW:
  ${hasMeaningfulContent && currentState === 'FOLLOW_UP'
    ? 'The candidate gave a GOOD technical response. Apply PROGRESSIVE PROBING: stay on the same concept (' + dayTitle + ') to probe implementation details, validation, error handling, or trade-offs (basic -> implementation -> trade-offs). Do NOT jump to an unrelated topic yet.'
    : 'Maintain natural progression without sudden jumps between unrelated concepts.'}

Output ONLY the interviewer's spoken question.`;

    try {
      const questionText = await this.llmClient.generate(systemPrompt, lastCandidateAnswer || '');
      let trimmed = questionText.trim();

      // Post-generation phrase scrubbing
      if (!hasMeaningfulContent && !isLackOfExperience) {
        trimmed = trimmed
          .replace(/^building on what you shared,?\s*/i, '')
          .replace(/^building on your response,?\s*/i, '')
          .replace(/^based on your answer,?\s*/i, '')
          .replace(/^you mentioned[^,.!?]*[,.!?]\s*/i, '');
        trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }

      // Guard 1: Reject JSON responses
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        Logger.warn('QuestionGenerator: LLM returned JSON instead of question — using safe fallback.');
        return this.buildSafeFallbackQuestion(ctx);
      }

      // Guard 2: Reject internal system text leaking
      if (trimmed.toLowerCase().includes('output only') || trimmed.toLowerCase().includes('exact schema')) {
        Logger.warn('QuestionGenerator: LLM returned system prompt text — using safe fallback.');
        return this.buildSafeFallbackQuestion(ctx);
      }

      // Guard 3: Reject empty or too-short responses
      if (trimmed.length < 10) {
        Logger.warn('QuestionGenerator: LLM returned empty/too short response — using safe fallback.');
        return this.buildSafeFallbackQuestion(ctx);
      }

      // Prompt 26 Rule 7: Runtime Assertions Verification
      const isValid = this.validateRuntimeAssertions(trimmed, ctx);
      if (!isValid) {
        Logger.warn('QuestionGenerator: Runtime assertion failed — auto-regenerating via safe fallback.');
        return this.buildSafeFallbackQuestion(ctx);
      }

      return trimmed;
    } catch (err: any) {
      Logger.error('QuestionGenerator LLM call failed — using safe fallback:', err.message);
      return this.buildSafeFallbackQuestion(ctx);
    }
  }

  /** Prompt 26 Rule 7: Runtime Assertions before returning a question */
  private validateRuntimeAssertions(question: string, ctx: QuestionGeneratorContext): boolean {
    const { currentDay, askedQuestions, evaluation } = ctx;
    const lowerQuestion = question.toLowerCase();
    const correctness = evaluation?.correctness || 'UNKNOWN';
    const hasMeaningfulContent = ['GOOD', 'EXCELLENT'].includes(correctness) || (correctness === 'WEAK' && (evaluation?.score || 0) >= 30);
    const isLackOfExperience = correctness === 'LACK_OF_EXPERIENCE';

    // Assertion 1: Question references current topic or tools
    const dayTitleLower = currentDay.title.toLowerCase();
    const toolsLower = currentDay.tools.map((t) => t.toLowerCase());
    const matchesTopicOrTool = lowerQuestion.includes(dayTitleLower) ||
      toolsLower.some((tool) => lowerQuestion.includes(tool.split(' ')[0])) ||
      lowerQuestion.includes(`day ${currentDay.day}`) ||
      isLackOfExperience;

    if (!matchesTopicOrTool) {
      Logger.warn(`Assertion 1 Failed: Question does not reference current topic (${currentDay.title}) or tools (${currentDay.tools.join(', ')})`);
      return false;
    }

    // Assertion 2: Topic Leakage check — question does NOT reference unrelated technologies outside currentDay.tools
    const allKnownTech = [
      'vs code', 'pandas', 'sqlite', 'sentence transformers',
      'vector databases', 'chromadb', 'faiss', 'pinecone', 'langchain', 'docker', 'kubernetes'
    ];

    const currentToolsSet = new Set(currentDay.tools.map((t) => t.toLowerCase()));
    for (const tech of allKnownTech) {
      if (lowerQuestion.includes(tech)) {
        const isCurrentTech = Array.from(currentToolsSet).some((ct) => ct.includes(tech) || tech.includes(ct)) ||
          dayTitleLower.includes(tech);
        if (!isCurrentTech) {
          Logger.warn(`Assertion 2 Failed: Topic leakage detected — question referenced unrelated tech "${tech}" not in Day ${currentDay.day} tools.`);
          return false;
        }
      }
    }

    // Assertion 3: Question differs from previous 3 interviewer questions (prevents repetition)
    const recentQuestions = askedQuestions.slice(-3);
    for (const asked of recentQuestions) {
      const askedLower = asked.text.toLowerCase().trim();
      if (askedLower === lowerQuestion.trim()) {
        Logger.warn(`Assertion 3 Failed: Question is identical to a previously asked question.`);
        return false;
      }
    }

    // Assertion 4: Follow-up phrase only if previous answer contained technical content
    if (!hasMeaningfulContent && !isLackOfExperience) {
      const hasFollowUpPhrase = /building on|based on your answer|you mentioned/i.test(question);
      if (hasFollowUpPhrase) {
        Logger.warn(`Assertion 4 Failed: Follow-up phrase used on non-technical candidate input (${correctness}).`);
        return false;
      }
    }

    return true;
  }

  private buildSafeFallbackQuestion(ctx: QuestionGeneratorContext): string {
    const { currentState, currentDay, evaluation } = ctx;
    const dayTitle = `Day ${currentDay.day}: ${currentDay.title}`;
    const tools = currentDay.tools.slice(0, 2).join(' and ');
    const stateUpper = (currentState || '').toUpperCase();
    const correctness = evaluation?.correctness || 'UNKNOWN';

    if (correctness === 'LACK_OF_EXPERIENCE') {
      return `If you had to build a solution today for ${dayTitle} using ${tools}, what would your conceptual approach be?`;
    }

    if (stateUpper === 'GREETING') {
      return `Welcome to today's technical interview. Walk me through how you approached ${dayTitle} — specifically your use of ${tools}.`;
    }

    if (stateUpper === 'FOLLOW_UP') {
      const missing = (evaluation?.missing_concepts || []).slice(0, 2).join(' and ');
      if (missing) {
        return `How specifically would you address ${missing} in your implementation of ${dayTitle}?`;
      }
      return `Suppose you were implementing ${dayTitle} today — what trade-offs and design choices would you consider for ${tools}?`;
    }

    if (stateUpper === 'HINT' || stateUpper === 'RETRY') {
      return `Imagine you are designing ${dayTitle} from scratch: how would you configure ${tools}?`;
    }

    if (stateUpper === 'TOPIC_SWITCH') {
      return `Let's move on to ${dayTitle}. What would your approach be to using ${tools}?`;
    }

    return `Regarding ${dayTitle}: walk me through your implementation approach using ${tools}.`;
  }
}
