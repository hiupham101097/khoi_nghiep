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
export type PersonalityType = 'AMBITIOUS' | 'HARDWORKING' | 'PRAGMATIC' | 'CREATIVE' | 'SOCIAL' | 'LAID_BACK';

export type EmployeeBehaviorState =
  | 'IDLE'
  | 'GOING_TO_WORK'
  | 'GOING_HOME'
  | 'WORKING'
  | 'BREAK'
  | 'TALKING'
  | 'MEETING'
  | 'LEARNING'
  | 'STRESSED'
  | 'SICK_LEAVE'
  | 'REQUESTING_RAISE'
  | 'JOB_SEARCHING'
  | 'RESIGNING'
  | 'PROTESTING';

export type MemoryType =
  | 'HIRED'
  | 'PROMISED_RAISE'
  | 'REWARDED_BONUS'
  | 'SALARY_RAISE'
  | 'PROMOTED'
  | 'CRUNCH_OVERTIME'
  | 'DISPUTE_PETITION'
  | 'REJECTED_RAISE'
  | 'RESOLVED_STRIKE'
  | 'UNFAIR_TREATMENT'
  | 'COLLEAGUE_BONDING'
  | 'STANDUP_PRAISE'
  | 'REFACTOR_DEBT';

export interface EmployeeMemoryItem {
  id: string;
  type: MemoryType;
  title: string;
  impactMorale: number; // Điểm tác động tinh thần (+15, -20)
  impactLoyalty: number; // Điểm tác động trung thành (+10, -15)
  timestamp: number;
  day: number;
}

export interface EmployeeSkillLevels {
  frontend: number;  // 0 - 100
  backend: number;   // 0 - 100
  design: number;    // 0 - 100
  testing: number;   // 0 - 100
  devops: number;    // 0 - 100
}

export interface EmployeeRelationshipItem {
  affinity: number;       // Mức độ thân thiện (-100 đến +100)
  trust: number;          // Mức độ tin tưởng (0 đến 100)
  lastInteractionDay: number;
}

export type TaskType =
  | 'IDLE'
  | 'CODING'
  | 'BUG_FIXING'
  | 'CODE_REVIEW'
  | 'UI_DESIGN'
  | 'TESTING'
  | 'DEPLOYING'
  | 'STANDUP'
  | 'LEARNING';

export interface EmployeeCurrentTask {
  projectId: string | null;
  taskType: TaskType;
  description: string;
  progress: number; // 0 - 100
  efficiencyMultiplier: number;
}

export interface EmployeeAIEntity {
  id: string;
  name: string;
  age: number;
  avatarSeed: number;
  gender: 'MALE' | 'FEMALE';
  role: EmployeeRole;
  level: SkillLevel;
  experienceYears: number;
  personality: PersonalityType;
  
  // Năng lực sản xuất & Kỹ năng chuyên sâu
  speed: number;          // Tốc độ hoàn thành công việc (10 - 100)
  quality: number;        // Chất lượng code/design (10 - 100)
  bugRate: number;        // Tỷ lệ sinh lỗi (0 - 50%)
  skillLevels: EmployeeSkillLevels;
  
  // Tài chính & Kỳ vọng
  salary: number;         // Lương thực nhận hiện tại (VNĐ/tháng)
  salaryExpectation: number; // Lương kỳ vọng
  currentSalary: number;  // Đồng bộ tương thích ngược
  expectedSalary: number; // Đồng bộ tương thích ngược
  
  // Tâm lý & Sinh hoạt
  health: number;         // Thể lực / Sức khỏe (0 - 100)
  energy: number;         // Năng lượng (0 - 100)
  morale: number;         // Tinh thần / Hạnh phúc (0 - 100)
  happiness: number;      // Đồng bộ tương thích ngược
  stress: number;         // Căng thẳng (0 - 100)
  frustration: number;    // Mức độ ức chế / bất mãn (0 - 100)
  resentment: number;     // Đồng bộ tương thích ngược
  loyalty: number;        // Độ trung thành (0 - 100)
  trustInCEO: number;     // Niềm tin vào CEO (0 - 100)
  ceoTrust: number;       // Đồng bộ tương thích ngược
  ambition: number;       // Tham vọng thăng tiến (0 - 100)
  
  // Trạng thái hoạt động & Hành vi AI 2.0
  behaviorState: EmployeeBehaviorState; // Trạng thái hành vi cấp cao
  currentState: CharacterAnimationState; // Trạng thái animation khung vẽ
  currentTask: EmployeeCurrentTask;      // Nhiệm vụ đang thực hiện
  deskIndex: number;      // Bàn làm việc được gán trong văn phòng (-1 nếu chưa có)
  assignedProjectId: string | null;
  currentPos?: Position2D; // Tọa độ X, Y thực tế đang đứng
  targetPos?: Position2D;  // Tọa độ X, Y đang hướng tới
  speechBubble?: string | null; // Lời nói hoặc suy nghĩ hiển thị trên đầu
  speechTimer?: number;    // Thời gian hiển thị bong bóng thoại (giây)
  walkFrame?: number;      // Frame bước đi Chibi
  
  // Quản lý nhân sự & Thử việc
  isProbation?: boolean;
  probationDaysLeft?: number;
  totalLinesOfCodeProduced?: number;
  totalBugsProduced?: number;
  totalBugsFixed?: number;

  // Hành vi khủng hoảng & AI 2.0 (Quan hệ xã hội, Mục tiêu cá nhân, Lịch sinh hoạt)
  isStriking: boolean;    // Đang đình công
  hasGivenNotice: boolean;// Đã nộp đơn nghỉ việc
  daysUntilQuit: number;  // Số ngày đếm ngược trước khi rời đi
  
  // AI 2.0 Mở rộng
  personalGoal?: {
    type: 'PROMOTION_LEAD' | 'SAVING_MONEY' | 'LEARN_NEW_TECH' | 'WORK_LIFE_BALANCE' | 'EARN_ESOP';
    title: string;
    progress: number; // 0 - 100
    targetValue?: number;
  };
  relationships: Record<string, EmployeeRelationshipItem>;
  colleagueRelations?: Record<string, number>; // Đồng bộ tương thích ngược
  dailyActivity?: 'COMMUTING' | 'DAILY_STANDUP' | 'DEEP_WORK' | 'COFFEE_BREAK' | 'LUNCH_BONDING' | 'AFTERNOON_SPRINT' | 'OVERTIME' | 'GOING_HOME' | 'ON_STRIKE';

  // Bộ nhớ sự kiện chuyên sâu (Memory System)
  memories: EmployeeMemoryItem[];
  memoryLog: string[]; // Đồng bộ tương thích ngược
}

export type RecruitmentTier = 'STANDARD' | 'SPONSORED_TOPCV' | 'HEADHUNTER_EXECUTIVE';

export interface CandidateEntity extends Omit<EmployeeAIEntity, 'currentSalary' | 'deskIndex' | 'assignedProjectId' | 'isStriking' | 'hasGivenNotice' | 'daysUntilQuit' | 'currentState'> {
  bio: string;
  recruitmentTier?: RecruitmentTier;
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
  taskScope?: {
    frontendUnits: number;
    frontendDone: number;
    backendUnits: number;
    backendDone: number;
    designUnits: number;
    designDone: number;
    testingUnits: number;
    testingDone: number;
  };
  accountsReceivable?: number; // Công nợ phải thu (70% giá trị hợp đồng khi bàn giao đạt chuẩn)
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

// ============================================================================
// 5 GIAI ĐOẠN PHÁT TRIỂN DOANH NGHIỆP & HỆ THỐNG MÔ PHỎNG 2.0
// ============================================================================
export type EnterpriseStageId =
  | 'STAGE_1_BOOTSTRAP'      // Cá nhân khởi nghiệp
  | 'STAGE_2_STARTUP'        // Startup nhỏ
  | 'STAGE_3_SCALING'        // Công ty đang phát triển
  | 'STAGE_4_ENTERPRISE'     // Doanh nghiệp quy mô vừa
  | 'STAGE_5_CONGLOMERATE';  // Tập đoàn công nghệ

export interface EnterpriseStage {
  id: EnterpriseStageId;
  level: number;
  name: string;
  title: string;
  tagline: string;
  requiredValuation: number;
  requiredCompletedProjects: number;
  requiredHeadcount: number;
  unlockedPerks: string[];
}

export type SprintStrategy = 'QUALITY_FIRST' | 'BALANCED' | 'CRUNCH_SPEED' | 'REFACTOR_DEBT';

export interface CollectivePetition {
  id: string;
  message: string;
  salaryIncreaseDemandPercent: number;
  stopOvertimeDemand: boolean;
  signingEmployees: string[];
  daysRemaining: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
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
  
  // Công ty & Doanh nghiệp 2.0
  companyName: string;
  isRegistered: boolean;
  taxCode: string;
  enterpriseStage: EnterpriseStageId;
  sprintStrategy: SprintStrategy;
  activePetition: CollectivePetition | null;
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
  currentScene: 'CITY' | 'ROOM' | 'OFFICE' | 'CEO_OFFICE' | 'VILLA' | 'CAFE' | 'BANK' | 'COURT';
  playerPos: Position2D;
  playerDir: CharacterDirection;
  
  // Nhập ký & Quyết định
  decisionLog: string[];
}
