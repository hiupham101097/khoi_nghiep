// ============================================================================
// CEO EMPIRE: EMPLOYEE AI & PSYCHOLOGY ENGINE (Utility AI & Behavior Tree)
// ============================================================================

import {
  EmployeeAIEntity,
  CandidateEntity,
  CharacterAnimationState,
  ProjectContract
} from '../../types';
import { TimeManager } from '../core/TimeManager';
import { soundManager } from '../core/SoundManager';

export interface CrisisAlert {
  type: 'WARNING' | 'PETITION' | 'STRIKE' | 'RESIGNATION';
  employeeId: string;
  employeeName: string;
  message: string;
}

export class EmployeeAIEngine {
  // Cập nhật vòng đời tâm lý và hành vi của nhân viên theo từng giờ / ngày trong game
  public static updateEmployeeCycle(
    employee: EmployeeAIEntity,
    timeManager: TimeManager,
    activeProjects: ProjectContract[],
    hasCoffeeMachine: boolean,
    hasErgonomicChairs: boolean,
    isCompanyOvertimeActive: boolean
  ): { crisisAlert?: CrisisAlert; workContribution: number; bugsGenerated: number } {
    const isWorkHour = timeManager.isWorkHour();
    const isLunch = timeManager.isLunchHour();
    const isOT = isCompanyOvertimeActive && timeManager.isOvertimeHour();

    let workContribution = 0;
    let bugsGenerated = 0;
    let crisisAlert: CrisisAlert | undefined;

    // 1. TÍNH TOÁN UTILITY SCORE ĐỂ QUYẾT ĐỊNH TRẠNG THÁI HÀNH VI
    if (employee.isStriking) {
      employee.currentState = 'PROTEST';
    } else if (employee.hasGivenNotice) {
      employee.currentState = 'SAD';
      employee.daysUntilQuit -= 0.05; // Giảm dần thời gian bàn giao
    } else if (isLunch) {
      employee.currentState = 'TALK';
      // Hồi năng lượng trong giờ trưa
      employee.energy = Math.min(100, employee.energy + (hasCoffeeMachine ? 8 : 4));
      employee.stress = Math.max(0, employee.stress - 3);
    } else if (isWorkHour || isOT) {
      // Đánh giá xem có bị kiệt sức hoặc quá ức chế không
      if (employee.energy <= 15) {
        employee.currentState = 'TIRED';
      } else if (employee.stress >= 85) {
        employee.currentState = 'STRESSED';
      } else {
        employee.currentState = 'WORK';

        // Đóng góp vào tiến độ dự án
        const speedFactor = (employee.speed / 50) * (employee.energy / 100) * (employee.happiness / 100);
        workContribution = Math.max(0.5, speedFactor * 1.5);

        // Sinh bug dựa trên độ mệt mỏi và kỹ năng
        const effectiveBugRate = (employee.bugRate / 100) * (employee.stress > 60 ? 1.8 : 1.0);
        if (Math.random() < effectiveBugRate * 0.1) {
          bugsGenerated = 1;
        }

        // Tiêu hao năng lượng
        const energyBurn = hasErgonomicChairs ? 1.5 : 2.5;
        employee.energy = Math.max(0, employee.energy - energyBurn);

        // Nếu đang OT (tăng ca), tăng thêm căng thẳng và ức chế
        if (isOT) {
          employee.stress = Math.min(100, employee.stress + 2.5);
          employee.resentment = Math.min(100, employee.resentment + 1.2);
        }
      }
    } else {
      // Ngoài giờ làm việc: Về nhà nghỉ ngơi
      employee.currentState = 'IDLE';
      employee.energy = Math.min(100, employee.energy + 4);
      employee.stress = Math.max(0, employee.stress - 2);
    }

    // 2. MÔ PHỎNG TÂM LÝ & SỰ BẤT MÃN VỀ LƯƠNG THƯỞNG
    if (employee.currentSalary < employee.expectedSalary * 0.8) {
      // Trả lương dưới 80% kỳ vọng gây bất mãn tích lũy
      employee.resentment = Math.min(100, employee.resentment + 0.3);
      employee.loyalty = Math.max(0, employee.loyalty - 0.2);
    }

    // 3. CHUỖI LEO THANG KHỦNG HOẢNG LAO ĐỘNG (Crisis Escalation Sequence)
    // Cấp 1: Thì thầm bức xúc (Resentment > 50)
    // Cấp 2: Đệ trình đơn kiến nghị (Resentment > 65 & ceoTrust < 40)
    // Cấp 3: Đình công tại chỗ (Resentment > 75 & Stress > 70 & ceoTrust < 30)
    // Cấp 4: Nộp đơn từ chức sang đối thủ (Resentment > 85 & Loyalty < 20)

    if (!employee.hasGivenNotice && employee.resentment >= 88 && employee.loyalty <= 18) {
      employee.hasGivenNotice = true;
      employee.daysUntilQuit = 3;
      employee.currentState = 'LEAVE_OFFICE';
      employee.memoryLog.push('Đã nộp đơn từ chức vì chế độ đãi ngộ quá tệ.');
      crisisAlert = {
        type: 'RESIGNATION',
        employeeId: employee.id,
        employeeName: employee.name,
        message: `${employee.name} (${employee.role}) đã nộp đơn nghỉ việc vì không còn niềm tin vào công ty!`
      };
      soundManager.playAlert();

    } else if (!employee.isStriking && employee.resentment >= 75 && employee.stress >= 65 && employee.ceoTrust <= 32) {
      employee.isStriking = true;
      employee.currentState = 'PROTEST';
      employee.memoryLog.push('Tham gia đình công tập thể phản đối CEO!');
      crisisAlert = {
        type: 'STRIKE',
        employeeId: employee.id,
        employeeName: employee.name,
        message: `BÁO ĐỘNG: ${employee.name} đã ngừng làm việc và phát động ĐÌNH CÔNG tại văn phòng!`
      };
      soundManager.playDramaticChord();

    } else if (employee.resentment >= 60 && employee.ceoTrust <= 45 && Math.random() < 0.008) {
      crisisAlert = {
        type: 'PETITION',
        employeeId: employee.id,
        employeeName: employee.name,
        message: `${employee.name} gửi đơn kiến nghị yêu cầu CEO tăng lương và giảm giờ làm thêm.`
      };
    }

    return { crisisAlert, workContribution, bugsGenerated };
  }

  // CEO tương tác tích cực: Thưởng nóng, tâm sự, tăng lương
  public static rewardEmployee(employee: EmployeeAIEntity, bonusAmount: number): { happinessGain: number; trustGain: number } {
    const happinessGain = Math.min(35, Math.floor(bonusAmount / 500000) * 4);
    const trustGain = Math.min(25, Math.floor(bonusAmount / 500000) * 3);

    employee.happiness = Math.min(100, employee.happiness + happinessGain);
    employee.ceoTrust = Math.min(100, employee.ceoTrust + trustGain);
    employee.resentment = Math.max(0, employee.resentment - (happinessGain + 5));
    employee.loyalty = Math.min(100, employee.loyalty + 10);

    if (employee.isStriking) {
      employee.isStriking = false;
      employee.currentState = 'HAPPY';
    }

    employee.memoryLog.push(`Được CEO thưởng nóng ${(bonusAmount).toLocaleString('vi-VN')} VNĐ.`);
    soundManager.playSuccess();

    return { happinessGain, trustGain };
  }

  // Tăng lương định kỳ
  public static raiseSalary(employee: EmployeeAIEntity, newSalary: number) {
    const diff = newSalary - employee.currentSalary;
    employee.currentSalary = newSalary;

    if (newSalary >= employee.expectedSalary) {
      employee.resentment = Math.max(0, employee.resentment - 40);
      employee.ceoTrust = Math.min(100, employee.ceoTrust + 30);
      employee.loyalty = Math.min(100, employee.loyalty + 25);
      employee.happiness = Math.min(100, employee.happiness + 35);
      employee.isStriking = false;
      employee.currentState = 'CELEBRATE';
    }

    employee.memoryLog.push(`Được nâng lương lên ${newSalary.toLocaleString('vi-VN')} VNĐ/tháng.`);
  }

  // Đàm phán giải quyết đình công 1-1
  public static resolveStrikeNegotiation(employee: EmployeeAIEntity, offerCompensation: boolean): boolean {
    if (offerCompensation) {
      employee.isStriking = false;
      employee.resentment = Math.max(20, employee.resentment - 45);
      employee.ceoTrust = Math.min(100, employee.ceoTrust + 20);
      employee.currentState = 'HAPPY';
      employee.memoryLog.push('Đã đạt thỏa thuận hòa giải đình công với CEO.');
      return true;
    } else {
      employee.resentment = Math.min(100, employee.resentment + 15);
      employee.ceoTrust = Math.max(0, employee.ceoTrust - 20);
      return false;
    }
  }

  // Danh sách ứng viên tiềm năng ban đầu khi đăng tin tuyển dụng
  public static generateRecruitmentPool(): CandidateEntity[] {
    return [
      {
        id: 'cand_1',
        name: 'Trần Văn Hoàng',
        gender: 'MALE',
        avatarSeed: 101,
        role: 'FRONTEND',
        level: 'JUNIOR',
        experienceYears: 1.5,
        speed: 60,
        quality: 65,
        bugRate: 15,
        expectedSalary: 12000000,
        energy: 100,
        happiness: 80,
        stress: 15,
        resentment: 5,
        loyalty: 70,
        ceoTrust: 75,
        ambition: 60,
        bio: 'Sinh viên ĐH Bách Khoa mới ra trường, thành thạo React và TypeScript, nhiệt huyết và chịu khó học hỏi.',
        personality: 'HARDWORKING',
        memoryLog: ['Ứng tuyển vào công ty với mong muốn học hỏi kinh nghiệm.']
      },
      {
        id: 'cand_2',
        name: 'Nguyễn Thị Mai',
        gender: 'FEMALE',
        avatarSeed: 102,
        role: 'BACKEND',
        level: 'MID',
        experienceYears: 3,
        speed: 75,
        quality: 82,
        bugRate: 10,
        expectedSalary: 22000000,
        energy: 95,
        happiness: 75,
        stress: 20,
        resentment: 0,
        loyalty: 80,
        ceoTrust: 70,
        ambition: 70,
        bio: 'Chuyên gia Node.js & cơ sở dữ liệu PostgreSQL. Từng làm tại fintech, viết API chuẩn chỉnh và bảo mật.',
        personality: 'PRAGMATIC',
        memoryLog: ['Mong muốn môi trường minh bạch và mức lương xứng đáng.']
      },
      {
        id: 'cand_3',
        name: 'Lê Quốc Bảo',
        gender: 'MALE',
        avatarSeed: 103,
        role: 'FULLSTACK',
        level: 'SENIOR',
        experienceYears: 6,
        speed: 90,
        quality: 92,
        bugRate: 5,
        expectedSalary: 38000000,
        energy: 90,
        happiness: 70,
        stress: 30,
        resentment: 10,
        loyalty: 65,
        ceoTrust: 65,
        ambition: 90,
        bio: 'Senior Architect dày dạn kinh nghiệm. Có khả năng gánh vác các dự án quy mô lớn và quản lý đội ngũ.',
        personality: 'AMBITIOUS',
        memoryLog: ['Tìm kiếm cơ hội nhận cổ phần ESOP trong tương lai.']
      },
      {
        id: 'cand_4',
        name: 'Đỗ Thùy Linh',
        gender: 'FEMALE',
        avatarSeed: 104,
        role: 'DESIGNER',
        level: 'MID',
        experienceYears: 2.5,
        speed: 70,
        quality: 88,
        bugRate: 8,
        expectedSalary: 18000000,
        energy: 90,
        happiness: 85,
        stress: 15,
        resentment: 0,
        loyalty: 85,
        ceoTrust: 80,
        ambition: 65,
        bio: 'UI/UX Designer tốt nghiệp Mỹ thuật Công nghiệp, có gu thẩm mỹ hiện đại, thiết kế Chibi và Web cao cấp.',
        personality: 'LOYAL',
        memoryLog: ['Đam mê tạo ra các sản phẩm công nghệ đẹp mắt.']
      },
      {
        id: 'cand_5',
        name: 'Phạm Minh Tuấn',
        gender: 'MALE',
        avatarSeed: 105,
        role: 'TESTER',
        level: 'JUNIOR',
        experienceYears: 1,
        speed: 65,
        quality: 78,
        bugRate: 12,
        expectedSalary: 10000000,
        energy: 95,
        happiness: 80,
        stress: 10,
        resentment: 0,
        loyalty: 75,
        ceoTrust: 75,
        ambition: 50,
        bio: 'Cẩn thận, tỉ mỉ, kiên nhẫn tìm bug trong các kịch bản người dùng phức tạp.',
        personality: 'HARDWORKING',
        memoryLog: ['Mong muốn môi trường thân thiện và có lộ trình thăng tiến.']
      }
    ];
  }
}
