import React from 'react';
import { AnswerRating, DegreeLevelPreference, ExperiencePreferences, InterestAnswer, RelocationWillingness } from '../types';
import { INTEREST_CATEGORIES, INTEREST_QUESTIONS } from '../data/questionnaire';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles, MapPin, GraduationCap, DollarSign, Heart } from 'lucide-react';

interface StepInterestsProps {
  answers: InterestAnswer[];
  preferences: ExperiencePreferences;
  onAnswerChange: (questionId: string, rating: AnswerRating) => void;
  onPreferencesChange: (updated: Partial<ExperiencePreferences>) => void;
  onNext: () => void;
  onBack: () => void;
}

const RATING_OPTIONS: { value: AnswerRating; label: string; desc: string }[] = [
  { value: 1, label: '1', desc: 'Rất không thích' },
  { value: 2, label: '2', desc: 'Không thích' },
  { value: 3, label: '3', desc: 'Bình thường' },
  { value: 4, label: '4', desc: 'Thích' },
  { value: 5, label: '5', desc: 'Rất thích' },
  { value: 'unexperienced', label: 'Chưa trải nghiệm', desc: 'Chưa từng làm việc này' },
];

export const StepInterests: React.FC<StepInterestsProps> = ({
  answers,
  preferences,
  onAnswerChange,
  onPreferencesChange,
  onNext,
  onBack,
}) => {
  const getAnswer = (id: string): AnswerRating | undefined => {
    return answers.find((a) => a.questionId === id)?.rating;
  };

  const answeredCount = answers.filter((a) => a.rating !== undefined).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 uppercase tracking-wide">
              Bước 4: Sở thích & Trải nghiệm
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Khám phá sở thích qua 12 hoạt động thực tế
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Hãy đánh giá theo cảm nhận tự nhiên của bản thân khi hình dung mình tham gia từng hoạt động.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
            <span>Tiến độ câu hỏi:</span>
            <span className="font-bold text-teal-700 text-sm">
              {answeredCount} / 12
            </span>
          </div>
        </div>

        {/* Explain Unexperienced Option */}
        <div className="mt-4 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <strong>Lựa chọn "Chưa trải nghiệm":</strong> Nếu em chưa từng làm qua hoạt động đó, hãy chọn <em>"Chưa trải nghiệm"</em>. Hệ thống sẽ loại câu đó ra khỏi mẫu số để tính trung bình công bằng, <strong>không</strong> tính là 0 điểm.
          </div>
        </div>
      </div>

      {/* 12 Interest Questions List */}
      <div className="space-y-4 mb-8">
        {INTEREST_QUESTIONS.map((q, idx) => {
          const currentRating = getAnswer(q.id);
          const categoryMeta = INTEREST_CATEGORIES[q.category];

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                currentRating !== undefined
                  ? 'bg-white border-teal-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {q.text}
                    </p>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Nhóm: {categoryMeta.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = currentRating === opt.value;
                  const isUnexperienced = opt.value === 'unexperienced';

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => onAnswerChange(q.id, opt.value)}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[52px] ${
                        isSelected
                          ? isUnexperienced
                            ? 'bg-slate-700 border-slate-700 text-white font-semibold shadow-xs'
                            : 'bg-teal-600 border-teal-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold leading-none mb-1">
                        {opt.label}
                      </span>
                      <span
                        className={`text-[10px] leading-tight ${
                          isSelected ? 'text-white/90' : 'text-slate-500'
                        }`}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Experience & Practical Preferences Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Trải nghiệm cá nhân & Mong muốn học tập (Tùy chọn)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Các thông tin dưới đây giúp hệ thống gợi ý trường và hoạt động trải nghiệm sát thực tế hơn. Em có thể bỏ qua nếu chưa xác định.
        </p>

        <div className="space-y-6">
          {/* Proud Achievement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Một hoạt động hoặc việc từng làm tốt khiến em thấy tự hào nhất:
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={preferences.proudAchievement || ''}
              onChange={(e) => onPreferencesChange({ proudAchievement: e.target.value })}
              placeholder="Ví dụ: Từng đứng ra dẫn chương trình hội trại của trường; hoặc từng tự mày mò sửa được một chiếc đèn bàn hỏng..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            <span className="text-[11px] text-slate-400 block text-right mt-0.5">
              {preferences.proudAchievement?.length || 0}/500 ký tự (Không nhập thông tin riêng tư)
            </span>
          </div>

          {/* Field to Try & Disliked Tasks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lĩnh vực hoặc ngành nghề em đang tò mò muốn thử sức:
              </label>
              <input
                type="text"
                maxLength={200}
                value={preferences.fieldToTry || ''}
                onChange={(e) => onPreferencesChange({ fieldToTry: e.target.value })}
                placeholder="Ví dụ: Công nghệ vi mạch, Thiết kế game, Bác sĩ tâm lý..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kiểu công việc hoặc môi trường em thấy không thích:
              </label>
              <input
                type="text"
                maxLength={200}
                value={preferences.dislikedTasks || ''}
                onChange={(e) => onPreferencesChange({ dislikedTasks: e.target.value })}
                placeholder="Ví dụ: Không thích ngồi một chỗ cả ngày, sợ máu..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Region & Relocation & Degree & Tuition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            {/* Preferred Region */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Khu vực muốn học:
              </label>
              <select
                value={preferences.preferredRegion || 'Toàn quốc'}
                onChange={(e) => onPreferencesChange({ preferredRegion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="Toàn quốc">Toàn quốc / Chưa giới hạn</option>
                <option value="Miền Bắc">Miền Bắc (Hà Nội, lân cận)</option>
                <option value="Miền Trung">Miền Trung (Đà Nẵng, Huế...)</option>
                <option value="Miền Nam">Miền Nam (TP.HCM, Cần Thơ...)</option>
              </select>
            </div>

            {/* Willingness to Relocate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sẵn sàng học xa nhà:
              </label>
              <select
                value={preferences.willingToRelocate || 'consider'}
                onChange={(e) => onPreferencesChange({ willingToRelocate: e.target.value as RelocationWillingness })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="consider">Cần cân nhắc thêm</option>
                <option value="yes">Sẵn sàng đi học xa</option>
                <option value="no">Ưu tiên học gần nhà</option>
              </select>
            </div>

            {/* Desired Degree Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                Bậc học dự kiến:
              </label>
              <select
                value={preferences.desiredDegree || 'all'}
                onChange={(e) => onPreferencesChange({ desiredDegree: e.target.value as DegreeLevelPreference })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="all">Tất cả các bậc học</option>
                <option value="university">Đại học (4–6 năm)</option>
                <option value="college">Cao đẳng thực hành (2.5–3 năm)</option>
                <option value="vocational">Đào tạo nghề chuyên sâu (1–2 năm)</option>
              </select>
            </div>

            {/* Tuition Budget Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                Khoảng học phí dự kiến:
              </label>
              <select
                value={preferences.tuitionBudgetRange || 'Bỏ qua'}
                onChange={(e) => onPreferencesChange({ tuitionBudgetRange: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="Bỏ qua">Bỏ qua / Chưa xác định</option>
                <option value="Dưới 15 triệu/năm">Dưới 15 triệu/năm (trường công lập chuẩn)</option>
                <option value="15 - 30 triệu/năm">15 – 30 triệu/năm</option>
                <option value="Trên 30 triệu/năm">Trên 30 triệu/năm (tự chủ / quốc tế)</option>
                <option value="Cần học bổng/chính sách hỗ trợ">Cần học bổng / hỗ trợ chi phí</option>
              </select>
            </div>
          </div>
        </div>
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
          onClick={onNext}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Tiếp tục: Xem lại câu trả lời</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
