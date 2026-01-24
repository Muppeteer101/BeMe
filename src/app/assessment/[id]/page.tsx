'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Printer } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@/components/ui';
import {
  AssessmentSummaryCard,
  DamagedPartsList,
  HiddenDamageList,
  CostBreakdownCard,
  EbayPartsSearch,
} from '@/components/assessment';
import { PaymentWall } from '@/components/payment/PaymentWall';
import { DamageAssessment, PaymentStatus } from '@/types/assessment';

export default function AssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<DamageAssessment | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for payment success in URL
  useEffect(() => {
    const paymentResult = searchParams.get('payment');
    const paymentType = searchParams.get('type');

    if (paymentResult === 'success' && paymentType) {
      // Update payment status
      fetch(`/api/payment/status/${assessmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: paymentType }),
      })
        .then((res) => res.json())
        .then((data) => setPaymentStatus(data))
        .catch(console.error);
    }
  }, [searchParams, assessmentId]);

  // Fetch assessment and payment status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, paymentRes] = await Promise.all([
          fetch(`/api/assess/${assessmentId}`),
          fetch(`/api/payment/status/${assessmentId}`),
        ]);

        if (!assessmentRes.ok) {
          throw new Error('Assessment not found');
        }

        const assessmentData = await assessmentRes.json();
        const paymentData = await paymentRes.json();

        setAssessment(assessmentData);
        setPaymentStatus(paymentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assessmentId]);

  const handlePaymentSuccess = useCallback(
    (type: 'full_report' | 'ebay_upgrade') => {
      setPaymentStatus((prev) => ({
        assessmentId,
        hasPaidForFullReport: type === 'full_report' ? true : prev?.hasPaidForFullReport || false,
        hasPaidForEbayUpgrade: type === 'ebay_upgrade' ? true : prev?.hasPaidForEbayUpgrade || false,
      }));
    },
    [assessmentId]
  );

  const handleEbayUpgrade = useCallback(() => {
    // Trigger payment flow for eBay upgrade
    fetch('/api/payment/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId,
        type: 'ebay_upgrade',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.success) {
          handlePaymentSuccess('ebay_upgrade');
        }
      })
      .catch(console.error);
  }, [assessmentId, handlePaymentSuccess]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading assessment...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card variant="bordered" className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "We couldn't find the assessment you're looking for."}
          </p>
          <Button onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start New Assessment
          </Button>
        </Card>
      </div>
    );
  }

  const isPaid = paymentStatus?.hasPaidForFullReport || false;
  const hasEbayUpgrade = paymentStatus?.hasPaidForEbayUpgrade || false;

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <a
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </a>
            <h1 className="text-3xl font-bold text-gray-900">Damage Assessment Report</h1>
            <p className="text-gray-500">
              Assessment ID: {assessmentId.slice(0, 8)}...{assessmentId.slice(-4)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            {isPaid && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Summary Card - Always visible */}
          <AssessmentSummaryCard assessment={assessment} />

          {/* Damaged Parts List */}
          <DamagedPartsList parts={assessment.damagedParts} isPaid={isPaid} />

          {/* Hidden Damage */}
          <HiddenDamageList hiddenDamage={assessment.hiddenDamage} isPaid={isPaid} />

          {/* Payment Wall - Show if not paid */}
          {!isPaid && (
            <PaymentWall
              assessmentId={assessmentId}
              onPaymentSuccess={handlePaymentSuccess}
              hasPaidForFullReport={false}
            />
          )}

          {/* Cost Breakdown - Full content only if paid */}
          <CostBreakdownCard
            costBreakdown={assessment.costBreakdown}
            marketValueComparison={assessment.marketValueComparison}
            isPaid={isPaid}
          />

          {/* Repair Recommendations - Only if paid */}
          {isPaid && assessment.repairRecommendations.length > 0 && (
            <Card variant="bordered">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Repair Recommendations
                </h3>
                <ul className="space-y-2">
                  {assessment.repairRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* eBay Parts Search */}
          <EbayPartsSearch
            parts={assessment.damagedParts}
            vehicleInfo={assessment.vehicleInfo}
            hasEbayUpgrade={hasEbayUpgrade}
            onUpgrade={handleEbayUpgrade}
            assessmentId={assessmentId}
          />

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">Important Disclaimer</p>
            <p>
              This assessment is provided for informational purposes only and is based on
              AI analysis of the provided images. Actual repair costs may vary based on
              location, labor rates, parts availability, and additional damage discovered
              during inspection. We recommend obtaining quotes from professional repair
              shops before making any decisions. This assessment should not be used as a
              basis for insurance claims.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
