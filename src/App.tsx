// ============================================================================
// CEO EMPIRE: 500 TRIỆU ĐỔI LẤY TƯƠNG LAI — MAIN APPLICATION ROOT
// ============================================================================

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GameStateManager } from './engine/core/GameStateManager';
import { WorldRenderer } from './engine/world/Renderer';
import { HUD } from './ui/HUD';
import { CEODashboard } from './ui/CEODashboard';
import { IntroCinematicModal } from './ui/IntroCinematicModal';
import { EndingCinematicModal } from './ui/EndingCinematicModal';
import { RecruitModal } from './ui/RecruitModal';
import { ProjectTenderModal } from './ui/ProjectTenderModal';
import { BankModal } from './ui/BankModal';
import { DynamicEventModal } from './ui/DynamicEventModal';
import { SaveMenuModal } from './ui/SaveMenuModal';
import { soundManager } from './engine/core/SoundManager';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);

  // Khởi tạo GameStateManager duy nhất
  const gsm = useMemo(() => new GameStateManager(), []);
  const [, setTick] = useState<number>(0);

  // Đăng ký listener để re-render UI khi GameState thay đổi
  useEffect(() => {
    const unsubscribe = gsm.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, [gsm]);

  // Thiết lập Canvas và Vòng lặp trò chơi (Main Game Loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Tự động căn chỉnh kích thước Canvas toàn màn hình
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const renderer = new WorldRenderer(canvas);
    rendererRef.current = renderer;

    let lastTime = performance.now();
    let animationFrameId: number;
    let globalTick = 0;

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      globalTick += deltaTime;

      // 1. Cập nhật logic game
      gsm.update(deltaTime);

      // 2. Tính toán vị trí Camera (theo dõi người chơi và kẹp trong biên bản đồ)
      const scene = gsm.currentScene;
      let camX = gsm.playerController.pos.x - canvas.width / 2;
      let camY = gsm.playerController.pos.y - canvas.height / 2;

      const maxCamX = Math.max(0, scene.width - canvas.width);
      const maxCamY = Math.max(0, scene.height - canvas.height);

      camX = Math.max(0, Math.min(camX, maxCamX));
      camY = Math.max(0, Math.min(camY, maxCamY));

      // 3. Vẽ toàn bộ khung hình thế giới 2D Chibi
      const entities = gsm.getRenderableEntities();
      const ambientLight = gsm.timeManager.getAmbientLighting();
      const activePrompt = gsm.playerController.nearbyZone ? gsm.playerController.nearbyZone.prompt : null;

      renderer.renderFrame(
        scene,
        { x: camX, y: camY },
        entities,
        gsm.timeManager.weather,
        ambientLight,
        gsm.timeManager.getPeriod(),
        activePrompt,
        globalTick
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Xử lý phím tắt toàn cục
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        gsm.openDashboardTab = gsm.openDashboardTab ? null : 'OVERVIEW';
        soundManager.playClick();
        gsm.notify();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        gsm.isSaveMenuOpen = !gsm.isSaveMenuOpen;
        soundManager.playClick();
        gsm.notify();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gsm]);

  // Hỗ trợ chạm / click di chuyển cho chuột hoặc màn hình cảm ứng
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    const scene = gsm.currentScene;
    const maxCamX = Math.max(0, scene.width - canvas.width);
    const maxCamY = Math.max(0, scene.height - canvas.height);
    const camX = Math.max(0, Math.min(gsm.playerController.pos.x - canvas.width / 2, maxCamX));
    const camY = Math.max(0, Math.min(gsm.playerController.pos.y - canvas.height / 2, maxCamY));

    const worldTargetX = clickScreenX + camX;
    const worldTargetY = clickScreenY + camY;

    gsm.playerController.moveToTarget(worldTargetX, worldTargetY, gsm.currentScene);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 font-sans">
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair block"
      />

      {/* Heads-Up Display (HUD) */}
      <HUD gsm={gsm} />

      {/* 1. Kịch bản Mở đầu 500 triệu */}
      {gsm.gamePhase === 'INTRO_CINEMATIC' && <IntroCinematicModal gsm={gsm} />}

      {/* 2. Cắt cảnh Ending (Ending 07 Ngày Trở Về & các Ending khác) */}
      {(gsm.gamePhase === 'INTRO_BRANCH_A' ||
        gsm.gamePhase === 'INTRO_BRANCH_B' ||
        gsm.gamePhase === 'GAME_OVER_ENDING') && <EndingCinematicModal gsm={gsm} />}

      {/* 3. Bảng Điều Hành Doanh Nghiệp CEO Dashboard */}
      {gsm.openDashboardTab !== null && (
        <CEODashboard
          gsm={gsm}
          onClose={() => {
            gsm.openDashboardTab = null;
            gsm.notify();
          }}
        />
      )}

      {/* 4. Sàn Tuyển Dụng Nhân Sự */}
      {gsm.isRecruitModalOpen && (
        <RecruitModal
          gsm={gsm}
          onClose={() => {
            gsm.isRecruitModalOpen = false;
            gsm.notify();
          }}
        />
      )}

      {/* 5. Bảng Chào Thầu Dự Án */}
      {gsm.isProjectTenderOpen && (
        <ProjectTenderModal
          gsm={gsm}
          onClose={() => {
            gsm.isProjectTenderOpen = false;
            gsm.notify();
          }}
        />
      )}

      {/* 6. Ngân Hàng V-Bank */}
      {gsm.isBankModalOpen && (
        <BankModal
          gsm={gsm}
          onClose={() => {
            gsm.isBankModalOpen = false;
            gsm.notify();
          }}
        />
      )}

      {/* 7. Menu Lưu / Tải Game */}
      {gsm.isSaveMenuOpen && (
        <SaveMenuModal
          gsm={gsm}
          onClose={() => {
            gsm.isSaveMenuOpen = false;
            gsm.notify();
          }}
        />
      )}

      {/* 8. Cửa Sổ Sự Kiện Động */}
      {gsm.currentActiveEvent !== null && (
        <DynamicEventModal gsm={gsm} event={gsm.currentActiveEvent} />
      )}
    </div>
  );
};

export default App;
