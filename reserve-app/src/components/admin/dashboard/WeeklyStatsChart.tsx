'use client';

import Card from '@/components/Card';
import type { WeeklyStat } from './types';

interface Props {
  weeklyStats: WeeklyStat[];
}

/**
 * 週間予約状況のバーチャートコンポーネント
 */
export function WeeklyStatsChart({ weeklyStats }: Props) {
  const maxCount = Math.max(...weeklyStats.map((s) => s.count));

  return (
    <Card data-testid="weekly-stats-section" className="mt-6">
      <h2 data-testid="weekly-stats-title" className="mb-6 text-xl font-semibold text-gray-900">
        週間予約状況
      </h2>
      <div
        className="flex items-end justify-between gap-4"
        style={{ height: '200px' }}
        data-testid="weekly-stats-chart"
      >
        {weeklyStats.map((dayStat, index) => {
          const height = maxCount > 0 ? (dayStat.count / maxCount) * 100 : 0;
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                data-testid="weekly-bar"
                className="w-full rounded-t-lg bg-blue-500 transition-all hover:bg-blue-600"
                style={{ height: `${height}%`, minHeight: dayStat.count > 0 ? '10px' : '0' }}
                title={`${dayStat.count}件`}
              ></div>
              <span data-testid="weekly-day-label" className="text-sm font-medium text-gray-600">
                {dayStat.day}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
