import React from 'react';
import type { LeadScore } from '../../../types';
import { Badge } from '../../ui/Badge';

interface LeadScoreCardProps {
  score: LeadScore;
  className?: string;
}

export const LeadScoreCard: React.FC<LeadScoreCardProps> = ({ score, className = '' }) => {
  const getBadgeVariant = (level: LeadScore['level']) => {
    switch (level) {
      case 'Élevé':
        return 'success';
      case 'Moyen':
        return 'blue';
      case 'Faible':
      default:
        return 'gray';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-5 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Score commercial
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {score.score}
            </span>
            <span className="text-xs text-gray-400 font-mono">/ 100</span>
          </div>
        </div>
        <Badge variant={getBadgeVariant(score.level)} size="md">
          {score.level}
        </Badge>
      </div>

      {/* Breakdown Factors (Instruction 32) */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
          Facteurs de qualification :
        </p>
        {score.factors.map((factor, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-gray-50 border border-gray-100"
          >
            <div className="min-w-0 pr-2">
              <span className="font-medium text-gray-800">{factor.label}</span>
              {factor.description && (
                <span className="text-[11px] text-gray-500 block truncate">
                  {factor.description}
                </span>
              )}
            </div>
            <span className="font-mono font-bold text-blue-600 flex-shrink-0">
              +{factor.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
