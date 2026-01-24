'use client';

import { DollarSign, TrendingUp, Lock, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { CostBreakdown as CostBreakdownType, MarketValueComparison } from '@/types/assessment';
import { cn, formatCurrency, formatCurrencyRange, getRecommendationColor } from '@/lib/utils';

interface CostBreakdownProps {
  costBreakdown: CostBreakdownType;
  marketValueComparison: MarketValueComparison;
  isPaid: boolean;
}

export function CostBreakdownCard({
  costBreakdown,
  marketValueComparison,
  isPaid,
}: CostBreakdownProps) {
  if (!isPaid) {
    return (
      <Card variant="bordered">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
          <CardTitle className="flex items-center text-white">
            <Calculator className="w-5 h-5 mr-2" />
            Cost Analysis & Repair Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unlock Full Cost Analysis
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Get detailed cost estimates for parts and labor, market value comparison,
              and our recommendation on whether it's economical to repair your vehicle.
            </p>
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <DollarSign className="w-4 h-4" />
              <span>Just $1.99 for the complete report</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const repairRatioPercentage = Math.round(marketValueComparison.repairToValueRatio * 100);

  return (
    <Card variant="bordered">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
        <CardTitle className="flex items-center text-white">
          <Calculator className="w-5 h-5 mr-2" />
          Cost Analysis & Repair Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Cost Breakdown Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Estimated Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Parts</td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {formatCurrencyRange(costBreakdown.partsCostLow, costBreakdown.partsCostHigh)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">Labor</td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {formatCurrencyRange(costBreakdown.laborCostLow, costBreakdown.laborCostHigh)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">Subtotal</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  {formatCurrencyRange(costBreakdown.totalCostLow, costBreakdown.totalCostHigh)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-amber-600">
                  Potential Hidden Damage
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-amber-600">
                  +{formatCurrencyRange(
                    costBreakdown.hiddenDamageCostLow,
                    costBreakdown.hiddenDamageCostHigh
                  )}
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-4 py-3 font-bold text-blue-900">Grand Total</td>
                <td className="px-4 py-3 text-right font-bold text-blue-900">
                  {formatCurrencyRange(costBreakdown.grandTotalLow, costBreakdown.grandTotalHigh)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Market Value Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Market Value Comparison</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Estimated Vehicle Value</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(marketValueComparison.estimatedMarketValue.average)}
              </p>
              <p className="text-xs text-gray-400">
                ({formatCurrencyRange(
                  marketValueComparison.estimatedMarketValue.low,
                  marketValueComparison.estimatedMarketValue.high
                )})
              </p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Estimated Repair Cost</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrencyRange(costBreakdown.grandTotalLow, costBreakdown.grandTotalHigh)}
              </p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Repair-to-Value Ratio</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  repairRatioPercentage <= 50
                    ? 'text-green-600'
                    : repairRatioPercentage <= 75
                    ? 'text-yellow-600'
                    : 'text-red-600'
                )}
              >
                {repairRatioPercentage}%
              </p>
            </div>
          </div>

          {/* Repair Ratio Bar */}
          <div className="mb-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  repairRatioPercentage <= 50
                    ? 'bg-green-500'
                    : repairRatioPercentage <= 75
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${Math.min(repairRatioPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50% (Recommended threshold)</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div
          className={cn(
            'rounded-lg p-4 border-2',
            getRecommendationColor(marketValueComparison.recommendation)
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg">Our Recommendation</h4>
            <Badge
              className={cn(
                'text-sm font-semibold',
                marketValueComparison.recommendation === 'Economical to Repair'
                  ? 'bg-green-600 text-white'
                  : marketValueComparison.recommendation === 'Borderline'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-red-600 text-white'
              )}
            >
              {marketValueComparison.recommendation}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed">{marketValueComparison.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
