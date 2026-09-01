export interface AssetValuation {
  assetId: string;
  originalCostInr: number;
  currentBookValueInr: number;
  accumulatedDepreciationInr: number;
  annualDepreciationInr: number;
  salvageValueInr: number;
  usefulLifeYears: number;
  ageYears: number;
  depreciationPercent: number;
}

export interface AssetHealthOverview {
  totalAssets: number;
  totalBookValueInr: number;
  allocatedCount: number;
  availableCount: number;
  inMaintenanceCount: number;
  disposedCount: number;
  warrantyExpiredCount: number;
  amcExpiringSoonCount: number;
}

export class AssetLifecycleEngine {
  static computeStraightLineDepreciation(params: {
    assetId: string;
    purchaseCost: number;
    salvageValue?: number;
    usefulLifeYears: number;
    purchaseDate: Date;
    currentDate?: Date;
  }): AssetValuation {
    const salvage = params.salvageValue ?? (params.purchaseCost * 0.05);
    const lifeYears = Math.max(1, params.usefulLifeYears);
    const now = params.currentDate || new Date();
    
    const ageMs = now.getTime() - new Date(params.purchaseDate).getTime();
    const ageYears = Math.max(0, parseFloat((ageMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2)));
    
    const depreciableBase = Math.max(0, params.purchaseCost - salvage);
    const annualDepreciation = depreciableBase / lifeYears;
    const accumulated = Math.min(depreciableBase, Math.round(annualDepreciation * Math.min(ageYears, lifeYears)));
    const currentBookValue = Math.max(salvage, Math.round(params.purchaseCost - accumulated));
    const depreciationPercent = parseFloat(((accumulated / Math.max(1, params.purchaseCost)) * 100).toFixed(1));

    return {
      assetId: params.assetId,
      originalCostInr: params.purchaseCost,
      currentBookValueInr: currentBookValue,
      accumulatedDepreciationInr: accumulated,
      annualDepreciationInr: Math.round(annualDepreciation),
      salvageValueInr: Math.round(salvage),
      usefulLifeYears: lifeYears,
      ageYears,
      depreciationPercent
    };
  }

  static calculateAssetHealthSummary(assets: Array<{
    id: string;
    cost: number;
    status: string;
    warrantyExpiry?: Date | null;
    amcExpiry?: Date | null;
  }>, now?: Date): AssetHealthOverview {
    const refDate = now || new Date();
    let totalBookValueInr = 0;
    let allocatedCount = 0;
    let availableCount = 0;
    let inMaintenanceCount = 0;
    let disposedCount = 0;
    let warrantyExpiredCount = 0;
    let amcExpiringSoonCount = 0;

    for (const a of assets) {
      totalBookValueInr += a.cost;
      if (a.status === "ASSIGNED" || a.status === "ALLOCATED") allocatedCount++;
      else if (a.status === "AVAILABLE" || a.status === "IN_STOCK") availableCount++;
      else if (a.status === "MAINTENANCE" || a.status === "REPAIR") inMaintenanceCount++;
      else if (a.status === "DISPOSED" || a.status === "SCRAPPED") disposedCount++;

      if (a.warrantyExpiry && new Date(a.warrantyExpiry).getTime() < refDate.getTime()) {
        warrantyExpiredCount++;
      }

      if (a.amcExpiry) {
        const diffDays = (new Date(a.amcExpiry).getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 45 && diffDays >= 0) amcExpiringSoonCount++;
      }
    }

    return {
      totalAssets: assets.length,
      totalBookValueInr,
      allocatedCount,
      availableCount,
      inMaintenanceCount,
      disposedCount,
      warrantyExpiredCount,
      amcExpiringSoonCount
    };
  }
}
