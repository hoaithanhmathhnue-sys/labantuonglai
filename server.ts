import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { INITIAL_ADMISSIONS_DATABASE } from './src/data/admissions.ts';
import { AdmissionProgramRecord, StudentProfile, SubjectRecord, InterestAnswer, ExperiencePreferences } from './src/types/index.ts';
import { runRecommendationEngine } from './src/engine/recommendationEngine.ts';
import { runGeminiAdapter } from './src/server/geminiAdapter.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// In-memory Admissions store initialized with verified records
let admissionsDb: AdmissionProgramRecord[] = [...INITIAL_ADMISSIONS_DATABASE];

// --- ADMISSIONS REST APIS ---

// 1. GET all or filtered admissions
app.get('/api/admissions', (req: Request, res: Response) => {
  const { region, degreeLevel, status, keyword } = req.query;
  let results = admissionsDb;

  if (region && typeof region === 'string') {
    results = results.filter((r) => r.region === region);
  }
  if (degreeLevel && typeof degreeLevel === 'string') {
    results = results.filter((r) => r.degreeLevel === degreeLevel);
  }
  if (status && typeof status === 'string') {
    results = results.filter((r) => r.status === status);
  }
  if (keyword && typeof keyword === 'string') {
    const q = keyword.toLowerCase();
    results = results.filter(
      (r) =>
        r.schoolName.toLowerCase().includes(q) ||
        r.majorName.toLowerCase().includes(q) ||
        (r.faculty && r.faculty.toLowerCase().includes(q))
    );
  }

  res.json({
    total: results.length,
    data: results,
  });
});

// 2. POST create new admission record (Teacher authenticated)
app.post('/api/admissions', (req: Request, res: Response) => {
  const body = req.body as Partial<AdmissionProgramRecord>;

  if (!body.schoolName || !body.majorName || !body.sourceUrl) {
    res.status(400).json({
      error: 'Thiếu thông tin bắt buộc: Tên trường, Tên ngành và Đường dẫn nguồn tuyển sinh chính thức.',
    });
    return;
  }

  const newRecord: AdmissionProgramRecord = {
    id: `adm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    schoolName: body.schoolName.trim(),
    campus: body.campus?.trim(),
    province: body.province?.trim() || 'Chưa xác định',
    region: body.region || 'Miền Bắc',
    majorCode: body.majorCode?.trim(),
    majorName: body.majorName.trim(),
    faculty: body.faculty?.trim(),
    degreeLevel: body.degreeLevel || 'Đại học',
    admissionYear: body.admissionYear || 2025,
    admissionMethod: body.admissionMethod?.trim() || 'Xét điểm thi tốt nghiệp THPT',
    requirementSummary: body.requirementSummary?.trim() || 'Theo đề án tuyển sinh chính thức',
    benchmarkScore: body.benchmarkScore ? Number(body.benchmarkScore) : undefined,
    scoreScale: body.scoreScale ? Number(body.scoreScale) : 30,
    tuitionInfo: body.tuitionInfo?.trim(),
    sourceUrl: body.sourceUrl.trim(),
    publishDate: body.publishDate || new Date().toISOString().split('T')[0],
    verifiedDate: new Date().toLocaleDateString('vi-VN'),
    verifiedBy: body.verifiedBy?.trim() || 'Giáo viên phụ trách',
    status: body.status || 'verified',
  };

  admissionsDb.unshift(newRecord);
  res.status(201).json(newRecord);
});

// 3. PUT update existing admission record
app.put('/api/admissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = admissionsDb.findIndex((r) => r.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy bản ghi tuyển sinh.' });
    return;
  }

  const updated: AdmissionProgramRecord = {
    ...admissionsDb[index],
    ...req.body,
    id: admissionsDb[index].id, // keep original ID
    verifiedDate: new Date().toLocaleDateString('vi-VN'),
  };

  admissionsDb[index] = updated;
  res.json(updated);
});

// 4. DELETE admission record
app.delete('/api/admissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = admissionsDb.length;
  admissionsDb = admissionsDb.filter((r) => r.id !== id);

  if (admissionsDb.length === initialLength) {
    res.status(404).json({ error: 'Không tìm thấy bản ghi để xóa.' });
    return;
  }

  res.json({ message: 'Đã xóa bản ghi tuyển sinh thành công.' });
});

// --- RECOMMENDATION ANALYSIS ENDPOINT ---
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const {
      profile,
      subjects,
      answers,
      preferences,
      enableTeacherAiMode,
    } = req.body as {
      profile: Pick<StudentProfile, 'nameOrCode' | 'grade' | 'graduationYear'>;
      subjects: SubjectRecord[];
      answers: InterestAnswer[];
      preferences: ExperiencePreferences;
      enableTeacherAiMode?: boolean;
    };

    if (!profile || !subjects || !answers) {
      res.status(400).json({ error: 'Dữ liệu khảo sát không đầy đủ để phân tích.' });
      return;
    }

    // 1. Run deterministic, explainable rule engine
    const ruleBasedResult = runRecommendationEngine({
      profile,
      subjects,
      answers,
      preferences: preferences || {},
      admissionsDb,
    });

    // 2. Under-18 Terms Check: Student mode strictly defaults to rule-based engine
    if (!enableTeacherAiMode) {
      res.json(ruleBasedResult);
      return;
    }

    // 3. If teacher verified AI testing mode is explicitly enabled, run isolated server Gemini adapter
    const sanitizedSubjectScores = subjects
      .filter((s) => !s.isNotStudied && !s.isNoScoreYet && s.score !== undefined)
      .map((s) => ({ subject: s.name, score: s.score!, interest: s.interest }));

    const sanitizedCategoryScores = ruleBasedResult.interestScores.map((c) => ({
      categoryName: c.categoryName,
      average: c.average,
      validCount: c.validCount,
    }));

    const sanitizedAiInput = {
      gradeLevel: profile.grade,
      validSubjectScores: sanitizedSubjectScores,
      interestCategoryScores: sanitizedCategoryScores,
      careerCandidates: ruleBasedResult.careerSuggestions.map((c) => ({
        id: c.careerId,
        title: c.title,
        coreSubjects: c.coreSubjects,
      })),
      verifiedProgramIds: ruleBasedResult.programSuggestions.map((p) => p.program.id),
      studentExpressedGoal: preferences?.fieldToTry,
    };

    const finalResult = await runGeminiAdapter(sanitizedAiInput, ruleBasedResult);
    res.json(finalResult);
  } catch (err: unknown) {
    console.error('Error during recommendation analysis:', err);
    res.status(500).json({
      error: 'Không thể xử lý yêu cầu phân tích vào lúc này. Vui lòng thử lại.',
    });
  }
});

// --- AI FEATURE ENDPOINTS (Client-side API Key) ---

const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

// Helper: create client from user-supplied key
function createClientFromRequest(apiKey: string, provider: string) {
  const { createGoogleAiClient } = require('./src/server/geminiAdapter.ts');
  return createGoogleAiClient(apiKey, provider as any);
}

// Helper: get key - prefer user-supplied, fallback to env
function resolveApiKey(reqKey?: string): string | null {
  if (reqKey && GOOGLE_AI_API_KEY_PATTERN.test(reqKey.trim())) {
    return reqKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'MY_GEMINI_API_KEY' && GOOGLE_AI_API_KEY_PATTERN.test(envKey)) {
    return envKey;
  }
  return null;
}

// 1. Test API Key validity
app.post('/api/ai/test-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, provider, model } = req.body;
    const key = resolveApiKey(apiKey);
    if (!key) {
      res.status(400).json({ success: false, error: 'API Key không hợp lệ.' });
      return;
    }

    const { createGoogleAiClient } = await import('./src/server/geminiAdapter.ts');
    const ai = createGoogleAiClient(key, provider || 'gemini');
    const testModel = model || 'gemini-3.6-flash';

    const response = await ai.models.generateContent({
      model: testModel,
      contents: 'Trả lời ngắn gọn: "OK" nếu bạn nhận được tin nhắn này.',
      config: { maxOutputTokens: 32 },
    });

    const text = response.text?.trim();
    if (text) {
      res.json({ success: true, message: `API Key hoạt động! Model ${testModel} phản hồi thành công.` });
    } else {
      res.json({ success: false, error: 'API Key được chấp nhận nhưng model không phản hồi.' });
    }
  } catch (err: any) {
    const { parseApiError } = await import('./src/server/geminiAdapter.ts');
    const errorType = parseApiError(err);
    const messages: Record<string, string> = {
      INVALID_API_KEY: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.',
      QUOTA_EXCEEDED: 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.',
      MODEL_OVERLOADED: 'Model đang quá tải nhưng API Key hợp lệ. Thử lại sau.',
      NOT_FOUND: 'Model không tồn tại hoặc không khả dụng. Thử chọn model khác.',
    };
    res.status(400).json({ success: false, error: messages[errorType] || `Lỗi kiểm tra API Key: ${err.message}` });
  }
});

// 2. AI Career Deep Analysis
app.post('/api/ai/career-analysis', async (req: Request, res: Response) => {
  try {
    const { careerTitle, careerId, categoryName, coreSubjects, studentGrade, apiKey, provider, model } = req.body;
    const key = resolveApiKey(apiKey);

    if (!key) {
      res.status(400).json({ error: 'Vui lòng cấu hình API Key trong Cài đặt AI để sử dụng tính năng này.' });
      return;
    }

    const { createGoogleAiClient, parseApiError, FALLBACK_MODELS } = await import('./src/server/geminiAdapter.ts');
    const ai = createGoogleAiClient(key, provider || 'gemini');

    const selectedModel = model || 'gemini-3.6-flash';
    const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter((m: string) => m !== selectedModel)];

    const systemInstruction = `Bạn là chuyên gia tư vấn hướng nghiệp giáo dục tại Việt Nam. Hãy phân tích chi tiết về nghề nghiệp được yêu cầu.
NGUYÊN TẮC:
1. Thông tin chính xác, cập nhật với thực tế Việt Nam.
2. Giọng văn sư phạm, ấm áp, dùng "em" để gọi học sinh.
3. Trung thực về cả mặt tích cực lẫn thách thức.
4. Mức lương tham khảo theo thị trường Việt Nam hiện tại.
5. Lộ trình học tập phù hợp bối cảnh giáo dục Việt Nam.`;

    const prompt = `Phân tích chi tiết nghề "${careerTitle}" thuộc nhóm "${categoryName}".
Học sinh hiện đang lớp ${studentGrade}, quan tâm các môn: ${coreSubjects.join(', ')}.

Trả về JSON với cấu trúc:
{
  "overview": "Mô tả tổng quan về nghề (3-4 câu)",
  "dailyWork": "Mô tả công việc hàng ngày cụ thể (3-4 câu)",
  "requiredSkills": ["Kỹ năng 1", "Kỹ năng 2", ...] (5-7 kỹ năng),
  "salaryRange": "Mức lương khởi điểm đến có kinh nghiệm tại Việt Nam",
  "growthOutlook": "Triển vọng phát triển trong 5-10 năm tới (2-3 câu)",
  "educationPaths": ["Lộ trình 1", "Lộ trình 2", ...] (3-4 lộ trình),
  "relatedCareers": ["Nghề liên quan 1", ...] (3-5 nghề),
  "challengesAndRewards": "Thách thức và phần thưởng (3-4 câu)",
  "adviceForStudent": "Lời khuyên cụ thể dành cho học sinh lớp ${studentGrade} (2-3 câu)"
}`;

    let lastError: any = null;
    const RETRYABLE = new Set(['MODEL_OVERLOADED', 'SERVER_ERROR', 'TIMEOUT', 'NOT_FOUND']);

    for (const m of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
          },
        });

        const text = response.text?.trim();
        if (!text) continue;

        const parsed = JSON.parse(text);
        res.json(parsed);
        return;
      } catch (error: any) {
        lastError = error;
        const errorType = parseApiError(error);
        if (!RETRYABLE.has(errorType)) break;
      }
    }

    const { parseApiError: parseErr } = await import('./src/server/geminiAdapter.ts');
    const errType = parseErr(lastError);
    const friendlyMessages: Record<string, string> = {
      INVALID_API_KEY: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt AI.',
      QUOTA_EXCEEDED: 'Đã hết quota API. Vui lòng đợi vài phút rồi thử lại.',
      MODEL_OVERLOADED: 'Server AI đang quá tải. Vui lòng thử lại sau ít phút.',
      INVALID_ARGUMENT: 'API Key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt AI.',
    };
    res.status(500).json({ error: friendlyMessages[errType] || 'Không thể phân tích nghề nghiệp. Vui lòng thử lại sau.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi phân tích nghề nghiệp. Vui lòng thử lại.' });
  }
});

// 3. AI School & Major Search
app.post('/api/ai/school-search', async (req: Request, res: Response) => {
  try {
    const { query, apiKey, provider, model } = req.body;
    const key = resolveApiKey(apiKey);

    if (!key) {
      res.status(400).json({ error: 'Vui lòng cấu hình API Key trong Cài đặt AI để sử dụng tính năng tra cứu.' });
      return;
    }

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      res.status(400).json({ error: 'Vui lòng nhập nội dung tìm kiếm (tối thiểu 3 ký tự).' });
      return;
    }

    const { createGoogleAiClient, parseApiError, FALLBACK_MODELS } = await import('./src/server/geminiAdapter.ts');
    const ai = createGoogleAiClient(key, provider || 'gemini');

    const selectedModel = model || 'gemini-3.6-flash';
    const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter((m: string) => m !== selectedModel)];

    const systemInstruction = `Bạn là chuyên gia tư vấn tuyển sinh đại học Việt Nam. Hãy cung cấp thông tin chính xác, cập nhật nhất về các trường đại học, cao đẳng và ngành học.
NGUYÊN TẮC:
1. Chỉ cung cấp thông tin về các trường CÓ THẬT tại Việt Nam.
2. Điểm chuẩn lấy từ năm gần nhất có dữ liệu (ghi rõ năm).
3. Học phí ước tính theo niên khóa gần nhất.
4. Nếu không chắc chắn, ghi rõ "cần xác nhận trên website chính thức".
5. Giọng văn sư phạm, hữu ích.`;

    const prompt = `Tìm kiếm thông tin: "${query.trim()}"

Trả về JSON với cấu trúc:
{
  "summary": "Tóm tắt tổng hợp kết quả tìm kiếm (2-4 câu)",
  "searchQuery": "${query.trim()}",
  "results": [
    {
      "schoolName": "Tên trường đầy đủ",
      "location": "Địa chỉ / Khu vực",
      "majors": [
        {
          "name": "Tên ngành",
          "faculty": "Khoa / Viện",
          "benchmarkScore": "Điểm chuẩn (ghi rõ năm và phương thức xét tuyển)",
          "tuition": "Học phí ước tính / năm",
          "admissionMethod": "Phương thức xét tuyển"
        }
      ],
      "website": "URL website chính thức của trường",
      "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2"],
      "lastUpdated": "Thời gian tham khảo gần nhất"
    }
  ]
}

Trả về 3-5 trường phù hợp nhất. Nếu câu hỏi không liên quan đến giáo dục, trả về mảng results rỗng và summary giải thích.`;

    let lastError: any = null;
    const RETRYABLE = new Set(['MODEL_OVERLOADED', 'SERVER_ERROR', 'TIMEOUT', 'NOT_FOUND']);

    for (const m of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 12288,
          },
        });

        const text = response.text?.trim();
        if (!text) continue;

        const parsed = JSON.parse(text);
        res.json(parsed);
        return;
      } catch (error: any) {
        lastError = error;
        const errorType = parseApiError(error);
        if (!RETRYABLE.has(errorType)) break;
      }
    }

    const { parseApiError: parseErr2 } = await import('./src/server/geminiAdapter.ts');
    const errType2 = parseErr2(lastError);
    const friendlyMessages2: Record<string, string> = {
      INVALID_API_KEY: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt AI.',
      QUOTA_EXCEEDED: 'Đã hết quota API. Vui lòng đợi vài phút rồi thử lại.',
      MODEL_OVERLOADED: 'Server AI đang quá tải. Vui lòng thử lại sau ít phút.',
      INVALID_ARGUMENT: 'API Key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt AI.',
    };
    res.status(500).json({ error: friendlyMessages2[errType2] || 'Không thể tra cứu thông tin. Vui lòng thử lại sau.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tra cứu thông tin. Vui lòng thử lại.' });
  }
});

// --- VITE MIDDLEWARE OR STATIC SERVING ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server La Bàn Tương Lai running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
