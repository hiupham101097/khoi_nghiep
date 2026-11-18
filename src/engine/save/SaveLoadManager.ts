// ============================================================================
// CEO EMPIRE: SAVE / LOAD MANAGER (Schema Versioning & Fallback Recovery)
// ============================================================================

import { GameSaveState } from '../../types';

export const CURRENT_SAVE_VERSION = '1.0.0';

export class SaveLoadManager {
  private static STORAGE_PREFIX = 'CEO_EMPIRE_SAVE_SLOT_';
  private static AUTO_SAVE_KEY = 'CEO_EMPIRE_AUTO_SAVE';

  // Lưu vào slot cụ thể (1, 2, 3)
  public static saveGame(state: GameSaveState, slot: number): boolean {
    try {
      state.timestamp = Date.now();
      state.saveSlot = slot;
      state.version = CURRENT_SAVE_VERSION;

      const serialized = JSON.stringify(state);
      localStorage.setItem(`${this.STORAGE_PREFIX}${slot}`, serialized);
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  }

  // Tự động lưu
  public static autoSave(state: GameSaveState): boolean {
    try {
      state.timestamp = Date.now();
      state.version = CURRENT_SAVE_VERSION;
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.AUTO_SAVE_KEY, serialized);
      return true;
    } catch (err) {
      console.error('AutoSave failed:', err);
      return false;
    }
  }

  // Tải dữ liệu từ slot
  public static loadGame(slot: number): GameSaveState | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${slot}`);
      if (!data) return null;
      return this.validateAndMigrate(JSON.parse(data));
    } catch (err) {
      console.error('Load slot failed:', err);
      return null;
    }
  }

  // Tải dữ liệu tự động lưu
  public static loadAutoSave(): GameSaveState | null {
    try {
      const data = localStorage.getItem(this.AUTO_SAVE_KEY);
      if (!data) return null;
      return this.validateAndMigrate(JSON.parse(data));
    } catch (err) {
      console.error('Load autosave failed:', err);
      return null;
    }
  }

  // Xuất file JSON tải về máy
  public static exportSaveFile(state: GameSaveState) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CEO_Empire_Save_D${state.day}_M${state.month}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Nhập từ chuỗi JSON
  public static importSaveFile(jsonString: string): GameSaveState | null {
    try {
      const parsed = JSON.parse(jsonString);
      return this.validateAndMigrate(parsed);
    } catch (err) {
      console.error('Import save failed:', err);
      return null;
    }
  }

  // Xác thực schema và phục hồi lỗi phiên bản (Schema migration fallback)
  private static validateAndMigrate(data: unknown): GameSaveState {
    const raw = data as Partial<GameSaveState>;

    // Khởi tạo các giá trị mặc định nếu bị thiếu do phiên bản cũ
    return {
      version: raw.version || CURRENT_SAVE_VERSION,
      timestamp: raw.timestamp || Date.now(),
      saveSlot: raw.saveSlot || 1,
      gamePhase: raw.gamePhase || 'PLAYING',

      day: raw.day || 1,
      month: raw.month || 1,
      year: raw.year || 1,
      hour: raw.hour ?? 8,
      minute: raw.minute ?? 0,
      weather: raw.weather || 'SUNNY',

      companyName: raw.companyName || 'NextGen Tech Solutions',
      isRegistered: raw.isRegistered ?? true,
      taxCode: raw.taxCode || '0109988776',
      enterpriseStage: raw.enterpriseStage || 'STAGE_1_BOOTSTRAP',
      sprintStrategy: raw.sprintStrategy || 'BALANCED',
      activePetition: raw.activePetition || null,
      playerStats: raw.playerStats || {
        name: 'Nguyễn Thành Nam',
        age: 22,
        cash: 500000000,
        energy: 100,
        maxEnergy: 100,
        health: 100,
        reputation: 15,
        managementSkill: 20,
        techSkill: 45
      },
      currentOfficeId: raw.currentOfficeId || 'office_tier_1',
      furniture: raw.furniture || [],
      employees: raw.employees || [],
      activeProjects: raw.activeProjects || [],
      completedProjectsCount: raw.completedProjectsCount || 0,
      cashHistory: raw.cashHistory || [500000000],
      financialStatements: raw.financialStatements || [],
      loans: raw.loans || [],

      romance: raw.romance || {
        name: 'Lan Anh',
        affection: 75,
        trust: 80,
        patience: 70,
        lastDateDay: 1,
        promisedGifts: [],
        datingHistory: [],
        currentMood: 'SUPPORTIVE'
      },
      father: raw.father || {
        name: 'Ông Hoàng Thế Vinh',
        respect: 15,
        evaluation: 'SKEPTICAL',
        lastEncounterDay: 1
      },
      legal: raw.legal || {
        taxComplianceRating: 95,
        laborComplianceRating: 90,
        contractDisputesCount: 0,
        inspectionsPending: false,
        isUnderCriminalInvestigation: false,
        chargesFiled: false,
        sentencedToPrison: false,
        prisonSentenceYears: 0,
        historyLog: []
      },

      currentScene: raw.currentScene || 'CITY',
      playerPos: raw.playerPos || { x: 200, y: 350 },
      playerDir: raw.playerDir || 'DOWN',
      decisionLog: raw.decisionLog || []
    };
  }
}
