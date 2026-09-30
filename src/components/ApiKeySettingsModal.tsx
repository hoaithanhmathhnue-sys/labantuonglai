import React, { useState, useEffect } from 'react';
import { X, Key, Shield, CheckCircle, AlertCircle, Sparkles, Settings, ExternalLink, Eye, EyeOff, RefreshCw } from 'lucide-react';

export type AiProvider = 'gemini' | 'agent-platform';

export interface AiConfig {
  provider: AiProvider;
  geminiApiKey: string;
  agentPlatformApiKey: string;
  selectedModel: string;
}

const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Khuyến nghị)', description: 'Nhanh, ổn định, phù hợp tra cứu' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Nhanh và tiết kiệm chi phí' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Suy luận mạnh, phân tích sâu' },
];

const AGENT_PLATFORM_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Mặc định)', description: 'Tốc độ nhanh, giá rẻ' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Chi phí thấp nhất' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Suy luận mạnh nhất' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview', description: 'Preview, đòi hỏi quyền truy cập' },
];

const STORAGE_KEYS = {
  provider: 'lbtl_ai_provider',
  geminiKey: 'lbtl_gemini_api_key',
  agentKey: 'lbtl_agent_platform_api_key',
  model: 'lbtl_selected_model',
};

export const loadAiConfig = (): AiConfig => {
  const provider = (localStorage.getItem(STORAGE_KEYS.provider) as AiProvider) || 'gemini';
  const storedModel = localStorage.getItem(STORAGE_KEYS.model);
  const availableModels = provider === 'gemini' ? GEMINI_MODELS : AGENT_PLATFORM_MODELS;
  const selectedModel = availableModels.some((model) => model.id === storedModel)
    ? storedModel!
    : 'gemini-2.5-flash';

  return {
    provider,
    geminiApiKey: localStorage.getItem(STORAGE_KEYS.geminiKey) || '',
    agentPlatformApiKey: localStorage.getItem(STORAGE_KEYS.agentKey) || '',
    selectedModel,
  };
};

export const saveAiConfig = (config: AiConfig) => {
  localStorage.setItem(STORAGE_KEYS.provider, config.provider);
  localStorage.setItem(STORAGE_KEYS.geminiKey, config.geminiApiKey);
  localStorage.setItem(STORAGE_KEYS.agentKey, config.agentPlatformApiKey);
  localStorage.setItem(STORAGE_KEYS.model, config.selectedModel);
};

export const getActiveApiKey = (config: AiConfig): string => {
  return config.provider === 'gemini' ? config.geminiApiKey : config.agentPlatformApiKey;
};

export const isApiKeyConfigured = (config: AiConfig): boolean => {
  const key = getActiveApiKey(config);
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
};

const maskKey = (key: string): string => {
  if (key.length <= 8) return key;
  return key.substring(0, 6) + '•'.repeat(key.length - 10) + key.substring(key.length - 4);
};

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: AiConfig) => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AiConfig>(loadAiConfig);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfig(loadAiConfig());
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKey = config.provider === 'gemini' ? config.geminiApiKey : config.agentPlatformApiKey;
  const isKeyValid = currentKey.trim().length > 0 && GOOGLE_AI_API_KEY_PATTERN.test(currentKey.trim());
  const models = config.provider === 'gemini' ? GEMINI_MODELS : AGENT_PLATFORM_MODELS;

  const handleProviderChange = (provider: AiProvider) => {
    const defaultModel = 'gemini-2.5-flash';
    const currentModel = config.selectedModel;
    const availableModels = provider === 'gemini' ? GEMINI_MODELS : AGENT_PLATFORM_MODELS;
    const modelExists = availableModels.some(m => m.id === currentModel);

    setConfig(prev => ({
      ...prev,
      provider,
      selectedModel: modelExists ? currentModel : defaultModel,
    }));
    setTestStatus('idle');
  };

  const handleKeyChange = (value: string) => {
    if (config.provider === 'gemini') {
      setConfig(prev => ({ ...prev, geminiApiKey: value }));
    } else {
      setConfig(prev => ({ ...prev, agentPlatformApiKey: value }));
    }
    setTestStatus('idle');
  };

  const handleTestKey = async () => {
    if (!isKeyValid) return;
    setTestStatus('testing');
    setTestMessage('');

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: currentKey.trim(),
          provider: config.provider,
          model: config.selectedModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestMessage(data.message || 'API Key hoạt động bình thường!');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'API Key không hợp lệ hoặc không có quyền truy cập.');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Không thể kết nối đến máy chủ để kiểm tra API Key.');
    }
  };

  const handleSave = () => {
    if (!isKeyValid) {
      alert('Vui lòng nhập API Key hợp lệ (bắt đầu bằng AIzaSy... hoặc AQ...).');
      return;
    }
    saveAiConfig(config);
    onConfigSaved(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cài đặt AI & API Key</h2>
              <p className="text-xs text-slate-500">Kích hoạt tính năng AI phân tích & tra cứu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1">
          {/* What AI can do */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/80 to-sky-50/60 border border-teal-200/60">
            <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              Tính năng AI khi kích hoạt
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span><strong>Phân tích chuyên sâu nghề nghiệp:</strong> AI giải thích chi tiết về từng nghề, triển vọng, kỹ năng cần thiết</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span><strong>Tra cứu trường & ngành:</strong> Cập nhật thông tin tuyển sinh, học phí, chương trình đào tạo mới nhất</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span><strong>Tư vấn cá nhân hóa:</strong> Lời khuyên sư phạm được AI trau chuốt dựa trên dữ liệu cụ thể của em</span>
              </li>
            </ul>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Chọn nhà cung cấp dịch vụ AI
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  config.provider === 'gemini'
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="w-4 h-4 text-teal-700" />
                  <span className="text-sm font-bold text-slate-900">Gemini API</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Google AI Studio · Miễn phí hoặc trả phí
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('agent-platform')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  config.provider === 'agent-platform'
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-bold text-slate-900">Agent Platform API</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Google Cloud · Doanh nghiệp & tổ chức
                </p>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              API Key ({config.provider === 'gemini' ? 'Gemini API' : 'Agent Platform API'})
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={currentKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="AIzaSy... hoặc AQ..."
                className={`w-full px-3.5 py-2.5 pr-20 rounded-xl border-2 bg-white text-sm font-mono transition-colors ${
                  currentKey.length === 0
                    ? 'border-slate-200 focus:border-teal-400'
                    : isKeyValid
                    ? 'border-teal-400 bg-teal-50/30'
                    : 'border-rose-300 bg-rose-50/30'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {currentKey.length > 0 && !isKeyValid && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Key phải bắt đầu bằng AIzaSy... hoặc AQ... và có tối thiểu 8 ký tự
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              <a
                href={
                  config.provider === 'gemini'
                    ? 'https://aistudio.google.com/apikey'
                    : 'https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys'
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Lấy API Key miễn phí tại đây
              </a>

              {isKeyValid && (
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testStatus === 'testing'}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra API Key'}
                </button>
              )}
            </div>

            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <div
                className={`mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  testStatus === 'success'
                    ? 'bg-teal-50 border border-teal-200 text-teal-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {testStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Chọn model AI
            </label>
            <div className="space-y-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, selectedModel: m.id }))}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    config.selectedModel === m.id
                      ? 'border-teal-500 bg-teal-50/50'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{m.label}</span>
                    <span className="text-[11px] font-mono text-slate-400">{m.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              Bảo mật dữ liệu
            </strong>
            API Key được lưu trên trình duyệt của bạn và chỉ gửi đến máy chủ La bàn tương lai để chuyển tiếp đến Google AI API. Họ tên và ngày sinh học sinh <strong>không bao giờ</strong> được gửi đến bất kỳ dịch vụ AI nào. Key không được lưu trên server.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Xóa API Key đã lưu? Tính năng AI sẽ bị tắt.')) {
                const emptyConfig: AiConfig = {
                  provider: 'gemini',
                  geminiApiKey: '',
                  agentPlatformApiKey: '',
                  selectedModel: 'gemini-2.5-flash',
                };
                saveAiConfig(emptyConfig);
                setConfig(emptyConfig);
                onConfigSaved(emptyConfig);
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Xóa API Key
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isKeyValid}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl cursor-pointer transition-colors"
            >
              Lưu cấu hình AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
