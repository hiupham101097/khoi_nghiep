// ============================================================================
// CEO EMPIRE: COLLECTIVE PETITION MODAL (ĐÀM PHÁN KHỦNG HOẢNG LAO ĐỘNG)
// ============================================================================

import React from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { CollectivePetition } from '../types';
import { AlertTriangle, CheckCircle, HandCoins, XCircle, Clock, Users } from 'lucide-react';

interface CollectivePetitionModalProps {
  gsm: GameStateManager;
  petition: CollectivePetition;
  onClose: () => void;
}

export const CollectivePetitionModal: React.FC<CollectivePetitionModalProps> = ({ gsm, petition, onClose }) => {
  const signingEmps = gsm.employees.filter((e) => petition.signingEmployees.includes(e.id));
  const totalBonusCompromise = 3000000 * signingEmps.length;
  const canAffordCompromise = gsm.playerStats.cash >= totalBonusCompromise;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Khẩn Cấp */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 border-b border-amber-500/40 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300 uppercase tracking-wide">
                Đơn Kiến Nghị Tập Thể Của Nhân Viên
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Thời hạn: <strong className="text-rose-400 font-mono">{petition.daysRemaining} ngày</strong> (Sau đó sẽ phát động bãi công)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung thông điệp & Danh sách nhân viên ký tên */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-200 text-sm overflow-y-auto">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs leading-relaxed text-slate-300">
            <p className="italic text-amber-200 mb-2">"{petition.message}"</p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Đại diện ký tên: {signingEmps.map((e) => `${e.name} (${e.role})`).join(', ')}</span>
            </div>
          </div>

          {/* Các yêu sách cụ thể */}
          <div className="border border-slate-800 rounded-xl p-3.5 bg-slate-950/40 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Yêu Sách Của Đội Ngũ Nhân Sự:
            </h4>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Điều chỉnh lương cơ bản:</span>
              <span className="font-bold text-emerald-400">+{petition.salaryIncreaseDemandPercent}% tổng lương</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400">Chính sách làm thêm giờ:</span>
              <span className="font-bold text-amber-400">
                {petition.stopOvertimeDemand ? 'Dừng ép tăng ca buổi tối' : 'Giữ nguyên'}
              </span>
            </div>
          </div>

          {/* Lựa chọn giải quyết của CEO */}
          <div className="space-y-2.5 pt-2">
            {/* Lựa chọn 1: Chấp thuận toàn bộ */}
            <button
              onClick={() => {
                gsm.acceptPetition();
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl flex items-center justify-between shadow-lg hover:shadow-emerald-500/20 transition cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-left">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <div>
                  <div className="font-bold">1. Chấp Thuận Toàn Bộ Kiến Nghị</div>
                  <div className="text-[11px] text-emerald-200 font-normal">Tăng {petition.salaryIncreaseDemandPercent}% lương, nhân viên hạnh phúc (+30), tin tưởng (+25)</div>
                </div>
              </div>
              <span className="bg-emerald-800 px-2 py-1 rounded text-[11px]">Cam kết</span>
            </button>

            {/* Lựa chọn 2: Thương lượng thưởng nóng */}
            <button
              onClick={() => {
                if (canAffordCompromise) {
                  gsm.compromisePetition();
                  onClose();
                }
              }}
              disabled={!canAffordCompromise}
              className={`w-full font-bold p-3 rounded-xl flex items-center justify-between shadow-lg transition cursor-pointer text-xs ${
                canAffordCompromise
                  ? 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <HandCoins className="w-5 h-5 text-amber-200" />
                <div>
                  <div className="font-bold">2. Thương Lượng Thỏa Hiệp (Thưởng Nóng Tức Thì)</div>
                  <div className="text-[11px] text-amber-200 font-normal">
                    Thưởng 3.000.000đ/người (Tổng: {totalBonusCompromise.toLocaleString('vi-VN')}đ) để xoa dịu
                  </div>
                </div>
              </div>
              <span className="bg-amber-800 px-2 py-1 rounded text-[11px]">
                {canAffordCompromise ? 'Thương lượng' : 'Không đủ tiền'}
              </span>
            </button>

            {/* Lựa chọn 3: Bác bỏ */}
            <button
              onClick={() => {
                gsm.rejectPetition();
                onClose();
              }}
              className="w-full bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold p-3 rounded-xl flex items-center justify-between transition cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-left">
                <XCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="font-bold">3. Bác Bỏ Yêu Sách (Yêu Cầu Làm Việc)</div>
                  <div className="text-[11px] text-rose-400 font-normal">
                    Rủi ro cao: 75% nhân viên ký tên sẽ lập tức bãi công và đình công tại văn phòng!
                  </div>
                </div>
              </div>
              <span className="bg-rose-900 px-2 py-1 rounded text-[11px]">Rủi ro</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Tạm hoãn quyết định (Sẽ xem lại sau)
          </button>
        </div>

      </div>
    </div>
  );
};
