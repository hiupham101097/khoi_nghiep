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

  public baseSpeed: number = 160; // Pixels per second
  public isRunning: boolean = false;
  
  private keys: Record<string, boolean> = {};
  public nearbyZone: InteractiveZone | null = null;

  private stepTimer: number = 0;

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

  public update(deltaTime: number, currentScene: MapSceneConfig, onInteract?: (zone: InteractiveZone) => void) {
    let dx = 0;
    let dy = 0;

    const up = this.keys['w'] || this.keys['arrowup'];
    const down = this.keys['s'] || this.keys['arrowdown'];
    const left = this.keys['a'] || this.keys['arrowleft'];
    const right = this.keys['d'] || this.keys['arrowright'];
    this.isRunning = !!this.keys['shift'];

    if (up) dy -= 1;
    if (down) dy += 1;
    if (left) dx -= 1;
    if (right) dx += 1;

    // Chuẩn hóa vector di chuyển chéo
    if (dx !== 0 && dy !== 0) {
      const invLen = 1 / Math.SQRT2;
      dx *= invLen;
      dy *= invLen;
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

      // Kiểm tra va chạm trục X
      const nextX = this.pos.x + dx * currentSpeed;
      if (!this.checkCollision(nextX, this.pos.y, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.x = nextX;
      }

      // Kiểm tra va chạm trục Y
      const nextY = this.pos.y + dy * currentSpeed;
      if (!this.checkCollision(this.pos.x, nextY, currentScene.colliders, currentScene.width, currentScene.height)) {
        this.pos.y = nextY;
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
