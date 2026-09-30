import React from 'react';
import { ArrowRight, Compass, ShieldAlert, Sparkles, BookOpen, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface StepIntroProps {
  onStart: () => void;
}

export const StepIntro: React.FC<StepIntroProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
        <div className="flex items-center gap-3 text-teal-700 font-semibold text-sm mb-3">
          <div className="p-2 bg-teal-50 rounded-lg border border-teal-200">
            <Compass className="w-5 h-5" />
          </div>
          <span>Dành cho học sinh THPT (Lớp 10 – 12) & Thầy Cô</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-4">
          Cùng em khám phá sở thích, thấu hiểu việc học và mở lối tương lai
        </h2>

        <p className="text-slate-600 text-base leading-relaxed mb-6">
          <strong>La Bàn Tương Lai</strong> được thiết kế như một công cụ gợi mở sư phạm, giúp em tự nhìn lại những môn học mình đang học tốt, những hoạt động em thấy hứng thú, và kết nối với các nhóm ngành cùng cơ sở đào tạo có dữ liệu tuyển sinh chính thức tại Việt Nam.
        </p>

        {/* 4 Core Educational Commitments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Điểm số là một lát cắt hiện tại</h4>
              <p className="text-xs text-slate-600 leading-normal">
                Điểm chưa cao không có nghĩa là em thiếu tố chất; sự rèn luyện và phương pháp tự học sẽ mở rộng cơ hội cho em.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Bình đẳng các con đường học tập</h4>
              <p className="text-xs text-slate-600 leading-normal">
                Đại học, cao đẳng và đào tạo nghề thực hành đều có giá trị vững chắc, tùy thuộc vào mục tiêu và năng lực của từng học sinh.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Tài liệu đối thoại cùng người lớn</h4>
              <p className="text-xs text-slate-600 leading-normal">
                Báo cáo này là cơ sở để em chủ động trao đổi cùng thầy cô chủ nhiệm, giáo viên bộ môn và cha mẹ, chứ không phải kết luận bắt buộc.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Không bói toán, không gán nhãn</h4>
              <p className="text-xs text-slate-600 leading-normal">
                Tuyệt đối không sử dụng thần số học hay dự đoán tương lai huyền bí. Mọi gợi ý đều dựa trên dữ liệu em tự nguyện chia sẻ.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Age Terms Box */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-700 leading-relaxed mb-8 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-teal-900 block mb-1">
              Cam kết quyền riêng tư & Tuân thủ quy định:
            </span>
            Ứng dụng chỉ lưu thông tin trong bộ nhớ của phiên làm việc này, không lưu vĩnh viễn vào trình duyệt và không tự động gửi cho bên thứ ba. Nhằm bảo vệ an toàn cho học sinh THPT dưới 18 tuổi, toàn bộ khảo sát được vận hành bằng thuật toán phân tích quy tắc sư phạm minh bạch.
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onStart}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-base shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Bắt đầu khảo sát (khoảng 5–8 phút)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500">
            Em có thể chỉnh sửa lại bất kỳ câu trả lời nào trước khi xem kết quả.
          </span>
        </div>
      </div>
    </div>
  );
};
