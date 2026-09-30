import React, { useState } from 'react';
import {
  AnalysisResult,
  AnswerRating,
  ExperiencePreferences,
  InterestAnswer,
  StudentProfile,
  SubjectRecord,
} from './types';
import { INITIAL_SUBJECTS, INTEREST_QUESTIONS } from './data/questionnaire';
import { INITIAL_ADMISSIONS_DATABASE } from './data/admissions';
import { runRecommendationEngine } from './engine/recommendationEngine';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { StepIntro } from './components/StepIntro';
import { StepProfile } from './components/StepProfile';
import { StepSelfDiscovery } from './components/StepSelfDiscovery';
import { StepAcademics } from './components/StepAcademics';
import { StepInterests } from './components/StepInterests';
import { StepReview } from './components/StepReview';
import { StepResults } from './components/StepResults';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { VisitCounter } from './components/VisitCounter';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);
  const [enableTeacherAiMode, setEnableTeacherAiMode] = useState<boolean>(false);

  // In-memory student state (never saved to localStorage per privacy requirement)
  const [profile, setProfile] = useState<StudentProfile>({
    nameOrCode: '',
    grade: 11,
    graduationYear: 2027,
  });

  const [subjects, setSubjects] = useState<SubjectRecord[]>(() =>
    INITIAL_SUBJECTS.map((s) => ({
      ...s,
      interest: 3,
      isNotStudied: false,
      isNoScoreYet: false,
    }))
  );

  const [answers, setAnswers] = useState<InterestAnswer[]>(() =>
    INTEREST_QUESTIONS.map((q) => ({
      questionId: q.id,
      rating: 3, // neutral default so student can adjust or select 'unexperienced'
    }))
  );

  const [preferences, setPreferences] = useState<ExperiencePreferences>({
    preferredRegion: 'Toàn quốc',
    willingToRelocate: 'consider',
    desiredDegree: 'all',
    tuitionBudgetRange: 'Bỏ qua',
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxVisitedStep) {
      setMaxVisitedStep(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetSession = () => {
    if (confirm('Em có chắc chắn muốn xóa toàn bộ thông tin phiên làm việc và làm lại từ đầu không?')) {
      setProfile({
        nameOrCode: '',
        grade: 11,
        graduationYear: 2027,
      });
      setSubjects(
        INITIAL_SUBJECTS.map((s) => ({
          ...s,
          score: undefined,
          scoreInput: '',
          interest: 3,
          isNotStudied: false,
          isNoScoreYet: false,
        }))
      );
      setAnswers(
        INTEREST_QUESTIONS.map((q) => ({
          questionId: q.id,
          rating: 3,
        }))
      );
      setPreferences({
        preferredRegion: 'Toàn quốc',
        willingToRelocate: 'consider',
        desiredDegree: 'all',
        tuitionBudgetRange: 'Bỏ qua',
      });
      setAnalysisResult(null);
      setCurrentStep(1);
      setMaxVisitedStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswerChange = (questionId: string, rating: AnswerRating) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, rating } : a))
    );
  };

  const handleRunAnalysis = async () => {
    setIsProcessing(true);

    try {
      // Attempt server-side API call
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            nameOrCode: profile.nameOrCode,
            grade: profile.grade,
            graduationYear: profile.graduationYear,
          },
          subjects,
          answers,
          preferences,
          enableTeacherAiMode,
        }),
      });

      if (res.ok) {
        const resultJson = await res.json();
        setAnalysisResult(resultJson);
      } else {
        // Fallback to local deterministic engine if server route failed
        const localResult = runRecommendationEngine({
          profile,
          subjects,
          answers,
          preferences,
          admissionsDb: INITIAL_ADMISSIONS_DATABASE,
        });
        setAnalysisResult(localResult);
      }
    } catch {
      // Local deterministic engine fallback
      const localResult = runRecommendationEngine({
        profile,
        subjects,
        answers,
        preferences,
        admissionsDb: INITIAL_ADMISSIONS_DATABASE,
      });
      setAnalysisResult(localResult);
    } finally {
      setIsProcessing(false);
      goToStep(7);
    }
  };

  const handleLoadTestFixture = (
    fProfile: StudentProfile,
    fSubjects: SubjectRecord[],
    fAnswers: InterestAnswer[],
    fPreferences: ExperiencePreferences
  ) => {
    setProfile(fProfile);
    setSubjects(fSubjects);
    setAnswers(fAnswers);
    setPreferences(fPreferences);

    // Compute analysis immediately
    const res = runRecommendationEngine({
      profile: fProfile,
      subjects: fSubjects,
      answers: fAnswers,
      preferences: fPreferences,
      admissionsDb: INITIAL_ADMISSIONS_DATABASE,
    });
    setAnalysisResult(res);
    goToStep(7);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header
        currentStep={currentStep}
        onResetSession={handleResetSession}
        onOpenTeacherAdmin={() => setShowTeacherModal(true)}
        onPrint={() => window.print()}
      />

      <ProgressBar
        currentStep={currentStep}
        totalSteps={7}
        onJumpToStep={goToStep}
        maxVisitedStep={maxVisitedStep}
      />

      <main className="flex-1">
        {currentStep === 1 && (
          <StepIntro onStart={() => goToStep(2)} />
        )}

        {currentStep === 2 && (
          <StepProfile
            profile={profile}
            onChange={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepSelfDiscovery
            birthDate={profile.birthDate}
            onContinue={() => goToStep(4)}
          />
        )}

        {currentStep === 4 && (
          <StepAcademics
            subjects={subjects}
            onChange={setSubjects}
            onNext={() => goToStep(5)}
            onBack={() => goToStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepInterests
            answers={answers}
            preferences={preferences}
            onAnswerChange={handleAnswerChange}
            onPreferencesChange={(updated) =>
              setPreferences((prev) => ({ ...prev, ...updated }))
            }
            onNext={() => goToStep(6)}
            onBack={() => goToStep(4)}
          />
        )}

        {currentStep === 6 && (
          <StepReview
            profile={profile}
            subjects={subjects}
            answers={answers}
            preferences={preferences}
            onEditStep={goToStep}
            onSubmit={handleRunAnalysis}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 7 && analysisResult && (
          <StepResults
            result={analysisResult}
            onEdit={() => goToStep(6)}
            onReset={handleResetSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-6 px-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div>
            <strong className="text-white">La Bàn Tương Lai</strong> · Công cụ hướng nghiệp học đường THPT
          </div>
          <VisitCounter />
          <div className="text-[11px] text-slate-500">
            Dữ liệu lưu tạm thời theo phiên · Không sử dụng cho quyết định tuyển sinh bắt buộc
          </div>
        </div>
      </footer>

      {/* Teacher Admin Modal */}
      <TeacherAdminModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onLoadTestFixture={handleLoadTestFixture}
        enableTeacherAiMode={enableTeacherAiMode}
        onToggleTeacherAiMode={setEnableTeacherAiMode}
      />
    </div>
  );
}
