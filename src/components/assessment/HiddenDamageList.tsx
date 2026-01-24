'use client';

import { Eye, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { HiddenDamage } from '@/types/assessment';
import { cn, formatCurrencyRange } from '@/lib/utils';

interface HiddenDamageListProps {
  hiddenDamage: HiddenDamage[];
  isPaid: boolean;
}

function getLikelihoodColor(likelihood: string): string {
  switch (likelihood) {
    case 'Low':
      return 'bg-green-100 text-green-700';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'High':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function HiddenDamageList({ hiddenDamage, isPaid }: HiddenDamageListProps) {
  if (hiddenDamage.length === 0) {
    return null;
  }

  return (
    <Card variant="bordered">
      <CardHeader className="bg-amber-50">
        <CardTitle className="flex items-center text-amber-800">
          <Eye className="w-5 h-5 mr-2" />
          Potential Hidden Damage ({hiddenDamage.length})
        </CardTitle>
        <p className="text-sm text-amber-600 mt-1">
          These issues may not be visible but could affect your vehicle
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {hiddenDamage.map((damage, index) => (
          <div
            key={index}
            className="border border-amber-200 rounded-lg p-4 bg-amber-50/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-gray-900">{damage.potentialIssue}</h4>
              </div>
              <Badge className={getLikelihoodColor(damage.likelihood)}>
                {damage.likelihood} Likelihood
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-3">{damage.description}</p>

            {isPaid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded p-3 border border-amber-100">
                  <p className="text-xs text-gray-500 mb-1">Estimated Additional Cost</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrencyRange(
                      damage.estimatedAdditionalCost.low,
                      damage.estimatedAdditionalCost.high
                    )}
                  </p>
                </div>
                <div className="bg-white rounded p-3 border border-amber-100">
                  <p className="text-xs text-gray-500 mb-1">Recommended Inspection</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {damage.recommendedInspection}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-3 bg-white rounded-lg border border-amber-100">
                <Lock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">
                  Unlock full report to see cost estimates
                </span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
