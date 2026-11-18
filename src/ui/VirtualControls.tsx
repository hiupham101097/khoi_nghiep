// ============================================================================
// CEO EMPIRE: VIRTUAL TOUCH CONTROLS (Điều Khiển Ảo Cho Mobile & Tablet)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Hand,
  Briefcase,
  Menu
} from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';

interface VirtualControlsProps {
  gsm: GameStateManager;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ gsm }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Kích hoạt phím điều hướng ảo
  const handleDirectionStart = (dx: number, dy: number) => {
    gsm.playerController.setVirtualInput(dx, dy, isRunning);
  };

  const handleDirectionEnd = () => {
    gsm.playerController.setVirtualInput(0, 0, false);
  };

  const toggleRun = () => {
    const next = !isRunning;
    setIsRunning(next);
    soundManager.playClick();
  };

  const handleInteract = () => {
    gsm.playerController.triggerInteract((zone) => {
      gsm.handleZoneInteraction(zone);
    });
  };

  const toggleDashboard = () => {
    gsm.openDashboardTab = gsm.openDashboardTab ? null : 'OVERVIEW';
    soundManager.playClick();
    gsm.notify();
  };

  const toggleMenu = () => {
    gsm.isSaveMenuOpen = !gsm.isSaveMenuOpen;
    soundManager.playClick();
    gsm.notify();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* VÙNG ĐIỀU HƯỚNG D-PAD (GÓC DƯỚI TRÁI) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto">
        <div className="relative w-36 h-36 bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-full shadow-2xl flex items-center justify-center p-2">
          
          {/* Nút Lên */}
          <button
            onPointerDown={() => handleDirectionStart(0, -1)}
            onPointerUp={handleDirectionEnd}
            onPointerLeave={handleDirectionEnd}
            className="absolute top-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800/90 active:bg-sky-600 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow transition-transform"
            title="Đi lên"
          >
            <ArrowUp className="w-5 h-5 text-sky-400" />
          </button>

          {/* Nút Trái */}
          <button
            onPointerDown={() => handleDirectionStart(-1, 0)}
            onPointerUp={handleDirectionEnd}
            onPointerLeave={handleDirectionEnd}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800/90 active:bg-sky-600 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow transition-transform"
            title="Sang trái"
          >
            <ArrowLeft className="w-5 h-5 text-sky-400" />
          </button>

          {/* Nút Chạy Nhanh Sprint ở giữa */}
          <button
            onClick={toggleRun}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
              isRunning 
                ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/40' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Bật/Tắt chạy nhanh [Shift]"
          >
            <Zap className={`w-5 h-5 ${isRunning ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
          </button>

          {/* Nút Phải */}
          <button
            onPointerDown={() => handleDirectionStart(1, 0)}
            onPointerUp={handleDirectionEnd}
            onPointerLeave={handleDirectionEnd}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800/90 active:bg-sky-600 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow transition-transform"
            title="Sang phải"
          >
            <ArrowRight className="w-5 h-5 text-sky-400" />
          </button>

          {/* Nút Xuống */}
          <button
            onPointerDown={() => handleDirectionStart(0, 1)}
            onPointerUp={handleDirectionEnd}
            onPointerLeave={handleDirectionEnd}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800/90 active:bg-sky-600 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow transition-transform"
            title="Đi xuống"
          >
            <ArrowDown className="w-5 h-5 text-sky-400" />
          </button>
        </div>
      </div>

      {/* VÙNG THAO TÁC HÀNH ĐỘNG ACTION BUTTONS (GÓC DƯỚI PHẢI) */}
      <div className="absolute bottom-5 right-5 pointer-events-auto flex items-end gap-3">
        
        {/* Nút Mở Menu Lưu/Tải */}
        <button
          onClick={toggleMenu}
          className="w-11 h-11 bg-slate-900/80 border border-slate-700 text-slate-300 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition"
          title="Menu Hệ Thống [ESC]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Nút CEO Suite Dashboard */}
        <button
          onClick={toggleDashboard}
          className="w-13 h-13 bg-sky-600 hover:bg-sky-500 border border-sky-400 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition"
          title="Bảng Điều Hành CEO [TAB]"
        >
          <Briefcase className="w-6 h-6" />
        </button>

        {/* Nút Hành Động Chính [E] / Tương Tác */}
        <button
          onClick={handleInteract}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform border-2 ${
            gsm.playerController.nearbyZone
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-200 text-slate-950 animate-pulse ring-4 ring-amber-500/30'
              : 'bg-slate-800/90 border-slate-600 text-slate-400'
          }`}
          title="Tương tác / Nói chuyện [E]"
        >
          <Hand className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase mt-0.5 font-mono">[E]</span>
        </button>

      </div>
    </div>
  );
};
