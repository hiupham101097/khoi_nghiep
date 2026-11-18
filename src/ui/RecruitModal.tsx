// ============================================================================
// CEO EMPIRE: RECRUITMENT MODAL (Sàn Tuyển Dụng Nhân Tài Công Nghệ)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { CandidateEntity } from '../types';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { X, CheckCircle } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';
import { AVAILABLE_OFFICES } from '../engine/economy/CompanyManager';

interface RecruitModalProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const RecruitModal: React.FC<RecruitModalProps> = ({ gsm, onClose }) => {
  const [candidates] = useState<CandidateEntity[]>(() => EmployeeAIEngine.generateRecruitmentPool());
  const [offeredSalaries, setOfferedSalaries] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    EmployeeAIEngine.generateRecruitmentPool().forEach((c) => {
      initial[c.id] = c.expectedSalary;
    });
    return initial;
  });

  const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === gsm.currentOfficeId) || AVAILABLE_OFFICES[0];
  const isOfficeFull = gsm.employees.length >= currentOffice.maxDesks;

  const handleHire = (candidate: CandidateEntity) => {
    if (isOfficeFull) {
      alert(`Văn phòng hiện tại đã kín chỗ (${currentOffice.maxDesks} bàn). Hãy nâng cấp văn phòng trước khi tuyển thêm!`);
      return;
    }

    const offered = offeredSalaries[candidate.id] || candidate.expectedSalary;

    // Phí tuyển dụng & thủ tục hợp đồng: 3.000.000đ
    if (gsm.playerStats.cash < 3000000) {
      alert('Không đủ tiền mặt để thanh toán chi phí đăng tuyển & ký kết hợp đồng (3 triệu VNĐ)!');
      return;
    }

    gsm.playerStats.cash -= 3000000;

    gsm.employees.push({
      id: candidate.id,
      name: candidate.name,
      avatarSeed: candidate.avatarSeed,
      gender: candidate.gender,
      role: candidate.role,
      level: candidate.level,
      experienceYears: candidate.experienceYears,
      speed: candidate.speed,
      quality: candidate.quality,
      bugRate: candidate.bugRate,
      expectedSalary: candidate.expectedSalary,
      currentSalary: offered,
      energy: 100,
      happiness: offered >= candidate.expectedSalary ? 85 : 65,
      stress: 15,
      resentment: offered < candidate.expectedSalary ? 25 : 5,
      loyalty: 75,
      ceoTrust: 75,
      ambition: candidate.ambition,
      currentState: 'WORK',
      deskIndex: gsm.employees.length,
      assignedProjectId: null,
      isStriking: false,
      hasGivenNotice: false,
      daysUntilQuit: 0,
      memoryLog: [`Gia nhập công ty với mức lương ${offered.toLocaleString('vi-VN')} VNĐ/tháng.`]
    });

    gsm.decisionLog.push(`Tuyển dụng thành công: ${candidate.name} (${candidate.role})`);
    soundManager.playSuccess();
    gsm.notify();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Sàn Tuyển Dụng & Phỏng Vấn Ứng Viên IT</h3>
            <p className="text-xs text-slate-400">
              Văn phòng: {gsm.employees.length}/{currentOffice.maxDesks} chỗ ngồi • Phí tuyển dụng: 3.000.000 VNĐ/người
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách ứng viên */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {candidates.map((cand) => {
            const isAlreadyHired = gsm.employees.some((e) => e.id === cand.id);
            const currentOffer = offeredSalaries[cand.id] ?? cand.expectedSalary;

            return (
              <div key={cand.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-sky-400 flex items-center justify-center text-2xl">
                      {cand.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 flex items-center gap-2">
                        {cand.name}
                        <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-2 py-0.5 rounded font-mono">
                          {cand.role} • {cand.level} ({cand.experienceYears} năm KN)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">{cand.bio}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Kỳ vọng lương:</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {cand.expectedSalary.toLocaleString('vi-VN')} đ/tháng
                    </span>
                  </div>
                </div>

                {/* Các chỉ số kỹ năng */}
                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400">Tốc độ code:</span>
                    <p className="font-bold text-sky-300 font-mono">{cand.speed}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Chất lượng:</span>
                    <p className="font-bold text-emerald-400 font-mono">{cand.quality}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tỷ lệ sinh lỗi:</span>
                    <p className="font-bold text-amber-400 font-mono">{cand.bugRate}%</p>
                  </div>
                </div>

                {/* Đàm phán lương & Nút tuyển dụng */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300">Mức lương đề xuất:</span>
                    <input
                      type="number"
                      step={1000000}
                      value={currentOffer}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setOfferedSalaries({ ...offeredSalaries, [cand.id]: val });
                      }}
                      className="bg-slate-900 border border-slate-700 px-3 py-1 rounded text-xs text-emerald-400 font-mono font-bold w-36"
                    />
                    <span className="text-[10px] text-slate-400">
                      {currentOffer < cand.expectedSalary ? '⚠️ Ép lương có thể gây bất mãn ban đầu' : '✅ Đạt kỳ vọng'}
                    </span>
                  </div>

                  {isAlreadyHired ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Đã Tuyển
                    </span>
                  ) : (
                    <button
                      onClick={() => handleHire(cand)}
                      disabled={isOfficeFull}
                      className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Ký Hợp Đồng Tuyển Dụng
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
