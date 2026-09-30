import {
  AdmissionProgramRecord,
  AnalysisResult,
  CareerOption,
  CategoryScoreResult,
  DevelopmentArea,
  EvidenceItem,
  ExperiencePreferences,
  FourWeekPlanStep,
  InterestAnswer,
  InterestCategory,
  LearningStrength,
  ProgramSuggestion,
  StudentProfile,
  SubjectRecord,
} from '../types';
import { CAREER_CATALOG } from '../data/careers';
import { INTEREST_CATEGORIES, INTEREST_QUESTIONS } from '../data/questionnaire';

export interface EngineInput {
  profile: Pick<StudentProfile, 'nameOrCode' | 'grade' | 'graduationYear'>;
  subjects: SubjectRecord[];
  answers: InterestAnswer[];
  preferences: ExperiencePreferences;
  admissionsDb: AdmissionProgramRecord[];
}

export function parseVietnameseScore(input: string | number | undefined): number | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'number') {
    if (isNaN(input)) return undefined;
    return input >= 0 && input <= 10 ? input : undefined;
  }
  const clean = input.trim().replace(',', '.');
  if (clean === '') return undefined;
  const num = parseFloat(clean);
  if (isNaN(num)) return undefined;
  if (num < 0 || num > 10) return undefined;
  return Math.round(num * 100) / 100;
}

export function runRecommendationEngine(input: EngineInput): AnalysisResult {
  const { profile, subjects, answers, preferences, admissionsDb } = input;
  const analyzedAt = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const usedInputs: string[] = [];
  const missingInputs: string[] = [];
  const evidence: EvidenceItem[] = [];

  // 1. Process Interest Category Scores
  const answersMap = new Map<string, 1 | 2 | 3 | 4 | 5 | 'unexperienced'>();
  answers.forEach((a) => answersMap.set(a.questionId, a.rating));

  const interestScores: CategoryScoreResult[] = (['R', 'I', 'A', 'S', 'E', 'C'] as InterestCategory[]).map(
    (catCode) => {
      const catQuestions = INTEREST_QUESTIONS.filter((q) => q.category === catCode);
      const contributing: { questionId: string; text: string; rating: number }[] = [];

      catQuestions.forEach((q) => {
        const rating = answersMap.get(q.id);
        if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
          contributing.push({ questionId: q.id, text: q.text, rating });
          evidence.push({
            id: q.id,
            label: `Câu hỏi ${q.id} (${INTEREST_CATEGORIES[catCode].name})`,
            detail: `Mức độ thích: ${rating}/5 — "${q.text}"`,
          });
        }
      });

      const validCount = contributing.length;
      const totalQuestions = catQuestions.length;
      let average: number | null = null;
      let status: 'sufficient' | 'low_data' | 'insufficient' = 'insufficient';

      if (validCount === 0) {
        status = 'insufficient';
      } else if (validCount === 1) {
        average = Math.round(contributing[0].rating * 10) / 10;
        status = 'low_data';
      } else {
        const sum = contributing.reduce((acc, curr) => acc + curr.rating, 0);
        average = Math.round((sum / validCount) * 10) / 10;
        status = 'sufficient';
      }

      return {
        category: catCode,
        categoryName: INTEREST_CATEGORIES[catCode].name,
        average,
        validCount,
        totalQuestions,
        status,
        contributingAnswers: contributing,
      };
    }
  );

  const answeredQuestionsCount = answers.filter((a) => typeof a.rating === 'number').length;
  if (answeredQuestionsCount > 0) {
    usedInputs.push(`Khảo sát sở thích: ${answeredQuestionsCount}/12 câu trả lời có thang điểm.`);
  } else {
    missingInputs.push('Chưa có câu trả lời nào về sở thích hoạt động có thang điểm 1-5.');
  }

  // 2. Process Academics (Learning Strengths & Development Areas)
  const validSubjects = subjects.filter((s) => !s.isNotStudied && !s.isNoScoreYet && s.score !== undefined);
  const learningStrengths: LearningStrength[] = [];
  const developmentAreas: DevelopmentArea[] = [];

  if (validSubjects.length > 0) {
    usedInputs.push(`Kết quả học tập: ${validSubjects.length} môn học đã nhập điểm số.`);
  } else {
    missingInputs.push('Chưa có môn học nào được nhập điểm đầy đủ.');
  }

  subjects.forEach((s) => {
    if (s.isNotStudied) return;

    const evidenceId = `SUBJ-${s.id}`;
    if (s.score !== undefined) {
      evidence.push({
        id: evidenceId,
        label: `Môn ${s.name}`,
        detail: `Điểm số: ${s.score}/10 (${s.scoreType}) | Mức thích: ${s.interest}/5`,
      });
    }

    // High performance or high synergy
    if (s.score !== undefined && s.score >= 8.0) {
      learningStrengths.push({
        subject: s.name,
        score: s.score,
        interest: s.interest,
        insight:
          s.interest >= 4
            ? `Điểm số tốt (${s.score}) song hành cùng mức độ yêu thích cao (${s.interest}/5), đây là điểm tựa học thuật rất thuận lợi.`
            : `Kết quả học tập tốt (${s.score}), mặc dù mức độ hứng thú ở mức trung bình (${s.interest}/5). Em có thể phát huy năng lực tư duy phương pháp của môn này.`,
      });
    }

    // Areas needing development or attention
    if (s.interest >= 4 && (s.score === undefined || s.score < 7.0)) {
      developmentAreas.push({
        subject: s.name,
        score: s.score,
        interest: s.interest,
        reason:
          s.score !== undefined
            ? `Em rất yêu thích môn học này (${s.interest}/5) nhưng điểm hiện tại (${s.score}) còn có dư địa cải thiện.`
            : `Em rất yêu thích môn học (${s.interest}/5) nhưng chưa có dữ liệu điểm số cụ thể để đối chiếu.`,
        suggestion:
          'Không kết luận thiếu tố chất! Sự hứng thú là động lực lớn nhất. Em hãy nhờ thầy cô bộ môn hướng dẫn phương pháp làm bài và tập trung vá các lỗ hổng kiến thức căn bản.',
      });
    } else if (s.score !== undefined && s.score < 6.0) {
      developmentAreas.push({
        subject: s.name,
        score: s.score,
        interest: s.interest,
        reason: `Điểm số hiện tại (${s.score}) ở mức trung bình và mức thích môn học là ${s.interest}/5.`,
        suggestion:
          'Cần đảm bảo chuẩn kiến thức căn bản để không ảnh hưởng đến điều kiện xét tuyển tốt nghiệp và học bạ.',
      });
    }
  });

  // Sort learning strengths by score descending
  learningStrengths.sort((a, b) => b.score - a.score);

  // 3. Optional Experience and Preferences
  if (preferences.proudAchievement?.trim()) {
    usedInputs.push('Trải nghiệm tự hào do học sinh chia sẻ.');
    evidence.push({
      id: 'EXP-ACHIEVEMENT',
      label: 'Trải nghiệm tự hào',
      detail: preferences.proudAchievement.trim(),
    });
  }
  if (preferences.fieldToTry?.trim()) {
    usedInputs.push(`Lĩnh vực muốn thử: ${preferences.fieldToTry.trim()}`);
    evidence.push({
      id: 'EXP-FIELD-TRY',
      label: 'Lĩnh vực muốn tìm hiểu',
      detail: preferences.fieldToTry.trim(),
    });
  }
  if (preferences.dislikedTasks?.trim()) {
    usedInputs.push(`Loại công việc không thích: ${preferences.dislikedTasks.trim()}`);
  }
  if (preferences.preferredRegion) {
    usedInputs.push(`Khu vực muốn học tập: ${preferences.preferredRegion}`);
  }
  if (preferences.desiredDegree && preferences.desiredDegree !== 'all') {
    const degreeLabel =
      preferences.desiredDegree === 'university'
        ? 'Đại học'
        : preferences.desiredDegree === 'college'
        ? 'Cao đẳng'
        : 'Đào tạo nghề';
    usedInputs.push(`Bậc học mong muốn: ${degreeLabel}`);
  }

  // 4. Determine Dominant Interest Categories (handles ties & low data)
  const validCategories = interestScores.filter((c) => c.average !== null);
  validCategories.sort((a, b) => (b.average || 0) - (a.average || 0));

  let dominantCategories: CategoryScoreResult[] = [];
  let summary = '';

  if (validCategories.length === 0) {
    summary =
      'Em chưa chọn thang điểm cho các câu hỏi sở thích. Dưới đây là các định hướng gợi ý khái quát để em bắt đầu trải nghiệm thực tế.';
  } else {
    const highestScore = validCategories[0].average || 0;
    // Categories within 0.5 points of highest are considered dominant (preserving ties)
    dominantCategories = validCategories.filter((c) => (c.average || 0) >= Math.max(3.0, highestScore - 0.5));

    if (dominantCategories.length === 0) {
      dominantCategories = [validCategories[0]];
    }

    const topNames = dominantCategories.map((c) => `"${c.categoryName}" (${c.average}/5)`).join(', ');
    summary = `Dựa trên phản hồi khảo sát, em thể hiện sự quan tâm nổi bật ở nhóm hoạt động: ${topNames}. Kết quả này phản ánh hứng thú khám phá hiện tại của em và là điểm khởi đầu cho các trải nghiệm tiếp theo.`;
  }

  // 5. Select 3-5 Career Suggestions based on Dominant Categories & Academics
  const matchedCareers: CareerOption[] = [];
  const dominantCodes = new Set(dominantCategories.map((c) => c.category));

  // First pass: Careers from dominant categories
  CAREER_CATALOG.forEach((career) => {
    if (dominantCodes.has(career.category)) {
      matchedCareers.push(career);
    }
  });

  // Second pass: If not enough, add careers matching strong subjects
  if (matchedCareers.length < 3) {
    const strongSubjectNames = new Set(learningStrengths.map((s) => s.subject));
    CAREER_CATALOG.forEach((career) => {
      if (!matchedCareers.some((m) => m.id === career.id)) {
        const hasOverlap = career.coreSubjects.some((cs) => strongSubjectNames.has(cs));
        if (hasOverlap) {
          matchedCareers.push(career);
        }
      }
    });
  }

  // Fallback: If still under 3, fill with representative options
  if (matchedCareers.length < 3) {
    CAREER_CATALOG.forEach((career) => {
      if (matchedCareers.length < 3 && !matchedCareers.some((m) => m.id === career.id)) {
        matchedCareers.push(career);
      }
    });
  }

  // Pick top 3-4 suggestions
  const selectedCareers = matchedCareers.slice(0, 4);

  const careerSuggestions = selectedCareers.map((career) => {
    const matchedEvidenceIds: string[] = [];
    const reasons: string[] = [];

    // Check specific question evidence
    const categoryResult = interestScores.find((c) => c.category === career.category);
    if (categoryResult && categoryResult.average !== null) {
      reasons.push(
        `Phù hợp với nhóm sở thích "${career.categoryName}" mà em đánh giá cao (${categoryResult.average}/5).`
      );
      categoryResult.contributingAnswers.forEach((ca) => {
        matchedEvidenceIds.push(ca.questionId);
      });
    }

    // Check subject overlap
    const strongCore = career.coreSubjects.filter((subj) =>
      learningStrengths.some((ls) => ls.subject.toLowerCase().includes(subj.toLowerCase()))
    );
    if (strongCore.length > 0) {
      reasons.push(`Em đang có kết quả học tập tốt ở môn liên quan: ${strongCore.join(', ')}.`);
      strongCore.forEach((subj) => {
        const found = subjects.find((s) => s.name.toLowerCase().includes(subj.toLowerCase()));
        if (found) matchedEvidenceIds.push(`SUBJ-${found.id}`);
      });
    }

    // Check student field to try preference
    if (
      preferences.fieldToTry &&
      (career.title.toLowerCase().includes(preferences.fieldToTry.toLowerCase()) ||
        career.description.toLowerCase().includes(preferences.fieldToTry.toLowerCase()))
    ) {
      reasons.push(`Trùng khớp với lĩnh vực em đang chủ động muốn thử sức: "${preferences.fieldToTry}".`);
      matchedEvidenceIds.push('EXP-FIELD-TRY');
    }

    return {
      careerId: career.id,
      title: career.title,
      categoryName: career.categoryName,
      reasons,
      evidenceIds: Array.from(new Set(matchedEvidenceIds)),
      uncertainties: career.uncertainties,
      trialActivity: career.trialActivities,
      coreSubjects: career.coreSubjects,
      matchedDegreeLevels: career.degreeLevels,
    };
  });

  // 6. Match Admission Programs from Verified Database
  const programSuggestions: ProgramSuggestion[] = [];
  const selectedCareerTitles = selectedCareers.map((c) => c.title.toLowerCase());

  admissionsDb.forEach((prog) => {
    if (prog.status === 'deprecated') return;

    // Filter by preferred region if specified
    if (preferences.preferredRegion && preferences.preferredRegion !== 'Toàn quốc') {
      const matchesRegion =
        prog.province.toLowerCase().includes(preferences.preferredRegion.toLowerCase()) ||
        prog.region.toLowerCase().includes(preferences.preferredRegion.toLowerCase());
      if (!matchesRegion && preferences.willingToRelocate === 'no') {
        return; // Skip if student explicitly rejects relocating
      }
    }

    // Filter by desired degree level if specified
    if (preferences.desiredDegree && preferences.desiredDegree !== 'all') {
      const degreeMap: Record<string, string> = {
        university: 'Đại học',
        college: 'Cao đẳng',
        vocational: 'Đào tạo nghề',
      };
      if (prog.degreeLevel !== degreeMap[preferences.desiredDegree]) {
        return;
      }
    }

    // Check topical relevance to selected careers or user preference
    const progText = `${prog.majorName} ${prog.faculty || ''} ${prog.schoolName}`.toLowerCase();
    const isRelevantToCareer = selectedCareerTitles.some((ct) => {
      const words = ct.split(' ');
      return words.some((w) => w.length > 3 && progText.includes(w));
    });

    const isRelevantToUserTry =
      preferences.fieldToTry && progText.includes(preferences.fieldToTry.toLowerCase());

    if (isRelevantToCareer || isRelevantToUserTry || programSuggestions.length < 3) {
      programSuggestions.push({
        program: prog,
        matchReason: `Ngành đào tạo "${prog.majorName}" thuộc hướng chuyên môn của nhóm sở thích và nghề nghiệp gợi ý.`,
        academicFitStatus: 'eligible_reference',
        missingDataNote:
          'Chưa đủ cơ sở đánh giá mức đáp ứng tuyển sinh trực tiếp. Điểm chuẩn được giữ nguyên từ thông báo chính thức năm trước để em tham khảo ngưỡng năng lực.',
      });
    }
  });

  // 7. Four-Week Actionable Exploration Plan
  const fourWeekPlan: FourWeekPlanStep[] = [
    {
      week: 1,
      title: 'Tuần 1: Trải nghiệm thử thách nhỏ (Mini-Project)',
      action: selectedCareers[0]
        ? selectedCareers[0].trialActivities
        : 'Dành 45 phút tìm hiểu 1 video thực tế nghề nghiệp về một ngày làm việc của người trong ngành.',
      outcome: 'Ghi lại 3 điều em thấy thích thú và 2 điều em cảm thấy còn băn khoăn vào sổ tay.',
    },
    {
      week: 2,
      title: 'Tuần 2: Rà soát môn học trọng tâm',
      action:
        developmentAreas.length > 0
          ? `Gặp riêng thầy/cô bộ môn ${developmentAreas[0].subject} để xin lời khuyên về phương pháp tự học và chủ đề cần củng cố.`
          : 'Hệ thống hóa lại sơ đồ tư duy các chuyên đề kiến thức của 2 môn thế mạnh.',
      outcome: 'Có mục tiêu cải thiện cụ thể và thời gian biểu ôn tập 20 phút mỗi ngày.',
    },
    {
      week: 3,
      title: 'Tuần 3: Tìm hiểu thông tin trường & chương trình đào tạo',
      action:
        programSuggestions.length > 0
          ? `Truy cập trang web tuyển sinh chính thức của trường ${programSuggestions[0].program.schoolName}, xem khung chương trình đào tạo ngành ${programSuggestions[0].program.majorName}.`
          : 'Tìm hiểu đề án tuyển sinh chính thức của 1 trường đại học hoặc cao đẳng em quan tâm.',
      outcome: 'Biết rõ các môn sẽ học trong 2 năm đầu và các phương thức xét tuyển hiện hành.',
    },
    {
      week: 4,
      title: 'Tuần 4: Đối thoại cùng Thầy Cô & Gia đình',
      action: 'Chủ động chia sẻ bản tóm tắt La Bàn Tương Lai này với thầy cô chủ nhiệm/hướng nghiệp hoặc cha mẹ.',
      outcome: 'Lắng nghe góc nhìn của người lớn, tháo gỡ lo lắng về chi phí học tập và thống nhất bước chuẩn bị tiếp theo.',
    },
  ];

  // 8. Three Discussion Questions for Conference
  const questionsForDiscussion: string[] = [
    '1. "Với kết quả học tập các môn thế mạnh và điểm cần cải thiện hiện nay, em nên tập trung theo phương thức xét tuyển nào (học bạ, thi tốt nghiệp THPT, hay thi đánh giá năng lực)?"',
    '2. "Nếu em theo đuổi hướng nghề nghiệp này, gia đình và thầy cô thấy những cơ hội thực tế cũng như thách thức lớn nhất mà em cần chuẩn bị từ năm lớp 10-12 là gì?"',
    '3. "Trong 1 tháng tới, em có thể tham gia câu lạc bộ, dự án học tập hoặc ngày hội trải nghiệm nào để kiểm chứng xem mình có thực sự phù hợp với ngành này không?"',
  ];

  // 9. Limitations & Ethical Guardrails
  const limitations: string[] = [
    'Gợi ý tham khảo dựa trên thông tin em cung cấp: Bảng hỏi 12 câu này là công cụ gợi mở tự thiết kế, không phải bài trắc nghiệm tâm lý hay trắc nghiệm năng lực đã chuẩn hóa.',
    'Điểm số là lát cắt hiện tại: Kết quả học tập có thể cải thiện theo thời gian qua phương pháp học và sự rèn luyện; điểm số tự khai chưa phản ánh trọn vẹn tiềm năng phát triển.',
    'Không dự đoán vận mệnh hay phần trăm đỗ: Ứng dụng không tính phần trăm trúng tuyển hay cam kết đỗ đại học. Mọi quyết định tuyển sinh phụ thuộc vào thông báo và đề án chính thức của cơ sở đào tạo.',
    'Bình đẳng các bậc học: Đại học, cao đẳng và đào tạo nghề đều là những con đường học tập có giá trị, cần được cân nhắc dựa trên điều kiện thực tế và mong muốn của em.',
  ];

  const studentDisplayLabel = profile.nameOrCode.trim() || 'Học sinh';

  return {
    mode: 'rule_based',
    summary,
    studentDisplayLabel,
    evidence,
    interestScores,
    learningStrengths,
    developmentAreas,
    careerSuggestions,
    programSuggestions: programSuggestions.slice(0, 4),
    fourWeekPlan,
    questionsForDiscussion,
    limitations,
    dataAudit: {
      usedInputs,
      missingInputs,
    },
    analyzedAt,
  };
}
