import { DamageAssessment, PaymentStatus } from '@/types/assessment';

// In-memory stores for demo - in production, use a database
export const assessmentStore = new Map<string, DamageAssessment>();

export const paymentStore = new Map<string, PaymentStatus>();

export function getAssessment(id: string): DamageAssessment | undefined {
  return assessmentStore.get(id);
}

export function setAssessment(id: string, assessment: DamageAssessment): void {
  assessmentStore.set(id, assessment);
}

export function getPaymentStatus(assessmentId: string): PaymentStatus {
  return paymentStore.get(assessmentId) || {
    assessmentId,
    hasPaidForFullReport: false,
    hasPaidForEbayUpgrade: false,
  };
}

export function setPaymentStatus(assessmentId: string, status: Partial<PaymentStatus>): PaymentStatus {
  const existing = getPaymentStatus(assessmentId);
  const updated = { ...existing, ...status };
  paymentStore.set(assessmentId, updated);
  return updated;
}
