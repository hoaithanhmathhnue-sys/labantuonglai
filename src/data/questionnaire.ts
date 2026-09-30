import { InterestCategoryMeta, InterestQuestion, SubjectRecord } from '../types';

export const INTEREST_CATEGORIES: Record<string, InterestCategoryMeta> = {
  R: {
    code: 'R',
    name: 'Thực hành & Kỹ thuật',
    shortDescription: 'Lắp ráp, thao tác với công cụ, máy móc, vật liệu và hoạt động ngoài trời.',
    focusKeywords: ['Kỹ thuật', 'Cơ khí', 'Điện - Điện tử', 'Nông lâm nghiệp', 'Xây dựng'],
  },
  I: {
    code: 'I',
    name: 'Tìm hiểu & Phân tích',
    shortDescription: 'Tìm tòi quy luật, nghiên cứu hiện tượng, giải quyết bài toán và phân tích dữ liệu.',
    focusKeywords: ['Khoa học tự nhiên', 'Dữ liệu', 'Y dược', 'Toán ứng dụng', 'Nghiên cứu'],
  },
  A: {
    code: 'A',
    name: 'Sáng tạo & Nghệ thuật',
    shortDescription: 'Sáng tác, viết lách, hội họa, thiết kế hình ảnh, âm nhạc và giải pháp đổi mới.',
    focusKeywords: ['Thiết kế đồ họa', 'Truyền thông', 'Kiến trúc', 'Nội dung số', 'Văn học - Nghệ thuật'],
  },
  S: {
    code: 'S',
    name: 'Hỗ trợ con người & Xã hội',
    shortDescription: 'Chia sẻ kiến thức, lắng nghe, chăm sóc sức khỏe, hoạt động cộng đồng.',
    focusKeywords: ['Sư phạm', 'Tâm lý', 'Y tế cộng đồng', 'Công tác xã hội', 'Dịch vụ con người'],
  },
  E: {
    code: 'E',
    name: 'Tổ chức & Thuyết phục',
    shortDescription: 'Đề xuất ý tưởng, thuyết phục đội nhóm, khởi xướng hoạt động và kinh doanh.',
    focusKeywords: ['Quản trị kinh doanh', 'Marketing', 'Luật', 'Quản lý dự án', 'Bán hàng'],
  },
  C: {
    code: 'C',
    name: 'Hệ thống & Chi tiết',
    shortDescription: 'Sắp xếp dữ liệu, lập lịch trình, lưu trữ hồ sơ và vận hành chuẩn mực theo quy trình.',
    focusKeywords: ['Kế toán - Tài chính', 'Hành chính', 'Kiểm toán', 'Quản trị dữ liệu', 'Hậu cần Logistics'],
  },
};

/**
 * 12 CÂU HỎI SỞ THÍCH HOẠT ĐỘNG CHUẨN XÁC THEO YÊU CẦU ĐẶC TẢ
 * Thang trả lời: 1 Rất không thích; 2 Không thích; 3 Bình thường; 4 Thích; 5 Rất thích; 'unexperienced' Chưa trải nghiệm
 */
export const INTEREST_QUESTIONS: InterestQuestion[] = [
  {
    id: 'R1',
    category: 'R',
    text: 'Em thích lắp ráp, sửa chữa hoặc làm ra một đồ vật hữu ích.',
  },
  {
    id: 'R2',
    category: 'R',
    text: 'Em thích thực hành với dụng cụ, thiết bị hoặc hoạt động ngoài trời.',
  },
  {
    id: 'I1',
    category: 'I',
    text: 'Em thích tìm nguyên nhân của một hiện tượng hoặc bài toán.',
  },
  {
    id: 'I2',
    category: 'I',
    text: 'Em thích đọc, thử nghiệm và phân tích dữ liệu để tìm câu trả lời.',
  },
  {
    id: 'A1',
    category: 'A',
    text: 'Em thích viết, vẽ, làm nhạc hoặc thiết kế nội dung.',
  },
  {
    id: 'A2',
    category: 'A',
    text: 'Em thích nghĩ ra cách thể hiện mới cho một ý tưởng.',
  },
  {
    id: 'S1',
    category: 'S',
    text: 'Em thích giải thích bài học hoặc giúp người khác hiểu vấn đề.',
  },
  {
    id: 'S2',
    category: 'S',
    text: 'Em thích lắng nghe và tham gia hoạt động hỗ trợ cộng đồng.',
  },
  {
    id: 'E1',
    category: 'E',
    text: 'Em thích đề xuất ý tưởng và thuyết phục nhóm cùng thực hiện.',
  },
  {
    id: 'E2',
    category: 'E',
    text: 'Em thích tổ chức hoạt động hoặc thử bán một sản phẩm tự làm.',
  },
  {
    id: 'C1',
    category: 'C',
    text: 'Em thích sắp xếp thông tin, lịch trình hoặc hồ sơ rõ ràng.',
  },
  {
    id: 'C2',
    category: 'C',
    text: 'Em thích kiểm tra chi tiết và thực hiện công việc theo quy trình.',
  },
];

export const INITIAL_SUBJECTS: Omit<SubjectRecord, 'score' | 'scoreInput' | 'isNotStudied' | 'isNoScoreYet' | 'interest'>[] = [
  { id: 'math', name: 'Toán học', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'literature', name: 'Ngữ văn', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'english', name: 'Tiếng Anh', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'physics', name: 'Vật lí', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'chemistry', name: 'Hóa học', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'biology', name: 'Sinh học', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'history', name: 'Lịch sử', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'geography', name: 'Địa lí', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'civics', name: 'GD Kinh tế & Pháp luật', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'informatics', name: 'Tin học', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
  { id: 'technology', name: 'Công nghệ', period: 'Học kỳ gần nhất', scoreType: 'Điểm trung bình môn' },
];
