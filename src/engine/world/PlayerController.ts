// ============================================================================
// CEO EMPIRE: PLAYER CONTROLLER (Keyboard, Movement, Collision & Interaction)
// ============================================================================

import { CharacterDirection, CharacterAnimationState, Position2D } from '../../types';
import { MapSceneConfig, InteractiveZone, CollisionBox } from './WorldData';
import { soundManager } from '../core/SoundManager';

export class PlayerController {
  public pos: Position2D = { x: 200, y: 350 };
  public dir: CharacterDirection = 'DOWN';
  public state: CharacterAnimationState = 'IDLE';

  public baseSpeed: number = 175; // Pixels per second
  public isRunning: boolean = false;
  
  private keys: Record<string, boolean> = {};
  public nearbyZone: InteractiveZone | null = null;

  // Hỗ trợ điều khiển cảm ứng / click-to-move liên tục
  public targetDestination: Position2D | null = null;
  public virtualInput: { dx: number; dy: number; isRunning: boolean } | null = null;

  private stepTimer: number = 0;
  private stuckTimer: number = 0;

  constructor(initialPos?: Position2D) {
    if (initialPos) {
      this.pos = { ...initialPos };
    }
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        // Tránh scroll trang khi bấm phím mũi tên hoặc space
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  public setTargetDestination(x: number, y: number) {
    this.targetDestination = { x, y };
    this.stuckTimer = 0;
  }

  public clearTargetDestination() {
    this.targetDestination = null;
    this.stuckTimer = 0;
    if (this.state === 'WALK') {
      this.state = 'IDLE';
    }
  }

  public setVirtualInput(dx: number, dy: number, isRunning: boolean = false) {
    this.virtualInput = { dx, dy, isRunning };
    if (dx !== 0 || dy !== 0) {
      this.targetDestination = null;
    }
  }

  public triggerInteract(onInteract?: (zone: InteractiveZone) => void) {
    if (this.nearbyZone) {
      soundManager.playClick();
      if (onInteract) {
        onInteract(this.nearbyZone);
      }
    }
  }

  public update(deltaTime: number, currentScene: MapSceneConfig, onInteract?: (zone: InteractiveZone) => void) {
    let dx = 0;
    let dy = 0;

    const up = this.keys['w'] || this.keys['arrowup'];
    const down = this.keys['s'] || this.keys['arrowdown'];
    const left = this.keys['a'] || this.keys['arrowleft'];
    const right = this.keys['d'] || this.keys['arrowright'];
    const keyRunning = !!this.keys['shift'];

    if (up) dy -= 1;
    if (down) dy += 1;
    if (left) dx -= 1;
    if (right) dx += 1;

    // 1. Nếu có phím bàn phím: Ưu tiên bàn phím và xóa đích click
    if (dx !== 0 || dy !== 0) {
      this.targetDestination = null;
      this.isRunning = keyRunning;

      // Chuẩn hóa vector di chuyển chéo
      if (dx !== 0 && dy !== 0) {
        const invLen = 1 / Math.SQRT2;
        dx *= invLen;
        dy *= invLen;
      }
    } else if (this.virtualInput && (this.virtualInput.dx !== 0 || this.virtualInput.dy !== 0)) {
      // 2. Nếu có Virtual D-Pad (Cảm ứng Mobile/Tablet)
      this.targetDestination = null;
      dx = this.virtualInput.dx;
      dy = this.virtualInput.dy;
      this.isRunning = this.virtualInput.isRunning;
    } else if (this.targetDestination) {
      // 3. Nếu đang tự hành tới tọa độ đã click (Click-to-Move / Tap-to-Move)
      const toX = this.targetDestination.x - this.pos.x;
      const toY = this.targetDestination.y - this.pos.y;
      const dist = Math.hypot(toX, toY);

      if (dist < 6) {
        this.clearTargetDestination();
      } else {
        dx = toX / dist;
        dy = toY / dist;
        this.isRunning = dist > 180; // Tự động chạy nhanh nếu khoảng cách xa
      }
    }

    const currentSpeed = (this.isRunning ? this.baseSpeed * 1.5 : this.baseSpeed) * deltaTime;

    if (dx !== 0 || dy !== 0) {
      this.state = 'WALK';

      // Cập nhật hướng nhìn
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        this.dir = dy > 0 ? 'DOWN' : 'UP';
      }

      let moved = false;

      // Kiểm tra va chạm trục X
      const nextX = this.pos.x + dx * currentSpeed;
      if (!this.checkCollision(nextX, this.pos.y, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.x = nextX;
        moved = true;
      }

      // Kiểm tra va chạm trục Y
      const nextY = this.pos.y + dy * currentSpeed;
      if (!this.checkCollision(this.pos.x, nextY, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.y = nextY;
        moved = true;
      }

      // Nếu đang click-to-move mà bị kẹt vật cản quá 0.25 giây -> tự động hủy để không bị giật
      if (this.targetDestination) {
        if (!moved) {
          this.stuckTimer += deltaTime;
          if (this.stuckTimer > 0.25) {
            this.clearTargetDestination();
          }
        } else {
          this.stuckTimer = 0;
        }
      }

      // Phát âm thanh bước chân
      this.stepTimer += deltaTime;
      if (this.stepTimer > (this.isRunning ? 0.22 : 0.32)) {
        soundManager.playFootstep();
        this.stepTimer = 0;
      }

    } else {
      if (this.state === 'WALK') {
        this.state = 'IDLE';
      }
    }

    // Kiểm tra vùng tương tác gần nhất
    this.nearbyZone = this.findNearestInteractiveZone(currentScene.interactiveZones);

    // Kích hoạt tương tác khi nhấn [E] hoặc [SPACE]
    if (this.nearbyZone && (this.keys['e'] || this.keys[' '])) {
      // Nhả phím để tránh trigger liên tục
      this.keys['e'] = false;
      this.keys[' '] = false;
      soundManager.playClick();
      if (onInteract) {
        onInteract(this.nearbyZone);
      }
    }
  }

  // Kiểm tra va chạm hình chữ nhật AABB với nhân vật
  private checkCollision(newX: number, newY: number, colliders: CollisionBox[], mapWidth: number, mapHeight: number): boolean {
    const charRadius = 12; // Bán kính va chạm chân nhân vật

    // Viền bản đồ
    if (newX - charRadius < 10 || newX + charRadius > mapWidth - 10) return true;
    if (newY - charRadius < 10 || newY + charRadius > mapHeight - 10) return true;

    for (const box of colliders) {
      if (
        newX + charRadius > box.x &&
        newX - charRadius < box.x + box.width &&
        newY + charRadius > box.y &&
        newY - charRadius < box.y + box.height
      ) {
        return true;
      }
    }
    return false;
  }

  // Tìm kiếm vùng tương tác trong phạm vi 50 pixels
  private findNearestInteractiveZone(zones: InteractiveZone[]): InteractiveZone | null {
    let closestZone: InteractiveZone | null = null;
    let minDistance = 55; // Khoảng cách tương tác tối đa

    for (const zone of zones) {
      const centerX = zone.x + zone.width / 2;
      const centerY = zone.y + zone.height / 2;
      const dist = Math.hypot(this.pos.x - centerX, this.pos.y - centerY);

      if (dist < minDistance) {
        minDistance = dist;
        closestZone = zone;
      }
    }

    return closestZone;
  }

  // Điều khiển click-to-move cho cảm ứng hoặc chuột
  public moveToTarget(targetX: number, targetY: number, currentScene: MapSceneConfig) {
    const dx = targetX - this.pos.x;
    const dy = targetY - this.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      const step = Math.min(dist, 10);
      const nextX = this.pos.x + (dx / dist) * step;
      const nextY = this.pos.y + (dy / dist) * step;

      if (!this.checkCollision(nextX, this.pos.y, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.x = nextX;
      }
      if (!this.checkCollision(this.pos.x, nextY, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.y = nextY;
      }
      this.state = 'WALK';
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
    } else {
      this.state = 'IDLE';
    }
  }
}
