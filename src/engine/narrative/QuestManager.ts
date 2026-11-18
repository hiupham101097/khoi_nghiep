// ============================================================================
// CEO EMPIRE: QUEST & MILESTONE MANAGER (Hệ Thống Nhiệm Vụ Cốt Truyện & Định Hướng)
// ============================================================================

export interface GameQuest {
  id: string;
  chapter: number;
  chapterTitle: string;
  title: string;
  description: string;
  targetHint: string;
  targetLocation: 'ROOM' | 'CITY' | 'OFFICE' | 'CAFE' | 'BANK' | 'COURT' | 'VILLA';
  isCompleted: boolean;
  rewardText: string;
}

export class QuestManager {
  public static quests: GameQuest[] = [
    {
      id: 'quest_1_1',
      chapter: 1,
      chapterTitle: 'Chương 1: Khởi Sự Từ Hai Bàn Tay Trắng',
      title: 'Đăng Ký Thành Lập Doanh Nghiệp',
      description: 'Cầm 500 triệu trong tay, bước đầu tiên là phải có tư cách pháp nhân hợp pháp. Hãy đến Chi Cục Thuế & Đăng Ký Kinh Doanh để mở công ty.',
      targetHint: 'Rời phòng trọ ra phố, đi về phía Đông Nam đến Chi Cục Thuế [Nhấn E].',
      targetLocation: 'CITY',
      isCompleted: false,
      rewardText: '+10 Uy tín, Giấy phép ĐKKD & Mã số thuế hợp lệ'
    },
    {
      id: 'quest_1_2',
      chapter: 1,
      chapterTitle: 'Chương 1: Khởi Sự Từ Hai Bàn Tay Trắng',
      title: 'Thuê Văn Phòng Làm Việc Đầu Tiên',
      description: 'Công ty cần có một địa điểm làm việc thực tế cho đội ngũ. Hãy đến StartUp Tower và chọn thuê gói văn phòng phù hợp với ngân sách.',
      targetHint: 'Đi đến Tòa Nhà StartUp Tower giữa phố, mở menu Văn Phòng để thuê gói Hẻm Khởi Nghiệp (15tr/tháng).',
      targetLocation: 'CITY',
      isCompleted: false,
      rewardText: 'Mở khóa không gian văn phòng thực tế & chỗ ngồi nhân viên'
    },
    {
      id: 'quest_1_3',
      chapter: 1,
      chapterTitle: 'Chương 1: Khởi Sự Từ Hai Bàn Tay Trắng',
      title: 'Trang Bị Cơ Sở Vật Chất Cốt Lõi',
      description: 'Để nhân viên làm việc hiệu quả, hãy mua sắm bàn làm việc và trang thiết bị công thái học cơ bản.',
      targetHint: 'Vào văn phòng hoặc mở CEO Suite [TAB] -> Tab Văn phòng -> Mua Ghế Công Thái Học hoặc Bàn Máy Tính.',
      targetLocation: 'OFFICE',
      isCompleted: false,
      rewardText: 'Giảm 30% tốc độ tích lũy căng thẳng cho nhân viên'
    },
    {
      id: 'quest_1_4',
      chapter: 1,
      chapterTitle: 'Chương 1: Khởi Sự Từ Hai Bàn Tay Trắng',
      title: 'Chiêu Mộ Nhân Tài Công Nghệ Đầu Tiên',
      description: 'Một mình bạn không thể vừa code vừa thiết kế vừa test. Hãy phỏng vấn và tuyển dụng ít nhất 2 nhân sự (Frontend / Backend / Designer).',
      targetHint: 'Đến Quán Cà Phê StartUp Hub hoặc mở CEO Suite [TAB] -> Tab Nhân sự -> Tuyển thêm nhân sự.',
      targetLocation: 'CAFE',
      isCompleted: false,
      rewardText: 'Nhân viên đến văn phòng đi lại và làm việc thực tế'
    },
    {
      id: 'quest_1_5',
      chapter: 1,
      chapterTitle: 'Chương 1: Khởi Sự Từ Hai Bàn Tay Trắng',
      title: 'Săn Hợp Đồng Thầu Đầu Tiên & Thu Hồi Vốn',
      description: 'Tìm kiếm khách hàng đầu tiên trên Bảng chào thầu. Ký hợp đồng để nhận ngay 30% tiền tạm ứng.',
      targetHint: 'Mở Bảng Chào Thầu Dự Án, ký hợp đồng Website hoặc App phù hợp năng lực.',
      targetLocation: 'OFFICE',
      isCompleted: false,
      rewardText: '+30% tiền mặt tạm ứng vào tài khoản công ty'
    },
    {
      id: 'quest_2_1',
      chapter: 2,
      chapterTitle: 'Chương 2: Sóng Gió Thương Trường',
      title: 'Bàn Giao Dự Án Không Lỗi (Zero Bug)',
      description: 'Giám sát tiến độ Sprint, chỉ đạo Tester rà soát mã nguồn và bàn giao sản phẩm hoàn hảo cho khách hàng.',
      targetHint: 'Đạt 100% tiến độ và 0 bug để nhận 70% thanh toán còn lại.',
      targetLocation: 'OFFICE',
      isCompleted: false,
      rewardText: '+70% giá trị hợp đồng & tăng vọt Uy tín thương trường'
    },
    {
      id: 'quest_2_2',
      chapter: 2,
      chapterTitle: 'Chương 2: Sóng Gió Thương Trường',
      title: 'Giữ Gìn Hạnh Phúc Cùng Lan Anh',
      description: 'Đừng để công việc cuốn đi tất cả. Hãy dành thời gian mời Lan Anh đi hẹn hò hoặc tặng quà để duy trì niềm tin.',
      targetHint: 'Đến quán Cà Phê gặp Lan Anh [E] hoặc dùng tính năng Hẹn hò trong CEO Suite.',
      targetLocation: 'CAFE',
      isCompleted: false,
      rewardText: '+20 Điểm Yêu Thương & tránh rạn nứt tình cảm'
    },
    {
      id: 'quest_3_1',
      chapter: 3,
      chapterTitle: 'Chương 3: Kỳ Lân Công Nghệ & Khẳng Định Bản Lĩnh',
      title: 'Chinh Phục Định Giá 3 Tỷ & Nể Phục Từ Bố Vợ',
      description: 'Tăng trưởng doanh thu, mở rộng quy mô đội ngũ, hướng tới định giá doanh nghiệp vượt mốc 3 tỷ VNĐ.',
      targetHint: 'Hoàn thành nhiều dự án lớn, duy trì dòng tiền dương qua các kỳ quyết toán.',
      targetLocation: 'OFFICE',
      isCompleted: false,
      rewardText: 'Mở khóa sự công nhận của Ông Hoàng Thế Vinh'
    }
  ];

  public static getCurrentQuest(
    isRegistered: boolean,
    currentOfficeId: string,
    hasFurniture: boolean,
    employeesCount: number,
    activeProjectsCount: number,
    completedProjectsCount: number,
    romanceDatesCount: number,
    valuation: number
  ): GameQuest {
    // Tự động kiểm tra điều kiện hoàn thành từng nhiệm vụ
    this.quests[0].isCompleted = isRegistered;
    this.quests[1].isCompleted = currentOfficeId !== 'none' && currentOfficeId !== '';
    this.quests[2].isCompleted = hasFurniture;
    this.quests[3].isCompleted = employeesCount >= 2;
    this.quests[4].isCompleted = activeProjectsCount > 0 || completedProjectsCount > 0;
    this.quests[5].isCompleted = completedProjectsCount >= 1;
    this.quests[6].isCompleted = romanceDatesCount >= 1;
    this.quests[7].isCompleted = valuation >= 3000000000;

    // Trả về quest chưa hoàn thành đầu tiên
    return this.quests.find((q) => !q.isCompleted) || this.quests[this.quests.length - 1];
  }
}
