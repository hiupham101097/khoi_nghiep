// ============================================================================
// CEO EMPIRE: EMPLOYEE REVIEW & 1-ON-1 DOSSIER (Hồ Sơ Nhân Sự & Đối Thoại 1-1 AI 2.0)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { EmployeeAIEntity, SkillLevel } from '../types';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { soundManager } from '../engine/core/SoundManager';
import {
  X,
  Award,
  AlertTriangle,
  Coffee,
  DollarSign,
  Heart,
  Shield,
  UserMinus,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Code2,
  Bug,
  BrainCircuit
} from 'lucide-react';

interface EmployeeReviewModalProps {
  gsm: GameStateManager;
  employee: EmployeeAIEntity;
  onClose: () => void;
}

export const EmployeeReviewModal: React.FC<EmployeeReviewModalProps> = ({ gsm, employee, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'PSYCHOLOGY' | 'SKILLS' | 'MEMORIES' | 'RELATIONS'>('PSYCHOLOGY');
  EmployeeAIEngine.initAI2Fields(employee);

  // Thưởng nóng
  const handleBonus = (amount: number) => {
    if (gsm.playerStats.cash < amount) {
      alert(`Không đủ tiền mặt để thưởng nóng (Cần ${amount.toLocaleString('vi-VN')} VNĐ)!`);
      return;
    }
    gsm.playerStats.cash -= amount;
    EmployeeAIEngine.rewardEmployee(employee, amount, gsm.timeManager.day);
    gsm.decisionLog.push(`Thưởng nóng ${amount.toLocaleString('vi-VN')} VNĐ cho ${employee.name}.`);
    gsm.addFloatingText(`+THƯỞNG: ${employee.name}`, 380, 200, '#22c55e');
    gsm.notify();
  };

  // Tăng lương định kỳ
  const handleSalaryRaise = (raiseAmount: number) => {
    const newSalary = employee.salary + raiseAmount;
    EmployeeAIEngine.raiseSalary(employee, newSalary, gsm.timeManager.day);
    gsm.decisionLog.push(`Nâng lương cho ${employee.name} lên ${newSalary.toLocaleString('vi-VN')} VNĐ/tháng.`);
    gsm.addFloatingText(`+LƯƠNG: ${employee.name}`, 380, 200, '#38bdf8');
    soundManager.playSuccess();
    gsm.notify();
  };

  // Thăng chức
  const handlePromote = () => {
    const levelHierarchy: SkillLevel[] = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
    const currentIdx = levelHierarchy.indexOf(employee.level);

    if (currentIdx >= levelHierarchy.length - 1) {
      alert(`${employee.name} đã đạt cấp độ cao nhất: LEAD!`);
      return;
    }

    const nextLevel = levelHierarchy[currentIdx + 1];
    EmployeeAIEngine.promoteEmployee(employee, nextLevel, gsm.timeManager.day);
    gsm.decisionLog.push(`🏆 Bổ nhiệm thăng chức cho ${employee.name} lên ${nextLevel}!`);
    gsm.addFloatingText(`🏆 THĂNG CẤP: ${nextLevel}`, 380, 200, '#a855f7');
    gsm.notify();
  };

  // Cho nghỉ phép xả stress
  const handleGiveLeave = () => {
    employee.energy = 100;
    employee.stress = Math.max(0, employee.stress - 40);
    employee.morale = Math.min(100, employee.morale + 25);
    employee.happiness = employee.morale;
    employee.speechBubble = 'Cảm ơn sếp đã cho em ngày nghỉ trọn vẹn lấy lại tinh thần!';
    employee.speechTimer = 5;
    EmployeeAIEngine.addMemory(employee, 'COLLEAGUE_BONDING', 'Được CEO đặc cách cho nghỉ phép phục hồi thể lực và năng lượng.', 25, 20, gsm.timeManager.day);
    soundManager.playSuccess();
    gsm.notify();
  };

  // Đối thoại tâm lý 1-1 / Định hướng nghề nghiệp
  const handleMentoring1on1 = () => {
    employee.frustration = Math.max(0, employee.frustration - 30);
    employee.resentment = employee.frustration;
    employee.trustInCEO = Math.min(100, employee.trustInCEO + 25);
    employee.ceoTrust = employee.trustInCEO;
    employee.morale = Math.min(100, employee.morale + 20);
    employee.happiness = employee.morale;
    employee.speechBubble = 'Sau buổi trò chuyện với CEO, em cảm thấy định hướng rõ ràng và yên tâm hơn rất nhiều!';
    employee.speechTimer = 6;

    if (employee.behaviorState === 'REQUESTING_RAISE') {
      employee.behaviorState = 'WORKING';
      employee.currentState = 'WORK';
    }

    EmployeeAIEngine.addMemory(employee, 'COLLEAGUE_BONDING', 'CEO dành thời gian đối thoại 1-1, lắng nghe tâm tư và định hướng lộ trình thăng tiến.', 20, 25, gsm.timeManager.day);
    soundManager.playSuccess();
    gsm.decisionLog.push(`Đối thoại 1-1 thành công cùng ${employee.name}: Giải tỏa bức xúc và thắt chặt niềm tin.`);
    gsm.notify();
  };

  // Sa thải nhân sự
  const handleFire = () => {
    if (confirm(`Bạn có chắc chắn muốn sa thải ${employee.name}? Hành động này có thể gây lo lắng cho các nhân sự còn lại.`)) {
      gsm.employees = gsm.employees.filter((e) => e.id !== employee.id);
      // Giảm nhẹ niềm tin đồng nghiệp
      gsm.employees.forEach((e) => {
        e.trustInCEO = Math.max(0, e.trustInCEO - 12);
        e.ceoTrust = e.trustInCEO;
        e.stress = Math.min(100, e.stress + 10);
      });
      gsm.decisionLog.push(`Chấm dứt hợp đồng nhân sự: ${employee.name}.`);
      soundManager.playAlert();
      gsm.notify();
      onClose();
    }
  };

  const colleagues = gsm.employees.filter((e) => e.id !== employee.id);

  // Ảnh chân dung chuẩn theo 8 Design Sheets
  const getEmployeePortrait = (emp: EmployeeAIEntity): string => {
    if (emp.role === 'DESIGNER') return '/characters/designer.jpg';
    if (emp.role === 'FRONTEND' || emp.role === 'BACKEND' || emp.role === 'FULLSTACK') {
      return '/characters/it.jpg';
    }
    if (emp.role === 'PRODUCT_MANAGER') {
      return '/characters/lead.jpg';
    }
    if (emp.gender === 'FEMALE') {
      return '/characters/females.jpg';
    }
    return '/characters/admin.jpg';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-sky-500/80 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Hồ Sơ */}
        <div className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-700 border-2 border-sky-400 overflow-hidden shadow-lg shrink-0">
              <img
                src={getEmployeePortrait(employee)}
                alt={employee.name}
                className="w-full h-full object-cover object-top scale-110"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                {employee.name} ({employee.age || 24}t)
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-2 py-0.5 rounded font-mono">
                  {employee.role} • {employee.level} ({employee.experienceYears}n KN)
                </span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded font-mono">
                  {employee.personality}
                </span>
                {employee.isProbation && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded font-mono animate-pulse">
                    Thử việc ({employee.probationDaysLeft}d)
                  </span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Hành vi: <strong className="text-sky-300 font-mono">{employee.behaviorState}</strong></span>
                <span>•</span>
                <span>Nhiệm vụ: <strong className="text-emerald-300">{employee.currentTask.description}</strong></span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Dossier */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'PSYCHOLOGY', label: 'Tâm Lý & Chỉ Số' },
            { id: 'SKILLS', label: 'Radar Kỹ Năng & KPI' },
            { id: 'MEMORIES', label: `Dòng Thời Gian Ký Ức (${employee.memories.length})` },
            { id: 'RELATIONS', label: `Mạng Lưới Quan Hệ (${colleagues.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Thân Modal Dossier */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-200 overflow-y-auto flex-1">
          {/* Cảnh báo nếu đình công hoặc đòi tăng lương */}
          {employee.isStriking && (
            <div className="bg-rose-950/80 border border-rose-500 text-rose-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
                <span>Nhân viên này đang tham gia BÃI CÔNG / ĐÌNH CÔNG tại văn phòng!</span>
              </div>
              <button
                onClick={() => {
                  EmployeeAIEngine.resolveStrikeNegotiation(employee, true, gsm.timeManager.day);
                  soundManager.playSuccess();
                  gsm.notify();
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
              >
                Thương Lượng Hòa Giải Ngay
              </button>
            </div>
          )}

          {employee.behaviorState === 'REQUESTING_RAISE' && (
            <div className="bg-amber-950/80 border border-amber-500 text-amber-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>Đang đề xuất tăng lương: Mức lương hiện tại ({employee.salary.toLocaleString('vi-VN')} đ) thấp hơn kỳ vọng ({employee.salaryExpectation.toLocaleString('vi-VN')} đ)!</span>
              </div>
            </div>
          )}

          {/* SUB-TAB 1: TÂM LÝ & CHỈ SỐ */}
          {activeSubTab === 'PSYCHOLOGY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400">Lương thực tế nhận:</span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {employee.salary.toLocaleString('vi-VN')} đ/tháng
                  </p>
                  <span className="text-[10px] text-slate-400">
                    (Kỳ vọng thị trường: {employee.salaryExpectation.toLocaleString('vi-VN')} đ)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400">Tốc độ & Chất lượng code:</span>
                  <p className="font-mono font-bold text-sky-300 text-sm">
                    Tốc độ: {employee.speed}/100 • Chất lượng: {employee.quality}/100
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono">Tỷ lệ bug tự sinh: {employee.bugRate}%</span>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2.5 pt-2 border-t border-slate-700/60">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block">Năng lượng:</span>
                      <span className="text-amber-400 font-bold">{Math.round(employee.energy)}%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block">Tinh thần:</span>
                      <span className="text-emerald-400 font-bold">{Math.round(employee.morale)}%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block">Bức xúc:</span>
                      <span className="text-rose-400 font-bold">{Math.round(employee.frustration)}%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block">Niềm tin CEO:</span>
                      <span className="text-sky-400 font-bold">{Math.round(employee.trustInCEO)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục Tiêu Cá Nhân (Career Goal) */}
              {employee.personalGoal && (
                <div className="bg-slate-800/60 border border-slate-700 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Mục Tiêu Sự Nghiệp: {employee.personalGoal.title}
                    </span>
                    <span className="font-mono font-bold text-sky-400">{Math.round(employee.personalGoal.progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${employee.personalGoal.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: KỸ NĂNG RADAR & KPI */}
          {activeSubTab === 'SKILLS' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                  Bản Đồ Năng Lực Chuyên Môn (Radar Skills):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Frontend Development:</span>
                      <span className="text-sky-400 font-bold">{employee.skillLevels.frontend}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full" style={{ width: `${employee.skillLevels.frontend}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Backend Architecture:</span>
                      <span className="text-emerald-400 font-bold">{employee.skillLevels.backend}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${employee.skillLevels.backend}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>UI/UX Figma Design:</span>
                      <span className="text-pink-400 font-bold">{employee.skillLevels.design}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: `${employee.skillLevels.design}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Testing & Quality Assurance:</span>
                      <span className="text-amber-400 font-bold">{employee.skillLevels.testing}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${employee.skillLevels.testing}%` }} />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>DevOps & Cloud Infrastructure:</span>
                      <span className="text-indigo-400 font-bold">{employee.skillLevels.devops}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${employee.skillLevels.devops}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thống kê đóng góp sản phẩm */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Dòng code đóng góp:</span>
                  <p className="text-sm font-bold text-sky-400 mt-1">{employee.totalLinesOfCodeProduced?.toLocaleString('vi-VN') || 0}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Bug đã bắt & sửa:</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{employee.totalBugsFixed || 0}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Bug phát sinh:</span>
                  <p className="text-sm font-bold text-rose-400 mt-1">{employee.totalBugsProduced || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DÒNG THỜI GIAN KÝ ỨC (MEMORIES) */}
          {activeSubTab === 'MEMORIES' && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Nhật Ký Ký Ức & Tác Động Tâm Lý:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {employee.memories.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">Chưa có ký ức đặc biệt nào được ghi nhận.</p>
                ) : (
                  employee.memories.map((mem) => (
                    <div key={mem.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sky-400 font-mono text-[10px]">Ngày {mem.day}</span>
                          <span className="font-bold text-slate-200">{mem.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className={mem.impactMorale >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {mem.impactMorale >= 0 ? `+${mem.impactMorale}` : mem.impactMorale} Tinh thần
                        </span>
                        <span className={mem.impactLoyalty >= 0 ? 'text-sky-400' : 'text-amber-400'}>
                          {mem.impactLoyalty >= 0 ? `+${mem.impactLoyalty}` : mem.impactLoyalty} Trung thành
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: MẠNG LƯỚI QUAN HỆ (RELATIONS) */}
          {activeSubTab === 'RELATIONS' && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Mức Độ Thân Thiện & Tin Tưởng Với Đồng Nghiệp:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {colleagues.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">Công ty chưa có đồng nghiệp nào khác.</p>
                ) : (
                  colleagues.map((other) => {
                    const rel = employee.relationships[other.id] || { affinity: 50, trust: 50, lastInteractionDay: 1 };
                    return (
                      <div key={other.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-400 flex items-center justify-center text-sm">
                            {other.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200">{other.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{other.role} • {other.level}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Thân thiện:</span>
                            <span className={rel.affinity >= 65 ? 'text-emerald-400 font-bold' : rel.affinity <= 35 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {rel.affinity}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Tin tưởng:</span>
                            <span className="text-sky-400 font-bold">{rel.trust}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Các hành động CEO có thể thực hiện */}
          <div className="space-y-2 pt-3 border-t border-slate-700 shrink-0">
            <span className="text-xs font-bold text-slate-300 block">Quyết Định Quản Trị Của CEO:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleBonus(2000000)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Thưởng Nóng 2Tr</span>
              </button>

              <button
                onClick={() => handleSalaryRaise(3000000)}
                className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tăng Lương +3Tr</span>
              </button>

              <button
                onClick={handlePromote}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Thăng Chức Bậc</span>
              </button>

              <button
                onClick={handleMentoring1on1}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Tâm Sự Định Hướng 1-1</span>
              </button>

              <button
                onClick={handleGiveLeave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Cho Nghỉ Phép Xả Hơi</span>
              </button>

              <button
                onClick={handleFire}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Chấm Dứt Hợp Đồng</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
