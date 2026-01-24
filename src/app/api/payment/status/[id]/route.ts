import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, setPaymentStatus } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assessmentId } = await params;

  const payment = getPaymentStatus(assessmentId);

  return NextResponse.json(payment);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assessmentId } = await params;
  const body = await request.json();
  const { type } = body;

  const existingPayment = getPaymentStatus(assessmentId);

  const updatedPayment = setPaymentStatus(assessmentId, {
    hasPaidForFullReport: type === 'full_report' ? true : existingPayment.hasPaidForFullReport,
    hasPaidForEbayUpgrade: type === 'ebay_upgrade' ? true : existingPayment.hasPaidForEbayUpgrade,
  });

  return NextResponse.json(updatedPayment);
}
