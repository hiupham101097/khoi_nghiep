// ============================================================================
// CEO EMPIRE: WORLD DATA & MAP ARCHITECTURE
// ============================================================================

import { Position2D } from '../../types';

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteractiveZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  actionType: 
    | 'ENTER_SCENE' 
    | 'INTERACT_DESK' 
    | 'OPEN_COMPANY_MENU' 
    | 'TALK_NPC' 
    | 'SLEEP_REST' 
    | 'USE_COFFEE' 
    | 'OPEN_BANK' 
    | 'OPEN_TAX' 
    | 'OPEN_RECRUIT' 
    | 'OPEN_PROJECTS'
    | 'OPEN_COURT';
  targetScene?: 'CITY' | 'ROOM' | 'OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT';
  targetSpawn?: Position2D;
  data?: Record<string, unknown>;
}

export interface MapSceneConfig {
  id: 'CITY' | 'ROOM' | 'OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT';
  name: string;
  width: number;
  height: number;
  defaultSpawn: Position2D;
  colliders: CollisionBox[];
  interactiveZones: InteractiveZone[];
  deskPositions: Position2D[];
}

export const WORLD_MAPS: Record<string, MapSceneConfig> = {
  CITY: {
    id: 'CITY',
    name: 'Đô Thị Khởi Nghiệp (Hà Nội / Sài Gòn)',
    width: 1200,
    height: 800,
    defaultSpawn: { x: 200, y: 440 },
    colliders: [
      // Viền bản đồ
      { x: 0, y: 0, width: 1200, height: 40 },
      { x: 0, y: 760, width: 1200, height: 40 },
      { x: 0, y: 0, width: 40, height: 800 },
      { x: 1160, y: 0, width: 40, height: 800 },

      // Dãy Tòa Nhà Phía Bắc (Biệt thự & StartUp Tower)
      { x: 100, y: 40, width: 220, height: 180 },  // Khu Nhà Trọ Sinh Viên
      { x: 380, y: 40, width: 280, height: 200 },  // StartUp Tower (Tòa Văn Phòng)
      { x: 740, y: 40, width: 380, height: 220 },  // Dinh Thự Họ Hoàng (Biệt thự)

      // Cụm Công Trình Phía Nam
      { x: 80, y: 520, width: 220, height: 200 },   // Quán Cà Phê Cóc & StartUp Hub
      { x: 360, y: 520, width: 220, height: 200 },  // Ngân Hàng V-Bank
      { x: 640, y: 520, width: 220, height: 200 },  // Chi Cục Thuế & ĐKKD
      { x: 920, y: 500, width: 240, height: 220 },  // Tòa Án & Cơ Quan Pháp Luật
    ],
    interactiveZones: [
      {
        id: 'door_room',
        name: 'Phòng Trọ Sinh Viên (15m²)',
        x: 180,
        y: 220,
        width: 60,
        height: 40,
        prompt: 'Nhấn [E] để vào phòng trọ',
        actionType: 'ENTER_SCENE',
        targetScene: 'ROOM',
        targetSpawn: { x: 200, y: 320 }
      },
      {
        id: 'door_office',
        name: 'Tòa Nhà StartUp Tower (Văn Phòng)',
        x: 480,
        y: 240,
        width: 80,
        height: 40,
        prompt: 'Nhấn [E] để vào văn phòng công ty',
        actionType: 'ENTER_SCENE',
        targetScene: 'OFFICE',
        targetSpawn: { x: 350, y: 460 }
      },
      {
        id: 'door_villa',
        name: 'Dinh Thự Họ Hoàng (Bố Người Yêu)',
        x: 880,
        y: 260,
        width: 80,
        height: 40,
        prompt: 'Nhấn [E] để vào Biệt thự Hoàng Gia',
        actionType: 'ENTER_SCENE',
        targetScene: 'VILLA',
        targetSpawn: { x: 400, y: 440 }
      },
      {
        id: 'door_cafe',
        name: 'Quán Cà Phê StartUp Hub',
        x: 160,
        y: 480,
        width: 70,
        height: 40,
        prompt: 'Nhấn [E] để vào quán cà phê (Hẹn hò / Tuyển dụng)',
        actionType: 'ENTER_SCENE',
        targetScene: 'CAFE',
        targetSpawn: { x: 280, y: 380 }
      },
      {
        id: 'door_bank',
        name: 'Ngân Hàng V-Bank',
        x: 440,
        y: 480,
        width: 70,
        height: 40,
        prompt: 'Nhấn [E] để vào Ngân hàng V-Bank (Vay vốn / Sao kê)',
        actionType: 'ENTER_SCENE',
        targetScene: 'BANK',
        targetSpawn: { x: 300, y: 360 }
      },
      {
        id: 'door_tax',
        name: 'Cơ Quan Đăng Ký Kinh Doanh & Thuế',
        x: 720,
        y: 480,
        width: 70,
        height: 40,
        prompt: 'Nhấn [E] để vào Cơ quan Thuế & Đăng ký doanh nghiệp',
        actionType: 'OPEN_TAX'
      },
      {
        id: 'door_court',
        name: 'Tòa Án Nhân Dân Thành Phố',
        x: 1000,
        y: 460,
        width: 80,
        height: 40,
        prompt: 'Nhấn [E] để vào Tòa Án (Xem xét pháp lý / Kiện tụng)',
        actionType: 'ENTER_SCENE',
        targetScene: 'COURT',
        targetSpawn: { x: 350, y: 380 }
      }
    ],
    deskPositions: []
  },

  ROOM: {
    id: 'ROOM',
    name: 'Phòng Trọ 15m² Của Bạn',
    width: 600,
    height: 450,
    defaultSpawn: { x: 280, y: 360 },
    colliders: [
      { x: 0, y: 0, width: 600, height: 40 },
      { x: 0, y: 410, width: 600, height: 40 },
      { x: 0, y: 0, width: 40, height: 450 },
      { x: 560, y: 0, width: 40, height: 450 },
      // Giường ngủ
      { x: 60, y: 60, width: 140, height: 180 },
      // Bàn làm việc & laptop cũ
      { x: 360, y: 60, width: 160, height: 90 },
      // Tủ quần áo & quạt máy
      { x: 60, y: 260, width: 90, height: 120 }
    ],
    interactiveZones: [
      {
        id: 'room_door_exit',
        name: 'Cửa Ra Đường Phố',
        x: 250,
        y: 390,
        width: 80,
        height: 30,
        prompt: 'Nhấn [E] để ra ngoài phố',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 210, y: 250 }
      },
      {
        id: 'room_bed',
        name: 'Giường Ngủ Đơn Sơ',
        x: 80,
        y: 70,
        width: 100,
        height: 140,
        prompt: 'Nhấn [E] để ngủ nghỉ (Hồi phục 100% năng lượng, qua ngày mới)',
        actionType: 'SLEEP_REST'
      },
      {
        id: 'room_laptop',
        name: 'Laptop Cũ Của Bạn',
        x: 390,
        y: 70,
        width: 100,
        height: 70,
        prompt: 'Nhấn [E] để mở Bảng Điều Hành CEO Dashboard',
        actionType: 'OPEN_COMPANY_MENU'
      }
    ],
    deskPositions: [{ x: 440, y: 120 }]
  },

  OFFICE: {
    id: 'OFFICE',
    name: 'Văn Phòng Công Ty',
    width: 800,
    height: 550,
    defaultSpawn: { x: 380, y: 470 },
    colliders: [
      { x: 0, y: 0, width: 800, height: 40 },
      { x: 0, y: 510, width: 800, height: 40 },
      { x: 0, y: 0, width: 40, height: 550 },
      { x: 760, y: 0, width: 40, height: 550 },

      // Bàn CEO
      { x: 80, y: 60, width: 140, height: 80 },
      // Bàn Pantry & Cà phê
      { x: 600, y: 60, width: 140, height: 70 },
      // Cụm bàn làm việc số 1 (Devs)
      { x: 120, y: 200, width: 220, height: 90 },
      // Cụm bàn làm việc số 2 (Design & QA)
      { x: 440, y: 200, width: 220, height: 90 },
      // Cụm bàn làm việc số 3
      { x: 120, y: 340, width: 220, height: 90 },
      // Khu giải trí bi-lắc / server
      { x: 440, y: 340, width: 220, height: 90 }
    ],
    interactiveZones: [
      {
        id: 'office_door_exit',
        name: 'Cửa Ra Khỏi Văn Phòng',
        x: 340,
        y: 490,
        width: 100,
        height: 30,
        prompt: 'Nhấn [E] để rời văn phòng ra phố',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 520, y: 270 }
      },
      {
        id: 'office_ceo_desk',
        name: 'Bàn Làm Việc Của CEO',
        x: 100,
        y: 60,
        width: 100,
        height: 70,
        prompt: 'Nhấn [E] để điều hành doanh nghiệp (Quản lý dự án / Nhân sự / Tài chính)',
        actionType: 'OPEN_COMPANY_MENU'
      },
      {
        id: 'office_coffee',
        name: 'Máy Pha Cà Phê Pantry',
        x: 620,
        y: 60,
        width: 100,
        height: 60,
        prompt: 'Nhấn [E] uống cà phê giải tỏa căng thẳng',
        actionType: 'USE_COFFEE'
      },
      {
        id: 'office_whiteboard',
        name: 'Bảng Kanban & Chiến Lược Sprint',
        x: 320,
        y: 10,
        width: 140,
        height: 65,
        prompt: 'Nhấn [E] xem Bảng Kanban & Điều chỉnh Chiến lược Sprint',
        actionType: 'OPEN_PROJECTS'
      }
    ],
    deskPositions: [
      { x: 150, y: 230 },
      { x: 270, y: 230 },
      { x: 470, y: 230 },
      { x: 590, y: 230 },
      { x: 150, y: 370 },
      { x: 270, y: 370 },
      { x: 470, y: 370 },
      { x: 590, y: 370 }
    ]
  },

  VILLA: {
    id: 'VILLA',
    name: 'Biệt Thự Hoàng Gia — Nhà Bố Lan Anh',
    width: 800,
    height: 520,
    defaultSpawn: { x: 380, y: 440 },
    colliders: [
      { x: 0, y: 0, width: 800, height: 40 },
      { x: 0, y: 480, width: 800, height: 40 },
      { x: 0, y: 0, width: 40, height: 520 },
      { x: 760, y: 0, width: 40, height: 520 },

      // Bàn tiếp khách cẩm thạch & Ghế bành chủ tịch
      { x: 300, y: 150, width: 200, height: 100 },
      // Đàn piano lớn góc trái
      { x: 80, y: 70, width: 140, height: 120 },
      // Tủ rượu ngoại & cổ vật
      { x: 580, y: 60, width: 150, height: 100 }
    ],
    interactiveZones: [
      {
        id: 'villa_door_exit',
        name: 'Cổng Biệt Thự Ra Ngoài',
        x: 350,
        y: 460,
        width: 80,
        height: 30,
        prompt: 'Nhấn [E] để rời Biệt thự',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 920, y: 280 }
      },
      {
        id: 'villa_father_chair',
        name: 'Bàn Trà Ông Hoàng Thế Vinh',
        x: 330,
        y: 160,
        width: 140,
        height: 80,
        prompt: 'Nhấn [E] để đối thoại với Bố Lan Anh',
        actionType: 'TALK_NPC'
      }
    ],
    deskPositions: []
  },

  CAFE: {
    id: 'CAFE',
    name: 'Quán Cà Phê StartUp Hub',
    width: 700,
    height: 500,
    defaultSpawn: { x: 320, y: 430 },
    colliders: [
      { x: 0, y: 0, width: 700, height: 40 },
      { x: 0, y: 460, width: 700, height: 40 },
      { x: 0, y: 0, width: 40, height: 500 },
      { x: 660, y: 0, width: 40, height: 500 },

      // Quầy bar pha chế
      { x: 60, y: 60, width: 220, height: 90 },
      // Bàn hẹn hò đôi
      { x: 440, y: 100, width: 140, height: 80 },
      // Bàn nhóm thảo luận
      { x: 180, y: 260, width: 180, height: 90 },
      // Bàn làm việc freelance
      { x: 460, y: 260, width: 160, height: 90 }
    ],
    interactiveZones: [
      {
        id: 'cafe_door_exit',
        name: 'Cửa Ra Ngoài Đường',
        x: 290,
        y: 440,
        width: 80,
        height: 30,
        prompt: 'Nhấn [E] để ra ngoài đường',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 180, y: 490 }
      },
      {
        id: 'cafe_lan_anh_table',
        name: 'Bàn Lan Anh Ngồi',
        x: 450,
        y: 110,
        width: 120,
        height: 60,
        prompt: 'Nhấn [E] để trò chuyện / Hẹn hò cùng Lan Anh',
        actionType: 'TALK_NPC'
      },
      {
        id: 'cafe_recruit_board',
        name: 'Khu Giao Lưu Lập Trình Viên',
        x: 480,
        y: 270,
        width: 120,
        height: 70,
        prompt: 'Nhấn [E] để phỏng vấn / Săn đón nhân sự tài năng',
        actionType: 'OPEN_RECRUIT'
      }
    ],
    deskPositions: []
  },

  BANK: {
    id: 'BANK',
    name: 'Ngân Hàng Thương Mại V-Bank',
    width: 650,
    height: 450,
    defaultSpawn: { x: 300, y: 390 },
    colliders: [
      { x: 0, y: 0, width: 650, height: 40 },
      { x: 0, y: 410, width: 650, height: 40 },
      { x: 0, y: 0, width: 40, height: 450 },
      { x: 610, y: 0, width: 40, height: 450 },
      // Quầy giao dịch kính chống đạn
      { x: 80, y: 80, width: 480, height: 80 }
    ],
    interactiveZones: [
      {
        id: 'bank_door_exit',
        name: 'Cửa Ra Ngân Hàng',
        x: 270,
        y: 390,
        width: 80,
        height: 30,
        prompt: 'Nhấn [E] để ra ngoài',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 470, y: 490 }
      },
      {
        id: 'bank_teller',
        name: 'Quầy Tín Dụng & Vay Vốn Doanh Nghiệp',
        x: 260,
        y: 90,
        width: 140,
        height: 60,
        prompt: 'Nhấn [E] gặp Giám đốc tín dụng (Vay vốn / Trả nợ / Báo cáo tài chính)',
        actionType: 'OPEN_BANK'
      }
    ],
    deskPositions: []
  },

  COURT: {
    id: 'COURT',
    name: 'Tòa Án Nhân Dân Thành Phố',
    width: 750,
    height: 500,
    defaultSpawn: { x: 360, y: 430 },
    colliders: [
      { x: 0, y: 0, width: 750, height: 40 },
      { x: 0, y: 460, width: 750, height: 40 },
      { x: 0, y: 0, width: 40, height: 500 },
      { x: 710, y: 0, width: 40, height: 500 },

      // Bục Thẩm Phán & Hội Đồng Xét Xử
      { x: 260, y: 60, width: 240, height: 90 },
      // Vành móng ngựa (Bị cáo)
      { x: 320, y: 240, width: 120, height: 60 },
      // Bàn Luật sư & Viện kiểm sát
      { x: 100, y: 180, width: 140, height: 70 },
      { x: 520, y: 180, width: 140, height: 70 }
    ],
    interactiveZones: [
      {
        id: 'court_door_exit',
        name: 'Cửa Ra Tòa Án',
        x: 330,
        y: 440,
        width: 80,
        height: 30,
        prompt: 'Nhấn [E] để ra ngoài',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 1020, y: 480 }
      },
      {
        id: 'court_bench',
        name: 'Hội Đồng Thẩm Phán',
        x: 310,
        y: 70,
        width: 140,
        height: 70,
        prompt: 'Nhấn [E] xem tình trạng hồ sơ pháp lý & tố tụng',
        actionType: 'OPEN_COURT'
      }
    ],
    deskPositions: []
  }
};
