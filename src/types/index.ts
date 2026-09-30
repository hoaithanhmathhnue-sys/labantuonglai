export type GradeLevel = 10 | 11 | 12;

export interface StudentProfile {
  nameOrCode: string;
  grade: GradeLevel;
  graduationYear: number;
  birthDate?: string; // Optional: purely for age/profile, NEVER sent to AI or used in recommendation analysis
}

export interface SubjectRecord {
  id: string;
  name: string;
  score?: number; // 0 to 10
  scoreInput?: string; // raw input string allowing comma or dot
  period: string; // e.g. "Học kỳ 1 năm học hiện tại", "Cả năm lớp trước"
  scoreType: string; // "Điểm trung bình môn", "Điểm kiểm tra định kỳ", "Điểm thi thử THPT", "Điểm tự đánh giá"
  interest: number; // 1 to 5
  isNotStudied: boolean;
  isNoScoreYet: boolean;
  previousScore?: number; // optional prior score for trend observation
}

export type InterestCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface InterestCategoryMeta {
  code: InterestCategory;
  name: string;
  shortDescription: string;
  focusKeywords: string[];
}

export interface InterestQuestion {
  id: string; // R1, R2, I1, I2, A1, A2, S1, S2, E1, E2, C1, C2
  category: InterestCategory;
  text: string;
}

export type AnswerRating = 1 | 2 | 3 | 4 | 5 | 'unexperienced';

export interface InterestAnswer {
  questionId: string;
  rating: AnswerRating;
}

export type RelocationWillingness = 'yes' | 'no' | 'consider';
export type DegreeLevelPreference = 'all' | 'university' | 'college' | 'vocational';

export interface ExperiencePreferences {
  proudAchievement?: string; // max 500 chars, no private info
  fieldToTry?: string; // field user wants to explore
  dislikedTasks?: string; // types of tasks user dislikes
  preferredRegion?: string; // e.g. "Hà Nội", "TP. Hồ Chí Minh", "Miền Bắc", "Miền Trung", "Miền Nam"
  willingToRelocate?: RelocationWillingness;
  desiredDegree?: DegreeLevelPreference;
  tuitionBudgetRange?: string; // e.g. "Dưới 15 triệu/năm", "15 - 30 triệu/năm", "Trên 30 triệu/năm", "Cần học bổng/miễn giảm"
}

export interface AdmissionProgramRecord {
  id: string;
  schoolName: string;
  campus?: string;
  province: string;
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';
  majorCode?: string;
  majorName: string;
  faculty?: string;
  degreeLevel: 'Đại học' | 'Cao đẳng' | 'Đào tạo nghề';
  admissionYear: number;
  admissionMethod: string; // e.g. "Xét điểm thi THPT", "Xét học bạ THPT", "Xét điểm thi Đánh giá năng lực"
  requirementSummary: string;
  benchmarkScore?: number;
  scoreScale?: number; // usually 30 or 100 or 1200
  tuitionInfo?: string;
  sourceUrl: string;
  publishDate?: string;
  verifiedDate: string;
  verifiedBy: string;
  status: 'verified' | 'draft' | 'fixture' | 'deprecated';
}

export interface CareerOption {
  id: string;
  title: string;
  category: InterestCategory;
  categoryName: string;
  description: string;
  coreSubjects: string[];
  requiredSkills: string[];
  trialActivities: string;
  uncertainties: string[];
  degreeLevels: ('Đại học' | 'Cao đẳng' | 'Đào tạo nghề')[];
}

export interface CategoryScoreResult {
  category: InterestCategory;
  categoryName: string;
  average: number | null; // null if 0 questions answered
  validCount: number;
  totalQuestions: number;
  status: 'sufficient' | 'low_data' | 'insufficient';
  contributingAnswers: { questionId: string; text: string; rating: number }[];
}

export interface LearningStrength {
  subject: string;
  score: number;
  interest: number;
  insight: string;
}

export interface DevelopmentArea {
  subject: string;
  score?: number;
  interest: number;
  reason: string;
  suggestion: string;
}

export interface CareerSuggestion {
  careerId: string;
  title: string;
  categoryName: string;
  reasons: string[];
  evidenceIds: string[];
  uncertainties: string[];
  trialActivity: string;
  coreSubjects: string[];
  matchedDegreeLevels: string[];
}

export interface ProgramSuggestion {
  program: AdmissionProgramRecord;
  matchReason: string;
  academicFitStatus: 'eligible_reference' | 'needs_improvement' | 'insufficient_data';
  missingDataNote?: string;
}

export interface FourWeekPlanStep {
  week: number;
  title: string;
  action: string;
  outcome: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  detail: string;
}

export interface AnalysisResult {
  mode: 'rule_based' | 'verified_ai' | 'demo';
  summary: string;
  studentDisplayLabel: string; // Nickname or Student Code for polite address
  evidence: EvidenceItem[];
  interestScores: CategoryScoreResult[];
  learningStrengths: LearningStrength[];
  developmentAreas: DevelopmentArea[];
  careerSuggestions: CareerSuggestion[];
  programSuggestions: ProgramSuggestion[];
  fourWeekPlan: FourWeekPlanStep[];
  questionsForDiscussion: string[];
  limitations: string[];
  dataAudit: {
    usedInputs: string[];
    missingInputs: string[];
  };
  analyzedAt: string;
}
