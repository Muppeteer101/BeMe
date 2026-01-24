import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPaymentStatus, setPaymentStatus } from '@/lib/store';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

interface CheckoutRequestBody {
  assessmentId: string;
  type: 'full_report' | 'ebay_upgrade';
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { assessmentId, type } = body;

    if (!assessmentId || !type) {
      return NextResponse.json(
        { error: 'Assessment ID and payment type are required' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!stripe) {
      // Demo mode - just mark as paid
      setPaymentStatus(assessmentId, {
        hasPaidForFullReport: type === 'full_report' ? true : getPaymentStatus(assessmentId).hasPaidForFullReport,
        hasPaidForEbayUpgrade: type === 'ebay_upgrade' ? true : getPaymentStatus(assessmentId).hasPaidForEbayUpgrade,
      });

      return NextResponse.json({ success: true });
    }

    // Create Stripe checkout session
    const priceAmount = type === 'full_report' ? 199 : 49; // in cents
    const productName = type === 'full_report'
      ? 'Full Damage Assessment Report'
      : 'eBay Parts Search Upgrade';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: type === 'full_report'
                ? 'Detailed cost breakdown, market value comparison, and repair recommendations'
                : 'Search eBay for compatible replacement parts with guaranteed fit',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/assessment/${assessmentId}?payment=success&type=${type}`,
      cancel_url: `${baseUrl}/assessment/${assessmentId}?payment=cancelled`,
      metadata: {
        assessmentId,
        type,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
