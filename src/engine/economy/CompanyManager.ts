// ============================================================================
// CEO EMPIRE: COMPANY & ENTERPRISE GROWTH SYSTEM (5 Giai Đoạn Phát Triển)
// ============================================================================

import { OfficeTier, FurnitureItem, EnterpriseStage, EnterpriseStageId } from '../../types';

export const ENTERPRISE_STAGES: Record<EnterpriseStageId, EnterpriseStage> = {
  STAGE_1_BOOTSTRAP: {
    id: 'STAGE_1_BOOTSTRAP',
    level: 1,
    name: 'Cá Nhân Khởi Nghiệp',
    title: 'Sole Founder / Freelance Studio',
    tagline: 'Vạn sự khởi đầu nan — Tự lực cánh sinh với 500 triệu đầu tiên',
    requiredValuation: 0,
    requiredCompletedProjects: 0,
    requiredHeadcount: 0,
    unlockedPerks: [
      'Tự do nhận dự án nhỏ và vừa',
      'Làm việc tại phòng trọ hoặc thuê văn phòng nhỏ',
      'Quản lý trực tiếp không phát sinh chi phí trung gian'
    ]
  },
  STAGE_2_STARTUP: {
    id: 'STAGE_2_STARTUP',
    level: 2,
    name: 'Startup Công Nghệ Trẻ',
    title: 'Early-Stage Tech Startup',
    tagline: 'Xây dựng đội ngũ nòng cốt và định hình sản phẩm chủ lực',
    requiredValuation: 1000000000, // 1 Tỷ VNĐ
    requiredCompletedProjects: 2,
    requiredHeadcount: 2,
    unlockedPerks: [
      'Mở khóa Văn phòng Shophouse (10 chỗ)',
      'Tuyển dụng Senior Fullstack & UI/UX Designer',
      'Mở khóa họp Daily Standup 09:00 sáng tại bảng Kanban',
      'Nhận dự án khách hàng SME trị giá trên 100 triệu'
    ]
  },
  STAGE_3_SCALING: {
    id: 'STAGE_3_SCALING',
    level: 3,
    name: 'Công Ty Đang Phát Triển',
    title: 'Scaling Technology Company',
    tagline: 'Phân quyền quản lý, tuyển Tech Lead và chuẩn hóa quy trình Agile',
    requiredValuation: 3000000000, // 3 Tỷ VNĐ
    requiredCompletedProjects: 5,
    requiredHeadcount: 5,
    unlockedPerks: [
      'Mở khóa bổ nhiệm Trưởng Nhóm Kỹ Thuật (Tech Lead / PM)',
      'Tech Lead tự động hỗ trợ fix bug và tối ưu sprint',
      'Mở khóa Chiến Lược Sprint (Chất lượng, Chạy tiến độ, Refactor)',
      'Mở gói tín dụng vay vốn ngân hàng hạn mức 500 triệu'
    ]
  },
  STAGE_4_ENTERPRISE: {
    id: 'STAGE_4_ENTERPRISE',
    level: 4,
    name: 'Doanh Nghiệp Quy Mô Vừa',
    title: 'Mid-Sized Tech Enterprise',
    tagline: 'Đa phòng ban chuyên trách: R&D, UI/UX, QA, Kế toán & Nhân sự',
    requiredValuation: 10000000000, // 10 Tỷ VNĐ
    requiredCompletedProjects: 10,
    requiredHeadcount: 8,
    unlockedPerks: [
      'Mở khóa Tòa Tháp Bitexco Landmark Hạng A (25 chỗ)',
      'Phòng ban tự chủ: Bộ phận HR tự động lọc CV ứng viên tài năng',
      'Nhận thầu dự án Enterprise & Ngân hàng quốc gia (>500 triệu)',
      'Ông Hoàng Thế Vinh chính thức công nhận năng lực lãnh đạo'
    ]
  },
  STAGE_5_CONGLOMERATE: {
    id: 'STAGE_5_CONGLOMERATE',
    level: 5,
    name: 'Tập Đoàn Công Nghệ Kỳ Lân',
    title: 'Unicorn Tech Conglomerate',
    tagline: 'Hội đồng quản trị, cổ phần ESOP và chi phối thị trường công nghệ',
    requiredValuation: 25000000000, // 25 Tỷ VNĐ
    requiredCompletedProjects: 18,
    requiredHeadcount: 15,
    unlockedPerks: [
      'Mở khóa Hội đồng Quản trị & Kêu gọi vốn Shark Fund 5 - 10 tỷ',
      'Chương trình cổ phần thưởng ESOP giữ chân 100% nhân sự cốt lõi',
      'Mở khóa điều kiện chiến thắng vinh quang: Ending 01 — Kỳ Lân Công Nghệ'
    ]
  }
};

export class CompanyGrowthEngine {
  public static evaluateStage(
    valuation: number,
    completedProjects: number,
    headcount: number
  ): EnterpriseStageId {
    if (valuation >= 25000000000 && completedProjects >= 18 && headcount >= 15) {
      return 'STAGE_5_CONGLOMERATE';
    }
    if (valuation >= 10000000000 && completedProjects >= 10 && headcount >= 8) {
      return 'STAGE_4_ENTERPRISE';
    }
    if (valuation >= 3000000000 && completedProjects >= 5 && headcount >= 5) {
      return 'STAGE_3_SCALING';
    }
    if (valuation >= 1000000000 && completedProjects >= 2 && headcount >= 2) {
      return 'STAGE_2_STARTUP';
    }
    return 'STAGE_1_BOOTSTRAP';
  }
}

export const AVAILABLE_OFFICES: OfficeTier[] = [
  {
    id: 'office_tier_1',
    name: 'Văn Phòng Hẻm Khởi Nghiệp (4 Chỗ)',
    address: 'Số 42/15 Hẻm Lương Định Của, Quận 2',
    monthlyRent: 15000000, // 15 triệu/tháng
    deposit: 15000000,
    maxDesks: 4,
    prestigeBonus: 5,
    description: 'Văn phòng nhỏ tiết kiệm chi phí, phù hợp với giai đoạn đầu xây dựng MVP và đội ngũ cốt lõi.',
    requiredReputation: 0
  },
  {
    id: 'office_tier_2',
    name: 'Shophouse Khu Công Nghệ (10 Chỗ)',
    address: 'Lô B8 Đường D1, Khu Công Nghệ Cao, TP. Thủ Đức',
    monthlyRent: 38000000, // 38 triệu/tháng
    deposit: 76000000,
    maxDesks: 10,
    prestigeBonus: 20,
    description: 'Văn phòng khang trang hiện đại, có phòng họp riêng, tạo dựng niềm tin với khách hàng doanh nghiệp.',
    requiredReputation: 30
  },
  {
    id: 'office_tier_3',
    name: 'Penthouse Tòa Tháp Hạng A (25 Chỗ)',
    address: 'Tầng 35 Bitexco Financial Tower, Quận 1',
    monthlyRent: 95000000, // 95 triệu/tháng
    deposit: 190000000,
    maxDesks: 25,
    prestigeBonus: 50,
    description: 'Đẳng cấp doanh nghiệp công nghệ hàng đầu, thu hút nhân tài Senior và các hợp đồng triệu USD.',
    requiredReputation: 65
  }
];

export const CATALOG_FURNITURE: FurnitureItem[] = [
  {
    id: 'item_desk_basic',
    name: 'Bàn Máy Tính Lập Trình Cơ Bản',
    type: 'DESK',
    cost: 5000000,
    monthlyMaintenance: 100000,
    bonus: { capacityBoost: 1 },
    purchased: false
  },
  {
    id: 'item_chair_ergo',
    name: 'Ghế Công Thái Học Ergonomic Cao Cấp',
    type: 'CHAIR_ERGONOMIC',
    cost: 8000000,
    monthlyMaintenance: 50000,
    bonus: { stressReduction: 30 },
    purchased: false
  },
  {
    id: 'item_coffee_espresso',
    name: 'Máy Pha Cà Phê Espresso Ý & Pantry Bar',
    type: 'COFFEE_MACHINE',
    cost: 25000000,
    monthlyMaintenance: 1500000,
    bonus: { energyRegen: 50 },
    purchased: false
  },
  {
    id: 'item_server_rack',
    name: 'Tủ Máy Chủ Server Rack & UPS Chống Sập',
    type: 'SERVER_RACK',
    cost: 60000000,
    monthlyMaintenance: 3000000,
    bonus: { bugReduction: 40 },
    purchased: false
  },
  {
    id: 'item_foosball',
    name: 'Bàn Bi-Lắc Giải Trí & PlayStation 5',
    type: 'FOOSBALL',
    cost: 20000000,
    monthlyMaintenance: 500000,
    bonus: { stressReduction: 40 },
    purchased: false
  },
  {
    id: 'item_plant',
    name: 'Cây Xanh Phong Thủy & Lọc Không Khí',
    type: 'PLANT',
    cost: 3000000,
    monthlyMaintenance: 100000,
    bonus: { stressReduction: 10 },
    purchased: false
  }
];
