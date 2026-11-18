// ============================================================================
// CEO EMPIRE: ROMANCE & RELATIONSHIP SYSTEM (Lan Anh & Bố Người Yêu)
// ============================================================================

import { RomanceProfile, FatherProfile } from '../../types';
import { soundManager } from '../core/SoundManager';

export class RelationshipManager {
  public static initialRomance(): RomanceProfile {
    return {
      name: 'Lan Anh',
      affection: 75,
      trust: 80,
      patience: 70,
      lastDateDay: 1,
      promisedGifts: [],
      datingHistory: ['Bắt đầu lời hứa lập nghiệp vì tình yêu.'],
      currentMood: 'SUPPORTIVE'
    };
  }

  public static initialFather(): FatherProfile {
    return {
      name: 'Ông Hoàng Thế Vinh',
      respect: 15,
      evaluation: 'SKEPTICAL',
      lastEncounterDay: 1
    };
  }

  // Cập nhật tình cảm mỗi ngày trôi qua
  public static updateDailyRelationship(
    romance: RomanceProfile,
    father: FatherProfile,
    currentDay: number,
    companyReputation: number,
    companyValuation: number
  ) {
    const daysSinceLastDate = currentDay - romance.lastDateDay;

    // Nếu quá 7 ngày không gặp gỡ hẹn hò, Lan Anh bắt đầu thấy cô đơn và thất vọng
    if (daysSinceLastDate > 12) {
      romance.currentMood = 'HEARTBROKEN';
      romance.affection = Math.max(0, romance.affection - 2.5);
      romance.patience = Math.max(0, romance.patience - 3.5);
    } else if (daysSinceLastDate > 6) {
      romance.currentMood = 'LONELY';
      romance.patience = Math.max(0, romance.patience - 1.2);
    }

    // Đánh giá của Bố Người Yêu (Ông Vinh) dựa trên thực lực kinh doanh
    if (companyValuation > 10000000000 && companyReputation >= 75) {
      father.evaluation = 'PROUD';
      father.respect = 90;
    } else if (companyValuation > 3000000000 && companyReputation >= 50) {
      father.evaluation = 'IMPRESSED';
      father.respect = 65;
    } else if (companyValuation > 1000000000) {
      father.evaluation = 'OBSERVING';
      father.respect = 40;
    } else {
      father.evaluation = 'SKEPTICAL';
      father.respect = 15;
    }
  }

  // Hẹn hò cùng Lan Anh tại quán Cà phê hoặc bờ hồ
  public static goOnDate(
    romance: RomanceProfile,
    currentDay: number,
    cost: number = 500000
  ): { affectionGain: number; dialogue: string } {
    romance.lastDateDay = currentDay;
    const affectionGain = 18;
    romance.affection = Math.min(100, romance.affection + affectionGain);
    romance.patience = Math.min(100, romance.patience + 25);
    romance.trust = Math.min(100, romance.trust + 10);
    romance.currentMood = 'JOYFUL';

    const dialogues = [
      'Lan Anh: "Thấy anh vất vả vì tương lai của chúng mình, em thương lắm. Đừng quên ăn uống đúng giờ nhé anh!"',
      'Lan Anh: "Chỉ cần anh giữ đúng lời hứa và không đánh mất chính mình, em luôn tin tưởng anh."',
      'Lan Anh: "Hôm nay ngồi nghe anh say sưa kể về sản phẩm công nghệ của công ty, em thấy mắt anh sáng lấp lánh."',
      'Lan Anh: "Bố em dạo này cũng có hỏi thăm về công ty anh đấy. Bác ấy đang quan sát anh rất kỹ."'
    ];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

    romance.datingHistory.push(`Ngày ${currentDay}: Hẹn hò lãng mạn tại quán cà phê quen.`);
    soundManager.playSuccess();

    return { affectionGain, dialogue };
  }

  // Tặng quà cho Lan Anh
  public static sendGift(
    romance: RomanceProfile,
    giftName: string,
    cost: number
  ): { affectionGain: number } {
    const gain = Math.min(25, Math.floor(cost / 500000) * 5 + 8);
    romance.affection = Math.min(100, romance.affection + gain);
    romance.trust = Math.min(100, romance.trust + 5);
    romance.currentMood = 'JOYFUL';
    romance.datingHistory.push(`Tặng món quà "${giftName}" trị giá ${cost.toLocaleString('vi-VN')} VNĐ.`);
    soundManager.playSuccess();

    return { affectionGain: gain };
  }
}
