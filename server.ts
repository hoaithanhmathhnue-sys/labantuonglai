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
