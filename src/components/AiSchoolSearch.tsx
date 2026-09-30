import React, { useState } from 'react';
import { Search, Loader2, X, ExternalLink, MapPin, GraduationCap, DollarSign, Calendar, Sparkles, AlertCircle } from 'lucide-react';

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

export const AiSchoolSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<AiSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const suggestedQueries = [
    'Ngành Công nghệ thông tin ở Hà Nội',
    'Trường đào tạo Y khoa uy tín',
    'Ngành Kinh tế đối ngoại điểm chuẩn',
    'Học Thiết kế đồ họa ở TP.HCM',
    'So sánh ngành Kỹ thuật phần mềm các trường',
    'Trường có học bổng cho sinh viên giỏi',
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setIsSearching(true);
    setError(null);
    setSearchResponse(null);

    try {
      const res = await fetch('/api/ai/school-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          apiKey: localStorage.getItem('lbtl_gemini_api_key') || localStorage.getItem('lbtl_agent_platform_api_key') || '',
          provider: localStorage.getItem('lbtl_ai_provider') || 'gemini',
          model: localStorage.getItem('lbtl_selected_model') || 'gemini-3.6-flash',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Không thể tìm kiếm. Vui lòng thử lại.');
      }

      const data: AiSearchResponse = await res.json();
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
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 rounded-xl shadow-md shadow-teal-200/50 transition-all cursor-pointer print:hidden"
      >
        <Search className="w-4 h-4" />
        <span>AI Tra cứu trường & ngành</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-sky-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">AI Tra cứu trường & ngành học</h2>
                    <p className="text-xs text-slate-500">Tìm thông tin tuyển sinh, học phí, chương trình đào tạo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ví dụ: Ngành CNTT ở Hà Nội, học phí trường Bách Khoa..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-400 bg-white text-sm transition-colors"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={!query.trim() || isSearching}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Tìm kiếm'
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Suggestions (when no results yet) */}
              {!searchResponse && !isSearching && !error && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 mb-2">Gợi ý tra cứu nhanh</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQueries.map((sq) => (
                        <button
                          key={sq}
                          type="button"
                          onClick={() => { setQuery(sq); handleSearch(sq); }}
                          className="px-3 py-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 rounded-full cursor-pointer transition-colors"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {searchHistory.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-600 mb-2">Lịch sử tìm kiếm</h3>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => { setQuery(h); handleSearch(h); }}
                            className="px-3 py-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-colors"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/60 mt-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-teal-900 block mb-1">AI sẽ giúp em tìm hiểu:</strong>
                        <ul className="space-y-1 mt-1">
                          <li>• Thông tin về các trường đại học, cao đẳng tại Việt Nam</li>
                          <li>• Điểm chuẩn, phương thức tuyển sinh các năm</li>
                          <li>• Học phí, cơ sở vật chất, chương trình đào tạo</li>
                          <li>• So sánh các ngành học giữa các trường</li>
                          <li>• Cơ hội việc làm và triển vọng sau tốt nghiệp</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isSearching && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">AI đang tra cứu thông tin...</p>
                    <p className="text-xs text-slate-500 mt-1">Đang tổng hợp từ nhiều nguồn dữ liệu</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-5 text-center">
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Results */}
              {searchResponse && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/60">
                    <h3 className="text-xs font-bold text-teal-900 flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      Tổng hợp AI
                    </h3>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
