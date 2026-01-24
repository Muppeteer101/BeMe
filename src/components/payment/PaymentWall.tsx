'use client';

import { useState } from 'react';
import { Lock, CheckCircle, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, Button, Modal } from '@/components/ui';

interface PaymentWallProps {
  assessmentId: string;
  onPaymentSuccess: (type: 'full_report' | 'ebay_upgrade') => void;
  hasPaidForFullReport: boolean;
}

export function PaymentWall({
  assessmentId,
  onPaymentSuccess,
  hasPaidForFullReport,
}: PaymentWallProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'full_report' | 'ebay_upgrade'>('full_report');
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (type: 'full_report' | 'ebay_upgrade') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          type: paymentType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.success) {
        // Payment processed (e.g., in test mode)
        onPaymentSuccess(paymentType);
        setShowPaymentModal(false);
      } else {
        setError(data.error || 'Payment failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card variant="elevated" className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Unlock Full Assessment</h2>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Get detailed pricing, repair recommendations, and market value analysis
            </p>

            <div className="grid gap-4 max-w-md mx-auto mb-6">
              {/* Full Report Option */}
              {!hasPaidForFullReport && (
                <div className="bg-white/10 rounded-xl p-4 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Full Damage Report</h3>
                      <ul className="text-sm text-blue-100 mt-2 space-y-1">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Detailed part-by-part pricing
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Labor cost estimates
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Hidden damage cost analysis
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Market value comparison
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Repair recommendation
                        </li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$1.99</p>
                      <p className="text-xs text-blue-200">one-time</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePayment('full_report')}
                    className="w-full mt-4 bg-white text-blue-700 hover:bg-blue-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Unlock Full Report
                  </Button>
                </div>
              )}

              {/* eBay Upgrade Option */}
              <div className="bg-white/10 rounded-xl p-4 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">eBay Parts Search</h3>
                    <ul className="text-sm text-blue-100 mt-2 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Search eBay Guaranteed Fit parts
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Compare prices from sellers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Direct links to purchase
                      </li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$0.49</p>
                    <p className="text-xs text-blue-200">add-on</p>
                  </div>
                </div>
                <Button
                  onClick={() => handlePayment('ebay_upgrade')}
                  variant="outline"
                  className="w-full mt-4 border-white text-white hover:bg-white/10"
                >
                  Add eBay Search
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-blue-200">
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Secure Payment
              </span>
              <span className="flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Powered by Stripe
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {paymentType === 'full_report'
                ? 'You are about to unlock the full damage assessment report.'
                : 'You are about to add eBay parts search functionality.'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {paymentType === 'full_report' ? '$1.99' : '$0.49'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <Button
            onClick={processPayment}
            isLoading={isProcessing}
            className="w-full"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Now
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment processed by Stripe. We never store your card details.
          </p>
        </div>
      </Modal>
    </>
  );
}
