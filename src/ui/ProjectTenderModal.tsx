// ============================================================================
// CEO EMPIRE: PROJECT TENDER MODAL (Bảng Chào Thầu Dự Án Phần Mềm)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { ProjectContract } from '../types';
import { ProjectManager } from '../engine/economy/ProjectManager';
import { X, CheckCircle, Clock } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';

interface ProjectTenderModalProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const ProjectTenderModal: React.FC<ProjectTenderModalProps> = ({ gsm, onClose }) => {
  const [tenders] = useState<ProjectContract[]>(() =>
    ProjectManager.generateAvailableTenders(gsm.playerStats.reputation)
  );

  const handleSign = (tender: ProjectContract) => {
    // Ký hợp đồng & nhận 30% cọc
    const { depositAmount } = ProjectManager.signContract(tender);
    gsm.playerStats.cash += depositAmount;
    gsm.monthlyRevenueAccumulated += depositAmount;
    
    // Gán mặc định các nhân viên hiện có vào dự án
    tender.assignedEmployeeIds = gsm.employees.map((e) => e.id);
    gsm.activeProjects.push(tender);

    gsm.decisionLog.push(`Ký hợp đồng dự án: ${tender.name}. Tạm ứng +${depositAmount.toLocaleString('vi-VN')} VNĐ.`);
    soundManager.playCashEarned();
    gsm.notify();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Bảng Chào Thầu Dự Án Công Nghệ</h3>
            <p className="text-xs text-slate-400">
              Nhận tạm ứng 30% giá trị hợp đồng khi ký kết • Quyết toán 70% còn lại khi nghiệm thu đạt chuẩn
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách dự án chào thầu */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {tenders.map((tender) => {
            const isAlreadyActive = gsm.activeProjects.some((p) => p.name === tender.name);

            return (
              <div key={tender.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tender.clientLogo}</span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        {tender.name}
                        <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-2 py-0.5 rounded font-mono">
                          {tender.clientType}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">Khách hàng: {tender.clientName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tổng giá trị hợp đồng:</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {tender.contractValue.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[10px] text-sky-400 block">
                      Tạm ứng ngay: {(tender.contractValue * 0.3).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {tender.description}
                </p>

                <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                  <div>
                    <span>Thời hạn bàn giao:</span>
                    <p className="font-bold text-amber-300 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {tender.durationDays} ngày
                    </p>
                  </div>

                  <div>
                    <span>Phạt trễ hạn mỗi ngày:</span>
                    <p className="font-bold text-rose-400 font-mono">
                      {tender.penaltyPerDay.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <div>
                    <span>Yêu cầu chất lượng:</span>
                    <p className="font-bold text-sky-400 font-mono">{tender.qualityRequirement}/100</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-700/60">
                  {isAlreadyActive ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Dự Án Đang Chạy
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSign(tender)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition cursor-pointer"
                    >
                      Ký Hợp Đồng & Nhận Tạm Ứng 30%
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
