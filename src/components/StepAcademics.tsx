import React, { useState } from 'react';
import { SubjectRecord } from '../types';
import { parseVietnameseScore } from '../engine/recommendationEngine';
import { ArrowLeft, ArrowRight, AlertCircle, BookOpen, Heart, HelpCircle, Plus } from 'lucide-react';

interface StepAcademicsProps {
  subjects: SubjectRecord[];
  onChange: (subjects: SubjectRecord[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepAcademics: React.FC<StepAcademicsProps> = ({
  subjects,
  onChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const handleScoreChange = (index: number, rawValue: string) => {
    const updated = [...subjects];
    updated[index].scoreInput = rawValue;

    if (rawValue.trim() === '') {
      updated[index].score = undefined;
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[updated[index].id];
        return copy;
      });
    } else {
      const parsed = parseVietnameseScore(rawValue);
      if (parsed === undefined) {
        setErrors((prev) => ({
          ...prev,
          [updated[index].id]: 'Điểm phải từ 0 đến 10 (dùng dấu phẩy hoặc chấm, ví dụ: 8,5 hoặc 8.5).',
        }));
        updated[index].score = undefined;
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[updated[index].id];
          return copy;
        });
        updated[index].score = parsed;
        updated[index].isNoScoreYet = false;
        updated[index].isNotStudied = false;
      }
    }
    onChange(updated);
  };

  const handleToggleNoScore = (index: number) => {
    const updated = [...subjects];
    const current = updated[index].isNoScoreYet;
    updated[index].isNoScoreYet = !current;
    if (!current) {
      updated[index].score = undefined;
      updated[index].scoreInput = '';
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[updated[index].id];
        return copy;
      });
    }
    onChange(updated);
  };

  const handleToggleNotStudied = (index: number) => {
    const updated = [...subjects];
    const current = updated[index].isNotStudied;
    updated[index].isNotStudied = !current;
    if (!current) {
      updated[index].score = undefined;
      updated[index].scoreInput = '';
      updated[index].isNoScoreYet = false;
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[updated[index].id];
        return copy;
      });
    }
    onChange(updated);
  };

  const handleInterestChange = (index: number, interest: number) => {
    const updated = [...subjects];
    updated[index].interest = interest;
    onChange(updated);
  };

  const handlePeriodChange = (index: number, period: string) => {
    const updated = [...subjects];
    updated[index].period = period;
    onChange(updated);
  };

  const handleScoreTypeChange = (index: number, scoreType: string) => {
    const updated = [...subjects];
    updated[index].scoreType = scoreType;
    onChange(updated);
  };

  const handleAddCustomSubject = () => {
    if (!customSubjectName.trim()) return;
    const newSubj: SubjectRecord = {
      id: `custom-${Date.now()}`,
      name: customSubjectName.trim(),
      period: 'Học kỳ gần nhất',
      scoreType: 'Điểm trung bình môn',
      interest: 3,
      isNotStudied: false,
      isNoScoreYet: false,
    };
    onChange([...subjects, newSubj]);
    setCustomSubjectName('');
    setShowAddCustom(false);
  };

  const handleNext = () => {
    if (Object.keys(errors).length > 0) return;
    onNext();
  };

  const studiedCount = subjects.filter((s) => !s.isNotStudied).length;
  const scoredCount = subjects.filter((s) => !s.isNotStudied && !s.isNoScoreYet && s.score !== undefined).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 uppercase tracking-wide">
              Bước 3: Học tập hiện tại
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Kết quả học tập & Mức độ yêu thích môn học
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Nhập điểm hiện tại (0–10) và mức thích học để phân biệt rõ giữa kết quả thi và hứng thú tìm hiểu.
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
            <span>Đang học: <strong>{studiedCount}</strong> môn</span>
            <span className="text-teal-700 font-semibold">Đã nhập điểm: <strong>{scoredCount}</strong> môn</span>
          </div>
        </div>

        {/* Guiding principle banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Lưu ý quan trọng:</strong> Không dùng số 0 đại diện cho dữ liệu thiếu! Nếu chưa có bài kiểm tra hoặc điểm tổng kết, em chỉ cần tick chọn <em>"Chưa có điểm"</em>. Nếu môn thuộc nhóm tự chọn mà em không theo học, tick <em>"Không học môn này"</em>.
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="space-y-4">
        {subjects.map((subj, index) => {
          const isError = Boolean(errors[subj.id]);
          const isDisabled = subj.isNotStudied;

          return (
            <div
              key={subj.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDisabled
                  ? 'bg-slate-100/60 border-slate-200 opacity-60'
                  : subj.score !== undefined
                  ? 'bg-white border-teal-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isDisabled ? 'bg-slate-200 text-slate-500' : 'bg-teal-50 text-teal-700'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {subj.name}
                    </h3>
                    {subj.score !== undefined && (
                      <span className="text-xs text-teal-700 font-semibold">
                        Điểm: {subj.score}/10 · {subj.scoreType}
                      </span>
                    )}
                  </div>
                </div>

                {/* State Toggles (Not studied / No score yet) */}
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={subj.isNoScoreYet}
                      onChange={() => handleToggleNoScore(index)}
                      disabled={subj.isNotStudied}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Chưa có điểm</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={subj.isNotStudied}
                      onChange={() => handleToggleNotStudied(index)}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span>Không học môn này</span>
                  </label>
                </div>
              </div>

              {!subj.isNotStudied && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  {/* Score Input Column */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Điểm số (0 – 10)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={subj.isNoScoreYet}
                      value={subj.scoreInput ?? (subj.score !== undefined ? subj.score.toString() : '')}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      placeholder={subj.isNoScoreYet ? 'Chưa có điểm' : 'Ví dụ: 8,5 hoặc 8.5'}
                      className={`w-full px-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                        subj.isNoScoreYet
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                          : isError
                          ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
                      }`}
                    />
                    {isError && (
                      <p className="flex items-start gap-1 text-[11px] text-rose-600 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{errors[subj.id]}</span>
                      </p>
                    )}
                  </div>

                  {/* Score Type & Period Column */}
                  <div className="sm:col-span-4 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kỳ học
                      </label>
                      <select
                        disabled={subj.isNoScoreYet}
                        value={subj.period}
                        onChange={(e) => handlePeriodChange(index, e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                      >
                        <option value="Học kỳ gần nhất">Học kỳ gần nhất</option>
                        <option value="Cả năm lớp trước">Cả năm trước</option>
                        <option value="Điểm thi học kỳ">Thi học kỳ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Loại điểm
                      </label>
                      <select
                        disabled={subj.isNoScoreYet}
                        value={subj.scoreType}
                        onChange={(e) => handleScoreTypeChange(index, e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                      >
                        <option value="Điểm trung bình môn">TB Môn</option>
                        <option value="Điểm kiểm tra định kỳ">Định kỳ</option>
                        <option value="Điểm thi thử THPT">Thi thử</option>
                        <option value="Điểm tự đánh giá">Tự ước lượng</option>
                      </select>
                    </div>
                  </div>

                  {/* Interest Level 1-5 Column */}
                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        Mức thích học môn này:
                      </label>
                      <span className="text-xs font-bold text-teal-800">
                        {subj.interest}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isChosen = subj.interest === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleInterestChange(index, lvl)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              isChosen
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200/70'
                            }`}
                            title={`Mức ${lvl}: ${
                              lvl === 1
                                ? 'Rất không thích'
                                : lvl === 2
                                ? 'Không thích'
                                : lvl === 3
                                ? 'Bình thường'
                                : lvl === 4
                                ? 'Thích'
                                : 'Rất thích'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                      <span>1: Ngại học</span>
                      <span>5: Rất thích</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Subject Button */}
      <div className="mt-4">
        {showAddCustom ? (
          <div className="p-4 bg-white rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={customSubjectName}
              onChange={(e) => setCustomSubjectName(e.target.value)}
              placeholder="Nhập tên môn học khác (ví dụ: Tiếng Pháp, Âm nhạc, Mỹ thuật...)"
              className="w-full sm:flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-teal-600"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAddCustomSubject}
                className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 cursor-pointer"
              >
                Thêm môn
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm môn học tự chọn khác</span>
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <button
          onClick={handleNext}
          disabled={Object.keys(errors).length > 0}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Tiếp tục: Sở thích & Trải nghiệm</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
