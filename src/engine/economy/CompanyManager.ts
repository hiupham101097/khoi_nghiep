// ============================================================================
// CEO EMPIRE: COMPANY & OFFICE MANAGEMENT
// ============================================================================

import { OfficeTier, FurnitureItem } from '../../types';

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
