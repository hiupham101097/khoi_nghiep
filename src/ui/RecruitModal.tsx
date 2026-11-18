// ============================================================================
// CEO EMPIRE: RECRUITMENT & TALENT ACQUISITION (Sàn Tuyển Dụng Nhân Tài IT 2.0)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { CandidateEntity, RecruitmentTier, EmployeeAIEntity } from '../types';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { X, CheckCircle, Briefcase, Award, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';
import { AVAILABLE_OFFICES } from '../engine/economy/CompanyManager';

interface RecruitModalProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const RecruitModal: React.FC<RecruitModalProps> = ({ gsm, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<RecruitmentTier>('STANDARD');
  const [candidates, setCandidates] = useState<Record<RecruitmentTier, CandidateEntity[]>>({
    STANDARD: EmployeeAIEngine.generateCandidates('STANDARD', gsm.playerStats.reputation),
    SPONSORED_TOPCV: EmployeeAIEngine.generateCandidates('SPONSORED_TOPCV', gsm.playerStats.reputation),
    HEADHUNTER_EXECUTIVE: EmployeeAIEngine.generateCandidates('HEADHUNTER_EXECUTIVE', gsm.playerStats.reputation)
  });

  const [offeredSalaries, setOfferedSalaries] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const all = [
      ...EmployeeAIEngine.generateCandidates('STANDARD', 10),
      ...EmployeeAIEngine.generateCandidates('SPONSORED_TOPCV', 10),
      ...EmployeeAIEngine.generateCandidates('HEADHUNTER_EXECUTIVE', 10)
    ];
    all.forEach((c) => {
      initial[c.id] = c.expectedSalary;
    });
    return initial;
  });

  const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === gsm.currentOfficeId) || AVAILABLE_OFFICES[0];
  const isOfficeFull = gsm.employees.length >= currentOffice.maxDesks;

  const tierFees: Record<RecruitmentTier, number> = {
    STANDARD: 1000000,
    SPONSORED_TOPCV: 5000000,
    HEADHUNTER_EXECUTIVE: 15000000
  };

  const handleHire = (candidate: CandidateEntity) => {
    if (isOfficeFull) {
      alert(`Văn phòng hiện tại đã kín chỗ (${currentOffice.maxDesks} bàn). Hãy nâng cấp văn phòng trước khi tuyển thêm!`);
      return;
    }

    const offered = offeredSalaries[candidate.id] || candidate.expectedSalary;
    const fee = tierFees[selectedTier];

    // Kiểm tra đàm phán lương
    if (offered < candidate.expectedSalary * 0.75) {
      alert(`Đàm phán thất bại: Mức lương ${offered.toLocaleString('vi-VN')} VNĐ quá thấp so với kỳ vọng (${candidate.expectedSalary.toLocaleString('vi-VN')} VNĐ). Ứng viên từ chối ký kết!`);
      return;
    }

    if (gsm.playerStats.cash < fee) {
      alert(`Không đủ tiền mặt để thanh toán chi phí tuyển dụng gói ${selectedTier} (${fee.toLocaleString('vi-VN')} VNĐ)!`);
      return;
    }

    // Trừ phí tuyển dụng
    gsm.playerStats.cash -= fee;

    const isSatisfied = offered >= candidate.expectedSalary;
    const initialFrustration = isSatisfied ? 0 : 25;
    const initialMorale = isSatisfied ? 88 : 65;
    const initialLoyalty = isSatisfied ? 80 : 60;

    const newEmp: EmployeeAIEntity = {
      id: candidate.id,
      name: candidate.name,
      age: candidate.age || 24,
      avatarSeed: candidate.avatarSeed,
      gender: candidate.gender,
      role: candidate.role,
      level: candidate.level,
      experienceYears: candidate.experienceYears,
      personality: candidate.personality,
      speed: candidate.speed,
      quality: candidate.quality,
      bugRate: candidate.bugRate,
      skillLevels: candidate.skillLevels || {
        frontend: candidate.role === 'FRONTEND' ? candidate.quality : 40,
        backend: candidate.role === 'BACKEND' ? candidate.quality : 40,
        design: candidate.role === 'DESIGNER' ? candidate.quality : 30,
        testing: candidate.role === 'TESTER' ? candidate.quality : 35,
        devops: 30
      },
      salary: offered,
      salaryExpectation: candidate.expectedSalary,
      currentSalary: offered,
      expectedSalary: candidate.expectedSalary,
      health: 100,
      energy: 100,
      morale: initialMorale,
      happiness: initialMorale,
      stress: 10,
      frustration: initialFrustration,
      resentment: initialFrustration,
      loyalty: initialLoyalty,
      trustInCEO: isSatisfied ? 80 : 65,
      ceoTrust: isSatisfied ? 80 : 65,
      ambition: candidate.ambition,
      behaviorState: 'WORKING',
      currentState: 'WORK',
      currentTask: {
        projectId: null,
        taskType: 'IDLE',
        description: 'Mới gia nhập công ty',
        progress: 0,
        efficiencyMultiplier: 1.0
      },
      deskIndex: gsm.employees.length,
      assignedProjectId: null,
      isProbation: true,
      probationDaysLeft: 30,
      totalLinesOfCodeProduced: 0,
      totalBugsProduced: 0,
      totalBugsFixed: 0,
      isStriking: false,
      hasGivenNotice: false,
      daysUntilQuit: 0,
      relationships: {},
      colleagueRelations: {},
      memories: [],
      memoryLog: []
    };

    EmployeeAIEngine.initAI2Fields(newEmp);
    EmployeeAIEngine.addMemory(
      newEmp,
      'HIRED',
      `Chính thức ký hợp đồng gia nhập công ty (Lương: ${offered.toLocaleString('vi-VN')} VNĐ/tháng). Bắt đầu 30 ngày thử việc.`,
      isSatisfied ? 20 : -5,
      isSatisfied ? 20 : 0,
      gsm.timeManager.day
    );

    gsm.employees.push(newEmp);
    gsm.decisionLog.push(`Tuyển dụng thành công: ${candidate.name} (${candidate.role} • ${candidate.level}) qua kênh ${selectedTier}.`);
    gsm.addFloatingText(`+1 NHÂN SỰ: ${candidate.name}`, 380, 200, '#38bdf8');
    soundManager.playSuccess();
    gsm.notify();
    onClose();
  };

  const currentList = candidates[selectedTier] || [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Sàn Tuyển Dụng & Phỏng Vấn IT Chuyên Sâu 2.0
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Văn phòng: {gsm.employees.length}/{currentOffice.maxDesks} bàn làm việc • Quỹ tiền mặt: {gsm.playerStats.cash.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lựa chọn Kênh Tuyển Dụng (Recruitment Tiers) */}
        <div className="bg-slate-950/60 p-2 sm:px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'STANDARD' as RecruitmentTier, label: 'Kênh Phổ Thông', fee: '1.000.000đ', desc: 'Junior / Mid' },
            { id: 'SPONSORED_TOPCV' as RecruitmentTier, label: 'Sponsored TopCV / LinkedIn', fee: '5.000.000đ', desc: 'Mid / Senior vững vàng' },
            { id: 'HEADHUNTER_EXECUTIVE' as RecruitmentTier, label: 'Executive Headhunt', fee: '15.000.000đ', desc: 'Senior / Tech Lead tinh hoa' }
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                setSelectedTier(tier.id);
                soundManager.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 border ${
                selectedTier === tier.id
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{tier.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${selectedTier === tier.id ? 'bg-sky-800 text-sky-200' : 'bg-slate-800 text-amber-400'}`}>
                {tier.fee}
              </span>
            </button>
          ))}
        </div>

        {/* Danh sách ứng viên theo kênh */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4">
          {currentList.map((cand) => {
            const isAlreadyHired = gsm.employees.some((e) => e.id === cand.id);
            const currentOffer = offeredSalaries[cand.id] ?? cand.expectedSalary;
            const ratio = currentOffer / cand.expectedSalary;

            return (
              <div key={cand.id} className="bg-slate-800/80 border border-slate-700 p-4 sm:p-5 rounded-xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-700 border-2 border-sky-400 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                      {cand.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 flex items-center gap-2 flex-wrap text-sm sm:text-base">
                        {cand.name} ({cand.age || 24}t)
                        <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-2 py-0.5 rounded font-mono">
                          {cand.role} • {cand.level} ({cand.experienceYears} năm KN)
                        </span>
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded font-mono">
                          Tính cách: {cand.personality}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">{cand.bio}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Kỳ vọng mức lương:</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                      {cand.expectedSalary.toLocaleString('vi-VN')} đ/tháng
                    </span>
                  </div>
                </div>

                {/* Radar Kỹ Năng Chuyên Sâu */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Frontend:</span>
                    <p className="font-bold text-sky-300">{cand.skillLevels?.frontend || 50}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Backend:</span>
                    <p className="font-bold text-emerald-400">{cand.skillLevels?.backend || 50}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Design UI/UX:</span>
                    <p className="font-bold text-pink-400">{cand.skillLevels?.design || 40}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Testing/QA:</span>
                    <p className="font-bold text-amber-400">{cand.skillLevels?.testing || 45}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">DevOps/Cloud:</span>
                    <p className="font-bold text-indigo-400">{cand.skillLevels?.devops || 35}/100</p>
                  </div>
                </div>

                {/* Đàm phán lương & Ký Hợp Đồng Thử Việc */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2.5 border-t border-slate-700/60 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-300">Đề xuất mức lương:</span>
                    <input
                      type="number"
                      step={1000000}
                      value={currentOffer}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setOfferedSalaries({ ...offeredSalaries, [cand.id]: val });
                      }}
                      className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-xs text-emerald-400 font-mono font-bold w-32 sm:w-36"
                    />
                    <span className="text-[10px] font-semibold">
                      {ratio >= 1.0 ? (
                        <span className="text-emerald-400">✅ Đạt kỳ vọng (+Tinh thần, +Trung thành)</span>
                      ) : ratio >= 0.75 ? (
                        <span className="text-amber-400">⚠️ Thử việc với 85% lương</span>
                      ) : (
                        <span className="text-rose-400 font-bold">❌ Quá thấp, ứng viên sẽ từ chối!</span>
                      )}
                    </span>
                  </div>

                  {isAlreadyHired ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Đã Ký Hợp Đồng
                    </span>
                  ) : (
                    <button
                      onClick={() => handleHire(cand)}
                      disabled={isOfficeFull || ratio < 0.75}
                      className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ký Hợp Đồng Thử Việc 30 Ngày</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
