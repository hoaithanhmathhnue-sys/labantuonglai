import React from 'react';
import { ExperiencePreferences, InterestAnswer, StudentProfile, SubjectRecord } from '../types';
import { INTEREST_QUESTIONS } from '../data/questionnaire';
import { ArrowLeft, ArrowRight, CheckCircle2, Edit3, User, BookOpen, Heart, Sparkles, MapPin } from 'lucide-react';

interface StepReviewProps {
  profile: StudentProfile;
  subjects: SubjectRecord[];
  answers: InterestAnswer[];
  preferences: ExperiencePreferences;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const StepReview: React.FC<StepReviewProps> = ({
  profile,
  subjects,
  answers,
  preferences,
  onEditStep,
  onSubmit,
  isProcessing,
}) => {
  const scoredSubjects = subjects.filter(
    (s) => !s.isNotStudied && !s.isNoScoreYet && s.score !== undefined
  );
  const validAnswers = answers.filter((a) => typeof a.rating === 'number');
  const unexperiencedAnswers = answers.filter((a) => a.rating === 'unexperienced');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 uppercase tracking-wide">
          Bước 5: Xem lại câu trả lời
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
          Kiểm tra lại thông tin trước khi xử lý
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Em hãy rà soát lại thông tin bên dưới. Nếu cần điều chỉnh phần nào, chỉ cần bấm nút "Sửa" tương ứng.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Card 1: Profile Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <User className="w-4 h-4 text-teal-600" />
              <span>Hồ sơ cơ bản</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa hồ sơ</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Tên / Mã học sinh:</span>
              <strong className="text-slate-800 text-sm">{profile.nameOrCode || 'Chưa nhập'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Khối lớp:</span>
              <strong className="text-slate-800 text-sm">Lớp {profile.grade}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Năm tốt nghiệp dự kiến:</span>
              <strong className="text-slate-800 text-sm">Năm {profile.graduationYear}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Ngày sinh (hồ sơ):</span>
              <span className="text-slate-700">
                {profile.birthDate
                  ? new Date(profile.birthDate).toLocaleDateString('vi-VN')
                  : 'Không khai (tùy chọn)'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Academics Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Kết quả học tập các môn</span>
              <span className="text-xs font-normal text-slate-500">
                ({scoredSubjects.length} môn đã nhập điểm)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa môn học</span>
            </button>
          </div>

          {scoredSubjects.length === 0 ? (
            <p className="text-xs text-amber-700 italic">
              Em chưa nhập điểm cho môn học nào (đã chọn "Chưa có điểm" hoặc "Không học"). Hệ thống sẽ tập trung phân tích dựa trên mức độ yêu thích môn và sở thích hoạt động.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {scoredSubjects.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                  <div className="text-teal-700 font-bold mt-1">Điểm: {s.score}/10</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Thích: {s.interest}/5</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Interests Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>12 Câu hỏi sở thích hoạt động</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa sở thích</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 font-medium">
              Đã đánh giá thang điểm 1–5: <strong>{validAnswers.length} / 12</strong> câu
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium">
              Chọn "Chưa trải nghiệm": <strong>{unexperiencedAnswers.length}</strong> câu
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {INTEREST_QUESTIONS.slice(0, 4).map((q) => {
              const ans = answers.find((a) => a.questionId === q.id)?.rating;
              return (
                <div key={q.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 truncate max-w-xs sm:max-w-md">{q.id}. {q.text}</span>
                  <span className="font-semibold text-slate-800 shrink-0 ml-2">
                    {ans === 'unexperienced' ? 'Chưa trải nghiệm' : ans !== undefined ? `${ans}/5` : 'Chưa chọn'}
                  </span>
                </div>
              );
            })}
            <div className="text-center pt-1 text-[11px] text-slate-400">
              ...và 8 câu hỏi hoạt động khác đã được ghi nhận đầy đủ.
            </div>
          </div>
        </div>

        {/* Card 4: Preferences Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Trải nghiệm & Nguyện vọng</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa nguyện vọng</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Việc từng làm tốt / tự hào:</span>
              <p className="text-slate-800 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {preferences.proudAchievement?.trim() || 'Chưa ghi (tùy chọn)'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Lĩnh vực muốn tìm hiểu thử:</span>
              <p className="text-slate-800 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {preferences.fieldToTry?.trim() || 'Chưa ghi (tùy chọn)'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Khu vực muốn học tập:</span>
              <p className="text-slate-800">{preferences.preferredRegion || 'Toàn quốc'}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Khoảng học phí dự kiến:</span>
              <p className="text-slate-800">{preferences.tuitionBudgetRange || 'Bỏ qua / Chưa xác định'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <button
          onClick={() => onEditStep(5)}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại sửa câu trả lời</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={isProcessing}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          {isProcessing ? (
            <span>Đang xử lý dữ liệu khảo sát...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Xem kết quả định hướng</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
