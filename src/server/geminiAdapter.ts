import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types';

// --- SHARED CONSTANTS (per api.md) ---

export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
};

export const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export type AiProvider = 'gemini' | 'agent-platform';

export const createGoogleAiClient = (
  apiKey: string,
  provider: AiProvider = 'gemini',
): GoogleGenAI => {
  if (provider === 'agent-platform') {
    return new GoogleGenAI({ vertexai: true, apiKey });
  }
  return new GoogleGenAI({ apiKey });
};

export const parseApiError = (error: any): string => {
  const message = error?.message || error?.toString() || '';
  const serialized = JSON.stringify(error) || '';

  if (
    serialized.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota')
  ) return 'QUOTA_EXCEEDED';

  if (
    serialized.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('overloaded') ||
    message.toLowerCase().includes('temporarily unavailable')
  ) return 'MODEL_OVERLOADED';

  if (
    serialized.includes('500') ||
    message.includes('INTERNAL')
  ) return 'SERVER_ERROR';

  if (
    serialized.includes('504') ||
    message.includes('DEADLINE_EXCEEDED')
  ) return 'TIMEOUT';

  if (
    serialized.includes('404') ||
    message.includes('NOT_FOUND')
  ) return 'NOT_FOUND';

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('401') ||
    message.includes('PERMISSION_DENIED')
  ) return 'INVALID_API_KEY';

  if (
    message.includes('400') ||
    message.includes('INVALID_ARGUMENT')
  ) return 'INVALID_ARGUMENT';

  return 'UNKNOWN';
};

const getOrderedModels = (selectedModel?: string): string[] => {
  if (!selectedModel || !(FALLBACK_MODELS as readonly string[]).includes(selectedModel)) {
    return [...FALLBACK_MODELS];
  }
  return [selectedModel, ...FALLBACK_MODELS.filter((m) => m !== selectedModel)];
};

const RETRYABLE_ERRORS = new Set([
  'MODEL_OVERLOADED', 'SERVER_ERROR', 'TIMEOUT', 'NOT_FOUND',
]);

// --- GEMINI ADAPTER ---

export interface SanitizedAIInput {
  gradeLevel: number;
  validSubjectScores: { subject: string; score: number; interest: number }[];
  interestCategoryScores: { categoryName: string; average: number | null; validCount: number }[];
  careerCandidates: { id: string; title: string; coreSubjects: string[] }[];
  verifiedProgramIds: string[];
  studentExpressedGoal?: string;
}

export async function runGeminiAdapter(
  sanitizedInput: SanitizedAIInput,
  baseRuleResult: AnalysisResult
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      ...baseRuleResult,
      mode: 'rule_based',
    };
  }

  const selectedModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  try {
    const ai = createGoogleAiClient(apiKey);

    const systemInstruction = `Bạn là trợ lý giáo dục hướng nghiệp học đường tại Việt Nam, đóng vai trò đồng hành cùng học sinh THPT.
NGUYÊN TẮC BẮT BUỘC:
1. Bạn hỗ trợ khám phá hướng học tập, không chẩn đoán hay phán xét.
2. Tuyệt đối chỉ dựa vào dữ liệu học tập và câu trả lời được cung cấp. Trích dẫn bằng chứng cụ thể.
3. Không phán xét năng lực dựa vào họ tên hay thông tin cá nhân.
4. Không tự bịa tên trường đại học, khoa viện, điểm chuẩn hay học phí ngoài danh sách trường đã được kiểm chứng.
5. Nếu dữ liệu thiếu thì phải nêu rõ là thiếu.
6. Giọng văn tiếng Việt sư phạm, ấm áp, khách quan, có điều kiện ("có thể", "đáng để trải nghiệm thử") và khuyến khích học sinh tự chủ.`;

    const promptText = `Dữ liệu phân tích học tập của học sinh (đã ẩn danh):
- Khối lớp: ${sanitizedInput.gradeLevel}
- Kết quả học tập các môn: ${JSON.stringify(sanitizedInput.validSubjectScores)}
- Điểm trung bình các nhóm sở thích tự khai (1-5): ${JSON.stringify(sanitizedInput.interestCategoryScores)}
- Danh mục nghề đề xuất theo quy tắc: ${JSON.stringify(sanitizedInput.careerCandidates)}
- Mong muốn trải nghiệm: ${sanitizedInput.studentExpressedGoal || 'Không ghi'}

Hãy tạo lời giải thích sư phạm, đề xuất hoạt động thử nghiệm nhỏ trong 1-2 tuần và các câu hỏi đối thoại thiết thực.`;

    let lastError: any = null;

    for (const model of getOrderedModels(selectedModel)) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'Tóm tắt hướng sở thích và định hướng học tập bằng tiếng Việt',
                },
                refinedCareerInsights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      careerId: { type: Type.STRING },
                      trialActivity: { type: Type.STRING },
                      pedagogicalNote: { type: Type.STRING },
                    },
                    required: ['careerId', 'trialActivity'],
                  },
                },
                fourWeekPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      week: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      action: { type: Type.STRING },
                      outcome: { type: Type.STRING },
                    },
                    required: ['week', 'title', 'action', 'outcome'],
                  },
                },
                questionsForDiscussion: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['summary', 'questionsForDiscussion'],
            },
          },
        });

        const parsedJsonText = response.text?.trim();
        if (!parsedJsonText) {
          continue;
        }

        const aiOutput = JSON.parse(parsedJsonText);

        const updatedCareers = baseRuleResult.careerSuggestions.map((c) => {
          const match = aiOutput.refinedCareerInsights?.find((r: { careerId: string }) => r.careerId === c.careerId);
          if (match && match.trialActivity) {
            return {
              ...c,
              trialActivity: match.trialActivity,
              reasons: match.pedagogicalNote ? [...c.reasons, match.pedagogicalNote] : c.reasons,
            };
          }
          return c;
        });

        return {
          ...baseRuleResult,
          mode: 'verified_ai',
          summary: aiOutput.summary || baseRuleResult.summary,
          careerSuggestions: updatedCareers,
          fourWeekPlan:
            Array.isArray(aiOutput.fourWeekPlan) && aiOutput.fourWeekPlan.length === 4
              ? aiOutput.fourWeekPlan
              : baseRuleResult.fourWeekPlan,
          questionsForDiscussion:
            Array.isArray(aiOutput.questionsForDiscussion) && aiOutput.questionsForDiscussion.length >= 3
              ? aiOutput.questionsForDiscussion
              : baseRuleResult.questionsForDiscussion,
        };
      } catch (error: any) {
        lastError = error;
        const errorType = parseApiError(error);
        if (!RETRYABLE_ERRORS.has(errorType)) break;
        console.warn(`GeminiAdapter: model ${model} failed (${errorType}), trying next fallback...`);
      }
    }

    console.error('GeminiAdapter: all models failed, falling back to rule-based engine:', lastError);
    return {
      ...baseRuleResult,
      mode: 'rule_based',
    };
  } catch (error) {
    console.error('GeminiAdapter encountered error, falling back to rule-based engine:', error);
    return {
      ...baseRuleResult,
      mode: 'rule_based',
    };
  }
}

