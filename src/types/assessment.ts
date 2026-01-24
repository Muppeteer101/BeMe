// Car Damage Assessment Types

export type SkillLevel = 'DIY' | 'Intermediate' | 'Professional';

export type DamageSeverity = 'Minor' | 'Moderate' | 'Severe' | 'Critical';

export interface DamagedPart {
  name: string;
  location: string;
  damageType: string;
  severity: DamageSeverity;
  repairOrReplace: 'Repair' | 'Replace';
  estimatedPartCost: {
    low: number;
    high: number;
  };
  estimatedLaborCost: {
    low: number;
    high: number;
  };
  laborHours: {
    low: number;
    high: number;
  };
  skillRequired: SkillLevel;
  notes?: string;
}

export interface HiddenDamage {
  potentialIssue: string;
  likelihood: 'Low' | 'Medium' | 'High';
  description: string;
  estimatedAdditionalCost: {
    low: number;
    high: number;
  };
  recommendedInspection: string;
}

export interface CostBreakdown {
  partsCostLow: number;
  partsCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  hiddenDamageCostLow: number;
  hiddenDamageCostHigh: number;
  grandTotalLow: number;
  grandTotalHigh: number;
}

export interface MarketValueComparison {
  estimatedMarketValue: {
    low: number;
    high: number;
    average: number;
  };
  repairToValueRatio: number;
  recommendation: 'Economical to Repair' | 'Borderline' | 'Consider Total Loss';
  explanation: string;
}

export interface AssessmentSummary {
  overallSeverity: DamageSeverity;
  primaryDamageType: string;
  estimatedRepairDifficulty: SkillLevel;
  safetyImpact: 'None' | 'Minor' | 'Significant' | 'Critical';
  driveable: boolean;
  summaryText: string;
}

export interface DamageAssessment {
  id: string;
  createdAt: string;
  vehicleInfo: {
    year?: number;
    make?: string;
    model?: string;
    detectedFromImage: boolean;
  };
  summary: AssessmentSummary;
  damagedParts: DamagedPart[];
  hiddenDamage: HiddenDamage[];
  costBreakdown: CostBreakdown;
  marketValueComparison: MarketValueComparison;
  repairRecommendations: string[];
  safetyWarnings: string[];
  imageUrls: string[];
}

export interface AssessmentRequest {
  images: string[]; // Base64 encoded images
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
  };
}

export interface PaymentStatus {
  assessmentId: string;
  hasPaidForFullReport: boolean;
  hasPaidForEbayUpgrade: boolean;
  paymentIntentId?: string;
}

export interface EbayPart {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  seller: {
    username: string;
    feedbackScore: number;
    feedbackPercentage: number;
  };
  shippingCost?: number;
  guaranteedFit: boolean;
  compatibility?: string;
}

export interface EbaySearchResult {
  partName: string;
  searchQuery: string;
  results: EbayPart[];
  totalResults: number;
}
