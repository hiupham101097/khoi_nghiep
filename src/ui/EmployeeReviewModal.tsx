// ============================================================================
// CEO EMPIRE: EMPLOYEE REVIEW & 1-ON-1 MODAL (Tương Tác Trực Tiếp 1-1 Với Nhân Viên)
// ============================================================================

import React from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { EmployeeAIEntity } from '../types';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { soundManager } from '../engine/core/SoundManager';
import { X, Award, AlertTriangle, Coffee, DollarSign, Heart, Shield, UserMinus } from 'lucide-react';

interface EmployeeReviewModalProps {
  gsm: GameStateManager;
  employee: EmployeeAIEntity;
  onClose: () => void;
}

export const EmployeeReviewModal: React.FC<EmployeeReviewModalProps> = ({ gsm, employee, onClose }) => {
  const handleBonus = (amount: number) => {
    if (gsm.playerStats.cash < amount) {
      alert(`Không đủ tiền mặt để thưởng nóng (Cần ${amount.toLocaleString('vi-VN')} VNĐ)!`);
      return;
    }
    gsm.playerStats.cash -= amount;
    EmployeeAIEngine.rewardEmployee(employee, amount);
    gsm.decisionLog.push(`Thưởng nóng ${amount.toLocaleString('vi-VN')} VNĐ cho ${employee.name}.`);
    gsm.notify();
  };

  const handleSalaryRaise = (raiseAmount: number) => {
    const newSalary = employee.currentSalary + raiseAmount;
    EmployeeAIEngine.raiseSalary(employee, newSalary);
    soundManager.playSuccess();
    gsm.decisionLog.push(`Nâng lương cho ${employee.name} lên ${newSalary.toLocaleString('vi-VN')} VNĐ/tháng.`);
    gsm.notify();
  };

  const handleGiveLeave = () => {
    employee.energy = Math.min(100, employee.energy + 40);
    employee.stress = Math.max(0, employee.stress - 30);
    employee.happiness = Math.min(100, employee.happiness + 20);
    employee.speechBubble = 'Cảm ơn sếp cho em nghỉ ngơi lấy lại sức!';
    employee.speechTimer = 5;
    employee.memoryLog.push('Được CEO cho nghỉ phép xả hơi hồi phục năng lượng.');
    soundManager.playSuccess();
    gsm.notify();
  };

  const handleFire = () => {
    if (confirm(`Bạn có chắc chắn muốn sa thải ${employee.name}? Hành động này có thể ảnh hưởng tới tinh thần các nhân viên còn lại.`)) {
      gsm.employees = gsm.employees.filter((e) => e.id !== employee.id);
      // Giảm nhẹ niềm tin của các đồng nghiệp
      gsm.employees.forEach((e) => {
        e.ceoTrust = Math.max(0, e.ceoTrust - 10);
        e.stress = Math.min(100, e.stress + 10);
      });
      gsm.decisionLog.push(`Sa thải nhân viên: ${employee.name}.`);
      soundManager.playAlert();
      gsm.notify();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-sky-500/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-sky-400 flex items-center justify-center text-2xl">
              {employee.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                {employee.name}
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-2 py-0.5 rounded font-mono">
                  {employee.role} • {employee.level}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Đối thoại 1-1 & Đánh giá hiệu suất nhân sự</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-5 text-slate-200">
          {/* Trạng thái tâm lý & Cảnh báo */}
          {employee.isStriking && (
            <div className="bg-rose-950/80 border border-rose-500 text-rose-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>Nhân viên này đang tham gia ĐÌNH CÔNG tại văn phòng!</span>
              </div>
              <button
                onClick={() => {
                  EmployeeAIEngine.resolveStrikeNegotiation(employee, true);
                  soundManager.playSuccess();
                  gsm.notify();
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
              >
                Hòa Giải Ngay
              </button>
            </div>
          )}

          {/* Các chỉ số */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <div>
              <span className="text-slate-400">Lương hiện tại:</span>
              <p className="font-mono font-bold text-emerald-400 text-sm">
                {employee.currentSalary.toLocaleString('vi-VN')} đ/tháng
              </p>
              <span className="text-[10px] text-slate-400">
                (Kỳ vọng: {employee.expectedSalary.toLocaleString('vi-VN')} đ)
              </span>
            </div>

            <div>
              <span className="text-slate-400">Tốc độ & Chất lượng:</span>
              <p className="font-mono font-bold text-sky-300 text-sm">
                Tốc độ: {employee.speed}/100 • Chất lượng: {employee.quality}/100
              </p>
              <span className="text-[10px] text-amber-400">Tỷ lệ bug: {employee.bugRate}%</span>
            </div>

            <div className="col-span-2 space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex justify-between">
                <span>Năng lượng: {Math.round(employee.energy)}%</span>
                <span className="text-rose-400">Bất mãn: {Math.round(employee.resentment)}%</span>
                <span className="text-purple-400">Căng thẳng: {Math.round(employee.stress)}%</span>
                <span className="text-sky-300">Niềm tin CEO: {Math.round(employee.ceoTrust)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                <div className="bg-amber-400 h-full" style={{ width: `${employee.energy}%` }} />
              </div>
            </div>
          </div>

          {/* Nhật ký ký ức của nhân viên */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-300">Ký ức & Đánh giá về CEO:</span>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-400">
              {employee.memoryLog.map((log, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-sky-400">•</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Các hành động CEO có thể thực hiện */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <span className="text-xs font-bold text-slate-300">Quyết định của CEO:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleBonus(2000000)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Thưởng Nóng 2 Triệu</span>
              </button>

              <button
                onClick={() => handleSalaryRaise(3000000)}
                className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Tăng Lương +3 Tr/Tháng</span>
              </button>

              <button
                onClick={handleGiveLeave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Cho Nghỉ Phép Xả Stress</span>
              </button>

              <button
                onClick={handleFire}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Sa Thải Nhân Sự</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
