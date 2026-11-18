// ============================================================================
// CEO EMPIRE: HEADS-UP DISPLAY (HUD)
// ============================================================================

import React from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';
import { AVAILABLE_OFFICES, ENTERPRISE_STAGES } from '../engine/economy/CompanyManager';
import { EconomyManager } from '../engine/economy/EconomyManager';

interface HUDProps {
  gsm: GameStateManager;
  onOpenPetition?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ gsm, onOpenPetition }) => {
  const isMuted = soundManager.getIsMuted();
  const timeSpeed = gsm.timeManager.timeSpeed;

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
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-2 z-20">
      {/* Top Bar Card */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-2.5 px-4 flex flex-wrap items-center justify-between pointer-events-auto gap-3 text-slate-100">
        
        {/* Thời gian & Thời tiết */}
        <div className="flex items-center gap-4 border-r border-slate-700/60 pr-4">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            <span>Ngày {gsm.timeManager.day} / Th.{gsm.timeManager.month} (Năm {gsm.timeManager.year})</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-sm font-bold bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{gsm.timeManager.getFormattedTime()}</span>
            <span className="text-xs ml-1" title="Thời tiết">{weatherIcon}</span>
          </div>

          {/* Nút điều chỉnh tốc độ */}
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-1 rounded border border-slate-600 transition"
            title="Đổi tốc độ thời gian [P]"
          >
            {timeSpeed === 0 ? <Pause className="w-3 h-3 text-rose-400" /> : timeSpeed === 1 ? <Play className="w-3 h-3 text-emerald-400" /> : <FastForward className="w-3 h-3 text-amber-400" />}
            <span className="font-bold">{timeSpeed === 0 ? 'Tạm Dừng' : `${timeSpeed}x`}</span>
          </button>
        </div>

        {/* Cấp Giai đoạn Doanh nghiệp (Enterprise Stage Badge) */}
        <button
          onClick={() => {
            gsm.openDashboardTab = 'OVERVIEW';
            soundManager.playClick();
            gsm.notify();
          }}
          className="flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 px-2.5 py-1.5 rounded-lg text-indigo-300 text-xs font-semibold cursor-pointer transition shadow-sm"
          title={`Giai đoạn: ${stageData.name} - ${stageData.title}. Nhấn để mở Dashboard.`}
        >
          <span className="text-amber-400 font-black">Cấp {stageData.level}:</span>
          <span>{stageData.name}</span>
        </button>

        {/* Số dư Tiền mặt & Runway tháng */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-inner">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-300 font-medium uppercase tracking-wider">Tiền Mặt</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm leading-tight">
                {formattedCash} <span className="text-[10px] font-normal">đ</span>
              </span>
            </div>
          </div>

          {/* Runway tồn tại */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-inner ${
              runwayMonths > 6
                ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                : runwayMonths >= 3
                ? 'bg-amber-950/80 border-amber-600/50 text-amber-300'
                : 'bg-rose-950/90 border-rose-600/80 text-rose-300 animate-pulse'
            }`}
            title={`Burn rate: ~${monthlyBurnRate.toLocaleString('vi-VN')} đ/tháng. Runway: ${runwayMonths} tháng.`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Runway: {runwayMonths > 99 ? '∞' : `${runwayMonths} th`}</span>
          </div>
        </div>

        {/* Nút báo động Khủng hoảng Kiến Nghị nếu có */}
        {gsm.activePetition && (
          <button
            onClick={() => {
              if (onOpenPetition) onOpenPetition();
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg animate-bounce border border-rose-400 shadow-lg cursor-pointer"
            title="Nhấn để mở bàn đàm phán giải quyết khủng hoảng"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>KIẾN NGHỊ ({gsm.activePetition.daysRemaining} ngày)</span>
          </button>
        )}

        {/* Năng lượng & Sức khỏe CEO */}
        <div className="flex items-center gap-4 border-l border-slate-700/60 pl-4">
          <div className="flex items-center gap-1.5" title="Năng lượng CEO">
            <Zap className="w-4 h-4 text-amber-400" />
            <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-300"
                style={{ width: `${gsm.playerStats.energy}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">{gsm.playerStats.energy}%</span>
          </div>

          <div className="flex items-center gap-1.5" title="Sức khỏe CEO">
            <Heart className="w-4 h-4 text-rose-500" />
            <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-rose-500 to-red-400 h-full transition-all duration-300"
                style={{ width: `${gsm.playerStats.health}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-rose-300">{gsm.playerStats.health}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-sky-950/50 border border-sky-600/40 px-2 py-0.5 rounded text-sky-300 text-xs font-semibold" title="Uy tín thương trường">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>Uy tín: {gsm.playerStats.reputation}</span>
          </div>
        </div>

        {/* Các nút bấm điều hướng nhanh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              gsm.openDashboardTab = 'OVERVIEW';
              soundManager.playClick();
              gsm.notify();
            }}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md hover:shadow-sky-500/20 transition cursor-pointer"
            title="Mở Bảng Điều Hành Doanh Nghiệp [TAB]"
          >
            <Briefcase className="w-4 h-4" />
            <span>CEO Suite [TAB]</span>
          </button>

          <button
            onClick={() => {
              // Chuyển nhanh giữa đường phố và văn phòng
              if (gsm.currentSceneId === 'CITY') {
                gsm.switchScene('OFFICE');
              } else {
                gsm.switchScene('CITY');
              }
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Chuyển địa điểm"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>{gsm.currentSceneId === 'CITY' ? 'Vào Văn Phòng' : 'Ra Phố'}</span>
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
            <Save className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={toggleMute}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Bật / Tắt Âm Thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

      </div>

      {/* Floating Quest Tracker */}
      <div className="self-start bg-slate-900/90 backdrop-blur-md border border-amber-500/60 rounded-xl p-3 shadow-xl max-w-sm pointer-events-auto text-xs space-y-1.5 animate-fadeIn">
        <div className="flex items-center justify-between text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">
          <span>{currentQuest.chapterTitle}</span>
          <span className="bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600/40 text-[9px]">Chỉ Dẫn</span>
        </div>
        <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
          <span>🎯</span>
          <span>{currentQuest.title}</span>
        </h4>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {currentQuest.targetHint}
        </p>
        <div className="text-[10px] text-emerald-400 font-medium pt-1 border-t border-slate-800">
          🎁 {currentQuest.rewardText}
        </div>
      </div>

      {/* Thông tin vị trí & Hướng dẫn điều khiển thu gọn */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-800 self-start pointer-events-auto gap-4">
        <div>
          <span className="text-sky-400 font-semibold">Vị Trí:</span> {gsm.currentScene.name}
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <span>Di chuyển: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-sky-300 font-mono">WASD</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-sky-300 font-mono">Mũi Tên</kbd></span>
          <span>|</span>
          <span>Tương tác: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">[E]</kbd> hoặc <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">[Space]</kbd></span>
          <span>|</span>
          <span>Chạy nhanh: <kbd className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 font-mono">Shift</kbd></span>
        </div>
      </div>
    </div>
  );
};
