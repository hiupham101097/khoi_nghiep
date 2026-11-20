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
  EndingData,
  EnterpriseStageId,
  SprintStrategy,
  CollectivePetition,
  FloatingText,
  CharacterDirection
} from '../../types';
import { TimeManager } from './TimeManager';
import { PlayerController } from '../world/PlayerController';
import { WORLD_MAPS, MapSceneConfig, InteractiveZone } from '../world/WorldData';
import { AVAILABLE_OFFICES, CATALOG_FURNITURE, ENTERPRISE_STAGES, CompanyGrowthEngine } from '../economy/CompanyManager';
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

  public currentSceneId: 'CITY' | 'ROOM' | 'OFFICE' | 'CEO_OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT' = 'VILLA'; // Bắt đầu tại Biệt thự cuộc gặp 500 triệu
  public currentScene: MapSceneConfig = WORLD_MAPS.VILLA;

  // Trạng thái công ty & nhân sự
  public companyName: string = 'NextGen Solutions';
  public isRegistered: boolean = false;
  public taxCode: string = '0109988776';
  public enterpriseStage: EnterpriseStageId = 'STAGE_1_BOOTSTRAP';
  public sprintStrategy: SprintStrategy = 'BALANCED';
  public activePetition: CollectivePetition | null = null;
  public floatingTexts: FloatingText[] = [];
  public hasPlayedStandupSoundToday: boolean = false;
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
  public activeDialog: {
    title?: string;
    message: string;
    speaker: 'FATHER' | 'LAN_ANH' | 'EMPLOYEE' | 'BANKER' | 'SECURITY' | 'FREELANCER' | 'SYSTEM' | 'CEO';
    choices?: { text: string; action: () => void }[];
  } | null = null;
  public openDashboardTab: 'OVERVIEW' | 'HR' | 'FINANCE' | 'PROJECTS' | 'OFFICE' | 'LEGAL' | null = null;
  public isRecruitModalOpen: boolean = false;
  public isProjectTenderOpen: boolean = false;
  public isOfficeModalOpen: boolean = false;
  public isBankModalOpen: boolean = false;
  public isSaveMenuOpen: boolean = false;
  public selectedEmployeeFor1on1: EmployeeAIEntity | null = null;
  private aiDecisionTimer: number = 0;
  private workSprintTimer: number = 0;

  // Listeners cập nhật UI React
  private changeListeners: (() => void)[] = [];

  constructor() {
    this.timeManager = new TimeManager();
    this.playerController = new PlayerController({ x: 380, y: 350 });
    this.setupTimeHandlers();
    this.initStarterTeamAndProjects();
  }

  public showDialog(
    message: string,
    speaker: 'FATHER' | 'LAN_ANH' | 'EMPLOYEE' | 'BANKER' | 'SECURITY' | 'FREELANCER' | 'SYSTEM' | 'CEO' = 'SYSTEM',
    title?: string,
    choices?: { text: string; action: () => void }[]
  ) {
    this.activeDialog = { message, speaker, title, choices };
    soundManager.playClick();
    this.notify();
  }

  public closeDialog() {
    this.activeDialog = null;
    this.notify();
  }

  public initStarterTeamAndProjects() {
    if (this.employees.length === 0) {
      const e1: EmployeeAIEntity = {
        id: 'emp_starter_tuan',
        name: 'Minh Tuấn',
        role: 'FRONTEND',
        gender: 'MALE',
        age: 23,
        avatarSeed: 101,
        level: 'JUNIOR',
        experienceYears: 2,
        personality: 'HARDWORKING',
        speed: 78,
        quality: 75,
        bugRate: 5,
        skillLevels: { frontend: 75, backend: 35, design: 40, testing: 50, devops: 30 },
        currentSalary: 12000000,
        salary: 12000000,
        expectedSalary: 14000000,
        salaryExpectation: 14000000,
        health: 95,
        happiness: 85,
        morale: 85,
        energy: 90,
        stress: 15,
        resentment: 5,
        frustration: 5,
        loyalty: 80,
        ambition: 65,
        ceoTrust: 75,
        trustInCEO: 75,
        currentState: 'WORK',
        behaviorState: 'WORKING',
        currentPos: { x: 150, y: 230 },
        targetPos: { x: 150, y: 230 },
        speechBubble: 'Đang code giao diện React Native!',
        memories: [],
        memoryLog: [],
        isProbation: false,
        probationDaysLeft: 0,
        isStriking: false,
        assignedProjectId: 'proj_starter_mvp',
        deskIndex: 0,
        hasGivenNotice: false,
        daysUntilQuit: 0,
        currentTask: {
          projectId: 'proj_starter_mvp',
          taskType: 'CODING',
          description: 'Lập trình tính năng giỏ hàng & thanh toán',
          progress: 35,
          efficiencyMultiplier: 1.0
        },
        colleagueRelations: {},
        relationships: {}
      };

      const e2: EmployeeAIEntity = {
        id: 'emp_starter_vy',
        name: 'Hà Vy',
        role: 'DESIGNER',
        gender: 'FEMALE',
        age: 22,
        avatarSeed: 102,
        level: 'JUNIOR',
        experienceYears: 1,
        personality: 'CREATIVE',
        speed: 82,
        quality: 85,
        bugRate: 3,
        skillLevels: { frontend: 30, backend: 15, design: 85, testing: 45, devops: 20 },
        currentSalary: 11000000,
        salary: 11000000,
        expectedSalary: 13000000,
        salaryExpectation: 13000000,
        health: 95,
        happiness: 90,
        morale: 90,
        energy: 95,
        stress: 10,
        resentment: 0,
        frustration: 0,
        loyalty: 85,
        ambition: 70,
        ceoTrust: 80,
        trustInCEO: 80,
        currentState: 'WORK',
        behaviorState: 'WORKING',
        currentPos: { x: 470, y: 230 },
        targetPos: { x: 470, y: 230 },
        speechBubble: 'UI Figma mới nhìn mượt lắm sếp ơi ✨',
        memories: [],
        memoryLog: [],
        isProbation: false,
        probationDaysLeft: 0,
        isStriking: false,
        assignedProjectId: 'proj_starter_mvp',
        deskIndex: 1,
        hasGivenNotice: false,
        daysUntilQuit: 0,
        currentTask: {
          projectId: 'proj_starter_mvp',
          taskType: 'UI_DESIGN',
          description: 'Thiết kế giao diện Dark Mode & Mobile Responsive',
          progress: 50,
          efficiencyMultiplier: 1.0
        },
        colleagueRelations: {},
        relationships: {}
      };

      const e3: EmployeeAIEntity = {
        id: 'emp_starter_long',
        name: 'Bảo Long',
        role: 'BACKEND',
        gender: 'MALE',
        age: 25,
        avatarSeed: 103,
        level: 'MID',
        experienceYears: 3,
        personality: 'AMBITIOUS',
        speed: 85,
        quality: 80,
        bugRate: 4,
        skillLevels: { frontend: 40, backend: 85, design: 20, testing: 65, devops: 60 },
        currentSalary: 16000000,
        salary: 16000000,
        expectedSalary: 18000000,
        salaryExpectation: 18000000,
        health: 90,
        happiness: 78,
        morale: 78,
        energy: 85,
        stress: 20,
        resentment: 10,
        frustration: 10,
        loyalty: 75,
        ambition: 85,
        ceoTrust: 70,
        trustInCEO: 70,
        currentState: 'WORK',
        behaviorState: 'WORKING',
        currentPos: { x: 270, y: 370 },
        targetPos: { x: 270, y: 370 },
        speechBubble: 'API Node.js + PostgreSQL đã xong 🚀',
        memories: [],
        memoryLog: [],
        isProbation: false,
        probationDaysLeft: 0,
        isStriking: false,
        assignedProjectId: 'proj_starter_mvp',
        deskIndex: 2,
        hasGivenNotice: false,
        daysUntilQuit: 0,
        currentTask: {
          projectId: 'proj_starter_mvp',
          taskType: 'CODING',
          description: 'Tối ưu hóa Database Query & Caching Redis',
          progress: 30,
          efficiencyMultiplier: 1.0
        },
        colleagueRelations: {},
        relationships: {}
      };

      EmployeeAIEngine.initAI2Fields(e1);
      EmployeeAIEngine.initAI2Fields(e2);
      EmployeeAIEngine.initAI2Fields(e3);
      this.employees = [e1, e2, e3];
    }

    if (this.activeProjects.length === 0) {
      this.activeProjects = [
        {
          id: 'proj_starter_mvp',
          name: 'Ứng Dụng E-Commerce Shopee Clone',
          clientName: 'Tập Đoàn Bán Lẻ VinTech',
          clientType: 'STARTUP',
          clientLogo: '🛍️',
          contractValue: 65000000,
          depositReceived: true,
          totalWorkUnits: 100,
          completedWorkUnits: 25,
          currentBugs: 1,
          durationDays: 20,
          daysRemaining: 18,
          penaltyPerDay: 1500000,
          qualityRequirement: 70,
          assignedEmployeeIds: ['emp_starter_tuan', 'emp_starter_vy', 'emp_starter_long'],
          status: 'IN_PROGRESS',
          description: 'Xây dựng ứng dụng sàn thương mại điện tử đa nền tảng MVP'
        }
      ];
    }
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

  public addFloatingText(text: string, x: number, y: number, color: string = '#22c55e') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      life: 1.8
    });
  }

  // VÒNG LẶP CHÍNH CẬP NHẬT THEO FRAME
  public update(deltaTime: number) {
    if (this.gamePhase === 'PLAYING') {
      // 1. Cập nhật thời gian
      this.timeManager.update(deltaTime);

      // 1b. Cập nhật floating texts bay lên và mờ dần
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life -= deltaTime;
        ft.y -= 25 * deltaTime;
        ft.alpha = Math.max(0, ft.life / 1.8);
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }

      // 2. Cập nhật di chuyển & va chạm người chơi
      this.playerController.update(deltaTime, this.currentScene, (zone) => {
        this.handleZoneInteraction(zone);
      });

      // 3. Cập nhật chuyển động tự hành & suy nghĩ thoại cho nhân viên AI trong văn phòng
      if (this.currentSceneId === 'OFFICE') {
        const isWorkHour = this.timeManager.isWorkHour();
        const isLunch = this.timeManager.isLunchHour();
        const isOT = this.isOvertimeActive && this.timeManager.isOvertimeHour();
        const isDailyStandup = this.timeManager.hour === 9 && this.timeManager.minute <= 30;

        // Nhịp mô phỏng AI (AI Decision Tick mỗi 1.2s - không tính lại ở mỗi frame 60fps)
        this.aiDecisionTimer += deltaTime;
        if (this.aiDecisionTimer >= 1.2) {
          this.aiDecisionTimer = 0;
          this.employees.forEach((emp) => {
            const { crisisAlert } = EmployeeAIEngine.evaluateBehaviorState(
              emp,
              this.timeManager,
              this.isOvertimeActive,
              isDailyStandup,
              this.activeProjects,
              this.timeManager.day
            );
            if (crisisAlert && crisisAlert.type === 'RAISE_REQUEST') {
              this.addFloatingText(`💬 ${emp.name} xin gặp CEO`, 380, 200, '#fbbf24');
            }
          });
        }

        // Chuông báo họp Standup 09:00 sáng
        if (isDailyStandup && !this.hasPlayedStandupSoundToday) {
          this.hasPlayedStandupSoundToday = true;
          soundManager.playStandupBell();
          this.addFloatingText('🔔 HỌP DAILY STANDUP 09:00', 380, 70, '#38bdf8');
        }

        const whiteboardPos = { x: 380, y: 55 };
        const ceoDeskPos = { x: 160, y: 140 };
        const coffeePos = { x: 620, y: 90 };
        const loungePos = { x: 500, y: 370 };
        const exitPos = { x: 380, y: 480 };

        this.employees.forEach((emp, idx) => {
          const deskPos = this.currentScene.deskPositions[idx % this.currentScene.deskPositions.length] || { x: 200, y: 250 };
          EmployeeAIEngine.updateMovementAndDialogue(
            emp,
            deltaTime,
            deskPos,
            whiteboardPos,
            ceoDeskPos,
            coffeePos,
            loungePos,
            exitPos,
            isWorkHour,
            isLunch,
            isOT,
            isDailyStandup
          );
        });

        // Mô phỏng tiến độ dự án thời gian thực (Micro-Sprint) trong giờ làm việc
        if (isWorkHour || isOT) {
          this.workSprintTimer += deltaTime;
          if (this.workSprintTimer >= 2.5) {
            this.workSprintTimer = 0;
            this.simulateMicroSprint();
          }
        }
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
        this.openDashboardTab = 'PROJECTS';
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
        this.employees.forEach((emp) => {
          emp.morale = Math.min(100, (emp.morale ?? 70) + 5);
          if (emp.happiness !== undefined) emp.happiness = emp.morale;
        });
        this.addFloatingText('+20 Năng Lượng ☕', this.playerController.pos.x, this.playerController.pos.y - 25, '#fbbf24');
        soundManager.playCashEarned();
        this.notify();
        break;

      case 'TALK_NPC':
        if (this.currentSceneId === 'VILLA') {
          this.talkWithFather();
        } else if (this.currentSceneId === 'CAFE') {
          this.dateWithLanAnh();
        } else if (this.currentSceneId === 'CITY') {
          this.talkWithSecurityGuard();
        }
        break;

      default:
        break;
    }
  }

  // Mô phỏng tiến độ dự án thời gian thực (Micro-Sprint)
  private simulateMicroSprint() {
    const active = this.activeProjects.find((p) => p.status === 'IN_PROGRESS' || p.status === 'OVERDUE');
    if (!active) return;

    const workingEmployees = this.employees.filter((e) => e.currentState === 'WORK' && !e.isStriking);
    if (workingEmployees.length === 0) return;

    let workDelta = 0;
    workingEmployees.forEach((emp) => {
      const spd = (emp.speed || 40) / 40;
      const qlt = (emp.quality || 50) / 100;
      workDelta += spd * qlt * 1.6;
    });

    active.completedWorkUnits = Math.min(active.totalWorkUnits, active.completedWorkUnits + workDelta);

    // Hiệu ứng floating text ngẫu nhiên trên bàn làm việc
    if (Math.random() < 0.4) {
      const luckyEmp = workingEmployees[Math.floor(Math.random() * workingEmployees.length)];
      const deskIdx = this.employees.indexOf(luckyEmp);
      const deskPos = this.currentScene.deskPositions[deskIdx % this.currentScene.deskPositions.length] || { x: 200, y: 250 };
      const microMessages = [
        '+Code ⚡',
        'Commit 🚀',
        '🎨 UI Done',
        'Fix Bug 🐛',
        'PR Merged 💻',
        'Unit Test Pass ✅'
      ];
      const msg = microMessages[Math.floor(Math.random() * microMessages.length)];
      this.addFloatingText(msg, deskPos.x, deskPos.y - 25, '#38bdf8');
    }

    // Nếu dự án đã đạt 100% khối lượng: tự động bàn giao và thu tiền
    if (active.completedWorkUnits >= active.totalWorkUnits && active.status !== 'COMPLETED') {
      const { payout, reputationGain } = ProjectManager.deliverProject(active);
      this.playerStats.cash += payout;
      this.monthlyRevenueAccumulated += payout;
      this.playerStats.reputation = Math.min(100, this.playerStats.reputation + reputationGain);
      this.completedProjectsCount += 1;
      this.addFloatingText(`🎉 HOÀN THÀNH: +${payout.toLocaleString('vi-VN')}đ`, 380, 220, '#22c55e');
      soundManager.playCashEarned();
      this.decisionLog.push(`Hoàn thành & Bàn giao dự án: ${active.name}. Thu về ${payout.toLocaleString('vi-VN')} VNĐ.`);
      
      this.showDialog(
        `Toàn đội ngũ vừa hoàn thành xuất sắc dự án "${active.name}"! Khách hàng đã nghiệm thu và thanh toán toàn bộ hợp đồng trị giá ${payout.toLocaleString('vi-VN')} VNĐ! Uy tín công ty tăng +${reputationGain} điểm!`,
        'EMPLOYEE',
        'DỰ ÁN XUẤT XƯỞNG THÀNH CÔNG! 🚀'
      );
    }
  }

  // Đối thoại với Bác Ba (Bảo Vệ StartUp Tower)
  public talkWithSecurityGuard() {
    soundManager.playClick();
    this.showDialog(
      'Chào CEO trẻ! Tòa StartUp Tower này bao năm qua bác thấy nhiều bạn trẻ khởi nghiệp rồi. Ai kiên trì nhận hợp đồng phần mềm, trả lương nhân viên đúng hạn, không đầu cơ liều lĩnh thì sớm muộn cũng thành kỳ lân! Khi nào công ty cần vốn nhớ sang ngân hàng V-Bank đối diện phố nhé!',
      'SECURITY',
      'Bác Ba (Bảo Vệ Tòa Nhà StartUp Tower)'
    );
  }

  // Họp toàn thể công ty (All-Hands Standup Meeting)
  public callAllHandsMeeting() {
    soundManager.playStandupBell();
    this.employees.forEach((emp) => {
      emp.morale = Math.min(100, (emp.morale ?? 70) + 15);
      emp.frustration = Math.max(0, (emp.frustration ?? 0) - 15);
      if (emp.happiness !== undefined) emp.happiness = emp.morale;
      emp.speechBubble = 'Quyết tâm bám sát mục tiêu sprint!';
      emp.speechTimer = 5;
    });
    this.addFloatingText('🔔 HỌP TOÀN THỂ: +15 Tinh Thần Đội Ngũ!', 380, 180, '#38bdf8');
    this.decisionLog.push('CEO triệu tập họp toàn thể công ty: Đồng lòng bứt phá tiến độ sprint.');
    this.notify();
  }

  // Chuyển đổi cảnh (Vào/Ra các tòa nhà)
  public switchScene(targetSceneId: 'CITY' | 'ROOM' | 'OFFICE' | 'CEO_OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT', targetSpawn?: { x: number; y: number }) {
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
    this.hasPlayedStandupSoundToday = false;
    const hasCoffee = this.furniture.some((f) => f.id === 'item_coffee_espresso' && f.purchased);
    const hasErgo = this.furniture.some((f) => f.id === 'item_chair_ergo' && f.purchased);

    // 1. Cập nhật chu kỳ ngày tâm lý, quan hệ & khủng hoảng AI 2.0
    const crisisAlerts = EmployeeAIEngine.updateDailyCycle(
      this.employees,
      this.activeProjects,
      this.isOvertimeActive,
      day
    );
    crisisAlerts.forEach((alert) => {
      this.decisionLog.push(`⚠️ ${alert.message}`);
    });

    // 1b. Đánh giá thử việc (Probation Period Tracking)
    this.employees.forEach((emp) => {
      if (emp.isProbation && emp.probationDaysLeft) {
        emp.probationDaysLeft -= 1;
        if (emp.probationDaysLeft <= 0) {
          emp.isProbation = false;
          EmployeeAIEngine.addMemory(
            emp,
            'PROMOTED',
            'Hoàn thành xuất sắc 30 ngày thử việc và trở thành nhân sự chính thức!',
            30,
            25,
            day
          );
          this.decisionLog.push(`🎉 ${emp.name} chính thức trở thành nhân viên hợp đồng dài hạn sau kỳ thử việc!`);
          this.addFloatingText(`🎉 CHÍNH THỨC: ${emp.name}`, 380, 210, '#22c55e');
          soundManager.playSuccess();
        }
      }
    });

    // 2. Cập nhật tiến độ các dự án đang chạy theo Chiến lược Sprint hiện hành
    this.activeProjects.forEach((proj) => {
      const assigned = this.employees.filter((e) => proj.assignedEmployeeIds.includes(e.id));
      const { isCompleted } = ProjectManager.updateDailyProjectSprint(proj, assigned, this.sprintStrategy);

      if (isCompleted) {
        const { payout, reputationGain } = ProjectManager.deliverProject(proj);
        this.playerStats.cash += payout;
        this.monthlyRevenueAccumulated += payout;
        this.playerStats.reputation = Math.min(100, this.playerStats.reputation + reputationGain);
        this.completedProjectsCount += 1;
        this.addFloatingText(`+${payout.toLocaleString('vi-VN')}đ`, 380, 220, '#22c55e');
        this.decisionLog.push(`Hoàn thành & Bàn giao dự án: ${proj.name}. Thu về ${payout.toLocaleString('vi-VN')} VNĐ.`);
      }
    });

    // Xóa các dự án đã hoàn thành khỏi danh sách active
    this.activeProjects = this.activeProjects.filter((p) => p.status !== 'COMPLETED');

    // 3. Đánh giá Định giá & Thăng cấp Giai đoạn Doanh nghiệp (Enterprise Stage)
    const valuation = EconomyManager.calculateCompanyValuation(
      this.cashHistory.slice(-6),
      this.employees.length,
      this.playerStats.reputation,
      this.completedProjectsCount
    );

    const newStage = CompanyGrowthEngine.evaluateStage(
      valuation,
      this.completedProjectsCount,
      this.employees.length,
      this.playerStats.reputation,
      this.playerStats.cash
    );
    if (newStage !== this.enterpriseStage) {
      this.enterpriseStage = newStage;
      const stageInfo = ENTERPRISE_STAGES[newStage];
      this.decisionLog.push(`🏆 NÂNG CẤP DOANH NGHIỆP: Đạt ${stageInfo.name} (${stageInfo.title})!`);
      this.addFloatingText(`🏆 LÊN CẤP: ${stageInfo.name}`, 380, 180, '#38bdf8');
      soundManager.playSuccess();
    }

    // 4. Quản lý Đơn kiến nghị tập thể (Collective Petition)
    if (!this.activePetition) {
      const petition = EmployeeAIEngine.checkForCollectivePetition(this.employees, this.isOvertimeActive);
      if (petition) {
        this.activePetition = petition;
        this.decisionLog.push(`⚠️ Khủng hoảng nhân sự: Tập thể nhân viên đệ trình Đơn kiến nghị!`);
        soundManager.playAlert();
      }
    } else if (this.activePetition.status === 'PENDING') {
      this.activePetition.daysRemaining -= 1;
      if (this.activePetition.daysRemaining <= 0) {
        // Quá hạn không giải quyết -> bùng nổ đình công
        this.activePetition.status = 'REJECTED';
        this.employees.forEach((emp) => {
          if (this.activePetition!.signingEmployees.includes(emp.id)) {
            emp.isStriking = true;
            emp.currentState = 'PROTEST';
            emp.speechBubble = 'BÃI CÔNG vì CEO phớt lờ kiến nghị!';
          }
        });
        this.decisionLog.push(`🚨 ĐÌNH CÔNG TẬP THỂ: Đơn kiến nghị quá hạn không được phản hồi!`);
        soundManager.playDramaticChord();
      }
    }

    // 5. Cập nhật quan hệ tình cảm
    RelationshipManager.updateDailyRelationship(this.romance, this.father, day, this.playerStats.reputation, valuation);

    // 6. Kích hoạt sự kiện ngẫu nhiên động
    const event = DynamicEventManager.rollDailyEvent(day, this.decisionLog);
    if (event) {
      this.currentActiveEvent = event;
      soundManager.playAlert();
    }

    // 7. Tự động lưu dữ liệu
    SaveLoadManager.autoSave(this.exportState(0));
    this.notify();
  }

  // Chấp thuận Đơn kiến nghị tập thể
  public acceptPetition() {
    if (!this.activePetition) return;
    const petition = this.activePetition;
    this.employees.forEach((emp) => {
      if (petition.signingEmployees.includes(emp.id)) {
        emp.currentSalary = Math.round(emp.currentSalary * (1 + petition.salaryIncreaseDemandPercent / 100));
        emp.happiness = Math.min(100, emp.happiness + 30);
        emp.ceoTrust = Math.min(100, emp.ceoTrust + 25);
        emp.resentment = Math.max(0, emp.resentment - 40);
        emp.isStriking = false;
        emp.speechBubble = 'Cảm ơn CEO đã lắng nghe tiếng nói anh em!';
        emp.currentState = 'HAPPY';
      }
    });
    if (petition.stopOvertimeDemand) {
      this.isOvertimeActive = false;
    }
    this.decisionLog.push('Đã chấp thuận Đơn kiến nghị: Nâng lương & cải thiện môi trường làm việc.');
    this.addFloatingText('❤️ LÒNG DÂN PHẤN CHẤN (+30 Hạnh Phúc)', 380, 200, '#ec4899');
    this.activePetition = null;
    soundManager.playSuccess();
    this.notify();
  }

  // Thương lượng thỏa hiệp Đơn kiến nghị (Thưởng nóng)
  public compromisePetition() {
    if (!this.activePetition) return;
    const bonusPerPerson = 3000000;
    const totalBonus = bonusPerPerson * this.activePetition.signingEmployees.length;
    if (this.playerStats.cash < totalBonus) {
      this.showDialog(
        `Không đủ tiền mặt để thưởng nóng (Cần tối thiểu ${totalBonus.toLocaleString('vi-VN')} VNĐ)!`,
        'EMPLOYEE',
        'Đại Diện Nhân Sự'
      );
      return;
    }
    this.playerStats.cash -= totalBonus;
    this.employees.forEach((emp) => {
      if (this.activePetition!.signingEmployees.includes(emp.id)) {
        emp.happiness = Math.min(100, emp.happiness + 15);
        emp.resentment = Math.max(10, emp.resentment - 25);
        emp.isStriking = false;
        emp.speechBubble = 'Nhận thưởng nóng và tiếp tục cố gắng.';
      }
    });
    this.decisionLog.push(`Thương lượng thỏa hiệp đơn kiến nghị: Thưởng nóng ${totalBonus.toLocaleString('vi-VN')} VNĐ.`);
    this.addFloatingText(`-${totalBonus.toLocaleString('vi-VN')}đ`, 380, 220, '#ef4444');
    this.activePetition = null;
    soundManager.playCashEarned();
    this.notify();
  }

  // Bác bỏ Đơn kiến nghị tập thể
  public rejectPetition() {
    if (!this.activePetition) return;
    this.employees.forEach((emp) => {
      if (this.activePetition!.signingEmployees.includes(emp.id)) {
        emp.resentment = Math.min(100, emp.resentment + 25);
        emp.ceoTrust = Math.max(0, emp.ceoTrust - 30);
        if (Math.random() < 0.75) {
          emp.isStriking = true;
          emp.currentState = 'PROTEST';
          emp.speechBubble = 'Phản đối CEO bác bỏ kiến nghị!';
        }
      }
    });
    this.decisionLog.push('Bác bỏ Đơn kiến nghị tập thể: Nguy cơ bùng phát làn sóng đình công!');
    this.addFloatingText('⚡ BẤT MÃN TĂNG CAO', 380, 200, '#ef4444');
    this.activePetition = null;
    soundManager.playDramaticChord();
    this.notify();
  }

  // Xử lý quyết toán tài chính cuối tháng
  private handleMonthlyCycle(month: number, year: number) {
    const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === this.currentOfficeId) || null;
    const payroll = EconomyManager.calculateMonthlyPayroll(this.employees);

    // Kiểm tra khả năng chi trả quỹ lương
    if (this.playerStats.cash < payroll && this.employees.length > 0) {
      this.employees.forEach((emp) => {
        EmployeeAIEngine.addMemory(
          emp,
          'UNFAIR_TREATMENT',
          `Bị chậm chi trả lương tháng ${month}!`,
          -30,
          -35,
          this.timeManager.day
        );
      });
      this.decisionLog.push(`🚨 BÁO ĐỘNG: Cạn kiệt dòng tiền, không đủ thanh toán quỹ lương tháng ${month}! Toàn bộ nhân sự bất mãn nghiêm trọng.`);
      this.addFloatingText('🚨 CHẬM LƯƠNG (-35 Trung thành)', 380, 210, '#ef4444');
      soundManager.playDramaticChord();
    }

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
    this.isRegistered = true;
    this.initStarterTeamAndProjects();
    this.switchScene('ROOM', { x: 300, y: 300 }); // Bắt đầu từ phòng trọ
    this.decisionLog.push('Cầm 500 triệu đồng và thách thức Bố Lan Anh: Bắt đầu đế chế khởi nghiệp!');
    soundManager.playSuccess();
    this.showDialog(
      'Bạn đã cầm trong tay 500.000.000 VNĐ từ Bố Lan Anh!\n\nNhiệm vụ đầu tiên: Rời phòng trọ ra ngoài đường phố, đến Tòa Nhà StartUp Tower giữa phố để chỉ đạo đội ngũ phát triển sản phẩm công nghệ!',
      'SYSTEM',
      'Chiến Dịch Khởi Nghiệp Bắt Đầu'
    );
    this.notify();
  }

  // Hẹn hò cùng Lan Anh
  public dateWithLanAnh() {
    if (this.playerStats.cash < 500000) {
      this.showDialog(
        'Bạn không đủ tiền để mời Lan Anh đi hẹn hò (Cần tối thiểu 500.000 VNĐ)! Hãy tập trung hoàn thành dự án kiếm thêm thu nhập nhé.',
        'LAN_ANH',
        'Hoàng Lan Anh'
      );
      return;
    }
    this.playerStats.cash -= 500000;
    const { dialogue } = RelationshipManager.goOnDate(this.romance, this.timeManager.day, 500000);
    this.showDialog(dialogue, 'LAN_ANH', 'Hoàng Lan Anh');
    this.addFloatingText('+20 Yêu Thương ❤️', this.playerController.pos.x, this.playerController.pos.y - 25, '#ec4899');
    soundManager.playSuccess();
    this.notify();
  }

  // Đối thoại với Bố Lan Anh
  public talkWithFather() {
    let msg = `Ông Hoàng Thế Vinh: "Ta đang theo dõi từng bước đi của cậu. Đừng tưởng cầm 500 triệu là đã thành doanh nhân. Nếu thất bại, hãy tự giác rời xa con gái ta mãi mãi!"`;
    if (this.father.evaluation === 'PROUD') {
      msg = `Ông Hoàng Thế Vinh: "Khá lắm chàng trai! Ta quả không nhìn lầm bản lĩnh của cậu. Hai đứa tính khi nào làm đám cưới? Tập đoàn Vinh Phát sẽ trao tặng 100 tỷ đồng cổ phần làm sính lễ!"`;
    } else if (this.father.evaluation === 'IMPRESSED') {
      msg = `Ông Hoàng Thế Vinh: "Doanh nghiệp của cậu tăng trưởng khá ấn tượng đấy. Tiếp tục phát huy, đừng để vấp ngã trên thương trường khốc liệt."`;
    }
    this.showDialog(msg, 'FATHER', 'Ông Hoàng Thế Vinh (Chủ Tịch)');
    soundManager.playClick();
  }

  // Lấy danh sách thực thể để Renderer vẽ lên Canvas (Chuẩn 8 Design Sheets)
  public getRenderableEntities(): RenderableEntity[] {
    const list: RenderableEntity[] = [];

    // 1. Người chơi (CEO Khởi Nghiệp - Suit Navy, Crown 👑)
    list.push({
      id: 'player',
      name: `${this.playerStats.name} (CEO)`,
      x: this.playerController.pos.x,
      y: this.playerController.pos.y,
      direction: this.playerController.dir,
      animationState: this.playerController.state,
      roleType: 'PLAYER',
      jobRole: 'CEO',
      statusIcon: '👑',
      gender: 'MALE',
      outfitColor: '#2e3a59'
    });

    // 2. Nhân viên trong văn phòng (Chuẩn hóa vai trò & status thought bubble)
    if (this.currentSceneId === 'OFFICE') {
      this.employees.forEach((emp, idx) => {
        const deskPos = this.currentScene.deskPositions[idx % this.currentScene.deskPositions.length] || { x: 200, y: 250 };
        const posX = emp.currentPos ? emp.currentPos.x : deskPos.x;
        const posY = emp.currentPos ? emp.currentPos.y : deskPos.y;

        // Tính toán hướng nhìn chuẩn xác theo chuyển động
        let empDir: CharacterDirection = 'DOWN';
        if (emp.targetPos && emp.currentPos) {
          const dx = emp.targetPos.x - emp.currentPos.x;
          const dy = emp.targetPos.y - emp.currentPos.y;
          if (Math.hypot(dx, dy) > 2) {
            empDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP');
          }
        }

        let jobRole: 'IT' | 'DESIGNER' | 'SALES' | 'LEAD' | 'ADMIN' = 'IT';
        let statusIcon = '</>';

        if (emp.role === 'FRONTEND' || emp.role === 'BACKEND' || emp.role === 'FULLSTACK') {
          jobRole = 'IT';
          statusIcon = '</>';
        } else if (emp.role === 'DESIGNER') {
          jobRole = 'DESIGNER';
          statusIcon = '🎨';
        } else if (emp.role === 'PRODUCT_MANAGER') {
          jobRole = 'LEAD';
          statusIcon = '👥';
        } else {
          // TESTER / ADMIN
          jobRole = 'ADMIN';
          statusIcon = '📋';
        }

        list.push({
          id: emp.id,
          name: emp.name,
          x: posX,
          y: posY,
          direction: empDir,
          animationState: emp.currentState,
          roleType: 'EMPLOYEE',
          jobRole,
          statusIcon,
          gender: emp.gender,
          hasGlasses: emp.role === 'BACKEND' || emp.role === 'TESTER' || jobRole === 'IT',
          speechBubble: emp.speechBubble
        });
      });
    }

    // 2b. Người đi đường, Bảo vệ tòa nhà & Cư dân đô thị (Khi ở ngoài phố)
    if (this.currentSceneId === 'CITY') {
      list.push(
        {
          id: 'npc_security_guard',
          name: 'Bác Ba (Bảo Vệ)',
          x: 440,
          y: 240,
          direction: 'DOWN',
          animationState: 'IDLE',
          roleType: 'CITIZEN',
          jobRole: 'SECURITY',
          statusIcon: '🛡️',
          gender: 'MALE',
          speechBubble: 'StartUp Tower xin chào quý khách!'
        },
        {
          id: 'npc_citizen_1',
          name: 'Anh Nam (Dev Freelance)',
          x: 230,
          y: 490,
          direction: 'RIGHT',
          animationState: 'WORK',
          roleType: 'CITIZEN',
          jobRole: 'IT',
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
          jobRole: 'ADMIN',
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
          jobRole: 'SALES',
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
        jobRole: 'LAN_ANH',
        statusIcon: '💖',
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
        jobRole: 'FATHER',
        statusIcon: '🏢',
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
      enterpriseStage: this.enterpriseStage,
      sprintStrategy: this.sprintStrategy,
      activePetition: this.activePetition ? { ...this.activePetition } : null,
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
    this.enterpriseStage = save.enterpriseStage || 'STAGE_1_BOOTSTRAP';
    this.sprintStrategy = save.sprintStrategy || 'BALANCED';
    this.activePetition = save.activePetition || null;
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
