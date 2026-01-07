'use client';

import Card from '@/components/Card';
import type { DashboardStats } from './types';
import { createStatsCards } from './types';

interface Props {
  stats: DashboardStats;
}

/**
 * ダッシュボードの統計カードグリッド
 */
export function DashboardStatsGrid({ stats }: Props) {
  const statsCards = createStatsCards(stats);

  return (
    <div
      className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      data-testid="dashboard-stats-grid"
    >
      {statsCards.map((stat, index) => (
        <Card key={index} data-testid={stat.testId} className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p data-testid="stat-label" className="mb-1 text-sm font-medium text-gray-600">
                {stat.label}
              </p>
              <p data-testid="stat-value" className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <svg
                  className="mr-1 h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span data-testid="stat-change" className="font-medium text-green-600">
                  {stat.change}
                </span>
                <span className="ml-1 text-gray-500">前週比</span>
              </div>
            </div>
            <div className={`absolute right-0 top-0 h-full w-2 bg-${stat.color}-500`}></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
