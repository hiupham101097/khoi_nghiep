// ============================================================================
// CEO EMPIRE: ENDINGS MANAGER (7 Nhánh Kết Thúc Hoàn Chỉnh & Ending 07 Ngày Trở Về)
// ============================================================================

import { EndingData, GameSaveState } from '../../types';

export const GAME_ENDINGS: Record<string, EndingData> = {
  ENDING_01: {
    code: 'ENDING_01',
    title: 'KỲ LÂN CÔNG NGHỆ & ĐÁM CƯỚI THẾ KỶ',
    subtitle: 'Thành công trọn vẹn cả sự nghiệp lẫn tình yêu',
    description: 'Bạn đã biến 500 triệu thành một tập đoàn công nghệ nghìn tỷ, nhận được sự nể phục tuyệt đối từ ông Vinh và nắm tay Lan Anh bước vào lễ đường rực rỡ.',
    bannerColor: '#10b981',
    isVictory: true,
    storyNarrative: [
      'Sau những năm tháng cống hiến không ngừng nghỉ, công ty của bạn chính thức niêm yết IPO thành công rực rỡ trên sàn chứng khoán.',
      'Ông Hoàng Thế Vinh đích thân đến chúc mừng, trao cho bạn cái ôm ấm áp của một người cha và gửi gắm toàn bộ niềm tin.',
      'Trong tiếng vỗ tay vang dội của bạn bè và đối tác, Lan Anh mỉm cười rạng rỡ trong chiếc váy cưới trắng tinh khôi.',
      'Bạn đã chứng minh cho cả thế giới thấy: Khát vọng và sự chính trực là bệ phóng vĩ đại nhất để chinh phục đỉnh cao.'
    ]
  },

  ENDING_02: {
    code: 'ENDING_02',
    title: 'ĐẠI GIA CÔ ĐỘC',
    subtitle: 'Có được tiền tài nhưng đánh mất người mình yêu thương nhất',
    description: 'Doanh nghiệp của bạn siêu lợi nhuận, nhưng vì quá mải mê kiếm tiền và liên tục thất hứa, Lan Anh đã buông tay và kết hôn với một người khác.',
    bannerColor: '#f59e0b',
    isVictory: false,
    storyNarrative: [
      'Tài khoản công ty có hàng chục tỷ đồng, bạn ngồi trên tầng cao nhất của tòa tháp Bitexco nhìn xuống ánh đèn thành phố.',
      'Điện thoại reo lên tấm thiệp cưới điện tử của Lan Anh gửi đến. Cô ấy đã chọn một người biết dành thời gian lắng nghe và ở bên cạnh cô.',
      'Bạn nâng ly rượu vang đắt tiền, một mình đối diện với căn phòng rộng lớn thênh thang và sự cô đơn vô tận.',
      'Tiền tài có thể mua được nhiều thứ, nhưng không bao giờ mua lại được những năm tháng thanh xuân của người con gái từng chờ đợi bạn.'
    ]
  },

  ENDING_03: {
    code: 'ENDING_03',
    title: 'DOANH NGHIỆP BỀN VỮNG & HẠNH PHÚC BÌNH YÊN',
    subtitle: 'Quy mô vừa phải, cân bằng cuộc sống và gia đình',
    description: 'Không cần trở thành tập đoàn nghìn tỷ, bạn duy trì một studio công nghệ tinh gọn 15 người hoạt động bền bỉ và cùng Lan Anh xây dựng tổ ấm hạnh phúc.',
    bannerColor: '#06b6d4',
    isVictory: true,
    storyNarrative: [
      'Công ty công nghệ của bạn duy trì lượng khách hàng ổn định, nhân viên gắn bó như một gia đình thứ hai.',
      'Vào mỗi chiều thứ Sáu, bạn cùng Lan Anh đi dạo quanh hồ, thưởng thức những món ăn yêu thích mà không phải âu lo áp lực cổ đông.',
      'Ông Vinh nhận ra rằng: Sự bền vững và bình yên của con gái mới là giá trị quý giá nhất của một người đàn ông trưởng thành.'
    ]
  },

  ENDING_04: {
    code: 'ENDING_04',
    title: 'VỠ NỢ & PHÁ SẢN',
    subtitle: 'Dòng tiền cạn kiệt, giấc mơ khởi nghiệp tan vỡ',
    description: 'Quản trị tài chính yếu kém khiến dòng tiền âm nặng nề, ngân hàng siết nợ và công ty buộc phải tuyên bố phá sản.',
    bannerColor: '#ef4444',
    isVictory: false,
    storyNarrative: [
      'Tài khoản công ty về con số âm, các chủ nợ liên tục gửi thông báo siết tài sản và bàn ghế văn phòng bị niêm phong.',
      '500 triệu đồng khởi nghiệp đã tan thành mây khói trong những quyết định đầu tư sai lầm.',
      'Lan Anh đứng trước cửa phòng trọ nhìn bạn trong nước mắt, rồi lặng lẽ theo gia đình ra nước ngoài định cư.',
      'Khởi nghiệp không phải là màu hồng, đó là chiến trường khốc liệt nơi sự non nớt phải trả giá bằng cả giấc mơ.'
    ]
  },

  ENDING_05: {
    code: 'ENDING_05',
    title: 'ĐẢO CHÍNH PHÒNG HỌP',
    subtitle: 'Bị Hội đồng quản trị bãi nhiệm chức vụ CEO',
    description: 'Bán quá nhiều cổ phần cho các quỹ đầu tư mạo hiểm, bạn mất quyền kiểm soát và bị các nhà đầu tư phế truất khỏi chính đứa con tinh thần của mình.',
    bannerColor: '#8b5cf6',
    isVictory: false,
    storyNarrative: [
      'Trong phiên họp Đại hội đồng cổ đông bất thường, các nhà đầu tư biểu quyết bãi nhiệm vị trí Tổng Giám đốc của bạn với tỷ lệ 65%.',
      'Bạn phải thu dọn đồ đạc cá nhân rời khỏi văn phòng do chính tay mình dựng nên từ viên gạch đầu tiên.',
      'Bài học đắt giá về cơ cấu vốn và quản trị quyền lực sẽ theo bạn suốt những chặng đường sau này.'
    ]
  },

  ENDING_06: {
    code: 'ENDING_06',
    title: 'BÃO SA THẢI & DOANH NGHIỆP HOANG TÀN',
    subtitle: 'Khủng hoảng nhân sự, đình công tập thể khiến công ty sụp đổ',
    description: 'Bóc lột nhân viên, ép tăng ca không trả lương và bội ước khiến toàn thể nhân sự đồng loạt đình công và nghỉ việc hàng loạt.',
    bannerColor: '#dc2626',
    isVictory: false,
    storyNarrative: [
      'Văn phòng công ty vắng tanh không một bóng người. Các biểu ngữ đình công vẫn còn vương vãi trên sàn.',
      'Các dự án lớn bị đứt gãy giữa chừng, khách hàng đồng loạt đơn phương chấm dứt hợp đồng và kiện đòi bồi thường thiệt hại.',
      'Bạn nhận ra rằng công nghệ không phải là những dòng code vô tri, mà là sự cống hiến của những con người bằng xương bằng thịt.'
    ]
  },

  // ENDING 07: KỊCH BẢN CHI TIẾT "NGÀY TRỞ VỀ" ĐƯỢC CHỈ ĐỊNH RÕ RÀNG TRONG MASTER PROMPT
  ENDING_07: {
    code: 'ENDING_07',
    title: 'ENDING 07 — NGÀY TRỞ VỀ',
    subtitle: 'Bản án tù 5 năm, mất tất cả và Permanent Game Over',
    description: 'Công ty sụp đổ vì sai phạm pháp luật nghiêm trọng. Sau 5 năm chấp hành án tù, ngày trở về chỉ còn lại sự cô độc và hình bóng người xưa bên mái ấm khác.',
    bannerColor: '#1e293b',
    isVictory: false,
    storyNarrative: [
      '1. Tòa án Nhân dân tuyên đọc bản án: Phạm tội Trốn thuế và Gian lận tài chính nghiêm trọng, phạt 5 năm tù giam. Búa thẩm phán gõ vang dội.',
      '2. Công ty bị phong tỏa toàn bộ tài sản. Lan Anh khóc nấc trong phòng xử án, rồi quay lưng bước đi trong tuyệt vọng.',
      '3. Năm năm lạnh lẽo trôi qua sau song sắt trại giam. Tóc bạn đã điểm những sợi bạc của sự hối hận muộn màng.',
      '4. Ngày mãn hạn tù: Tiếng cánh cổng sắt nặng nề khép lại sau lưng. Bạn bước ra với bộ quần áo sờn cũ và chiếc túi vải nhỏ.',
      '5. Đón chuyến xe buýt trở về thành phố cũ, con đường quen nay đã mọc lên bao tòa nhà cao tầng xa lạ.',
      '6. Bạn lặng lẽ tìm đến trước cổng ngôi nhà quen thuộc của Lan Anh năm nào.',
      '7. Qua khung cửa sổ sáng đèn ấm áp, bạn nhìn thấy Lan Anh đang cười dịu dàng, bên cạnh là người chồng chu đáo và đứa con thơ bi bô tập nói.',
      '8. Bạn kéo sụp chiếc mũ áo che đi gương mặt khắc khổ, im lặng quay lưng bước đi trong màn mưa chiều buốt giá.',
      '9. Không có cơ hội thứ hai. Không có kịch bản tái khởi nghiệp.',
      '10. PERMANENT GAME OVER.'
    ]
  }
};

export class EndingManager {
  // Kiểm tra điều kiện kích hoạt các Ending
  public static evaluateEnding(state: GameSaveState): EndingData | null {
    // 1. Kiểm tra Ending 07 (Bản án tù có hiệu lực)
    if (state.legal.sentencedToPrison) {
      return GAME_ENDINGS.ENDING_07;
    }

    // 2. Kiểm tra Phá sản (Ending 04)
    if (state.playerStats.cash < -50000000) {
      return GAME_ENDINGS.ENDING_04;
    }

    // 3. Kiểm tra Khủng hoảng nhân sự (Ending 06)
    if (state.employees.length >= 3 && state.employees.every((e) => e.isStriking || e.hasGivenNotice)) {
      return GAME_ENDINGS.ENDING_06;
    }

    // 4. Kiểm tra Thành công vượt bậc (Ending 01)
    if (state.playerStats.cash > 2000000000 && state.playerStats.reputation >= 85 && state.romance.affection >= 85) {
      return GAME_ENDINGS.ENDING_01;
    }

    // 5. Kiểm tra Đại gia cô độc (Ending 02)
    if (state.playerStats.cash > 3000000000 && state.romance.affection <= 20) {
      return GAME_ENDINGS.ENDING_02;
    }

    // 6. Kiểm tra Doanh nghiệp bền vững hạnh phúc (Ending 03)
    if (state.day > 180 && state.playerStats.cash > 500000000 && state.romance.affection >= 75 && state.employees.length >= 4) {
      return GAME_ENDINGS.ENDING_03;
    }

    return null;
  }
}
