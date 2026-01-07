'use client';

import Card from '@/components/Card';
import type { PeriodTab } from './types';
import { getDataKeyForPeriod } from './types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from './rechartsComponents';

interface TrendData {
  date?: string;
  week?: string;
  month?: string;
  count: number;
}

interface Props {
  trendsData: TrendData[];
  activePeriodTab: PeriodTab;
  onTabChange: (tab: PeriodTab) => void;
}

/**
 * 予約推移グラフコンポーネント
 * 日別/週別/月別の予約推移を棒グラフで表示
 */
export function ReservationTrendsChart({ trendsData, activePeriodTab, onTabChange }: Props) {
  const dataKey = getDataKeyForPeriod(activePeriodTab);

  const tabs: { key: PeriodTab; label: string }[] = [
    { key: 'daily', label: '日別' },
    { key: 'weekly', label: '週別' },
    { key: 'monthly', label: '月別' },
  ];

  return (
    <Card data-testid="reservation-trends-section">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">予約推移</h2>

      {/* 期間タブ */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            data-testid={`trends-tab-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activePeriodTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* グラフ */}
      <div data-testid="trends-chart" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
