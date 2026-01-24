'use client';

import { AlertTriangle, CheckCircle, Info, Car, Wrench, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { DamageAssessment } from '@/types/assessment';
import { cn, getSeverityColor, getSkillLevelColor } from '@/lib/utils';

interface AssessmentSummaryProps {
  assessment: DamageAssessment;
}

export function AssessmentSummaryCard({ assessment }: AssessmentSummaryProps) {
  const { summary, vehicleInfo, safetyWarnings } = assessment;

  const getSeverityIcon = () => {
    switch (summary.overallSeverity) {
      case 'Minor':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Moderate':
        return <Info className="w-6 h-6 text-yellow-500" />;
      case 'Severe':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'Critical':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Header with severity indicator */}
      <div
        className={cn(
          'px-6 py-4 border-b-4',
          summary.overallSeverity === 'Minor' && 'bg-green-50 border-green-500',
          summary.overallSeverity === 'Moderate' && 'bg-yellow-50 border-yellow-500',
          summary.overallSeverity === 'Severe' && 'bg-orange-50 border-orange-500',
          summary.overallSeverity === 'Critical' && 'bg-red-50 border-red-500'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getSeverityIcon()}
            <div>
              <h2 className="text-xl font-bold text-gray-900">Damage Assessment</h2>
              {vehicleInfo.make && (
                <p className="text-sm text-gray-600">
                  {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                </p>
              )}
            </div>
          </div>
          <Badge className={getSeverityColor(summary.overallSeverity)}>
            {summary.overallSeverity} Damage
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-6">
        {/* Summary Text */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{summary.summaryText}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Wrench className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Primary Damage</p>
            <p className="font-semibold text-gray-900 text-sm">{summary.primaryDamageType}</p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Car className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Driveable</p>
            <p className="font-semibold text-gray-900 text-sm">
              {summary.driveable ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Safety Impact</p>
            <p className="font-semibold text-gray-900 text-sm">{summary.safetyImpact}</p>
          </div>

          <div className="text-center p-3 rounded-lg">
            <Badge className={cn('text-sm', getSkillLevelColor(summary.estimatedRepairDifficulty))}>
              {summary.estimatedRepairDifficulty}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">Skill Required</p>
          </div>
        </div>

        {/* Safety Warnings */}
        {safetyWarnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">Safety Warnings</h4>
            </div>
            <ul className="space-y-1">
              {safetyWarnings.map((warning, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start">
                  <span className="mr-2">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
