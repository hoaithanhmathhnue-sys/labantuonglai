import React, { useState } from 'react';
import { AnalysisResult, CareerSuggestion } from '../types';
import {
  Printer,
  RotateCcw,
  Edit3,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Scale,
  Key,
} from 'lucide-react';
import { AiCareerAnalysis } from './AiCareerAnalysis';
import { AiSchoolSearch } from './AiSchoolSearch';

interface StepResultsProps {
  result: AnalysisResult;
  onEdit: () => void;
  onReset: () => void;
  aiEnabled?: boolean;
  studentGrade?: number;
  onOpenAiSettings?: () => void;
}

export const StepResults: React.FC<StepResultsProps> = ({
  result,
  onEdit,
  onReset,
  aiEnabled = false,
  studentGrade = 11,
  onOpenAiSettings,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<CareerSuggestion[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const toggleCompare = (career: CareerSuggestion) => {
    if (selectedForCompare.some((c) => c.careerId === career.careerId)) {
      setSelectedForCompare((prev) => prev.filter((c) => c.careerId !== career.careerId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('Em chỉ có thể chọn so sánh tối đa 3 nghề cùng một lúc.');
        return;
      }
      setSelectedForCompare((prev) => [...prev, career]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 print-page">
      {/* Top Banner & Control Bar (No Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            {result.mode === 'verified_ai' ? 'Chế độ Trợ lý Giáo dục AI' : 'Chế độ Phân tích Quy tắc Sư phạm'}
          </span>
          <span className="text-xs text-slate-500">
            Ngày lập: {result.analyzedAt}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>So sánh ({selectedForCompare.length}/3)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In / Lưu PDF</span>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Sửa thông tin</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm lại</span>
          </button>
        </div>
      </div>

      {/* Main Official Header for Report / Print */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase block mb-1">
              Bản báo cáo định hướng học tập & nghề nghiệp
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              La Bàn Tương Lai — Dành cho {result.studentDisplayLabel}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tài liệu tham khảo chuyên môn phục vụ trao đổi hướng nghiệp giữa học sinh, giáo viên và gia đình.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0 text-xs text-slate-500 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div>Ngày lập: <strong>{result.analyzedAt}</strong></div>
            <div className="text-[11px] text-teal-800 font-semibold mt-0.5">Không lưu dữ liệu ngoài phiên</div>
          </div>
        </div>

        {/* Mandatory Guardrail Notice */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-slate-700 leading-relaxed mb-6 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-teal-900 block mb-0.5">
              Gợi ý tham khảo dựa trên thông tin em cung cấp
            </span>
            Bảng hỏi này là công cụ gợi mở tự thiết kế, <strong>không</strong> phải bài trắc nghiệm tâm lý hay năng lực chuẩn hóa. Kết quả không có phần trăm xác suất đỗ đại học hay bảo đảm thành công. Mọi quyết định học tập cần được thảo luận kỹ lưỡng với thầy cô và phụ huynh.
          </div>
        </div>

        {/* Summary Narrative */}
        <div className="prose prose-slate max-w-none">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Tóm tắt định hướng tổng thể
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100">
            {result.summary}
          </p>
        </div>

        {/* Data Audit Tags */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Dữ liệu đã dùng:</span>
          {result.dataAudit.usedInputs.map((item, idx) => (
            <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[11px]">
              {item}
            </span>
          ))}
          {result.dataAudit.missingInputs.length > 0 && (
            <span className="text-amber-700 italic text-[11px] ml-1">
              (Dữ liệu còn thiếu: {result.dataAudit.missingInputs.join('; ')})
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: INTEREST PROFILE BAR CHART */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Mức độ quan tâm tự khai qua các nhóm hoạt động
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thang điểm 1 (Rất không thích) đến 5 (Rất thích). Không tính "Chưa trải nghiệm" là 0 điểm.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Thang điểm 1 – 5
          </span>
        </div>

        <div className="space-y-4 my-6">
          {result.interestScores.map((cat) => {
            const hasScore = cat.average !== null;
            const scoreValue = cat.average || 0;
            const percentage = hasScore ? (scoreValue / 5) * 100 : 0;
            const isExpanded = expandedCategory === cat.category;

            return (
              <div key={cat.category} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-800 bg-teal-100/60 px-1.5 py-0.5 rounded text-xs">
                      {cat.category}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {cat.categoryName}
                    </span>
                    {cat.status === 'low_data' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Dữ liệu ít (1 câu)
                      </span>
                    )}
                    {cat.status === 'insufficient' && (
                      <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                        Chưa đủ dữ liệu
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">
                      {hasScore ? `${scoreValue.toFixed(1)} / 5.0` : '— / 5.0'}
                    </span>
                    {cat.contributingAnswers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                        className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-0.5 cursor-pointer print:hidden"
                      >
                        <span>{isExpanded ? 'Đóng' : 'Xem câu hỏi'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scoreValue >= 4.0
                        ? 'bg-teal-600'
                        : scoreValue >= 3.0
                        ? 'bg-teal-400'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Accordion of contributing questions */}
                {isExpanded && cat.contributingAnswers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-lg">
                    <span className="font-semibold text-slate-800 block text-[11px] mb-1">
                      Các câu trả lời làm căn cứ cho điểm số này:
                    </span>
                    {cat.contributingAnswers.map((ca) => (
                      <div key={ca.questionId} className="flex items-start justify-between gap-2">
                        <span><strong>{ca.questionId}:</strong> {ca.text}</span>
                        <span className="font-bold text-teal-800 shrink-0">{ca.rating}/5</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACADEMIC STRENGTHS & AREAS TO DEVELOP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          Bức tranh học tập hiện tại: Thế mạnh & Hướng rèn luyện
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Phân biệt rạch ròi giữa kết quả điểm số môn học và mức độ yêu thích tự thân.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Strengths */}
          <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80">
            <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              Điểm tựa học thuật hiện tại ({result.learningStrengths.length})
            </h3>
            {result.learningStrengths.length === 0 ? (
              <p className="text-xs text-slate-600 italic">
                Chưa có môn học nào đạt từ 8.0 điểm trở lên trong số môn đã nhập. Em có thể tiếp tục phát huy năng lực ở các môn đang thích học.
              </p>
            ) : (
              <div className="space-y-3">
                {result.learningStrengths.map((s) => (
                  <div key={s.subject} className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{s.subject}</span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Điểm: {s.score}/10
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mt-1">
                      {s.insight}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column B: Development Areas */}
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Hướng rèn luyện & củng cố ({result.developmentAreas.length})
            </h3>
            {result.developmentAreas.length === 0 ? (
              <p className="text-xs text-slate-600 italic">
                Các môn học đã nhập đều duy trì phong độ ổn định. Em hãy tiếp tục giữ vững phương pháp học tập hiện tại.
              </p>
            ) : (
              <div className="space-y-3">
                {result.developmentAreas.map((d) => (
                  <div key={d.subject} className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{d.subject}</span>
                      {d.score !== undefined && (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Điểm: {d.score}/10
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium">{d.reason}</p>
                    <p className="text-slate-500 mt-1 leading-relaxed border-t border-slate-100 pt-1.5">
                      💡 <strong>Gợi ý:</strong> {d.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: 3-5 CAREER SUGGESTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              Các nhóm nghề nghiệp đáng tìm hiểu & trải nghiệm
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi gợi ý đều có lý do từ câu trả lời cụ thể, kèm thử thách nhỏ 1–2 tuần để em tự kiểm chứng.
            </p>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Gợi ý 3 – 4 hướng mở
          </span>
        </div>

        <div className="space-y-6">
          {result.careerSuggestions.map((career, idx) => {
            const isCompared = selectedForCompare.some((c) => c.careerId === career.careerId);

            return (
              <div
                key={career.careerId}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {career.categoryName}
                      </span>
                      <span className="text-xs text-slate-500">
                        · Bậc học: {career.matchedDegreeLevels.join(', ')}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {career.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCompare(career)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 print:hidden ${
                      isCompared
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Đã chọn so sánh' : 'Chọn so sánh'}</span>
                  </button>

                  {aiEnabled && (
                    <AiCareerAnalysis
                      careerTitle={career.title}
                      careerId={career.careerId}
                      categoryName={career.categoryName}
                      coreSubjects={career.coreSubjects}
                      studentGrade={studentGrade}
                    />
                  )}
                </div>

                {/* Evidence & Reasons */}
                <div className="my-3 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Căn cứ từ câu trả lời của em:
                  </span>
                  {career.reasons.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                  {career.evidenceIds.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                      Mã bằng chứng: {career.evidenceIds.join(' · ')}
                    </div>
                  )}
                </div>

                {/* 1-2 Week Trial Activity */}
                <div className="my-3 p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/70 text-xs">
                  <span className="font-bold text-teal-900 block mb-1">
                    Hoạt động trải nghiệm thử trong 1–2 tuần:
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {career.trialActivity}
                  </p>
                </div>

                {/* Core subjects & Uncertainties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">
                      Môn học THPT trọng tâm:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {career.coreSubjects.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block mb-1">
                      Điều cần tìm hiểu thêm & băn khoăn:
                    </span>
                    <span className="text-slate-700 italic">
                      {career.uncertainties.join('; ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: VERIFIED ADMISSION PROGRAMS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Cơ sở đào tạo & Ngành học có dữ liệu xác minh
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu trích từ đề án tuyển sinh chính thức do giáo viên kiểm duyệt. Không bịa điểm chuẩn hay khoa viện.
            </p>
          </div>
          {aiEnabled && <AiSchoolSearch onOpenAiSettings={onOpenAiSettings} />}
        </div>

        {/* Disclaimer about benchmark score comparability */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4">
          ⚠️ <strong>Lưu ý đối chiếu:</strong> Điểm học tập hiện tại của em <em>không</em> tự động quy đổi thành điểm thi tốt nghiệp THPT hay điểm thi đánh giá năng lực. Điểm chuẩn dưới đây dùng để em tham khảo mặt bằng yêu cầu của các năm trước.
        </div>

        {result.programSuggestions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Hiện chưa có bản ghi tuyển sinh nào khớp với khu vực hoặc bậc học em chọn trong kho dữ liệu đã xác minh. Giáo viên có thể bổ sung thêm trong mục "Góc Giáo viên".
          </div>
        ) : (
          <div className="space-y-4">
            {result.programSuggestions.map(({ program, matchReason, missingDataNote }) => (
              <div
                key={program.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                        {program.degreeLevel} · {program.region}
                      </span>
                      {program.majorCode && (
                        <span className="text-slate-400">Mã ngành: {program.majorCode}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {program.majorName} — {program.schoolName}
                    </h3>
                    {program.faculty && (
                      <span className="text-slate-600 block mt-0.5">
                        Khoa / Viện: {program.faculty}
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    {program.benchmarkScore ? (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Điểm chuẩn tham khảo:</span>
                        <strong className="text-base font-bold text-teal-700">
                          {program.benchmarkScore}
                        </strong>
                        <span className="text-slate-500 text-[11px]"> / {program.scoreScale || 30}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Xét tuyển hồ sơ / Không thi
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phương thức xét tuyển ({program.admissionYear}):</span>
                    <span className="font-medium">{program.admissionMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Điều kiện & Tổ hợp xét tuyển:</span>
                    <span className="font-medium">{program.requirementSummary}</span>
                  </div>
                </div>

                {program.tuitionInfo && (
                  <div className="mb-2 text-slate-600">
                    <span className="text-slate-400">Học phí tham khảo: </span>
                    <span>{program.tuitionInfo}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Nguồn xác minh: <strong>{program.verifiedBy}</strong></span>
                    <span>·</span>
                    <span>Ngày KT: {program.verifiedDate}</span>
                  </div>

                  {program.sourceUrl && (
                    <a
                      href={program.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold"
                    >
                      <span>Cổng thông tin tuyển sinh trường</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: FOUR-WEEK EXPLORATION PLAN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Kế hoạch 4 tuần trải nghiệm với những việc nhỏ, khả thi
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Định hướng không nên dừng ở suy nghĩ; hãy biến thành từng hành động nhỏ mỗi tuần.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.fourWeekPlan.map((step) => (
            <div key={step.week} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
              <span className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded text-[11px] block w-fit mb-1.5">
                {step.title}
              </span>
              <p className="text-slate-800 font-semibold mb-1.5 leading-snug">
                {step.action}
              </p>
              <div className="text-slate-600 border-t border-slate-200/70 pt-1.5">
                <span className="font-medium text-slate-700">Kết quả mong đợi: </span>
                {step.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: THREE DISCUSSION QUESTIONS FOR TEACHER & PARENT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs print-break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          3 Câu hỏi gợi mở để em trao đổi với Thầy Cô & Gia đình
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Hãy chủ động mở lời với thầy cô chủ nhiệm hoặc cha mẹ bằng những câu hỏi trọng tâm sau:
        </p>

        <div className="space-y-3">
          {result.questionsForDiscussion.map((q, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/60 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed"
            >
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: ETHICAL GUARDRAILS & LIMITATIONS */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2 mb-8">
        <span className="font-bold text-slate-800 block text-xs">
          Giới hạn trách nhiệm & Nguyên tắc đạo đức nghề nghiệp:
        </span>
        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          {result.limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>

      {/* AI ACTIVATION CTA (when not configured) */}
      {!aiEnabled && onOpenAiSettings && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200/60 mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Kích hoạt AI để trải nghiệm đầy đủ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập Gemini API Key (miễn phí) để mở khóa: <strong>phân tích chuyên sâu nghề nghiệp</strong>, <strong>tra cứu thông tin trường & ngành</strong>, và <strong>tư vấn cá nhân hóa</strong> bằng AI.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <Key className="w-4 h-4" />
              <span>Cài đặt API Key</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer (No Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
        <button
          onClick={onEdit}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Sửa câu trả lời và tính toán lại</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  So sánh các hướng nghề nghiệp đã chọn ({selectedForCompare.length}/3)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {selectedForCompare.map((c) => (
                <div key={c.careerId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {c.categoryName}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5 mb-2">
                      {c.title}
                    </h4>

                    <div className="space-y-2 mb-3">
                      <div>
                        <span className="text-slate-500 font-medium block">Môn trọng tâm:</span>
                        <span className="font-semibold text-slate-800">{c.coreSubjects.join(', ')}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">Bậc đào tạo:</span>
                        <span className="text-slate-700">{c.matchedDegreeLevels.join(', ')}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">Thử thách 1–2 tuần:</span>
                        <p className="text-slate-700 italic text-[11px] leading-relaxed">{c.trialActivity}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">Băn khoăn:</span>
                        <p className="text-slate-600 text-[11px]">{c.uncertainties.join('; ')}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCompare(c)}
                    className="w-full mt-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-semibold border border-rose-200 cursor-pointer"
                  >
                    Bỏ khỏi so sánh
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Đóng bảng so sánh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
