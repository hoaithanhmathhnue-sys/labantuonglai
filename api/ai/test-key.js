import { GoogleGenAI } from '@google/genai';

const API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

const getErrorMessage = (error) => {
  const message = error?.message || String(error || '');
  const serialized = JSON.stringify(error) || '';

  if (serialized.includes('404') || message.includes('NOT_FOUND')) {
    return 'Model không tồn tại hoặc không khả dụng. Hãy chọn Gemini 2.5 Flash.';
  }
  if (serialized.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.toLowerCase().includes('quota')) {
    return 'API Key hợp lệ nhưng đã hết quota hoặc vượt giới hạn tốc độ. Vui lòng thử lại sau.';
  }
  if (serialized.includes('503') || message.includes('UNAVAILABLE') || message.toLowerCase().includes('overloaded')) {
    return 'Model đang quá tải. API Key vẫn hợp lệ, vui lòng thử lại sau.';
  }
  if (message.includes('API_KEY_INVALID') || message.includes('401') || message.includes('PERMISSION_DENIED')) {
    return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.';
  }
  return 'Không thể kiểm tra API Key lúc này. Vui lòng thử lại.';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST.' });
  }

  const { apiKey, provider = 'gemini', model = 'gemini-2.5-flash' } = req.body || {};
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';

  if (!API_KEY_PATTERN.test(key)) {
    return res.status(400).json({ success: false, error: 'API Key không hợp lệ.' });
  }

  try {
    const ai = provider === 'agent-platform'
      ? new GoogleGenAI({ vertexai: true, apiKey: key })
      : new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model,
      contents: 'Trả lời ngắn gọn: OK',
      config: { maxOutputTokens: 32 },
    });

    if (!response.text?.trim()) {
      return res.status(400).json({ success: false, error: 'API Key được chấp nhận nhưng model không phản hồi.' });
    }

    return res.json({ success: true, message: 'API Key hoạt động! Model ' + model + ' phản hồi thành công.' });
  } catch (error) {
    return res.status(400).json({ success: false, error: getErrorMessage(error) });
  }
}
