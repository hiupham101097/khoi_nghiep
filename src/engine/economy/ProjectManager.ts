// ============================================================================
// CEO EMPIRE: PROJECT & CONTRACT MANAGEMENT (Săn thầu, Quản lý Sprint, Bàn giao)
// ============================================================================

import { ProjectContract, EmployeeAIEntity, SprintStrategy } from '../../types';
import { soundManager } from '../core/SoundManager';

export class ProjectManager {
  // Sinh danh sách dự án khả dụng trên bảng chào thầu
  public static generateAvailableTenders(companyReputation: number): ProjectContract[] {
    const pool: ProjectContract[] = [
      {
        id: `proj_${Date.now()}_1`,
        name: 'Website Landing Page & Quản Trị Chuỗi Trà Sữa Toco',
        clientName: 'Công Ty CP Trà Sữa Toco',
        clientType: 'SME',
        clientLogo: '🧋',
        contractValue: 45000000, // 45 triệu VNĐ
        depositReceived: false,
        totalWorkUnits: 120,
        completedWorkUnits: 0,
        currentBugs: 0,
        durationDays: 14,
        daysRemaining: 14,
        penaltyPerDay: 1500000,
        qualityRequirement: 65,
        assignedEmployeeIds: [],
        status: 'PROPOSED',
        description: 'Xây dựng website giới thiệu chuỗi cửa hàng, tích hợp bản đồ Google Maps và đặt món online cơ bản.'
      },
      {
        id: `proj_${Date.now()}_2`,
        name: 'Ứng Dụng Đặt Lịch Spa & Salon Làm Đẹp "BeautyNow"',
        clientName: 'Thẩm Mỹ Viện Quốc Tế Seoul',
        clientType: 'SME',
        clientLogo: '💅',
        contractValue: 90000000, // 90 triệu VNĐ
        depositReceived: false,
        totalWorkUnits: 250,
        completedWorkUnits: 0,
        currentBugs: 0,
        durationDays: 25,
        daysRemaining: 25,
        penaltyPerDay: 3000000,
        qualityRequirement: 75,
        assignedEmployeeIds: [],
        status: 'PROPOSED',
        description: 'App di động đa nền tảng iOS & Android đặt lịch hẹn, tích hợp cổng thanh toán MoMo và ZaloPay.'
      },
      {
        id: `proj_${Date.now()}_3`,
        name: 'Nền Tảng Thương Mại Điện Tử Local "Chợ Việt Online"',
        clientName: 'Tập Đoàn Bán Lẻ Thuận Phát',
        clientType: 'ENTERPRISE',
        clientLogo: '🛒',
        contractValue: 220000000, // 220 triệu VNĐ
        depositReceived: false,
        totalWorkUnits: 550,
        completedWorkUnits: 0,
        currentBugs: 0,
        durationDays: 45,
        daysRemaining: 45,
        penaltyPerDay: 7000000,
        qualityRequirement: 85,
        assignedEmployeeIds: [],
        status: 'PROPOSED',
        description: 'Hệ thống E-commerce chịu tải cao, đồng bộ kho vận thời gian thực, tích hợp AI gợi ý sản phẩm.'
      },
      {
        id: `proj_${Date.now()}_4`,
        name: 'Hệ Thống Phân Tích Dữ Liệu Tín Dụng & AI Scorecard',
        clientName: 'Ngân Hàng V-Bank Trụ Sở Chính',
        clientType: 'ENTERPRISE',
        clientLogo: '🏦',
        contractValue: 650000000, // 650 triệu VNĐ
        depositReceived: false,
        totalWorkUnits: 1200,
        completedWorkUnits: 0,
        currentBugs: 0,
        durationDays: 75,
        daysRemaining: 75,
        penaltyPerDay: 20000000,
        qualityRequirement: 95,
        assignedEmployeeIds: [],
        status: 'PROPOSED',
        description: 'Dự án Fintech cấp ngân hàng quốc gia, bảo mật cao, kiểm thử khắt khe và nghiệm thu theo chuẩn ISO 27001.'
      }
    ];

    // Lọc theo uy tín thương trường của công ty
    return pool.filter((p) => {
      if (p.contractValue > 400000000) return companyReputation >= 60;
      if (p.contractValue > 150000000) return companyReputation >= 25;
      return true;
    });
  }

  // Ký hợp đồng & nhận 30% tiền cọc tạm ứng
  public static signContract(project: ProjectContract): { depositAmount: number } {
    project.status = 'IN_PROGRESS';
    project.depositReceived = true;
    const depositAmount = Math.floor(project.contractValue * 0.3);
    project.accountsReceivable = Math.floor(project.contractValue * 0.7);

    // Khởi tạo phân rã công việc (Work Breakdown Scope)
    const total = project.totalWorkUnits;
    project.taskScope = {
      frontendUnits: Math.floor(total * 0.35),
      frontendDone: 0,
      backendUnits: Math.floor(total * 0.35),
      backendDone: 0,
      designUnits: Math.floor(total * 0.15),
      designDone: 0,
      testingUnits: Math.floor(total * 0.15),
      testingDone: 0
    };

    soundManager.playCashEarned();
    return { depositAmount };
  }

  // Cập nhật tiến độ dự án mỗi ngày theo Chiến lược Sprint và năng lực vai trò
  public static updateDailyProjectSprint(
    project: ProjectContract,
    assignedEmployees: EmployeeAIEntity[],
    strategy: SprintStrategy = 'BALANCED'
  ): { isCompleted: boolean; isOverdue: boolean; bugsDelta: number } {
    if (project.status !== 'IN_PROGRESS' && project.status !== 'OVERDUE') {
      return { isCompleted: false, isOverdue: false, bugsDelta: 0 };
    }

    project.daysRemaining -= 1;
    let isOverdue = false;

    if (project.daysRemaining <= 0) {
      project.status = 'OVERDUE';
      isOverdue = true;
    }

    // Đảm bảo taskScope tồn tại
    if (!project.taskScope) {
      const total = project.totalWorkUnits;
      project.taskScope = {
        frontendUnits: Math.floor(total * 0.35),
        frontendDone: Math.floor(project.completedWorkUnits * 0.35),
        backendUnits: Math.floor(total * 0.35),
        backendDone: Math.floor(project.completedWorkUnits * 0.35),
        designUnits: Math.floor(total * 0.15),
        designDone: Math.floor(project.completedWorkUnits * 0.15),
        testingUnits: Math.floor(total * 0.15),
        testingDone: Math.floor(project.completedWorkUnits * 0.15)
      };
    }

    // Hệ số chiến lược Sprint
    let speedMultiplier = 1.0;
    let bugMultiplier = 1.0;
    let baseFixBug = 0;

    switch (strategy) {
      case 'QUALITY_FIRST':
        speedMultiplier = 0.85;
        bugMultiplier = 0.4;
        baseFixBug = 1;
        break;
      case 'CRUNCH_SPEED':
        speedMultiplier = 1.6;
        bugMultiplier = 2.0;
        break;
      case 'REFACTOR_DEBT':
        speedMultiplier = 0.35;
        baseFixBug = 3;
        break;
      case 'BALANCED':
      default:
        speedMultiplier = 1.0;
        bugMultiplier = 1.0;
        break;
    }

    let totalBugsDelta = 0;
    const scope = project.taskScope;

    assignedEmployees.forEach((emp) => {
      if (!emp.isStriking && emp.currentState === 'WORK') {
        const factor = (emp.speed / 45) * (emp.quality / 100) * speedMultiplier;
        const progressChunk = factor * 4.5;

        // Phân phối theo đúng vai trò chuyên môn
        if (emp.role === 'FRONTEND') {
          scope.frontendDone = Math.min(scope.frontendUnits, scope.frontendDone + progressChunk * 1.5);
        } else if (emp.role === 'BACKEND') {
          scope.backendDone = Math.min(scope.backendUnits, scope.backendDone + progressChunk * 1.5);
        } else if (emp.role === 'DESIGNER') {
          scope.designDone = Math.min(scope.designUnits, scope.designDone + progressChunk * 1.5);
        } else if (emp.role === 'TESTER') {
          scope.testingDone = Math.min(scope.testingUnits, scope.testingDone + progressChunk * 1.5);
          // Tester rà soát bug chuyên sâu
          const fixCount = Math.floor(emp.quality / 25) + baseFixBug;
          project.currentBugs = Math.max(0, project.currentBugs - fixCount);
        } else {
          // FULLSTACK hoặc PM
          scope.frontendDone = Math.min(scope.frontendUnits, scope.frontendDone + progressChunk * 0.7);
          scope.backendDone = Math.min(scope.backendUnits, scope.backendDone + progressChunk * 0.7);
        }

        // Sinh bug tiềm ẩn nếu mệt mỏi
        if (Math.random() < (emp.bugRate / 100) * 0.12 * bugMultiplier) {
          project.currentBugs += 1;
          totalBugsDelta += 1;
        }

        if (strategy === 'REFACTOR_DEBT' || strategy === 'QUALITY_FIRST') {
          project.currentBugs = Math.max(0, project.currentBugs - baseFixBug);
        }
      }
    });

    project.completedWorkUnits = Math.min(
      project.totalWorkUnits,
      scope.frontendDone + scope.backendDone + scope.designDone + scope.testingDone
    );

    // Điều kiện nghiệm thu bàn giao:
    // 1. Toàn bộ khối lượng công việc hoàn thành 100%
    // 2. Số bug không vượt quá ngưỡng cho phép (tối đa 1 bug cho dự án nhỏ, 0 bug cho Enterprise)
    const maxAllowedBugs = project.clientType === 'ENTERPRISE' || project.clientType === 'GOVERNMENT' ? 0 : 1;
    const isCompleted = project.completedWorkUnits >= project.totalWorkUnits && project.currentBugs <= maxAllowedBugs;

    return { isCompleted, isOverdue, bugsDelta: totalBugsDelta };
  }

  // Nghiệm thu bàn giao và nhận 70% thanh toán còn lại
  public static deliverProject(project: ProjectContract): {
    payout: number;
    penaltyDeducted: number;
    reputationGain: number;
  } {
    project.status = 'COMPLETED';

    // Tính tiền phạt trễ hạn nếu có
    const overdueDays = project.daysRemaining < 0 ? Math.abs(project.daysRemaining) : 0;
    const penaltyDeducted = overdueDays * project.penaltyPerDay;

    const remainingContractPayment = Math.floor(project.contractValue * 0.7);
    const payout = Math.max(0, remainingContractPayment - penaltyDeducted);

    const reputationGain = overdueDays === 0 ? Math.floor(project.contractValue / 30000000) + 5 : -3;

    soundManager.playSuccess();
    soundManager.playCashEarned();

    return { payout, penaltyDeducted, reputationGain };
  }
}
