// ============================================================================
// CEO EMPIRE: INTRO CINEMATIC MODAL (Cốt Truyện Mở Đầu 500 Triệu Đổi Lấy Tương Lai)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { soundManager } from '../engine/core/SoundManager';

interface IntroCinematicModalProps {
  gsm: GameStateManager;
}

export const IntroCinematicModal: React.FC<IntroCinematicModalProps> = ({ gsm }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const dialogueScript = [
    {
      speaker: 'Ông Hoàng Thế Vinh',
      title: 'Chủ Tịch Tập Đoàn Vinh Phát — Bố Lan Anh',
      avatar: '👨‍💼',
      text: 'Cậu Nam, ta biết cậu yêu con gái ta. Nhưng tình yêu của một thằng sinh viên 22 tuổi mới ra trường, không tiền, không địa vị... có nuôi nổi tương lai không?',
      note: 'Ông Vinh chậm rãi nhấp một ngụm trà sen, ánh mắt nghiêm nghị nhìn thẳng vào bạn.'
    },
    {
      speaker: 'Lan Anh',
      title: 'Người Yêu Bạn',
      avatar: '👩',
      text: 'Bố! Đừng làm khó anh Nam nữa mà bố... Tụi con có thể cùng nhau cố gắng từ hai bàn tay trắng!',
      note: 'Lan Anh đứng nép sau rèm cửa phòng khách sang trọng, ánh mắt rưng rưng nhìn bạn.'
    },
    {
      speaker: 'Ông Hoàng Thế Vinh',
      title: 'Chủ Tịch Tập Đoàn Vinh Phát',
      avatar: '👨‍💼',
      text: 'Im lặng nào con gái! Thực tế cuộc đời không phải là câu chuyện ngôn tình.',
      note: 'Ông Vinh ra hiệu cho viên quản gia mang một chiếc vali da cao cấp đặt ngay ngắn lên bàn đá cẩm thạch.'
    },
    {
      speaker: 'Ông Hoàng Thế Vinh',
      title: 'Chủ Tịch Tập Đoàn Vinh Phát',
      avatar: '💼',
      text: 'Trong chiếc vali này có đúng 500.000.000 VNĐ (500 triệu đồng) tiền mặt. Đây là số tiền cả đời một sinh viên nghèo làm thuê chắt chiu chưa chắc đã có được. Cậu Nam, hãy đưa ra quyết định của mình!',
      note: 'Vali được bật mở, những cọc tiền polime xanh thẫm còn nguyên niêm phong ngân hàng hiện ra trước mắt bạn.'
    }
  ];

  const currentDialogue = dialogueScript[Math.min(currentStep, dialogueScript.length - 1)];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner tiêu đề điện ảnh */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Kịch Bản Mở Đầu: Cuộc Gặp Định Mệnh 500 Triệu
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dinh Thự Vinh Phát • 20:00</span>
        </div>

        {/* Khung cảnh diễn biến Chibi 2D Cinematic */}
        <div className="relative h-64 bg-slate-950 flex items-center justify-center border-b border-slate-800 overflow-hidden">
          {/* Background ánh sáng sang trọng */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0,transparent_70%)]" />
          
          <div className="relative flex items-center justify-around w-full max-w-2xl px-8">
            {/* Chân dung Nam (Nhân vật chính) */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-sky-600 to-blue-900 border-2 border-sky-400 flex items-center justify-center text-5xl shadow-xl shadow-sky-500/20">
                🧑‍🎓
              </div>
              <span className="text-xs font-bold text-sky-300 mt-2">Bạn (Thành Nam, 22 tuổi)</span>
              <span className="text-[10px] text-slate-400">Sinh viên nghèo mới ra trường</span>
            </div>

            {/* Chiếc vali 500 triệu tỏa sáng */}
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-20 h-16 bg-gradient-to-b from-amber-600 to-yellow-800 border-2 border-yellow-400 rounded-lg shadow-2xl shadow-yellow-500/40 flex flex-col items-center justify-center text-2xl">
                💼
              </div>
              <span className="text-xs font-extrabold text-amber-300 mt-1 font-mono">500.000.000 đ</span>
            </div>

            {/* Chân dung Ông Vinh */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20">
                👨‍💼
              </div>
              <span className="text-xs font-bold text-amber-300 mt-2">Ông Hoàng Thế Vinh</span>
              <span className="text-[10px] text-slate-400">Chủ tịch Tập đoàn Vinh Phát</span>
            </div>
          </div>
        </div>

        {/* Khung Hội thoại & Chân dung Biểu Cảm Lớn */}
        <div className="p-6 bg-slate-900/90 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {currentDialogue.avatar}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 text-sm">{currentDialogue.speaker}</span>
                <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {currentDialogue.title}
                </span>
              </div>
              <p className="text-slate-100 text-base font-medium leading-relaxed italic">
                "{currentDialogue.text}"
              </p>
              <p className="text-xs text-sky-400/80">{currentDialogue.note}</p>
            </div>
          </div>

          {/* Phân nhánh quyết định định mệnh */}
          {currentStep < dialogueScript.length - 1 ? (
            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  soundManager.playClick();
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                Tiếp tục đối thoại →
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                LỰA CHỌN CỦA BẠN (Định hình toàn bộ số phận trò chơi):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Lựa chọn A */}
                <button
                  onClick={() => gsm.chooseIntroOptionA()}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-rose-500/80 p-3.5 rounded-xl text-left transition group cursor-pointer"
                >
                  <span className="text-xs font-bold text-rose-400 block group-hover:text-rose-300">
                    A. Nhận tiền và rời đi
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Cầm 500 triệu và buông tay. Xem cinematic Lan Anh kết hôn với người khác.
                  </p>
                </button>

                {/* Lựa chọn B */}
                <button
                  onClick={() => gsm.chooseIntroOptionB()}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/80 p-3.5 rounded-xl text-left transition group cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-400 block group-hover:text-amber-300">
                    B. Từ chối tiền & cố níu kéo
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Làm nhân viên bình thường nghèo khó. Năm tháng trôi qua và bị bỏ rơi.
                  </p>
                </button>

                {/* Lựa chọn C (MỞ KHÓA MAIN CAMPAIGN KHỞI NGHIỆP) */}
                <button
                  onClick={() => gsm.chooseIntroOptionC()}
                  className="bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-600 hover:to-indigo-600 border-2 border-sky-400 p-3.5 rounded-xl text-left shadow-lg shadow-sky-600/30 transition cursor-pointer"
                >
                  <span className="text-xs font-black text-yellow-300 block">
                    C. Cầm 500 triệu & THÁCH THỨC BỐ NGƯỜI YÊU!
                  </span>
                  <p className="text-[11px] text-slate-100 mt-1 leading-snug font-medium">
                    "Tôi sẽ dùng 500 triệu này để khởi nghiệp công nghệ. Nếu tôi thành công, bác phải cho chúng tôi cơ hội!"
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
