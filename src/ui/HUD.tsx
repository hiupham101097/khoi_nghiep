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
  ChevronUp,
  Users,
  FolderGit2,
  Coffee,
  Sparkles,
  Building2
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

  // Chỉ số tinh thần chung & Quy mô nhân sự (Lấy cảm hứng từ Ảnh tham khảo 3: "The number of employees", "Mood")
  const employeeCount = gsm.employees.length;
  const avgMorale = employeeCount > 0
    ? Math.round(gsm.employees.reduce((sum, e) => sum + (e.morale ?? 70), 0) / employeeCount)
    : 100;
  const moodBadge = avgMorale >= 80
    ? { text: 'Rất Tốt', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' }
    : avgMorale >= 60
    ? { text: 'Tốt', color: 'text-sky-400 bg-sky-950/80 border-sky-500/50' }
    : avgMorale >= 40
    ? { text: 'Áp Lực', color: 'text-amber-400 bg-amber-950/80 border-amber-500/50' }
    : { text: 'Căng Thẳng', color: 'text-rose-400 bg-rose-950/80 border-rose-500/50' };

  // Xử lý uống cà phê tại Pantry
  const handlePantryCoffee = () => {
    if (gsm.playerStats.energy >= 100) {
      gsm.addFloatingText('Đã đầy năng lượng!', gsm.playerController.pos.x, gsm.playerController.pos.y - 20, '#38bdf8');
      gsm.notify();
      return;
    }
    gsm.playerStats.energy = Math.min(100, gsm.playerStats.energy + 20);
    // Tăng nhẹ tinh thần nhân viên nếu có
    gsm.employees.forEach((emp) => {
      emp.morale = Math.min(100, (emp.morale ?? 70) + 5);
      if (emp.happiness !== undefined) emp.happiness = emp.morale;
    });
    gsm.addFloatingText('+20 Năng Lượng ☕', gsm.playerController.pos.x, gsm.playerController.pos.y - 25, '#fbbf24');
    gsm.decisionLog.push('CEO thưởng thức cà phê và mời toàn thể nhân viên (+20 Năng lượng, +5 Tinh thần).');
    soundManager.playClick();
    gsm.notify();
  };

  // Nếu đang trong Cắt Cảnh Mở Đầu 500 triệu (Intro Cinematic RPG)
  if (gsm.gamePhase === 'INTRO_CINEMATIC') {
    return (
      <div className="fixed inset-x-0 top-0 z-40 p-2 sm:p-4 pointer-events-none flex items-center justify-between">
        <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/50 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2.5 shadow-2xl pointer-events-auto">
          <span className="text-xl">🏰</span>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>Dinh Thự Hoàng Gia • Vinh Phát Group</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">20:00</span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-mono">
              Chương Mở Đầu: Cuộc Gặp Định Mệnh 500 Triệu Đồng Đổi Lấy Tương Lai
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleMute}
            className="p-2 sm:p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 shadow-lg cursor-pointer transition"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    );
  }

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

          {/* Quy mô nhân sự (Lấy cảm hứng từ Ảnh tham khảo 3: "The number of employees") */}
          <button
            onClick={() => {
              gsm.openDashboardTab = 'HR';
              soundManager.playClick();
              gsm.notify();
            }}
            className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-lg text-xs cursor-pointer transition shadow-inner"
            title="Đội ngũ nhân sự (Nhấn để xem hồ sơ nhân viên)"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-100">{employeeCount}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">NV</span>
          </button>

          {/* Chỉ số tinh thần chung (Lấy cảm hứng từ Ảnh tham khảo 3: "Mood: Good") */}
          <div
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold shadow-inner ${moodBadge.color}`}
            title={`Tinh thần doanh nghiệp trung bình: ${avgMorale}%`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{moodBadge.text}</span>
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

      {/* Cụm Mini-Map Radar & Quest Tracker (Lấy cảm hứng từ Ảnh tham khảo 4: Radar góc trái màn hình) */}
      <div className="flex flex-col sm:flex-row items-start gap-2 self-start pointer-events-auto">
        {/* Radar Mini-Map Widget chuẩn RPG */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex flex-col items-center gap-1.5 animate-fadeIn">
          <div className="relative w-20 h-20 rounded-full bg-slate-950 border-2 border-slate-700/80 shadow-inner overflow-hidden flex items-center justify-center">
            {/* Lưới radar & vòng tròn đồng tâm */}
            <div className="absolute inset-1 rounded-full border border-sky-500/20" />
            <div className="absolute inset-3 rounded-full border border-sky-500/15" />
            <div className="absolute inset-5 rounded-full border border-sky-500/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[0.5px] bg-sky-500/20" />
              <div className="h-full w-[0.5px] bg-sky-500/20 absolute" />
            </div>

            {/* Quét radar quay đều */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent rounded-full animate-spin origin-center"
              style={{ animationDuration: '3.5s' }}
            />

            {/* Các điểm NPC / Nhân viên trên Radar */}
            {gsm.currentSceneId === 'OFFICE' &&
              gsm.employees.map((emp) => {
                const normX = ((emp.currentPos?.x || 200) / gsm.currentScene.width) * 64 + 8;
                const normY = ((emp.currentPos?.y || 200) / gsm.currentScene.height) * 64 + 8;
                const dotColor = emp.isStriking ? '#ef4444' : (emp.frustration || 0) > 60 ? '#f59e0b' : '#10b981';
                return (
                  <div
                    key={emp.id}
                    className="absolute w-1.5 h-1.5 rounded-full shadow-sm"
                    style={{
                      left: `${normX}px`,
                      top: `${normY}px`,
                      backgroundColor: dotColor,
                      boxShadow: `0 0 4px ${dotColor}`
                    }}
                    title={`${emp.name} (${emp.behaviorState})`}
                  />
                );
              })}

            {/* Điểm Cửa ra vào trên Radar */}
            <div
              className="absolute w-2 h-2 rounded-sm bg-amber-400 border border-amber-300 shadow-sm animate-pulse"
              style={{
                left: `${(380 / gsm.currentScene.width) * 64 + 8}px`,
                top: `${(480 / gsm.currentScene.height) * 64 + 8}px`
              }}
              title="Cửa ra vào"
            />

            {/* Điểm Người chơi (CEO) trên Radar */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shadow-md shadow-sky-400/80 z-10"
              style={{
                left: `${(gsm.playerController.pos.x / gsm.currentScene.width) * 64 + 7}px`,
                top: `${(gsm.playerController.pos.y / gsm.currentScene.height) * 64 + 7}px`
              }}
              title="Vị trí của bạn"
            />
          </div>

          {/* Nhãn vị trí dưới Radar */}
          <span className="text-[10px] font-bold text-slate-300 tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate max-w-[80px]">{gsm.currentScene.name.split(' ')[0]}</span>
          </span>
        </div>

        {/* Floating Quest Tracker — Collapsible để không che khuất màn hình */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/60 rounded-xl p-2.5 shadow-xl max-w-sm text-xs space-y-1 animate-fadeIn">
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

      {/* THANH ĐIỀU HƯỚNG NHANH PHÍA ĐÁY (Lấy cảm hứng từ Ảnh tham khảo 3 & 4: "Employ", "Business", "Lobby") */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl">
        <button
          onClick={() => {
            gsm.isRecruitModalOpen = true;
            soundManager.playClick();
            gsm.notify();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          title="Tuyển Dụng Nhân Sự [HR]"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tuyển Dụng</span>
          <span className="text-[10px] bg-sky-900/80 px-1.5 py-0.2 rounded-full font-mono">{employeeCount}</span>
        </button>

        <button
          onClick={() => {
            gsm.isProjectTenderOpen = true;
            soundManager.playClick();
            gsm.notify();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          title="Nhận Thầu Dự Án Phần Mềm [Projects]"
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dự Án</span>
          <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.2 rounded-full font-mono">{gsm.activeProjects.length}</span>
        </button>

        <button
          onClick={() => {
            gsm.openDashboardTab = 'OVERVIEW';
            soundManager.playClick();
            gsm.notify();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          title="CEO Suite / Dashboard Quản Trị [TAB]"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CEO Suite</span>
        </button>

        {/* Chuyển nhanh hoặc mở Thang Máy Tòa Nhà */}
        {['COMPANY_EXTERIOR', 'FLOOR_1', 'FLOOR_2', 'FLOOR_3', 'OFFICE', 'CEO_OFFICE'].includes(gsm.currentSceneId) ? (
          <>
            <button
              onClick={() => {
                gsm.isElevatorModalOpen = true;
                soundManager.playClick();
                gsm.notify();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-600/50 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              title="Mở Thang Máy Tòa Nhà (Chọn Tầng 1, 2, 3, Mặt Tiền)"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Thang Máy</span>
            </button>

            <button
              onClick={() => {
                gsm.switchScene('CITY', { x: 520, y: 270 });
                soundManager.playClick();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              title="Rời Tòa Nhà Ra Đường Phố"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Ra Phố</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              gsm.switchScene('COMPANY_EXTERIOR', { x: 500, y: 720 });
              soundManager.playClick();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
            title="Đến Khuôn Viên Trụ Sở Công Ty"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Vào Trụ Sở</span>
          </button>
        )}

        {/* Họp toàn thể công ty (Standup Meeting - Ảnh tham khảo 3: "Promotion / Meeting") */}
        <button
          onClick={() => gsm.callAllHandsMeeting()}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          title="Họp toàn thể nhân viên (+15 Tinh thần)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Họp All-Hands</span>
        </button>

        <button
          onClick={handlePantryCoffee}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          title="Uống Cà Phê (+20 Năng Lượng)"
        >
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Pantry</span>
        </button>

        <button
          onClick={() => {
            gsm.isSaveMenuOpen = true;
            soundManager.playClick();
            gsm.notify();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          title="Lưu / Tải Tiến Trình [ESC]"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Lưu</span>
        </button>
      </div>
    </div>
  );
};
