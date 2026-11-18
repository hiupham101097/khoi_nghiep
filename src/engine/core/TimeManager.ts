// ============================================================================
// CEO EMPIRE: TIME MANAGER (Chu kỳ ngày đêm, lịch làm việc, tháng, năm)
// ============================================================================

import { DayTimePeriod, WeatherType } from '../../types';

export class TimeManager {
  public day: number = 1;
  public month: number = 1;
  public year: number = 1;
  public hour: number = 8;
  public minute: number = 0;
  
  public timeSpeed: number = 1; // 0 = Paused, 1 = 1x, 2 = 2x, 5 = 5x
  public weather: WeatherType = 'SUNNY';
  
  private accumulatedSeconds: number = 0;
  private readonly SECONDS_PER_GAME_MINUTE = 0.5; // Mỗi 0.5s đời thực = 1 phút trong game (1 ngày = 12 phút thực tế ở 1x)

  // Callbacks
  public onDayChanged?: (day: number, month: number, year: number) => void;
  public onMonthChanged?: (month: number, year: number) => void;
  public onHourChanged?: (hour: number) => void;

  constructor(initData?: { day: number; month: number; year: number; hour: number; minute: number; weather?: WeatherType }) {
    if (initData) {
      this.day = initData.day;
      this.month = initData.month;
      this.year = initData.year;
      this.hour = initData.hour;
      this.minute = initData.minute;
      if (initData.weather) this.weather = initData.weather;
    }
  }

  public update(deltaTimeSeconds: number): void {
    if (this.timeSpeed <= 0) return;

    this.accumulatedSeconds += deltaTimeSeconds * this.timeSpeed;

    while (this.accumulatedSeconds >= this.SECONDS_PER_GAME_MINUTE) {
      this.accumulatedSeconds -= this.SECONDS_PER_GAME_MINUTE;
      this.advanceMinute();
    }
  }

  private advanceMinute(): void {
    this.minute += 1;
    if (this.minute >= 60) {
      this.minute = 0;
      this.advanceHour();
    }
  }

  private advanceHour(): void {
    this.hour += 1;
    if (this.onHourChanged) {
      this.onHourChanged(this.hour);
    }

    if (this.hour >= 24) {
      this.hour = 0;
      this.advanceDay();
    }
  }

  private advanceDay(): void {
    this.day += 1;

    // Ngẫu nhiên thay đổi thời tiết mỗi ngày
    const weatherRoll = Math.random();
    if (weatherRoll < 0.65) {
      this.weather = 'SUNNY';
    } else if (weatherRoll < 0.88) {
      this.weather = 'RAIN';
    } else {
      this.weather = 'OVERCAST';
    }

    if (this.onDayChanged) {
      this.onDayChanged(this.day, this.month, this.year);
    }

    // 30 ngày mỗi tháng
    if (this.day > 30) {
      this.day = 1;
      this.advanceMonth();
    }
  }

  private advanceMonth(): void {
    this.month += 1;
    if (this.onMonthChanged) {
      this.onMonthChanged(this.month, this.year);
    }

    if (this.month > 12) {
      this.month = 1;
      this.year += 1;
    }
  }

  public getPeriod(): DayTimePeriod {
    if (this.hour >= 5 && this.hour < 8) return 'DAWN';
    if (this.hour >= 8 && this.hour < 17) return 'DAY';
    if (this.hour >= 17 && this.hour < 19) return 'DUSK';
    return 'NIGHT';
  }

  // Giờ làm việc tiêu chuẩn: 08:30 - 17:30
  public isWorkHour(): boolean {
    const totalMinutes = this.hour * 60 + this.minute;
    return totalMinutes >= (8 * 60 + 30) && totalMinutes <= (17 * 60 + 30);
  }

  // Giờ nghỉ trưa: 12:00 - 13:30
  public isLunchHour(): boolean {
    const totalMinutes = this.hour * 60 + this.minute;
    return totalMinutes >= (12 * 60) && totalMinutes < (13 * 60 + 30);
  }

  // Giờ tăng ca (Overtime OT): 18:00 - 21:00
  public isOvertimeHour(): boolean {
    const totalMinutes = this.hour * 60 + this.minute;
    return totalMinutes >= (18 * 60) && totalMinutes <= (21 * 60);
  }

  public getFormattedTime(): string {
    const h = this.hour.toString().padStart(2, '0');
    const m = this.minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  public getFormattedDate(): string {
    return `Ngày ${this.day} - Tháng ${this.month} - Năm ${this.year}`;
  }

  // Trả về sắc độ ánh sáng môi trường (Lighting overlay color & alpha)
  public getAmbientLighting(): { r: number; g: number; b: number; alpha: number } {
    const period = this.getPeriod();
    switch (period) {
      case 'DAWN':
        return { r: 255, g: 180, b: 120, alpha: 0.15 };
      case 'DAY':
        return { r: 255, g: 255, b: 255, alpha: 0.0 };
      case 'DUSK':
        return { r: 220, g: 120, b: 80, alpha: 0.28 };
      case 'NIGHT':
        return { r: 20, g: 25, b: 65, alpha: 0.58 };
    }
  }
}
