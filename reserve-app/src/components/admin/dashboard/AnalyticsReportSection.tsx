'use client';

import Card from '@/components/Card';
import type { DashboardStats } from './types';

interface Props {
  stats: DashboardStats;
}

/**
 * 分析レポートセクションコンポーネント
 * 機能フラグ（enableAnalyticsReport）で表示制御される
 */
export function AnalyticsReportSection({ stats }: Props) {
  return (
    <div className="mt-8" data-testid="analytics-report-section">
      <Card>
        <h2 className="mb-6 text-xl font-semibold text-gray-900">分析レポート</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">月間売上推移</h3>
            <p className="text-2xl font-bold text-gray-900">
              ¥{stats.monthlyRevenue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-green-600">前月比 +12%</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">新規顧客数</h3>
            <p className="text-2xl font-bold text-gray-900">24人</p>
            <p className="mt-1 text-xs text-green-600">前月比 +8%</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">平均客単価</h3>
            <p className="text-2xl font-bold text-gray-900">¥8,500</p>
            <p className="mt-1 text-xs text-green-600">前月比 +5%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
