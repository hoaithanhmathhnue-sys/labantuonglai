import React, { useState } from 'react';
import { Sparkles, Loader2, X, TrendingUp, Briefcase, GraduationCap, Clock, Target, BookOpen } from 'lucide-react';
import { loadAiConfig, getActiveApiKey } from './ApiKeySettingsModal';

interface AiCareerInsight {
  overview: string;
  dailyWork: string;
  requiredSkills: string[];
  salaryRange: string;
  growthOutlook: string;
  educationPaths: string[];
  relatedCareers: string[];
  challengesAndRewards: string;
  adviceForStudent: string;
}

interface AiCareerAnalysisProps {
  careerTitle: string;
  careerId: string;
  categoryName: string;
  coreSubjects: string[];
  studentGrade: number;
}

export const AiCareerAnalysis: React.FC<AiCareerAnalysisProps> = ({
  careerTitle,
  careerId,
  categoryName,
  coreSubjects,
  studentGrade,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<AiCareerInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsOpen(true);
    if (insight) return; // Already loaded

    setIsLoading(true);
    setError(null);

    try {
      const freshConfig = loadAiConfig();
      const apiKey = getActiveApiKey(freshConfig);

      const res = await fetch('/api/ai/career-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerTitle,
          careerId,
          categoryName,
          coreSubjects,
          studentGrade,
          apiKey,
          provider: freshConfig.provider,
          model: freshConfig.selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Không thể phân tích nghề nghiệp. Vui lòng thử lại.');
      }

      const data = await res.json();
      setInsight(data);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAnalyze}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer print:hidden"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI phân tích chi tiết</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{careerTitle}</h3>
                  <p className="text-[11px] text-slate-500">Phân tích chuyên sâu bằng AI · {categoryName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">AI đang phân tích nghề "{careerTitle}"...</p>
                    <p className="text-xs text-slate-500 mt-1">Vui lòng đợi vài giây</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-5 text-center">
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setInsight(null); handleAnalyze(); }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {insight && (
                <div className="space-y-5">
                  {/* Overview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/60">
                    <h4 className="text-xs font-bold text-teal-900 flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      Tổng quan về nghề
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight.overview}</p>
                  </div>

                  {/* Daily Work */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-slate-600" />
                      Công việc hàng ngày
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{insight.dailyWork}</p>
                  </div>

                  {/* Skills & Salary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-violet-600" />
                        Kỹ năng cần thiết
                      </h4>
                      <ul className="space-y-1">
                        {insight.requiredSkills.map((skill, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Thu nhập & Triển vọng
                      </h4>
                      <p className="text-xs text-slate-700 mb-2">
                        <strong>Mức lương tham khảo:</strong> {insight.salaryRange}
                      </p>
                      <p className="text-xs text-slate-700">
                        <strong>Triển vọng:</strong> {insight.growthOutlook}
                      </p>
                    </div>
                  </div>

                  {/* Education Paths */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Lộ trình học tập
                    </h4>
                    <ul className="space-y-1.5">
                      {insight.educationPaths.map((path, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          <span>{path}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges & Rewards */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Thách thức & Phần thưởng
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{insight.challengesAndRewards}</p>
                  </div>

                  {/* Related Careers */}
                  {insight.relatedCareers.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Nghề nghiệp liên quan</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {insight.relatedCareers.map((rc, i) => (
                          <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                            {rc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advice */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/80 to-violet-50/60 border border-teal-200/60">
                    <h4 className="text-xs font-bold text-teal-900 flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      Lời khuyên dành cho em
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed italic">{insight.adviceForStudent}</p>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-[11px] text-slate-400 text-center py-2">
                    Thông tin do AI tổng hợp mang tính tham khảo. Em nên trao đổi thêm với thầy cô và chuyên gia trong ngành.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
