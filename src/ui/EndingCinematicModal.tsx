// ============================================================================
// CEO EMPIRE: ENDING CINEMATIC VIEW (Ending 07 Ngày Trở Về & Các Nhánh Kết Thúc)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { GAME_ENDINGS } from '../engine/narrative/EndingManager';
import { soundManager } from '../engine/core/SoundManager';
import confetti from 'canvas-confetti';

interface EndingCinematicModalProps {
  gsm: GameStateManager;
}

export const EndingCinematicModal: React.FC<EndingCinematicModalProps> = ({ gsm }) => {
  const [step, setStep] = useState<number>(0);

  // Xác định Ending hiện tại
  let ending = gsm.currentEnding;

  if (gsm.gamePhase === 'INTRO_BRANCH_A') {
    ending = {
      code: 'ENDING_02',
      title: 'KẾT THÚC NHÁNH A: NHẬN TIỀN & ĐÁNH MẤT TÌNH YÊU',
      subtitle: 'Cầm 500 triệu rời đi vĩnh viễn',
      description: 'Bạn cầm 500 triệu rời khỏi dinh thự. Vài năm sau, bạn nghe tin Lan Anh kết hôn cùng một thiếu gia giàu có. Số tiền 500 triệu rồi cũng tiêu tán, chỉ còn lại nỗi ân hận khôn nguôi.',
      bannerColor: '#f59e0b',
      isVictory: false,
      storyNarrative: [
        'Bạn cầm chiếc vali 500 triệu bước ra khỏi cổng biệt thự trong ánh mắt khinh miệt của ông Vinh.',
        'Lan Anh đứng trên ban công tầng hai khóc nấc, chiếc khăn tay rơi xuống sân cỏ ướt đẫm sương đêm.',
        'Hai năm sau, bạn nhận được tin Lan Anh lên xe hoa cùng người thừa kế của một tập đoàn bất động sản.',
        '500 triệu năm nào không đủ để bù đắp sự trống rỗng trong tâm hồn bạn suốt phần đời còn lại.'
      ]
    };
  } else if (gsm.gamePhase === 'INTRO_BRANCH_B') {
    ending = {
      code: 'ENDING_04',
      title: 'KẾT THÚC NHÁNH B: CỐ CHẤP TRONG BẤT LỰC',
      subtitle: 'Từ chối tiền nhưng không thể vượt qua thực tế',
      description: 'Bạn kiên quyết từ chối 500 triệu và thề non hẹn biển. Nhưng thực tế nghèo khó và những năm tháng làm nhân viên quèn không đủ để bảo vệ tình yêu. Lan Anh mệt mỏi và rời đi.',
      bannerColor: '#ef4444',
      isVictory: false,
      storyNarrative: [
        'Bạn quay lưng bước đi, không nhận một đồng nào từ ông Vinh, tự nhủ sẽ chứng minh tình yêu bằng sự chân thành.',
        'Thời gian trôi qua, bạn làm nhân viên văn phòng với đồng lương 8 triệu một tháng, ở trọ trong căn phòng chật chội.',
        'Những mâu thuẫn vụn vặt về cơm áo gạo tiền dần bào mòn tình cảm đôi lứa.',
        'Lan Anh mệt mỏi buông tay: "Em xin lỗi, chúng ta không thuộc về cùng một thế giới..."'
      ]
    };
  }

  if (!ending) {
    ending = GAME_ENDINGS.ENDING_07;
  }

  // Bắn pháo hoa nếu là Chiến thắng (Ending 01)
  React.useEffect(() => {
    if (ending && ending.isVictory) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();
    }
  }, [ending]);

  const totalSteps = ending.storyNarrative.length;
  const currentText = ending.storyNarrative[Math.min(step, totalSteps - 1)];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner tiêu đề kết thúc */}
        <div
          className="p-6 text-center text-white border-b border-slate-800"
          style={{ backgroundColor: ending.bannerColor }}
        >
          <span className="text-xs uppercase font-black tracking-widest bg-black/30 px-3 py-1 rounded-full">
            {ending.code}
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-wide">{ending.title}</h2>
          <p className="text-sm font-medium opacity-90 mt-1">{ending.subtitle}</p>
        </div>

        {/* Khung diễn tiến kịch bản điện ảnh */}
        <div className="p-8 flex-1 flex flex-col justify-between space-y-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Diễn Biến Cốt Truyện</span>
              <span>Đoạn {step + 1} / {totalSteps}</span>
            </div>

            <div className="min-h-[120px] flex items-center justify-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <p className="text-slate-100 text-base md:text-lg font-medium leading-relaxed text-center italic">
                "{currentText}"
              </p>
            </div>
          </div>

          {/* Điều khiển lật trang cốt truyện hoặc Kết thúc vĩnh viễn */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step < totalSteps - 1 ? (
              <button
                onClick={() => {
                  setStep(step + 1);
                  soundManager.playClick();
                }}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition cursor-pointer"
              >
                Tiếp Tục Diễn Biến →
              </button>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                <span className="text-xs font-black tracking-widest text-rose-500 uppercase">
                  {ending.code === 'ENDING_07' ? 'PERMANENT GAME OVER' : 'HÀNH TRÌNH ĐÃ KHÉP LẠI'}
                </span>

                <button
                  onClick={() => {
                    // Reset game và chơi lại từ đầu
                    window.location.reload();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-sm py-3 rounded-xl transition cursor-pointer"
                >
                  🔄 Chơi Lại Ván Mới (New Game)
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
