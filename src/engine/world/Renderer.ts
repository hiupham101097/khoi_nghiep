// ============================================================================
// CEO EMPIRE: 2D CHIBI CANVAS RENDERER (Top-Down 3/4 & Layered Architecture)
// ============================================================================

import {
  CharacterAnimationState,
  CharacterDirection,
  DayTimePeriod,
  WeatherType,
  Position2D,
  FloatingText
} from '../../types';
import { MapSceneConfig } from './WorldData';

export interface RenderableEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: CharacterDirection;
  animationState: CharacterAnimationState;
  roleType: 'PLAYER' | 'EMPLOYEE' | 'LAN_ANH' | 'FATHER' | 'CITIZEN';
  gender?: 'MALE' | 'FEMALE';
  hairColor?: string;
  outfitColor?: string;
  hasGlasses?: boolean;
  statusIcon?: string;
  speechBubble?: string | null;
  walkFrame?: number;
}

export class WorldRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rainDrops: { x: number; y: number; speed: number; length: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to obtain 2D rendering context');
    }
    this.ctx = context;
    this.initWeatherParticles();
  }

  private initWeatherParticles() {
    this.rainDrops = [];
    for (let i = 0; i < 160; i++) {
      this.rainDrops.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        speed: 14 + Math.random() * 10,
        length: 12 + Math.random() * 8
      });
    }
  }

  // Camera offset
  public renderFrame(
    scene: MapSceneConfig,
    camera: Position2D,
    entities: RenderableEntity[],
    weather: WeatherType,
    ambientLight: { r: number; g: number; b: number; alpha: number },
    timePeriod: DayTimePeriod,
    activePrompt: string | null,
    tick: number,
    floatingTexts: FloatingText[] = [],
    sprintStrategy: string = 'BALANCED',
    stageLevel: number = 1
  ) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Dịch chuyển camera theo góc nhìn nhân vật chính
    ctx.translate(-camera.x, -camera.y);

    // LỚP 0 & 1: Vẽ sàn / đường phố / nền bối cảnh
    this.renderGroundAndDecor(scene, tick, sprintStrategy);

    // LỚP 2: Vẽ đồ nội thất & công trình cố định
    this.renderBuildingsAndObstacles(scene, timePeriod, tick, stageLevel);

    // LỚP 3: Nhân vật & thực thể (Depth sorted theo trục Y)
    const sortedEntities = [...entities].sort((a, b) => a.y - b.y);
    sortedEntities.forEach((entity) => {
      this.renderChibiCharacter(entity, tick);
    });

    // LỚP 4: Hiệu ứng ánh sáng nội thất / đèn đường
    this.renderLightSources(scene, timePeriod);

    // LỚP 5: Lớp phủ Ánh sáng Môi trường (Ngày / Hoàng hôn / Đêm)
    if (ambientLight.alpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(${ambientLight.r}, ${ambientLight.g}, ${ambientLight.b}, ${ambientLight.alpha})`;
      ctx.fillRect(0, 0, scene.width, scene.height);
      ctx.restore();
    }

    // LỚP 6: Thời tiết (Mưa rào đô thị)
    if (weather === 'RAIN') {
      this.renderRain(scene.width, scene.height);
    }

    // LỚP 7: Vùng tương tác nổi bật
    this.renderInteractionZones(scene, tick);

    // LỚP 7b: Floating Numbers & Text (+15M, -2M, Lên cấp)
    if (floatingTexts.length > 0) {
      this.renderFloatingTexts(floatingTexts);
    }

    ctx.restore();

    // LỚP 8: Floating Action Prompt trên màn hình nếu có
    if (activePrompt) {
      this.renderScreenPrompt(activePrompt, width, height);
    }
  }

  private renderFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;
    ctx.save();
    floatingTexts.forEach((ft) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      // Drop shadow text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  private renderGroundAndDecor(scene: MapSceneConfig, tick: number, sprintStrategy: string = 'BALANCED') {
    const ctx = this.ctx;

    if (scene.id === 'CITY') {
      // Nền vỉa hè đô thị Việt Nam (gạch terrazzo)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Đường nhựa trải dài giữa phố (Asphalt road)
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 260, scene.width, 220);

      // Vạch kẻ đường đứt đoạn
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.setLineDash([25, 20]);
      ctx.beginPath();
      ctx.moveTo(0, 370);
      ctx.lineTo(scene.width, 370);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vạch đi bộ qua đường (Pedestrian crosswalk)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(320, 270 + i * 28, 60, 16);
      }

      // Vỉa hè lát gạch có hoa văn
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let x = 0; x < scene.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 260);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, 480);
        ctx.lineTo(x, scene.height);
        ctx.stroke();
      }

      // Cây xanh đô thị ven đường
      [60, 360, 680, 1080].forEach((treeX) => {
        // Bóng cây
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(treeX + 20, 245, 30, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tán cây
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(treeX + 20, 215, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(treeX + 16, 210, 22, 0, Math.PI * 2);
        ctx.fill();
      });

      // Xe máy dựng vỉa hè (đặc trưng đường phố Việt Nam)
      [140, 260, 710].forEach((motoX) => {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(motoX, 235, 24, 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(motoX - 4, 238, 8, 8);
        ctx.fillRect(motoX + 20, 238, 8, 8);
      });

      // Quán trà đá / cà phê cóc với ghế nhựa đỏ xanh
      const cafeSpotX = 110;
      const cafeSpotY = 500;
      // Bàn nhựa nhỏ
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cafeSpotX, cafeSpotY, 28, 22);
      // Ghế đỏ xung quanh
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cafeSpotX - 12, cafeSpotY + 4, 10, 12);
      ctx.fillRect(cafeSpotX + 30, cafeSpotY + 4, 10, 12);
      ctx.fillRect(cafeSpotX + 8, cafeSpotY - 12, 12, 10);

    } else if (scene.id === 'ROOM') {
      // Sàn gỗ phòng trọ
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 0, scene.width, scene.height);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      for (let y = 0; y < scene.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(scene.width, y);
        ctx.stroke();
      }

      // Tường phòng trọ màu vàng nhạt
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, scene.width, 40);

      // Poster Steve Jobs / Khởi nghiệp trên tường
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(400, 8, 45, 25);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '7px sans-serif';
      ctx.fillText('STARTUP', 404, 22);

    } else if (scene.id === 'OFFICE') {
      // Sàn văn phòng trải thảm xám hiện đại
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Viền gạch trang trí
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      for (let x = 0; x < scene.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, scene.height);
        ctx.stroke();
      }

      // Tường kính văn phòng hiện đại
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, scene.width, 40);

      // Bảng trắng Kanban / Sprint burndown
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(320, 6, 140, 28);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(320, 6, 140, 28);

      // 3 Cột Kanban TODO - DOING - DONE
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(366, 9, 1, 22);
      ctx.fillRect(413, 9, 1, 22);

      // Sticky notes nhiều màu
      ctx.fillStyle = '#fef08a'; ctx.fillRect(328, 11, 10, 8);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(342, 16, 10, 8);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(375, 11, 10, 8);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(422, 11, 10, 8);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(438, 16, 10, 8);

      // Strategy badge
      let badgeText = 'BALANCED';
      let badgeColor = '#2563eb';
      if (sprintStrategy === 'QUALITY_FIRST') {
        badgeText = 'QUALITY FIRST';
        badgeColor = '#059669';
      } else if (sprintStrategy === 'CRUNCH_SPEED') {
        badgeText = 'CRUNCH SPEED';
        badgeColor = '#dc2626';
      } else if (sprintStrategy === 'REFACTOR_DEBT') {
        badgeText = 'REFACTOR DEBT';
        badgeColor = '#d97706';
      }
      ctx.fillStyle = badgeColor;
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText(badgeText, 325, 31);

    } else if (scene.id === 'VILLA') {
      // Sàn đá hoa cương bóng loáng
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Họa tiết đá cẩm thạch vàng hoàng gia
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      for (let x = 0; x < scene.width; x += 80) {
        for (let y = 0; y < scene.height; y += 80) {
          ctx.strokeRect(x, y, 80, 80);
        }
      }

      // Thảm nhung đỏ sang trọng giữa phòng
      ctx.fillStyle = '#881337';
      ctx.fillRect(240, 120, 320, 220);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(240, 120, 320, 220);

      // Tường ốp gỗ sồi cổ điển
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, scene.width, 40);

    } else if (scene.id === 'CAFE') {
      // Sàn gỗ phong cách vintage
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Tường gạch mộc
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, scene.width, 40);

      // Đèn thả vàng nghệ thuật
      for (let x = 120; x < scene.width; x += 150) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x, 30, 8, 0, Math.PI * 2);
        ctx.fill();
      }

    } else {
      // Các cảnh công sở khác (Ngân hàng, Tòa án)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, scene.width, scene.height);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, scene.width, 40);
    }
  }

  private renderBuildingsAndObstacles(scene: MapSceneConfig, timePeriod: DayTimePeriod, tick: number = 0, stageLevel: number = 1) {
    const ctx = this.ctx;

    if (scene.id === 'CITY') {
      // 1. Dãy Nhà Trọ Sinh Viên (Phía Tây Bắc)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(100, 40, 220, 180);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(90, 30, 240, 25); // Mái hiên
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('NHÀ TRỌ SINH VIÊN (HẺM 42)', 115, 75);

      // Cửa vào phòng trọ
      ctx.fillStyle = '#451a03';
      ctx.fillRect(180, 180, 60, 40);

      // 2. Tòa Tháp StartUp Tower (Trung Tâm Bắc)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(380, 40, 280, 200);
      // Biển hiệu LED sáng đèn
      ctx.fillStyle = timePeriod === 'NIGHT' ? '#38bdf8' : '#0284c7';
      ctx.fillRect(400, 50, 240, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('🏢 STARTUP TOWER (IT HUB)', 425, 73);

      // Các ô cửa kính văn phòng phản chiếu ánh sáng
      ctx.fillStyle = timePeriod === 'NIGHT' ? '#fef08a' : '#93c5fd';
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillRect(400 + c * 48, 100 + r * 40, 36, 26);
        }
      }
      // Cửa kính xoay
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(480, 195, 80, 45);

      // 3. Biệt Thự Gia Đình Họ Hoàng (Đông Bắc)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(740, 40, 380, 220);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(730, 30, 400, 25); // Mái ngói đỏ son
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🏰 DINH THỰ VINH PHÁT GROUP', 790, 75);
      // Cổng mạ vàng
      ctx.fillStyle = '#d97706';
      ctx.fillRect(880, 200, 80, 60);

      // 4. Quán Cà Phê StartUp Hub (Tây Nam)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(80, 520, 220, 200);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(90, 530, 200, 30);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('☕ STARTUP CAFE & HUB', 115, 550);
      // Cửa quán
      ctx.fillStyle = '#451a03';
      ctx.fillRect(160, 520, 70, 35);

      // 5. Ngân Hàng V-Bank (Nam Trung Tâm)
      ctx.fillStyle = '#065f46';
      ctx.fillRect(360, 520, 220, 200);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(370, 530, 200, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🏦 V-BANK (TÍN DỤNG)', 400, 550);
      ctx.fillStyle = '#047857';
      ctx.fillRect(440, 520, 70, 35);

      // 6. Chi Cục Thuế & ĐKKD (Nam Đông)
      ctx.fillStyle = '#831843';
      ctx.fillRect(640, 520, 220, 200);
      ctx.fillStyle = '#db2777';
      ctx.fillRect(650, 530, 200, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('🏛️ CHI CỤC THUẾ & ĐKKD', 675, 550);
      ctx.fillStyle = '#9d174d';
      ctx.fillRect(720, 520, 70, 35);

      // 7. Tòa Án Nhân Dân Thành Phố (Góc Đông Nam)
      ctx.fillStyle = '#374151';
      ctx.fillRect(920, 500, 240, 220);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(930, 510, 220, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('⚖️ TÒA ÁN NHÂN DÂN', 975, 530);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(1000, 500, 80, 35);

    } else if (scene.id === 'ROOM') {
      // Giường ngủ
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(60, 60, 140, 180);
      // Gối trắng
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(75, 75, 110, 35);

      // Bàn học & làm việc gỗ ép
      ctx.fillStyle = '#92400e';
      ctx.fillRect(360, 60, 160, 90);

      // Laptop đang mở màn hình phát sáng
      ctx.fillStyle = '#334155';
      ctx.fillRect(410, 80, 45, 30);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(412, 82, 41, 24);

      // Quạt máy đứng
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(80, 300, 18, 0, Math.PI * 2);
      ctx.fill();

    } else if (scene.id === 'OFFICE') {
      // Bàn CEO
      ctx.fillStyle = '#713f12';
      ctx.fillRect(80, 60, 140, 80);
      // Ghế da giám đốc
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(125, 45, 50, 25);
      // Biển tên CEO mạ vàng
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(110, 100, 80, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('CEO & FOUNDER', 115, 112);

      // Cụm các bàn làm việc của nhân viên IT
      const deskGroups = [
        { x: 120, y: 200, count: 2 },
        { x: 440, y: 200, count: 2 },
        { x: 120, y: 340, count: 2 },
        { x: 440, y: 340, count: 2 }
      ];

      deskGroups.forEach((dg) => {
        // Mặt bàn gỗ công nghiệp
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(dg.x, dg.y, 220, 90);
        // Ngăn cách giữa 2 bàn
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(dg.x + 105, dg.y, 10, 90);

        // Màn hình kép máy tính lập trình viên
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(dg.x + 25, dg.y + 15, 35, 20);
        ctx.fillRect(dg.x + 145, dg.y + 15, 35, 20);
        ctx.fillStyle = '#22c55e'; // Code terminal xanh lá
        ctx.fillRect(dg.x + 27, dg.y + 17, 31, 16);
        ctx.fillRect(dg.x + 147, dg.y + 17, 31, 16);
      });

      // Quầy Pantry & Máy pha cà phê
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(600, 60, 140, 70);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(620, 70, 30, 35); // Máy cà phê Espresso đỏ
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(670, 65, 25, 45); // Bình nước nóng lạnh

      // Vách kính ngăn phòng họp điều hành (Khi đạt Giai đoạn 2+)
      if (stageLevel >= 2) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(235, 40, 8, 120);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(235, 40, 8, 120);
      }

      // Tủ máy chủ Server Rack góc phòng với LED nhấp nháy (Giai đoạn 3+)
      if (stageLevel >= 3) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(710, 340, 42, 90);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(710, 340, 42, 90);
        // Đèn LED nhấp nháy
        for (let row = 0; row < 5; row++) {
          const ledOn = Math.sin(tick * 8 + row) > 0;
          ctx.fillStyle = ledOn ? '#22c55e' : '#15803d';
          ctx.fillRect(718, 355 + row * 14, 5, 5);
          ctx.fillStyle = ledOn ? '#38bdf8' : '#0369a1';
          ctx.fillRect(732, 355 + row * 14, 5, 5);
        }
      }

    } else if (scene.id === 'VILLA') {
      // Bàn trà cẩm thạch
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(300, 150, 200, 100);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(300, 150, 200, 100);

      // Vali 500 Triệu Đồng Đặt Trên Bàn (Tâm điểm cốt truyện)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(360, 180, 80, 45);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(390, 195, 20, 12);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('500.000.000đ', 370, 215);

      // Ghế bành chủ tịch bọc da
      ctx.fillStyle = '#831843';
      ctx.fillRect(350, 90, 100, 50);

    } else if (scene.id === 'COURT') {
      // Bục Thẩm phán
      ctx.fillStyle = '#78350f';
      ctx.fillRect(260, 60, 240, 90);
      // Quốc huy / Búa gỗ công lý
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(380, 80, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('CÔNG LÝ', 360, 105);

      // Vành móng ngựa
      ctx.fillStyle = '#b45309';
      ctx.fillRect(320, 240, 120, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px sans-serif';
      ctx.fillText('VÀNH MÓNG NGỰA', 335, 270);
    }
  }

  // VẼ NHÂN VẬT 2D CHIBI THEO TỶ LỆ 1:2.2 (Trưởng thành, biểu cảm anime, chuyển động chân tay mượt)
  public renderChibiCharacter(entity: RenderableEntity, tick: number) {
    const ctx = this.ctx;
    const { x, y, direction, animationState, roleType, gender } = entity;

    ctx.save();
    ctx.translate(x, y);

    // Tính toán frame bước đi (Walk cycle)
    const isMoving = animationState === 'WALK';
    const isWorking = animationState === 'WORK';
    const isProtesting = animationState === 'PROTEST';
    const isCelebrating = animationState === 'CELEBRATE';

    const walkOffset = isMoving ? Math.sin(tick * 12) * 4 : 0;
    const legSwing = isMoving ? Math.sin(tick * 12) * 8 : 0;
    const workTyping = isWorking ? Math.sin(tick * 20) * 2 : 0;
    const jumpCelebrate = isCelebrating ? -Math.abs(Math.sin(tick * 10) * 8) : 0;

    // 1. Bóng đổ nhân vật (Drop shadow dưới chân)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, jumpCelebrate);

    // 2. Chân và Giày Chibi (Limb movement)
    ctx.fillStyle = '#1e293b'; // Giày da / thể thao
    if (direction === 'LEFT' || direction === 'RIGHT') {
      ctx.fillRect(-6 + legSwing, 10, 5, 8);
      ctx.fillRect(2 - legSwing, 10, 5, 8);
    } else {
      ctx.fillRect(-7, 10 + legSwing * 0.5, 6, 8);
      ctx.fillRect(2, 10 - legSwing * 0.5, 6, 8);
    }

    // 3. Thân & Trang phục (Body & Outfit)
    let bodyColor = entity.outfitColor || '#2563eb';
    if (roleType === 'PLAYER') {
      bodyColor = '#0284c7'; // Áo sơ mi xanh CEO trẻ trung
    } else if (roleType === 'LAN_ANH') {
      bodyColor = '#ec4899'; // Váy hồng thanh lịch
    } else if (roleType === 'FATHER') {
      bodyColor = '#1e1b4b'; // Suit đen kim cương tài phiệt
    }

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-10, -4 + walkOffset * 0.5, 20, 16, 4);
    ctx.fill();

    // Cà vạt / Nơ / Chi tiết áo
    if (roleType === 'PLAYER' || roleType === 'FATHER') {
      ctx.fillStyle = roleType === 'FATHER' ? '#fbbf24' : '#ef4444';
      ctx.fillRect(-2, -2 + walkOffset * 0.5, 4, 10);
    }

    // 4. Tay Chibi & Hành động (Gõ phím khi làm việc, vung tay khi đi, giơ biển khi đình công)
    ctx.fillStyle = '#fcd34d'; // Màu da tay
    if (isWorking) {
      // Gõ phím liên tục
      ctx.fillRect(-12, 2 + workTyping, 5, 5);
      ctx.fillRect(8, 2 - workTyping, 5, 5);
    } else if (isProtesting) {
      // Giơ biển biểu tình phản đối
      ctx.fillRect(6, -18, 4, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -28, 24, 14);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(-4, -28, 24, 14);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('ĐÌNH CÔNG', -2, -18);
    } else {
      // Tay vung theo bước đi
      ctx.fillRect(-12, 0 - legSwing * 0.4, 4, 8);
      ctx.fillRect(8, 0 + legSwing * 0.4, 4, 8);
    }

    // 5. Đầu Chibi Tỷ Lệ Lớn (Head: tỷ lệ 1:2.2, khuôn mặt tròn đáng yêu giàu biểu cảm)
    const headY = -18 + walkOffset;
    ctx.fillStyle = '#fed7aa'; // Màu da khuôn mặt
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Má hồng Chibi
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(-8, headY + 4, 3, 0, Math.PI * 2);
    ctx.arc(8, headY + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // 6. Mắt Anime Chibi & Biểu Cảm
    if (direction !== 'UP') {
      const eyeOffsetX = direction === 'LEFT' ? -3 : direction === 'RIGHT' ? 3 : 0;
      
      if (animationState === 'SAD' || animationState === 'STRESSED') {
        // Mắt rưng rưng / nhíu mày căng thẳng
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-5 + eyeOffsetX, headY + 1, 3, Math.PI, Math.PI * 2);
        ctx.arc(5 + eyeOffsetX, headY + 1, 3, Math.PI, Math.PI * 2);
        ctx.stroke();
      } else if (animationState === 'ANGRY' || animationState === 'PROTEST') {
        // Mắt giận dữ xếch lên
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7 + eyeOffsetX, headY - 1);
        ctx.lineTo(-3 + eyeOffsetX, headY + 2);
        ctx.moveTo(7 + eyeOffsetX, headY - 1);
        ctx.lineTo(3 + eyeOffsetX, headY + 2);
        ctx.stroke();
      } else {
        // Mắt to tròn long lanh Chibi chuẩn anime
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffsetX, headY, 3, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffsetX, headY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Đốm sáng trong mắt (Anime reflection)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6 + eyeOffsetX, headY - 1, 1.2, 0, Math.PI * 2);
        ctx.arc(4 + eyeOffsetX, headY - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Miệng (Mouth)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (animationState === 'HAPPY' || animationState === 'CELEBRATE') {
        // Miệng cười tươi
        ctx.arc(eyeOffsetX, headY + 6, 3, 0, Math.PI);
      } else if (animationState === 'TALK') {
        // Mấp máy miệng nói chuyện
        const talkMouth = Math.sin(tick * 15) > 0;
        if (talkMouth) {
          ctx.arc(eyeOffsetX, headY + 6, 2.5, 0, Math.PI * 2);
        } else {
          ctx.moveTo(eyeOffsetX - 2, headY + 6);
          ctx.lineTo(eyeOffsetX + 2, headY + 6);
        }
      } else if (animationState === 'ANGRY') {
        // Mím môi nghiến răng
        ctx.moveTo(eyeOffsetX - 3, headY + 7);
        ctx.lineTo(eyeOffsetX + 3, headY + 5);
      } else {
        // Miệng mỉm nhẹ
        ctx.arc(eyeOffsetX, headY + 5, 2, 0.1, Math.PI - 0.1);
      }
      ctx.stroke();

      // Kính mắt nếu là Dev kính cận
      if (entity.hasGlasses) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-9 + eyeOffsetX, headY - 3, 7, 7);
        ctx.strokeRect(2 + eyeOffsetX, headY - 3, 7, 7);
        ctx.beginPath();
        ctx.moveTo(-2 + eyeOffsetX, headY);
        ctx.lineTo(2 + eyeOffsetX, headY);
        ctx.stroke();
      }
    }

    // 7. Kiểu Tóc Đặc Trưng (Hair Style)
    let hairColor = entity.hairColor || '#1e293b';
    if (roleType === 'LAN_ANH') {
      hairColor = '#451a03'; // Tóc nâu hạt dẻ dài mềm mại
    } else if (roleType === 'FATHER') {
      hairColor = '#94a3b8'; // Tóc hoa râm quyền lực
    }

    ctx.fillStyle = hairColor;
    if (roleType === 'LAN_ANH' || gender === 'FEMALE') {
      // Tóc dài buông xõa hai bên vai
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-16, headY - 3, 6, 22);
      ctx.fillRect(10, headY - 3, 6, 22);
      // Kẹp nơ xinh
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(8, headY - 12, 6, 4);
    } else {
      // Tóc ngắn vuốt nam tính hoặc mái xéo
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16, Math.PI, Math.PI * 2);
      ctx.fill();
      // Mái tóc rủ trước trán
      ctx.beginPath();
      ctx.moveTo(-14, headY - 3);
      ctx.lineTo(-4, headY - 1);
      ctx.lineTo(0, headY - 6);
      ctx.lineTo(6, headY - 2);
      ctx.lineTo(14, headY - 4);
      ctx.lineTo(14, headY - 14);
      ctx.lineTo(-14, headY - 14);
      ctx.closePath();
      ctx.fill();
    }

    // 8. Tên & Danh Xưng Phía Trên Đầu
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.font = 'bold 9px sans-serif';
    const textWidth = ctx.measureText(entity.name).width;
    ctx.fillRect(-textWidth / 2 - 4, headY - 28, textWidth + 8, 12);
    ctx.fillStyle = roleType === 'PLAYER' ? '#38bdf8' : roleType === 'LAN_ANH' ? '#f472b6' : '#f8fafc';
    ctx.fillText(entity.name, -textWidth / 2, headY - 19);

    // 9. Floating Emoticon / Status Badge (💻, ☕, 😡, ❤️, ⚠️, 😴)
    let emote = entity.statusIcon;
    if (!emote) {
      if (animationState === 'WORK') emote = '💻';
      else if (animationState === 'CELEBRATE') emote = '🎉';
      else if (animationState === 'STRESSED') emote = '⚡';
      else if (animationState === 'TIRED') emote = '😴';
      else if (animationState === 'HAPPY') emote = '✨';
      else if (animationState === 'PROTEST') emote = '⚠️';
    }

    if (emote) {
      const floatBob = Math.sin(tick * 8) * 3;
      ctx.font = '12px sans-serif';
      ctx.fillText(emote, 12, headY - 22 + floatBob);
    }

    // 10. Speech Bubble (Bong bóng thoại hội thoại thực tế của nhân viên)
    if (entity.speechBubble) {
      ctx.save();
      ctx.font = 'bold 9px sans-serif';
      const bubbleTextWidth = ctx.measureText(entity.speechBubble).width;
      const bW = bubbleTextWidth + 14;
      const bH = 18;
      const bX = -bW / 2;
      const bY = headY - 44;

      // Hộp bong bóng trắng bo viền xanh/cam
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 5);
      ctx.fill();
      ctx.stroke();

      // Đuôi nhọn trỏ vào đầu
      ctx.beginPath();
      ctx.moveTo(-4, bY + bH);
      ctx.lineTo(0, bY + bH + 4);
      ctx.lineTo(4, bY + bH);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text bên trong bong bóng
      ctx.fillStyle = '#0f172a';
      ctx.fillText(entity.speechBubble, bX + 7, bY + 12);
      ctx.restore();
    }

    ctx.restore();
  }

  // Vẽ các nguồn sáng ban đêm (Đèn đường, đèn văn phòng)
  private renderLightSources(scene: MapSceneConfig, timePeriod: DayTimePeriod) {
    if (timePeriod !== 'NIGHT' && timePeriod !== 'DUSK') return;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const lightPositions: Position2D[] = [];
    if (scene.id === 'CITY') {
      lightPositions.push(
        { x: 220, y: 260 },
        { x: 520, y: 260 },
        { x: 880, y: 260 },
        { x: 220, y: 480 },
        { x: 520, y: 480 },
        { x: 880, y: 480 }
      );
    } else if (scene.id === 'OFFICE') {
      lightPositions.push({ x: 150, y: 100 }, { x: 400, y: 250 }, { x: 650, y: 250 });
    } else if (scene.id === 'ROOM') {
      lightPositions.push({ x: 410, y: 80 });
    }

    lightPositions.forEach((pos) => {
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 5, pos.x, pos.y, 110);
      gradient.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      gradient.addColorStop(0.5, 'rgba(254, 240, 138, 0.18)');
      gradient.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 110, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Vẽ hiệu ứng mưa rơi (Rain system)
  private renderRain(width: number, height: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineWidth = 1.5;

    this.rainDrops.forEach((drop) => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 3, drop.y + drop.length);
      ctx.stroke();

      drop.y += drop.speed;
      drop.x -= 2;

      if (drop.y > height) {
        drop.y = -10;
        drop.x = Math.random() * width;
      }
    });

    ctx.restore();
  }

  // Vùng tương tác có vòng sáng nhấp nháy thu hút người chơi
  private renderInteractionZones(scene: MapSceneConfig, tick: number) {
    const ctx = this.ctx;
    const pulse = 0.5 + Math.sin(tick * 6) * 0.3;

    scene.interactiveZones.forEach((zone) => {
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      ctx.setLineDash([]);
    });
  }

  // Hiển thị lời nhắc tương tác chính giữa đáy màn hình
  private renderScreenPrompt(promptText: string, screenWidth: number, screenHeight: number) {
    const ctx = this.ctx;
    ctx.save();

    ctx.font = 'bold 13px sans-serif';
    const textWidth = ctx.measureText(promptText).width;
    const boxWidth = textWidth + 36;
    const boxHeight = 36;
    const boxX = (screenWidth - boxWidth) / 2;
    const boxY = screenHeight - 60;

    // Nền hộp thông điệp mờ cao cấp
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chữ hướng dẫn
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⚡', boxX + 10, boxY + 23);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(promptText, boxX + 28, boxY + 23);

    ctx.restore();
  }
}
