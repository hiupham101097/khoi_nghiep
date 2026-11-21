// ============================================================================
// CEO EMPIRE: ELEVATOR CONTROL PANEL MODAL (Interactive Floor Navigation)
// ============================================================================

import React from 'react';
import { SceneId } from '../types';
import { soundManager } from '../engine/core/SoundManager';
import { X, Building2, Laptop, Crown, Trees, ArrowRight, Bell } from 'lucide-react';

interface ElevatorModalProps {
  currentFloor: SceneId;
  onSelectFloor: (floor: SceneId) => void;
  onClose: () => void;
}

export const ElevatorModal: React.FC<ElevatorModalProps> = ({
  currentFloor,
  onSelectFloor,
  onClose
}) => {
  const floors: {
    id: SceneId;
    buttonNumber: string;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    colorClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'FLOOR_3',
      buttonNumber: '3',
      name: 'Tầng 3 — Khu Giám Đốc & Lãnh Đạo Cấp Cao',
      tagline: 'Phòng Chủ Tịch CEO, Hội Đồng Quản Trị, Phòng Pháp Chế, Sảnh VIP',
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      colorClass: 'hover:border-amber-500/80 hover:bg-amber-950/30',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'FLOOR_2',
      buttonNumber: '2',
      name: 'Tầng 2 — Khu Làm Việc & Kỹ Thuật IT',
      tagline: 'Open Workspace Pods, Phòng Server Máy Chủ, HR, Kế Toán, Pantry',
      icon: <Laptop className="w-5 h-5 text-sky-400" />,
      colorClass: 'hover:border-sky-500/80 hover:bg-sky-950/30',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    {
      id: 'FLOOR_1',
      buttonNumber: '1',
      name: 'Tầng 1 — Sảnh Lễ Tân & Nhà Kho',
      tagline: 'Quầy Tiếp Khách Lễ Tân, Kho Hàng Công Nghệ, Phòng Hành Chính, WC',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      colorClass: 'hover:border-emerald-500/80 hover:bg-emerald-950/30',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'COMPANY_EXTERIOR',
      buttonNumber: 'G',
      name: 'Bên Ngoài — Mặt Tiền Trụ Sở StartUp Co.',
      tagline: 'Chốt Bảo Vệ Bác Ba, Thanh Chắn Xe Tự Động, Khuôn Viên & Lối Ra Phố',
      icon: <Trees className="w-5 h-5 text-teal-400" />,
      colorClass: 'hover:border-teal-500/80 hover:bg-teal-950/30',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    }
  ];

  const handleSelect = (floorId: SceneId) => {
    soundManager.playStandupBell();
    onSelectFloor(floorId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Khung Bảng Điều Khiển Thang Máy Inox Kim Loại Sang Trọng */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Đèn Led đỉnh thang máy */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 animate-pulse" />

        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-amber-400 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  THANG MÁY TÒA NHÀ STARTUP CO.
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-amber-300 font-mono">
                  <Bell className="w-3 h-3 animate-bounce" /> Schindler Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bấm nút tầng để di chuyển nhanh chóng giữa các khu vực
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Màn hình hiển thị LED Tầng hiện tại */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <span className="text-xs font-semibold text-slate-400">VỊ TRÍ HIỆN TẠI:</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-sm font-black text-amber-300 tracking-widest bg-amber-950/60 border border-amber-600/40 px-3 py-0.5 rounded">
                ▲ {currentFloor === 'FLOOR_3' ? 'TẦNG 3' : currentFloor === 'FLOOR_2' ? 'TẦNG 2' : currentFloor === 'FLOOR_1' ? 'TẦNG 1' : 'MẶT TIỀN'}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách các nút chọn Tầng */}
        <div className="p-5 space-y-3">
          {floors.map((floor) => {
            const isCurrent = currentFloor === floor.id;
            return (
              <button
                key={floor.id}
                disabled={isCurrent}
                onClick={() => handleSelect(floor.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-slate-800/40 border-slate-700/50 opacity-60 cursor-default'
                    : `bg-slate-900/80 border-slate-800 cursor-pointer ${floor.colorClass} active:scale-[0.98]`
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Nút bấm số thang máy tròn kim loại */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base border-2 shadow-lg transition-transform ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/30'
                        : 'bg-slate-800 border-slate-600 text-slate-200 group-hover:border-white'
                    }`}
                  >
                    {floor.buttonNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {floor.name}
                      </h4>
                      {isCurrent && (
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${floor.badgeClass}`}>
                          Đang ở đây
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {floor.tagline}
                    </p>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 group-hover:text-amber-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs text-slate-400 px-5">
          <span>💡 Gợi ý: Bạn cũng có thể dùng Cầu Thang Bộ ở góc trái để đi bộ</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Đóng [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
