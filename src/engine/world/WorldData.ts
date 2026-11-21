// ============================================================================
// CEO EMPIRE: WORLD DATA & MAP ARCHITECTURE
// ============================================================================

import { Position2D, SceneId, InteractiveDoor } from '../../types';

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
    | 'OPEN_COURT'
    | 'OPEN_ELEVATOR'
    | 'TOGGLE_DOOR'
    | 'USE_STAIRS'
    | 'USE_WC';
  targetScene?: SceneId;
  targetSpawn?: Position2D;
  doorId?: string;
  data?: Record<string, unknown>;
}

export interface MapSceneConfig {
  id: SceneId;
  name: string;
  width: number;
  height: number;
  defaultSpawn: Position2D;
  colliders: CollisionBox[];
  interactiveZones: InteractiveZone[];
  deskPositions: Position2D[];
  doors?: InteractiveDoor[];
  floorPlanImage?: string;
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
        x: 170,
        y: 210,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] để vào phòng trọ',
        actionType: 'ENTER_SCENE',
        targetScene: 'ROOM',
        targetSpawn: { x: 280, y: 360 }
      },
      {
        id: 'door_office',
        name: 'Trụ Sở StartUp Co. (Tòa Nhà 3 Tầng)',
        x: 460,
        y: 220,
        width: 120,
        height: 65,
        prompt: 'Nhấn [E] để vào khuôn viên Trụ Sở Công Ty',
        actionType: 'ENTER_SCENE',
        targetScene: 'COMPANY_EXTERIOR',
        targetSpawn: { x: 500, y: 720 }
      },
      {
        id: 'door_villa',
        name: 'Dinh Thự Họ Hoàng (Bố Người Yêu)',
        x: 860,
        y: 240,
        width: 120,
        height: 65,
        prompt: 'Nhấn [E] để vào Biệt thự Hoàng Gia',
        actionType: 'ENTER_SCENE',
        targetScene: 'VILLA',
        targetSpawn: { x: 380, y: 440 }
      },
      {
        id: 'door_cafe',
        name: 'Quán Cà Phê StartUp Hub',
        x: 145,
        y: 460,
        width: 100,
        height: 65,
        prompt: 'Nhấn [E] để vào quán cà phê (Hẹn hò / Tuyển dụng)',
        actionType: 'ENTER_SCENE',
        targetScene: 'CAFE',
        targetSpawn: { x: 320, y: 430 }
      },
      {
        id: 'door_bank',
        name: 'Ngân Hàng V-Bank',
        x: 425,
        y: 460,
        width: 100,
        height: 65,
        prompt: 'Nhấn [E] để vào Ngân hàng V-Bank (Vay vốn / Sao kê)',
        actionType: 'ENTER_SCENE',
        targetScene: 'BANK',
        targetSpawn: { x: 300, y: 390 }
      },
      {
        id: 'door_tax',
        name: 'Cơ Quan Đăng Ký Kinh Doanh & Thuế',
        x: 705,
        y: 460,
        width: 100,
        height: 65,
        prompt: 'Nhấn [E] để vào Cơ quan Thuế & Đăng ký doanh nghiệp',
        actionType: 'OPEN_TAX'
      },
      {
        id: 'door_court',
        name: 'Tòa Án Nhân Dân Thành Phố',
        x: 980,
        y: 450,
        width: 120,
        height: 65,
        prompt: 'Nhấn [E] để vào Tòa Án (Xem xét pháp lý / Kiện tụng)',
        actionType: 'ENTER_SCENE',
        targetScene: 'COURT',
        targetSpawn: { x: 360, y: 430 }
      },
      {
        id: 'npc_security_zone',
        name: 'Bác Ba - Bảo Vệ StartUp Tower',
        x: 420,
        y: 220,
        width: 80,
        height: 65,
        prompt: 'Nhấn [E] để trò chuyện với Bác Ba Bảo Vệ',
        actionType: 'TALK_NPC'
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
      // Quầy Pantry, Cà phê & Cây nước nóng lạnh (Ảnh 1)
      { x: 570, y: 55, width: 175, height: 75 },
      // Kệ sách, Điều hòa cây & Máy in photo góc tường trái (Ảnh 1 & 4)
      { x: 38, y: 55, width: 42, height: 110 },
      { x: 38, y: 185, width: 36, height: 90 },
      { x: 38, y: 345, width: 42, height: 70 },
      // Cụm bàn làm việc số 1 (Engineering Pod)
      { x: 110, y: 195, width: 220, height: 90 },
      // Cụm bàn làm việc số 2 (Product & Design Pod)
      { x: 440, y: 195, width: 220, height: 90 },
      // Cụm bàn làm việc số 3 (Quality & Ops Pod)
      { x: 110, y: 335, width: 220, height: 90 },
      // Khu vực Bàn họp & Thuyết trình chiến lược (Ảnh 2 & 3)
      { x: 440, y: 335, width: 220, height: 95 }
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
        x: 90,
        y: 60,
        width: 120,
        height: 80,
        prompt: 'Nhấn [E] để điều hành doanh nghiệp (Quản lý dự án / Nhân sự / Tài chính)',
        actionType: 'OPEN_COMPANY_MENU'
      },
      {
        id: 'office_coffee',
        name: 'Máy Pha Cà Phê & Cây Nước Pantry',
        x: 580,
        y: 55,
        width: 150,
        height: 75,
        prompt: 'Nhấn [E] uống cà phê giải tỏa căng thẳng (+20 Năng Lượng)',
        actionType: 'USE_COFFEE'
      },
      {
        id: 'office_whiteboard',
        name: 'Bảng Kanban & Chiến Lược Sprint',
        x: 320,
        y: 4,
        width: 150,
        height: 60,
        prompt: 'Nhấn [E] xem Bảng Kanban & Điều chỉnh Chiến lược Sprint',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'office_meeting_table',
        name: 'Bàn Họp & Thuyết Trình Tăng Trưởng',
        x: 450,
        y: 335,
        width: 200,
        height: 95,
        prompt: 'Nhấn [E] họp bàn chiến lược dự án & phân công nhân sự',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'office_copier',
        name: 'Máy In & Photocopy Hồ Sơ Hợp Đồng',
        x: 38,
        y: 345,
        width: 50,
        height: 70,
        prompt: 'Nhấn [E] in ấn hồ sơ thầu & hợp đồng công nghệ',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'office_door_to_ceo',
        name: 'Cửa Vào Phòng Chủ Tịch (CEO Executive Suite)',
        x: 220,
        y: 40,
        width: 70,
        height: 35,
        prompt: 'Nhấn [E] vào Phòng Chủ Tịch (CEO Executive Suite)',
        actionType: 'ENTER_SCENE',
        targetScene: 'CEO_OFFICE',
        targetSpawn: { x: 380, y: 460 }
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

  CEO_OFFICE: {
    id: 'CEO_OFFICE',
    name: 'Phòng Chủ Tịch & Điều Hành Cấp Cao (CEO Suite)',
    width: 800,
    height: 550,
    defaultSpawn: { x: 380, y: 460 },
    colliders: [
      { x: 0, y: 0, width: 800, height: 40 },
      { x: 0, y: 510, width: 800, height: 40 },
      { x: 0, y: 0, width: 40, height: 550 },
      { x: 760, y: 0, width: 40, height: 550 },

      // Bàn CEO Chủ Tịch gỗ óc chó nẹp chỉ vàng
      { x: 260, y: 165, width: 280, height: 100 },
      // Kệ sách lớn âm tường có đèn LED
      { x: 40, y: 55, width: 180, height: 160 },
      // Khu vực sofa tiếp khách cấp cao
      { x: 270, y: 350, width: 330, height: 130 },
      // Quầy Espresso Bar & Tủ rượu
      { x: 630, y: 200, width: 125, height: 100 }
    ],
    interactiveZones: [
      {
        id: 'ceo_door_back_office',
        name: 'Cửa Ra Khu Làm Việc Chung',
        x: 330,
        y: 490,
        width: 100,
        height: 30,
        prompt: 'Nhấn [E] ra Văn Phòng Làm Việc Chung',
        actionType: 'ENTER_SCENE',
        targetScene: 'OFFICE',
        targetSpawn: { x: 250, y: 120 }
      },
      {
        id: 'ceo_desk_suite',
        name: 'Bàn Điều Hành Chủ Tịch',
        x: 270,
        y: 160,
        width: 260,
        height: 95,
        prompt: 'Nhấn [E] mở Bảng Điều Hành Doanh Nghiệp (CEO Suite)',
        actionType: 'OPEN_COMPANY_MENU'
      },
      {
        id: 'ceo_guest_lounge',
        name: 'Khu Tiếp Khách & Phỏng Vấn Cấp Cao',
        x: 280,
        y: 350,
        width: 290,
        height: 115,
        prompt: 'Nhấn [E] mở Sàn Tuyển Dụng & Phỏng Vấn Nhân Sự',
        actionType: 'OPEN_RECRUIT'
      },
      {
        id: 'ceo_espresso_bar',
        name: 'Quầy Espresso Thượng Hạng',
        x: 640,
        y: 200,
        width: 100,
        height: 90,
        prompt: 'Nhấn [E] thưởng thức cà phê Espresso thượng hạng (+30 Năng Lượng)',
        actionType: 'USE_COFFEE'
      }
    ],
    deskPositions: [{ x: 380, y: 140 }]
  },

  VILLA: {
    id: 'VILLA',
    name: 'Biệt Thự Hoàng Gia — Nhà Bố Lan Anh',
    width: 1024,
    height: 576,
    defaultSpawn: { x: 490, y: 480 },
    floorPlanImage: '/villa_refs/villa_living_room.jpg',
    colliders: [
      // Tường bao quanh phòng khách biệt thự
      { x: 0, y: 0, width: 1024, height: 45 },
      { x: 0, y: 0, width: 45, height: 576 },
      { x: 979, y: 0, width: 45, height: 576 },
      { x: 0, y: 531, width: 430, height: 45 },
      { x: 570, y: 531, width: 454, height: 45 },

      // Đàn Đại Dương Cầm Grand Piano góc trái
      { x: 55, y: 215, width: 155, height: 165 },

      // Tủ sách & Lò sưởi cẩm thạch phía Bắc
      { x: 245, y: 45, width: 85, height: 170 },
      { x: 345, y: 45, width: 160, height: 160 },
      { x: 520, y: 45, width: 85, height: 170 },

      // Tượng bán thân & Cầu thang vòm uốn lượn góc phải
      { x: 645, y: 195, width: 50, height: 75 },
      { x: 685, y: 45, width: 235, height: 260 },

      // Cụm bàn ghế hoàng gia tiếp khách trung tâm
      { x: 350, y: 215, width: 175, height: 65 },  // Sofa chính
      { x: 375, y: 305, width: 130, height: 55 },  // Bàn trà cẩm thạch & Vali 500 triệu
      { x: 265, y: 265, width: 70, height: 75 },   // Ghế bành bọc da bên trái
      { x: 535, y: 265, width: 70, height: 75 },   // Ghế bành bọc da bên phải
      { x: 390, y: 385, width: 100, height: 35 },  // Ghế đôn dài phía dưới
      { x: 300, y: 230, width: 40, height: 40 },   // Bàn góc đèn bàn trái
      { x: 520, y: 230, width: 40, height: 40 },   // Bàn góc đèn bàn phải

      // Bệ hoa cửa sổ kính phía dưới
      { x: 90, y: 490, width: 220, height: 45 },
      { x: 740, y: 490, width: 220, height: 45 },
      // Bàn console góc dưới phải
      { x: 895, y: 345, width: 65, height: 80 }
    ],
    interactiveZones: [
      {
        id: 'villa_briefcase_500m',
        name: 'Vali 500 Triệu Đồng',
        x: 375,
        y: 305,
        width: 130,
        height: 60,
        prompt: 'Nhấn [E] xem Vali 500.000.000 VNĐ tiền mặt của Ông Vinh',
        actionType: 'TALK_NPC'
      },
      {
        id: 'villa_father_chair',
        name: 'Bố Lan Anh (Ông Hoàng Thế Vinh)',
        x: 420,
        y: 215,
        width: 60,
        height: 60,
        prompt: 'Nhấn [E] để đối thoại với Bố Lan Anh',
        actionType: 'TALK_NPC'
      },
      {
        id: 'villa_lan_anh',
        name: 'Hoàng Lan Anh',
        x: 310,
        y: 270,
        width: 60,
        height: 60,
        prompt: 'Nhấn [E] trò chuyện với Lan Anh',
        actionType: 'TALK_NPC'
      },
      {
        id: 'villa_piano',
        name: 'Đại Dương Cầm Steinway',
        x: 80,
        y: 230,
        width: 110,
        height: 80,
        prompt: 'Nhấn [E] chiêm ngưỡng cây đàn piano bạc tỷ',
        actionType: 'TALK_NPC'
      },
      {
        id: 'villa_door_exit',
        name: 'Cổng Biệt Thự Ra Ngoài',
        x: 430,
        y: 520,
        width: 120,
        height: 45,
        prompt: 'Nhấn [E] để rời Biệt thự',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 920, y: 280 }
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
  },

  // ============================================================================
  // KHU VỰC MẶT TIỀN & NGOẠI CẢNH CÔNG TY (3 TẦNG KÍNH + CHỐT BẢO VỆ + BARRIER)
  // ============================================================================
  COMPANY_EXTERIOR: {
    id: 'COMPANY_EXTERIOR',
    name: 'Khuôn Viên Trụ Sở StartUp Co. (Mặt Tiền)',
    width: 1200,
    height: 800,
    defaultSpawn: { x: 500, y: 720 },
    floorPlanImage: '/building_refs/overview_3floors.jpg',
    colliders: [
      // Viền bản đồ
      { x: 0, y: 0, width: 1200, height: 40 },
      { x: 0, y: 760, width: 1200, height: 40 },
      { x: 0, y: 0, width: 40, height: 800 },
      { x: 1160, y: 0, width: 40, height: 800 },

      // Khối Tòa nhà 3 tầng mặt tiền phía Bắc (kính & tường chịu lực)
      { x: 120, y: 40, width: 360, height: 260 },   // Khối trái tòa nhà
      { x: 480, y: 40, width: 140, height: 240 },   // Khối giữa (trên cửa sảnh chính)
      { x: 620, y: 40, width: 250, height: 260 },   // Khối phải giữa
      { x: 960, y: 40, width: 160, height: 260 },   // Khối góc phải nhà kho

      // Chốt bảo vệ Bác Ba
      { x: 340, y: 490, width: 80, height: 60 },

      // Hàng rào khuôn viên & vỉa hè
      { x: 40, y: 540, width: 300, height: 20 },
      { x: 550, y: 540, width: 610, height: 20 },

      // Bồn hoa & Cây xanh khuôn viên
      { x: 220, y: 380, width: 100, height: 40 },
      { x: 680, y: 380, width: 100, height: 40 }
    ],
    doors: [
      {
        id: 'ext_main_glass_door',
        name: 'Cửa Kính Sảnh Chính',
        x: 480,
        y: 280,
        width: 140,
        height: 35,
        doorType: 'GLASS',
        isOpen: false,
        autoSensor: true,
        targetFloor: 'FLOOR_1',
        targetSpawn: { x: 512, y: 520 }
      },
      {
        id: 'ext_boom_barrier',
        name: 'Thanh Chắn Xe Tự Động (Boom Barrier)',
        x: 420,
        y: 535,
        width: 130,
        height: 20,
        doorType: 'GATE',
        isOpen: false,
        autoSensor: true
      },
      {
        id: 'ext_warehouse_door',
        name: 'Cửa Cuốn Kho Hàng & Giao Nhận',
        x: 870,
        y: 280,
        width: 90,
        height: 35,
        doorType: 'WOOD',
        isOpen: false,
        targetFloor: 'FLOOR_1',
        targetSpawn: { x: 180, y: 450 }
      }
    ],
    interactiveZones: [
      {
        id: 'ext_zone_to_city',
        name: 'Lối Ra Đường Phố Đô Thị',
        x: 460,
        y: 750,
        width: 160,
        height: 40,
        prompt: 'Nhấn [E] để ra ngoài đường phố',
        actionType: 'ENTER_SCENE',
        targetScene: 'CITY',
        targetSpawn: { x: 520, y: 270 }
      },
      {
        id: 'ext_zone_guard',
        name: 'Bác Ba - Bảo Vệ Tòa Nhà',
        x: 340,
        y: 480,
        width: 90,
        height: 80,
        prompt: 'Nhấn [E] trò chuyện với Bác Ba Bảo Vệ',
        actionType: 'TALK_NPC'
      },
      {
        id: 'ext_zone_main_door',
        name: 'Cửa Kính Sảnh Chính',
        x: 480,
        y: 280,
        width: 140,
        height: 60,
        prompt: 'Nhấn [E] vào Sảnh Lễ Tân Tầng 1',
        actionType: 'ENTER_SCENE',
        targetScene: 'FLOOR_1',
        targetSpawn: { x: 512, y: 520 }
      },
      {
        id: 'ext_zone_warehouse_door',
        name: 'Lối Vào Kho Hàng Phía Sau',
        x: 870,
        y: 280,
        width: 90,
        height: 60,
        prompt: 'Nhấn [E] vào Khu Vực Kho Hàng Tầng 1',
        actionType: 'ENTER_SCENE',
        targetScene: 'FLOOR_1',
        targetSpawn: { x: 180, y: 450 }
      },
      {
        id: 'ext_zone_bench',
        name: 'Ghế Nghỉ Khuôn Viên',
        x: 220,
        y: 380,
        width: 100,
        height: 50,
        prompt: 'Nhấn [E] ngồi nghỉ ngơi hít thở không khí (+15 Năng lượng)',
        actionType: 'SLEEP_REST'
      }
    ],
    deskPositions: []
  },

  // ============================================================================
  // TẦNG 1: LỄ TÂN & NHÀ KHO (SẢNH CHÍNH, HÀNH CHÍNH, KHO LỚN, WC NAM/NỮ RIÊNG)
  // ============================================================================
  FLOOR_1: {
    id: 'FLOOR_1',
    name: 'Tầng 1 — Lễ Tân & Nhà Kho',
    width: 1024,
    height: 640,
    defaultSpawn: { x: 512, y: 520 },
    floorPlanImage: '/building_refs/floor1_reception_warehouse.jpg',
    colliders: [
      // Viền tường bao quanh tầng 1
      { x: 0, y: 0, width: 1024, height: 40 },
      { x: 0, y: 600, width: 1024, height: 40 },
      { x: 0, y: 0, width: 40, height: 640 },
      { x: 984, y: 0, width: 40, height: 640 },

      // Vách ngăn Nhà Kho (Bên trái)
      { x: 380, y: 240, width: 20, height: 100 },
      { x: 380, y: 390, width: 20, height: 210 },
      { x: 40, y: 240, width: 360, height: 20 },

      // Vách ngăn Cụm WC và Phòng Vật Tư (Phía trên)
      { x: 40, y: 230, width: 100, height: 20 },
      { x: 180, y: 230, width: 160, height: 20 },
      { x: 380, y: 230, width: 170, height: 20 },
      { x: 590, y: 230, width: 80, height: 20 },
      { x: 300, y: 40, width: 16, height: 190 },   // Vách giữa WC Nam & Janitor
      { x: 400, y: 40, width: 16, height: 190 },   // Vách giữa Janitor & WC Nữ
      { x: 95, y: 40, width: 12, height: 120 },    // Vách ngăn buồng WC Nam
      { x: 510, y: 40, width: 12, height: 120 },   // Vách ngăn buồng WC Nữ

      // Vách ngăn Phòng Hành Chính (Phía trên bên phải)
      { x: 670, y: 40, width: 20, height: 190 },
      { x: 670, y: 230, width: 60, height: 20 },
      { x: 770, y: 230, width: 214, height: 20 },

      // Khối Thang Máy & Cầu Thang (Góc phải dưới)
      { x: 740, y: 350, width: 20, height: 250 },
      { x: 740, y: 350, width: 244, height: 20 },

      // Đồ đạc cố định có va chạm
      { x: 460, y: 350, width: 140, height: 45 },  // Quầy Lễ Tân
      { x: 60, y: 270, width: 90, height: 180 },   // Kệ hàng kho 1
      { x: 180, y: 270, width: 90, height: 120 },  // Kệ hàng kho 2
      { x: 260, y: 460, width: 90, height: 80 }    // Pallet hàng & xe nâng
    ],
    doors: [
      {
        id: 'f1_door_main',
        name: 'Cửa Kính Sảnh Chính',
        x: 472,
        y: 595,
        width: 85,
        height: 25,
        doorType: 'GLASS',
        isOpen: false,
        autoSensor: true,
        targetFloor: 'COMPANY_EXTERIOR',
        targetSpawn: { x: 540, y: 340 }
      },
      {
        id: 'f1_door_warehouse',
        name: 'Cửa Vào Nhà Kho',
        x: 375,
        y: 340,
        width: 25,
        height: 45,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f1_door_admin',
        name: 'Cửa Phòng Hành Chính',
        x: 730,
        y: 230,
        width: 40,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f1_door_wc_men',
        name: 'Cửa WC Nam',
        x: 140,
        y: 230,
        width: 40,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f1_door_janitor',
        name: 'Cửa Phòng Vật Tư',
        x: 340,
        y: 230,
        width: 40,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f1_door_wc_women',
        name: 'Cửa WC Nữ',
        x: 550,
        y: 230,
        width: 40,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f1_stall_m1',
        name: 'Cửa Buồng WC Nam 1',
        x: 50,
        y: 155,
        width: 40,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f1_stall_m2',
        name: 'Cửa Buồng WC Nam 2',
        x: 105,
        y: 155,
        width: 40,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f1_stall_w1',
        name: 'Cửa Buồng WC Nữ 1',
        x: 465,
        y: 155,
        width: 40,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f1_stall_w2',
        name: 'Cửa Buồng WC Nữ 2',
        x: 520,
        y: 155,
        width: 40,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f1_door_elevator',
        name: 'Cửa Thang Máy T1',
        x: 840,
        y: 395,
        width: 75,
        height: 35,
        doorType: 'ELEVATOR',
        isOpen: false
      }
    ],
    interactiveZones: [
      {
        id: 'f1_zone_exit',
        name: 'Cửa Kính Ra Mặt Tiền',
        x: 470,
        y: 585,
        width: 90,
        height: 35,
        prompt: 'Nhấn [E] để ra ngoài khuôn viên',
        actionType: 'ENTER_SCENE',
        targetScene: 'COMPANY_EXTERIOR',
        targetSpawn: { x: 540, y: 340 }
      },
      {
        id: 'f1_zone_reception',
        name: 'Quầy Lễ Tân StartUp Co.',
        x: 460,
        y: 345,
        width: 140,
        height: 60,
        prompt: 'Nhấn [E] gặp Lễ Tân (Thủ tục đón khách / Nhận bưu phẩm)',
        actionType: 'TALK_NPC'
      },
      {
        id: 'f1_zone_sofa',
        name: 'Sofa Chờ Tiếp Khách',
        x: 470,
        y: 440,
        width: 120,
        height: 50,
        prompt: 'Nhấn [E] ngồi nghỉ ngơi tại ghế chờ (+15 Năng lượng)',
        actionType: 'SLEEP_REST'
      },
      {
        id: 'f1_zone_warehouse_mgr',
        name: 'Khu Vực Quản Lý Kho & Hàng Hóa',
        x: 140,
        y: 330,
        width: 100,
        height: 60,
        prompt: 'Nhấn [E] kiểm kê thiết bị công nghệ & tồn kho',
        actionType: 'TALK_NPC'
      },
      {
        id: 'f1_zone_admin_desk',
        name: 'Phòng Hành Chính Tổng Hợp',
        x: 800,
        y: 110,
        width: 90,
        height: 60,
        prompt: 'Nhấn [E] tiếp nhận công văn & hồ sơ văn phòng',
        actionType: 'OPEN_COMPANY_MENU'
      },
      {
        id: 'f1_zone_elevator',
        name: 'Bảng Điều Khiển Thang Máy',
        x: 840,
        y: 385,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] để bấm thang máy chọn tầng',
        actionType: 'OPEN_ELEVATOR'
      },
      {
        id: 'f1_zone_stairs',
        name: 'Cầu Thang Bộ Lên Tầng 2',
        x: 840,
        y: 255,
        width: 90,
        height: 65,
        prompt: 'Nhấn [E] đi cầu thang bộ lên Tầng 2',
        actionType: 'USE_STAIRS',
        targetScene: 'FLOOR_2',
        targetSpawn: { x: 75, y: 420 }
      },
      // Các vùng tương tác cửa đóng/mở
      { id: 'f1_zone_door_wh', name: 'Cửa Nhà Kho', x: 365, y: 330, width: 45, height: 60, prompt: 'Nhấn [E] mở/đóng cửa kho', actionType: 'TOGGLE_DOOR', doorId: 'f1_door_warehouse' },
      { id: 'f1_zone_door_adm', name: 'Cửa Hành Chính', x: 720, y: 220, width: 60, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Hành chính', actionType: 'TOGGLE_DOOR', doorId: 'f1_door_admin' },
      { id: 'f1_zone_door_wcm', name: 'Cửa WC Nam', x: 130, y: 220, width: 60, height: 40, prompt: 'Nhấn [E] mở/đóng cửa WC Nam', actionType: 'TOGGLE_DOOR', doorId: 'f1_door_wc_men' },
      { id: 'f1_zone_door_wcw', name: 'Cửa WC Nữ', x: 540, y: 220, width: 60, height: 40, prompt: 'Nhấn [E] mở/đóng cửa WC Nữ', actionType: 'TOGGLE_DOOR', doorId: 'f1_door_wc_women' },
      { id: 'f1_zone_door_jan', name: 'Cửa Phòng Vật Tư', x: 330, y: 220, width: 60, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Vật tư', actionType: 'TOGGLE_DOOR', doorId: 'f1_door_janitor' },
      { id: 'f1_zone_stall_m1', name: 'Buồng WC Nam 1', x: 45, y: 145, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 1', actionType: 'TOGGLE_DOOR', doorId: 'f1_stall_m1' },
      { id: 'f1_zone_stall_m2', name: 'Buồng WC Nam 2', x: 100, y: 145, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 2', actionType: 'TOGGLE_DOOR', doorId: 'f1_stall_m2' },
      { id: 'f1_zone_stall_w1', name: 'Buồng WC Nữ 1', x: 460, y: 145, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 1', actionType: 'TOGGLE_DOOR', doorId: 'f1_stall_w1' },
      { id: 'f1_zone_stall_w2', name: 'Buồng WC Nữ 2', x: 515, y: 145, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 2', actionType: 'TOGGLE_DOOR', doorId: 'f1_stall_w2' }
    ],
    deskPositions: [
      { x: 512, y: 370 }, // Bàn lễ tân
      { x: 840, y: 130 }  // Bàn hành chính
    ]
  },

  // ============================================================================
  // TẦNG 2: KHU LÀM VIỆC (OPEN WORKSPACE, IT ROOM, HR, KẾ TOÁN, MARKETING, PANTRY, WC)
  // ============================================================================
  FLOOR_2: {
    id: 'FLOOR_2',
    name: 'Tầng 2 — Khu Làm Việc & Kỹ Thuật',
    width: 1024,
    height: 640,
    defaultSpawn: { x: 180, y: 150 },
    floorPlanImage: '/building_refs/floor2_workspace.jpg',
    colliders: [
      // Viền tường bao quanh tầng 2
      { x: 0, y: 0, width: 1024, height: 40 },
      { x: 0, y: 600, width: 1024, height: 40 },
      { x: 0, y: 0, width: 40, height: 640 },
      { x: 984, y: 0, width: 40, height: 640 },

      // Vách buồng thang máy & cầu thang bên trái
      { x: 140, y: 40, width: 20, height: 560 },

      // Vách kính Phòng IT & Server
      { x: 160, y: 260, width: 140, height: 20 },
      { x: 160, y: 500, width: 140, height: 20 },
      { x: 290, y: 260, width: 16, height: 130 },
      { x: 290, y: 430, width: 16, height: 80 },

      // Dãy phòng phía trên
      { x: 160, y: 220, width: 105, height: 20 },   // Phòng HR
      { x: 300, y: 220, width: 90, height: 20 },
      { x: 370, y: 40, width: 16, height: 180 },    // Vách ngăn HR & Kế toán
      { x: 425, y: 220, width: 135, height: 20 },   // Phòng Kế toán
      { x: 560, y: 40, width: 16, height: 180 },    // Vách ngăn Kế toán & Phòng họp
      { x: 615, y: 220, width: 135, height: 20 },   // Phòng họp nhỏ

      // Cụm WC bên phải
      { x: 750, y: 40, width: 20, height: 105 },
      { x: 750, y: 180, width: 20, height: 165 },
      { x: 750, y: 380, width: 20, height: 220 },
      { x: 750, y: 250, width: 234, height: 16 },   // Vách ngăn WC Nam & WC Nữ

      // Phòng Marketing & Khu Giải Lao (Pantry) bên phải dưới
      { x: 570, y: 250, width: 180, height: 20 },
      { x: 570, y: 390, width: 180, height: 20 },
      { x: 570, y: 250, width: 20, height: 110 }
    ],
    doors: [
      {
        id: 'f2_door_elevator',
        name: 'Cửa Thang Máy T2',
        x: 45,
        y: 110,
        width: 75,
        height: 35,
        doorType: 'ELEVATOR',
        isOpen: false
      },
      {
        id: 'f2_door_it',
        name: 'Cửa Kính Phòng IT & Server',
        x: 285,
        y: 390,
        width: 25,
        height: 40,
        doorType: 'GLASS',
        isOpen: false
      },
      {
        id: 'f2_door_hr',
        name: 'Cửa Phòng Nhân Sự',
        x: 265,
        y: 220,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f2_door_accounting',
        name: 'Cửa Phòng Kế Toán',
        x: 390,
        y: 220,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f2_door_meeting',
        name: 'Cửa Kính Phòng Họp Nhỏ',
        x: 580,
        y: 220,
        width: 35,
        height: 20,
        doorType: 'GLASS',
        isOpen: false
      },
      {
        id: 'f2_door_marketing',
        name: 'Cửa Phòng Marketing',
        x: 570,
        y: 360,
        width: 20,
        height: 35,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f2_door_wc_men',
        name: 'Cửa WC Nam',
        x: 750,
        y: 145,
        width: 20,
        height: 35,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f2_door_wc_women',
        name: 'Cửa WC Nữ',
        x: 750,
        y: 345,
        width: 20,
        height: 35,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f2_stall_m1',
        name: 'Cửa Buồng WC Nam 1',
        x: 890,
        y: 110,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f2_stall_m2',
        name: 'Cửa Buồng WC Nam 2',
        x: 940,
        y: 110,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f2_stall_w1',
        name: 'Cửa Buồng WC Nữ 1',
        x: 890,
        y: 320,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f2_stall_w2',
        name: 'Cửa Buồng WC Nữ 2',
        x: 940,
        y: 320,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      }
    ],
    interactiveZones: [
      {
        id: 'f2_zone_elevator',
        name: 'Bảng Điều Khiển Thang Máy',
        x: 45,
        y: 105,
        width: 75,
        height: 50,
        prompt: 'Nhấn [E] để bấm thang máy chọn tầng',
        actionType: 'OPEN_ELEVATOR'
      },
      {
        id: 'f2_zone_stairs_down',
        name: 'Cầu Thang Bộ Xuống Tầng 1',
        x: 45,
        y: 440,
        width: 75,
        height: 55,
        prompt: 'Nhấn [E] đi cầu thang bộ xuống Tầng 1',
        actionType: 'USE_STAIRS',
        targetScene: 'FLOOR_1',
        targetSpawn: { x: 860, y: 320 }
      },
      {
        id: 'f2_zone_stairs_up',
        name: 'Cầu Thang Bộ Lên Tầng 3',
        x: 45,
        y: 310,
        width: 75,
        height: 55,
        prompt: 'Nhấn [E] đi cầu thang bộ lên Tầng 3 (Khu Giám Đốc)',
        actionType: 'USE_STAIRS',
        targetScene: 'FLOOR_3',
        targetSpawn: { x: 75, y: 420 }
      },
      {
        id: 'f2_zone_it_servers',
        name: 'Phòng IT & Tủ Máy Chủ Server',
        x: 190,
        y: 310,
        width: 85,
        height: 60,
        prompt: 'Nhấn [E] kiểm tra hạ tầng Cloud / Server & CI/CD',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'f2_zone_workspace',
        name: 'Khu Làm Việc Chung (Open Workspace)',
        x: 380,
        y: 340,
        width: 140,
        height: 80,
        prompt: 'Nhấn [E] theo dõi tiến độ lập trình & năng suất đội ngũ',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'f2_zone_hr',
        name: 'Phòng Nhân Sự',
        x: 230,
        y: 110,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] xem hồ sơ nhân viên & đăng tin tuyển dụng',
        actionType: 'OPEN_RECRUIT'
      },
      {
        id: 'f2_zone_accounting',
        name: 'Phòng Kế Toán',
        x: 420,
        y: 110,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] mở báo cáo kế toán & sao kê dòng tiền',
        actionType: 'OPEN_BANK'
      },
      {
        id: 'f2_zone_meeting',
        name: 'Phòng Họp Nhỏ Tầng 2',
        x: 620,
        y: 110,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] tổ chức họp Sprint Review / Retrospective',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'f2_zone_marketing',
        name: 'Phòng Marketing & Thiết Kế',
        x: 620,
        y: 310,
        width: 80,
        height: 60,
        prompt: 'Nhấn [E] xem chiến dịch Growth & Marketing',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'f2_zone_pantry',
        name: 'Khu Giải Lao & Máy Pha Cà Phê',
        x: 600,
        y: 460,
        width: 100,
        height: 60,
        prompt: 'Nhấn [E] thưởng thức cà phê giải tỏa căng thẳng (+20 Năng lượng)',
        actionType: 'USE_COFFEE'
      },
      // Door toggle zones
      { id: 'f2_zone_door_it', name: 'Cửa Kính Phòng IT', x: 270, y: 380, width: 50, height: 50, prompt: 'Nhấn [E] mở/đóng cửa IT', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_it' },
      { id: 'f2_zone_door_hr', name: 'Cửa Phòng HR', x: 255, y: 210, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa HR', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_hr' },
      { id: 'f2_zone_door_acc', name: 'Cửa Phòng Kế Toán', x: 380, y: 210, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Kế Toán', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_accounting' },
      { id: 'f2_zone_door_meet', name: 'Cửa Phòng Họp', x: 570, y: 210, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Phòng Họp', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_meeting' },
      { id: 'f2_zone_door_mkt', name: 'Cửa Phòng Marketing', x: 555, y: 350, width: 45, height: 55, prompt: 'Nhấn [E] mở/đóng cửa Marketing', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_marketing' },
      { id: 'f2_zone_door_wcm', name: 'Cửa WC Nam', x: 740, y: 135, width: 45, height: 50, prompt: 'Nhấn [E] mở/đóng cửa WC Nam', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_wc_men' },
      { id: 'f2_zone_door_wcw', name: 'Cửa WC Nữ', x: 740, y: 335, width: 45, height: 50, prompt: 'Nhấn [E] mở/đóng cửa WC Nữ', actionType: 'TOGGLE_DOOR', doorId: 'f2_door_wc_women' },
      { id: 'f2_zone_stall_m1', name: 'Buồng WC Nam 1', x: 880, y: 100, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 1', actionType: 'TOGGLE_DOOR', doorId: 'f2_stall_m1' },
      { id: 'f2_zone_stall_m2', name: 'Buồng WC Nam 2', x: 935, y: 100, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 2', actionType: 'TOGGLE_DOOR', doorId: 'f2_stall_m2' },
      { id: 'f2_zone_stall_w1', name: 'Buồng WC Nữ 1', x: 880, y: 310, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 1', actionType: 'TOGGLE_DOOR', doorId: 'f2_stall_w1' },
      { id: 'f2_zone_stall_w2', name: 'Buồng WC Nữ 2', x: 935, y: 310, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 2', actionType: 'TOGGLE_DOOR', doorId: 'f2_stall_w2' }
    ],
    deskPositions: [
      // 12 vị trí bàn làm việc Open Workspace & IT Room
      { x: 360, y: 320 },
      { x: 420, y: 320 },
      { x: 480, y: 320 },
      { x: 360, y: 410 },
      { x: 420, y: 410 },
      { x: 480, y: 410 },
      { x: 210, y: 420 }, // Bàn IT dev 1
      { x: 250, y: 420 }, // Bàn IT dev 2
      { x: 640, y: 340 }, // Bàn Marketing 1
      { x: 680, y: 340 }, // Bàn Marketing 2
      { x: 250, y: 120 }, // Bàn HR
      { x: 440, y: 120 }  // Bàn Kế toán
    ]
  },

  // ============================================================================
  // TẦNG 3: KHU GIÁM ĐỐC (CEO SUITE, PHÓ GIÁM ĐỐC, HỘI ĐỒNG QUẢN TRỊ, PHÁP CHẾ, VIP)
  // ============================================================================
  FLOOR_3: {
    id: 'FLOOR_3',
    name: 'Tầng 3 — Khu Giám Đốc & Lãnh Đạo Cấp Cao',
    width: 1024,
    height: 640,
    defaultSpawn: { x: 180, y: 150 },
    floorPlanImage: '/building_refs/floor3_executive.jpg',
    colliders: [
      // Viền tường bao quanh tầng 3
      { x: 0, y: 0, width: 1024, height: 40 },
      { x: 0, y: 600, width: 1024, height: 40 },
      { x: 0, y: 0, width: 40, height: 640 },
      { x: 984, y: 0, width: 40, height: 640 },

      // Vách buồng thang máy & cầu thang bên trái
      { x: 140, y: 40, width: 20, height: 560 },

      // Dãy phòng lãnh đạo phía trên
      { x: 160, y: 240, width: 175, height: 20 },   // Phòng Giám Đốc (CEO Suite)
      { x: 380, y: 240, width: 25, height: 20 },
      { x: 390, y: 40, width: 16, height: 200 },    // Vách ngăn CEO & Phó GĐ
      { x: 440, y: 240, width: 120, height: 20 },   // Phòng Phó GĐ
      { x: 560, y: 40, width: 16, height: 200 },    // Vách ngăn Phó GĐ & Boardroom
      { x: 610, y: 240, width: 140, height: 20 },   // Phòng Họp Lớn Boardroom

      // Cụm WC bên phải
      { x: 750, y: 40, width: 20, height: 105 },
      { x: 750, y: 180, width: 20, height: 115 },
      { x: 750, y: 330, width: 20, height: 120 },
      { x: 750, y: 230, width: 234, height: 16 },   // Vách ngăn WC Nam & WC Nữ T3

      // Dãy phòng chuyên môn phía dưới
      { x: 140, y: 400, width: 80, height: 20 },
      { x: 255, y: 400, width: 80, height: 20 },
      { x: 370, y: 400, width: 95, height: 20 },
      { x: 500, y: 400, width: 115, height: 20 },
      { x: 650, y: 400, width: 65, height: 20 },
      { x: 745, y: 400, width: 45, height: 20 },
      { x: 300, y: 400, width: 16, height: 200 },   // Vách Tài Chính & Pháp Chế
      { x: 430, y: 400, width: 16, height: 200 },   // Vách Pháp Chế & Nhân Sự
      { x: 580, y: 400, width: 16, height: 200 },   // Vách Nhân Sự & Hành Chính
      { x: 690, y: 400, width: 16, height: 200 },   // Vách Hành Chính & Họp Nhỏ

      // Nội thất có va chạm
      { x: 240, y: 130, width: 130, height: 60 },   // Bàn Giám Đốc gỗ óc chó
      { x: 580, y: 110, width: 140, height: 90 }    // Bàn Họp Hội Đồng Quản Trị
    ],
    doors: [
      {
        id: 'f3_door_elevator',
        name: 'Cửa Thang Máy T3',
        x: 45,
        y: 110,
        width: 75,
        height: 35,
        doorType: 'ELEVATOR',
        isOpen: false
      },
      {
        id: 'f3_door_ceo',
        name: 'Cửa Gỗ Đôi Phòng Giám Đốc',
        x: 335,
        y: 240,
        width: 45,
        height: 25,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_vice',
        name: 'Cửa Phòng Phó Giám Đốc',
        x: 405,
        y: 240,
        width: 35,
        height: 25,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_boardroom',
        name: 'Cửa Phòng Họp Lớn Boardroom',
        x: 575,
        y: 240,
        width: 35,
        height: 25,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_finance',
        name: 'Cửa Phòng Tài Chính - Kế Toán',
        x: 220,
        y: 400,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_legal',
        name: 'Cửa Phòng Pháp Chế',
        x: 335,
        y: 400,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_hr',
        name: 'Cửa Phòng Nhân Sự Cấp Cao',
        x: 465,
        y: 400,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_admin',
        name: 'Cửa Phòng Hành Chính Tổng Hợp',
        x: 615,
        y: 400,
        width: 35,
        height: 20,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_vip_meeting',
        name: 'Cửa Kính Phòng Họp VIP Nhỏ',
        x: 715,
        y: 400,
        width: 30,
        height: 20,
        doorType: 'GLASS',
        isOpen: false
      },
      {
        id: 'f3_door_wc_men',
        name: 'Cửa WC Nam T3',
        x: 750,
        y: 145,
        width: 20,
        height: 35,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_door_wc_women',
        name: 'Cửa WC Nữ T3',
        x: 750,
        y: 295,
        width: 20,
        height: 35,
        doorType: 'WOOD',
        isOpen: false
      },
      {
        id: 'f3_stall_m1',
        name: 'Buồng WC Nam 1',
        x: 900,
        y: 105,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f3_stall_m2',
        name: 'Buồng WC Nam 2',
        x: 950,
        y: 105,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f3_stall_w1',
        name: 'Buồng WC Nữ 1',
        x: 900,
        y: 270,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      },
      {
        id: 'f3_stall_w2',
        name: 'Buồng WC Nữ 2',
        x: 950,
        y: 270,
        width: 35,
        height: 20,
        doorType: 'WC',
        isOpen: false
      }
    ],
    interactiveZones: [
      {
        id: 'f3_zone_elevator',
        name: 'Bảng Điều Khiển Thang Máy',
        x: 45,
        y: 105,
        width: 75,
        height: 50,
        prompt: 'Nhấn [E] để bấm thang máy chọn tầng',
        actionType: 'OPEN_ELEVATOR'
      },
      {
        id: 'f3_zone_stairs_down',
        name: 'Cầu Thang Bộ Xuống Tầng 2',
        x: 45,
        y: 440,
        width: 75,
        height: 55,
        prompt: 'Nhấn [E] đi cầu thang bộ xuống Tầng 2 (Khu Làm Việc)',
        actionType: 'USE_STAIRS',
        targetScene: 'FLOOR_2',
        targetSpawn: { x: 75, y: 340 }
      },
      {
        id: 'f3_zone_ceo_desk',
        name: 'Bàn Điều Hành Chủ Tịch CEO',
        x: 240,
        y: 130,
        width: 130,
        height: 70,
        prompt: 'Nhấn [E] mở Bảng Điều Hành Doanh Nghiệp (CEO Suite)',
        actionType: 'OPEN_COMPANY_MENU'
      },
      {
        id: 'f3_zone_boardroom',
        name: 'Phòng Họp Hội Đồng Quản Trị',
        x: 580,
        y: 110,
        width: 140,
        height: 90,
        prompt: 'Nhấn [E] họp chiến lược & thẩm định dự án trọng điểm',
        actionType: 'OPEN_PROJECTS'
      },
      {
        id: 'f3_zone_vip_lounge',
        name: 'Sảnh Tiếp Khách VIP Lounge',
        x: 430,
        y: 310,
        width: 130,
        height: 60,
        prompt: 'Nhấn [E] ngồi thư giãn tại sảnh tiếp khách VIP (+25 Năng lượng)',
        actionType: 'SLEEP_REST'
      },
      {
        id: 'f3_zone_legal',
        name: 'Phòng Pháp Chế & Soạn Thảo Hợp Đồng',
        x: 340,
        y: 460,
        width: 70,
        height: 60,
        prompt: 'Nhấn [E] rà soát hồ sơ pháp lý & tính tuân thủ doanh nghiệp',
        actionType: 'OPEN_COURT'
      },
      {
        id: 'f3_zone_finance',
        name: 'Phòng Tài Chính & Kiểm Toán Cấp Cao',
        x: 200,
        y: 460,
        width: 70,
        height: 60,
        prompt: 'Nhấn [E] phân tích cấu trúc chi phí & lập kế hoạch vốn',
        actionType: 'OPEN_BANK'
      },
      // Door toggle zones
      { id: 'f3_zone_door_ceo', name: 'Cửa Phòng Giám Đốc', x: 325, y: 230, width: 65, height: 45, prompt: 'Nhấn [E] mở/đóng cửa Phòng Giám Đốc', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_ceo' },
      { id: 'f3_zone_door_vice', name: 'Cửa Phòng Phó Giám Đốc', x: 395, y: 230, width: 55, height: 45, prompt: 'Nhấn [E] mở/đóng cửa Phó Giám Đốc', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_vice' },
      { id: 'f3_zone_door_board', name: 'Cửa Boardroom', x: 565, y: 230, width: 55, height: 45, prompt: 'Nhấn [E] mở/đóng cửa Boardroom', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_boardroom' },
      { id: 'f3_zone_door_fin', name: 'Cửa Phòng Tài Chính', x: 210, y: 390, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Tài Chính', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_finance' },
      { id: 'f3_zone_door_leg', name: 'Cửa Phòng Pháp Chế', x: 325, y: 390, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Pháp Chế', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_legal' },
      { id: 'f3_zone_door_hr', name: 'Cửa Phòng Nhân Sự Cấp Cao', x: 455, y: 390, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Nhân Sự T3', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_hr' },
      { id: 'f3_zone_door_adm', name: 'Cửa Phòng Hành Chính T3', x: 605, y: 390, width: 55, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Hành Chính T3', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_admin' },
      { id: 'f3_zone_door_vip_m', name: 'Cửa Phòng Họp VIP Nhỏ', x: 705, y: 390, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa Họp VIP', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_vip_meeting' },
      { id: 'f3_zone_door_wcm', name: 'Cửa WC Nam T3', x: 740, y: 135, width: 45, height: 50, prompt: 'Nhấn [E] mở/đóng cửa WC Nam', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_wc_men' },
      { id: 'f3_zone_door_wcw', name: 'Cửa WC Nữ T3', x: 740, y: 285, width: 45, height: 50, prompt: 'Nhấn [E] mở/đóng cửa WC Nữ', actionType: 'TOGGLE_DOOR', doorId: 'f3_door_wc_women' },
      { id: 'f3_zone_stall_m1', name: 'Buồng WC Nam 1', x: 890, y: 95, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 1', actionType: 'TOGGLE_DOOR', doorId: 'f3_stall_m1' },
      { id: 'f3_zone_stall_m2', name: 'Buồng WC Nam 2', x: 940, y: 95, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng 2', actionType: 'TOGGLE_DOOR', doorId: 'f3_stall_m2' },
      { id: 'f3_zone_stall_w1', name: 'Buồng WC Nữ 1', x: 890, y: 260, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 1', actionType: 'TOGGLE_DOOR', doorId: 'f3_stall_w1' },
      { id: 'f3_zone_stall_w2', name: 'Buồng WC Nữ 2', x: 940, y: 260, width: 50, height: 40, prompt: 'Nhấn [E] mở/đóng cửa buồng Nữ 2', actionType: 'TOGGLE_DOOR', doorId: 'f3_stall_w2' }
    ],
    deskPositions: [
      { x: 290, y: 145 }, // Bàn CEO
      { x: 440, y: 145 }, // Bàn Phó Giám Đốc
      { x: 620, y: 460 }, // Bàn Hành chính T3
      { x: 480, y: 460 }  // Bàn Nhân sự T3
    ]
  }
};
