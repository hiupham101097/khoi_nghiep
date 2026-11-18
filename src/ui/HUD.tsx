// ============================================================================
// CEO EMPIRE: HEADS-UP DISPLAY (HUD)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { QuestManager } from '../engine/narrative/QuestManager';
import {
  Calendar,
  Clock,
  DollarSign,
  Heart,
  Zap,
  Award,
  Briefcase,
  MapPin,
  Save,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  TrendingDown,
  AlertOctagon,
  ShieldAlert,
  Gamepad2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';
import { AVAILABLE_OFFICES, ENTERPRISE_STAGES } from '../engine/economy/CompanyManager';
import { EconomyManager } from '../engine/economy/EconomyManager';

interface HUDProps {
  gsm: GameStateManager;
  onOpenPetition?: () => void;
  showTouchControls?: boolean;
  onToggleTouchControls?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gsm,
  onOpenPetition,
  showTouchControls,
  onToggleTouchControls
}) => {
  const isMuted = soundManager.getIsMuted();
  const timeSpeed = gsm.timeManager.timeSpeed;
  const [isQuestOpen, setIsQuestOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  const toggleMute = () => {
    soundManager.setMuted(!isMuted);
    gsm.notify();
  };

  const cycleSpeed = () => {
    if (timeSpeed === 1) gsm.timeManager.timeSpeed = 2;
    else if (timeSpeed === 2) gsm.timeManager.timeSpeed = 5;
    else if (timeSpeed === 5) gsm.timeManager.timeSpeed = 0;
    else gsm.timeManager.timeSpeed = 1;
    soundManager.playClick();
    gsm.notify();
  };

  const formattedCash = gsm.playerStats.cash.toLocaleString('vi-VN');
  const weatherIcon = gsm.timeManager.weather === 'RAIN' ? '🌧️' : gsm.timeManager.weather === 'OVERCAST' ? '☁️' : '☀️';

  const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === gsm.currentOfficeId) || null;
  const monthlyBurnRate = EconomyManager.calculateMonthlyBurnRate(
    gsm.employees,
    currentOffice,
    gsm.furniture,
    gsm.loans
  );
  const runwayMonths = EconomyManager.calculateRunwayMonths(gsm.playerStats.cash, monthlyBurnRate);
  const stageData = ENTERPRISE_STAGES[gsm.enterpriseStage];

  const currentQuest = QuestManager.getCurrentQuest(
    gsm.isRegistered,
    gsm.currentOfficeId,
    gsm.furniture.some((f) => f.purchased),
    gsm.employees.length,
    gsm.activeProjects.length,
    gsm.completedProjectsCount,
    gsm.romance.datingHistory.length,
    gsm.playerStats.cash
  );

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 pointer-events-none flex flex-col gap-2 z-20">
      {/* Top Bar Card — Responsive Desktop, Tablet & Mobile */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-2 sm:p-2.5 px-3 sm:px-4 flex flex-wrap items-center justify-between pointer-events-auto gap-2 text-slate-100">
        
        {/* Nhóm 1: Thời gian & Thời tiết */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ngày {gsm.timeManager.day} / Th.{gsm.timeManager.month} (Năm {gsm.timeManager.year})</span>
            <span className="sm:hidden">N{gsm.timeManager.day}/T{gsm.timeManager.month}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{gsm.timeManager.getFormattedTime()}</span>
            <span className="text-[11px] ml-0.5" title="Thời tiết">{weatherIcon}</span>
          </div>

          {/* Nút điều chỉnh tốc độ */}
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-1.5 py-0.5 rounded border border-slate-600 transition cursor-pointer"
            title="Đổi tốc độ thời gian [P]"
          >
            {timeSpeed === 0 ? <Pause className="w-3 h-3 text-rose-400" /> : timeSpeed === 1 ? <Play className="w-3 h-3 text-emerald-400" /> : <FastForward className="w-3 h-3 text-amber-400" />}
            <span className="font-bold">{timeSpeed === 0 ? 'Dừng' : `${timeSpeed}x`}</span>
          </button>
        </div>

        {/* Nhóm 2: Cấp Doanh Nghiệp, Tiền Mặt & Runway */}
        <div className="flex items-center gap-2">
          {/* Cấp Giai đoạn Doanh nghiệp (Enterprise Stage Badge) */}
          <button
            onClick={() => {
              gsm.openDashboardTab = 'OVERVIEW';
              soundManager.playClick();
              gsm.notify();
            }}
            className="flex items-center gap-1 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 px-2 py-1 rounded-lg text-indigo-300 text-xs font-semibold cursor-pointer transition shadow-sm"
            title={`Giai đoạn: ${stageData.name} - ${stageData.title}. Nhấn để mở Dashboard.`}
          >
            <span className="text-amber-400 font-black">Cấp {stageData.level}:</span>
            <span className="hidden md:inline">{stageData.name}</span>
          </button>

          {/* Tiền mặt */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg shadow-inner">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono font-extrabold text-emerald-400 text-xs sm:text-sm leading-tight">
              {formattedCash} <span className="text-[9px] font-normal">đ</span>
            </span>
          </div>

          {/* Runway tồn tại */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold shadow-inner ${
              runwayMonths > 6
                ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                : runwayMonths >= 3
                ? 'bg-amber-950/90 border-amber-600/50 text-amber-300'
                : 'bg-rose-950/90 border-rose-600/80 text-rose-300 animate-pulse'
            }`}
            title={`Burn rate: ~${monthlyBurnRate.toLocaleString('vi-VN')} đ/tháng. Runway: ${runwayMonths} tháng.`}
          >
            <TrendingDown className="w-3 h-3 text-slate-400" />
            <span>{runwayMonths > 99 ? '∞' : `${runwayMonths}th`}</span>
          </div>

          {/* Nút báo động Khủng hoảng Kiến Nghị nếu có */}
          {gsm.activePetition && (
            <button
              onClick={() => {
                if (onOpenPetition) onOpenPetition();
              }}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg animate-bounce border border-rose-400 shadow-lg cursor-pointer"
              title="Nhấn để mở bàn đàm phán giải quyết khủng hoảng"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>KIẾN NGHỊ ({gsm.activePetition.daysRemaining}d)</span>
            </button>
          )}
        </div>

        {/* Nhóm 3: Năng lượng, Sức khỏe & Các nút chức năng */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Năng lượng & Sức khỏe CEO (ẩn trên mobile hẹp để tránh vỡ giao diện) */}
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-700/60 pl-3">
            <div className="flex items-center gap-1" title="Năng lượng CEO">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-300"
                  style={{ width: `${gsm.playerStats.energy}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300">{gsm.playerStats.energy}%</span>
            </div>

            <div className="flex items-center gap-1" title="Sức khỏe CEO">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-rose-500 to-red-400 h-full transition-all duration-300"
                  style={{ width: `${gsm.playerStats.health}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-300">{gsm.playerStats.health}%</span>
            </div>

            <div className="flex items-center gap-1 bg-sky-950/50 border border-sky-600/40 px-1.5 py-0.5 rounded text-sky-300 text-[11px] font-semibold" title="Uy tín thương trường">
              <Award className="w-3 h-3 text-sky-400" />
              <span>{gsm.playerStats.reputation}</span>
            </div>
          </div>

          {/* Các nút bấm điều hướng nhanh */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                gsm.openDashboardTab = 'OVERVIEW';
                soundManager.playClick();
                gsm.notify();
              }}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-md hover:shadow-sky-500/20 transition cursor-pointer"
              title="Mở Bảng Điều Hành Doanh Nghiệp [TAB]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CEO Suite</span>
            </button>

            <button
              onClick={() => {
                if (gsm.currentSceneId === 'CITY') {
                  gsm.switchScene('OFFICE');
                } else {
                  gsm.switchScene('CITY');
                }
              }}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Chuyển địa điểm"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">{gsm.currentSceneId === 'CITY' ? 'Văn Phòng' : 'Ra Phố'}</span>
            </button>

            {/* Toggle Bật/Tắt Phím Ảo (Touch Joystick) */}
            <button
              onClick={onToggleTouchControls}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showTouchControls
                  ? 'bg-amber-600 border-amber-400 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
              title={showTouchControls ? 'Ẩn phím ảo cảm ứng' : 'Hiện phím ảo cảm ứng (Mobile/Tablet)'}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                gsm.isSaveMenuOpen = true;
                soundManager.playClick();
                gsm.notify();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Lưu / Tải Game [ESC]"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={toggleMute}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Bật / Tắt Âm Thanh"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>

      </div>

      {/* Floating Quest Tracker — Collapsible để không che khuất màn hình */}
      <div className="self-start bg-slate-900/95 backdrop-blur-md border border-amber-500/60 rounded-xl p-2.5 shadow-xl max-w-sm pointer-events-auto text-xs space-y-1 animate-fadeIn">
        <div
          onClick={() => setIsQuestOpen(!isQuestOpen)}
          className="flex items-center justify-between text-amber-400 font-extrabold uppercase tracking-wider text-[10px] cursor-pointer hover:text-amber-300 gap-4"
        >
          <div className="flex items-center gap-1.5">
            <span>🎯 {currentQuest.chapterTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600/40 text-[9px]">Chỉ Dẫn</span>
            {isQuestOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>

        {isQuestOpen && (
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <h4 className="font-bold text-slate-100 text-xs">
              {currentQuest.title}
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentQuest.targetHint}
            </p>
            <div className="text-[10px] text-emerald-400 font-medium pt-1 border-t border-slate-800/80">
              🎁 {currentQuest.rewardText}
            </div>
          </div>
        )}
      </div>

      {/* Thông tin vị trí & Hướng dẫn điều khiển thu gọn */}
      <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-800 self-start pointer-events-auto gap-4">
        <div>
          <span className="text-sky-400 font-semibold">Vị Trí:</span> {gsm.currentScene.name}
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <span>Di chuyển: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-sky-300 font-mono">WASD</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-sky-300 font-mono">Mũi Tên</kbd> / Click đích đến</span>
          <span>|</span>
          <span>Tương tác: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">[E]</kbd></span>
        </div>
      </div>
    </div>
  );
};
