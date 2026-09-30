import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, MapPin, GraduationCap, DollarSign, Calendar, Sparkles, AlertCircle, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { loadAiConfig, isApiKeyConfigured, getActiveApiKey } from './ApiKeySettingsModal';

interface SchoolSearchResult {
  schoolName: string;
  location: string;
  majors: {
    name: string;
    faculty?: string;
    benchmarkScore?: string;
    tuition?: string;
    admissionMethod?: string;
  }[];
  website?: string;
  highlights: string[];
  lastUpdated: string;
}

interface AiSearchResponse {
  results: SchoolSearchResult[];
  summary: string;
  searchQuery: string;
}

interface AiSchoolSearchProps {
  onOpenAiSettings?: () => void;
}

export const AiSchoolSearch: React.FC<AiSchoolSearchProps> = ({ onOpenAiSettings }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<AiSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(true);

  const config = loadAiConfig();
  const hasKey = isApiKeyConfigured(config);

  const suggestedQueries = [
    'Ngành công nghệ thông tin ở Hà Nội',
    'Trường đào tạo y khoa uy tín',
    'Ngành kinh tế đối ngoại điểm chuẩn',
    'Học thiết kế đồ họa ở TP.HCM',
    'So sánh ngành kỹ thuật phần mềm',
    'Trường có học bổng cho sinh viên giỏi',
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    // Reload config fresh each search
    const freshConfig = loadAiConfig();
    const apiKey = getActiveApiKey(freshConfig);

    if (!apiKey || !isApiKeyConfigured(freshConfig)) {
      setError('Vui lòng cấu hình API Key trước khi sử dụng tính năng AI tra cứu.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResponse(null);
    setShowResults(true);

    try {
      const res = await fetch('/api/ai/school-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          apiKey: apiKey,
          provider: freshConfig.provider,
          model: freshConfig.selectedModel,
        }),
      });

      // Safely parse response
      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Không thể tìm kiếm. Vui lòng thử lại.');
      }

      setSearchResponse(data);

      // Save to history
      setSearchHistory(prev => {
        const updated = [q, ...prev.filter(h => h !== q)].slice(0, 5);
        return updated;
      });
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
      {/* Header */}
      <div className="px-5 sm:px-8 py-6 bg-gradient-to-r from-teal-50 via-sky-50 to-violet-50 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center shadow-md shadow-teal-200/40">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              AI tra cứu trường & ngành học
              <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">BETA</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tìm thông tin tuyển sinh, học phí, chương trình đào tạo bằng AI
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {hasKey ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ví dụ: Ngành CNTT ở Hà Nội, học phí trường Bách Khoa..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-white text-sm transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={!query.trim() || isSearching}
              className="px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl cursor-pointer transition-colors shrink-0 shadow-sm"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Tìm kiếm'
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border-2 border-dashed border-teal-300 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800 mb-1">Cần API Key để sử dụng tính năng này</p>
              <p className="text-xs text-slate-500">
                Nhập Gemini API Key (miễn phí từ Google AI Studio) để mở khóa tính năng tra cứu bằng AI.
              </p>
            </div>
            {onOpenAiSettings && (
              <button
                type="button"
                onClick={onOpenAiSettings}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer transition-colors shadow-sm shrink-0"
              >
                <Key className="w-4 h-4" />
                Cài đặt API Key
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 sm:px-8 py-5">
        {/* Suggestions (when no results yet) */}
        {!searchResponse && !isSearching && !error && hasKey && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-600 mb-2.5">Gợi ý tra cứu nhanh</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => { setQuery(sq); handleSearch(sq); }}
                    className="px-3.5 py-2 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 rounded-xl cursor-pointer transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {searchHistory.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-2">Tìm kiếm gần đây</h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => { setQuery(h); handleSearch(h); }}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/60 to-sky-50/40 border border-teal-100 mt-2">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-teal-900 block mb-1">AI có thể giúp em tìm hiểu:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <span>• Thông tin trường đại học, cao đẳng</span>
                    <span>• Điểm chuẩn, phương thức tuyển sinh</span>
                    <span>• Học phí, chương trình đào tạo</span>
                    <span>• So sánh ngành học giữa các trường</span>
                    <span>• Cơ hội việc làm sau tốt nghiệp</span>
                    <span>• Học bổng và chính sách hỗ trợ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No key info */}
        {!hasKey && (
          <div className="py-6 text-center text-xs text-slate-400">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>Cấu hình API Key để bắt đầu tra cứu thông tin trường & ngành bằng AI</p>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">AI đang tra cứu thông tin...</p>
              <p className="text-xs text-slate-500 mt-1">Đang tổng hợp từ nhiều nguồn dữ liệu</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <button
                type="button"
                onClick={() => { setError(null); handleSearch(); }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
              >
                Thử lại
              </button>
              {onOpenAiSettings && (
                <button
                  type="button"
                  onClick={onOpenAiSettings}
                  className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl cursor-pointer"
                >
                  Kiểm tra API Key
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {searchResponse && (
          <div className="space-y-4">
            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setShowResults(!showResults)}
              className="w-full flex items-center justify-between text-xs font-semibold text-teal-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Kết quả tìm kiếm: "{searchResponse.searchQuery}" ({searchResponse.results.length} trường)
              </span>
              {showResults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showResults && (
              <>
                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/60">
                  <p className="text-sm text-slate-700 leading-relaxed">{searchResponse.summary}</p>
                </div>

                {/* School Cards */}
                <div className="space-y-4">
                  {searchResponse.results.map((school, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{school.schoolName}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{school.location}</span>
                          </div>
                        </div>
                        {school.website && (
                          <a
                            href={school.website.startsWith('http') ? school.website : `https://${school.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-teal-700 hover:underline flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Trang web trường
                          </a>
                        )}
                      </div>

                      {/* Highlights */}
                      {school.highlights.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {school.highlights.map((h, hi) => (
                            <span key={hi} className="text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200/60">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Majors */}
                      {school.majors.length > 0 && (
                        <div className="space-y-2">
                          {school.majors.map((major, mi) => (
                            <div key={mi} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                                  {major.name}
                                </span>
                                {major.faculty && (
                                  <span className="text-slate-500">· {major.faculty}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-slate-600 mt-1">
                                {major.benchmarkScore && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                    Điểm chuẩn: <strong className="text-slate-800">{major.benchmarkScore}</strong>
                                  </span>
                                )}
                                {major.tuition && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-emerald-500" />
                                    Học phí: <strong className="text-slate-800">{major.tuition}</strong>
                                  </span>
                                )}
                                {major.admissionMethod && (
                                  <span className="text-slate-500 italic">{major.admissionMethod}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 mt-2 text-right">
                        Cập nhật: {school.lastUpdated}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-slate-400 text-center py-2 border-t border-slate-100">
                  Thông tin do AI tổng hợp từ nguồn công khai. Em nên kiểm tra lại trên website chính thức của trường trước khi đưa ra quyết định.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
