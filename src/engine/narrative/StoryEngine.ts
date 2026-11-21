// ============================================================================
// CEO EMPIRE: STORY ENGINE & BRANCHING NARRATIVE GRAPH
// ============================================================================

import { GameStateManager } from '../core/GameStateManager';

export type CharacterSpeaker = 
  | 'FATHER' 
  | 'LAN_ANH' 
  | 'NAM' 
  | 'ASSISTANT' 
  | 'NARRATOR' 
  | 'SYSTEM' 
  | 'EMPLOYEE';

export type CharacterEmotion = 
  | 'normal' 
  | 'angry' 
  | 'cold' 
  | 'surprised' 
  | 'disappointed' 
  | 'worried' 
  | 'happy' 
  | 'emotional' 
  | 'shy' 
  | 'confident' 
  | 'thinking' 
  | 'tired' 
  | 'excited';

export interface StoryChoice {
  id: string;
  text: string;
  subtext?: string;
  impact?: string;
  badge?: string;
  badgeColor?: string;
  next: string;
  action?: (gsm: GameStateManager) => void;
}

export interface StoryNode {
  id: string;
  speaker: CharacterSpeaker;
  speakerName: string;
  speakerTitle?: string;
  emotion?: CharacterEmotion;
  portraitUrl?: string;
  text: string;
  stageDirection?: string;
  next?: string;
  choices?: StoryChoice[];
  onEnter?: (gsm: GameStateManager) => void;
}

// CÂY CỐT TRUYỆN MỞ ĐẦU TẠI BIỆT THỰ HOÀNG GIA (VILLA)
export const VILLA_INTRO_STORY: Record<string, StoryNode> = {
  villa_intro_01: {
    id: 'villa_intro_01',
    speaker: 'NARRATOR',
    speakerName: 'Dẫn Chuyện',
    speakerTitle: 'Dinh Thự Hoàng Gia • 20:00',
    portraitUrl: '/portraits/nam_thinking.jpg',
    text: 'Phòng khách lộng lẫy của dinh thự nhà họ Hoàng im ắng đến nghẹt thở. Dưới ánh đèn chùm pha lê và lò sưởi ấm cúng, bạn bước vào với từng bước chân nặng trĩu. Trên chiếc bàn đá cẩm thạch giữa phòng, một chiếc vali đen tuyền viền vàng ánh kim đang nằm im lìm...',
    stageDirection: 'Bạn bước qua cửa chính vào phòng khách. Ông Hoàng Thế Vinh và Lan Anh đã có mặt chờ sẵn.',
    next: 'villa_intro_02'
  },

  villa_intro_02: {
    id: 'villa_intro_02',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát — Bố Lan Anh',
    emotion: 'cold',
    portraitUrl: '/portraits/father_cold.jpg',
    text: 'Cậu Nam, ta biết cậu yêu con gái ta. Nhưng tình yêu của một thằng sinh viên 22 tuổi mới ra trường, không tiền bạc, không gia thế, không địa vị... liệu có nuôi nổi tương lai cho nó không?',
    stageDirection: 'Ông Vinh chậm rãi nhấp một ngụm trà sen, ánh mắt nghiêm nghị sắc bén như nhìn thấu tâm can bạn.',
    next: 'villa_intro_03'
  },

  villa_intro_03: {
    id: 'villa_intro_03',
    speaker: 'LAN_ANH',
    speakerName: 'Hoàng Lan Anh',
    speakerTitle: 'Bạn Gái Bạn — Ái Nữ Nhà Họ Hoàng',
    emotion: 'worried',
    portraitUrl: '/portraits/lan_anh_worried.jpg',
    text: 'Bố! Đừng làm khó anh Nam nữa mà bố... Tụi con yêu nhau từ thời đại học, tụi con có thể cùng nhau cố gắng từ hai bàn tay trắng mà bố!',
    stageDirection: 'Lan Anh đứng nép bên cạnh sofa, đôi mắt ươn ướt đầy lo lắng nhìn bạn rồi lại hướng về phía bố mình.',
    next: 'villa_intro_04'
  },

  villa_intro_04: {
    id: 'villa_intro_04',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát',
    emotion: 'angry',
    portraitUrl: '/portraits/father_angry.jpg',
    text: 'Im lặng nào con gái! Thực tế thương trường khốc liệt không phải là cuốn tiểu thuyết ngôn tình viển vông. Hai bàn tay trắng ngoài xã hội kia chỉ có trắng tay và cay đắng thôi!',
    stageDirection: 'Ông Vinh nghiêm giọng quát khẽ, rồi quay sang đưa tay gạt nhẹ chiếc khóa số trên bàn.',
    next: 'villa_intro_05'
  },

  villa_intro_05: {
    id: 'villa_intro_05',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát',
    emotion: 'normal',
    portraitUrl: '/portraits/father_normal.jpg',
    text: 'Trong chiếc vali này có đúng 500.000.000 VNĐ (500 triệu đồng) tiền mặt polymer xanh thẫm, còn nguyên niêm phong ngân hàng. Đây là số tiền mà một sinh viên nghèo làm thuê chắt chiu cả đời chưa chắc đã tích cóp nổi. Cậu Nam, hãy đưa ra quyết định của mình!',
    stageDirection: 'Nắp vali mở hé, vầng sáng từ các cọc tiền polymer 500.000 VNĐ phản chiếu lấp lánh trong phòng.',
    next: 'villa_intro_06'
  },

  villa_intro_06: {
    id: 'villa_intro_06',
    speaker: 'NAM',
    speakerName: 'Nguyễn Thành Nam',
    speakerTitle: 'Chàng Sinh Viên Khởi Nghiệp (Bạn)',
    emotion: 'thinking',
    portraitUrl: '/portraits/nam_thinking.jpg',
    text: '500 triệu đồng tiền mặt... Một số tiền quá khổng lồ với một sinh viên nghèo vừa bước chân khỏi giảng đường đại học. Nhận lấy số tiền rồi cam phận rời xa người mình yêu, hay đánh đổi bằng một canh bạc lớn nhất cuộc đời?',
    stageDirection: 'Thời gian như ngưng đọng. Cả phòng khách im phăng phắc chờ đợi câu trả lời của bạn.',
    next: 'villa_decision'
  },

  villa_decision: {
    id: 'villa_decision',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát',
    emotion: 'cold',
    portraitUrl: '/portraits/father_cold.jpg',
    text: 'Ta không có nhiều thời gian. Cậu có 3 sự lựa chọn. Hãy chọn lấy một con đường và đừng bao giờ hối hận!',
    stageDirection: 'Hãy cân nhắc kỹ lưỡng: Quyết định này sẽ định đoạt số phận của bạn, Lan Anh và toàn bộ sự nghiệp.',
    choices: [
      {
        id: 'villa_choice_a',
        text: 'A. Cầm 500 triệu và buông tay rời đi',
        subtext: 'Chấp nhận thực tế phũ phàng, cầm số tiền lớn để tìm cuộc sống an phận.',
        impact: 'Kích hoạt Cắt cảnh Bi Kịch: Lan Anh kết hôn với người khác theo ý gia đình.',
        badge: '💔 Kết thúc Branch A',
        badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
        next: 'villa_branch_a_01'
      },
      {
        id: 'villa_choice_b',
        text: 'B. Từ chối tiền & bảo vệ lòng tự ái',
        subtext: 'Không nhận một đồng nào từ nhà họ Hoàng, quyết tâm tự đi lên.',
        impact: 'Chế độ Cực Khó: Khởi nghiệp với vỏn vẹn 50 triệu tiền tiết kiệm ít ỏi.',
        badge: '⚡ Hardcore Bootstrap',
        badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
        next: 'villa_branch_b_01'
      },
      {
        id: 'villa_choice_c',
        text: 'C. Nhận 500 triệu như một KHOẢN ĐẦU TƯ DANH DỰ!',
        subtext: 'Xem 500 triệu là vốn đầu tư thiên thần, cam kết thành lập StartUp Co. 3 tầng và quay lại cưới Lan Anh.',
        impact: 'Cốt truyện chính: Nhận 500 triệu VNĐ, mở khóa toàn bộ tính năng quản trị công ty.',
        badge: '🚀 Cốt truyện Chính',
        badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
        next: 'villa_branch_c_01'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // NHÁNH A: CẦM TIỀN RỜI ĐI
  // --------------------------------------------------------------------------
  villa_branch_a_01: {
    id: 'villa_branch_a_01',
    speaker: 'NAM',
    speakerName: 'Nguyễn Thành Nam',
    speakerTitle: 'Bạn',
    emotion: 'tired',
    portraitUrl: '/portraits/nam_tired.jpg',
    text: 'Cháu hiểu ý bác... Có lẽ thực tế cuộc đời này đúng như bác nói. Cháu xin phép nhận chiếc vali này và sẽ không làm phiền Lan Anh nữa.',
    stageDirection: 'Bạn cúi đầu, bàn tay run run cầm lấy quai xách chiếc vali 500 triệu.',
    next: 'villa_branch_a_02'
  },
  villa_branch_a_02: {
    id: 'villa_branch_a_02',
    speaker: 'LAN_ANH',
    speakerName: 'Hoàng Lan Anh',
    speakerTitle: 'Bạn Gái',
    emotion: 'emotional',
    portraitUrl: '/portraits/lan_anh_emotional.jpg',
    text: 'Anh Nam... Sao anh lại làm vậy?! Hóa ra những lời hứa hẹn suốt bốn năm đại học của anh chỉ đáng giá 500 triệu đồng thôi sao?! Em hận anh!',
    stageDirection: 'Lan Anh gục xuống sofa khóc nức nở trong nỗi thất vọng tột cùng.',
    next: 'villa_branch_a_03'
  },
  villa_branch_a_03: {
    id: 'villa_branch_a_03',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Vinh Phát',
    emotion: 'cold',
    portraitUrl: '/portraits/father_cold.jpg',
    text: 'Biết điều đấy chàng trai trẻ. Người biết thức thời mới là tuấn kiệt. Cầm tiền và rời khỏi đây ngay lập tức!',
    stageDirection: 'Bạn bước ra khỏi dinh thự trong cơn mưa đêm lạnh giá với chiếc vali nặng trĩu...',
    onEnter: (gsm) => {
      gsm.chooseIntroOptionA();
    }
  },

  // --------------------------------------------------------------------------
  // NHÁNH B: TỪ CHỐI TIỀN & BỎ ĐI
  // --------------------------------------------------------------------------
  villa_branch_b_01: {
    id: 'villa_branch_b_01',
    speaker: 'NAM',
    speakerName: 'Nguyễn Thành Nam',
    speakerTitle: 'Bạn',
    emotion: 'angry',
    portraitUrl: '/portraits/nam_worried.jpg',
    text: 'Cháu nghèo thật, nhưng danh dự của cháu và tình cảm dành cho Lan Anh không phải là thứ có thể mua chuộc bằng tiền! Cháu không cần một xu nào của bác!',
    stageDirection: 'Bạn kiên quyết đẩy chiếc vali trở lại trước mặt Ông Vinh.',
    next: 'villa_branch_b_02'
  },
  villa_branch_b_02: {
    id: 'villa_branch_b_02',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Vinh Phát',
    emotion: 'disappointed',
    portraitUrl: '/portraits/father_disappointed.jpg',
    text: 'Hừ! Lòng tự trọng của kẻ nghèo chỉ là thứ vô giá trị. Cậu nghĩ không có tiền thì cậu làm được trò trống gì ngoài xã hội kia? Cút đi!',
    stageDirection: 'Ông Vinh xua tay quay lưng đi, không thèm nhìn bạn thêm một lần nào.',
    next: 'villa_branch_b_03'
  },
  villa_branch_b_03: {
    id: 'villa_branch_b_03',
    speaker: 'LAN_ANH',
    speakerName: 'Hoàng Lan Anh',
    speakerTitle: 'Bạn Gái',
    emotion: 'worried',
    portraitUrl: '/portraits/lan_anh_worried.jpg',
    text: 'Anh Nam... Em tin anh. Dù con đường phía trước có gian nan gấp trăm lần, em vẫn sẽ chờ ngày anh thành công!',
    stageDirection: 'Ánh mắt Lan Anh nhìn theo bóng lưng bạn với niềm tin sắt đá.',
    onEnter: (gsm) => {
      gsm.chooseIntroOptionB();
    }
  },

  // --------------------------------------------------------------------------
  // NHÁNH C: NHẬN TIỀN NHƯ KHOẢN ĐẦU TƯ DANH DỰ (CỐT TRUYỆN CHÍNH)
  // --------------------------------------------------------------------------
  villa_branch_c_01: {
    id: 'villa_branch_c_01',
    speaker: 'NAM',
    speakerName: 'Nguyễn Thành Nam',
    speakerTitle: 'Bạn (CEO Khởi Nghiệp Tương Lai)',
    emotion: 'confident',
    portraitUrl: '/portraits/nam_confident.jpg',
    text: 'Thưa bác, cháu xin phép NHẬN 500 triệu đồng này! Nhưng đây tuyệt đối không phải là tiền bố thí để mua sự rút lui. Cháu nhận nó như một khoản VỐN ĐẦU TƯ THIÊN THẦN từ Tập Đoàn Vinh Phát!',
    stageDirection: 'Bạn nhìn thẳng vào mắt vị Chủ tịch lão luyện với ánh mắt rực lửa ý chí.',
    next: 'villa_branch_c_02'
  },
  villa_branch_c_02: {
    id: 'villa_branch_c_02',
    speaker: 'NAM',
    speakerName: 'Nguyễn Thành Nam',
    speakerTitle: 'Bạn (CEO Khởi Nghiệp Tương Lai)',
    emotion: 'confident',
    portraitUrl: '/portraits/nam_confident.jpg',
    text: 'Cháu sẽ dùng đúng 500 triệu này để thành lập StartUp Co., xây dựng sản phẩm công nghệ tỷ đô, và chứng minh cho bác thấy: Lan Anh đã không nhìn lầm người! Trong vòng 3 năm, cháu sẽ quay lại đây rước cô ấy với tư cách là người đàn ông thành đạt!',
    stageDirection: 'Bạn đặt tay lên chiếc vali 500 triệu, giọng nói dõng dạc vang vọng khắp sảnh dinh thự.',
    next: 'villa_branch_c_03'
  },
  villa_branch_c_03: {
    id: 'villa_branch_c_03',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát',
    emotion: 'surprised',
    portraitUrl: '/portraits/father_surprised.jpg',
    text: 'Cái gì?! Coi 500 triệu của ta là vốn đầu tư mạo hiểm sao?! Thằng nhóc này... Cậu dám dùng chính tiền của ta để thách thức lại ta à?',
    stageDirection: 'Ông Vinh ngẩn người trong chốc lát, rồi một nụ cười tán thưởng hiếm hoi hiện lên trên khóe môi.',
    next: 'villa_branch_c_04'
  },
  villa_branch_c_04: {
    id: 'villa_branch_c_04',
    speaker: 'FATHER',
    speakerName: 'Ông Hoàng Thế Vinh',
    speakerTitle: 'Chủ Tịch Tập Đoàn Vinh Phát',
    emotion: 'normal',
    portraitUrl: '/portraits/father_normal.jpg',
    text: 'Khá lắm! Ta làm kinh doanh 30 năm qua, chưa từng thấy thằng nhóc nào dám nói chuyện với ta như vậy. Được! Ta cho cậu 3 năm. Nếu phá sản, tự động biến khỏi tầm mắt con gái ta vĩnh viễn!',
    stageDirection: 'Ông Vinh gật đầu ra hiệu đồng ý giao chiếc vali cho bạn.',
    next: 'villa_branch_c_05'
  },
  villa_branch_c_05: {
    id: 'villa_branch_c_05',
    speaker: 'LAN_ANH',
    speakerName: 'Hoàng Lan Anh',
    speakerTitle: 'Bạn Gái',
    emotion: 'happy',
    portraitUrl: '/portraits/lan_anh_happy.jpg',
    text: 'Anh Nam! Em biết anh làm được mà! Em sẽ luôn ở đây ủng hộ anh, hãy làm cho bố thấy anh tài giỏi thế nào nhé!',
    stageDirection: 'Nụ cười rạng rỡ của Lan Anh xua tan bầu không khí căng thẳng của căn phòng.',
    next: 'villa_branch_c_06'
  },
  villa_branch_c_06: {
    id: 'villa_branch_c_06',
    speaker: 'SYSTEM',
    speakerName: 'Hệ Thống Khởi Nghiệp',
    speakerTitle: 'Hành Trình Bắt Đầu',
    portraitUrl: '/portraits/nam_confident.jpg',
    text: '🎉 BẠN ĐÃ NHẬN 500.000.000 VNĐ TIỀN MẶT!\n\nNhiệm vụ đầu tiên: Quay về phòng trọ (15m²) chuẩn bị đồ đạc, sau đó bước ra phố lớn và tiến vào Trụ Sở StartUp Co. 3 Tầng để tuyển dụng nhân sự, điều hành micro-sprint và xây dựng sản phẩm công nghệ đầu tiên!',
    stageDirection: 'Chiến dịch CEO Empire chính thức bắt đầu!',
    onEnter: (gsm) => {
      gsm.chooseIntroOptionC();
    }
  }
};
