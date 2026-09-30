import React, { useState } from 'react';
import { GradeLevel, StudentProfile } from '../types';
import { ArrowLeft, ArrowRight, Info, AlertCircle } from 'lucide-react';

interface StepProfileProps {
  profile: StudentProfile;
  onChange: (updated: Partial<StudentProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepProfile: React.FC<StepProfileProps> = ({
  profile,
  onChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.nameOrCode.trim()) {
      newErrors.nameOrCode = 'Vui lòng nhập tên gọi hoặc mã học sinh để tiện xưng hô.';
    }

    if (profile.birthDate) {
      const birth = new Date(profile.birthDate);
      const now = new Date();
      if (isNaN(birth.getTime())) {
        newErrors.birthDate = 'Ngày sinh không hợp lệ.';
      } else if (birth > now) {
        newErrors.birthDate = 'Ngày sinh không thể là một ngày trong tương lai.';
      } else {
        const age = now.getFullYear() - birth.getFullYear();
        if (age < 12 || age > 30) {
          newErrors.birthDate = 'Vui lòng kiểm tra lại năm sinh phù hợp với lứa tuổi học sinh THPT.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleGradeChange = (grade: GradeLevel) => {
    // Current year: 2026. Lớp 12 -> tốt nghiệp 2026, Lớp 11 -> 2027, Lớp 10 -> 2028
    const currentYear = new Date().getFullYear();
    const gradYear = currentYear + (12 - grade);
    onChange({ grade, graduationYear: gradYear });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 uppercase tracking-wide">
            Bước 2: Thông tin hồ sơ cơ bản
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Hồ sơ tối giản & Xưng hô
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Chỉ thu thập thông tin tối thiểu cần thiết để cá nhân hóa báo cáo của em.
          </p>
        </div>

        <div className="space-y-6">
          {/* Field 1: Name or Student Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Tên gọi hoặc Mã học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={profile.nameOrCode}
              onChange={(e) => {
                onChange({ nameOrCode: e.target.value });
                if (errors.nameOrCode) setErrors((prev) => ({ ...prev, nameOrCode: '' }));
              }}
              placeholder="Ví dụ: Hoàng An, Minh Thư, hoặc HS-11A3"
              maxLength={40}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.nameOrCode
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
              }`}
            />
            {errors.nameOrCode ? (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.nameOrCode}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Chỉ dùng để hiển thị trên bản in/báo cáo; không gửi sang mô-đun phân tích năng lực.
              </p>
            )}
          </div>

          {/* Field 2: Grade Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Khối lớp hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([10, 11, 12] as GradeLevel[]).map((g) => {
                const isSelected = profile.grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGradeChange(g)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Lớp {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Expected Graduation Year */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Năm dự kiến tốt nghiệp THPT
            </label>
            <select
              value={profile.graduationYear}
              onChange={(e) => onChange({ graduationYear: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              {[2026, 2027, 2028, 2029].map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>

          {/* Field 4: Optional BirthDate with Explicit Guardrail */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Ngày sinh (Tùy chọn)
              </label>
              <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Không bắt buộc
              </span>
            </div>
            <input
              type="date"
              value={profile.birthDate || ''}
              onChange={(e) => {
                onChange({ birthDate: e.target.value });
                if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: '' }));
              }}
              className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.birthDate
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
              }`}
            />
            {errors.birthDate ? (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.birthDate}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <strong>Lưu ý:</strong> Ngày sinh chỉ phục vụ hồ sơ độ tuổi, hoàn toàn <strong>không</strong> dùng để suy luận tính cách, tử vi hay cơ hội nghề nghiệp. Em có thể bỏ trống nếu muốn.
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
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
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <span>Tiếp tục: Học tập hiện tại</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
