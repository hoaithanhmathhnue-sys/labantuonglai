import { GoogleGenAI } from '@google/genai';

const API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];

const isRetryable = (error) => {
  const message = error?.message || String(error || '');
  const serialized = JSON.stringify(error) || '';
  return serialized.includes('404') || serialized.includes('500') || serialized.includes('503') || serialized.includes('504')
    || message.includes('NOT_FOUND') || message.includes('INTERNAL') || message.includes('UNAVAILABLE') || message.includes('DEADLINE_EXCEEDED');
};

const getErrorMessage = (error) => {
  const message = error?.message || String(error || '');
  const serialized = JSON.stringify(error) || '';
  if (serialized.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.toLowerCase().includes('quota')) return 'Đã hết quota API. Vui lòng đợi vài phút rồi thử lại.';
  if (serialized.includes('503') || message.includes('UNAVAILABLE') || message.toLowerCase().includes('overloaded')) return 'Server AI đang quá tải. Vui lòng thử lại sau ít phút.';
  if (message.includes('API_KEY_INVALID') || message.includes('401') || message.includes('PERMISSION_DENIED')) return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt AI.';
  return 'Không thể tra cứu thông tin lúc này. Vui lòng thử lại sau.';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST.' });
  }

  const { query, apiKey, provider = 'gemini', model = 'gemini-2.5-flash' } = req.body || {};
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!API_KEY_PATTERN.test(key)) return res.status(400).json({ error: 'Vui lòng cấu hình API Key hợp lệ trong Cài đặt AI để sử dụng tính năng tra cứu.' });
  if (typeof query !== 'string' || query.trim().length < 3) return res.status(400).json({ error: 'Vui lòng nhập nội dung tìm kiếm (tối thiểu 3 ký tự).' });

  const ai = provider === 'agent-platform'
    ? new GoogleGenAI({ vertexai: true, apiKey: key })
    : new GoogleGenAI({ apiKey: key });
  const models = [model, ...FALLBACK_MODELS.filter((candidate) => candidate !== model)];
  const systemInstruction = 'Bạn là chuyên gia tư vấn tuyển sinh đại học Việt Nam. Chỉ cung cấp thông tin về trường có thật tại Việt Nam. Với điểm chuẩn và học phí, ghi rõ năm tham khảo; nếu không chắc chắn, ghi rõ cần xác nhận trên website chính thức.';
  const prompt = 'Tìm kiếm thông tin: \"' + query.trim() + '\". Trả về JSON hợp lệ theo cấu trúc {\"summary\":\"Tóm tắt 2-4 câu\",\"searchQuery\":\"' + query.trim() + '\",\"results\":[{\"schoolName\":\"Tên trường\",\"location\":\"Khu vực\",\"majors\":[{\"name\":\"Tên ngành\",\"faculty\":\"Khoa hoặc viện\",\"benchmarkScore\":\"Điểm chuẩn kèm năm và phương thức\",\"tuition\":\"Học phí năm\",\"admissionMethod\":\"Phương thức xét tuyển\"}],\"website\":\"URL chính thức\",\"highlights\":[\"Điểm nổi bật\"],\"lastUpdated\":\"Thời điểm tham khảo\"}]}. Trả về 3-5 trường phù hợp; nếu không liên quan giáo dục, trả về results rỗng và giải thích ở summary.';

  let lastError;
  for (const candidate of models) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents: prompt,
        config: { systemInstruction, responseMimeType: 'application/json', maxOutputTokens: 12288 },
      });
      const text = response.text?.trim();
      if (!text) throw new Error('Model returned an empty response.');
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.results) || typeof parsed.summary !== 'string') throw new Error('Model returned an invalid JSON structure.');
      return res.json({ ...parsed, searchQuery: query.trim() });
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) break;
    }
  }

  return res.status(500).json({ error: getErrorMessage(lastError) });
}
