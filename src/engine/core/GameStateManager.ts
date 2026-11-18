// ============================================================================
// CEO EMPIRE: GAME STATE MANAGER (Bộ Điều Phối Trung Tâm Của Toàn Bộ Game)
// ============================================================================

import {
  GamePhase,
  GameSaveState,
  ProjectContract,
  EmployeeAIEntity,
  FurnitureItem,
  DynamicGameEvent,
  EndingData
} from '../../types';
import { TimeManager } from './TimeManager';
import { PlayerController } from '../world/PlayerController';
import { WORLD_MAPS, MapSceneConfig, InteractiveZone } from '../world/WorldData';
import { AVAILABLE_OFFICES, CATALOG_FURNITURE } from '../economy/CompanyManager';
import { EconomyManager } from '../economy/EconomyManager';
import { ProjectManager } from '../economy/ProjectManager';
import { EmployeeAIEngine } from '../ai/EmployeeAI';
import { RelationshipManager } from '../narrative/RelationshipManager';
import { DynamicEventManager } from '../narrative/DynamicEventManager';
import { EndingManager } from '../narrative/EndingManager';
import { LegalManager } from '../legal/LegalManager';
import { SaveLoadManager } from '../save/SaveLoadManager';
import { soundManager } from './SoundManager';
import { RenderableEntity } from '../world/Renderer';

export class GameStateManager {
  public gamePhase: GamePhase = 'INTRO_CINEMATIC';
  public timeManager: TimeManager;
  public playerController: PlayerController;

  public currentSceneId: 'CITY' | 'ROOM' | 'OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT' = 'VILLA'; // Bắt đầu tại Biệt thự cuộc gặp 500 triệu
  public currentScene: MapSceneConfig = WORLD_MAPS.VILLA;

  // Trạng thái công ty & nhân sự
  public companyName: string = 'NextGen Solutions';
  public isRegistered: boolean = false;
  public taxCode: string = '0109988776';
  public currentOfficeId: string = 'office_tier_1';
  public furniture: FurnitureItem[] = [...CATALOG_FURNITURE];
  public employees: EmployeeAIEntity[] = [];
  public activeProjects: ProjectContract[] = [];
  public completedProjectsCount: number = 0;
  public isOvertimeActive: boolean = false;

  // Chỉ số người chơi
  public playerStats = {
    name: 'Nguyễn Thành Nam',
    age: 22,
    cash: 0, // Sẽ thành 500,000,000 sau khi chọn C
    energy: 100,
    maxEnergy: 100,
    health: 100,
    reputation: 10,
    managementSkill: 20,
    techSkill: 45
  };

  // Tài chính & Vay nợ
  public monthlyRevenueAccumulated: number = 0;
  public cashHistory: number[] = [];
  public financialStatements: GameSaveState['financialStatements'] = [];
  public loans: GameSaveState['loans'] = [];

  // Quan hệ & Pháp lý
  public romance = RelationshipManager.initialRomance();
  public father = RelationshipManager.initialFather();
  public legal = LegalManager.initialLegalStatus();

  // Sự kiện & Ending
  public currentActiveEvent: DynamicGameEvent | null = null;
  public currentEnding: EndingData | null = null;
  public decisionLog: string[] = [];

  // UI Modals state
  public openDashboardTab: 'OVERVIEW' | 'HR' | 'FINANCE' | 'PROJECTS' | 'OFFICE' | 'LEGAL' | null = null;
  public isRecruitModalOpen: boolean = false;
  public isProjectTenderOpen: boolean = false;
  public isOfficeModalOpen: boolean = false;
  public isBankModalOpen: boolean = false;
  public isSaveMenuOpen: boolean = false;
  public selectedEmployeeFor1on1: EmployeeAIEntity | null = null;

  // Listeners cập nhật UI React
  private changeListeners: (() => void)[] = [];

  constructor() {
    this.timeManager = new TimeManager();
    this.playerController = new PlayerController({ x: 380, y: 350 });
    this.setupTimeHandlers();
  }

  public subscribe(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  public notify() {
    this.changeListeners.forEach((listener) => listener());
  }

  private setupTimeHandlers() {
    // Khi sang ngày mới
    this.timeManager.onDayChanged = (day) => {
      this.handleDailyCycle(day);
    };

    // Khi sang tháng mới (Quyết toán lương, thuê nhà, thuế)
    this.timeManager.onMonthChanged = (month, year) => {
      this.handleMonthlyCycle(month, year);
    };
  }

  // VÒNG LẶP CHÍNH CẬP NHẬT THEO FRAME
  public update(deltaTime: number) {
    if (this.gamePhase === 'PLAYING') {
      // 1. Cập nhật thời gian
      this.timeManager.update(deltaTime);

      // 2. Cập nhật di chuyển & va chạm người chơi
      this.playerController.update(deltaTime, this.currentScene, (zone) => {
        this.handleZoneInteraction(zone);
      });

      // 3. Cập nhật chuyển động tự hành & suy nghĩ thoại cho nhân viên AI trong văn phòng
      if (this.currentSceneId === 'OFFICE') {
        const isWorkHour = this.timeManager.isWorkHour();
        const isLunch = this.timeManager.isLunchHour();
        const isOT = this.isOvertimeActive && this.timeManager.isOvertimeHour();

        const coffeePos = { x: 620, y: 90 };
        const loungePos = { x: 500, y: 370 };
        const exitPos = { x: 380, y: 480 };

        this.employees.forEach((emp, idx) => {
          const deskPos = this.currentScene.deskPositions[idx % this.currentScene.deskPositions.length] || { x: 200, y: 250 };
          EmployeeAIEngine.updateMovementAndDialogue(
            emp,
            deltaTime,
            deskPos,
            coffeePos,
            loungePos,
            exitPos,
            isWorkHour,
            isLunch,
            isOT
          );
        });
      }

      // 4. Kiểm tra điều kiện Ending tức thì
      const potentialEnding = EndingManager.evaluateEnding(this.exportState(1));
      if (potentialEnding) {
        this.triggerEnding(potentialEnding);
      }
    }
  }

  // Tương tác với vùng InteractiveZone
  public handleZoneInteraction(zone: InteractiveZone) {
    switch (zone.actionType) {
      case 'ENTER_SCENE':
        if (zone.targetScene) {
          this.switchScene(zone.targetScene, zone.targetSpawn);
        }
        break;

      case 'OPEN_COMPANY_MENU':
        this.openDashboardTab = 'OVERVIEW';
        this.notify();
        break;

      case 'OPEN_PROJECTS':
        this.isProjectTenderOpen = true;
        this.notify();
        break;

      case 'OPEN_RECRUIT':
        this.isRecruitModalOpen = true;
        this.notify();
        break;

      case 'OPEN_BANK':
        this.isBankModalOpen = true;
        this.notify();
        break;

      case 'OPEN_TAX':
        this.openDashboardTab = 'LEGAL';
        this.notify();
        break;

      case 'SLEEP_REST':
        this.playerStats.energy = 100;
        this.playerStats.health = Math.min(100, this.playerStats.health + 10);
        soundManager.playSuccess();
        this.timeManager.hour = 8;
        this.timeManager.minute = 0;
        this.notify();
        break;

      case 'USE_COFFEE':
        this.playerStats.energy = Math.min(100, this.playerStats.energy + 20);
        soundManager.playCashEarned();
        this.notify();
        break;

      case 'TALK_NPC':
        if (this.currentSceneId === 'VILLA') {
          this.talkWithFather();
        } else if (this.currentSceneId === 'CAFE') {
          this.dateWithLanAnh();
        }
        break;

      default:
        break;
    }
  }

  // Chuyển đổi cảnh (Vào/Ra các tòa nhà)
  public switchScene(targetSceneId: 'CITY' | 'ROOM' | 'OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT', targetSpawn?: { x: number; y: number }) {
    this.currentSceneId = targetSceneId;
    this.currentScene = WORLD_MAPS[targetSceneId] || WORLD_MAPS.CITY;

    if (targetSpawn) {
      this.playerController.pos = { ...targetSpawn };
    } else {
      this.playerController.pos = { ...this.currentScene.defaultSpawn };
    }

    soundManager.playClick();
    this.notify();
  }

  // Xử lý chu kỳ mỗi ngày
  private handleDailyCycle(day: number) {
    const hasCoffee = this.furniture.some((f) => f.id === 'item_coffee_espresso' && f.purchased);
    const hasErgo = this.furniture.some((f) => f.id === 'item_chair_ergo' && f.purchased);

    // 1. Cập nhật tâm lý & hành vi từng nhân viên AI
    this.employees.forEach((emp) => {
      EmployeeAIEngine.updateEmployeeCycle(
        emp,
        this.timeManager,
        this.activeProjects,
        hasCoffee,
        hasErgo,
        this.isOvertimeActive
      );
    });

    // 2. Cập nhật tiến độ các dự án đang chạy
    this.activeProjects.forEach((proj) => {
      const assigned = this.employees.filter((e) => proj.assignedEmployeeIds.includes(e.id));
      const { isCompleted } = ProjectManager.updateDailyProjectSprint(proj, assigned);

      if (isCompleted) {
        const { payout, reputationGain } = ProjectManager.deliverProject(proj);
        this.playerStats.cash += payout;
        this.monthlyRevenueAccumulated += payout;
        this.playerStats.reputation = Math.min(100, this.playerStats.reputation + reputationGain);
        this.completedProjectsCount += 1;
        this.decisionLog.push(`Hoàn thành & Bàn giao dự án: ${proj.name}. Thu về ${payout.toLocaleString('vi-VN')} VNĐ.`);
      }
    });

    // Xóa các dự án đã hoàn thành khỏi danh sách active
    this.activeProjects = this.activeProjects.filter((p) => p.status !== 'COMPLETED');

    // 3. Cập nhật quan hệ tình cảm
    const valuation = EconomyManager.calculateCompanyValuation(
      this.cashHistory.slice(-6),
      this.employees.length,
      this.playerStats.reputation,
      this.completedProjectsCount
    );
    RelationshipManager.updateDailyRelationship(this.romance, this.father, day, this.playerStats.reputation, valuation);

    // 4. Kích hoạt sự kiện ngẫu nhiên động
    const event = DynamicEventManager.rollDailyEvent(day, this.decisionLog);
    if (event) {
      this.currentActiveEvent = event;
      soundManager.playAlert();
    }

    // 5. Tự động lưu dữ liệu
    SaveLoadManager.autoSave(this.exportState(0));
    this.notify();
  }

  // Xử lý quyết toán tài chính cuối tháng
  private handleMonthlyCycle(month: number, year: number) {
    const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === this.currentOfficeId) || null;

    const result = EconomyManager.processMonthlySettlement(
      this.playerStats.cash,
      this.monthlyRevenueAccumulated,
      this.employees,
      currentOffice,
      this.furniture,
      this.loans,
      month,
      year
    );

    this.playerStats.cash = result.newCash;
    this.loans = result.updatedLoans;
    this.financialStatements.unshift(result.financialRecord);
    this.cashHistory.push(result.newCash);
    this.monthlyRevenueAccumulated = 0; // Reset doanh thu tháng mới

    if (result.isBankrupt) {
      this.triggerEnding(EndingManager.evaluateEnding(this.exportState(1))!);
    }

    soundManager.playCashEarned();
    this.notify();
  }

  // Kích hoạt Ending
  public triggerEnding(ending: EndingData) {
    this.currentEnding = ending;
    this.gamePhase = 'GAME_OVER_ENDING';
    soundManager.playDramaticChord();
    this.notify();
  }

  // Lựa chọn A trong Intro 500 triệu
  public chooseIntroOptionA() {
    this.gamePhase = 'INTRO_BRANCH_A';
    soundManager.playDramaticChord();
    this.notify();
  }

  // Lựa chọn B trong Intro 500 triệu
  public chooseIntroOptionB() {
    this.gamePhase = 'INTRO_BRANCH_B';
    soundManager.playDramaticChord();
    this.notify();
  }

  // Lựa chọn C trong Intro 500 triệu: BẮT ĐẦU CHIẾN DỊCH KHỞI NGHIỆP
  public chooseIntroOptionC() {
    this.playerStats.cash = 500000000; // Nhận đúng 500 triệu khởi nghiệp!
    this.gamePhase = 'PLAYING';
    this.switchScene('ROOM', { x: 300, y: 300 }); // Bắt đầu từ phòng trọ
    this.decisionLog.push('Cầm 500 triệu đồng và thách thức Bố Lan Anh: Bắt đầu đế chế khởi nghiệp!');
    soundManager.playSuccess();
    this.notify();
  }

  // Hẹn hò cùng Lan Anh
  public dateWithLanAnh() {
    if (this.playerStats.cash < 500000) {
      alert('Bạn không đủ tiền để mời Lan Anh đi hẹn hò (Cần tối thiểu 500.000đ)!');
      return;
    }
    this.playerStats.cash -= 500000;
    const { dialogue } = RelationshipManager.goOnDate(this.romance, this.timeManager.day, 500000);
    alert(dialogue);
    this.notify();
  }

  // Đối thoại với Bố Lan Anh
  public talkWithFather() {
    let msg = `Ông Hoàng Thế Vinh: "Ta đang theo dõi từng bước đi của cậu. Đừng tưởng cầm 500 triệu là đã thành doanh nhân."`;
    if (this.father.evaluation === 'PROUD') {
      msg = `Ông Hoàng Thế Vinh: "Khá lắm chàng trai! Ta quả không nhìn lầm bản lĩnh của cậu. Hai đứa tính khi nào làm đám cưới?"`;
    } else if (this.father.evaluation === 'IMPRESSED') {
      msg = `Ông Hoàng Thế Vinh: "Doanh nghiệp của cậu tăng trưởng khá ấn tượng đấy. Tiếp tục phát huy, đừng để vấp ngã."`;
    }
    alert(msg);
  }

  // Lấy danh sách thực thể để Renderer vẽ lên Canvas
  public getRenderableEntities(): RenderableEntity[] {
    const list: RenderableEntity[] = [];

    // 1. Người chơi (CEO)
    list.push({
      id: 'player',
      name: `${this.playerStats.name} (CEO)`,
      x: this.playerController.pos.x,
      y: this.playerController.pos.y,
      direction: this.playerController.dir,
      animationState: this.playerController.state,
      roleType: 'PLAYER',
      outfitColor: '#0284c7'
    });

    // 2. Nhân viên trong văn phòng
    if (this.currentSceneId === 'OFFICE') {
      this.employees.forEach((emp, idx) => {
        const deskPos = this.currentScene.deskPositions[idx % this.currentScene.deskPositions.length] || { x: 200, y: 250 };
        const posX = emp.currentPos ? emp.currentPos.x : deskPos.x;
        const posY = emp.currentPos ? emp.currentPos.y : deskPos.y;

        list.push({
          id: emp.id,
          name: emp.name,
          x: posX,
          y: posY,
          direction: 'DOWN',
          animationState: emp.currentState,
          roleType: 'EMPLOYEE',
          gender: emp.gender,
          hasGlasses: emp.role === 'BACKEND' || emp.role === 'TESTER',
          outfitColor: emp.role === 'DESIGNER' ? '#ec4899' : emp.role === 'FRONTEND' ? '#3b82f6' : '#10b981',
          speechBubble: emp.speechBubble
        });
      });
    }

    // 2b. Người đi đường & Cư dân đô thị (Khi ở ngoài phố)
    if (this.currentSceneId === 'CITY') {
      list.push(
        {
          id: 'npc_citizen_1',
          name: 'Anh Nam (Dev Freelance)',
          x: 230,
          y: 490,
          direction: 'RIGHT',
          animationState: 'WORK',
          roleType: 'CITIZEN',
          outfitColor: '#475569',
          statusIcon: '☕',
          speechBubble: 'StartUp giờ khó gọi vốn quá'
        },
        {
          id: 'npc_citizen_2',
          name: 'Cô Mai (Quán Trà Đá)',
          x: 140,
          y: 505,
          direction: 'DOWN',
          animationState: 'IDLE',
          roleType: 'CITIZEN',
          gender: 'FEMALE',
          outfitColor: '#ea580c',
          speechBubble: 'Làm ly trà đá 5 ngàn cháu ơi!'
        },
        {
          id: 'npc_citizen_3',
          name: 'Hoàng (Shipper Công Nghệ)',
          x: 580,
          y: 430,
          direction: 'LEFT',
          animationState: 'WALK',
          roleType: 'CITIZEN',
          outfitColor: '#16a34a',
          speechBubble: 'Đơn giao tòa Bitexco'
        }
      );
    }

    // 3. Lan Anh ở quán Cà Phê hoặc Biệt thự
    if (this.currentSceneId === 'CAFE') {
      list.push({
        id: 'npc_lan_anh',
        name: 'Lan Anh (Người Yêu)',
        x: 480,
        y: 120,
        direction: 'DOWN',
        animationState: 'HAPPY',
        roleType: 'LAN_ANH',
        gender: 'FEMALE'
      });
    }

    // 4. Bố Lan Anh ở Biệt thự
    if (this.currentSceneId === 'VILLA') {
      list.push({
        id: 'npc_father',
        name: 'Ông Vinh (Chủ Tịch)',
        x: 380,
        y: 120,
        direction: 'DOWN',
        animationState: 'IDLE',
        roleType: 'FATHER',
        gender: 'MALE'
      });
    }

    return list;
  }

  // Xuất trạng thái để lưu
  public exportState(slot: number): GameSaveState {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      saveSlot: slot,
      gamePhase: this.gamePhase,
      day: this.timeManager.day,
      month: this.timeManager.month,
      year: this.timeManager.year,
      hour: this.timeManager.hour,
      minute: this.timeManager.minute,
      weather: this.timeManager.weather,
      companyName: this.companyName,
      isRegistered: this.isRegistered,
      taxCode: this.taxCode,
      playerStats: { ...this.playerStats },
      currentOfficeId: this.currentOfficeId,
      furniture: [...this.furniture],
      employees: [...this.employees],
      activeProjects: [...this.activeProjects],
      completedProjectsCount: this.completedProjectsCount,
      cashHistory: [...this.cashHistory],
      financialStatements: [...this.financialStatements],
      loans: [...this.loans],
      romance: { ...this.romance },
      father: { ...this.father },
      legal: { ...this.legal },
      currentScene: this.currentSceneId,
      playerPos: { ...this.playerController.pos },
      playerDir: this.playerController.dir,
      decisionLog: [...this.decisionLog]
    };
  }

  // Tải trạng thái
  public loadState(save: GameSaveState) {
    this.gamePhase = save.gamePhase;
    this.timeManager.day = save.day;
    this.timeManager.month = save.month;
    this.timeManager.year = save.year;
    this.timeManager.hour = save.hour;
    this.timeManager.minute = save.minute;
    this.timeManager.weather = save.weather;

    this.companyName = save.companyName;
    this.isRegistered = save.isRegistered;
    this.taxCode = save.taxCode;
    this.playerStats = { ...save.playerStats };
    this.currentOfficeId = save.currentOfficeId;
    this.furniture = [...save.furniture];
    this.employees = [...save.employees];
    this.activeProjects = [...save.activeProjects];
    this.completedProjectsCount = save.completedProjectsCount;
    this.cashHistory = [...save.cashHistory];
    this.financialStatements = [...save.financialStatements];
    this.loans = [...save.loans];
    this.romance = { ...save.romance };
    this.father = { ...save.father };
    this.legal = { ...save.legal };
    this.decisionLog = [...save.decisionLog];

    this.switchScene(save.currentScene, save.playerPos);
    this.playerController.dir = save.playerDir;

    soundManager.playSuccess();
    this.notify();
  }
}
