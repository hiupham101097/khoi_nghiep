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
import { EmployeeReviewModal } from './ui/EmployeeReviewModal';
import { CollectivePetitionModal } from './ui/CollectivePetitionModal';
import { DialogModal } from './ui/DialogModal';
import { ElevatorModal } from './ui/ElevatorModal';
import { VirtualControls } from './ui/VirtualControls';
import { RPGDialogueBox } from './ui/RPGDialogueBox';
import { VILLA_INTRO_STORY } from './engine/narrative/StoryEngine';
import { ENTERPRISE_STAGES } from './engine/economy/CompanyManager';
import { soundManager } from './engine/core/SoundManager';
import { InteractiveZone } from './engine/world/WorldData';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const navigatingZoneRef = useRef<InteractiveZone | null>(null);
  const viewportRef = useRef<{ cssWidth: number; cssHeight: number; dpr: number; zoom: number }>({
    cssWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
    cssHeight: typeof window !== 'undefined' ? window.innerHeight : 720,
    dpr: 1,
    zoom: 1
  });

  const [isPetitionModalOpen, setIsPetitionModalOpen] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
  });

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

    // Tự động căn chỉnh kích thước Canvas chuẩn High-DPI & Retina
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      viewportRef.current.cssWidth = cssW;
      viewportRef.current.cssHeight = cssH;
      viewportRef.current.dpr = dpr;
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

      // Tự động kích hoạt khi người chơi tự hành đến vùng tương tác
      if (navigatingZoneRef.current) {
        const targetZone = navigatingZoneRef.current;
        const closestX = Math.max(targetZone.x, Math.min(gsm.playerController.pos.x, targetZone.x + targetZone.width));
        const closestY = Math.max(targetZone.y, Math.min(gsm.playerController.pos.y, targetZone.y + targetZone.height));
        const dist = Math.hypot(gsm.playerController.pos.x - closestX, gsm.playerController.pos.y - closestY);
        if (dist < 45 || (!gsm.playerController.targetDestination && dist < 85)) {
          navigatingZoneRef.current = null;
          gsm.playerController.clearTargetDestination();
          gsm.handleZoneInteraction(targetZone);
          soundManager.playClick();
        }
      }

      // 2. Tính toán Adaptive Zoom & Tọa độ Camera mượt mà
      const cssW = viewportRef.current.cssWidth;
      const cssH = viewportRef.current.cssHeight;
      const dpr = viewportRef.current.dpr;
      const scene = gsm.currentScene;

      // Adaptive zoom chuẩn hóa cho mọi tỷ lệ màn hình (Desktop 2K/4K, 1080p, Laptop 720p/768p, Tablet, Mobile)
      let targetZoom = 1.0;
      if (cssW >= 1920) {
        targetZoom = Math.min(1.5, Math.max(1.2, cssH / 650));
      } else if (cssW >= 1280) {
        targetZoom = Math.min(1.3, Math.max(1.05, cssH / 680));
      } else if (cssW >= 768) {
        targetZoom = Math.min(1.15, Math.max(0.95, cssW / 820));
      } else {
        targetZoom = Math.min(1.0, Math.max(0.78, cssW / 410));
      }
      viewportRef.current.zoom = targetZoom;

      const viewWorldW = cssW / targetZoom;
      const viewWorldH = cssH / targetZoom;

      // Centering logic: Nếu màn hình lớn hơn bối cảnh (như phòng trọ 600x450), căn giữa hoàn hảo!
      let targetCamX = 0;
      if (viewWorldW >= scene.width) {
        targetCamX = (scene.width - viewWorldW) / 2;
      } else {
        const maxCamX = scene.width - viewWorldW;
        targetCamX = Math.max(0, Math.min(gsm.playerController.pos.x - viewWorldW / 2, maxCamX));
      }

      let targetCamY = 0;
      if (viewWorldH >= scene.height) {
        targetCamY = (scene.height - viewWorldH) / 2;
      } else {
        const maxCamY = scene.height - viewWorldH;
        targetCamY = Math.max(0, Math.min(gsm.playerController.pos.y - viewWorldH / 2, maxCamY));
      }

      cameraRef.current.x += (targetCamX - cameraRef.current.x) * Math.min(1, deltaTime * 8);
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * Math.min(1, deltaTime * 8);

      // 3. Vẽ toàn bộ khung hình thế giới 2D Chibi
      const entities = gsm.getRenderableEntities();
      const ambientLight = gsm.timeManager.getAmbientLighting();
      const activePrompt = gsm.playerController.nearbyZone ? gsm.playerController.nearbyZone.prompt : null;
      const stageLevel = ENTERPRISE_STAGES[gsm.enterpriseStage]?.level || 1;

      renderer.renderFrame(
        scene,
        { x: cameraRef.current.x, y: cameraRef.current.y },
        entities,
        gsm.timeManager.weather,
        ambientLight,
        gsm.timeManager.getPeriod(),
        activePrompt,
        globalTick,
        gsm.floatingTexts,
        gsm.sprintStrategy,
        stageLevel,
        targetZoom,
        dpr,
        cssW,
        cssH,
        gsm.playerController.targetDestination
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

  // Hỗ trợ chạm / click di chuyển mượt mà chuẩn xác theo zoom
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    const zoom = viewportRef.current.zoom || 1.0;
    const worldTargetX = (clickScreenX / zoom) + cameraRef.current.x;
    const worldTargetY = (clickScreenY / zoom) + cameraRef.current.y;

    // 1. Kiểm tra tương tác click trực tiếp vào nhân viên trong văn phòng
    if (gsm.currentSceneId === 'OFFICE') {
      const clickedEmp = gsm.employees.find((emp) => {
        const posX = emp.currentPos ? emp.currentPos.x : 0;
        const posY = emp.currentPos ? emp.currentPos.y : 0;
        return Math.hypot(worldTargetX - posX, worldTargetY - posY) < 28;
      });

      if (clickedEmp) {
        gsm.selectedEmployeeFor1on1 = clickedEmp;
        soundManager.playClick();
        gsm.notify();
        return;
      }
    }

    // 2. Kiểm tra click trực tiếp vào Vùng tương tác (InteractiveZone)
    const clickedZone = gsm.currentScene.interactiveZones.find((z) => {
      return (
        worldTargetX >= z.x - 8 &&
        worldTargetX <= z.x + z.width + 8 &&
        worldTargetY >= z.y - 8 &&
        worldTargetY <= z.y + z.height + 8
      );
    });

    if (clickedZone) {
      const centerX = clickedZone.x + clickedZone.width / 2;
      const centerY = clickedZone.y + clickedZone.height / 2;
      const distToPlayer = Math.hypot(gsm.playerController.pos.x - centerX, gsm.playerController.pos.y - centerY);

      if (distToPlayer < 90) {
        navigatingZoneRef.current = null;
        gsm.playerController.clearTargetDestination();
        gsm.handleZoneInteraction(clickedZone);
        soundManager.playClick();
        return;
      } else {
        navigatingZoneRef.current = clickedZone;
        gsm.playerController.setTargetDestination(centerX, centerY);
        return;
      }
    }

    // 2b. Kiểm tra click trực tiếp vào Cửa (InteractiveDoor)
    if (gsm.currentScene.doors && gsm.currentScene.doors.length > 0) {
      const clickedDoor = gsm.currentScene.doors.find((d) => {
        return (
          worldTargetX >= d.x - 10 &&
          worldTargetX <= d.x + d.width + 10 &&
          worldTargetY >= d.y - 10 &&
          worldTargetY <= d.y + d.height + 10
        );
      });
      if (clickedDoor) {
        const doorCenterX = clickedDoor.x + clickedDoor.width / 2;
        const doorCenterY = clickedDoor.y + clickedDoor.height / 2;
        const distToPlayer = Math.hypot(gsm.playerController.pos.x - doorCenterX, gsm.playerController.pos.y - doorCenterY);

        if (distToPlayer < 90) {
          if (clickedDoor.doorType === 'ELEVATOR') {
            gsm.isElevatorModalOpen = true;
          } else {
            clickedDoor.isOpen = !clickedDoor.isOpen;
            soundManager.playDoor();
            gsm.addFloatingText(
              clickedDoor.isOpen ? '🚪 Mở Cửa' : '🚪 Đóng Cửa',
              doorCenterX,
              doorCenterY - 20,
              clickedDoor.isOpen ? '#22c55e' : '#f59e0b'
            );
          }
          gsm.notify();
          return;
        } else {
          gsm.playerController.setTargetDestination(doorCenterX, doorCenterY);
          return;
        }
      }
    }

    // 3. Thiết lập đích đến liên tục (Smooth Continuous Walk)
    navigatingZoneRef.current = null;
    gsm.playerController.setTargetDestination(worldTargetX, worldTargetY);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickScreenX = touch.clientX - rect.left;
      const clickScreenY = touch.clientY - rect.top;

      const zoom = viewportRef.current.zoom || 1.0;
      const worldTargetX = (clickScreenX / zoom) + cameraRef.current.x;
      const worldTargetY = (clickScreenY / zoom) + cameraRef.current.y;

      if (gsm.currentSceneId === 'OFFICE') {
        const clickedEmp = gsm.employees.find((emp) => {
          const posX = emp.currentPos ? emp.currentPos.x : 0;
          const posY = emp.currentPos ? emp.currentPos.y : 0;
          return Math.hypot(worldTargetX - posX, worldTargetY - posY) < 32;
        });

        if (clickedEmp) {
          gsm.selectedEmployeeFor1on1 = clickedEmp;
          soundManager.playClick();
          gsm.notify();
          return;
        }
      }

      const clickedZone = gsm.currentScene.interactiveZones.find((z) => {
        return (
          worldTargetX >= z.x - 12 &&
          worldTargetX <= z.x + z.width + 12 &&
          worldTargetY >= z.y - 12 &&
          worldTargetY <= z.y + z.height + 12
        );
      });

      if (clickedZone) {
        const centerX = clickedZone.x + clickedZone.width / 2;
        const centerY = clickedZone.y + clickedZone.height / 2;
        const distToPlayer = Math.hypot(gsm.playerController.pos.x - centerX, gsm.playerController.pos.y - centerY);

        if (distToPlayer < 90) {
          navigatingZoneRef.current = null;
          gsm.playerController.clearTargetDestination();
          gsm.handleZoneInteraction(clickedZone);
          soundManager.playClick();
          return;
        } else {
          navigatingZoneRef.current = clickedZone;
          gsm.playerController.setTargetDestination(centerX, centerY);
          return;
        }
      }

      navigatingZoneRef.current = null;
      gsm.playerController.setTargetDestination(worldTargetX, worldTargetY);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 font-sans">
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
        style={{ touchAction: 'none' }}
        className="absolute inset-0 cursor-crosshair block"
      />

      {/* Heads-Up Display (HUD) */}
      <HUD
        gsm={gsm}
        onOpenPetition={() => setIsPetitionModalOpen(true)}
        showTouchControls={showTouchControls}
        onToggleTouchControls={() => setShowTouchControls(!showTouchControls)}
      />

      {/* Điều Khiển Cảm Ứng Cho Mobile / Tablet */}
      {showTouchControls && gsm.gamePhase === 'PLAYING' && (
        <VirtualControls gsm={gsm} />
      )}

      {/* 1. Kịch bản Mở đầu 500 triệu (RPG Visual Novel Dialogue) */}
      {gsm.gamePhase === 'INTRO_CINEMATIC' && gsm.activeStoryNodeId && VILLA_INTRO_STORY[gsm.activeStoryNodeId] && (
        <RPGDialogueBox
          gsm={gsm}
          node={VILLA_INTRO_STORY[gsm.activeStoryNodeId]}
          onAdvanceNode={(nextNodeId) => {
            const nextNode = VILLA_INTRO_STORY[nextNodeId];
            if (nextNode && nextNode.onEnter) {
              nextNode.onEnter(gsm);
            }
            gsm.setStoryNode(nextNodeId);
          }}
          onChoiceSelected={(choice) => {
            if (choice.action) {
              choice.action(gsm);
            }
            if (choice.next) {
              const nextNode = VILLA_INTRO_STORY[choice.next];
              if (nextNode && nextNode.onEnter) {
                nextNode.onEnter(gsm);
              }
              gsm.setStoryNode(choice.next);
            }
          }}
        />
      )}

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

      {/* 9. Đối Thoại & Đánh Giá Nhân Sự 1-1 */}
      {gsm.selectedEmployeeFor1on1 !== null && (
        <EmployeeReviewModal
          gsm={gsm}
          employee={gsm.selectedEmployeeFor1on1}
          onClose={() => {
            gsm.selectedEmployeeFor1on1 = null;
            gsm.notify();
          }}
        />
      )}

      {/* 10. Đàm Phán Đơn Kiến Nghị Tập Thể (Khủng Hoảng Lao Động) */}
      {(isPetitionModalOpen || (gsm.activePetition !== null && gsm.activePetition.daysRemaining === 3)) && gsm.activePetition !== null && (
        <CollectivePetitionModal
          gsm={gsm}
          petition={gsm.activePetition}
          onClose={() => setIsPetitionModalOpen(false)}
        />
      )}

      {/* 11. Hộp thoại cốt truyện & tương tác nhân vật (RPG Dialog Box) */}
      {gsm.activeDialog !== null && (
        <DialogModal gsm={gsm} />
      )}

      {/* 12. Thang Máy Điều Khiển Chọn Tầng (Floor Selection Elevator Panel) */}
      {gsm.isElevatorModalOpen && (
        <ElevatorModal
          currentFloor={gsm.currentSceneId}
          onSelectFloor={(floor) => gsm.selectElevatorFloor(floor)}
          onClose={() => gsm.closeElevatorModal()}
        />
      )}
    </div>
  );
};

export default App;
