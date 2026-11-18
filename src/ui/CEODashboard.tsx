// ============================================================================
// CEO EMPIRE: CEO ENTERPRISE SUITE (DASHBOARD QUẢN TRỊ DOANH NGHIỆP TỔNG HỢP)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import {
  Users,
  TrendingUp,
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
import { AVAILABLE_OFFICES } from '../engine/economy/CompanyManager';
import { EconomyManager } from '../engine/economy/EconomyManager';
import { EmployeeAIEngine } from '../engine/ai/EmployeeAI';
import { soundManager } from '../engine/core/SoundManager';
import { RelationshipManager } from '../engine/narrative/RelationshipManager';

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
  const currentOffice = AVAILABLE_OFFICES.find((o) => o.id === gsm.currentOfficeId) || AVAILABLE_OFFICES[0];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Dashboard */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
              CEO
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{gsm.companyName}</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  MST: {gsm.taxCode}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Hệ thống Quản trị & Điều hành Doanh nghiệp Công nghệ</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'OVERVIEW' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tổng Quan</span>
            </button>

            <button
              onClick={() => setActiveTab('HR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'HR' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Nhân Sự ({gsm.employees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'PROJECTS' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Dự Án ({gsm.activeProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FINANCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'FINANCE' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tài Chính</span>
            </button>

            <button
              onClick={() => setActiveTab('OFFICE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'OFFICE' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Văn Phòng</span>
            </button>

            <button
              onClick={() => setActiveTab('LEGAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'LEGAL' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Pháp Lý & Lan Anh</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung từng Tab */}
        <div className="flex-1 p-6 overflow-y-auto text-slate-200 space-y-6">
          
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Định Giá Doanh Nghiệp</span>
                  <p className="text-2xl font-black text-amber-400 mt-1 font-mono">
                    {valuation.toLocaleString('vi-VN')} <span className="text-xs text-slate-400">VNĐ</span>
                  </p>
                  <span className="text-[11px] text-slate-400">Hệ số P/E & Uy tín công nghệ</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Tiền Mặt Khả Dụng</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    {gsm.playerStats.cash.toLocaleString('vi-VN')} <span className="text-xs text-slate-400">VNĐ</span>
                  </p>
                  <span className="text-[11px] text-emerald-400">Khả năng thanh toán cao</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Quỹ Lương Hàng Tháng</span>
                  <p className="text-2xl font-black text-rose-400 mt-1 font-mono">
                    {monthlyPayroll.toLocaleString('vi-VN')} <span className="text-xs text-slate-400">VNĐ</span>
                  </p>
                  <span className="text-[11px] text-slate-400">Tổng {gsm.employees.length} nhân sự</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shadow">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Dự Án Đã Hoàn Thành</span>
                  <p className="text-2xl font-black text-sky-400 mt-1 font-mono">
                    {gsm.completedProjectsCount} <span className="text-xs text-slate-400">hợp đồng</span>
                  </p>
                  <span className="text-[11px] text-sky-300">Uy tín: {gsm.playerStats.reputation}/100</span>
                </div>
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
                  {gsm.employees.map((emp) => (
                    <div
                      key={emp.id}
                      className={`p-4 rounded-xl border transition ${
                        emp.isStriking
                          ? 'bg-rose-950/40 border-rose-500'
                          : emp.hasGivenNotice
                          ? 'bg-amber-950/40 border-amber-500'
                          : 'bg-slate-800/70 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-sky-400 flex items-center justify-center text-xl">
                            {emp.gender === 'FEMALE' ? '👩‍💻' : '👨‍💻'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100 flex items-center gap-2">
                              {emp.name}
                              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-600/40 px-1.5 py-0.5 rounded font-mono">
                                {emp.role} • {emp.level}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-400 font-mono">
                              Lương: {emp.currentSalary.toLocaleString('vi-VN')} đ/tháng
                            </p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        {emp.isStriking ? (
                          <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-600 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> ĐÌNH CÔNG
                          </span>
                        ) : emp.hasGivenNotice ? (
                          <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-600">
                            Nghỉ việc ({Math.ceil(emp.daysUntilQuit)} ngày)
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                            {emp.currentState}
                          </span>
                        )}
                      </div>

                      {/* Các thanh chỉ số tâm lý */}
                      <div className="grid grid-cols-2 gap-3 mt-4 text-[11px]">
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
                            <span>Bất mãn (Resentment)</span>
                            <span className="text-rose-400 font-mono">{Math.round(emp.resentment)}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full" style={{ width: `${emp.resentment}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>Căng thẳng (Stress)</span>
                            <span className="text-purple-400 font-mono">{Math.round(emp.stress)}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${emp.stress}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>Niềm tin vào CEO</span>
                            <span className="text-sky-300 font-mono">{Math.round(emp.ceoTrust)}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sky-400 h-full" style={{ width: `${emp.ceoTrust}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Hành động của CEO với nhân sự */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
                        <button
                          onClick={() => {
                            if (gsm.playerStats.cash < 2000000) {
                              alert('Không đủ tiền mặt để thưởng nóng (Cần 2 triệu VNĐ)!');
                              return;
                            }
                            gsm.playerStats.cash -= 2000000;
                            EmployeeAIEngine.rewardEmployee(emp, 2000000);
                            gsm.notify();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                        >
                          Thưởng 2Tr
                        </button>

                        <button
                          onClick={() => {
                            const newSalary = emp.currentSalary + 3000000;
                            EmployeeAIEngine.raiseSalary(emp, newSalary);
                            soundManager.playSuccess();
                            gsm.notify();
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer"
                        >
                          Tăng Lương +3Tr
                        </button>

                        {emp.isStriking && (
                          <button
                            onClick={() => {
                              EmployeeAIEngine.resolveStrikeNegotiation(emp, true);
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
                  ))}
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

                        {/* Tiến độ Sprint */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Tiến độ hoàn thành Sprint: {percent}%</span>
                            <span className="text-rose-400 font-semibold font-mono">Số bug tồn đọng: {proj.currentBugs}</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Dòng Tiền Thực Tế</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {gsm.playerStats.cash.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Doanh Thu Tích Lũy Tháng Này</span>
                  <p className="text-xl font-black text-sky-400 font-mono mt-1">
                    {gsm.monthlyRevenueAccumulated.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Tổng Dư Nợ Ngân Hàng</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-1">
                    {gsm.loans.reduce((sum, l) => sum + l.principal, 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              {/* Lịch sử báo cáo tài chính P&L các tháng trước */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 text-sm">Báo Cáo Kết Quả Kinh Doanh (P&L)</h4>
                {gsm.financialStatements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa kết thúc tháng đầu tiên. Báo cáo tài chính sẽ được chốt vào ngày 30.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-700">
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
