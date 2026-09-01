export interface VendorScorecard {
  vendorId: string;
  vendorName: string;
  activeContractsCount: number;
  totalContractValueInr: number;
  complianceRatePercent: number;
  averageSlaRating: number; // 1.0 - 5.0
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expiringContractsCount: number;
}

export interface ContractExpiryAlert {
  contractId: string;
  contractNumber: string;
  vendorName: string;
  daysToExpiry: number;
  isExpired: boolean;
  valueInInr: number;
}

export class VendorContractEngine {
  static evaluateVendor(params: {
    vendorId: string;
    vendorName: string;
    contracts: Array<{ id: string; valueInInr: number; status: string; slaRating: number; endDate: Date }>;
    compliances: Array<{ id: string; status: string; isVerified: boolean }>;
    now?: Date;
  }): VendorScorecard {
    const now = params.now || new Date();
    const activeContracts = params.contracts.filter((c) => c.status === "ACTIVE");
    const totalContractValueInr = activeContracts.reduce((sum, c) => sum + c.valueInInr, 0);

    const verifiedCompliances = params.compliances.filter((c) => c.status === "COMPLIANT" && c.isVerified).length;
    const complianceRatePercent = params.compliances.length > 0
      ? parseFloat(((verifiedCompliances / params.compliances.length) * 100).toFixed(1))
      : 100;

    const avgSla = activeContracts.length > 0
      ? parseFloat((activeContracts.reduce((sum, c) => sum + c.slaRating, 0) / activeContracts.length).toFixed(1))
      : 5.0;

    let expiringContractsCount = 0;
    for (const c of activeContracts) {
      const diffDays = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays >= 0) expiringContractsCount++;
    }

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (complianceRatePercent < 60 || avgSla < 3.0) riskLevel = "CRITICAL";
    else if (complianceRatePercent < 80 || avgSla < 3.8) riskLevel = "HIGH";
    else if (expiringContractsCount > 0 || complianceRatePercent < 90) riskLevel = "MEDIUM";

    return {
      vendorId: params.vendorId,
      vendorName: params.vendorName,
      activeContractsCount: activeContracts.length,
      totalContractValueInr,
      complianceRatePercent,
      averageSlaRating: avgSla,
      riskLevel,
      expiringContractsCount
    };
  }

  static getExpiringContractAlerts(
    contracts: Array<{ id: string; contractNumber: string; vendor: { name: string }; endDate: Date; valueInInr: number }>,
    thresholdDays = 60,
    now?: Date
  ): ContractExpiryAlert[] {
    const referenceDate = now || new Date();
    const alerts: ContractExpiryAlert[] = [];

    for (const c of contracts) {
      const diffMs = new Date(c.endDate).getTime() - referenceDate.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days <= thresholdDays) {
        alerts.push({
          contractId: c.id,
          contractNumber: c.contractNumber,
          vendorName: c.vendor.name,
          daysToExpiry: Math.max(0, days),
          isExpired: days < 0,
          valueInInr: c.valueInInr
        });
      }
    }

    alerts.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
    return alerts;
  }
}
