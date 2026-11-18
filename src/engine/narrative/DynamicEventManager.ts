// ============================================================================
// CEO EMPIRE: DYNAMIC EVENT ENGINE (Hệ thống sự kiện ngẫu nhiên & Chuỗi hệ quả)
// ============================================================================

import { DynamicGameEvent } from '../../types';

export class DynamicEventManager {
  private static eventsPool: DynamicGameEvent[] = [
    {
      id: 'evt_shark_tank',
      title: 'Quỹ Đầu Tư Thiên Thần (Shark Angel) Đề Nghị Rót Vốn',
      category: 'FINANCE',
      description: 'Một nhà đầu tư mạo hiểm sau khi thấy tốc độ tăng trưởng của công ty đã đề nghị rót ngay 2.000.000.000 VNĐ (2 tỷ) đổi lấy 35% cổ phần công ty.',
      options: [
        {
          text: 'Đồng ý nhận 2 tỷ và chấp nhận chia sẻ quyền kiểm soát (35% cổ phần)',
          actionKey: 'ACCEPT_SHARK_INVESTMENT',
          immediateEffectText: '+2.000.000.000đ tiền mặt, Uy tín +25, nhưng áp lực KPI từ cổ đông tăng vọt.'
        },
        {
          text: 'Từ chối, kiên quyết giữ quyền tự chủ tuyệt đối (Bootstrap)',
          actionKey: 'REJECT_SHARK_INVESTMENT',
          immediateEffectText: 'Giữ nguyên 100% quyền kiểm soát, tự lực cánh sinh.'
        }
      ]
    },
    {
      id: 'evt_poaching_threat',
      title: 'Đối Thủ Cạnh Tranh Tung Chiêu Headhunt',
      category: 'HR',
      description: 'Một tập đoàn công nghệ lớn vừa tiếp cận các lập trình viên Senior của bạn với lời mời chào mức lương gấp rưỡi kèm chế độ du lịch châu Âu.',
      options: [
        {
          text: 'Tăng ngay 25% lương và chia thưởng cổ phần ESOP để giữ chân người tài',
          actionKey: 'COUNTER_OFFER_TALENTS',
          immediateEffectText: 'Chi phí quỹ lương tăng 25%, nhưng Độ trung thành và Niềm tin CEO đạt tối đa 100%!'
        },
        {
          text: 'Tâm sự truyền cảm hứng về tầm nhìn và sứ mệnh công ty',
          actionKey: 'INSPIRE_TALENTS',
          immediateEffectText: 'Không tốn tiền, nhưng có 30% rủi ro 1 nhân sự then chốt sẽ dứt áo ra đi.'
        }
      ]
    },
    {
      id: 'evt_tax_inspection',
      title: 'Đoàn Thanh Tra Thuế Đến Làm Việc Đột Xuất',
      category: 'LEGAL',
      description: 'Cán bộ Chi cục Thuế đến văn phòng yêu cầu xuất trình toàn bộ sổ sách kế toán, hóa đơn đầu vào và chứng từ nộp bảo hiểm xã hội (BHXH).',
      options: [
        {
          text: 'Cung cấp minh bạch 100% chứng từ, chấp nhận kiểm tra toàn diện',
          actionKey: 'COOPERATE_TAX_INSPECTION',
          immediateEffectText: 'Nếu sổ sách chuẩn: Uy tín pháp lý tăng tối đa. Nếu có sai sót: Nộp phạt hành chính.'
        },
        {
          text: 'Cố tình trì hoãn và tìm cách nhờ vả quan hệ ngầm',
          actionKey: 'BRIBE_TAX_OFFICIALS',
          immediateEffectText: 'Rủi ro cực lớn: Tăng nguy cơ bị chuyển hồ sơ sang Cơ quan Điều tra Hình sự!'
        }
      ]
    },
    {
      id: 'evt_lan_anh_sick',
      title: 'Lan Anh Đột Ngột Bị Ốm Sốt Đúng Ngày Thuyết Trình Dự Án',
      category: 'ROMANCE',
      description: 'Lan Anh gọi điện với giọng yếu ớt vì sốt cao, trong khi 2 tiếng nữa bạn phải thuyết trình hợp đồng 500 triệu trước đối tác.',
      options: [
        {
          text: 'Ủy quyền cho Phó Giám đốc đi họp, lập tức đến chăm sóc Lan Anh',
          actionKey: 'ACCOMPANY_LAN_ANH',
          immediateEffectText: 'Tình cảm và Niềm tin của Lan Anh đạt 100%! Hợp đồng có thể bị đối tác trừ nhẹ 10% giá trị.'
        },
        {
          text: 'Đặt thuốc và đồ ăn giao tận nơi, tập trung đi chốt hợp đồng lớn',
          actionKey: 'FOCUS_BUSINESS_MEETING',
          immediateEffectText: 'Ký thành công hợp đồng lớn, nhưng Lan Anh buồn và cảm thấy cô đơn.'
        }
      ]
    },
    {
      id: 'evt_cloud_crash',
      title: 'Hệ Thống Máy Chủ Cloud Bị Sập Vào Giờ Cao Điểm',
      category: 'PROJECT',
      description: 'Dịch vụ của một khách hàng lớn bị gián đoạn do lưu lượng truy cập đột biến. Khách hàng dọa sẽ phạt hợp đồng 50 triệu nếu không khôi phục trong 2 giờ.',
      options: [
        {
          text: 'Cùng toàn thể đội Dev thức trắng đêm nâng cấp hạ tầng Cloud Server',
          actionKey: 'CRUNCH_RESTORE_SERVER',
          immediateEffectText: 'Khắc phục hoàn toàn, Khách hàng khen ngợi. Nhân viên mệt mỏi nhưng được thưởng nóng.'
        },
        {
          text: 'Đổ lỗi cho nhà cung cấp hạ tầng viễn thông bên thứ ba',
          actionKey: 'BLAME_INFRASTRUCTURE',
          immediateEffectText: 'Bị khách hàng trừ 30.000.000đ tiền phạt và giảm 15 điểm uy tín thị trường.'
        }
      ]
    }
  ];

  // Kiểm tra kích hoạt sự kiện ngẫu nhiên theo xác suất mỗi ngày
  public static rollDailyEvent(currentDay: number, historyLog: string[]): DynamicGameEvent | null {
    if (Math.random() < 0.28) {
      const unusedEvents = this.eventsPool.filter((e) => !historyLog.includes(e.id));
      if (unusedEvents.length > 0) {
        return unusedEvents[Math.floor(Math.random() * unusedEvents.length)];
      }
    }
    return null;
  }
}
