import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const assessment = getAssessment(id);

  if (!assessment) {
    return NextResponse.json(
      { error: 'Assessment not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(assessment);
}
