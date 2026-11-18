// ============================================================================
// CEO EMPIRE: EMPLOYEE AI 2.0 & PSYCHOLOGY ENGINE (Utility AI & Behavior Tree)
// ============================================================================

import {
  EmployeeAIEntity,
  CandidateEntity,
  CharacterAnimationState,
  ProjectContract,
  CollectivePetition,
  EmployeeBehaviorState,
  PersonalityType,
  MemoryType,
  EmployeeMemoryItem,
  EmployeeSkillLevels,
  EmployeeRelationshipItem,
  RecruitmentTier,
  SkillLevel,
  SprintStrategy
} from '../../types';
import { TimeManager } from '../core/TimeManager';
import { soundManager } from '../core/SoundManager';

export interface CrisisAlert {
  type: 'WARNING' | 'PETITION' | 'STRIKE' | 'RESIGNATION' | 'RAISE_REQUEST';
  employeeId: string;
  employeeName: string;
  message: string;
}

export class EmployeeAIEngine {
  // --------------------------------------------------------------------------
  // 1. KHỞI TẠO & ĐỒNG BỘ DỮ LIỆU CHUẨN HÓA (DATA NORMALIZATION)
  // --------------------------------------------------------------------------
  public static initAI2Fields(emp: EmployeeAIEntity): void {
    // Tuổi mặc định theo cấp bậc
    if (!emp.age) {
      emp.age = emp.level === 'INTERN' ? 21 : emp.level === 'JUNIOR' ? 23 : emp.level === 'MID' ? 26 : emp.level === 'SENIOR' ? 30 : 33;
    }

    // Tính cách
    if (!emp.personality) {
      const personalities: PersonalityType[] = ['HARDWORKING', 'AMBITIOUS', 'PRAGMATIC', 'CREATIVE', 'SOCIAL', 'LAID_BACK'];
      emp.personality = personalities[Math.abs(emp.avatarSeed || 1) % personalities.length];
    }

    // Thể lực & Sức khỏe
    if (emp.health === undefined) emp.health = 95;
    if (emp.energy === undefined) emp.energy = 100;

    // Đồng bộ tinh thần (Morale <-> Happiness)
    if (emp.morale === undefined) emp.morale = emp.happiness ?? 80;
    emp.happiness = emp.morale;

    // Đồng bộ bức xúc (Frustration <-> Resentment)
    if (emp.frustration === undefined) emp.frustration = emp.resentment ?? 5;
    emp.resentment = emp.frustration;

    // Đồng bộ niềm tin CEO (TrustInCEO <-> CeoTrust)
    if (emp.trustInCEO === undefined) emp.trustInCEO = emp.ceoTrust ?? 75;
    emp.ceoTrust = emp.trustInCEO;

    // Độ trung thành & Tham vọng
    if (emp.loyalty === undefined) emp.loyalty = 75;
    if (emp.ambition === undefined) emp.ambition = emp.personality === 'AMBITIOUS' ? 85 : 60;

    // Đồng bộ mức lương
    if (emp.salary === undefined) emp.salary = emp.currentSalary ?? 15000000;
    emp.currentSalary = emp.salary;
    if (emp.salaryExpectation === undefined) emp.salaryExpectation = emp.expectedSalary ?? emp.salary;
    emp.expectedSalary = emp.salaryExpectation;

    // Kỹ năng chuyên sâu (Skill Levels Radar)
    if (!emp.skillLevels) {
      const baseMain = emp.quality ?? 75;
      const baseSub = Math.max(30, Math.floor(baseMain * 0.65));

      emp.skillLevels = {
        frontend: emp.role === 'FRONTEND' || emp.role === 'FULLSTACK' ? baseMain : baseSub,
        backend: emp.role === 'BACKEND' || emp.role === 'FULLSTACK' ? baseMain : baseSub,
        design: emp.role === 'DESIGNER' ? baseMain : Math.floor(baseSub * 0.8),
        testing: emp.role === 'TESTER' ? baseMain : Math.floor(baseSub * 0.9),
        devops: emp.role === 'PRODUCT_MANAGER' || emp.role === 'BACKEND' ? baseMain : Math.floor(baseSub * 0.7)
      };
    }

    // Mạng lưới quan hệ xã hội
    if (!emp.relationships) {
      emp.relationships = {};
    }
    if (!emp.colleagueRelations) {
      emp.colleagueRelations = {};
    }

    // Hệ thống ký ức (Memory System)
    if (!emp.memories) {
      emp.memories = [];
    }
    if (!emp.memoryLog) {
      emp.memoryLog = [];
    }

    // Trạng thái hành vi & Nhiệm vụ hiện tại
    if (!emp.behaviorState) {
      emp.behaviorState = 'IDLE';
    }
    if (!emp.currentTask) {
      emp.currentTask = {
        projectId: emp.assignedProjectId ?? null,
        taskType: 'IDLE',
        description: 'Chờ phân công công việc',
        progress: 0,
        efficiencyMultiplier: 1.0
      };
    }

    // Mục tiêu cá nhân (Personal Goals)
    if (!emp.personalGoal) {
      const goalPool: Array<{ type: NonNullable<EmployeeAIEntity['personalGoal']>['type']; title: string }> = [
        { type: 'PROMOTION_LEAD', title: 'Thăng tiến lên Tech Lead / Trưởng nhóm' },
        { type: 'SAVING_MONEY', title: 'Tích lũy quỹ cá nhân 50 triệu đồng' },
        { type: 'LEARN_NEW_TECH', title: 'Làm chủ kiến trúc Microservices & AI' },
        { type: 'WORK_LIFE_BALANCE', title: 'Cân bằng cuộc sống, tan làm đúng giờ' },
        { type: 'EARN_ESOP', title: 'Được trao quyền sở hữu cổ phần ESOP công ty' }
      ];
      const selected = goalPool[Math.abs(emp.avatarSeed || 2) % goalPool.length];
      emp.personalGoal = {
        type: selected.type,
        title: selected.title,
        progress: 15 + Math.floor(Math.random() * 20)
      };
    }

    // Thống kê cống hiến
    if (emp.totalLinesOfCodeProduced === undefined) emp.totalLinesOfCodeProduced = 0;
    if (emp.totalBugsProduced === undefined) emp.totalBugsProduced = 0;
    if (emp.totalBugsFixed === undefined) emp.totalBugsFixed = 0;
    if (emp.isProbation === undefined) emp.isProbation = false;
    if (emp.probationDaysLeft === undefined) emp.probationDaysLeft = 0;
  }

  // --------------------------------------------------------------------------
  // 2. HỆ THỐNG TRÍ NHỚ (MEMORY SYSTEM)
  // --------------------------------------------------------------------------
  public static addMemory(
    emp: EmployeeAIEntity,
    type: MemoryType,
    title: string,
    impactMorale: number,
    impactLoyalty: number,
    day: number
  ): void {
    this.initAI2Fields(emp);

    const memoryItem: EmployeeMemoryItem = {
      id: `mem_${Date.now()}_${Math.random()}`,
      type,
      title,
      impactMorale,
      impactLoyalty,
      timestamp: Date.now(),
      day
    };

    emp.memories.unshift(memoryItem);
    if (emp.memories.length > 25) emp.memories.pop(); // Giữ tối đa 25 ký ức gần nhất

    // Cập nhật memoryLog tương thích ngược
    emp.memoryLog.unshift(`[Ngày ${day}] ${title}`);
    if (emp.memoryLog.length > 25) emp.memoryLog.pop();

    // Tác động trực tiếp đến tâm lý
    emp.morale = Math.max(0, Math.min(100, emp.morale + impactMorale));
    emp.happiness = emp.morale;

    emp.loyalty = Math.max(0, Math.min(100, emp.loyalty + impactLoyalty));

    if (impactMorale < 0) {
      emp.frustration = Math.min(100, emp.frustration + Math.abs(impactMorale) * 0.7);
      emp.resentment = emp.frustration;
    } else {
      emp.frustration = Math.max(0, emp.frustration - impactMorale * 0.8);
      emp.resentment = emp.frustration;
    }
  }

  // --------------------------------------------------------------------------
  // 3. UTILITY AI & CHỌN TRẠNG THÁI HÀNH VI (BEHAVIOR SELECTION)
  // --------------------------------------------------------------------------
  public static evaluateBehaviorState(
    emp: EmployeeAIEntity,
    timeManager: TimeManager,
    isCompanyOvertimeActive: boolean,
    isDailyStandup: boolean,
    activeProjects: ProjectContract[],
    day: number
  ): { state: EmployeeBehaviorState; crisisAlert?: CrisisAlert } {
    this.initAI2Fields(emp);

    let crisisAlert: CrisisAlert | undefined;

    // 1. Trường hợp đặc biệt ưu tiên tuyệt đối
    if (emp.isStriking) {
      emp.behaviorState = 'PROTESTING';
      emp.currentState = 'PROTEST';
      return { state: 'PROTESTING' };
    }

    if (emp.hasGivenNotice) {
      emp.behaviorState = 'RESIGNING';
      emp.currentState = 'SAD';
      emp.daysUntilQuit = Math.max(0, emp.daysUntilQuit - 0.05);
      return { state: 'RESIGNING' };
    }

    if (emp.health < 30) {
      emp.behaviorState = 'SICK_LEAVE';
      emp.currentState = 'TIRED';
      emp.speechBubble = 'Em bị ốm, xin phép sếp cho nghỉ ngơi...';
      emp.speechTimer = 4;
      return { state: 'SICK_LEAVE' };
    }

    const hour = timeManager.hour;
    const isWorkHour = timeManager.isWorkHour();
    const isLunch = timeManager.isLunchHour();
    const isOT = isCompanyOvertimeActive && timeManager.isOvertimeHour();

    // 2. Đi làm buổi sáng (07:30 - 08:30)
    if (hour >= 7 && hour < 8) {
      emp.behaviorState = 'GOING_TO_WORK';
      emp.currentState = 'WALK';
      return { state: 'GOING_TO_WORK' };
    }

    // 3. Họp Daily Standup trước bảng Kanban (09:00 - 09:30)
    if (isDailyStandup) {
      emp.behaviorState = 'MEETING';
      emp.currentState = 'TALK';
      emp.currentTask = {
        projectId: null,
        taskType: 'STANDUP',
        description: 'Họp Daily Standup bàn giao task',
        progress: 100,
        efficiencyMultiplier: 1.0
      };
      return { state: 'MEETING' };
    }

    // 4. Giờ trưa & Nghỉ ngơi (12:00 - 13:30)
    if (isLunch) {
      // Quyết định nghỉ ngơi hay tán gẫu
      if (emp.personality === 'SOCIAL' || Math.random() < 0.6) {
        emp.behaviorState = 'TALKING';
        emp.currentState = 'TALK';
      } else {
        emp.behaviorState = 'BREAK';
        emp.currentState = 'IDLE';
      }
      return { state: emp.behaviorState };
    }

    // 5. Trong giờ làm việc hoặc tăng ca OT
    if (isWorkHour || isOT) {
      // Kiểm tra đề xuất tăng lương nếu bị ép lương nặng
      if (
        emp.salary < emp.salaryExpectation * 0.78 &&
        emp.frustration >= 55 &&
        emp.trustInCEO >= 25 &&
        Math.random() < 0.015
      ) {
        emp.behaviorState = 'REQUESTING_RAISE';
        emp.currentState = 'TALK';
        emp.speechBubble = 'Sếp ơi, em xin phép gặp sếp đề xuất điều chỉnh mức lương!';
        emp.speechTimer = 6;
        crisisAlert = {
          type: 'RAISE_REQUEST',
          employeeId: emp.id,
          employeeName: emp.name,
          message: `${emp.name} đang đến trước bàn CEO để đề xuất tăng lương đúng kỳ vọng!`
        };
        return { state: 'REQUESTING_RAISE', crisisAlert };
      }

      // Tìm việc mới ngầm nếu quá chán nản
      if (emp.frustration >= 75 && emp.loyalty <= 28 && Math.random() < 0.02) {
        emp.behaviorState = 'JOB_SEARCHING';
        emp.currentState = 'WORK';
        emp.speechBubble = 'Xem thử mấy công ty khác đang tuyển gì...';
        emp.speechTimer = 4;
        return { state: 'JOB_SEARCHING' };
      }

      // Quá kiệt sức hoặc quá căng thẳng
      if (emp.energy <= 15) {
        emp.behaviorState = 'STRESSED';
        emp.currentState = 'TIRED';
        emp.speechBubble = 'Mệt lả người rồi, không code nổi nữa...';
        emp.speechTimer = 4;
        return { state: 'STRESSED' };
      } else if (emp.stress >= 85) {
        emp.behaviorState = 'STRESSED';
        emp.currentState = 'STRESSED';
        emp.speechBubble = 'Áp lực deadline kinh khủng quá!';
        emp.speechTimer = 4;
        return { state: 'STRESSED' };
      }

      // Tự giác ra máy pha cà phê giải tỏa nếu mệt
      if (emp.energy < 35 && Math.random() < 0.03) {
        emp.behaviorState = 'BREAK';
        emp.currentState = 'IDLE';
        return { state: 'BREAK' };
      }

      // Làm việc sâu (Deep Work)
      emp.behaviorState = 'WORKING';
      emp.currentState = 'WORK';

      // Xác định công việc cụ thể
      const assignedProj = activeProjects.find((p) => p.assignedEmployeeIds.includes(emp.id) && p.status === 'IN_PROGRESS');
      if (assignedProj) {
        let taskType: EmployeeAIEntity['currentTask']['taskType'] = 'CODING';
        let desc = 'Đang lập trình tính năng cốt lõi';

        if (emp.role === 'DESIGNER') {
          taskType = 'UI_DESIGN';
          desc = 'Thiết kế giao diện người dùng Figma';
        } else if (emp.role === 'TESTER') {
          taskType = 'TESTING';
          desc = 'Chạy kịch bản kiểm thử & rà soát bug';
        } else if (assignedProj.currentBugs > 2 && (emp.role === 'BACKEND' || emp.level === 'LEAD')) {
          taskType = 'BUG_FIXING';
          desc = 'Đang vá lỗ hổng và gỡ lỗi khẩn cấp';
        }

        emp.currentTask = {
          projectId: assignedProj.id,
          taskType,
          description: desc,
          progress: Math.min(100, Math.floor((assignedProj.completedWorkUnits / assignedProj.totalWorkUnits) * 100)),
          efficiencyMultiplier: (emp.speed / 50) * (emp.morale / 100)
        };
      } else {
        // Tự học nâng cao chuyên môn nếu không có task
        emp.behaviorState = 'LEARNING';
        emp.currentState = 'WORK';
        emp.currentTask = {
          projectId: null,
          taskType: 'LEARNING',
          description: 'Nghiên cứu công nghệ mới & tối ưu kỹ năng',
          progress: 50,
          efficiencyMultiplier: 1.0
        };
      }

      return { state: emp.behaviorState };
    }

    // 6. Hết giờ làm việc (Sau 18:00 nếu không có OT)
    emp.behaviorState = 'IDLE';
    emp.currentState = 'IDLE';
    return { state: 'IDLE' };
  }

  // --------------------------------------------------------------------------
  // 4. DI CHUYỂN TỰ HÀNH & HIỂN THỊ THOẠI (AUTONOMOUS MOVEMENT & DIALOGUE)
  // --------------------------------------------------------------------------
  public static updateMovementAndDialogue(
    emp: EmployeeAIEntity,
    deltaTime: number,
    deskPos: { x: number; y: number },
    whiteboardPos: { x: number; y: number },
    ceoDeskPos: { x: number; y: number },
    coffeePos: { x: number; y: number },
    loungePos: { x: number; y: number },
    exitPos: { x: number; y: number },
    isWorkHour: boolean,
    isLunch: boolean,
    isOT: boolean,
    isDailyStandup: boolean = false
  ): void {
    this.initAI2Fields(emp);

    if (!emp.currentPos) {
      emp.currentPos = { ...exitPos };
    }
    if (!emp.targetPos) {
      emp.targetPos = { ...deskPos };
    }

    // 1. Quản lý đồng hồ hiển thị lời thoại
    if (emp.speechTimer && emp.speechTimer > 0) {
      emp.speechTimer -= deltaTime;
      if (emp.speechTimer <= 0) {
        emp.speechBubble = null;
      }
    }

    // 2. Xác định đích đến theo trạng thái hành vi AI 2.0
    switch (emp.behaviorState) {
      case 'PROTESTING':
        // Tập trung quanh khu vực bàn CEO hô khẩu hiệu
        emp.targetPos = { x: 220 + (emp.deskIndex % 3) * 45, y: 150 };
        if (!emp.speechBubble && Math.random() < 0.03) {
          const quotes = [
            'Phản đối tăng ca bóc lột!',
            'Đình công đòi quyền lợi chính đáng!',
            'Yêu cầu CEO đối thoại công bằng!',
            'Không trả đủ lương, không viết code!'
          ];
          emp.speechBubble = quotes[Math.floor(Math.random() * quotes.length)];
          emp.speechTimer = 4;
        }
        break;

      case 'MEETING':
        // Tập trung trước Bảng Whiteboard Kanban
        emp.targetPos = { x: whiteboardPos.x + (emp.deskIndex % 6) * 26, y: whiteboardPos.y + 35 };
        if (!emp.speechBubble && Math.random() < 0.025) {
          const standupQuotes = [
            'Hôm nay em commit nốt module API',
            'Task hôm qua đã test thông qua!',
            'Sprint này đang đi đúng tiến độ',
            'Em hỗ trợ team fix nốt 2 bug tồn đọng'
          ];
          emp.speechBubble = standupQuotes[Math.floor(Math.random() * standupQuotes.length)];
          emp.speechTimer = 3.5;
        }
        break;

      case 'REQUESTING_RAISE':
        // Di chuyển đến trước bàn làm việc của CEO
        emp.targetPos = { x: ceoDeskPos.x, y: ceoDeskPos.y };
        break;

      case 'BREAK':
        // Đến khu vực máy pha cà phê
        emp.targetPos = { x: coffeePos.x + (emp.deskIndex % 2) * 30, y: coffeePos.y + 15 };
        if (!emp.speechBubble && Math.random() < 0.02) {
          emp.speechBubble = 'Làm ly espresso lấy lại tỉnh táo...';
          emp.speechTimer = 3;
        }
        break;

      case 'TALKING':
        // Đến khu ghế sofa / pantry nói chuyện
        emp.targetPos = { x: loungePos.x + (emp.deskIndex % 3) * 35, y: loungePos.y + (emp.deskIndex > 2 ? 25 : 0) };
        if (!emp.speechBubble && Math.random() < 0.02) {
          const chatQuotes = [
            'Dự án này làm xong chắc sếp thưởng lớn nhỉ',
            'Trưa nay đi ăn bún chả không anh em?',
            'Công nghệ mới này xịn thật, dễ maintain',
            'Code xong cảm giác thỏa mãn ghê'
          ];
          emp.speechBubble = chatQuotes[Math.floor(Math.random() * chatQuotes.length)];
          emp.speechTimer = 3.5;
        }
        break;

      case 'WORKING':
      case 'LEARNING':
      case 'JOB_SEARCHING':
      case 'STRESSED':
        // Ngồi tại bàn làm việc
        emp.targetPos = { ...deskPos };
        if (!emp.speechBubble && Math.random() < 0.012) {
          if (emp.stress > 70) {
            emp.speechBubble = 'Bug này khoai quá, nhức hết cả đầu...';
          } else if (emp.role === 'FRONTEND') {
            emp.speechBubble = 'UI mượt mà rồi, responsive chuẩn luôn!';
          } else if (emp.role === 'BACKEND') {
            emp.speechBubble = 'Query database dưới 50ms, cực nhanh!';
          } else if (emp.role === 'DESIGNER') {
            emp.speechBubble = 'Phối màu Chibi này nhìn bắt mắt ghê.';
          } else if (emp.role === 'TESTER') {
            emp.speechBubble = 'Vừa bắt được bug nguy hiểm, may ghê!';
          }
          emp.speechTimer = 3;
        }
        break;

      case 'GOING_TO_WORK':
        emp.targetPos = { ...deskPos };
        break;

      case 'GOING_HOME':
      case 'IDLE':
      default:
        // Di chuyển ra cửa ra vào
        emp.targetPos = { ...exitPos };
        break;
    }

    // 3. Di chuyển vật lý từng frame về targetPos
    const dx = emp.targetPos.x - emp.currentPos.x;
    const dy = emp.targetPos.y - emp.currentPos.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 4) {
      const moveSpeed = 80 * deltaTime; // Vận tốc bước đi tự nhiên
      emp.currentPos.x += (dx / distance) * moveSpeed;
      emp.currentPos.y += (dy / distance) * moveSpeed;
      emp.currentState = 'WALK';
    } else {
      // Đã tới vị trí, khớp animation với trạng thái hành vi
      if (emp.isStriking) emp.currentState = 'PROTEST';
      else if (emp.behaviorState === 'MEETING' || emp.behaviorState === 'TALKING') emp.currentState = 'TALK';
      else if (emp.behaviorState === 'WORKING') emp.currentState = 'WORK';
      else if (emp.behaviorState === 'STRESSED') emp.currentState = 'STRESSED';
      else if (emp.behaviorState === 'BREAK') emp.currentState = 'IDLE';
      else emp.currentState = 'IDLE';
    }
  }

  // --------------------------------------------------------------------------
  // 5. CẬP NHẬT CHU KỲ MỖI NGÀY: QUAN HỆ, MỤC TIÊU VÀ KHỦNG HOẢNG
  // --------------------------------------------------------------------------
  public static updateDailyCycle(
    employees: EmployeeAIEntity[],
    activeProjects: ProjectContract[],
    isOvertimeActive: boolean,
    day: number
  ): CrisisAlert[] {
    const alerts: CrisisAlert[] = [];

    employees.forEach((emp) => {
      this.initAI2Fields(emp);

      // 1. Phục hồi và tiêu hao thể lực
      if (isOvertimeActive) {
        emp.stress = Math.min(100, emp.stress + 5);
        emp.frustration = Math.min(100, emp.frustration + 3);
        emp.energy = Math.max(10, emp.energy - 10);
      } else {
        emp.stress = Math.max(0, emp.stress - 6);
        emp.energy = 100;
      }

      // 2. Kiểm tra chế độ lương
      if (emp.salary < emp.salaryExpectation * 0.8) {
        emp.frustration = Math.min(100, emp.frustration + 4);
        emp.loyalty = Math.max(0, emp.loyalty - 3);
        emp.trustInCEO = Math.max(0, emp.trustInCEO - 4);
      }

      // 3. Tiến độ mục tiêu cá nhân (Career Goals)
      if (emp.personalGoal) {
        switch (emp.personalGoal.type) {
          case 'PROMOTION_LEAD':
            if (emp.quality >= 80 && emp.behaviorState === 'WORKING') {
              emp.personalGoal.progress = Math.min(100, emp.personalGoal.progress + 2);
            }
            break;
          case 'SAVING_MONEY':
            if (emp.salary >= emp.salaryExpectation) {
              emp.personalGoal.progress = Math.min(100, emp.personalGoal.progress + 3);
            }
            break;
          case 'LEARN_NEW_TECH':
            if (emp.assignedProjectId) {
              emp.personalGoal.progress = Math.min(100, emp.personalGoal.progress + 2.5);
            }
            break;
          case 'WORK_LIFE_BALANCE':
            if (!isOvertimeActive) {
              emp.personalGoal.progress = Math.min(100, emp.personalGoal.progress + 3.5);
            } else {
              emp.personalGoal.progress = Math.max(0, emp.personalGoal.progress - 4);
            }
            break;
          case 'EARN_ESOP':
            if (emp.loyalty >= 75) {
              emp.personalGoal.progress = Math.min(100, emp.personalGoal.progress + 2);
            }
            break;
        }

        // Đạt mốc mục tiêu
        if (emp.personalGoal.progress >= 100 && !emp.memories.some((m) => m.type === 'PROMOTED')) {
          this.addMemory(emp, 'PROMOTED', 'Đã hoàn thành xuất sắc mục tiêu sự nghiệp cá nhân!', 25, 20, day);
        }
      }

      // 4. Quan hệ xã hội với đồng nghiệp
      employees.forEach((other) => {
        if (emp.id !== other.id) {
          const rel = emp.relationships[other.id] || { affinity: 50, trust: 50, lastInteractionDay: day };

          // Làm cùng dự án tăng tình thân
          const sameProj = activeProjects.some(
            (p) => p.assignedEmployeeIds.includes(emp.id) && p.assignedEmployeeIds.includes(other.id)
          );
          if (sameProj) {
            rel.affinity = Math.min(100, rel.affinity + 2);
            rel.trust = Math.min(100, rel.trust + 2);
          }

          // Hiệu ứng lây lan tâm lý khi bạn thân đình công
          if (other.isStriking && rel.affinity >= 65) {
            emp.frustration = Math.min(100, emp.frustration + 3);
          }

          rel.lastInteractionDay = day;
          emp.relationships[other.id] = rel;
          emp.colleagueRelations![other.id] = rel.affinity;
        }
      });

      // 5. Chuỗi leo thang khủng hoảng cá nhân
      if (!emp.hasGivenNotice && emp.frustration >= 88 && emp.loyalty <= 18) {
        emp.hasGivenNotice = true;
        emp.daysUntilQuit = 3;
        this.addMemory(emp, 'UNFAIR_TREATMENT', 'Đã nộp đơn nghỉ việc vì môi trường làm việc bất công!', -30, -35, day);
        alerts.push({
          type: 'RESIGNATION',
          employeeId: emp.id,
          employeeName: emp.name,
          message: `${emp.name} (${emp.role}) đã nộp đơn nghỉ việc và chỉ còn 3 ngày bàn giao!`
        });
        soundManager.playAlert();
      } else if (!emp.isStriking && emp.frustration >= 78 && emp.trustInCEO <= 25) {
        emp.isStriking = true;
        this.addMemory(emp, 'DISPUTE_PETITION', 'Bãi công tại văn phòng yêu cầu CEO cải tổ chính sách!', -20, -25, day);
        alerts.push({
          type: 'STRIKE',
          employeeId: emp.id,
          employeeName: emp.name,
          message: `CẢNH BÁO: ${emp.name} đã ngừng làm việc và bãi công tại văn phòng!`
        });
        soundManager.playDramaticChord();
      }
    });

    return alerts;
  }

  // --------------------------------------------------------------------------
  // 6. TÍNH TOÁN ĐÓNG GÓP TIẾN ĐỘ DỰ ÁN & VÁ BUG THEO VAI TRÒ
  // --------------------------------------------------------------------------
  public static executeTaskContribution(
    emp: EmployeeAIEntity,
    project: ProjectContract,
    sprintStrategy: SprintStrategy,
    hasCoffee: boolean,
    hasErgo: boolean,
    hasServer: boolean
  ): { workContribution: number; bugsGenerated: number; bugsFixed: number } {
    this.initAI2Fields(emp);

    if (emp.isStriking || emp.behaviorState !== 'WORKING') {
      return { workContribution: 0, bugsGenerated: 0, bugsFixed: 0 };
    }

    let speedMult = 1.0;
    let bugMult = 1.0;
    let baseFix = 0;

    switch (sprintStrategy) {
      case 'QUALITY_FIRST':
        speedMult = 0.85;
        bugMult = 0.4;
        baseFix = 1;
        break;
      case 'CRUNCH_SPEED':
        speedMult = 1.6;
        bugMult = 2.0;
        break;
      case 'REFACTOR_DEBT':
        speedMult = 0.35;
        baseFix = 3;
        break;
      case 'BALANCED':
      default:
        speedMult = 1.0;
        bugMult = 1.0;
        break;
    }

    // Năng suất dựa trên kỹ năng chính, thể lực và tinh thần
    const mainSkill =
      emp.role === 'FRONTEND'
        ? emp.skillLevels.frontend
        : emp.role === 'BACKEND'
        ? emp.skillLevels.backend
        : emp.role === 'DESIGNER'
        ? emp.skillLevels.design
        : emp.role === 'TESTER'
        ? emp.skillLevels.testing
        : Math.max(emp.skillLevels.frontend, emp.skillLevels.backend);

    const conditionFactor = (emp.energy / 100) * (emp.morale / 100);
    const workContribution = Math.max(0.5, (mainSkill / 45) * conditionFactor * 2.5 * speedMult);

    emp.totalLinesOfCodeProduced = (emp.totalLinesOfCodeProduced || 0) + Math.floor(workContribution * 40);

    // Sinh bug nếu mệt mỏi
    let bugsGenerated = 0;
    const effectiveBugRate = (emp.bugRate / 100) * (emp.stress > 60 ? 1.8 : 1.0) * bugMult;
    if (Math.random() < effectiveBugRate * 0.1) {
      bugsGenerated = 1;
      emp.totalBugsProduced = (emp.totalBugsProduced || 0) + 1;
    }

    // Tester và Lead có khả năng gỡ bug
    let bugsFixed = 0;
    if (emp.role === 'TESTER') {
      bugsFixed = Math.floor(emp.skillLevels.testing / 30) + (hasServer ? 2 : 1) + baseFix;
      emp.totalBugsFixed = (emp.totalBugsFixed || 0) + bugsFixed;
    } else if (emp.level === 'LEAD' || sprintStrategy === 'REFACTOR_DEBT') {
      bugsFixed = 1 + baseFix;
      emp.totalBugsFixed = (emp.totalBugsFixed || 0) + bugsFixed;
    }

    // Tiêu hao năng lượng
    const burn = hasErgo ? 1.2 : 2.0;
    emp.energy = Math.max(0, emp.energy - burn);

    return { workContribution, bugsGenerated, bugsFixed };
  }

  // --------------------------------------------------------------------------
  // 7. SÀN TUYỂN DỤNG & SINH DANH SÁCH ỨNG VIÊN ĐA PHÂN CẤP (TIERED CANDIDATES)
  // --------------------------------------------------------------------------
  public static generateCandidates(tier: RecruitmentTier = 'STANDARD', companyReputation: number): CandidateEntity[] {
    if (tier === 'HEADHUNTER_EXECUTIVE') {
      return [
        {
          id: `cand_head_${Date.now()}_1`,
          name: 'Lê Hoàng Long',
          age: 32,
          gender: 'MALE',
          avatarSeed: 201,
          role: 'FULLSTACK',
          level: 'LEAD',
          experienceYears: 8,
          personality: 'AMBITIOUS',
          speed: 95,
          quality: 96,
          bugRate: 3,
          health: 95,
          energy: 100,
          morale: 85,
          happiness: 85,
          stress: 15,
          frustration: 0,
          resentment: 0,
          loyalty: 80,
          trustInCEO: 80,
          ceoTrust: 80,
          ambition: 95,
          salary: 45000000,
          salaryExpectation: 45000000,
          expectedSalary: 45000000,
          recruitmentTier: 'HEADHUNTER_EXECUTIVE',
          skillLevels: { frontend: 92, backend: 96, design: 70, testing: 88, devops: 94 },
          behaviorState: 'IDLE',
          relationships: {},
          memories: [],
          memoryLog: ['Tìm kiếm cơ hội nhận cổ phần ESOP và xây dựng đế chế công nghệ.'],
          currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên Headhunt', progress: 0, efficiencyMultiplier: 1.0 },
          bio: 'Cựu Solution Architect tại tập đoàn đa quốc gia. Chuyên thiết kế hệ thống chịu tải hàng triệu người dùng, tối ưu hạ tầng Cloud.'
        },
        {
          id: `cand_head_${Date.now()}_2`,
          name: 'Vũ Thanh Hằng',
          age: 29,
          gender: 'FEMALE',
          avatarSeed: 202,
          role: 'PRODUCT_MANAGER',
          level: 'SENIOR',
          experienceYears: 6,
          personality: 'PRAGMATIC',
          speed: 90,
          quality: 92,
          bugRate: 4,
          health: 95,
          energy: 100,
          morale: 80,
          happiness: 80,
          stress: 20,
          frustration: 0,
          resentment: 0,
          loyalty: 85,
          trustInCEO: 80,
          ceoTrust: 80,
          ambition: 85,
          salary: 38000000,
          salaryExpectation: 38000000,
          expectedSalary: 38000000,
          recruitmentTier: 'HEADHUNTER_EXECUTIVE',
          skillLevels: { frontend: 75, backend: 78, design: 85, testing: 85, devops: 90 },
          behaviorState: 'IDLE',
          relationships: {},
          memories: [],
          memoryLog: ['Mong muốn dẫn dắt quy trình Agile chuyên nghiệp.'],
          currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên Headhunt', progress: 0, efficiencyMultiplier: 1.0 },
          bio: 'Lead Product Manager quản lý dự án Fintech, thấu hiểu bài toán người dùng và tối ưu hóa vận tốc bàn giao của toàn đội ngũ.'
        }
      ];
    }

    if (tier === 'SPONSORED_TOPCV') {
      return [
        {
          id: `cand_topcv_${Date.now()}_1`,
          name: 'Nguyễn Thị Mai',
          age: 26,
          gender: 'FEMALE',
          avatarSeed: 102,
          role: 'BACKEND',
          level: 'MID',
          experienceYears: 3.5,
          personality: 'PRAGMATIC',
          speed: 78,
          quality: 84,
          bugRate: 8,
          health: 95,
          energy: 100,
          morale: 80,
          happiness: 80,
          stress: 15,
          frustration: 0,
          resentment: 0,
          loyalty: 80,
          trustInCEO: 75,
          ceoTrust: 75,
          ambition: 70,
          salary: 22000000,
          salaryExpectation: 22000000,
          expectedSalary: 22000000,
          recruitmentTier: 'SPONSORED_TOPCV',
          skillLevels: { frontend: 40, backend: 84, design: 25, testing: 70, devops: 65 },
          behaviorState: 'IDLE',
          relationships: {},
          memories: [],
          memoryLog: ['Mong muốn môi trường minh bạch và mức đãi ngộ xứng đáng.'],
          currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên TopCV', progress: 0, efficiencyMultiplier: 1.0 },
          bio: 'Chuyên gia Node.js & PostgreSQL, viết RESTful API chuẩn mực, tối ưu hóa câu lệnh truy vấn và bảo mật dữ liệu.'
        },
        {
          id: `cand_topcv_${Date.now()}_2`,
          name: 'Đỗ Thùy Linh',
          age: 25,
          gender: 'FEMALE',
          avatarSeed: 104,
          role: 'DESIGNER',
          level: 'MID',
          experienceYears: 3,
          personality: 'CREATIVE',
          speed: 75,
          quality: 88,
          bugRate: 6,
          health: 95,
          energy: 100,
          morale: 85,
          happiness: 85,
          stress: 15,
          frustration: 0,
          resentment: 0,
          loyalty: 85,
          trustInCEO: 80,
          ceoTrust: 80,
          ambition: 65,
          salary: 19000000,
          salaryExpectation: 19000000,
          expectedSalary: 19000000,
          recruitmentTier: 'SPONSORED_TOPCV',
          skillLevels: { frontend: 55, backend: 20, design: 90, testing: 40, devops: 20 },
          behaviorState: 'IDLE',
          relationships: {},
          memories: [],
          memoryLog: ['Đam mê tạo ra các sản phẩm công nghệ có trải nghiệm người dùng vượt trội.'],
          currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên TopCV', progress: 0, efficiencyMultiplier: 1.0 },
          bio: 'UI/UX Designer tốt nghiệp Mỹ thuật, có gu thiết kế hiện đại, thành thạo xây dựng Design System và Prototype tương tác.'
        }
      ];
    }

    // Tier STANDARD (Mặc định phổ thông)
    return [
      {
        id: `cand_std_${Date.now()}_1`,
        name: 'Trần Văn Hoàng',
        age: 23,
        gender: 'MALE',
        avatarSeed: 101,
        role: 'FRONTEND',
        level: 'JUNIOR',
        experienceYears: 1.5,
        personality: 'HARDWORKING',
        speed: 65,
        quality: 68,
        bugRate: 14,
        health: 100,
        energy: 100,
        morale: 80,
        happiness: 80,
        stress: 15,
        frustration: 0,
        resentment: 0,
        loyalty: 75,
        trustInCEO: 75,
        ceoTrust: 75,
        ambition: 60,
        salary: 12000000,
        salaryExpectation: 12000000,
        expectedSalary: 12000000,
        recruitmentTier: 'STANDARD',
        skillLevels: { frontend: 70, backend: 35, design: 50, testing: 45, devops: 30 },
        behaviorState: 'IDLE',
        relationships: {},
        memories: [],
        memoryLog: ['Tốt nghiệp ĐH Bách Khoa, muốn tìm môi trường cọ xát thực tế.'],
        currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên', progress: 0, efficiencyMultiplier: 1.0 },
        bio: 'Thành thạo React, TypeScript, Tailwind CSS. Nhiệt tình, sẵn sàng học hỏi và nhận góp ý để nâng cao tay nghề.'
      },
      {
        id: `cand_std_${Date.now()}_2`,
        name: 'Phạm Minh Tuấn',
        age: 24,
        gender: 'MALE',
        avatarSeed: 105,
        role: 'TESTER',
        level: 'JUNIOR',
        experienceYears: 1.5,
        personality: 'HARDWORKING',
        speed: 68,
        quality: 80,
        bugRate: 10,
        health: 100,
        energy: 100,
        morale: 80,
        happiness: 80,
        stress: 10,
        frustration: 0,
        resentment: 0,
        loyalty: 80,
        trustInCEO: 80,
        ceoTrust: 80,
        ambition: 55,
        salary: 11000000,
        salaryExpectation: 11000000,
        expectedSalary: 11000000,
        recruitmentTier: 'STANDARD',
        skillLevels: { frontend: 30, backend: 30, design: 30, testing: 82, devops: 35 },
        behaviorState: 'IDLE',
        relationships: {},
        memories: [],
        memoryLog: ['Cẩn trọng, kiên nhẫn tìm bug trong các kịch bản người dùng.'],
        currentTask: { projectId: null, taskType: 'IDLE', description: 'Ứng viên', progress: 0, efficiencyMultiplier: 1.0 },
        bio: 'Tester tỉ mỉ, có kỹ năng viết kịch bản test case chặt chẽ, kiểm thử hồi quy và hỗ trợ developers debug nhanh chóng.'
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 8. HÀNH ĐỘNG QUẢN TRỊ CEO: THƯỞNG, TĂNG LƯƠNG, THĂNG CHỨC & HÒA GIẢI
  // --------------------------------------------------------------------------
  public static rewardEmployee(employee: EmployeeAIEntity, bonusAmount: number, day: number = 1): { happinessGain: number; trustGain: number } {
    this.initAI2Fields(employee);

    const happinessGain = Math.min(35, Math.floor(bonusAmount / 200000));
    const trustGain = Math.min(25, Math.floor(bonusAmount / 300000));

    this.addMemory(
      employee,
      'REWARDED_BONUS',
      `Được CEO thưởng nóng ${(bonusAmount).toLocaleString('vi-VN')} VNĐ ghi nhận thành tích!`,
      happinessGain,
      trustGain,
      day
    );

    if (employee.isStriking) {
      employee.isStriking = false;
      employee.currentState = 'HAPPY';
    }

    soundManager.playSuccess();
    return { happinessGain, trustGain };
  }

  public static raiseSalary(employee: EmployeeAIEntity, newSalary: number, day: number = 1): void {
    this.initAI2Fields(employee);

    employee.salary = newSalary;
    employee.currentSalary = newSalary;

    if (newSalary >= employee.salaryExpectation) {
      this.addMemory(
        employee,
        'SALARY_RAISE',
        `Được nâng lương lên ${newSalary.toLocaleString('vi-VN')} VNĐ/tháng (Đạt mức kỳ vọng)!`,
        35,
        25,
        day
      );
      employee.isStriking = false;
      employee.currentState = 'CELEBRATE';
    } else {
      this.addMemory(
        employee,
        'SALARY_RAISE',
        `Được điều chỉnh lương lên ${newSalary.toLocaleString('vi-VN')} VNĐ/tháng.`,
        15,
        10,
        day
      );
    }
  }

  public static promoteEmployee(employee: EmployeeAIEntity, newLevel: SkillLevel, day: number = 1): void {
    this.initAI2Fields(employee);

    const oldLevel = employee.level;
    employee.level = newLevel;

    // Tăng chỉ số chuyên môn
    employee.speed = Math.min(100, employee.speed + 12);
    employee.quality = Math.min(100, employee.quality + 10);
    employee.bugRate = Math.max(2, employee.bugRate - 4);

    employee.skillLevels.frontend = Math.min(100, employee.skillLevels.frontend + 10);
    employee.skillLevels.backend = Math.min(100, employee.skillLevels.backend + 10);
    employee.skillLevels.testing = Math.min(100, employee.skillLevels.testing + 10);

    this.addMemory(
      employee,
      'PROMOTED',
      `Chính thức được thăng cấp từ ${oldLevel} lên ${newLevel}!`,
      40,
      35,
      day
    );

    employee.currentState = 'CELEBRATE';
    soundManager.playSuccess();
  }

  public static resolveStrikeNegotiation(employee: EmployeeAIEntity, offerCompensation: boolean, day: number = 1): boolean {
    this.initAI2Fields(employee);

    if (offerCompensation) {
      employee.isStriking = false;
      this.addMemory(employee, 'RESOLVED_STRIKE', 'Đạt thỏa thuận hòa giải thành công với CEO tại văn phòng.', 30, 20, day);
      employee.currentState = 'HAPPY';
      return true;
    } else {
      employee.frustration = Math.min(100, employee.frustration + 15);
      employee.resentment = employee.frustration;
      employee.trustInCEO = Math.max(0, employee.trustInCEO - 20);
      employee.ceoTrust = employee.trustInCEO;
      return false;
    }
  }

  // Danh sách ứng viên mặc định ban đầu
  public static generateRecruitmentPool(): CandidateEntity[] {
    return this.generateCandidates('STANDARD', 10);
  }

  // Đơn kiến nghị tập thể (Collective Petition)
  public static checkForCollectivePetition(
    employees: EmployeeAIEntity[],
    isOvertimeActive: boolean
  ): CollectivePetition | null {
    const discontentEmployees = employees.filter(
      (e) => !e.isStriking && !e.hasGivenNotice && (e.frustration >= 65 || e.resentment >= 65) && (e.trustInCEO <= 45 || e.ceoTrust <= 45)
    );

    if (discontentEmployees.length >= 2) {
      const leader = discontentEmployees[0];
      return {
        id: `petition_${Date.now()}`,
        message: `Tập thể ${discontentEmployees.length} nhân sự do ${leader.name} đại diện đệ trình Đơn Kiến Nghị: Phản đối áp lực kéo dài và yêu cầu điều chỉnh thu nhập!`,
        salaryIncreaseDemandPercent: 15,
        stopOvertimeDemand: isOvertimeActive,
        signingEmployees: discontentEmployees.map((e) => e.id),
        daysRemaining: 3,
        status: 'PENDING'
      };
    }

    return null;
  }
}
