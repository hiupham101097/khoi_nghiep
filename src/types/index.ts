// ============================================================================
// CEO EMPIRE: 500 TRIỆU ĐỔI LẤY TƯƠNG LAI — TYPE DEFINITIONS
// ============================================================================

export type GamePhase = 
  | 'INTRO_CINEMATIC'     // Mở đầu cuộc gặp bố người yêu 500 triệu
  | 'INTRO_BRANCH_A'     // Nhánh kết thúc A: Cầm tiền rời đi
  | 'INTRO_BRANCH_B'     // Nhánh kết thúc B: Từ chối và bị bỏ rơi
  | 'PLAYING'            // Chế độ chơi chính (Thế giới mở + Quản trị doanh nghiệp)
  | 'CINEMATIC'          // Đang phát cắt cảnh
  | 'GAME_OVER_ENDING';  // Đã đạt một trong các Ending

export type WeatherType = 'SUNNY' | 'RAIN' | 'OVERCAST';

export type DayTimePeriod = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';

export type CharacterDirection = 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';

export type CharacterAnimationState = 
  | 'IDLE' 
  | 'WALK' 
  | 'SIT' 
  | 'WORK' 
  | 'TALK' 
  | 'HAPPY' 
  | 'SAD' 
  | 'ANGRY' 
  | 'TIRED' 
  | 'STRESSED' 
  | 'CELEBRATE' 
  | 'PROTEST' 
  | 'LEAVE_OFFICE';

export interface Position2D {
  x: number;
  y: number;
}

export interface PlayerStats {
  name: string;
  age: number;
  cash: number;           // Tiền mặt cá nhân/công ty (khởi đầu 500,000,000 VND nếu chọn C)
  energy: number;         // 0 - 100
  maxEnergy: number;
  health: number;         // 0 - 100
  reputation: number;     // Uy tín thương trường 0 - 100
  managementSkill: number;// Kỹ năng quản lý 1 - 100
  techSkill: number;      // Kỹ năng chuyên môn 1 - 100
}

export type EmployeeRole = 'FRONTEND' | 'BACKEND' | 'FULLSTACK' | 'DESIGNER' | 'TESTER' | 'PRODUCT_MANAGER';
export type SkillLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export interface EmployeeAIEntity {
  id: string;
  name: string;
  avatarSeed: number;
  gender: 'MALE' | 'FEMALE';
  role: EmployeeRole;
  level: SkillLevel;
  experienceYears: number;
  
  // Năng lực sản xuất
  speed: number;          // Tốc độ hoàn thành công việc (10 - 100)
  quality: number;        // Chất lượng code/design (10 - 100)
  bugRate: number;        // Tỷ lệ sinh lỗi (0 - 50%)
  
  // Tài chính & Kỳ vọng
  expectedSalary: number; // Lương kỳ vọng (VNĐ/tháng)
  currentSalary: number;  // Lương hiện tại
  
  // Tâm lý & Sinh hoạt
  energy: number;         // Năng lượng (0 - 100)
  happiness: number;      // Hạnh phúc (0 - 100)
  stress: number;         // Căng thẳng (0 - 100)
  resentment: number;     // Mức độ ức chế/bất mãn (0 - 100)
  loyalty: number;        // Độ trung thành (0 - 100)
  ceoTrust: number;       // Niềm tin vào CEO (0 - 100)
  ambition: number;       // Tham vọng thăng tiến (0 - 100)
  
  // Trạng thái hoạt động & Tọa độ di chuyển thực tế trong văn phòng
  currentState: CharacterAnimationState;
  deskIndex: number;      // Bàn làm việc được gán trong văn phòng (-1 nếu chưa có)
  assignedProjectId: string | null;
  currentPos?: Position2D; // Tọa độ X, Y thực tế đang đứng
  targetPos?: Position2D;  // Tọa độ X, Y đang hướng tới
  speechBubble?: string | null; // Lời nói hoặc suy nghĩ hiển thị trên đầu
  speechTimer?: number;    // Thời gian hiển thị bong bóng thoại (giây)
  walkFrame?: number;      // Frame bước đi Chibi
  
  // Hành vi khủng hoảng
  isStriking: boolean;    // Đang đình công
  hasGivenNotice: boolean;// Đã nộp đơn nghỉ việc
  daysUntilQuit: number;  // Số ngày đếm ngược trước khi rời đi
  
  // Bộ nhớ sự kiện (Event Memory)
  memoryLog: string[];
}

export interface CandidateEntity extends Omit<EmployeeAIEntity, 'currentSalary' | 'deskIndex' | 'assignedProjectId' | 'isStriking' | 'hasGivenNotice' | 'daysUntilQuit' | 'currentState'> {
  bio: string;
  personality: 'HARDWORKING' | 'AMBITIOUS' | 'PRAGMATIC' | 'FRAGILE' | 'LOYAL';
}

export interface FurnitureItem {
  id: string;
  name: string;
  type: 'DESK' | 'CHAIR_ERGONOMIC' | 'SERVER_RACK' | 'COFFEE_MACHINE' | 'FOOSBALL' | 'PLANT';
  cost: number;
  monthlyMaintenance: number;
  deskSlotIndex?: number;
  bonus: {
    energyRegen?: number;
    stressReduction?: number;
    bugReduction?: number;
    capacityBoost?: number;
  };
  purchased: boolean;
  x?: number;
  y?: number;
}

export interface OfficeTier {
  id: string;
  name: string;
  address: string;
  monthlyRent: number;
  deposit: number;
  maxDesks: number;
  prestigeBonus: number;
  description: string;
  requiredReputation: number;
}

export interface ProjectContract {
  id: string;
  name: string;
  clientName: string;
  clientType: 'STARTUP' | 'SME' | 'ENTERPRISE' | 'GOVERNMENT';
  clientLogo: string;
  contractValue: number;    // Tổng giá trị VNĐ
  depositReceived: boolean; // Tạm ứng 30%
  totalWorkUnits: number;   // Tổng khối lượng công việc cần làm
  completedWorkUnits: number;
  currentBugs: number;
  durationDays: number;
  daysRemaining: number;
  penaltyPerDay: number;    // Tiền phạt trễ hạn mỗi ngày
  qualityRequirement: number; // 0 - 100
  assignedEmployeeIds: string[];
  status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  description: string;
}

export interface FinancialRecord {
  month: number;
  year: number;
  revenue: number;
  costOfGoods: number;
  payroll: number;
  officeRent: number;
  utilitiesAndServers: number;
  marketing: number;
  taxPaid: number;
  netProfit: number;
  endingCash: number;
}

export interface LoanAccount {
  id: string;
  bankName: string;
  principal: number;
  interestRateAnnual: number;
  termMonths: number;
  monthsRemaining: number;
  monthlyPayment: number;
}

export interface LegalStatus {
  taxComplianceRating: number; // 0 - 100
  laborComplianceRating: number;
  contractDisputesCount: number;
  inspectionsPending: boolean;
  isUnderCriminalInvestigation: boolean;
  chargesFiled: boolean;
  sentencedToPrison: boolean;
  prisonSentenceYears: number;
  historyLog: string[];
}

export interface RomanceProfile {
  name: string;               // Lan Anh
  affection: number;          // 0 - 100
  trust: number;              // 0 - 100
  patience: number;           // 0 - 100
  lastDateDay: number;
  promisedGifts: string[];
  datingHistory: string[];
  currentMood: 'JOYFUL' | 'SUPPORTIVE' | 'LONELY' | 'DISAPPOINTED' | 'HEARTBROKEN';
}

export interface FatherProfile {
  name: string;               // Ông Hoàng Thế Vinh
  respect: number;            // 0 - 100
  evaluation: 'UNACCEPTABLE' | 'SKEPTICAL' | 'OBSERVING' | 'IMPRESSED' | 'PROUD';
  lastEncounterDay: number;
}

export interface DynamicGameEvent {
  id: string;
  title: string;
  category: 'HR' | 'FINANCE' | 'PROJECT' | 'ROMANCE' | 'LEGAL' | 'MARKET';
  description: string;
  options: {
    text: string;
    actionKey: string;
    immediateEffectText: string;
  }[];
}

export interface DialogueNode {
  speaker: string;
  speakerTitle?: string;
  avatar: string;
  text: string;
  choices?: {
    text: string;
    nextNodeId?: string;
    action?: () => void;
  }[];
  nextNodeId?: string;
}

export interface CinematicScene {
  id: string;
  title: string;
  lines: {
    speaker: string;
    text: string;
    mood?: string;
    cameraTarget?: Position2D;
    cameraZoom?: number;
    delayMs?: number;
  }[];
  onComplete?: () => void;
}

export interface EndingData {
  code: 'ENDING_01' | 'ENDING_02' | 'ENDING_03' | 'ENDING_04' | 'ENDING_05' | 'ENDING_06' | 'ENDING_07';
  title: string;
  subtitle: string;
  description: string;
  storyNarrative: string[];
  bannerColor: string;
  isVictory: boolean;
}

export interface GameSaveState {
  version: string;
  timestamp: number;
  saveSlot: number;
  gamePhase: GamePhase;
  
  // Thời gian
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  weather: WeatherType;
  
  // Công ty & Tài chính
  companyName: string;
  isRegistered: boolean;
  taxCode: string;
  playerStats: PlayerStats;
  currentOfficeId: string;
  furniture: FurnitureItem[];
  employees: EmployeeAIEntity[];
  activeProjects: ProjectContract[];
  completedProjectsCount: number;
  cashHistory: number[];
  financialStatements: FinancialRecord[];
  loans: LoanAccount[];
  
  // Quan hệ
  romance: RomanceProfile;
  father: FatherProfile;
  legal: LegalStatus;
  
  // Vị trí người chơi
  currentScene: 'CITY' | 'ROOM' | 'OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT';
  playerPos: Position2D;
  playerDir: CharacterDirection;
  
  // Nhập ký & Quyết định
  decisionLog: string[];
}
