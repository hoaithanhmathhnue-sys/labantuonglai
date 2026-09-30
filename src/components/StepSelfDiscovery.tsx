import React, { useState, useEffect, useRef } from 'react';
import { NumerologyProfile, analyzeNumerologyProfile, calculateLifePath } from '../engine/numerology';
import {
  Sparkles,
  User,
  BookOpen,
  Brain,
  Zap,
  Target,
  Shield,
  Lightbulb,
  TreePine,
  Star,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface Props {
  birthDate?: string; // from StudentProfile
  onContinue?: () => void;
}

export function StepSelfDiscovery({ birthDate, onContinue }: Props) {
  const [inputDate, setInputDate] = useState(birthDate || '');
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'learningStyle', 'strengths']));
  const [isAnimating, setIsAnimating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (birthDate) {
      setInputDate(birthDate);
    }
  }, [birthDate]);

  const handleAnalyze = () => {
    if (!inputDate) return;
    setIsAnimating(true);
    setTimeout(() => {
      const result = analyzeNumerologyProfile(inputDate);
      setProfile(result);
      setIsAnimating(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }, 1200);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sections = profile
    ? [
        { key: 'overview', icon: User, label: 'Tổng quan tính cách', content: profile.overview, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        { key: 'learningStyle', icon: BookOpen, label: 'Phong cách học tập', content: profile.learningStyle, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
        { key: 'competencies', icon: Brain, label: 'Năng lực tập trung', content: profile.competencies, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        { key: 'motivation', icon: Zap, label: 'Động lực học tập', content: profile.motivation, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        { key: 'mathApproach', icon: Target, label: 'Cách tiếp cận vấn đề', content: profile.mathApproach, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
        { key: 'strengths', icon: Star, label: 'Điểm mạnh nổi bật', content: profile.strengths, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { key: 'challenges', icon: Shield, label: 'Thách thức cần khắc phục', content: profile.challenges, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        { key: 'learningMethods', icon: Lightbulb, label: 'Phương pháp học hiệu quả', content: profile.learningMethods, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
        { key: 'environment', icon: TreePine, label: 'Môi trường học tập lý tưởng', content: profile.environment, color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-200' },
      ]
    : [];

  return (
    <section className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Khám phá bản thân
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
          Hiểu bản thân qua <span className="text-indigo-600">Số đường đời</span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
          Nhập ngày sinh để khám phá tính cách, phong cách học tập và điểm mạnh tiềm ẩn của em.
          Kết quả giúp định hướng phương pháp học phù hợp nhất.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          <Calendar className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          Ngày sinh (dd/mm/yyyy)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            placeholder="Ví dụ: 15/06/2008"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
          />
          <button
            onClick={handleAnalyze}
            disabled={!inputDate || isAnimating}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2 text-sm shadow-lg shadow-indigo-500/25"
          >
            {isAnimating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Phân tích
              </>
            )}
          </button>
        </div>
        {inputDate && !isAnimating && !profile && (
          <p className="text-xs text-slate-400 mt-2">
            Hỗ trợ định dạng: dd/mm/yyyy, dd-mm-yyyy hoặc yyyy-mm-dd
          </p>
        )}
      </div>

      {/* Results */}
      {profile && (
        <div ref={resultRef} className="space-y-6 animate-fade-in">
          {/* Life Path Number Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-24 h-24 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-4xl sm:text-5xl font-bold">{profile.lifePathNumber}</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{profile.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{profile.overview}</p>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-3">
            {sections.map(({ key, icon: Icon, label, content, color, bg, border }) => {
              const isOpen = expandedSections.has(key);
              return (
                <div
                  key={key}
                  className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? `${border} shadow-sm` : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="flex-1 font-semibold text-sm text-slate-700">{label}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-4 pt-0`}>
                      <div className={`${bg} rounded-lg p-4 border ${border}`}>
                        <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 mb-2">Kết luận & khuyến nghị</h4>
                <p className="text-sm text-emerald-700 leading-relaxed">{profile.conclusion}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-slate-400 italic">
            Kết quả mang tính tham khảo, giúp em hiểu bản thân tốt hơn để chọn phương pháp học phù hợp.
            Không thay thế tư vấn chuyên môn của thầy cô và chuyên gia hướng nghiệp.
          </p>

          {/* Continue button */}
          {onContinue && (
            <div className="text-center pt-4">
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-500/25"
              >
                Tiếp tục khảo sát
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
