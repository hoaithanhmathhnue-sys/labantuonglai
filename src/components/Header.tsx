import React from 'react';
import { Compass, Printer, RotateCcw, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  onResetSession: () => void;
  onOpenTeacherAdmin: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onResetSession,
  onOpenTeacherAdmin,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              La Bàn Tương Lai
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              Định hướng học tập & nghề nghiệp THPT
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Bảo mật phiên · Không lưu danh tính
          </span>
          <span aria-hidden="true">·</span>
          <span>Khảo sát định hướng ~5–8 phút</span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {currentStep === 6 && (
            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors print:hidden"
              title="In hoặc lưu kết quả ra tệp PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In / Lưu PDF</span>
            </button>
          )}

          <button
            onClick={onOpenTeacherAdmin}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            title="Dành cho Giáo viên quản lý kho tuyển sinh và kiểm thử"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Góc Giáo viên</span>
            <span className="sm:hidden">Giáo viên</span>
          </button>

          {currentStep > 1 && (
            <button
              onClick={onResetSession}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Xóa phiên làm việc hiện tại và làm lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xóa phiên</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
