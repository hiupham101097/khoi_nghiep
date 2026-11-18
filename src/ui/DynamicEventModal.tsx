// ============================================================================
// CEO EMPIRE: DYNAMIC EVENT MODAL (Cửa Sổ Quyết Quyết Định Sự Kiện Đột Xuất)
// ============================================================================

import React from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { DynamicGameEvent } from '../types';
import { AlertCircle } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';

interface DynamicEventModalProps {
  gsm: GameStateManager;
  event: DynamicGameEvent;
}

export const DynamicEventModal: React.FC<DynamicEventModalProps> = ({ gsm, event }) => {
  const handleChoose = (actionKey: string) => {
    soundManager.playClick();

    switch (actionKey) {
      case 'ACCEPT_SHARK_INVESTMENT':
        gsm.playerStats.cash += 2000000000;
        gsm.playerStats.reputation = Math.min(100, gsm.playerStats.reputation + 25);
        gsm.decisionLog.push('Nhận 2 tỷ đầu tư đổi lấy 35% cổ phần từ Shark Angel.');
        soundManager.playCashEarned();
        break;

      case 'REJECT_SHARK_INVESTMENT':
        gsm.decisionLog.push('Từ chối đầu tư mạo hiểm, kiên định tự lực cánh sinh.');
        break;

      case 'COUNTER_OFFER_TALENTS':
        gsm.employees.forEach((emp) => {
          emp.currentSalary = Math.floor(emp.currentSalary * 1.25);
          emp.loyalty = 100;
          emp.ceoTrust = 100;
          emp.happiness = 100;
          emp.resentment = 0;
        });
        gsm.decisionLog.push('Tăng 25% lương & chia cổ phần ESOP bảo vệ đội ngũ nhân tài.');
        soundManager.playSuccess();
        break;

      case 'INSPIRE_TALENTS':
        gsm.decisionLog.push('Tâm sự truyền cảm hứng sứ mệnh cho nhân viên.');
        break;

      case 'COOPERATE_TAX_INSPECTION':
        gsm.legal.taxComplianceRating = Math.min(100, gsm.legal.taxComplianceRating + 15);
        gsm.decisionLog.push('Hợp tác minh bạch với Đoàn thanh tra Thuế.');
        soundManager.playSuccess();
        break;

      case 'BRIBE_TAX_OFFICIALS':
        gsm.legal.taxComplianceRating = Math.max(0, gsm.legal.taxComplianceRating - 30);
        gsm.legal.isUnderCriminalInvestigation = true;
        gsm.decisionLog.push('Tìm cách quan hệ ngầm bất thành, bị Cơ quan Điều tra thụ lý hồ sơ!');
        soundManager.playDramaticChord();
        break;

      case 'ACCOMPANY_LAN_ANH':
        gsm.romance.affection = 100;
        gsm.romance.trust = 100;
        gsm.romance.currentMood = 'JOYFUL';
        gsm.decisionLog.push('Tạm gác công việc để chăm sóc Lan Anh khi ốm.');
        soundManager.playSuccess();
        break;

      case 'FOCUS_BUSINESS_MEETING':
        gsm.playerStats.cash += 80000000;
        gsm.romance.affection = Math.max(0, gsm.romance.affection - 20);
        gsm.romance.currentMood = 'DISAPPOINTED';
        gsm.decisionLog.push('Chốt hợp đồng thành công nhưng khiến Lan Anh buồn tủi.');
        break;

      case 'CRUNCH_RESTORE_SERVER':
        gsm.playerStats.reputation = Math.min(100, gsm.playerStats.reputation + 10);
        gsm.employees.forEach((emp) => {
          emp.energy = Math.max(10, emp.energy - 30);
          emp.stress = Math.min(100, emp.stress + 20);
        });
        gsm.decisionLog.push('Cùng toàn đội thức trắng đêm giải cứu máy chủ khách hàng.');
        soundManager.playSuccess();
        break;

      case 'BLAME_INFRASTRUCTURE':
        gsm.playerStats.cash = Math.max(0, gsm.playerStats.cash - 30000000);
        gsm.playerStats.reputation = Math.max(0, gsm.playerStats.reputation - 15);
        gsm.decisionLog.push('Bị phạt 30 triệu do gián đoạn hạ tầng máy chủ.');
        soundManager.playAlert();
        break;

      default:
        break;
    }

    // Đánh dấu sự kiện đã qua
    gsm.currentActiveEvent = null;
    gsm.notify();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner */}
        <div className="bg-amber-950 border-b border-amber-600/40 p-3.5 sm:p-4 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
              SỰ KIỆN ĐỘNG • {event.category}
            </span>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">{event.title}</h3>
          </div>
        </div>

        {/* Nội dung tình huống */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {event.description}
          </p>

          <span className="text-xs font-bold text-slate-300 block">Quyết định của CEO:</span>

          <div className="space-y-2.5">
            {event.options.map((opt: { text: string; actionKey: string; immediateEffectText: string }, idx: number) => (
              <button
                key={idx}
                onClick={() => handleChoose(opt.actionKey)}
                className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/80 p-3 rounded-xl transition group cursor-pointer"
              >
                <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300 block">
                  {opt.text}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Hệ quả: {opt.immediateEffectText}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
