// ============================================================================
// CEO EMPIRE: BANK MODAL (Ngân Hàng V-Bank — Vay Vốn Doanh Nghiệp & Tín Dụng)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { EconomyManager } from '../engine/economy/EconomyManager';
import { X, Building, CheckCircle } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';

interface BankModalProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const BankModal: React.FC<BankModalProps> = ({ gsm, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(200000000);
  const [termMonths, setTermMonths] = useState<number>(12);

  const handleTakeLoan = () => {
    const loan = EconomyManager.takeLoan('Ngân Hàng V-Bank', selectedAmount, termMonths, 0.12);
    gsm.loans.push(loan);
    gsm.playerStats.cash += selectedAmount;
    gsm.decisionLog.push(`Vay vốn ngân hàng: +${selectedAmount.toLocaleString('vi-VN')} VNĐ. Kỳ hạn ${termMonths} tháng.`);
    soundManager.playCashEarned();
    gsm.notify();
    alert(`Giải ngân thành công ${selectedAmount.toLocaleString('vi-VN')} VNĐ vào tài khoản doanh nghiệp!`);
    onClose();
  };

  const handlePayOffLoan = (loanId: string, principal: number) => {
    if (gsm.playerStats.cash < principal) {
      alert(`Không đủ tiền mặt để tất toán khoản vay (Cần ${principal.toLocaleString('vi-VN')} VNĐ)!`);
      return;
    }
    gsm.playerStats.cash -= principal;
    gsm.loans = gsm.loans.filter((l) => l.id !== loanId);
    gsm.decisionLog.push(`Tất toán trước hạn khoản vay ${principal.toLocaleString('vi-VN')} VNĐ.`);
    soundManager.playSuccess();
    gsm.notify();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-950 border-b border-emerald-600/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Ngân Hàng Thương Mại V-Bank</h3>
              <p className="text-xs text-emerald-300">Gói Tín Dụng Khởi Nghiệp Công Nghệ • Lãi suất ưu đãi 12%/năm</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung vay vốn */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 text-sm">Đăng Ký Khoản Vay Mới</h4>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Số tiền vay:</label>
              <div className="grid grid-cols-3 gap-2">
                {[100000000, 200000000, 500000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedAmount(amt)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      selectedAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {(amt / 1000000).toFixed(0)} Triệu VNĐ
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Kỳ hạn trả góp:</label>
              <div className="grid grid-cols-2 gap-2">
                {[6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTermMonths(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      termMonths === m
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {m} Tháng
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTakeLoan}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition cursor-pointer mt-2"
            >
              Ký Hợp Đồng Tín Dụng & Nhận Tiền
            </button>
          </div>

          {/* Danh sách khoản vay hiện tại */}
          <div className="space-y-3 pt-4 border-t border-slate-700/80">
            <h4 className="font-bold text-slate-100 text-sm">Các Khoản Vay Đang Chấp Hành ({gsm.loans.length})</h4>
            {gsm.loans.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Doanh nghiệp không có nợ ngân hàng.</p>
            ) : (
              <div className="space-y-3">
                {gsm.loans.map((loan) => (
                  <div key={loan.id} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{loan.bankName}</h5>
                      <p className="text-xs text-amber-400 font-mono">
                        Dư nợ gốc: {loan.principal.toLocaleString('vi-VN')} đ
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Trả góp: {loan.monthlyPayment.toLocaleString('vi-VN')} đ/tháng (Còn {loan.monthsRemaining} tháng)
                      </span>
                    </div>

                    <button
                      onClick={() => handlePayOffLoan(loan.id, loan.principal)}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Tất Toán Trước Hạn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
