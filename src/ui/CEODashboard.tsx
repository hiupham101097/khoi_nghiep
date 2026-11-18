// ============================================================================
// CEO EMPIRE: CEO ENTERPRISE SUITE (DASHBOARD QUẢN TRỊ DOANH NGHIỆP TỔNG HỢP)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import {
  Users,
  TrendingUp,
  TrendingDown,
  FolderGit2,
  Building2,
  Scale,
  Heart,
  X,
  Award,
  AlertTriangle,
  Gift,
  Coffee,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { AVAILABLE_OFFICES, ENTERPRISE_STAGES } from '../engine/economy/CompanyManager';
import { EconomyManager } from '../engine/economy/EconomyManager';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { soundManager } from '../engine/core/SoundManager';
import { RelationshipManager } from '../engine/narrative/RelationshipManager';
import { SprintStrategy, SkillLevel } from '../types';

interface CEODashboardProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const CEODashboard: React.FC<CEODashboardProps> = ({ gsm, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HR' | 'FINANCE' | 'PROJECTS' | 'OFFICE' | 'LEGAL'>(
    gsm.openDashboardTab || 'OVERVIEW'
  );

  const valuation = EconomyManager.calculateCompanyValuation(
    gsm.cashHistory.slice(-6),
    gsm.employees.length,
    gsm.playerStats.reputation,
    gsm.completedProjectsCount
  );

  const monthlyPayroll = EconomyManager.calculateMonthlyPayroll(gsm.employees);
  const totalAccountsReceivable = gsm.activeProjects.reduce(
    (sum, p) => sum + (p.accountsReceivable ?? Math.floor(p.contractValue * 0.7)),
    0
  );
  const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === gsm.currentOfficeId) || AVAILABLE_OFFICES[0];
  const monthlyBurnRate = EconomyManager.calculateMonthlyBurnRate(
    gsm.employees,
    currentOffice,
    gsm.furniture,
    gsm.loans
  );
  const runwayMonths = EconomyManager.calculateRunwayMonths(gsm.playerStats.cash, monthlyBurnRate);
  const stageData = ENTERPRISE_STAGES[gsm.enterpriseStage];
  const allStages = Object.values(ENTERPRISE_STAGES);
  const nextStage = allStages.find((s) => s.level === stageData.level + 1) || null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Dashboard */}
        <div className="bg-slate-800/95 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shrink-0">
                CEO
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="truncate max-w-[160px] sm:max-w-xs">{gsm.companyName}</span>
                  <span className="text-[10px] sm:text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                    MST: {gsm.taxCode}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">Hệ thống Quản trị & Điều hành Doanh nghiệp Công nghệ</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 transition cursor-pointer shrink-0"
              title="Đóng bảng điều khiển"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation (Responsive Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full scrollbar-none shrink-0">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'OVERVIEW' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Tổng Quan</span>
            </button>

            <button
              onClick={() => setActiveTab('HR')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'HR' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Nhân Sự ({gsm.employees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'PROJECTS' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
              <span>Dự Án ({gsm.activeProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FINANCE')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'FINANCE' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Tài Chính</span>
            </button>

            <button
              onClick={() => setActiveTab('OFFICE')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'OFFICE' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Văn Phòng</span>
            </button>

            <button
              onClick={() => setActiveTab('LEGAL')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'LEGAL' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span>Pháp Lý & Lan Anh</span>
            </button>
          </div>

          {/* Desktop close button */}
          <button
            onClick={onClose}
            className="hidden lg:flex text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Đóng bảng điều khiển"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung từng Tab */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto text-slate-200 space-y-6">
          
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 sm:p-4 rounded-xl shadow">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block truncate">Định Giá Doanh Nghiệp</span>
                  <p className="text-lg sm:text-xl font-black text-amber-400 mt-1 font-mono truncate">
                    {valuation.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400">đ</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block truncate">Hệ số P/E & Uy tín</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 sm:p-4 rounded-xl shadow">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block truncate">Tiền Mặt Khả Dụng</span>
                  <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1 font-mono truncate">
                    {gsm.playerStats.cash.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400">đ</span>
                  </p>
                  <span className="text-[10px] text-emerald-400 block truncate">Khả năng thanh toán</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 sm:p-4 rounded-xl shadow">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block truncate">Công Nợ Phải Thu</span>
                  <p className="text-lg sm:text-xl font-black text-sky-400 mt-1 font-mono truncate">
                    {totalAccountsReceivable.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400">đ</span>
                  </p>
                  <span className="text-[10px] text-sky-300 block truncate">70% nghiệm thu dự án</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 sm:p-4 rounded-xl shadow">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block truncate">Quỹ Lương Hàng Tháng</span>
                  <p className="text-lg sm:text-xl font-black text-rose-400 mt-1 font-mono truncate">
                    {monthlyPayroll.toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400">đ</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block truncate">Tổng {gsm.employees.length} nhân sự</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 sm:p-4 rounded-xl shadow col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block truncate">Hợp Đồng Hoàn Thành</span>
                  <p className="text-lg sm:text-xl font-black text-indigo-400 mt-1 font-mono truncate">
                    {gsm.completedProjectsCount} <span className="text-[10px] text-slate-400">dự án</span>
                  </p>
                  <span className="text-[10px] text-indigo-300 block truncate">Uy tín: {gsm.playerStats.reputation}/100</span>
                </div>
              </div>

              {/* LỘ TRÌNH 5 GIAI ĐOẠN PHÁT TRIỂN DOANH NGHIỆP */}
              <div className="bg-slate-800/80 border border-indigo-500/40 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-300 font-black text-lg">
                      {stageData.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Giai Đoạn Hiện Tại:</span>
                        <h3 className="text-base font-extrabold text-slate-100">{stageData.name} ({stageData.title})</h3>
                      </div>
                      <p className="text-xs text-slate-300 italic">{stageData.tagline}</p>
                    </div>
                  </div>

                  {nextStage ? (
                    <span className="text-xs bg-indigo-950 border border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-full font-semibold">
                      Mục tiêu kế tiếp: Cấp {nextStage.level} - {nextStage.name}
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-950 border border-emerald-500 text-emerald-300 px-3 py-1 rounded-full font-bold">
                      🏆 ĐÃ ĐẠT CẤP ĐỘ CAO NHẤT (KỲ LÂN CÔNG NGHỆ)
                    </span>
                  )}
                </div>

                {/* Các đặc quyền đã mở khóa */}
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Đặc Quyền Đã Kích Hoạt Trong Giai Đoạn Này:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                    {stageData.unlockedPerks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Thanh tiến độ lên cấp tiếp theo nếu có */}
                {nextStage && (
                  <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl space-y-3">
                    <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Điều Kiện Thăng Cấp Lên Cấp {nextStage.level}: {nextStage.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Định giá:</span>
                          <span className="font-mono">{Math.round((valuation / nextStage.requiredValuation) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (valuation / nextStage.requiredValuation) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{valuation.toLocaleString('vi-VN')} / {nextStage.requiredValuation.toLocaleString('vi-VN')} đ</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Dự án xong:</span>
                          <span className="font-mono">{gsm.completedProjectsCount} / {nextStage.requiredCompletedProjects}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-sky-400 h-full" style={{ width: `${Math.min(100, (gsm.completedProjectsCount / nextStage.requiredCompletedProjects) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Quy mô nhân sự:</span>
                          <span className="font-mono">{gsm.employees.length} / {nextStage.requiredHeadcount} người</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-400 h-full" style={{ width: `${Math.min(100, (gsm.employees.length / nextStage.requiredHeadcount) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tình trạng văn phòng & Lời khuyên chiến lược */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl space-y-3">
                  <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Văn Phòng Hiện Tại: {currentOffice.name}
                  </h3>
                  <p className="text-xs text-slate-300">{currentOffice.address}</p>
                  <div className="flex items-center justify-between text-xs border-t border-slate-700/60 pt-3">
                    <span className="text-slate-400">Tiền thuê:</span>
                    <span className="font-semibold text-amber-400">{currentOffice.monthlyRent.toLocaleString('vi-VN')} VNĐ/tháng</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sức chứa bàn làm việc:</span>
                    <span className="font-semibold">{gsm.employees.length} / {currentOffice.maxDesks} chỗ</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl space-y-3">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Nhật Ký Quyết Định Chiến Lược
                  </h3>
                  <div className="h-32 overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2">
                    {gsm.decisionLog.length > 0 ? (
                      gsm.decisionLog.map((log, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                          {log}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">Chưa có quyết định lớn nào được ghi nhận.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHÂN SỰ & AI NPCS */}
          {activeTab === 'HR' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Đội Ngũ Nhân Sự Công Nghệ ({gsm.employees.length})</h3>
                  <p className="text-xs text-slate-400">Tâm lý, chỉ số sức khỏe, mức độ trung thành và đóng góp công việc của từng AI NPC</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Bật/Tắt chế độ OT */}
                  <button
                    onClick={() => {
                      gsm.isOvertimeActive = !gsm.isOvertimeActive;
                      soundManager.playClick();
                      gsm.notify();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      gsm.isOvertimeActive 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{gsm.isOvertimeActive ? 'Đang Ép Tăng Ca (OT)' : 'Bật Tăng Ca (OT)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      gsm.isRecruitModalOpen = true;
                      soundManager.playClick();
                      gsm.notify();
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Tuyển Thêm Nhân Sự</span>
                  </button>
                </div>
              </div>

              {gsm.employees.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/40 border border-slate-700 rounded-xl space-y-3">
                  <Users className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-slate-400 font-semibold text-sm">Chưa có nhân viên nào được tuyển dụng.</p>
                  <button
                    onClick={() => {
                      gsm.isRecruitModalOpen = true;
                      soundManager.playClick();
                      gsm.notify();
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer"
                  >
                    Mở Sàn Tuyển Dụng Ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gsm.employees.map((emp) => {
                    EmployeeAIEngine.initAI2Fields(emp);
                    return (
                      <div
                        key={emp.id}
                        className={`p-4 rounded-xl border transition ${
                          emp.isStriking
                            ? 'bg-rose-950/40 border-rose-500'
                            : emp.hasGivenNotice
                            ? 'bg-amber-950/40 border-amber-500'
                            : emp.behaviorState === 'REQUESTING_RAISE'
                            ? 'bg-amber-950/30 border-amber-500/80'
                            : 'bg-slate-800/70 border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-sky-400 flex items-center justify-center text-xl shrink-0">
                              {emp.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                                <span>{emp.name} ({emp.age || 24}t)</span>
                                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-1.5 py-0.5 rounded font-mono">
                                  {emp.role} • {emp.level}
                                </span>
                                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/40 px-1.5 py-0.5 rounded font-mono">
                                  {emp.personality}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-300 font-mono mt-0.5">
                                Lương: <strong className="text-emerald-400">{emp.salary.toLocaleString('vi-VN')} đ</strong>
                                <span className="text-[10px] text-slate-400 ml-1.5">(Kỳ vọng: {emp.salaryExpectation.toLocaleString('vi-VN')} đ)</span>
                              </p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                <span>{emp.currentTask?.description || 'Đang thực hiện công việc'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Tag */}
                          {emp.isStriking ? (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-600 flex items-center gap-1 animate-pulse shrink-0">
                              <AlertTriangle className="w-3 h-3" /> ĐÌNH CÔNG
                            </span>
                          ) : emp.hasGivenNotice ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-600 shrink-0">
                              Nghỉ việc ({Math.ceil(emp.daysUntilQuit)}d)
                            </span>
                          ) : emp.behaviorState === 'REQUESTING_RAISE' ? (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500 animate-pulse shrink-0">
                              Xin Gặp CEO
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40 shrink-0">
                              {emp.behaviorState}
                            </span>
                          )}
                        </div>

                        {/* Các thanh chỉ số tâm lý */}
                        <div className="grid grid-cols-2 gap-3 mt-3.5 text-[11px]">
                          <div>
                            <div className="flex justify-between text-slate-400 mb-1">
                              <span>Năng lượng</span>
                              <span className="text-amber-300 font-mono">{Math.round(emp.energy)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-400 h-full" style={{ width: `${emp.energy}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-1">
                              <span>Bức xúc (Frustration)</span>
                              <span className="text-rose-400 font-mono">{Math.round(emp.frustration)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full" style={{ width: `${emp.frustration}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-1">
                              <span>Tinh thần (Morale)</span>
                              <span className="text-emerald-400 font-mono">{Math.round(emp.morale)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${emp.morale}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-1">
                              <span>Niềm tin CEO</span>
                              <span className="text-sky-300 font-mono">{Math.round(emp.trustInCEO)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-sky-400 h-full" style={{ width: `${emp.trustInCEO}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Hành động của CEO với nhân sự */}
                        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-700/60 flex-wrap">
                          <button
                            onClick={() => {
                              gsm.selectedEmployeeFor1on1 = emp;
                              gsm.openDashboardTab = null;
                              soundManager.playClick();
                              gsm.notify();
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                          >
                            Hồ Sơ & 1-1
                          </button>

                          <button
                            onClick={() => {
                              if (gsm.playerStats.cash < 2000000) {
                                alert('Không đủ tiền mặt để thưởng nóng (Cần 2 triệu VNĐ)!');
                                return;
                              }
                              gsm.playerStats.cash -= 2000000;
                              EmployeeAIEngine.rewardEmployee(emp, 2000000, gsm.timeManager.day);
                              gsm.notify();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                          >
                            Thưởng 2Tr
                          </button>

                          <button
                            onClick={() => {
                              const newSalary = emp.salary + 3000000;
                              EmployeeAIEngine.raiseSalary(emp, newSalary, gsm.timeManager.day);
                              soundManager.playSuccess();
                              gsm.notify();
                            }}
                            className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                          >
                            Tăng Lương +3Tr
                          </button>

                          <button
                            onClick={() => {
                              const levelHierarchy: SkillLevel[] = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
                              const cur = levelHierarchy.indexOf(emp.level);
                              if (cur < levelHierarchy.length - 1) {
                                EmployeeAIEngine.promoteEmployee(emp, levelHierarchy[cur + 1], gsm.timeManager.day);
                                gsm.decisionLog.push(`Bổ nhiệm thăng chức cho ${emp.name} lên ${levelHierarchy[cur + 1]}!`);
                                gsm.notify();
                              } else {
                                alert(`${emp.name} đã ở bậc LEAD cao nhất!`);
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                          >
                            Thăng Chức
                          </button>

                          {emp.isStriking && (
                            <button
                              onClick={() => {
                                EmployeeAIEngine.resolveStrikeNegotiation(emp, true, gsm.timeManager.day);
                                soundManager.playSuccess();
                                gsm.notify();
                              }}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                            >
                              Hòa Giải Đình Công
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DỰ ÁN & HỢP ĐỒNG */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Các Dự Án Công Nghệ Đang Triển Khai</h3>
                  <p className="text-xs text-slate-400">Theo dõi tiến độ Sprint, số lỗi phần mềm và phân công nhân lực</p>
                </div>

                <button
                  onClick={() => {
                    gsm.isProjectTenderOpen = true;
                    soundManager.playClick();
                    gsm.notify();
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Săn Dự Án Mới</span>
                </button>
              </div>

              {/* CHIẾN LƯỢC SPRINT (Agile Sprint Strategies) */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chiến Lược Điều Hành Sprint Của CEO</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Tác động trực tiếp đến vận tốc bàn giao, tỷ lệ phát sinh lỗi và công tác refactor</p>
                  </div>
                  <span className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-sky-300 font-bold font-mono">
                    Đang chọn: {gsm.sprintStrategy}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'QUALITY_FIRST' as SprintStrategy,
                      name: 'Chất Lượng Tối Đa',
                      speed: '85% tốc độ',
                      bug: '-60% lỗi',
                      fix: 'Tự động sửa lỗi hàng ngày',
                      border: 'border-emerald-500/50',
                      bg: 'bg-emerald-950/40',
                      color: 'text-emerald-300'
                    },
                    {
                      id: 'BALANCED' as SprintStrategy,
                      name: 'Cân Bằng Tiêu Chuẩn',
                      speed: '100% tốc độ',
                      bug: 'Bình thường',
                      fix: 'Cân đối tiến độ & chất lượng',
                      border: 'border-sky-500/50',
                      bg: 'bg-sky-950/40',
                      color: 'text-sky-300'
                    },
                    {
                      id: 'CRUNCH_SPEED' as SprintStrategy,
                      name: 'Tăng Tốc Crunch',
                      speed: '+60% tốc độ',
                      bug: '+100% lỗi',
                      fix: 'Chạy nước rút cứu deadline',
                      border: 'border-rose-500/50',
                      bg: 'bg-rose-950/40',
                      color: 'text-rose-300'
                    },
                    {
                      id: 'REFACTOR_DEBT' as SprintStrategy,
                      name: 'Dọn Nợ Kỹ Thuật',
                      speed: '35% tốc độ',
                      bug: 'Không sinh lỗi',
                      fix: 'Fix triệt để -3 bug/ngày',
                      border: 'border-amber-500/50',
                      bg: 'bg-amber-950/40',
                      color: 'text-amber-300'
                    }
                  ].map((strat) => {
                    const isSelected = gsm.sprintStrategy === strat.id;
                    return (
                      <button
                        key={strat.id}
                        onClick={() => {
                          gsm.sprintStrategy = strat.id;
                          soundManager.playClick();
                          gsm.notify();
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? `${strat.bg} ${strat.border} ring-2 ring-sky-400 shadow-md`
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${strat.color}`}>{strat.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                          </div>
                          <div className="text-[11px] text-slate-300 font-mono">{strat.speed} | {strat.bug}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">{strat.fix}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {gsm.activeProjects.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/40 border border-slate-700 rounded-xl space-y-3">
                  <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-slate-400 font-semibold text-sm">Chưa có hợp đồng nào đang chạy.</p>
                  <button
                    onClick={() => {
                      gsm.isProjectTenderOpen = true;
                      soundManager.playClick();
                      gsm.notify();
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer"
                  >
                    Xem Bảng Chào Thầu Dự Án
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {gsm.activeProjects.map((proj) => {
                    const percent = Math.min(100, Math.round((proj.completedWorkUnits / proj.totalWorkUnits) * 100));
                    return (
                      <div key={proj.id} className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                              <span>{proj.clientLogo}</span>
                              <span>{proj.name}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                                {(proj.contractValue).toLocaleString('vi-VN')} đ
                              </span>
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              Còn {proj.daysRemaining} ngày
                            </span>
                            <p className="text-[10px] text-slate-400">Phạt trễ: {proj.penaltyPerDay.toLocaleString('vi-VN')} đ/ngày</p>
                          </div>
                        </div>

                        {/* Tiến độ Sprint & Phân rã khối lượng công việc (Task Scope) */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Tiến độ Sprint: <strong className="text-sky-400 font-mono">{percent}%</strong> (Công nợ bàn giao: {(proj.contractValue * 0.7).toLocaleString('vi-VN')} đ)</span>
                            <span className="text-rose-400 font-semibold font-mono">Bug tồn đọng: {proj.currentBugs}</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>

                          {proj.taskScope && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Frontend:</span>
                                <span className="text-sky-300 font-bold">{Math.round(proj.taskScope.frontendDone)} / {proj.taskScope.frontendUnits}</span>
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Backend:</span>
                                <span className="text-emerald-300 font-bold">{Math.round(proj.taskScope.backendDone)} / {proj.taskScope.backendUnits}</span>
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 text-[10px] block">UI/UX Design:</span>
                                <span className="text-pink-300 font-bold">{Math.round(proj.taskScope.designDone)} / {proj.taskScope.designUnits}</span>
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 text-[10px] block">Testing & QA:</span>
                                <span className="text-amber-300 font-bold">{Math.round(proj.taskScope.testingDone)} / {proj.taskScope.testingUnits}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phân công nhân sự */}
                        <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Nhân sự tham gia dự án:</span>
                          <div className="flex flex-wrap gap-2">
                            {gsm.employees.map((emp) => {
                              const isAssigned = proj.assignedEmployeeIds.includes(emp.id);
                              return (
                                <button
                                  key={emp.id}
                                  onClick={() => {
                                    if (isAssigned) {
                                      proj.assignedEmployeeIds = proj.assignedEmployeeIds.filter((id) => id !== emp.id);
                                    } else {
                                      proj.assignedEmployeeIds.push(emp.id);
                                    }
                                    soundManager.playClick();
                                    gsm.notify();
                                  }}
                                  className={`text-[11px] px-2 py-0.5 rounded font-medium border transition cursor-pointer ${
                                    isAssigned
                                      ? 'bg-sky-600 text-white border-sky-400'
                                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                                  }`}
                                >
                                  {emp.name} ({emp.role})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TÀI CHÍNH & VAY VỐN */}
          {activeTab === 'FINANCE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block truncate">Dòng Tiền Khả Dụng</span>
                  <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-1 truncate">
                    {gsm.playerStats.cash.toLocaleString('vi-VN')} đ
                  </p>
                  <span className="text-[10px] text-slate-400">Tiền mặt trong tài khoản</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block truncate">Công Nợ Phải Thu</span>
                  <p className="text-lg sm:text-xl font-black text-sky-400 font-mono mt-1 truncate">
                    {totalAccountsReceivable.toLocaleString('vi-VN')} đ
                  </p>
                  <span className="text-[10px] text-slate-400">70% nghiệm thu dự án</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block truncate">Doanh Thu Tháng Này</span>
                  <p className="text-lg sm:text-xl font-black text-indigo-400 font-mono mt-1 truncate">
                    {gsm.monthlyRevenueAccumulated.toLocaleString('vi-VN')} đ
                  </p>
                  <span className="text-[10px] text-slate-400">Doanh thu chốt ngày 30</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block truncate">Dư Nợ Ngân Hàng</span>
                  <p className="text-lg sm:text-xl font-black text-amber-400 font-mono mt-1 truncate">
                    {gsm.loans.reduce((sum, l) => sum + l.principal, 0).toLocaleString('vi-VN')} đ
                  </p>
                  <span className="text-[10px] text-slate-400">Gốc vay trả góp V-Bank</span>
                </div>
              </div>

              {/* PHÂN TÍCH BURN RATE VÀ RUNWAY TỒN TẠI */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>Chỉ Số Sống Còn: Burn Rate & Runway</span>
                  </h4>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    runwayMonths > 6
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : runwayMonths >= 3
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                  }`}>
                    {runwayMonths > 6 ? 'Dòng tiền An Toàn' : runwayMonths >= 3 ? 'Cần Thận Trọng' : 'Báo Động Phá Sản'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Quỹ Lương Nhân Sự:</span>
                    <p className="font-mono font-bold text-rose-400 text-sm mt-1">{monthlyPayroll.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Tiền Thuê Mặt Bằng:</span>
                    <p className="font-mono font-bold text-slate-200 text-sm mt-1">{currentOffice.monthlyRent.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Tổng Burn Rate / Tháng:</span>
                    <p className="font-mono font-black text-rose-400 text-sm mt-1">-{monthlyBurnRate.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Số Tháng Tồn Tại (Runway):</span>
                    <p className="font-mono font-black text-amber-400 text-sm mt-1">{runwayMonths > 99 ? 'Không giới hạn' : `${runwayMonths} tháng`}</p>
                  </div>
                </div>
              </div>

              {/* Lịch sử báo cáo tài chính P&L các tháng trước */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 text-sm">Báo Cáo Kết Quả Kinh Doanh (P&L)</h4>
                {gsm.financialStatements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa kết thúc tháng đầu tiên. Báo cáo tài chính sẽ được chốt vào ngày 30.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="min-w-[580px] w-full text-left text-xs">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="p-2 border-b border-slate-700">Kỳ</th>
                          <th className="p-2 border-b border-slate-700">Doanh Thu</th>
                          <th className="p-2 border-b border-slate-700">Quỹ Lương</th>
                          <th className="p-2 border-b border-slate-700">Tiền Thuê</th>
                          <th className="p-2 border-b border-slate-700">Thuế TNDN (20%)</th>
                          <th className="p-2 border-b border-slate-700">Lợi Nhuận Ròng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gsm.financialStatements.map((rec, i) => (
                          <tr key={i} className="border-b border-slate-800">
                            <td className="p-2 font-mono">Th.{rec.month}/N{rec.year}</td>
                            <td className="p-2 text-emerald-400 font-mono">{rec.revenue.toLocaleString('vi-VN')} đ</td>
                            <td className="p-2 text-rose-400 font-mono">{rec.payroll.toLocaleString('vi-VN')} đ</td>
                            <td className="p-2 font-mono">{rec.officeRent.toLocaleString('vi-VN')} đ</td>
                            <td className="p-2 font-mono">{rec.taxPaid.toLocaleString('vi-VN')} đ</td>
                            <td className={`p-2 font-bold font-mono ${rec.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {rec.netProfit.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: VĂN PHÒNG & NỘI THẤT */}
          {activeTab === 'OFFICE' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Các Gói Văn Phòng Khởi Nghiệp</h3>
                <p className="text-xs text-slate-400">Chọn thuê địa điểm phù hợp với quy mô nhân sự và uy tín thương hiệu</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {AVAILABLE_OFFICES.map((off) => {
                  const isCurrent = gsm.currentOfficeId === off.id;
                  return (
                    <div
                      key={off.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isCurrent ? 'bg-sky-950/40 border-sky-500' : 'bg-slate-800/70 border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-100">{off.name}</h4>
                          {isCurrent && <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded font-bold">Đang Thuê</span>}
                        </div>
                        <p className="text-xs text-slate-400">{off.description}</p>
                        <p className="text-xs text-amber-400 font-mono font-bold">
                          Thuê: {off.monthlyRent.toLocaleString('vi-VN')} đ/tháng
                        </p>
                        <p className="text-[11px] text-slate-300">Sức chứa tối đa: {off.maxDesks} bàn làm việc</p>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            if (gsm.playerStats.cash < off.deposit) {
                              alert(`Không đủ tiền đặt cọc văn phòng (Cần ${off.deposit.toLocaleString('vi-VN')} VNĐ)!`);
                              return;
                            }
                            gsm.playerStats.cash -= off.deposit;
                            gsm.currentOfficeId = off.id;
                            soundManager.playSuccess();
                            gsm.notify();
                          }}
                          className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2 rounded-lg transition cursor-pointer"
                        >
                          Thuê Văn Phòng Này
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Danh mục trang thiết bị văn phòng */}
              <div className="space-y-3 pt-4 border-t border-slate-700/80">
                <h4 className="font-bold text-slate-100 text-sm">Trang Thiết Bị & Tiện Nghi Văn Phòng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gsm.furniture.map((item) => (
                    <div key={item.id} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-100">{item.name}</h5>
                        <p className="text-xs text-emerald-400 font-mono font-semibold">
                          Giá mua: {item.cost.toLocaleString('vi-VN')} đ
                        </p>
                        <span className="text-[10px] text-slate-400">Bảo trì: {item.monthlyMaintenance.toLocaleString('vi-VN')} đ/tháng</span>
                      </div>

                      {item.purchased ? (
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-600/40 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã Trang Bị
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (gsm.playerStats.cash < item.cost) {
                              alert(`Không đủ tiền mua trang thiết bị (Cần ${item.cost.toLocaleString('vi-VN')} VNĐ)!`);
                              return;
                            }
                            gsm.playerStats.cash -= item.cost;
                            item.purchased = true;
                            soundManager.playCashEarned();
                            gsm.notify();
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Mua Ngay
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PHÁP LÝ & LAN ANH */}
          {activeTab === 'LEGAL' && (
            <div className="space-y-6">
              {/* Tình cảm Lan Anh & Bố vợ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/70 border border-slate-700 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-pink-400 text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Mối Quan Hệ Tình Cảm: {gsm.romance.name}
                    </h3>
                    <span className="text-xs text-pink-300 font-bold bg-pink-950 px-2 py-0.5 rounded border border-pink-700">
                      Tâm trạng: {gsm.romance.currentMood}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Độ Yêu Thương (Affection)</span>
                        <span className="text-pink-400 font-mono font-bold">{Math.round(gsm.romance.affection)}/100</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full" style={{ width: `${gsm.romance.affection}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Niềm Tin (Trust)</span>
                        <span className="text-sky-300 font-mono font-bold">{Math.round(gsm.romance.trust)}/100</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full" style={{ width: `${gsm.romance.trust}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        gsm.dateWithLanAnh();
                      }}
                      className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Hẹn Hò Cafe (500K)</span>
                    </button>

                    <button
                      onClick={() => {
                        if (gsm.playerStats.cash < 1500000) {
                          alert('Không đủ tiền mua quà (Cần 1.5 triệu VNĐ)!');
                          return;
                        }
                        gsm.playerStats.cash -= 1500000;
                        RelationshipManager.sendGift(gsm.romance, 'Bó Hoa Hồng & Nước Hoa Cao Cấp', 1500000);
                        gsm.notify();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Tặng Quà (1.5Tr)</span>
                    </button>
                  </div>
                </div>

                {/* Bố Lan Anh (Ông Vinh) */}
                <div className="bg-slate-800/70 border border-slate-700 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Đánh Giá Của Bố Người Yêu: {gsm.father.name}
                    </h3>
                    <span className="text-xs text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
                      {gsm.father.evaluation}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Chủ tịch Tập đoàn Vinh Phát đang quan sát mức độ uy tín thương trường, tăng trưởng doanh thu và đạo đức kinh doanh của bạn.
                  </p>

                  <div className="text-xs">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Mức Độ Nể Phục</span>
                      <span className="text-amber-400 font-mono font-bold">{gsm.father.respect}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${gsm.father.respect}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pháp lý & Tuân thủ Luật Doanh Nghiệp */}
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-400" />
                  Tình Trạng Pháp Lý & Tuân Thủ Pháp Luật Việt Nam
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Điểm tuân thủ Thuế:</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">{gsm.legal.taxComplianceRating}/100</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Số vụ tranh chấp hợp đồng:</span>
                    <p className="text-base font-bold text-slate-200 font-mono">{gsm.legal.contractDisputesCount}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Nhật ký pháp lý:</p>
                  {gsm.legal.historyLog.map((log, i) => (
                    <div key={i} className="text-[11px] bg-slate-900/40 p-1.5 rounded">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
