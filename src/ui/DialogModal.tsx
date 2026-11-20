// ============================================================================
// CEO EMPIRE: DIALOG & NARRATIVE MODAL (Visual Novel / RPG Style)
// ============================================================================

import React, { useEffect } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { soundManager } from '../engine/core/SoundManager';
import { MessageSquare, ArrowRight, X } from 'lucide-react';

interface DialogModalProps {
  gsm: GameStateManager;
}

export const DialogModal: React.FC<DialogModalProps> = ({ gsm }) => {
  const dialog = gsm.activeDialog;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        gsm.closeDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gsm]);

  if (!dialog) return null;

  // Cấu hình avatar theo nhân vật chuẩn Visual Novel / RPG
  const getSpeakerStyle = () => {
    switch (dialog.speaker) {
      case 'FATHER':
        return {
          title: 'Ông Hoàng Thế Vinh',
          role: 'Chủ Tịch Vinh Phát Group (Bố Lan Anh)',
          avatar: '👨‍💼',
          image: '/characters/lead.jpg',
          bgGradient: 'from-amber-900/80 to-slate-900',
          borderColor: 'border-amber-500/80',
          tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
        };
      case 'LAN_ANH':
        return {
          title: 'Hoàng Lan Anh',
          role: 'Người Yêu & Giám Đốc Sáng Tạo',
          avatar: '👩‍💼',
          image: '/characters/lan_anh.jpg',
          bgGradient: 'from-pink-900/80 to-slate-900',
          borderColor: 'border-pink-500/80',
          tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/50'
        };
      case 'SECURITY':
        return {
          title: dialog.title || 'Bác Ba (Bảo Vệ)',
          role: 'Tổ Trưởng Bảo Vệ StartUp Tower',
          avatar: '👮',
          image: '/characters/security.jpg',
          bgGradient: 'from-cyan-900/80 to-slate-900',
          borderColor: 'border-cyan-500/80',
          tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
        };
      case 'EMPLOYEE':
        return {
          title: dialog.title || 'Nhân Viên Công Ty',
          role: 'Đội Ngũ Kỹ Thuật NextGen Solutions',
          avatar: '👨‍💻',
          image: '/characters/it.jpg',
          bgGradient: 'from-blue-900/80 to-slate-900',
          borderColor: 'border-blue-500/80',
          tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
        };
      case 'CEO':
        return {
          title: 'CEO Khởi Nghiệp',
          role: 'Nhà Sáng Lập & Giám Đốc Điều Hành',
          avatar: '👑',
          image: '/characters/ceo.jpg',
          bgGradient: 'from-indigo-900/80 to-slate-900',
          borderColor: 'border-indigo-500/80',
          tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
        };
      case 'BANKER':
        return {
          title: 'Chuyên Viên Tín Dụng V-Bank',
          role: 'Bộ Phận Khách Hàng Doanh Nghiệp',
          avatar: '🏦',
          image: '/characters/admin.jpg',
          bgGradient: 'from-emerald-900/80 to-slate-900',
          borderColor: 'border-emerald-500/80',
          tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
        };
      case 'FREELANCER':
        return {
          title: 'Anh Nam (Senior Dev)',
          role: 'Lập Trình Viên Tự Do (Freelancer)',
          avatar: '💻',
          image: '/characters/it.jpg',
          bgGradient: 'from-purple-900/80 to-slate-900',
          borderColor: 'border-purple-500/80',
          tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
        };
      default:
        return {
          title: dialog.title || 'Thông Báo',
          role: 'CEO Empire Simulation',
          avatar: '💬',
          image: undefined,
          bgGradient: 'from-slate-800 to-slate-900',
          borderColor: 'border-sky-500/60',
          tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        };
    }
  };

  const style = getSpeakerStyle();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 sm:pb-14 px-3 sm:px-6 pointer-events-none animate-fadeIn">
      <div className="w-full max-w-3xl pointer-events-auto filter drop-shadow-2xl">
        {/* Khung chân dung & Tên nhân vật nổi phía trên hộp thoại */}
        <div className="flex items-end gap-3 sm:gap-4 mb-[-8px] ml-4 sm:ml-8 relative z-10">
          <div
            className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${style.bgGradient} border-2 ${style.borderColor} shadow-2xl overflow-hidden relative shadow-sky-500/20 transform -rotate-2 hover:rotate-0 transition-transform shrink-0`}
          >
            {style.image ? (
              <img
                src={style.image}
                alt={style.title}
                className="w-full h-full object-cover object-top scale-110"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                {style.avatar}
              </div>
            )}
          </div>
          <div className="bg-slate-950/95 px-4 sm:px-5 py-1.5 rounded-t-xl border-t-2 border-x-2 border-slate-700/80 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-base tracking-wide">{style.title}</span>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border font-medium ${style.tagColor}`}>
                {style.role}
              </span>
            </div>
          </div>
        </div>

        {/* Khung nội dung lời thoại chính (Dialog Box) */}
        <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-slate-700/90 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          {/* Nền hiệu ứng tia sáng nhẹ */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Nút đóng nhanh góc trên bên phải */}
          <button
            onClick={() => {
              soundManager.playClick();
              gsm.closeDialog();
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            title="Đóng [Esc]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Đoạn văn bản hội thoại */}
          <div className="pr-6 mt-1">
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-line tracking-normal">
              {dialog.message}
            </p>
          </div>

          {/* Các nút lựa chọn hoặc nút Tiếp tục */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Nhấn [Space] hoặc [Enter] để tiếp tục</span>
            </div>

            {dialog.choices && dialog.choices.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {dialog.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundManager.playClick();
                      choice.action();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  gsm.closeDialog();
                }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5 cursor-pointer ml-auto"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
