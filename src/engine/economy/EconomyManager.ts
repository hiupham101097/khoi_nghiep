// ============================================================================
// CEO EMPIRE: ECONOMY & FINANCIAL SYSTEM (Kế toán dòng tiền, P&L, Thuế, Vay nợ, Định giá)
// ============================================================================

import { FinancialRecord, LoanAccount, EmployeeAIEntity, OfficeTier, FurnitureItem } from '../../types';

export class EconomyManager {
  // Tính tổng chi phí lương hàng tháng
  public static calculateMonthlyPayroll(employees: EmployeeAIEntity[]): number {
    return employees.reduce((sum, emp) => sum + emp.currentSalary, 0);
  }

  // Tính tổng chi phí bảo trì trang thiết bị
  public static calculateMonthlyMaintenance(furniture: FurnitureItem[]): number {
    return furniture
      .filter((f) => f.purchased)
      .reduce((sum, f) => sum + f.monthlyMaintenance, 0);
  }

  // Tính lãi vay và tiền gốc trả góp hàng tháng
  public static calculateMonthlyLoanPayments(loans: LoanAccount[]): number {
    return loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  }

  // Chốt sổ tài chính cuối mỗi tháng (Monthly Financial Settlement)
  public static processMonthlySettlement(
    currentCash: number,
    monthlyRevenue: number,
    employees: EmployeeAIEntity[],
    office: OfficeTier | null,
    furniture: FurnitureItem[],
    loans: LoanAccount[],
    month: number,
    year: number
  ): {
    newCash: number;
    financialRecord: FinancialRecord;
    isBankrupt: boolean;
    deficitAmount: number;
    updatedLoans: LoanAccount[];
  } {
    const payroll = this.calculateMonthlyPayroll(employees);
    const officeRent = office ? office.monthlyRent : 0;
    const maintenance = this.calculateMonthlyMaintenance(furniture);
    const utilitiesAndServers = office ? Math.floor(office.monthlyRent * 0.15) + 3000000 : 1500000;
    const loanPayment = this.calculateMonthlyLoanPayments(loans);

    const totalOpEx = payroll + officeRent + maintenance + utilitiesAndServers + loanPayment;
    const grossProfit = monthlyRevenue - Math.floor(monthlyRevenue * 0.05); // Trừ chi phí phát sinh nhỏ
    const profitBeforeTax = grossProfit - totalOpEx;

    // Thuế TNDN 20% nếu có lãi
    const taxRate = 0.2;
    const taxPaid = profitBeforeTax > 0 ? Math.floor(profitBeforeTax * taxRate) : 0;
    const netProfit = profitBeforeTax - taxPaid;

    const newCash = currentCash + monthlyRevenue - (totalOpEx + taxPaid);

    // Cập nhật các khoản vay
    const updatedLoans: LoanAccount[] = [];
    loans.forEach((loan) => {
      const remaining = loan.monthsRemaining - 1;
      if (remaining > 0) {
        updatedLoans.push({
          ...loan,
          monthsRemaining: remaining
        });
      }
    });

    const isBankrupt = newCash < -50000000; // Phá sản nếu nợ vượt quá 50 triệu và cạn dòng tiền
    const deficitAmount = newCash < 0 ? Math.abs(newCash) : 0;

    const financialRecord: FinancialRecord = {
      month,
      year,
      revenue: monthlyRevenue,
      costOfGoods: Math.floor(monthlyRevenue * 0.05),
      payroll,
      officeRent,
      utilitiesAndServers: utilitiesAndServers + maintenance,
      marketing: 0,
      taxPaid,
      netProfit,
      endingCash: newCash
    };

    return {
      newCash,
      financialRecord,
      isBankrupt,
      deficitAmount,
      updatedLoans
    };
  }

  // Định giá doanh nghiệp theo P/E & Doanh thu quy chuẩn công nghệ (Company Valuation)
  public static calculateCompanyValuation(
    last6MonthsRevenue: number[],
    employeesCount: number,
    reputation: number,
    completedProjects: number
  ): number {
    const avgMonthlyRevenue = last6MonthsRevenue.length > 0 
      ? last6MonthsRevenue.reduce((a, b) => a + b, 0) / last6MonthsRevenue.length 
      : 20000000;

    const annualizedRevenue = avgMonthlyRevenue * 12;
    // Hệ số ngành SaaS / Phần mềm: 3.5x - 8.0x doanh thu tùy theo uy tín và năng lực đội ngũ
    const multiplier = 3.5 + (reputation / 100) * 3.5 + (employeesCount > 5 ? 1.0 : 0.2);

    const baseValuation = annualizedRevenue * multiplier;
    const projectBonus = completedProjects * 50000000;

    return Math.floor(baseValuation + projectBonus);
  }

  // Tạo khoản vay mới từ ngân hàng
  public static takeLoan(
    bankName: string,
    principal: number,
    termMonths: number,
    annualRate: number = 0.12
  ): LoanAccount {
    const monthlyRate = annualRate / 12;
    // Công thức tính tiền trả đều hàng tháng (Amortization formula)
    const monthlyPayment = Math.floor(
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );

    return {
      id: `loan_${Date.now()}`,
      bankName,
      principal,
      interestRateAnnual: annualRate,
      termMonths,
      monthsRemaining: termMonths,
      monthlyPayment
    };
  }
}
