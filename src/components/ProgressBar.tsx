import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onJumpToStep: (step: number) => void;
  maxVisitedStep: number;
}

const STEP_LABELS = [
  'Giới thiệu',
  'Hồ sơ tối giản',
  'Khám phá bản thân',
  'Học tập hiện tại',
  'Sở thích & Trải nghiệm',
  'Xem lại thông tin',
  'Kết quả định hướng',
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  onJumpToStep,
  maxVisitedStep,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 px-4 sm:px-6 print:hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Bước {currentStep} / {totalSteps}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {STEP_LABELS[currentStep - 1]}
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Ước tính: ~5–8 phút
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className={`h-full flex-1 transition-all duration-300 ${
                  index !== 0 ? 'border-l border-white' : ''
                } ${
                  isCompleted
                    ? 'bg-teal-600'
                    : isCurrent
                    ? 'bg-teal-400'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Desktop Step Nav pills */}
        <div className="hidden md:flex justify-between items-center mt-2.5">
          {STEP_LABELS.map((label, index) => {
            const stepNum = index + 1;
            const isAccessible = stepNum <= maxVisitedStep;
            const isCurrent = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <button
                key={label}
                type="button"
                disabled={!isAccessible}
                onClick={() => onJumpToStep(stepNum)}
                className={`flex items-center gap-1.5 text-xs transition-colors py-1 px-1.5 rounded ${
                  isCurrent
                    ? 'font-bold text-teal-700'
                    : isCompleted
                    ? 'text-slate-600 hover:text-teal-700 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                      ? 'bg-teal-100 text-teal-800 border border-teal-400'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepNum}
                </span>
                <span className="truncate max-w-[110px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
