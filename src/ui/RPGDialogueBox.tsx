// ============================================================================
// CEO EMPIRE: RPG VISUAL NOVEL DIALOGUE BOX COMPONENT
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { soundManager } from '../engine/core/SoundManager';
import { StoryNode, StoryChoice } from '../engine/narrative/StoryEngine';

interface RPGDialogueBoxProps {
  gsm: GameStateManager;
  node: StoryNode;
  onAdvanceNode: (nextNodeId: string) => void;
  onChoiceSelected: (choice: StoryChoice) => void;
  onClose?: () => void;
}

export const RPGDialogueBox: React.FC<RPGDialogueBoxProps> = ({
  gsm,
  node,
  onAdvanceNode,
  onChoiceSelected,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const typingTimerRef = useRef<number | null>(null);

  // Speaker Color & Border Theme
  const getSpeakerTheme = () => {
    switch (node.speaker) {
      case 'FATHER':
        return {
          border: 'border-amber-500/60',
          glow: 'shadow-amber-500/20',
          nameColor: 'text-amber-400',
          badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-600/50',
          avatarBorder: 'border-amber-400 ring-amber-500/30'
        };
      case 'LAN_ANH':
        return {
          border: 'border-pink-500/60',
          glow: 'shadow-pink-500/20',
          nameColor: 'text-pink-400',
          badgeBg: 'bg-pink-950/60 text-pink-300 border-pink-600/50',
          avatarBorder: 'border-pink-400 ring-pink-500/30'
        };
      case 'NAM':
        return {
          border: 'border-sky-500/60',
          glow: 'shadow-sky-500/20',
          nameColor: 'text-sky-400',
          badgeBg: 'bg-sky-950/60 text-sky-300 border-sky-600/50',
          avatarBorder: 'border-sky-400 ring-sky-500/30'
        };
      case 'SYSTEM':
        return {
          border: 'border-emerald-500/60',
          glow: 'shadow-emerald-500/20',
          nameColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50',
          avatarBorder: 'border-emerald-400 ring-emerald-500/30'
        };
      default:
        return {
          border: 'border-slate-500/60',
          glow: 'shadow-slate-500/20',
          nameColor: 'text-slate-300',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          avatarBorder: 'border-slate-400 ring-slate-500/30'
        };
    }
  };

  const theme = getSpeakerTheme();

  // Reset and Typewriter Effect when Node changes
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
    }

    let charIndex = 0;
    const fullText = node.text;

    typingTimerRef.current = window.setInterval(() => {
      charIndex++;
      if (charIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex));
        // Phát tiếng gõ âm thanh RPG nhẹ nhàng
        if (charIndex % 2 === 0) {
          const pitch = (charIndex % 5) * 8 - 16;
          soundManager.playTextBeep(pitch);
        }
      } else {
        setIsTyping(false);
        if (typingTimerRef.current) {
          window.clearInterval(typingTimerRef.current);
        }
      }
    }, 24);

    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, [node]);

  // Handle Advance or Finish Typing immediately
  const handleAdvance = useCallback(() => {
    if (isTyping) {
      // 1st press: reveal full text immediately
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
      setDisplayedText(node.text);
      setIsTyping(false);
      soundManager.playClick();
    } else {
      // 2nd press: advance to next node or ignore if choices are present
      if (node.choices && node.choices.length > 0) {
        // Choice selection handles progression
        return;
      }
      if (node.next) {
        soundManager.playClick();
        onAdvanceNode(node.next);
      } else if (onClose) {
        onClose();
      }
    }
  }, [isTyping, node, onAdvanceNode, onClose]);

  // Keyboard shortcut handler (Space, Enter, and numbers 1-3 for choices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      } else if (!isTyping && node.choices && node.choices.length > 0) {
        if (e.key === '1' && node.choices[0]) {
          onChoiceSelected(node.choices[0]);
        } else if (e.key === '2' && node.choices[1]) {
          onChoiceSelected(node.choices[1]);
        } else if (e.key === '3' && node.choices[2]) {
          onChoiceSelected(node.choices[2]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance, isTyping, node.choices, onChoiceSelected]);

  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4 md:p-6 flex justify-center pointer-events-auto"
      onClick={handleAdvance}
    >
      <div 
        className={`w-full max-w-5xl bg-slate-950/95 backdrop-blur-md rounded-2xl border-2 ${theme.border} shadow-2xl ${theme.glow} flex flex-col overflow-hidden transition-all duration-200 cursor-pointer select-none`}
        onClick={(e) => {
          e.stopPropagation();
          handleAdvance();
        }}
      >
        {/* Thanh tiêu đề nhỏ trên khung thoại */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Cốt Truyện RPG 2D • Kịch Bản Mở Đầu 500 Triệu
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] text-amber-400 font-mono">
              [Nhấn Space / Enter / Click chuột]
            </span>
          </div>
        </div>

        {/* Nội dung hội thoại chính + Avatar chân dung */}
        <div className="p-3 sm:p-5 flex gap-3 sm:gap-6 items-start">
          {/* Khung Chân Dung Nhân Vật Lớn & Sắc Nét */}
          {node.portraitUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 ${theme.avatarBorder} ring-4 shadow-xl bg-slate-900`}>
                <img
                  src={node.portraitUrl}
                  alt={node.speakerName}
                  className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Fallback nếu ảnh không tải
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              {node.emotion && (
                <span className="mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
                  {node.emotion === 'cold' && '❄️ Lạnh Lùng'}
                  {node.emotion === 'angry' && '💢 Tức Giận'}
                  {node.emotion === 'worried' && '💧 Lo Lắng'}
                  {node.emotion === 'normal' && '👔 Nghiêm Nghị'}
                  {node.emotion === 'surprised' && '❗ Bất Ngờ'}
                  {node.emotion === 'disappointed' && '😞 Thất Vọng'}
                  {node.emotion === 'confident' && '✨ Tự Tin'}
                  {node.emotion === 'thinking' && '🤔 Suy Nghĩ'}
                  {node.emotion === 'happy' && '💖 Vui Vẻ'}
                  {node.emotion === 'emotional' && '😭 Xúc Động'}
                </span>
              )}
            </div>
          )}

          {/* Khung Lời Thoại & Phân Nhánh Quyết Định */}
          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            {/* Tên nhân vật & Danh hiệu */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-base sm:text-lg font-extrabold tracking-wide ${theme.nameColor}`}>
                {node.speakerName}
              </span>
              {node.speakerTitle && (
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold ${theme.badgeBg}`}>
                  {node.speakerTitle}
                </span>
              )}
            </div>

            {/* Lời thoại hiển thị từng chữ (Typewriter) */}
            <div className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed tracking-wide min-h-[50px] sm:min-h-[64px]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              )}
            </div>

            {/* Chỉ dẫn hành động sân khấu (Stage Direction) */}
            {node.stageDirection && (
              <div className="mt-2 text-xs sm:text-sm text-sky-300/85 italic flex items-center gap-1.5">
                <span className="text-sky-400 not-italic">🎬</span>
                <span>{node.stageDirection}</span>
              </div>
            )}

            {/* Danh sách lựa chọn phân nhánh (Khi câu thoại đã hiện xong) */}
            {!isTyping && node.choices && node.choices.length > 0 && (
              <div 
                className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {node.choices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    onClick={() => {
                      soundManager.playClick();
                      onChoiceSelected(choice);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all duration-150 transform hover:-translate-y-0.5 shadow-lg group cursor-pointer ${
                      choice.badgeColor || 'border-slate-700 bg-slate-900/90 hover:border-amber-500 hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                        Phím [{idx + 1}]
                      </span>
                      {choice.badge && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-current">
                          {choice.badge}
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                      {choice.text}
                    </div>

                    {choice.subtext && (
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-snug line-clamp-2">
                        {choice.subtext}
                      </p>
                    )}

                    {choice.impact && (
                      <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-amber-300/90 font-medium">
                        ✦ {choice.impact}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Biểu tượng chỉ dẫn chuyển câu khi không có choices */}
            {!isTyping && (!node.choices || node.choices.length === 0) && (
              <div className="flex justify-end items-center gap-1.5 mt-2 text-xs text-amber-400 font-mono animate-bounce">
                <span>Nhấn để tiếp tục</span>
                <span className="text-base">▾</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
