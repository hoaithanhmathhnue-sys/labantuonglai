import React, { useState, useEffect } from 'react';
import { AdmissionProgramRecord, StudentProfile, SubjectRecord, InterestAnswer, ExperiencePreferences } from '../types';
import { INITIAL_SUBJECTS } from '../data/questionnaire';
import { X, Plus, CheckCircle, ExternalLink, Trash2, ShieldCheck, Play, Database, Beaker } from 'lucide-react';

interface TeacherAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTestFixture: (
    profile: StudentProfile,
    subjects: SubjectRecord[],
    answers: InterestAnswer[],
    preferences: ExperiencePreferences
  ) => void;
  enableTeacherAiMode: boolean;
  onToggleTeacherAiMode: (enabled: boolean) => void;
}

export const TeacherAdminModal: React.FC<TeacherAdminModalProps> = ({
  isOpen,
  onClose,
  onLoadTestFixture,
  enableTeacherAiMode,
  onToggleTeacherAiMode,
}) => {
  const [activeTab, setActiveTab] = useState<'admissions' | 'fixtures' | 'aiSettings'>('admissions');
  const [admissions, setAdmissions] = useState<AdmissionProgramRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New admission form state
  const [newProgram, setNewProgram] = useState({
    schoolName: '',
    majorName: '',
    majorCode: '',
    province: '',
    region: 'Miền Bắc' as 'Miền Bắc' | 'Miền Trung' | 'Miền Nam',
    faculty: '',
    degreeLevel: 'Đại học' as 'Đại học' | 'Cao đẳng' | 'Đào tạo nghề',
    admissionYear: 2025,
    admissionMethod: 'Xét điểm thi tốt nghiệp THPT',
    requirementSummary: '',
    benchmarkScore: '',
    scoreScale: 30,
    tuitionInfo: '',
    sourceUrl: '',
    verifiedBy: 'Thầy/Cô tổ Hướng nghiệp',
  });

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admissions');
      if (res.ok) {
        const json = await res.json();
        setAdmissions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load admissions db:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdmissions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.schoolName || !newProgram.majorName || !newProgram.sourceUrl) {
      alert('Vui lòng điền đủ Tên trường, Tên ngành và Đường dẫn nguồn tuyển sinh chính thức.');
      return;
    }

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProgram,
          benchmarkScore: newProgram.benchmarkScore ? parseFloat(newProgram.benchmarkScore) : undefined,
          status: 'verified',
        }),
      });

      if (res.ok) {
        alert('Đã bổ sung bản ghi tuyển sinh vào kho dữ liệu thành công!');
        setShowAddForm(false);
        setNewProgram({
          schoolName: '',
          majorName: '',
          majorCode: '',
          province: '',
          region: 'Miền Bắc',
          faculty: '',
          degreeLevel: 'Đại học',
          admissionYear: 2025,
          admissionMethod: 'Xét điểm thi tốt nghiệp THPT',
          requirementSummary: '',
          benchmarkScore: '',
          scoreScale: 30,
          tuitionInfo: '',
          sourceUrl: '',
          verifiedBy: 'Thầy/Cô tổ Hướng nghiệp',
        });
        fetchAdmissions();
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi lưu bản ghi.');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!confirm('Thầy/Cô có chắc chắn muốn xóa bản ghi tuyển sinh này khỏi kho?')) return;
    try {
      const res = await fetch(`/api/admissions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdmissions((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Predefined Fixtures for Teachers to test the application
  const loadFixture = (type: 'balanced' | 'low_score_high_interest' | 'all_unexperienced' | 'tie_scores') => {
    const defaultSubjs: SubjectRecord[] = INITIAL_SUBJECTS.map((s) => ({
      ...s,
      score: 8.0,
      scoreInput: '8.0',
      interest: 4,
      isNotStudied: false,
      isNoScoreYet: false,
    }));

    if (type === 'balanced') {
      const answers: InterestAnswer[] = [
        { questionId: 'R1', rating: 4 }, { questionId: 'R2', rating: 3 },
        { questionId: 'I1', rating: 5 }, { questionId: 'I2', rating: 5 },
        { questionId: 'A1', rating: 3 }, { questionId: 'A2', rating: 4 },
        { questionId: 'S1', rating: 3 }, { questionId: 'S2', rating: 2 },
        { questionId: 'E1', rating: 3 }, { questionId: 'E2', rating: 2 },
        { questionId: 'C1', rating: 3 }, { questionId: 'C2', rating: 3 },
      ];
      onLoadTestFixture(
        { nameOrCode: 'Nguyễn Văn An (Mẫu 1)', grade: 11, graduationYear: 2027 },
        defaultSubjs,
        answers,
        {
          proudAchievement: 'Từng đạt giải Nhì kỳ thi Học sinh giỏi Tin học cấp trường',
          fieldToTry: 'Khoa học máy tính & Trí tuệ nhân tạo',
          preferredRegion: 'Miền Bắc',
          desiredDegree: 'university',
        }
      );
    } else if (type === 'low_score_high_interest') {
      // Math and Physics low, but high interest in engineering
      const customSubjs = defaultSubjs.map((s) => {
        if (s.name === 'Toán học') return { ...s, score: 5.5, scoreInput: '5.5', interest: 5 };
        if (s.name === 'Vật lí') return { ...s, score: 5.0, scoreInput: '5.0', interest: 5 };
        return { ...s, score: 7.0, scoreInput: '7.0', interest: 3 };
      });
      const answers: InterestAnswer[] = [
        { questionId: 'R1', rating: 5 }, { questionId: 'R2', rating: 5 },
        { questionId: 'I1', rating: 4 }, { questionId: 'I2', rating: 4 },
        { questionId: 'A1', rating: 2 }, { questionId: 'A2', rating: 2 },
        { questionId: 'S1', rating: 2 }, { questionId: 'S2', rating: 2 },
        { questionId: 'E1', rating: 2 }, { questionId: 'E2', rating: 2 },
        { questionId: 'C1', rating: 3 }, { questionId: 'C2', rating: 3 },
      ];
      onLoadTestFixture(
        { nameOrCode: 'Trần Minh Đức (Mẫu 2: Điểm thấp nhưng thích kỹ thuật)', grade: 10, graduationYear: 2028 },
        customSubjs,
        answers,
        {
          proudAchievement: 'Tự sửa được quạt điện và máy bơm mini ở nhà',
          fieldToTry: 'Cơ điện tử',
          preferredRegion: 'Miền Nam',
          desiredDegree: 'college',
        }
      );
    } else if (type === 'all_unexperienced') {
      // All 12 items marked unexperienced
      const answers: InterestAnswer[] = [
        { questionId: 'R1', rating: 'unexperienced' }, { questionId: 'R2', rating: 'unexperienced' },
        { questionId: 'I1', rating: 'unexperienced' }, { questionId: 'I2', rating: 'unexperienced' },
        { questionId: 'A1', rating: 'unexperienced' }, { questionId: 'A2', rating: 'unexperienced' },
        { questionId: 'S1', rating: 'unexperienced' }, { questionId: 'S2', rating: 'unexperienced' },
        { questionId: 'E1', rating: 'unexperienced' }, { questionId: 'E2', rating: 'unexperienced' },
        { questionId: 'C1', rating: 'unexperienced' }, { questionId: 'C2', rating: 'unexperienced' },
      ];
      onLoadTestFixture(
        { nameOrCode: 'Lê Thu Trang (Mẫu 3: Chưa có trải nghiệm)', grade: 12, graduationYear: 2026 },
        defaultSubjs,
        answers,
        { preferredRegion: 'Toàn quốc', desiredDegree: 'all' }
      );
    } else if (type === 'tie_scores') {
      // Exactly tied scores between A (Creative) and I (Research)
      const answers: InterestAnswer[] = [
        { questionId: 'R1', rating: 2 }, { questionId: 'R2', rating: 2 },
        { questionId: 'I1', rating: 5 }, { questionId: 'I2', rating: 5 },
        { questionId: 'A1', rating: 5 }, { questionId: 'A2', rating: 5 },
        { questionId: 'S1', rating: 3 }, { questionId: 'S2', rating: 3 },
        { questionId: 'E1', rating: 2 }, { questionId: 'E2', rating: 2 },
        { questionId: 'C1', rating: 2 }, { questionId: 'C2', rating: 2 },
      ];
      onLoadTestFixture(
        { nameOrCode: 'Phạm Hải Đăng (Mẫu 4: Đồng điểm Sáng tạo & Nghiên cứu)', grade: 11, graduationYear: 2027 },
        defaultSubjs,
        answers,
        {
          fieldToTry: 'Thiết kế đồ họa đa phương tiện',
          preferredRegion: 'Miền Trung',
          desiredDegree: 'university',
        }
      );
    }

    alert('Đã nạp hồ sơ kiểm thử thành công! Mời Thầy/Cô đóng bảng này để xem kết quả phân tích.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Không gian Quản trị Tuyển sinh & Kiểm thử (Dành cho Giáo viên)
              </h3>
              <p className="text-xs text-slate-500">
                Quản lý kho dữ liệu tuyển sinh chính thức và chạy các kịch bản kiểm thử sư phạm.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admissions'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Kho Dữ liệu Tuyển sinh ({admissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Beaker className="w-3.5 h-3.5" />
            <span>Kịch bản Kiểm thử Hồ sơ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aiSettings')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aiSettings'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mô-đun AI & Điều khoản 18+</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: ADMISSIONS REPOSITORY */}
          {activeTab === 'admissions' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="">Tất cả các miền</option>
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bản ghi tuyển sinh mới</span>
                </button>
              </div>

              {/* Add Record Form */}
              {showAddForm && (
                <form onSubmit={handleAddAdmission} className="p-4 bg-slate-50 rounded-xl border border-teal-200 mb-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Khai báo bản ghi tuyển sinh chính thức
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Tên trường *</label>
                      <input
                        type="text"
                        required
                        value={newProgram.schoolName}
                        onChange={(e) => setNewProgram({ ...newProgram, schoolName: e.target.value })}
                        placeholder="Ví dụ: Trường Đại học Bách khoa Hà Nội"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Tên ngành / chương trình *</label>
                      <input
                        type="text"
                        required
                        value={newProgram.majorName}
                        onChange={(e) => setNewProgram({ ...newProgram, majorName: e.target.value })}
                        placeholder="Ví dụ: Kỹ thuật Cơ điện tử"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Khu vực *</label>
                      <select
                        value={newProgram.region}
                        onChange={(e) => setNewProgram({ ...newProgram, region: e.target.value as 'Miền Bắc' | 'Miền Trung' | 'Miền Nam' })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Miền Bắc">Miền Bắc</option>
                        <option value="Miền Trung">Miền Trung</option>
                        <option value="Miền Nam">Miền Nam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Bậc học *</label>
                      <select
                        value={newProgram.degreeLevel}
                        onChange={(e) => setNewProgram({ ...newProgram, degreeLevel: e.target.value as 'Đại học' | 'Cao đẳng' | 'Đào tạo nghề' })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Đại học">Đại học</option>
                        <option value="Cao đẳng">Cao đẳng</option>
                        <option value="Đào tạo nghề">Đào tạo nghề</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Điểm chuẩn tham khảo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProgram.benchmarkScore}
                        onChange={(e) => setNewProgram({ ...newProgram, benchmarkScore: e.target.value })}
                        placeholder="Ví dụ: 26.50"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Đường dẫn nguồn chính thức *</label>
                      <input
                        type="url"
                        required
                        value={newProgram.sourceUrl}
                        onChange={(e) => setNewProgram({ ...newProgram, sourceUrl: e.target.value })}
                        placeholder="https://tuyensinh...edu.vn"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Người duyệt / Chức danh</label>
                      <input
                        type="text"
                        value={newProgram.verifiedBy}
                        onChange={(e) => setNewProgram({ ...newProgram, verifiedBy: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Tóm tắt điều kiện & tổ hợp xét tuyển</label>
                    <input
                      type="text"
                      value={newProgram.requirementSummary}
                      onChange={(e) => setNewProgram({ ...newProgram, requirementSummary: e.target.value })}
                      placeholder="Ví dụ: Tổ hợp A00, A01; Điểm Toán >= 7.5"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Lưu và duyệt bản ghi
                    </button>
                  </div>
                </form>
              )}

              {/* Admissions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Trường & Ngành</th>
                      <th className="p-3">Khu vực / Bậc</th>
                      <th className="p-3">Phương thức & Điểm</th>
                      <th className="p-3">Nguồn xác minh</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissions
                      .filter((a) => !filterRegion || a.region === filterRegion)
                      .map((adm) => (
                        <tr key={adm.id} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <strong className="text-slate-800 block">{adm.majorName}</strong>
                            <span className="text-slate-500 text-[11px]">{adm.schoolName}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit mb-0.5">
                              {adm.degreeLevel}
                            </span>
                            <span className="text-slate-500 text-[11px]">{adm.region}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-teal-800">
                              {adm.benchmarkScore ? `${adm.benchmarkScore} điểm` : 'Xét hồ sơ'}
                            </span>
                            <span className="text-slate-400 block text-[11px]">{adm.admissionMethod}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-700 block font-medium">{adm.verifiedBy}</span>
                            <a
                              href={adm.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-700 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                            >
                              <span>Đề án chính thức</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmission(adm.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Xóa bản ghi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FIXTURES TESTING */}
          {activeTab === 'fixtures' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 text-teal-900">
                <strong>Chức năng nạp hồ sơ giả lập để kiểm thử:</strong> Thầy/Cô có thể nhanh chóng nạp các kịch bản thực tế để quan sát hành vi của hệ thống (xử lý đồng điểm, dữ liệu ít, hoặc trường hợp điểm thấp nhưng rất thích nghề).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Kịch bản 1: Hồ sơ cân bằng tiêu chuẩn
                  </h4>
                  <p className="text-slate-600 text-xs mb-3">
                    Học sinh có điểm học tập đồng đều, thể hiện rõ hứng thú ở mảng Nghiên cứu & Phân tích (Toán, Tin).
                  </p>
                  <button
                    type="button"
                    onClick={() => loadFixture('balanced')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Nạp kịch bản 1</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Kịch bản 2: Điểm thấp nhưng thích kỹ thuật
                  </h4>
                  <p className="text-slate-600 text-xs mb-3">
                    Toán & Lí ở mức 5.0 - 5.5 nhưng thích hoạt động cơ khí, kỹ thuật (R1, R2 mức 5). Kiểm tra thông điệp sư phạm không gán nhãn kém.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadFixture('low_score_high_interest')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Nạp kịch bản 2</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Kịch bản 3: 100% "Chưa trải nghiệm"
                  </h4>
                  <p className="text-slate-600 text-xs mb-3">
                    Cả 12 câu đều chọn Chưa trải nghiệm. Kiểm tra hệ thống không chia cho 0, không tính là 0 điểm và thông báo dữ liệu thiếu trung thực.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadFixture('all_unexperienced')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Nạp kịch bản 3</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Kịch bản 4: Đồng điểm Sáng tạo & Nghiên cứu
                  </h4>
                  <p className="text-slate-600 text-xs mb-3">
                    Hai nhóm có điểm trung bình bằng nhau tuyệt đối. Kiểm tra cả 2 hướng được giữ nguyên vẹn thay vì chọn ngẫu nhiên 1 nghề.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadFixture('tie_scores')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Nạp kịch bản 4</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & UNDER-18 TERMS */}
          {activeTab === 'aiSettings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2">
                  Chính sách độ tuổi & Tích hợp Gemini API
                </h4>
                <p className="text-slate-600 leading-relaxed mb-3">
                  Theo Điều khoản dịch vụ Gemini API, dịch vụ không được triển khai cho ứng dụng trực tiếp hướng tới người dưới 18 tuổi. Vì vậy:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 mb-4">
                  <li><strong>Bản mặc định dành cho học sinh:</strong> Chạy hoàn toàn trên máy chủ bằng công cụ phân tích quy tắc sư phạm minh bạch.</li>
                  <li><strong>Bảo vệ định danh học sinh:</strong> Họ tên và ngày sinh KHÔNG BAO GIỜ được gửi sang bất kỳ dịch vụ phân tích AI nào.</li>
                  <li><strong>Mô-đun GeminiAdapter:</strong> Được chuẩn bị sẵn ở máy chủ với SDK <code>@google/genai</code> và kiểm định cấu trúc JSON chặt chẽ (Structured Output), chỉ dùng cho mục đích đánh giá nội bộ của giáo viên hoặc người dùng trên 18 tuổi.</li>
                </ul>

                <div className="p-4 rounded-xl bg-white border border-teal-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block">Kích hoạt chế độ kiểm thử Trợ lý AI (Chỉ cho Giáo viên):</strong>
                    <span className="text-slate-500 text-[11px]">
                      Khi bật, máy chủ sẽ dùng GeminiAdapter để trau chuốt lời khuyên sư phạm (dữ liệu học sinh đã được ẩn danh tuyệt đối).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={enableTeacherAiMode}
                      onChange={(e) => onToggleTeacherAiMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs cursor-pointer"
          >
            Đóng bảng quản trị
          </button>
        </div>
      </div>
    </div>
  );
};
