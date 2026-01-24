'use client';

import { Wrench, Replace, Clock, DollarSign, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { DamagedPart } from '@/types/assessment';
import { cn, formatCurrencyRange, getSeverityColor, getSkillLevelColor } from '@/lib/utils';

interface DamagedPartsListProps {
  parts: DamagedPart[];
  isPaid: boolean;
}

export function DamagedPartsList({ parts, isPaid }: DamagedPartsListProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-blue-600" />
          Damaged Parts ({parts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parts.map((part, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-lg overflow-hidden',
              getSeverityColor(part.severity)
            )}
          >
            {/* Part Header */}
            <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {part.repairOrReplace === 'Replace' ? (
                  <Replace className="w-5 h-5 text-orange-500" />
                ) : (
                  <Wrench className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{part.name}</h4>
                  <p className="text-sm text-gray-500">{part.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSeverityColor(part.severity)}>{part.severity}</Badge>
                <Badge variant={part.repairOrReplace === 'Replace' ? 'warning' : 'info'}>
                  {part.repairOrReplace}
                </Badge>
              </div>
            </div>

            {/* Part Details */}
            <div className="px-4 py-3 bg-white">
              <p className="text-sm text-gray-600 mb-3">{part.damageType}</p>

              {isPaid ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Part Cost
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrencyRange(part.estimatedPartCost.low, part.estimatedPartCost.high)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Labor Cost
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrencyRange(part.estimatedLaborCost.low, part.estimatedLaborCost.high)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Labor Hours
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {part.laborHours.low === part.laborHours.high
                        ? `${part.laborHours.low}h`
                        : `${part.laborHours.low}-${part.laborHours.high}h`}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Skill Level</div>
                    <Badge className={cn('text-xs', getSkillLevelColor(part.skillRequired))}>
                      {part.skillRequired}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">
                    Unlock full report to see pricing details
                  </span>
                </div>
              )}

              {isPaid && part.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">{part.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
