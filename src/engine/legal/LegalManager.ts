// ============================================================================
// CEO EMPIRE: LEGAL & COMPLIANCE SYSTEM (Thanh tra, Tố tụng, Xét xử, Bản án)
// ============================================================================

import { LegalStatus } from '../../types';
import { soundManager } from '../core/SoundManager';

export type LegalStage = 
  | 'COMPLIANT'               // Tuân thủ tốt
  | 'COMPLAINT_FILED'         // Có đơn khiếu nại / tố cáo
  | 'ADMINISTRATIVE_INSPECT'  // Đang thanh tra đột xuất
  | 'PENALTY_ISSUED'          // Bị xử phạt vi phạm hành chính
  | 'CRIMINAL_INVESTIGATION'  // Đang bị khởi tố điều tra hình sự
  | 'PROSECUTED'              // Viện kiểm sát truy tố
  | 'TRIAL'                   // Đang xét xử tại Tòa án
  | 'CONVICTED';              // Bản án có hiệu lực, thi hành án tù

export class LegalManager {
  public static initialLegalStatus(): LegalStatus {
    return {
      taxComplianceRating: 95,
      laborComplianceRating: 90,
      contractDisputesCount: 0,
      inspectionsPending: false,
      isUnderCriminalInvestigation: false,
      chargesFiled: false,
      sentencedToPrison: false,
      prisonSentenceYears: 0,
      historyLog: ['Thành lập doanh nghiệp hợp pháp, tuân thủ pháp luật Việt Nam.']
    };
  }

  // Khách hàng khiếu nại do hợp đồng quá hạn hoặc chất lượng kém
  public static fileContractDispute(legal: LegalStatus, clientName: string, projectName: string) {
    legal.contractDisputesCount += 1;
    legal.taxComplianceRating = Math.max(0, legal.taxComplianceRating - 5);
    legal.historyLog.push(`Khách hàng ${clientName} đệ đơn khiếu nại vi phạm tiến độ dự án "${projectName}".`);
    soundManager.playAlert();
  }

  // Cơ quan Thuế thanh tra đột xuất nếu trốn thuế hoặc mua bán hóa đơn
  public static triggerTaxInspection(legal: LegalStatus): { fineAmount: number; isSevere: boolean } {
    legal.inspectionsPending = true;
    soundManager.playDramaticChord();

    // Nếu chỉ số tuân thủ thuế dưới 40%, chuyển sang điều tra hình sự
    if (legal.taxComplianceRating < 40) {
      legal.isUnderCriminalInvestigation = true;
      legal.historyLog.push('Cục Thuế phát hiện dấu hiệu trốn thuế nghiêm trọng và chuyển hồ sơ sang Cơ quan Điều tra!');
      return { fineAmount: 150000000, isSevere: true };
    } else {
      legal.historyLog.push('Đoàn thanh tra Thuế ra quyết định xử phạt vi phạm hành chính.');
      return { fineAmount: 35000000, isSevere: false };
    }
  }

  // Nộp tiền phạt hành chính để khôi phục chỉ số
  public static payFine(legal: LegalStatus, fineAmount: number): boolean {
    legal.inspectionsPending = false;
    legal.taxComplianceRating = Math.min(85, legal.taxComplianceRating + 25);
    legal.historyLog.push(`Đã nộp phạt hành chính ${(fineAmount).toLocaleString('vi-VN')} VNĐ vào Kho bạc Nhà nước.`);
    return true;
  }

  // Phiên tòa xét xử hình sự (Tòa án tuyên án)
  public static conductCriminalTrial(legal: LegalStatus): { prisonYears: number } {
    legal.chargesFiled = true;
    legal.sentencedToPrison = true;
    legal.prisonSentenceYears = 5; // Bản án 5 năm tù giam
    legal.historyLog.push('Hội đồng xét xử Tòa án Nhân dân tuyên phạt 5 năm tù giam về tội Vi phạm quy định kinh doanh & Trốn thuế.');
    soundManager.playDramaticChord();
    return { prisonYears: 5 };
  }
}
