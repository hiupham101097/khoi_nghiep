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

export type JobRoleType = 
  | 'CEO' 
  | 'IT' 
  | 'DESIGNER' 
  | 'SALES' 
  | 'LEAD' 
  | 'ADMIN' 
  | 'SECURITY' 
  | 'LAN_ANH' 
  | 'FATHER' 
  | 'CITIZEN';

export interface RenderableEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: CharacterDirection;
  animationState: CharacterAnimationState;
  roleType: 'PLAYER' | 'EMPLOYEE' | 'LAN_ANH' | 'FATHER' | 'CITIZEN';
  jobRole?: JobRoleType;
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
  private spriteImages: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to obtain 2D rendering context');
    }
    this.ctx = context;
    this.initWeatherParticles();
    this.loadSprites();
  }

  // Tải các sprite Chibi 2D từ thư mục public/sprites/
  private loadSprites() {
    if (typeof window === 'undefined') return;
    const roles = ['ceo', 'office', 'developer', 'designer', 'hr', 'assistant'];
    const views = ['front', 'side', 'back'];

    roles.forEach((role) => {
      views.forEach((view) => {
        const key = `${role}_${view}`;
        const img = new Image();
        img.src = `/sprites/${key}.png`;
        img.onload = () => {
          this.spriteImages.set(key, img);
        };
      });
    });
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

  // Camera offset & Viewport Responsive
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
    stageLevel: number = 1,
    zoom: number = 1.0,
    dpr: number = 1.0,
    cssWidth: number = 800,
    cssHeight: number = 600,
    targetDestination?: Position2D | null
  ) {
    const ctx = this.ctx;

    // Reset transform theo devicePixelRatio để nét căng tuyệt đối
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Xóa toàn bộ viewport và phủ nền đen sẫm sang trọng
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    ctx.save();
    // Áp dụng scale zoom và dịch chuyển camera
    ctx.scale(zoom, zoom);
    ctx.translate(-camera.x, -camera.y);

    // LỚP 0 & 1: Vẽ sàn / đường phố / nền bối cảnh
    this.renderGroundAndDecor(scene, tick, sprintStrategy);

    // LỚP 1b: Điểm đích đến Click-to-Move / Tap-to-Move (Vòng sóng lan tỏa chuẩn RPG)
    if (targetDestination) {
      this.renderDestinationMarker(targetDestination, tick);
    }

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

    // Viền khung bối cảnh diorama cao cấp
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, scene.width, scene.height);

    ctx.restore();

    // LỚP 8: Floating Action Prompt trên màn hình nếu có (tọa độ CSS)
    if (activePrompt) {
      this.renderScreenPrompt(activePrompt, cssWidth, cssHeight, dpr);
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
      // 1. SÀN GỖ PHÒNG TRỌ XƯƠNG CÁ (CHEVRON PARQUET) ẤM ÁP
      const oakLight = '#d97706';
      const oakDark = '#b45309';
      ctx.fillStyle = oakLight;
      ctx.fillRect(0, 0, scene.width, scene.height);

      ctx.strokeStyle = 'rgba(69, 26, 3, 0.2)';
      ctx.lineWidth = 1;
      for (let y = 40; y < scene.height; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(scene.width, y); ctx.stroke();
      }

      // Thảm trải sàn dệt sợi Bohemia ấm cúng giữa phòng
      const rugX = 220;
      const rugY = 160;
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(rugX, rugY, 180, 140, 6);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Họa tiết dệt thổ cẩm quả trám trên thảm
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      for (let rx = rugX + 25; rx < rugX + 160; rx += 30) {
        ctx.beginPath();
        ctx.moveTo(rx, rugY + 70);
        ctx.lineTo(rx + 15, rugY + 45);
        ctx.lineTo(rx + 30, rugY + 70);
        ctx.lineTo(rx + 15, rugY + 95);
        ctx.closePath();
        ctx.stroke();
      }

      // 2. TƯỜNG PHÒNG TRỌ VÀNG KEM & VIỀN GỖ SỒI
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(0, 0, scene.width, 38);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 36, scene.width, 4);

      // Poster Steve Jobs "Stay Hungry Stay Foolish" & Anime Wall Art
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(280, 6, 42, 26);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(280, 6, 42, 26);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('STEVE JOBS', 282, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '5px sans-serif';
      ctx.fillText('THINK BIG', 284, 25);

      // Poster Bảng Kế Hoạch 10 Tỷ VNĐ
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(440, 6, 48, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('MỤC TIÊU 2026', 444, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('500M ➔ 10 TỶ', 444, 25);

    } else if (scene.id === 'OFFICE') {
      // 1. SÀN GỖ PARQUET OAK ẤM ÁP CHUẨN ISOMETRIC (Ảnh tham khảo 1 & 4)
      const plankW = 50;
      const plankH = 24;
      const oakShades = ['#d8a873', '#cfa068', '#c4955d', '#dfb27e', '#cca26e'];

      for (let y = 40; y < scene.height; y += plankH) {
        const rowIdx = Math.floor((y - 40) / plankH);
        const xOffset = (rowIdx % 2) * (plankW / 2);

        for (let x = -plankW; x < scene.width + plankW; x += plankW) {
          const drawX = x + xOffset;
          const shadeIdx = Math.abs((Math.floor(drawX * 7 + y * 13)) % oakShades.length);
          ctx.fillStyle = oakShades[shadeIdx];
          ctx.fillRect(drawX, y, plankW, plankH);

          // Đường viền ghép mộng gỗ tinh xảo
          ctx.strokeStyle = 'rgba(74, 46, 24, 0.12)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(drawX, y, plankW, plankH);

          // Vân gỗ mờ tự nhiên
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(drawX + 4, y + 3, plankW - 8, 2);
        }
      }

      // Len chân tường gỗ sẫm màu chạy dọc phòng
      ctx.fillStyle = '#4a2e18';
      ctx.fillRect(0, 36, scene.width, 6);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 35, scene.width, 1.2);

      // 2. TƯỜNG VĂN PHÒNG & KHUNG CỬA SỔ LỚN CÓ RÈM SÁO NGANG (Ảnh 1 & 4)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, scene.width, 36);

      // Cửa sổ kính toàn cảnh phía sau với rèm sáo (Venetian Blinds)
      const windows = [
        { x: 50, w: 230 },
        { x: 510, w: 240 }
      ];

      windows.forEach((win) => {
        // Khung cửa sổ nhôm trắng xám
        ctx.fillStyle = '#64748b';
        ctx.fillRect(win.x, 2, win.w, 32);

        // Bầu trời & thành phố mờ phía ngoài
        const skyGrad = ctx.createLinearGradient(win.x, 2, win.x, 34);
        skyGrad.addColorStop(0, '#7dd3fc');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(win.x + 3, 4, win.w - 6, 28);

        // Bóng các tòa nhà chọc trời xa xa
        ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.fillRect(win.x + 20, 16, 25, 16);
        ctx.fillRect(win.x + 60, 12, 35, 20);
        ctx.fillRect(win.x + 120, 14, 30, 18);
        ctx.fillRect(win.x + 170, 18, 40, 14);

        // Rèm sáo ngang (Venetian blinds slats)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 0.5;
        for (let sly = 6; sly < 32; sly += 3.5) {
          ctx.fillRect(win.x + 3, sly, win.w - 6, 2);
          ctx.strokeRect(win.x + 3, sly, win.w - 6, 2);
        }
        // Dây kéo rèm
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(win.x + 12, 4);
        ctx.lineTo(win.x + 12, 28);
        ctx.moveTo(win.x + win.w - 12, 4);
        ctx.lineTo(win.x + win.w - 12, 28);
        ctx.stroke();
      });

      // Đồng hồ treo tường chuyển động (Ảnh 1 & 4)
      const clockX = 300;
      const clockY = 18;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(clockX, clockY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Kim đồng hồ (kim giây quay theo tick)
      const secAngle = (tick * 1.5) % (Math.PI * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.sin(secAngle) * 8, clockY - Math.cos(secAngle) * 8);
      ctx.stroke();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + 5, clockY - 3);
      ctx.stroke();

      // Lịch công tác treo tường (Ảnh 1)
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(475, 4, 22, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(475, 11, 22, 19);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(475, 4, 22, 26);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('2026', 477, 20);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('CEO', 478, 28);

      // Bảng trắng Kanban / Sprint burndown ở giữa tường
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(328, 4, 134, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(328, 4, 134, 30);

      // 3 Cột Kanban TODO - DOING - DONE
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(372, 6, 1, 26);
      ctx.fillRect(416, 6, 1, 26);

      // Sticky notes nhiều màu sắc
      ctx.fillStyle = '#fef08a'; ctx.fillRect(334, 8, 10, 7);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(348, 14, 10, 7);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(380, 8, 10, 7);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(424, 8, 10, 7);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(438, 14, 10, 7);

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
      ctx.fillText(badgeText, 332, 31);

      // 3. CINEMATIC VOLUMETRIC SUNBEAMS / TIA SÁNG CỬA SỔ (Ảnh tham khảo 4)
      ctx.save();
      const sunbeams = [
        { x1: 70, x2: 170, tx1: 160, tx2: 320 },
        { x1: 530, x2: 630, tx1: 610, tx2: 780 }
      ];
      sunbeams.forEach((beam) => {
        const grad = ctx.createLinearGradient(beam.x1, 40, beam.tx2, 480);
        grad.addColorStop(0, 'rgba(255, 252, 235, 0.18)');
        grad.addColorStop(0.4, 'rgba(255, 252, 235, 0.09)');
        grad.addColorStop(1, 'rgba(255, 252, 235, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(beam.x1, 36);
        ctx.lineTo(beam.x2, 36);
        ctx.lineTo(beam.tx2, 460);
        ctx.lineTo(beam.tx1, 460);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

    } else if (scene.id === 'CEO_OFFICE') {
      // 1. SÀN ĐÁ HOA CƯƠNG Ý CALACATTA SÁNG BÓNG & KHẢM CHỈ ĐỒNG NGHỆ THUẬT (Ảnh tham khảo 4)
      const marbleBg = '#f1ece5';
      ctx.fillStyle = marbleBg;
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Lát gạch men bóng kính lớn 75x75 với viền chỉ vàng gold
      const tileSize = 75;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
      ctx.lineWidth = 1;
      for (let tx = 0; tx < scene.width; tx += tileSize) {
        for (let ty = 40; ty < scene.height; ty += tileSize) {
          ctx.strokeRect(tx, ty, tileSize, tileSize);
          // Họa tiết vân đá mờ cẩm thạch
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(tx + 4, ty + 4, tileSize - 8, tileSize - 8);
          // Điểm góc kim cương mạ vàng (brass diamond cabochon)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.fillRect(tx - 2, ty - 2, 4, 4);
        }
      }

      // Len chân tường & Vách ốp gỗ Lam Sóng (Fluted Wood Panelling) sang trọng
      ctx.fillStyle = '#26130a';
      ctx.fillRect(0, 34, scene.width, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 32, scene.width, 2);

      // Tường chính sau bàn làm việc: Lam gỗ màu hạt dẻ cao cấp
      ctx.fillStyle = '#3a2013';
      ctx.fillRect(0, 0, 480, 34);
      // Rãnh lam gỗ dọc
      ctx.strokeStyle = '#200f07';
      ctx.lineWidth = 1.2;
      for (let fx = 0; fx < 480; fx += 10) {
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        ctx.lineTo(fx, 34);
        ctx.stroke();
      }

      // Đèn hắt tường vàng nghệ thuật (Wall Sconces) hai bên
      [180, 460].forEach((sconceX) => {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sconceX - 3, 6, 6, 22);
        const sGlow = ctx.createRadialGradient(sconceX, 17, 2, sconceX, 17, 30);
        sGlow.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
        sGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sconceX, 17, 30, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bức tranh sơn dầu phong cảnh toàn cảnh Sài Gòn (Bitexco & Sông Sài Gòn) giữa tường
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(235, 4, 210, 26);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(237, 6, 206, 22);
      // Trời xanh mây trắng trong tranh
      const artSky = ctx.createLinearGradient(237, 6, 237, 28);
      artSky.addColorStop(0, '#38bdf8');
      artSky.addColorStop(1, '#fed7aa');
      ctx.fillStyle = artSky;
      ctx.fillRect(237, 6, 206, 22);
      // Tòa Bitexco và công viên trong tranh
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(320, 10, 10, 18); // Tháp
      ctx.fillStyle = '#15803d';
      ctx.fillRect(237, 22, 206, 6); // Công viên

      // 2. CỬA SỔ TOÀN CẢNH PANORAMA SKYLINE HƯỚNG NHÌN LANDMARK 81 & BITEXCO (Ảnh tham khảo 4)
      const winX = 490;
      const winW = 310;
      ctx.fillStyle = '#334155';
      ctx.fillRect(winX, 0, winW, 36);

      // Bầu trời Sài Gòn rực rỡ nắng
      const skyGrad = ctx.createLinearGradient(winX, 0, winX, 36);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.7, '#93c5fd');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(winX + 4, 2, winW - 8, 30);

      // Tháp Landmark 81 vút cao xuyên mây
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(winX + 45, 6, 14, 26);
      ctx.fillRect(winX + 49, 2, 6, 4); // Chóp nhọn ăng-ten
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(winX + 50, 0, 4, 2);

      // Tháp Bitexco với đĩa đệm trực thăng
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(winX + 160, 8, 18, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(winX + 154, 14, 10, 3); // Helipad chìa ra ngoài

      // Các cao ốc văn phòng lân cận
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      ctx.fillRect(winX + 90, 14, 25, 18);
      ctx.fillRect(winX + 125, 12, 22, 20);
      ctx.fillRect(winX + 200, 15, 35, 17);
      ctx.fillRect(winX + 245, 11, 28, 21);

      // Bồn hoa rực rỡ khoe sắc dưới bậu cửa sổ (Ảnh 4: Hoa cẩm tú cầu hồng, tím, trắng)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(winX + 4, 32, winW - 8, 8);
      const flowerColors = ['#f472b6', '#c084fc', '#fbcfe8', '#38bdf8', '#fb7185', '#e879f9'];
      for (let fx = winX + 8; fx < winX + winW - 12; fx += 8) {
        ctx.fillStyle = '#16a34a'; // Lá xanh
        ctx.fillRect(fx - 1, 31, 6, 5);
        ctx.fillStyle = flowerColors[(fx * 3) % flowerColors.length];
        ctx.beginPath();
        ctx.arc(fx + 2, 30, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. HAI TẤM THẢM DỆT CAO CẤP DƯỚI BÀN CEO & PHÒNG KHÁCH (Ảnh 4)
      // Thảm 1: Dưới bàn làm việc CEO
      const rug1X = 220;
      const rug1Y = 150;
      const rug1W = 340;
      const rug1H = 125;
      ctx.fillStyle = '#dfd8cf';
      ctx.fillRect(rug1X, rug1Y, rug1W, rug1H);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rug1X + 4, rug1Y + 4, rug1W - 8, rug1H - 8);
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rug1X + 12, rug1Y + 12, rug1W - 24, rug1H - 24);

      // Thảm 2: Dưới bộ bàn ghế sofa tiếp khách VIP
      const rug2X = 230;
      const rug2Y = 325;
      const rug2W = 380;
      const rug2H = 175;
      ctx.fillStyle = '#ddd5c9';
      ctx.fillRect(rug2X, rug2Y, rug2W, rug2H);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.strokeRect(rug2X + 6, rug2Y + 6, rug2W - 12, rug2H - 12);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rug2X + 16, rug2Y + 16, rug2W - 32, rug2H - 32);

      // 4. TIA NẮNG CHIẾU XUYÊN QUA CỬA SỔ (Volumetric Light Rays)
      ctx.save();
      const ceoBeam = ctx.createLinearGradient(winX + 120, 30, 180, 480);
      ceoBeam.addColorStop(0, 'rgba(255, 251, 235, 0.28)');
      ceoBeam.addColorStop(0.5, 'rgba(255, 251, 235, 0.12)');
      ceoBeam.addColorStop(1, 'rgba(255, 251, 235, 0.0)');
      ctx.fillStyle = ceoBeam;
      ctx.beginPath();
      ctx.moveTo(winX + 20, 32);
      ctx.lineTo(winX + 240, 32);
      ctx.lineTo(520, 520);
      ctx.lineTo(160, 520);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

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
      // Sàn gỗ hạt dẻ ấm áp kiểu quán cà phê phong cách Scandinavia
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Ghép ván gỗ bóng bẩy
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 40; y < scene.height; y += 28) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(scene.width, y); ctx.stroke();
      }

      // Tường gạch thô đỏ nung cổ điển (Exposed Brick Wall)
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, scene.width, 42);
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 0.8;
      for (let bx = 0; bx < scene.width; bx += 20) {
        ctx.strokeRect(bx, 0, 20, 14);
        ctx.strokeRect(bx + 10, 14, 20, 14);
        ctx.strokeRect(bx, 28, 20, 14);
      }

      // Đèn thả Edison tròn phát sáng lung linh treo trần
      for (let x = 80; x < scene.width; x += 110) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 26); ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.arc(x, 28, 6, 0, Math.PI * 2); ctx.fill();
        const glow = ctx.createRadialGradient(x, 28, 2, x, 28, 25);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, 28, 25, 0, Math.PI * 2); ctx.fill();
      }

    } else if (scene.id === 'BANK') {
      // Sàn đá hoa cương trắng bóng V-Bank với viền đá xanh ngọc lục bảo
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, scene.width, scene.height);

      // Gạch lát 60x60 có chỉ viền xám nhạt
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let x = 0; x < scene.width; x += 60) {
        for (let y = 40; y < scene.height; y += 60) {
          ctx.strokeRect(x, y, 60, 60);
        }
      }

      // Dải thảm dẫn đường nhung xanh lá V-Bank từ cửa vào quầy
      ctx.fillStyle = '#065f46';
      ctx.fillRect(270, 160, 110, 250);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(270, 160, 110, 250);

      // Tường ngân hàng sang trọng màu xanh ngọc đậm
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, scene.width, 40);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 36, scene.width, 4);

    } else {
      // Tòa Án Nhân Dân Thành Phố: Sàn gỗ sồi uy nghiêm & Thảm nhung xanh thẩm phán
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, scene.width, scene.height);
      // Thảm nhung xanh thẫm hành lang tòa án
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(310, 150, 130, 310);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(310, 150, 130, 310);

      // Tường gỗ trang nghiêm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, scene.width, 40);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 36, scene.width, 4);
    }
  }

  private renderBuildingsAndObstacles(scene: MapSceneConfig, timePeriod: DayTimePeriod, tick: number = 0, stageLevel: number = 1) {
    const ctx = this.ctx;

    if (scene.id === 'CITY') {
      // 0. BÓNG ĐỔ DÀI CÁC TÒA NHÀ TRÊN MẶT ĐƯỜNG VÀ VỈA HÈ
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      // Bóng dãy tòa nhà phía Bắc
      ctx.beginPath();
      ctx.moveTo(100, 220); ctx.lineTo(320, 220); ctx.lineTo(340, 245); ctx.lineTo(120, 245); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(380, 240); ctx.lineTo(660, 240); ctx.lineTo(685, 265); ctx.lineTo(405, 265); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(740, 260); ctx.lineTo(1120, 260); ctx.lineTo(1145, 285); ctx.lineTo(765, 285); ctx.fill();

      // 1. Dãy Nhà Trọ Sinh Viên (Phía Tây Bắc)
      const roomBldX = 100;
      const roomBldY = 40;
      const roomBldW = 220;
      const roomBldH = 180;
      // Khối nhà tường vàng cam nhạt kiểu nhà phố Việt Nam
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(roomBldX, roomBldY, roomBldW, roomBldH);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(roomBldX, roomBldY, roomBldW, roomBldH);

      // Mái hiên tôn đỏ gạch
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(roomBldX - 8, roomBldY - 10, roomBldW + 16, 20);
      ctx.fillStyle = '#dc2626';
      for (let mx = roomBldX - 6; mx < roomBldX + roomBldW + 12; mx += 14) {
        ctx.fillRect(mx, roomBldY - 10, 2, 20);
      }

      // Ban công tầng 2 có cục nóng điều hòa & giàn phơi
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(roomBldX + 15, roomBldY + 50, 190, 42);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(roomBldX + 15, roomBldY + 50, 190, 42);
      // Lan can ban công sắt
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      for (let l = roomBldX + 20; l < roomBldX + 200; l += 10) {
        ctx.beginPath(); ctx.moveTo(l, roomBldY + 68); ctx.lineTo(l, roomBldY + 92); ctx.stroke();
      }
      // Cục nóng điều hòa
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(roomBldX + 25, roomBldY + 56, 22, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(roomBldX + 36, roomBldY + 63, 4, 0, Math.PI * 2); ctx.fill();

      // Biển hiệu Nhà Trọ
      ctx.fillStyle = '#b45309';
      ctx.fillRect(roomBldX + 30, roomBldY + 18, 160, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🏠 KHU TRỌ SINH VIÊN (HẺM 42)', roomBldX + 36, roomBldY + 33);

      // Cửa cuốn / Cửa gỗ ra vào phòng trọ tầng 1
      ctx.fillStyle = '#451a03';
      ctx.fillRect(170, 175, 80, 45);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(170, 175, 80, 45);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('LỐI VÀO PHÒNG TRỌ', 174, 202);

      // 2. Tòa Tháp Cao Ốc StartUp Tower (Trung Tâm Bắc - Hiện Đại)
      const towerX = 380;
      const towerY = 40;
      const towerW = 280;
      const towerH = 200;
      // Thân tòa nhà kính cường lực xanh dương hiện đại
      const towerGrad = ctx.createLinearGradient(towerX, towerY, towerX + towerW, towerY + towerH);
      towerGrad.addColorStop(0, '#1e3a8a');
      towerGrad.addColorStop(0.5, '#1e40af');
      towerGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = towerGrad;
      ctx.fillRect(towerX, towerY, towerW, towerH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(towerX, towerY, towerW, towerH);

      // Chóp tháp ăng-ten phát sóng có đèn đỏ nhấp nháy
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(towerX + towerW / 2, towerY);
      ctx.lineTo(towerX + towerW / 2, towerY - 25);
      ctx.stroke();
      const beaconOn = Math.sin(tick * 5) > 0;
      ctx.fillStyle = beaconOn ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(towerX + towerW / 2, towerY - 26, 4, 0, Math.PI * 2);
      ctx.fill();

      // Biển hiệu 3D Neon Marquee "STARTUP TOWER"
      const neonColor = timePeriod === 'NIGHT' ? '#38bdf8' : '#0284c7';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(towerX + 20, towerY + 12, towerW - 40, 32);
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(towerX + 20, towerY + 12, towerW - 40, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏢 STARTUP TOWER (IT HUB)', towerX + towerW / 2, towerY + 33);
      ctx.textAlign = 'left';

      // Các ô cửa sổ kính văn phòng có đèn bật sáng
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 6; col++) {
          const winBoxX = towerX + 20 + col * 40;
          const winBoxY = towerY + 54 + row * 40;
          const isLit = (col + row * 2 + Math.floor(tick * 0.2)) % 3 !== 0;
          ctx.fillStyle = isLit ? '#fef08a' : '#60a5fa';
          ctx.fillRect(winBoxX, winBoxY, 32, 26);
          // Rèm hoặc vách ngăn bên trong
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(winBoxX, winBoxY, 32, 26);
        }
      }

      // Sảnh cửa xoay tự động bằng kính
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.fillRect(470, 185, 100, 55);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(470, 185, 100, 55);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('CỬA VÀO VĂN PHÒNG', 476, 215);

      // 3. Dinh Thự Hoàng Gia Vinh Phát Group (Đông Bắc - Tân Cổ Điển)
      const villaX = 740;
      const villaY = 40;
      const villaW = 380;
      const villaH = 220;
      // Khối biệt thự đá trắng cẩm thạch
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(villaX, villaY, villaW, villaH);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(villaX, villaY, villaW, villaH);

      // Mái ngói vòm Mansard màu đỏ đô hoàng gia
      ctx.fillStyle = '#881337';
      ctx.fillRect(villaX - 10, villaY - 14, villaW + 20, 26);
      ctx.fillStyle = '#be123c';
      ctx.fillRect(villaX + 40, villaY - 26, 120, 14); // Tháp vòm phụ

      // Hàng cột trụ Hy Lạp Corinthian màu trắng ngà
      for (let col = 0; col < 6; col++) {
        const pillarX = villaX + 30 + col * 60;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pillarX, villaY + 20, 14, 150);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(pillarX, villaY + 20, 14, 150);
      }

      // Bảng tên mạ vàng dinh thự
      ctx.fillStyle = '#451a03';
      ctx.fillRect(villaX + 60, villaY + 25, villaW - 120, 26);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(villaX + 60, villaY + 25, villaW - 120, 26);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏰 DINH THỰ VINH PHÁT GROUP', villaX + villaW / 2, villaY + 42);
      ctx.textAlign = 'left';

      // Cổng nhôm đúc mạ vàng tráng lệ
      ctx.fillStyle = '#d97706';
      ctx.fillRect(870, 195, 100, 65);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(870, 195, 100, 65);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('CỔNG VÀO BIỆT THỰ', 878, 230);

      // 4. Quán Cà Phê StartUp Hub (Tây Nam)
      const cafeBldX = 80;
      const cafeBldY = 520;
      const cafeBldW = 220;
      const cafeBldH = 200;
      // Khối tường gạch đỏ cổ điển kiểu cà phê hipster
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cafeBldX, cafeBldY, cafeBldW, cafeBldH);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cafeBldX, cafeBldY, cafeBldW, cafeBldH);

      // Mái che bạt sọc cam-trắng (Awning)
      for (let s = 0; s < 11; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#ea580c' : '#ffffff';
        ctx.fillRect(cafeBldX + s * 20, cafeBldY - 10, 20, 18);
      }

      // Biển hiệu gỗ quán cà phê
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cafeBldX + 15, cafeBldY + 16, cafeBldW - 30, 28);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cafeBldX + 15, cafeBldY + 16, cafeBldW - 30, 28);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('☕ STARTUP CAFE & CO-WORKING', cafeBldX + 22, cafeBldY + 34);

      // Cửa kính lớn nhìn thấy bên trong ấm cúng
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(150, 490, 90, 45);
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2;
      ctx.strokeRect(150, 490, 90, 45);
      ctx.fillStyle = '#7c2d12';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('LỐI VÀO CAFE', 165, 515);

      // 5. Ngân Hàng V-Bank (Nam Trung Tâm)
      const bankBldX = 360;
      const bankBldY = 520;
      const bankBldW = 220;
      const bankBldH = 200;
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(bankBldX, bankBldY, bankBldW, bankBldH);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(bankBldX, bankBldY, bankBldW, bankBldH);

      // Biển hiệu ngân hàng V-Bank
      ctx.fillStyle = '#047857';
      ctx.fillRect(bankBldX + 15, bankBldY + 16, bankBldW - 30, 30);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bankBldX + 15, bankBldY + 16, bankBldW - 30, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🏦 V-BANK (TÍN DỤNG)', bankBldX + 32, bankBldY + 36);

      // Cửa vào ngân hàng
      ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.fillRect(430, 490, 90, 45);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(430, 490, 90, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('CỬA V-BANK', 448, 515);

      // 6. Chi Cục Thuế & Đăng Ký Doanh Nghiệp (Nam Đông)
      const taxBldX = 640;
      const taxBldY = 520;
      const taxBldW = 220;
      const taxBldH = 200;
      ctx.fillStyle = '#831843';
      ctx.fillRect(taxBldX, taxBldY, taxBldW, taxBldH);
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 2;
      ctx.strokeRect(taxBldX, taxBldY, taxBldW, taxBldH);

      ctx.fillStyle = '#9d174d';
      ctx.fillRect(taxBldX + 10, taxBldY + 16, taxBldW - 20, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🏛️ CHI CỤC THUẾ & ĐKKD', taxBldX + 22, taxBldY + 35);

      ctx.fillStyle = '#be185d';
      ctx.fillRect(710, 490, 90, 45);
      ctx.strokeStyle = '#f472b6';
      ctx.strokeRect(710, 490, 90, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('LỐI VÀO ĐKKD', 724, 515);

      // 7. Tòa Án Nhân Dân Thành Phố (Đông Nam)
      const courtBldX = 920;
      const courtBldY = 500;
      const courtBldW = 240;
      const courtBldH = 220;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(courtBldX, courtBldY, courtBldW, courtBldH);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(courtBldX, courtBldY, courtBldW, courtBldH);

      ctx.fillStyle = '#991b1b';
      ctx.fillRect(courtBldX + 15, courtBldY + 16, courtBldW - 30, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('⚖️ TÒA ÁN NHÂN DÂN', courtBldX + 35, courtBldY + 36);

      ctx.fillStyle = '#374151';
      ctx.fillRect(990, 470, 100, 45);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(990, 470, 100, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('CỔNG TÒA ÁN', 1012, 495);

      // 8. XE HƠI & PHƯƠNG TIỆN GIAO THÔNG CHẠY TRÊN ĐƯỜNG PHỐ (Thêm Sức Sống)
      // Xe Taxi Vàng chạy trên làn đường
      const taxiX = ((tick * 65 + 100) % (scene.width + 100)) - 50;
      const taxiY = 320;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(taxiX + 24, taxiY + 22, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.roundRect(taxiX, taxiY, 48, 22, 4); ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(taxiX + 10, taxiY + 3, 28, 10); // Kính xe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(taxiX + 18, taxiY - 5, 12, 5); // Đèn taxi
      // Bánh xe
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(taxiX + 6, taxiY + 18, 10, 6);
      ctx.fillRect(taxiX + 32, taxiY + 18, 10, 6);

      // Xe Hơi Trắng chạy ngược chiều phía dưới
      const car2X = scene.width - (((tick * 50 + 200) % (scene.width + 120)) - 60);
      const car2Y = 410;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(car2X + 24, car2Y + 22, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.roundRect(car2X, car2Y, 50, 22, 4); ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(car2X, car2Y, 50, 22);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(car2X + 12, car2Y + 3, 26, 10);

    } else if (scene.id === 'ROOM') {
      // 1. GIƯỜNG NGỦ SINH VIÊN ẤM CÚNG (Góc Tây Bắc)
      const bedX = 60;
      const bedY = 60;
      // Khung giường gỗ thông
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(bedX, bedY, 140, 180, 4);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Đệm ga trải giường màu xanh navy có họa tiết caro
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(bedX + 8, bedY + 8, 124, 164, 4);
      ctx.fill();

      // Chăn bông gấp nếp màu cam ấm
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(bedX + 8, bedY + 70, 124, 102, [0, 0, 4, 4]);
      ctx.fill();

      // 2 Chiếc gối trắng êm ái
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bedX + 18, bedY + 16, 48, 28, 4);
      ctx.roundRect(bedX + 74, bedY + 16, 48, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. BÀN LÀM VIỆC & GÓC CODING STARTUP (Góc Đông Bắc)
      const deskX = 360;
      const deskY = 60;
      // Bàn gỗ ép công nghiệp
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.roundRect(deskX, deskY, 160, 90, 4);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Laptop đang mở màn hình hiển thị mã nguồn code (VS Code syntax)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(deskX + 45, deskY + 18, 56, 36);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(deskX + 47, deskY + 20, 52, 32);
      // Các dòng code nhiều màu sắc
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(deskX + 51, deskY + 24, 20, 2);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(deskX + 51, deskY + 29, 32, 2);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(deskX + 56, deskY + 34, 24, 2);
      ctx.fillStyle = '#facc15'; ctx.fillRect(deskX + 51, deskY + 39, 16, 2);

      // Đèn bàn học tỏa nón sáng vàng ấm
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(deskX + 125, deskY + 25, 8, 0, Math.PI * 2);
      ctx.fill();
      const lampGlow = ctx.createRadialGradient(deskX + 125, deskY + 25, 2, deskX + 125, deskY + 25, 45);
      lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(deskX + 125, deskY + 25, 45, 0, Math.PI * 2);
      ctx.fill();

      // Chồng sách lập trình (Clean Code, Design Patterns, Khởi nghiệp 0 đến 1)
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(deskX + 18, deskY + 20, 18, 6);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(deskX + 18, deskY + 28, 20, 7);
      ctx.fillStyle = '#15803d'; ctx.fillRect(deskX + 18, deskY + 37, 22, 8);

      // Ly mì tôm / Cốc cà phê sinh viên
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(deskX + 120, deskY + 55, 12, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('☕', deskX + 122, deskY + 66);

      // 3. TỦ QUẦN ÁO & QUẠT MÁY ĐỨNG (Góc Tây Nam)
      const wardX = 60;
      const wardY = 260;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(wardX, wardY, 90, 120, 4);
      ctx.fill();
      ctx.strokeStyle = '#271005';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Tay nắm tủ
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(wardX + 42, wardY + 55, 2, 10);
      ctx.fillRect(wardX + 46, wardY + 55, 2, 10);

      // Đàn Guitar acoustic tựa góc tường bên cạnh tủ
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(wardX + 115, wardY + 80, 14, 20, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();
      // Cần đàn
      ctx.fillStyle = '#451a03';
      ctx.fillRect(wardX + 112, wardY + 25, 5, 40);

      // Quạt điện đứng có cánh quạt xoay
      const fanX = 175;
      const fanY = 280;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(fanX - 2, fanY, 4, 35);
      ctx.beginPath();
      ctx.arc(fanX, fanY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Cánh quạt quay
      const fanAngle = tick * 18;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(fanX, fanY);
      ctx.lineTo(fanX + Math.cos(fanAngle) * 11, fanY + Math.sin(fanAngle) * 11);
      ctx.moveTo(fanX, fanY);
      ctx.lineTo(fanX + Math.cos(fanAngle + Math.PI) * 11, fanY + Math.sin(fanAngle + Math.PI) * 11);
      ctx.stroke();

    } else if (scene.id === 'OFFICE') {
      // 1. KỆ SÁCH GỖ TỐI & TỦ TÀI LIỆU CÔNG CHỨNG (Ảnh tham khảo 1 & 4)
      const bookX = 42;
      const bookY = 55;
      const bookW = 34;
      const bookH = 105;
      // Khung tủ gỗ gụ sẫm
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(bookX, bookY, bookW, bookH);
      ctx.strokeStyle = '#1a0c02';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bookX, bookY, bookW, bookH);
      // Các đợt kệ gỗ chia 4 tầng
      ctx.fillStyle = '#4e342e';
      for (let s = 1; s <= 3; s++) {
        ctx.fillRect(bookX + 2, bookY + s * 25, bookW - 4, 3);
      }
      // Bìa còng và sách tài liệu đủ màu sắc
      const bookColors = ['#1e40af', '#dc2626', '#15803d', '#d97706', '#7c3aed', '#0284c7', '#ea580c'];
      for (let s = 0; s < 4; s++) {
        const shelfY = bookY + 3 + s * 25;
        for (let b = 0; b < 5; b++) {
          ctx.fillStyle = bookColors[(s * 5 + b) % bookColors.length];
          ctx.fillRect(bookX + 4 + b * 5.2, shelfY, 4.5, 21);
          // Gáy sách dập nhãn trắng
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(bookX + 4.8 + b * 5.2, shelfY + 4, 2.8, 4);
        }
      }
      // Bình cá cảnh mini / máy phun sương trên nóc tủ (Ảnh 1)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.beginPath();
      ctx.arc(bookX + bookW / 2, bookY - 7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c'; // Cá vàng bơi bên trong
      ctx.fillRect(bookX + bookW / 2 - 2, bookY - 8, 4, 2);

      // 2. ĐIỀU HÒA CÂY ĐỨNG SANG TRỌNG (Standing Tower Air Conditioner - Ảnh 1)
      const acX = 42;
      const acY = 185;
      const acW = 30;
      const acH = 88;
      // Thân máy trắng bo tròn góc
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(acX, acY, acW, acH, [6, 6, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Khe gió làm lạnh phía trên
      ctx.fillStyle = '#334155';
      for (let g = 0; g < 7; g++) {
        ctx.fillRect(acX + 4, acY + 12 + g * 5, acW - 8, 2.5);
      }
      // Màn hình LED kỹ thuật số 24°C
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(acX + 6, acY + 54, acW - 12, 12);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('24°C', acX + 7.5, acY + 63);
      // Luồng khí mát uốn lượn tinh tế
      const coolWave = Math.sin(tick * 4) * 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(acX + acW + 2, acY + 20);
      ctx.bezierCurveTo(acX + acW + 10, acY + 22 + coolWave, acX + acW + 18, acY + 18 - coolWave, acX + acW + 26, acY + 24);
      ctx.stroke();

      // 3. MÁY PHOTOCOPY & IN ĐA NĂNG VĂN PHÒNG (Copier Station - Ảnh 1 & 4)
      const printX = 40;
      const printY = 345;
      const printW = 36;
      const printH = 65;
      // Khung máy xám ghi công nghiệp
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(printX, printY, printW, printH, 4);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Khay giấy tự động phía trên (Feeder)
      ctx.fillStyle = '#475569';
      ctx.fillRect(printX + 4, printY - 6, printW - 8, 8);
      // Bàn quét scan kính
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(printX + 6, printY + 4, printW - 12, 10);
      // Màn hình cảm ứng LCD và phím số
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(printX + 6, printY + 18, 12, 9);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(printX + 8, printY + 20, 8, 5);
      // Đèn tín hiệu xanh sẵn sàng
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(printX + 24, printY + 22, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Khay đỡ giấy ra với xấp tài liệu trắng
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(printX + printW - 2, printY + 28, 14, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(printX + printW, printY + 26, 11, 14);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(printX + printW, printY + 26, 11, 14);

      // 4. BÀN LÀM VIỆC CỦA CEO & FOUNDER (Executive Desk)
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(80, 60, 140, 80);
      ctx.strokeStyle = '#2d1305';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(80, 60, 140, 80);
      // Tấm lót bàn da sang trọng
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(100, 75, 100, 50);
      // Ghế da giám đốc bọc nệm đen cao cấp
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(125, 42, 50, 24, [8, 8, 3, 3]);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Biển tên CEO mạ vàng sáng bóng
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(115, 108, 70, 14);
      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('CEO & FOUNDER', 119, 119);
      // Laptop CEO mở màn hình mỏng
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(132, 80, 36, 22);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(134, 82, 32, 18);
      // Đèn bàn Banker's Lamp chóa thủy tinh xanh lục
      ctx.fillStyle = '#15803d';
      ctx.fillRect(88, 72, 14, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(94, 78, 2, 8);

      // 5. CÂY XANH VĂN PHÒNG CHẬU GỐM CHÂN GỖ (Ảnh 1 & 4)
      const plantPositions = [
        { x: 232, y: 55 },
        { x: 748, y: 55 },
        { x: 748, y: 460 },
        { x: 52, y: 475 },
        { x: 375, y: 245 }
      ];
      plantPositions.forEach((p) => {
        // Bóng cây
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Chân đế gỗ kiềng 3 chân
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p.x - 7, p.y + 12);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(p.x + 7, p.y + 12);
        ctx.stroke();
        // Chậu gốm nung màu trắng / đất nung
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(p.x - 9, p.y - 12, 18, 14, [2, 2, 5, 5]);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Tán lá xanh tươi tốt nhiều tầng
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 20, 12, 0, Math.PI * 2);
        ctx.arc(p.x - 8, p.y - 16, 8, 0, Math.PI * 2);
        ctx.arc(p.x + 8, p.y - 16, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x - 2, p.y - 22, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. CÂY NƯỚC NÓNG LẠNH, THẢM ĐỎ & BÌNH CỨU HỎA (Ảnh 1)
      const waterX = 575;
      const waterY = 55;
      // Thảm đỏ lau chân bên cạnh (Ảnh 1)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(waterX - 6, waterY + 54, 42, 20);
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.strokeRect(waterX - 6, waterY + 54, 42, 20);
      // Hoa văn sọc thảm
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let rx = waterX - 2; rx < waterX + 34; rx += 6) {
        ctx.fillRect(rx, waterY + 56, 3, 16);
      }
      // Bình cứu hoả đỏ gắn cạnh tường
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(waterX - 22, waterY + 8, 12, 26, 3);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(waterX - 20, waterY + 4, 8, 5); // Vòi phun
      // Cây nước thân trắng
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(waterX, waterY + 16, 28, 44, 4);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Bình nước úp ngược màu xanh lam trong suốt
      ctx.fillStyle = 'rgba(14, 165, 233, 0.75)';
      ctx.beginPath();
      ctx.arc(waterX + 14, waterY + 10, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Bọt khí trong bình nước
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(waterX + 11, waterY + 8, 2, 0, Math.PI * 2);
      ctx.fill();
      // Hai vòi nước đỏ (nóng) và xanh (lạnh)
      ctx.fillStyle = '#ef4444'; ctx.fillRect(waterX + 6, waterY + 34, 4, 6);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(waterX + 18, waterY + 34, 4, 6);

      // 7. QUẦY PANTRY & MÁY CÀ PHÊ ESPRESSO
      const pantryX = 620;
      const pantryY = 60;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(pantryX, pantryY, 120, 68);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(pantryX, pantryY, 120, 68);
      // Mặt đá hoa cương màu xám sang trọng
      ctx.fillStyle = '#334155';
      ctx.fillRect(pantryX - 2, pantryY, 124, 12);
      // Máy pha cà phê Espresso màu đỏ đậm
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(pantryX + 15, pantryY - 14, 32, 26);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pantryX + 22, pantryY + 2, 18, 8); // Khay hứng
      // Hơi nước cà phê bốc lên
      const steamShift = Math.sin(tick * 6) * 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pantryX + 31, pantryY - 16);
      ctx.quadraticCurveTo(pantryX + 34 + steamShift, pantryY - 24, pantryX + 30, pantryY - 30);
      ctx.stroke();
      // Giá treo cốc sứ và rổ bánh snack
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pantryX + 65, pantryY - 6, 26, 16); // Rổ snack
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(pantryX + 98, pantryY - 4, 10, 10); // Cốc sứ

      // 8. CÁC CỤM BÀN LÀM VIỆC CHUYÊN NGHIỆP (Dev, Design, QA Pods - Ảnh 1 & 4)
      const workPods = [
        { x: 110, y: 195, title: 'ENGINEERING POD' },
        { x: 440, y: 195, title: 'PRODUCT & DESIGN POD' },
        { x: 110, y: 335, title: 'QUALITY & OPS POD' }
      ];

      workPods.forEach((pod) => {
        // Mặt bàn gỗ công nghiệp ép cao cấp
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(pod.x, pod.y, 220, 90, 4);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Vách ngăn nỉ màu xanh biển / kính mờ ở giữa (Divider Screen - Ảnh 1)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(pod.x + 106, pod.y, 8, 90);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pod.x + 108, pod.y + 4, 4, 82);

        // 2 Vị trí ngồi của Pod
        const seats = [
          { dx: 25, label: 'DEV A' },
          { dx: 135, label: 'DEV B' }
        ];

        seats.forEach((seat) => {
          const deskX = pod.x + seat.dx;
          const deskY = pod.y + 12;

          // Thảm lót bàn chống trượt
          ctx.fillStyle = '#334155';
          ctx.fillRect(deskX - 5, deskY + 6, 60, 44);

          // Ghế xoay công thái học lưới đen (Ergonomic Chair - Ảnh 1 & 4)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(deskX + 10, pod.y + 58, 30, 22, [4, 4, 8, 8]);
          ctx.fill();
          // Chân ghế 5 bánh xe
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(deskX + 25, pod.y + 80);
          ctx.lineTo(deskX + 16, pod.y + 88);
          ctx.moveTo(deskX + 25, pod.y + 80);
          ctx.lineTo(deskX + 34, pod.y + 88);
          ctx.stroke();

          // Màn hình kép siêu mỏng (Dual Monitor Setup - Ảnh 1, 2, 4)
          // Màn 1: Code terminal nền đen chữ xanh
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(deskX - 4, deskY, 30, 19);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(deskX - 2, deskY + 2, 26, 15);
          // Màn 2: Figma / Browser màn hình xanh sáng
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(deskX + 28, deskY, 28, 19);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(deskX + 30, deskY + 2, 24, 15);

          // Bàn phím cơ RGB
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(deskX + 6, deskY + 23, 26, 10);
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(deskX + 8, deskY + 25, 22, 2);

          // Chuột quang & cốc cà phê nhỏ
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(deskX + 36, deskY + 24, 6, 9);
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(deskX + 48, deskY + 28, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Thùng CPU case máy tính đứng dưới chân bàn
          ctx.fillStyle = '#020617';
          ctx.fillRect(deskX - 8, pod.y + 54, 12, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(deskX - 2, pod.y + 60, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // 9. KHU VỰC BÀN HỌP & THUYẾT TRÌNH CHIẾN LƯỢC (Meeting Room / Discussion Cluster - Ảnh 2 & 3)
      const meetX = 440;
      const meetY = 335;
      const meetW = 220;
      const meetH = 95;
      // Bàn họp gỗ óc chó bo tròn cạnh dài (Ảnh 3)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(meetX + 10, meetY + 14, meetW - 20, meetH - 28, 10);
      ctx.fill();
      ctx.strokeStyle = '#270e02';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Đường viền nẹp chỉ đồng trên mặt bàn họp
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(meetX + 22, meetY + 22, meetW - 44, meetH - 44);

      // 4 Ghế họp bố trí quanh bàn
      [meetX + 40, meetX + 110, meetX + 170].forEach((chairX) => {
        // Ghế hàng trên
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(chairX - 10, meetY - 2, 20, 14, 3);
        ctx.fill();
        // Ghế hàng dưới
        ctx.beginPath();
        ctx.roundRect(chairX - 10, meetY + meetH - 12, 20, 14, 3);
        ctx.fill();
      });

      // Tài liệu, laptop và bản vẽ Sprint trên bàn họp (Ảnh 2 & 3)
      // Laptops
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(meetX + 35, meetY + 26, 20, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(meetX + 37, meetY + 28, 16, 10);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(meetX + 155, meetY + 26, 20, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(meetX + 157, meetY + 28, 16, 10);

      // Bản thảo báo cáo tài chính & hợp đồng
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(meetX + 85, meetY + 28, 22, 16);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(meetX + 112, meetY + 30, 18, 14);

      // Bảng chiếu thuyết trình tăng trưởng doanh thu (Ảnh 3: "INCREASE COMPANY PROFITS")
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(meetX + 60, meetY + 54, 90, 22);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(meetX + 60, meetY + 54, 90, 22);
      // Biểu đồ đường cong tăng trưởng màu xanh lá (Ảnh 3)
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meetX + 66, meetY + 70);
      ctx.lineTo(meetX + 85, meetY + 68);
      ctx.lineTo(meetX + 105, meetY + 62);
      ctx.lineTo(meetX + 125, meetY + 64);
      ctx.lineTo(meetX + 142, meetY + 58);
      ctx.stroke();
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('+320% REVENUE', meetX + 86, meetY + 60);

      // 10. VÁCH KÍNH NGĂN PHÒNG HỌP & TỦ SERVER RACK (Giai đoạn 2 & 3+)
      if (stageLevel >= 2) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(235, 40, 8, 120);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(235, 40, 8, 120);
      }

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

    } else if (scene.id === 'CEO_OFFICE') {
      // 1. KỆ SÁCH ĐÈN LED ÂM TƯỜNG & TỦ TRƯNG BÀY CÚP DANH DỰ (Ảnh 4)
      const bookX = 42;
      const bookY = 55;
      const bookW = 160;
      const bookH = 150;
      // Khung gỗ óc chó viền chỉ đồng
      ctx.fillStyle = '#26130a';
      ctx.fillRect(bookX, bookY, bookW, bookH);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(bookX, bookY, bookW, bookH);

      // Đèn LED hắt sáng các ngăn kệ
      ctx.fillStyle = '#3a2013';
      for (let s = 1; s <= 3; s++) {
        const shelfY = bookY + s * 36;
        ctx.fillRect(bookX + 4, shelfY, bookW - 8, 4);
        // Dải LED vàng hắt ấm
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.fillRect(bookX + 4, shelfY - 32, bookW - 8, 3);
        ctx.fillStyle = '#3a2013';
      }

      // Tầng 1: Cúp vô địch vàng + Dây leo Pothos xanh biếc
      // Cúp vô địch
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bookX + 115, bookY + 20, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(bookX + 112, bookY + 28, 6, 7);
      ctx.fillRect(bookX + 107, bookY + 34, 16, 3);
      // Dây leo Pothos rủ lá xanh
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(bookX + 32, bookY + 12, 12, 0, Math.PI * 2);
      ctx.arc(bookX + 24, bookY + 20, 8, 0, Math.PI * 2);
      ctx.arc(bookX + 22, bookY + 32, 7, 0, Math.PI * 2);
      ctx.arc(bookX + 20, bookY + 44, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tầng 2: Quả địa cầu mạ vàng & Sách bìa da
      // Quả địa cầu
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(bookX + 35, bookY + 58, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bookX + 35, bookY + 58, 12, -Math.PI / 4, (Math.PI * 3) / 4);
      ctx.stroke();
      ctx.fillRect(bookX + 33, bookY + 68, 4, 4);
      // Hàng sách gáy da sang trọng
      const luxuryBookCovers = ['#7f1d1d', '#1e3a8a', '#14532d', '#78350f', '#581c87'];
      for (let b = 0; b < 10; b++) {
        ctx.fillStyle = luxuryBookCovers[b % luxuryBookCovers.length];
        ctx.fillRect(bookX + 65 + b * 8.5, bookY + 42, 7.5, 29);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bookX + 66.5 + b * 8.5, bookY + 48, 4.5, 3);
      }

      // Tầng 3: Kỷ niệm chương Pha Lê Khởi Nghiệp Kỳ Lân & Khung ảnh
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(bookX + 45, bookY + 80);
      ctx.lineTo(bookX + 55, bookY + 104);
      ctx.lineTo(bookX + 35, bookY + 104);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bookX + 44, bookY + 84, 2, 14);

      // Biểu tượng tăng trưởng thịnh vượng (Golden Growth Chart Icon)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(bookX + 90, bookY + 98, 5, 8);
      ctx.fillRect(bookX + 98, bookY + 92, 5, 14);
      ctx.fillRect(bookX + 106, bookY + 86, 5, 20);
      ctx.fillRect(bookX + 114, bookY + 78, 5, 28);

      // Ngăn tủ cánh gỗ khép kín phía dưới với núm tay nắm mạ vàng
      ctx.fillStyle = '#1c0d06';
      ctx.fillRect(bookX + 4, bookY + 115, bookW - 8, 32);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(bookX + 4, bookY + 115, (bookW - 8) / 2, 32);
      ctx.strokeRect(bookX + 4 + (bookW - 8) / 2, bookY + 115, (bookW - 8) / 2, 32);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bookX + (bookW - 8) / 2 - 4, bookY + 131, 2.5, 0, Math.PI * 2);
      ctx.arc(bookX + (bookW - 8) / 2 + 12, bookY + 131, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. BÀN LÀM VIỆC ĐIỀU HÀNH CHỦ TỊCH / CEO SUITE (Ảnh 4: L-Shaped Executive Desk)
      const dX = 260;
      const dY = 165;
      const dW = 280;
      const dH = 95;

      // Ghế giám đốc bọc da cao cấp (Caramel Executive Ergonomic Chair)
      ctx.fillStyle = '#5c2d16';
      ctx.beginPath();
      ctx.roundRect(dX + 115, dY - 42, 54, 44, [10, 10, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = '#361708';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Nệm lưng ghế múi da
      ctx.fillStyle = '#7a3e1e';
      ctx.fillRect(dX + 122, dY - 36, 40, 32);

      // Thân bàn làm việc chữ L vân gỗ sậm & mặt bàn phủ sơn mài cao cấp
      ctx.fillStyle = '#3e2013';
      ctx.beginPath();
      ctx.roundRect(dX, dY, dW, dH, 8);
      ctx.fill();
      ctx.strokeStyle = '#1e0d06';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dải LED Vàng Hoàng Kim hắt sáng chân bàn (LED Underglow - Ảnh 4)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(dX + 12, dY + dH - 6, dW - 24, 4);
      const ledGlow = ctx.createLinearGradient(dX, dY + dH, dX, dY + dH + 18);
      ledGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      ledGlow.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
      ctx.fillStyle = ledGlow;
      ctx.fillRect(dX + 8, dY + dH, dW - 16, 18);

      // Nẹp chỉ viền đồng kim loại xung quanh bàn
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dX + 6, dY + 6, dW - 12, dH - 12);

      // Tấm lót da đen sang trọng giữa bàn (Leather Desk Pad)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dX + 65, dY + 16, 150, 64);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(dX + 65, dY + 16, 150, 64);

      // Laptop Apple MacBook mở màn hình mỏng
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(dX + 118, dY + 28, 44, 26);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(dX + 120, dY + 30, 40, 22);
      // Logo Apple phản chiếu
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dX + 140, dY + 41, 3, 0, Math.PI * 2);
      ctx.fill();

      // Màn hình cong siêu rộng Ultra-Wide Monitor (Ảnh 4)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dX + 175, dY + 12, 60, 34);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(dX + 177, dY + 14, 56, 30);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dX + 202, dY + 46, 6, 8); // Chân đế

      // Đèn bàn Banker's Lamp đồng thau bóng loáng (Brass Lamp)
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(dX + 35, dY + 28, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(dX + 25, dY + 24, 20, 8);

      // Bình hoa mẫu đơn trắng quý phái (White Peonies Vase)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dX + 50, dY + 60, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(dX + 46, dY + 56, 5, 0, Math.PI * 2);
      ctx.arc(dX + 54, dY + 56, 5, 0, Math.PI * 2);
      ctx.arc(dX + 50, dY + 52, 6, 0, Math.PI * 2);
      ctx.fill();

      // Quả cầu thiên văn / armillary sphere kim loại bên phải
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dX + 252, dY + 42, 10, 0, Math.PI * 2);
      ctx.stroke();

      // 3. KHU TIẾP KHÁCH VIP / GUEST LOUNGE SUITE (Ảnh 4)
      const lX = 260;
      const lY = 345;
      // Ghế sofa dài 3 chỗ bọc nệm kem cao cấp (Cream Leather Sofa)
      ctx.fillStyle = '#f5ede1';
      ctx.beginPath();
      ctx.roundRect(lX + 85, lY + 60, 160, 52, 8);
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Khung chân gỗ sồi đen
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(lX + 83, lY + 106, 164, 6);

      // Gối tựa lưng màu xanh thẫm & vàng hoàng gia
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(lX + 96, lY + 66, 22, 22);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(lX + 212, lY + 66, 22, 22);
      // Khăn choàng len cashmere vắt ngang sofa
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(lX + 175, lY + 64, 24, 46);

      // 2 Ghế bành đơn nệm da kem (Armchairs)
      // Ghế đơn trái
      ctx.fillStyle = '#f5ede1';
      ctx.beginPath();
      ctx.roundRect(lX + 15, lY + 22, 54, 52, 6);
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(lX + 22, lY + 28, 16, 16);

      // Ghế đơn phải
      ctx.fillStyle = '#f5ede1';
      ctx.beginPath();
      ctx.roundRect(lX + 260, lY - 6, 54, 52, 6);
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(lX + 268, lY, 16, 16);

      // Bàn trà tròn đá cẩm thạch Calacatta viền chỉ đồng (Round Marble Coffee Table)
      const tableX = lX + 165;
      const tableY = lY + 18;
      // Chân kim loại mạ vàng
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(tableX, tableY, 34, 0, Math.PI * 2);
      ctx.stroke();
      // Mặt đá hoa cương trắng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tableX, tableY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Bình hoa cẩm tú cầu hồng rực rỡ giữa bàn trà (Pink Hydrangeas)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(tableX, tableY, 11, 0, Math.PI * 2);
      ctx.arc(tableX - 5, tableY - 4, 7, 0, Math.PI * 2);
      ctx.arc(tableX + 5, tableY - 4, 7, 0, Math.PI * 2);
      ctx.fill();
      // Cuốn tạp chí kinh doanh Forbes / Bloomberg trên bàn trà
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tableX - 22, tableY + 6, 16, 11);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tableX - 20, tableY + 8, 12, 3);

      // Bàn trà phụ tròn có đèn cây ấm áp bên cạnh sofa
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(lX + 58, lY + 95, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lX + 58, lY + 84, 10, 0, Math.PI * 2);
      ctx.fill();

      // 4. QUẦY TỦ BAR ESPRESSO & CREDENZA (Ảnh 4: Espresso Sideboard Bar)
      const barX = 635;
      const barY = 200;
      const barW = 110;
      const barH = 85;
      // Thân tủ gỗ óc chó với cửa có tay nắm vàng
      ctx.fillStyle = '#2c150b';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();
      ctx.strokeStyle = '#180a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mặt đá cẩm thạch trắng phía trên
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(barX - 2, barY - 4, barW + 4, 10);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 2, barY - 4, barW + 4, 10);

      // Cánh tủ dưới chia làm 2 ô
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX + 4, barY + 12, barW / 2 - 6, barH - 18);
      ctx.strokeRect(barX + barW / 2 + 2, barY + 12, barW / 2 - 6, barH - 18);
      // Tay nắm mạ vàng
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(barX + barW / 2 - 4, barY + 36, 2, 10);
      ctx.fillRect(barX + barW / 2 + 3, barY + 36, 2, 10);

      // Máy pha cà phê Espresso chuyên nghiệp màu đen bóng & kim loại
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX + 15, barY - 26, 28, 22);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(barX + 18, barY - 22, 14, 8); // Áp kế đồng hồ
      // Hơi nước cà phê nghi ngút
      const steamWave = Math.sin(tick * 5) * 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(barX + 28, barY - 28);
      ctx.quadraticCurveTo(barX + 32 + steamWave, barY - 38, barX + 27, barY - 46);
      ctx.stroke();

      // Khay decanter thủy tinh & tách trà sứ cao cấp
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(barX + 54, barY - 18, 12, 14);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(barX + 74, barY - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bình hoa baby trắng thanh lịch cạnh quầy
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(barX + 94, barY - 14, 8, 0, Math.PI * 2);
      ctx.fill();

      // Bức tranh nghệ thuật trừu tượng hiện đại phía trên quầy bar
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(barX + 15, barY - 75, 80, 42);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(barX + 18, barY - 72, 74, 36);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(barX + 45, barY - 54, 12, 0, Math.PI * 2);
      ctx.fill();

      // 5. CÂY XANH NỘI THẤT PENTHOUSE (Cây bàng Singapore chậu sứ chân vàng)
      const plantX = 18;
      const plantY = 220;
      // Chân đế kim loại mạ vàng
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plantX - 8, plantY + 16);
      ctx.lineTo(plantX, plantY);
      ctx.lineTo(plantX + 8, plantY + 16);
      ctx.stroke();
      // Chậu sứ trắng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(plantX - 12, plantY - 16, 24, 20, [2, 2, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Tán lá Bàng Singapore to bản xanh mướt
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(plantX, plantY - 26, 16, 0, Math.PI * 2);
      ctx.arc(plantX - 10, plantY - 22, 11, 0, Math.PI * 2);
      ctx.arc(plantX + 10, plantY - 22, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(plantX - 2, plantY - 30, 10, 0, Math.PI * 2);
      ctx.fill();

      // 6. CỬA KÍNH THÔNG RA VĂN PHÒNG CHÍNH (Exit Door to Office)
      const doorX = 330;
      const doorY = 490;
      const doorW = 100;
      const doorH = 30;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(doorX, doorY, doorW, doorH);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(doorX + 4, doorY + 4, doorW - 8, doorH - 8);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(doorX + 4, doorY + 4, doorW - 8, doorH - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🚪 LỐI RA KHU LÀM VIỆC CHÍNH', doorX + 10, doorY + 19);

    } else if (scene.id === 'VILLA') {
      // 1. ĐÀN ĐẠI DƯƠNG CẦM (GRAND PIANO - Góc Trái)
      const pianoX = 80;
      const pianoY = 70;
      // Bóng đổ
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(pianoX + 70, pianoY + 115, 65, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thân đàn sơn mài đen bóng sang trọng
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(pianoX, pianoY, 135, 105, [25, 60, 8, 8]);
      ctx.fill();
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nắp đàn mở hé để lộ dây đàn mạ vàng
      ctx.fillStyle = '#b45309';
      ctx.fillRect(pianoX + 18, pianoY + 18, 90, 60);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.8;
      for (let s = 0; s < 10; s++) {
        ctx.beginPath();
        ctx.moveTo(pianoX + 22 + s * 8, pianoY + 20);
        ctx.lineTo(pianoX + 35 + s * 7, pianoY + 75);
        ctx.stroke();
      }

      // Phím đàn trắng đen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pianoX + 15, pianoY + 82, 105, 18);
      ctx.fillStyle = '#0f172a';
      for (let k = 0; k < 12; k++) {
        ctx.fillRect(pianoX + 20 + k * 8, pianoY + 82, 5, 11);
      }
      // Ghế ngồi chơi piano đệm da nhung đỏ
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.roundRect(pianoX + 45, pianoY + 105, 45, 18, 3);
      ctx.fill();

      // 2. BÀN TRÀ CẨM THẠCH & TÂM ĐIỂM VALI 500 TRIỆU ĐỒNG
      const tableX = 300;
      const tableY = 150;
      // Bóng bàn
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.roundRect(tableX - 5, tableY + 5, 210, 100, 10);
      ctx.fill();

      // Bàn đá cẩm thạch trắng viền vàng kim
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(tableX, tableY, 200, 95, 8);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vầng hào quang ánh sáng chiếu rọi vào Vali 500 triệu (Spotlight Beam)
      const spotGrad = ctx.createRadialGradient(tableX + 100, tableY + 45, 5, tableX + 100, tableY + 45, 75);
      spotGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      spotGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.15)');
      spotGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(tableX + 100, tableY + 45, 75, 0, Math.PI * 2);
      ctx.fill();

      // Chiếc Vali Da Thượng Hạng Mở Hé Nắp Đựng 500 Triệu Đồng (Ảnh cốt truyện chính)
      const caseX = tableX + 55;
      const caseY = tableY + 22;
      // Thân vali da cá sấu nâu sẫm
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(caseX, caseY, 90, 52, 4);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Khóa số kim loại mạ vàng
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(caseX + 18, caseY + 22, 10, 8);
      ctx.fillRect(caseX + 62, caseY + 22, 10, 8);
      // Tay cầm vali
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(caseX + 45, caseY + 52, 10, 0, Math.PI);
      ctx.stroke();

      // Các cọc tiền polymer 500.000 VNĐ xanh ngọc bích xếp tầng bên trong
      const cashPulse = 0.8 + Math.sin(tick * 5) * 0.2;
      ctx.fillStyle = `rgba(16, 185, 129, ${cashPulse})`;
      for (let b = 0; b < 3; b++) {
        ctx.fillRect(caseX + 14 + b * 22, caseY + 6, 20, 14);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(caseX + 14 + b * 22, caseY + 6, 20, 14);
        // Dải ruy băng ngân hàng niêm phong đỏ
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(caseX + 22 + b * 22, caseY + 6, 4, 14);
        ctx.fillStyle = `rgba(16, 185, 129, ${cashPulse})`;
      }

      // Nhãn số tiền phát sáng
      ctx.fillStyle = '#065f46';
      ctx.fillRect(caseX + 6, caseY + 36, 78, 12);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('500.000.000 VNĐ', caseX + 45, caseY + 45);
      ctx.textAlign = 'left';

      // Bộ ấm trà gốm sứ mạ vàng Hoàng gia bên cạnh
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tableX + 25, tableY + 35, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Khói trà bốc lên ấm áp
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(tableX + 25, tableY + 22);
      ctx.lineTo(tableX + 28, tableY + 12);
      ctx.stroke();

      // Ghế bành chủ tịch ông Hoàng Thế Vinh (Da bò tót màu rượu vang đỏ)
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.roundRect(tableX + 40, tableY - 65, 120, 55, [12, 12, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = '#4c0519';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Nút múi da quả trám
      ctx.fillStyle = '#fbbf24';
      for (let btn = 0; btn < 4; btn++) {
        ctx.beginPath();
        ctx.arc(tableX + 55 + btn * 28, tableY - 35, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. TỦ RƯỢU VANG PHÁP & CỔ VẬT HOÀNG GIA (Góc Phải)
      const wineX = 580;
      const wineY = 60;
      ctx.fillStyle = '#271005';
      ctx.beginPath();
      ctx.roundRect(wineX, wineY, 150, 110, 4);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Đèn LED chiếu ấm các ngăn rượu
      for (let tier = 0; tier < 3; tier++) {
        const tY = wineY + 10 + tier * 32;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(wineX + 6, tY, 138, 26);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(wineX + 6, tY + 26, 138, 3);
        // Hàng chai rượu vang thủy tinh sang trọng
        const wineColors = ['#7f1d1d', '#1e3a8a', '#14532d', '#581c87', '#991b1b'];
        for (let bot = 0; bot < 7; bot++) {
          ctx.fillStyle = wineColors[(tier * 3 + bot) % wineColors.length];
          ctx.fillRect(wineX + 14 + bot * 18, tY + 6, 7, 19);
          // Cổ chai
          ctx.fillRect(wineX + 16 + bot * 18, tY + 2, 3, 5);
        }
      }

    } else if (scene.id === 'CAFE') {
      // 1. QUẦY BAR PHA CHẾ & THIẾT BỊ CAFE CHUYÊN NGHIỆP
      const barX = 60;
      const barY = 60;
      const barW = 220;
      const barH = 90;
      // Bóng đổ
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(barX, barY + barH, barW, 8);

      // Thân quầy gỗ sồi sậm nẹp chỉ đen
      ctx.fillStyle = '#3b1c09';
      ctx.fillRect(barX, barY, barW, barH);
      // Mặt đá cẩm thạch trắng Calacatta phía trên
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(barX - 4, barY - 4, barW + 8, 14);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 4, barY - 4, barW + 8, 14);

      // Máy pha cà phê Espresso công nghiệp La Marzocco màu đỏ tươi
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(barX + 25, barY - 32, 48, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Áp kế & Cần gạt kim loại
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(barX + 30, barY - 26, 8, 8);
      ctx.fillRect(barX + 50, barY - 26, 16, 5);
      // Hơi nước bốc lên từ vòi đánh sữa
      const steamAnim = Math.sin(tick * 6) * 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(barX + 62, barY - 34);
      ctx.quadraticCurveTo(barX + 66 + steamAnim, barY - 44, barX + 60, barY - 52);
      ctx.stroke();

      // Máy xay hạt cà phê cà-phê phễu tròn trong suốt
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX + 85, barY - 22, 16, 18);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.8)';
      ctx.beginPath();
      ctx.arc(barX + 93, barY - 26, 8, 0, Math.PI * 2);
      ctx.fill();

      // Tủ kính trưng bày bánh ngọt Pháp (Pastry Glass Case)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.roundRect(barX + 115, barY - 28, 75, 24, 3);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Bánh sừng bò croissant vàng óng & matcha cake bên trong
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(barX + 132, barY - 14, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(barX + 152, barY - 14, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(barX + 168, barY - 18, 12, 10);

      // Bảng Menu phấn đen treo tường phía sau
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX + 15, barY - 58, 190, 24);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX + 15, barY - 58, 190, 24);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('☕ ESPRESSO 35k | COLD BREW 45k | CROISSANT 30k', barX + 22, barY - 42);

      // 2. BÀN HẸN HÒ CỦA LAN ANH (Bàn Gặp Gỡ Cảm Xúc)
      const dateX = 440;
      const dateY = 100;
      // Thảm nỉ tròn dưới bàn hẹn hò
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(dateX + 70, dateY + 40, 75, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Bàn tròn mặt đá hoa cương hồng phấn viền đồng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(dateX + 70, dateY + 35, 42, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hai tách cà phê Cappuccino có vẽ hình trái tim (Latte Art)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(dateX + 56, dateY + 32, 6, 0, Math.PI * 2);
      ctx.arc(dateX + 84, dateY + 32, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(dateX + 56, dateY + 32, 4.5, 0, Math.PI * 2);
      ctx.arc(dateX + 84, dateY + 32, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Trái tim latte art
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px sans-serif';
      ctx.fillText('❤', dateX + 53, dateY + 35);
      ctx.fillText('❤', dateX + 81, dateY + 35);

      // Lọ hoa tulip hồng ngọt ngào giữa bàn
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(dateX + 70, dateY + 25, 5, 0, Math.PI * 2);
      ctx.fill();

      // 2 Ghế tựa bọc nệm Scandinavian dễ thương hai bên
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.roundRect(dateX + 15, dateY + 22, 22, 28, 4);
      ctx.roundRect(dateX + 102, dateY + 22, 22, 28, 4);
      ctx.fill();

      // 3. BÀN THẢO LUẬN NHÓM & GIAO LƯU LẬP TRÌNH VIÊN
      const techX = 180;
      const techY = 260;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(techX, techY, 180, 85, 6);
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Laptop đang mở màn hình phát sáng & Cốc cà phê mang đi
      ctx.fillStyle = '#334155';
      ctx.fillRect(techX + 25, techY + 20, 36, 22);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(techX + 27, techY + 22, 32, 18);

      ctx.fillStyle = '#334155';
      ctx.fillRect(techX + 115, techY + 20, 36, 22);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(techX + 117, techY + 22, 32, 18);

      // Cốc giấy take-away
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(techX + 75, techY + 26, 8, 12);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(techX + 75, techY + 30, 8, 4);

      // 4. BÀN LÀM VIỆC TỰ DO (FREELANCE POD - Bên Phải)
      const freeX = 460;
      const freeY = 260;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(freeX, freeY, 160, 85, 6);
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Màn hình hiển thị mã nguồn code
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(freeX + 45, freeY + 16, 42, 26);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(freeX + 47, freeY + 18, 38, 22);

      // 5. CÂY CẢNH NỘI THẤT (Monstera trầu bà lá xẻ trong chậu sứ)
      [ { x: 30, y: 440 }, { x: 630, y: 70 }, { x: 630, y: 440 } ].forEach((pos) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(pos.x - 12, pos.y - 12, 24, 22, 4);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 20, 15, 0, Math.PI * 2);
        ctx.arc(pos.x - 8, pos.y - 15, 11, 0, Math.PI * 2);
        ctx.arc(pos.x + 8, pos.y - 15, 11, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (scene.id === 'BANK') {
      // 1. DÃY QUẦY GIAO DỊCH KÍNH CHỐNG ĐẠN (TELLER COUNTER)
      const bankCounterX = 80;
      const bankCounterY = 80;
      const bankCounterW = 480;
      const bankCounterH = 80;

      // Bóng đổ quầy giao dịch
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(bankCounterX, bankCounterY + bankCounterH, bankCounterW, 8);

      // Thân quầy ốp đá cẩm thạch xám vân mây sang trọng
      ctx.fillStyle = '#334155';
      ctx.fillRect(bankCounterX, bankCounterY, bankCounterW, bankCounterH);
      // Nẹp viền màu xanh thương hiệu V-Bank
      ctx.fillStyle = '#10b981';
      ctx.fillRect(bankCounterX, bankCounterY + bankCounterH - 6, bankCounterW, 6);

      // 3 Ô Cửa Giao Dịch Có Vách Kính Trong Suốt & Loa Đàm Thoại
      for (let st = 0; st < 3; st++) {
        const stX = bankCounterX + 35 + st * 150;
        // Khung kính bảo vệ
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(stX, bankCounterY - 38, 100, 38);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(stX, bankCounterY - 38, 100, 38);

        // Ô khoét chuyển tài liệu & tiền mặt
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(stX + 32, bankCounterY - 8, 36, 8);

        // Biển hiệu tên quầy
        ctx.fillStyle = '#065f46';
        ctx.fillRect(stX + 15, bankCounterY - 34, 70, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`QUẦY ${st + 1}: ${st === 0 ? 'VAY VỐN' : st === 1 ? 'SAO KÊ' : 'TÍN DỤNG'}`, stX + 50, bankCounterY - 24);
        ctx.textAlign = 'left';

        // Màn hình máy tính chuyên viên ngân hàng
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(stX + 35, bankCounterY + 15, 30, 20);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(stX + 37, bankCounterY + 17, 26, 16);
      }

      // 2. BẢNG ĐIỆN TỬ TỶ GIÁ & LÃI SUẤT TIẾT KIỆM LED (Ảnh tài chính)
      const ledX = 140;
      const ledY = 16;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ledX, ledY, 360, 26);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ledX, ledY, 360, 26);

      // Chữ LED đỏ/xanh chạy
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('🏦 V-BANK: LÃI SUẤT TIẾT KIỆM 7.2%/NĂM | VAY STARTUP 8.5% | USD/VND: 25.420', ledX + 10, ledY + 16);

      // 3. KHU VỰC GHẾ CHỜ BỌC NỆM NAVY & BÀN TRÀ TIẾP KHÁCH DOANH NGHIỆP
      const waitX = 120;
      const waitY = 240;
      // Dãy ghế chờ 4 chỗ
      ctx.fillStyle = '#1e3a8a';
      for (let s = 0; s < 4; s++) {
        ctx.beginPath();
        ctx.roundRect(waitX + s * 45, waitY, 38, 42, 4);
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cây nước nóng lạnh miễn phí cho khách hàng
      const waterX = 540;
      const waterY = 230;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(waterX, waterY, 26, 55);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(waterX, waterY, 26, 55);
      // Bình nước xanh úp ngược
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(waterX + 13, waterY - 8, 12, 0, Math.PI * 2);
      ctx.fill();

    } else if (scene.id === 'COURT') {
      // 1. BỤC THẨM PHÁN & HỘI ĐỒNG XÉT XỬ
      ctx.fillStyle = '#5c2c16';
      ctx.beginPath();
      ctx.roundRect(260, 60, 240, 90, 6);
      ctx.fill();
      ctx.strokeStyle = '#271005';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Quốc huy vàng & Búa gỗ công lý
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(380, 80, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CÔNG LÝ', 380, 105);
      ctx.textAlign = 'left';

      // 2. VÀNH MÓNG NGỰA (BỊ CÁO)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(320, 240, 120, 50);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(320, 240, 120, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('VÀNH MÓNG NGỰA', 332, 270);

      // 3. BÀN VIỆN KIỂM SÁT & LUẬT SƯ BÀO CHỮA
      ctx.fillStyle = '#78350f';
      ctx.fillRect(100, 180, 140, 70);
      ctx.fillRect(520, 180, 140, 70);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('VIỆN KIỂM SÁT', 125, 220);
      ctx.fillText('LUẬT SƯ BÀO CHỮA', 535, 220);
    }
  }

  // VẼ NHÂN VẬT 2D CHIBI THEO TỶ LỆ 1:2.2 (Chuẩn 8 bản thiết kế Design Sheets)
  public renderChibiCharacter(entity: RenderableEntity, tick: number) {
    const ctx = this.ctx;
    const { x, y, direction, animationState, roleType, gender, jobRole } = entity;

    // Xác định vai trò công việc chi tiết chuẩn theo 8 Design Sheets
    const effectiveJob: JobRoleType = jobRole || (
      roleType === 'PLAYER' ? 'CEO' :
      roleType === 'LAN_ANH' ? 'LAN_ANH' :
      roleType === 'FATHER' ? 'FATHER' :
      gender === 'FEMALE' ? 'DESIGNER' : 'IT'
    );

    ctx.save();
    ctx.translate(x, y);

    // Tính toán frame bước đi (Walk cycle)
    const isMoving = animationState === 'WALK';
    const isWorking = animationState === 'WORK';
    const isProtesting = animationState === 'PROTEST';
    const isCelebrating = animationState === 'CELEBRATE';
    const isIdle = animationState === 'IDLE';

    // Chuyển động bước chân & hô hấp
    const walkOffset = isMoving ? Math.sin(tick * 10) * 4 : 0;
    const legSwing = isMoving ? Math.sin(tick * 10) * 8 : 0;
    const workTyping = isWorking ? Math.sin(tick * 20) * 2 : 0;
    const jumpCelebrate = isCelebrating ? -Math.abs(Math.sin(tick * 10) * 8) : 0;
    const breathOffset = isIdle ? Math.sin(tick * 2) * 1 : 0;
    const isBlinking = Math.floor(tick * 0.3) % 10 === 0;

    // Ưu tiên hiển thị Sprite PNG chuẩn từ Design Sheet nếu đã tải
    let roleKey = 'office';
    if (effectiveJob === 'CEO') roleKey = 'ceo';
    else if (effectiveJob === 'IT') roleKey = 'developer';
    else if (effectiveJob === 'DESIGNER') roleKey = 'designer';
    else if (effectiveJob === 'LEAD') roleKey = 'hr';
    else if (effectiveJob === 'LAN_ANH') roleKey = 'assistant';
    else if (effectiveJob === 'ADMIN') roleKey = 'office';
    else if (effectiveJob === 'SALES') roleKey = 'office';
    else if (effectiveJob === 'SECURITY') roleKey = 'office';

    let viewKey = 'front';
    if (direction === 'UP') viewKey = 'back';
    else if (direction === 'LEFT' || direction === 'RIGHT') viewKey = 'side';

    const spriteKey = `${roleKey}_${viewKey}`;
    const spriteImg = this.spriteImages.get(spriteKey);

    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
      // 1. Bóng đổ
      const shadowScaleX = 14 + Math.abs(walkOffset) * 0.3;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 16, shadowScaleX, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, jumpCelebrate);

      if (isWorking) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 28, [6, 6, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.save();
      if (direction === 'LEFT') {
        ctx.scale(-1, 1);
      }
      const bob = isMoving ? Math.sin(tick * 10) * 2.5 : breathOffset;
      const tilt = isMoving ? Math.sin(tick * 10) * 0.04 : 0;
      ctx.rotate(tilt);
      ctx.drawImage(spriteImg, -18, -48 + bob, 36, 54);
      ctx.restore();

      // Bảng tên
      const headY = -48 + breathOffset;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.font = 'bold 9px sans-serif';
      const textWidth = ctx.measureText(entity.name).width;
      ctx.fillRect(-textWidth / 2 - 4, headY - 14, textWidth + 8, 12);
      ctx.fillStyle = effectiveJob === 'CEO' ? '#38bdf8' : effectiveJob === 'LAN_ANH' ? '#f472b6' : '#f8fafc';
      ctx.fillText(entity.name, -textWidth / 2, headY - 5);

      // Status Thought Bubble
      const floatBob = Math.sin(tick * 8) * 3;
      const bubbleIcon = entity.statusIcon || (
        effectiveJob === 'CEO' ? '👑' :
        effectiveJob === 'IT' ? '</>' :
        effectiveJob === 'DESIGNER' ? '🎨' :
        effectiveJob === 'SALES' ? '📈' :
        effectiveJob === 'LEAD' ? '👥' :
        effectiveJob === 'ADMIN' ? '📋' :
        effectiveJob === 'SECURITY' ? '🛡️' :
        effectiveJob === 'LAN_ANH' ? '💖' : null
      );

      if (bubbleIcon) {
        ctx.save();
        const bX = 14;
        const bY = headY - 18 + floatBob;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bX, bY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(bX - 6, bY + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        if (bubbleIcon === '</>') {
          ctx.font = 'bold 7px monospace';
          ctx.fillStyle = '#0284c7';
          ctx.fillText('</>', bX - 6, bY + 2.5);
        } else {
          ctx.font = '10px sans-serif';
          ctx.fillText(bubbleIcon, bX - 5, bY + 3.5);
        }
        ctx.restore();
      }

      if (entity.speechBubble) {
        ctx.save();
        ctx.font = 'bold 9px sans-serif';
        const bubbleTextWidth = ctx.measureText(entity.speechBubble).width;
        const bW = bubbleTextWidth + 14;
        const bH = 18;
        const bX = -bW / 2;
        const bY = headY - 32;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-4, bY + bH);
        ctx.lineTo(0, bY + bH + 4);
        ctx.lineTo(4, bY + bH);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(entity.speechBubble, bX + 7, bY + 12);
        ctx.restore();
      }

      ctx.restore();
      return;
    }

    // Mirror/flip khi direction = 'LEFT'
    if (direction === 'LEFT') {
      ctx.scale(-1, 1);
    }

    // 1. Bóng đổ nhân vật (Drop shadow dưới chân)
    const shadowScaleX = 14 + Math.abs(walkOffset) * 0.3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16, shadowScaleX, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, jumpCelebrate);

    // Khi nhân viên đang ngồi làm việc tại bàn: vẽ tựa lưng ghế công thái học phía sau
    if (isWorking) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 28, [6, 6, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 2. Chân & Giày theo bảng màu chuẩn từng nhân vật (Ảnh 1 - 8)
    let shoeColor = '#0f172a';
    if (effectiveJob === 'CEO') {
      shoeColor = '#7a5b47'; // Giày da nâu cao cấp (#7A5B47 - Sheet CEO)
    } else if (effectiveJob === 'IT') {
      shoeColor = '#3d8bff'; // Giày thể thao sneaker xanh trắng (#3D8BFF - Sheet IT)
    } else if (effectiveJob === 'DESIGNER') {
      shoeColor = '#6b6ee0'; // Giày sneaker tím pastel phong cách (#6B6EE0 - Sheet Designer)
    } else if (effectiveJob === 'SALES') {
      shoeColor = '#5b4639'; // Giày da nâu lịch lãm (#5B4639 - Sheet Sales)
    } else if (effectiveJob === 'LEAD') {
      shoeColor = '#1f2a44'; // Giày da màu tối (#1F2A44 - Sheet Lead)
    } else if (effectiveJob === 'ADMIN') {
      shoeColor = '#f1f5f9'; // Sneaker trắng tinh gọn gàng năng động (#F8F8FA - Sheet Admin)
    } else if (effectiveJob === 'SECURITY') {
      shoeColor = '#1e293b'; // Giày bốt chiến thuật đen bền chắc (#1F2937 - Sheet Security)
    } else if (effectiveJob === 'LAN_ANH' || gender === 'FEMALE') {
      shoeColor = '#09090b'; // Giày cao gót đen thanh lịch
    }

    ctx.fillStyle = shoeColor;
    if (direction === 'LEFT' || direction === 'RIGHT') {
      ctx.fillRect(-6 + legSwing, 10, 5, 8);
      ctx.fillRect(2 - legSwing, 10, 5, 8);
      if (effectiveJob === 'LAN_ANH') {
        ctx.fillRect(-6 + legSwing, 15, 2, 4);
        ctx.fillRect(2 - legSwing, 15, 2, 4);
      }
    } else {
      ctx.fillRect(-7, 10 + legSwing * 0.5, 6, 8);
      ctx.fillRect(2, 10 - legSwing * 0.5, 6, 8);
      if (effectiveJob === 'LAN_ANH') {
        ctx.fillRect(-7, 15, 2, 4);
        ctx.fillRect(6, 15, 2, 4);
      }
    }

    // 3. Quần / Váy Công Sở theo chuẩn thiết kế
    if (effectiveJob === 'LAN_ANH' || (gender === 'FEMALE' && effectiveJob !== 'IT')) {
      // Chân váy bút chì đen cạp cao có xẻ tà quyến rũ (Sheet Lan Anh)
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-8, 2 + walkOffset * 0.5, 16, 10, [1, 1, 2, 2]);
      ctx.fill();
      if (direction === 'RIGHT' || direction === 'DOWN') {
        ctx.fillStyle = '#ffdcc4';
        ctx.fillRect(2, 7 + walkOffset * 0.5, 2, 5);
      } else if (direction === 'LEFT') {
        ctx.fillStyle = '#ffdcc4';
        ctx.fillRect(-4, 7 + walkOffset * 0.5, 2, 5);
      }
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-8, 1 + walkOffset * 0.5, 16, 2.5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-2, 1 + walkOffset * 0.5, 4, 2.5);
    } else {
      let pantsColor = '#1e293b';
      if (effectiveJob === 'CEO') pantsColor = '#2e3a59'; // Xanh navy sẫm (#2E3A59)
      else if (effectiveJob === 'IT') pantsColor = '#2d2f36'; // Quần jogger đen xám (#2D2F36)
      else if (effectiveJob === 'DESIGNER') pantsColor = '#2d2f3a';
      else if (effectiveJob === 'SALES') pantsColor = '#2e3a59';
      else if (effectiveJob === 'LEAD') pantsColor = '#d8c3b1'; // Quần kaki be (#D8C3B1)
      else if (effectiveJob === 'ADMIN') pantsColor = '#3b3f4b'; // Quần âu xám than (#3B3F4B)
      else if (effectiveJob === 'SECURITY') pantsColor = '#1f2d4d'; // Quần bảo vệ xanh đậm (#1F2D4D)

      ctx.fillStyle = pantsColor;
      ctx.fillRect(-8, 4 + walkOffset * 0.5, 16, 8);

      // Thắt lưng da
      const beltColor = (effectiveJob === 'CEO' || effectiveJob === 'SALES') ? '#7a5b47' : '#0f172a';
      ctx.fillStyle = beltColor;
      ctx.fillRect(-8, 3 + walkOffset * 0.5, 16, 2.5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-2, 3 + walkOffset * 0.5, 4, 2.5);
    }

    // 4. Áo & Thân Trên theo đặc trưng nghề nghiệp
    if (effectiveJob === 'CEO') {
      // Suit Xanh Navy (#2E3A59), áo sơ mi trắng tinh bên trong (#F5F7FB), khăn cài túi ngực trắng
      ctx.fillStyle = '#2e3a59';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      // Ve áo vest & Cổ sơ mi trắng chữ V
      ctx.fillStyle = '#f5f7fb';
      ctx.beginPath();
      ctx.moveTo(-3, -6 + walkOffset * 0.5);
      ctx.lineTo(0, 0 + walkOffset * 0.5);
      ctx.lineTo(3, -6 + walkOffset * 0.5);
      ctx.fill();

      // Khăn lụa vuông cài túi ngực trái vest
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -2 + walkOffset * 0.5, 4, 1.8);

    } else if (effectiveJob === 'IT') {
      // Áo Hoodie xám than (#2D2F36) có mũ và dây kéo, bên trong áo thun logo </>
      ctx.fillStyle = '#2d2f36';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [4, 4, 1, 1]);
      ctx.fill();

      // Áo thun lót bên trong in logo </>
      ctx.fillStyle = '#1e1f24';
      ctx.fillRect(-4, -5 + walkOffset * 0.5, 8, 8);
      ctx.fillStyle = '#e7e9f3';
      ctx.font = 'bold 6px monospace';
      ctx.fillText('</>', -4, 0 + walkOffset * 0.5);

      // Dây rút mũ hoodie trắng hai bên
      ctx.strokeStyle = '#f8f8fa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -3 + walkOffset * 0.5);
      ctx.lineTo(-5, 2 + walkOffset * 0.5);
      ctx.moveTo(5, -3 + walkOffset * 0.5);
      ctx.lineTo(5, 2 + walkOffset * 0.5);
      ctx.stroke();

      // Tai nghe Gaming / Over-ear màu xanh neon quàng quanh cổ (#3D8BFF)
      ctx.strokeStyle = '#3d8bff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -6 + walkOffset * 0.5, 7, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#3d8bff';
      ctx.fillRect(-8, -8 + walkOffset * 0.5, 3, 4);
      ctx.fillRect(5, -8 + walkOffset * 0.5, 3, 4);

    } else if (effectiveJob === 'DESIGNER') {
      // Áo Hoodie trắng/kem (#F4F1EC) với vệt màu sơn nghệ thuật tím (#6B6EE0)
      ctx.fillStyle = '#f4f1ec';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [4, 4, 1, 1]);
      ctx.fill();

      // Vết màu sơn tím nghệ thuật sáng tạo
      ctx.fillStyle = '#6b6ee0';
      ctx.beginPath();
      ctx.arc(3, -2 + walkOffset * 0.5, 3, 0, Math.PI * 2);
      ctx.arc(-4, 1 + walkOffset * 0.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Tai nghe tím pastel quanh cổ
      ctx.strokeStyle = '#6b6ee0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -6 + walkOffset * 0.5, 7, 0, Math.PI);
      ctx.stroke();

    } else if (effectiveJob === 'SALES') {
      // Áo sơ mi trắng (#F5F7FB), cà vạt xanh navy (#4F6AA3), thẻ đeo cổ xanh (#66B2FF)
      ctx.fillStyle = '#f5f7fb';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      // Cà vạt xanh navy lịch sự
      ctx.fillStyle = '#4f6aa3';
      ctx.beginPath();
      ctx.moveTo(-1.8, -5 + walkOffset * 0.5);
      ctx.lineTo(1.8, -5 + walkOffset * 0.5);
      ctx.lineTo(1.2, 3 + walkOffset * 0.5);
      ctx.lineTo(0, 5 + walkOffset * 0.5);
      ctx.lineTo(-1.2, 3 + walkOffset * 0.5);
      ctx.fill();

      // Dây đeo thẻ nhân viên
      ctx.strokeStyle = '#66b2ff';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4, -6 + walkOffset * 0.5);
      ctx.lineTo(0, -1 + walkOffset * 0.5);
      ctx.lineTo(4, -6 + walkOffset * 0.5);
      ctx.stroke();

    } else if (effectiveJob === 'LEAD') {
      // Áo blazer nâu ấm (#3B2F2F, #6B4F3E) bên ngoài, sơ mi trắng bên trong
      ctx.fillStyle = '#3b2f2f';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      ctx.fillStyle = '#f5f7fb';
      ctx.beginPath();
      ctx.moveTo(-3, -6 + walkOffset * 0.5);
      ctx.lineTo(0, 0 + walkOffset * 0.5);
      ctx.lineTo(3, -6 + walkOffset * 0.5);
      ctx.fill();

    } else if (effectiveJob === 'ADMIN') {
      // Áo sơ mi trắng ngắn tay gọn gàng (#F7F8FC), dây thẻ xanh (#4E7CC7)
      ctx.fillStyle = '#f7f8fc';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      ctx.strokeStyle = '#4e7cc7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, -6 + walkOffset * 0.5);
      ctx.lineTo(0, -1 + walkOffset * 0.5);
      ctx.lineTo(4, -6 + walkOffset * 0.5);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2.5, -1 + walkOffset * 0.5, 5, 6);

    } else if (effectiveJob === 'SECURITY') {
      // Áo đồng phục xanh dương nhạt (#7FA6E6), cầu vai quân hàm xanh đậm (#1F2D4D)
      ctx.fillStyle = '#7fa6e6';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      // Cầu vai quân hàm
      ctx.fillStyle = '#1f2d4d';
      ctx.fillRect(-9, -6 + walkOffset * 0.5, 4, 3);
      ctx.fillRect(5, -6 + walkOffset * 0.5, 4, 3);
      // Nút vàng
      ctx.fillStyle = '#f5c542';
      ctx.fillRect(-7.5, -5 + walkOffset * 0.5, 1.5, 1.5);
      ctx.fillRect(6, -5 + walkOffset * 0.5, 1.5, 1.5);

    } else if (effectiveJob === 'LAN_ANH') {
      // Áo voan lụa kem sang trọng (#FFFBEB) cổ V, dây thẻ ID xanh
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4, -6 + walkOffset * 0.5);
      ctx.lineTo(0, -1 + walkOffset * 0.5);
      ctx.lineTo(4, -6 + walkOffset * 0.5);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -1 + walkOffset * 0.5, 4, 5);

    } else {
      // Citizen hoặc mặc định
      ctx.fillStyle = entity.outfitColor || '#475569';
      ctx.beginPath();
      ctx.roundRect(-9, -6 + walkOffset * 0.5, 18, 11, [3, 3, 1, 1]);
      ctx.fill();
    }

    // 5. Tay Chibi & Phụ Kiện Đặc Trưng Cầm Tay
    ctx.fillStyle = '#ffdcc4'; // Màu da tay
    if (isWorking) {
      ctx.fillRect(-11, -1 + workTyping, 4, 6);
      ctx.fillRect(7, -1 - workTyping, 4, 6);
    } else if (isProtesting) {
      ctx.fillRect(6, -18, 4, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -28, 24, 14);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(-4, -28, 24, 14);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('ĐÌNH CÔNG', -2, -18);
    } else {
      ctx.fillRect(-12, -2 - legSwing * 0.4, 4, 7);
      ctx.fillRect(8, -2 + legSwing * 0.4, 4, 7);

      // Đồng hồ đeo tay
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-12.5, 2 - legSwing * 0.4, 4.5, 1.5);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-11.5, 2 - legSwing * 0.4, 2.5, 1.5);

      // Phụ kiện cầm theo vai trò (Ảnh tham khảo 1 - 8)
      if (effectiveJob === 'CEO') {
        // Laptop mỏng vỏ nhôm nguyên khối kẹp nách
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(7, -4 + legSwing * 0.2, 5, 12);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(8.5, 0 + legSwing * 0.2, 2, 2);
      } else if (effectiveJob === 'SALES') {
        // Cặp da công tác màu nâu đậm (#5B4639 - Sheet Sales)
        ctx.fillStyle = '#5b4639';
        ctx.fillRect(7, -2 + legSwing * 0.2, 6, 11);
        ctx.fillStyle = '#fbbf24'; // Khóa đồng mạ vàng
        ctx.fillRect(8, 2 + legSwing * 0.2, 4, 2);
      } else if (effectiveJob === 'ADMIN') {
        // Bìa kẹp hồ sơ clipboard trắng & kẹp tài liệu (#F7F8FC - Sheet Admin)
        ctx.fillStyle = '#7a5b47';
        ctx.fillRect(7, -3 + legSwing * 0.2, 5.5, 11);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7.5, -2 + legSwing * 0.2, 4.5, 9);
      } else if (effectiveJob === 'DESIGNER') {
        // Bút vẽ Stylus cảm ứng màu vàng nghệ thuật
        ctx.fillStyle = '#ffb74d';
        ctx.fillRect(9, -4 + legSwing * 0.2, 2, 9);
      } else if (effectiveJob === 'SECURITY') {
        // Bộ đàm bảo vệ trên vai
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-11, -8 + walkOffset * 0.5, 3, 5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-10, -7 + walkOffset * 0.5, 1, 1);
      } else if (effectiveJob === 'LAN_ANH') {
        // Tablet mỏng kẹp nách
        ctx.fillStyle = '#334155';
        ctx.fillRect(7, -3 + legSwing * 0.2, 4.5, 11);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(8, -1 + legSwing * 0.2, 2.5, 7);
      }
    }

    // 6. Đầu Chibi Tỷ Lệ Lớn (Khuôn mặt tròn anime Chibi)
    const headY = -18 + walkOffset + breathOffset;
    ctx.fillStyle = '#ffdcc4'; // Màu da mặt tươi tắn (#FFDCC4)
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Má hồng Chibi dễ thương (Blush)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(-8, headY + 4, 3, 0, Math.PI * 2);
    ctx.arc(8, headY + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Hoa tai ngọc trai cho Lan Anh
    if (effectiveJob === 'LAN_ANH') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, headY + 5, 2, 0, Math.PI * 2);
      ctx.arc(14, headY + 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Mắt Anime Chibi & Biểu Cảm
    if (direction !== 'UP') {
      const eyeOffsetX = direction === 'LEFT' ? -3 : direction === 'RIGHT' ? 3 : 0;

      if (isBlinking) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8 + eyeOffsetX, headY);
        ctx.lineTo(-2 + eyeOffsetX, headY);
        ctx.moveTo(2 + eyeOffsetX, headY);
        ctx.lineTo(8 + eyeOffsetX, headY);
        ctx.stroke();
      } else {
        const eyeColor = effectiveJob === 'LAN_ANH' ? '#451a03' : '#1e293b';
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(-5 + eyeOffsetX, headY, 3.2, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffsetX, headY, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Đốm sáng trong mắt anime
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6 + eyeOffsetX, headY - 1.2, 1.4, 0, Math.PI * 2);
        ctx.arc(4 + eyeOffsetX, headY - 1.2, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-4 + eyeOffsetX, headY + 1.2, 0.7, 0, Math.PI * 2);
        ctx.arc(6 + eyeOffsetX, headY + 1.2, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lông mày
      ctx.strokeStyle = effectiveJob === 'LAN_ANH' ? '#5c2c16' : '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8 + eyeOffsetX, headY - 5);
      ctx.lineTo(-3 + eyeOffsetX, headY - 4);
      ctx.moveTo(8 + eyeOffsetX, headY - 5);
      ctx.lineTo(3 + eyeOffsetX, headY - 4);
      ctx.stroke();

      // Miệng mỉm cười thân thiện
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (animationState === 'HAPPY' || animationState === 'CELEBRATE') {
        ctx.arc(eyeOffsetX, headY + 6, 3, 0, Math.PI);
      } else {
        ctx.arc(eyeOffsetX, headY + 5, 2, 0.1, Math.PI - 0.1);
      }
      ctx.stroke();

      // Kính mắt nếu là IT hoặc Admin
      if (effectiveJob === 'IT' || effectiveJob === 'ADMIN' || entity.hasGlasses) {
        ctx.strokeStyle = effectiveJob === 'IT' ? '#2d2f36' : '#4e7cc7';
        ctx.lineWidth = 1.4;
        // Kính tròn cho IT (Sheet IT) / Chữ nhật cho Admin
        if (effectiveJob === 'IT') {
          ctx.beginPath();
          ctx.arc(-5 + eyeOffsetX, headY, 4, 0, Math.PI * 2);
          ctx.arc(5 + eyeOffsetX, headY, 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-1 + eyeOffsetX, headY);
          ctx.lineTo(1 + eyeOffsetX, headY);
          ctx.stroke();
        } else {
          ctx.strokeRect(-9 + eyeOffsetX, headY - 3, 7, 6.5);
          ctx.strokeRect(2 + eyeOffsetX, headY - 3, 7, 6.5);
          ctx.beginPath();
          ctx.moveTo(-2 + eyeOffsetX, headY);
          ctx.lineTo(2 + eyeOffsetX, headY);
          ctx.stroke();
        }
      }
    }

    // 8. Mũ Bảo Vệ & Kiểu Tóc Đặc Trưng Từng Vai Trò
    if (effectiveJob === 'SECURITY') {
      // Mũ kẹp lưỡi trai cảnh vệ xanh đậm (#1F2D4D), huy hiệu vàng (#F5C542)
      ctx.fillStyle = '#1f2d4d';
      ctx.beginPath();
      ctx.roundRect(-16, headY - 14, 32, 12, [8, 8, 0, 0]);
      ctx.fill();
      // Vành lưỡi trai đen bóng phía trước
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-17, headY - 5, 34, 4);
      // Huy hiệu ngôi sao vàng đúc nổi giữa mũ
      ctx.fillStyle = '#f5c542';
      ctx.beginPath();
      ctx.arc(0, headY - 9, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (effectiveJob === 'LAN_ANH') {
      // Tóc Nâu Hạt Dẻ Dài Uốn Lượn Sóng Bồng Bềnh (Sheet Lan Anh)
      const chestnutBase = '#3a1808';
      const chestnutHighlight = '#5c2d16';

      ctx.fillStyle = chestnutBase;
      ctx.beginPath();
      ctx.arc(0, headY - 4, 17, Math.PI, Math.PI * 2);
      ctx.fill();

      // Dải lọn tóc uốn sóng hai bên ngực và sau lưng
      ctx.beginPath();
      ctx.roundRect(-17, headY - 4, 7, 28, [2, 2, 5, 5]);
      ctx.roundRect(10, headY - 4, 7, 28, [2, 2, 5, 5]);
      ctx.fill();

      // Mái tóc rẽ ngôi bồng bềnh
      ctx.fillStyle = chestnutHighlight;
      ctx.beginPath();
      ctx.moveTo(-16, headY - 4);
      ctx.quadraticCurveTo(-6, headY - 14, 2, headY - 7);
      ctx.quadraticCurveTo(10, headY - 12, 16, headY - 4);
      ctx.lineTo(16, headY - 16);
      ctx.lineTo(-16, headY - 16);
      ctx.closePath();
      ctx.fill();

    } else if (effectiveJob === 'CEO') {
      // Tóc Đen Tự Nhiên Rẽ Ngôi Lịch Lãm Khởi Nghiệp (Sheet CEO - #3B2F2F)
      const hairBase = '#3b2f2f';
      const hairHighlight = '#5b6b8f';

      ctx.fillStyle = hairBase;
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16.5, Math.PI, Math.PI * 2);
      ctx.fill();

      // Từng lọn tóc mái vuốt sang bên
      ctx.beginPath();
      ctx.moveTo(-15, headY - 3);
      ctx.lineTo(-9, headY + 1);
      ctx.lineTo(-5, headY - 4);
      ctx.lineTo(-1, headY + 2);
      ctx.lineTo(4, headY - 3);
      ctx.lineTo(9, headY + 1);
      ctx.lineTo(15, headY - 3);
      ctx.lineTo(15, headY - 16);
      ctx.lineTo(-15, headY - 16);
      ctx.closePath();
      ctx.fill();

      // Ánh sáng xanh navy trên đỉnh tóc
      ctx.strokeStyle = hairHighlight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, headY - 12, 10, Math.PI * 1.1, Math.PI * 1.7);
      ctx.stroke();

    } else if (effectiveJob === 'IT') {
      // Tóc xoăn bồng bềnh tự nhiên của IT Developer (Sheet IT)
      const itHair = '#2d2f36';
      ctx.fillStyle = itHair;
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16.5, Math.PI, Math.PI * 2);
      ctx.fill();

      // Lọn tóc mái uốn xoăn nhẹ rủ xuống trán
      ctx.beginPath();
      ctx.arc(-8, headY - 1, 4, 0, Math.PI * 2);
      ctx.arc(-2, headY, 4, 0, Math.PI * 2);
      ctx.arc(5, headY - 1, 4, 0, Math.PI * 2);
      ctx.arc(11, headY - 2, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (effectiveJob === 'DESIGNER' && gender === 'FEMALE') {
      // Nữ Designer tóc hồng pastel đội mũ nồi beret đen (Sheet Females #4)
      ctx.fillStyle = '#f472b6'; // Hồng pastel
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16.5, Math.PI, Math.PI * 2);
      ctx.fill();
      // Mũ beret đen lệch sang chảnh
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(-2, headY - 13, 15, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Tóc nam công sở hiện đại có nếp (Sheets Admin / Sales / Lead)
      const hairBase = effectiveJob === 'LEAD' ? '#3b2f2f' : '#2d2f36';
      ctx.fillStyle = hairBase;
      ctx.beginPath();
      ctx.arc(0, headY - 3, 16, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-14, headY - 3);
      ctx.lineTo(-4, headY - 1);
      ctx.lineTo(0, headY - 6);
      ctx.lineTo(8, headY - 2);
      ctx.lineTo(14, headY - 4);
      ctx.lineTo(14, headY - 15);
      ctx.lineTo(-14, headY - 15);
      ctx.closePath();
      ctx.fill();
    }

    // 9. Bảng Tên Phía Trên Đầu
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.font = 'bold 9px sans-serif';
    const textWidth = ctx.measureText(entity.name).width;
    ctx.fillRect(-textWidth / 2 - 4, headY - 28, textWidth + 8, 12);
    ctx.fillStyle = effectiveJob === 'CEO' ? '#38bdf8' : effectiveJob === 'LAN_ANH' ? '#f472b6' : '#f8fafc';
    ctx.fillText(entity.name, -textWidth / 2, headY - 19);

    // 10. Status Thought Bubble chuẩn 8 Design Sheets (👑 CEO, </> IT, 🎨 Designer, 📈 Sales, 👥 Lead, 📋 Admin, 🛡️ Security)
    const floatBob = Math.sin(tick * 8) * 3;
    const bubbleIcon = entity.statusIcon || (
      effectiveJob === 'CEO' ? '👑' :
      effectiveJob === 'IT' ? '</>' :
      effectiveJob === 'DESIGNER' ? '🎨' :
      effectiveJob === 'SALES' ? '📈' :
      effectiveJob === 'LEAD' ? '👥' :
      effectiveJob === 'ADMIN' ? '📋' :
      effectiveJob === 'SECURITY' ? '🛡️' :
      effectiveJob === 'LAN_ANH' ? '💖' : null
    );

    if (bubbleIcon) {
      // Khung bóng tròn nổi Chibi sắc nét
      ctx.save();
      const bX = 14;
      const bY = headY - 30 + floatBob;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bX, bY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Đuôi bóng nhỏ
      ctx.beginPath();
      ctx.arc(bX - 6, bY + 8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      if (bubbleIcon === '</>') {
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('</>', bX - 6, bY + 2.5);
      } else {
        ctx.font = '10px sans-serif';
        ctx.fillText(bubbleIcon, bX - 5, bY + 3.5);
      }
      ctx.restore();
    }

    // 11. Speech Bubble nếu có thoại
    if (entity.speechBubble) {
      ctx.save();
      ctx.font = 'bold 9px sans-serif';
      const bubbleTextWidth = ctx.measureText(entity.speechBubble).width;
      const bW = bubbleTextWidth + 14;
      const bH = 18;
      const bX = -bW / 2;
      const bY = headY - 46;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, bY + bH);
      ctx.lineTo(0, bY + bH + 4);
      ctx.lineTo(4, bY + bH);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

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
    } else if (scene.id === 'CEO_OFFICE') {
      lightPositions.push(
        { x: 180, y: 17 },
        { x: 460, y: 17 },
        { x: 400, y: 190 },
        { x: 390, y: 360 },
        { x: 690, y: 180 }
      );
    } else if (scene.id === 'CAFE') {
      lightPositions.push({ x: 170, y: 100 }, { x: 510, y: 140 }, { x: 270, y: 300 });
    } else if (scene.id === 'BANK') {
      lightPositions.push({ x: 320, y: 120 }, { x: 210, y: 260 }, { x: 480, y: 260 });
    } else if (scene.id === 'VILLA') {
      lightPositions.push({ x: 400, y: 190 }, { x: 150, y: 120 }, { x: 650, y: 120 });
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

  // Điểm đích đến Click-to-Move / Tap-to-Move với hiệu ứng vòng sóng tỏa ra chuẩn RPG
  private renderDestinationMarker(pos: Position2D, tick: number) {
    const ctx = this.ctx;
    ctx.save();

    // Vòng tròn sóng lan tỏa theo tỷ lệ elip phối cảnh sàn 2D
    const pulse1 = (tick * 4) % 1;
    const r1 = 8 + pulse1 * 18;
    const a1 = Math.max(0, 1 - pulse1) * 0.75;

    ctx.strokeStyle = `rgba(56, 189, 248, ${a1})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, r1, r1 * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Vòng cố định nhỏ hơn bên trong
    const pulse2 = Math.sin(tick * 8) * 1.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 10 + pulse2, (10 + pulse2) * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Chấm tâm sáng
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 vạch ngắm chữ thập tinh tế
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pos.x - 16, pos.y); ctx.lineTo(pos.x - 10, pos.y);
    ctx.moveTo(pos.x + 10, pos.y); ctx.lineTo(pos.x + 16, pos.y);
    ctx.moveTo(pos.x, pos.y - 10); ctx.lineTo(pos.x, pos.y - 6);
    ctx.moveTo(pos.x, pos.y + 6); ctx.lineTo(pos.x, pos.y + 10);
    ctx.stroke();

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
  private renderScreenPrompt(promptText: string, screenWidth: number, screenHeight: number, dpr: number = 1.0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.font = 'bold 13px sans-serif';
    const textWidth = ctx.measureText(promptText).width;
    const boxWidth = Math.min(screenWidth - 32, textWidth + 36);
    const boxHeight = 36;
    const boxX = (screenWidth - boxWidth) / 2;
    const boxY = screenHeight - (screenWidth < 768 ? 96 : 60);

    // Nền hộp thông điệp mờ cao cấp
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
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
