'use client';

import Card from '@/components/Card';
import type { RepeatRate } from './types';
import { createPieChartData } from './types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from './rechartsComponents';

interface Props {
  repeatRate: RepeatRate;
}

/**
 * リピート率分析コンポーネント
 * リピート率と新規/リピーターの内訳を円グラフで表示
 */
export function RepeatRateAnalysis({ repeatRate }: Props) {
  const pieData = createPieChartData(repeatRate);

  return (
    <Card data-testid="repeat-rate-section">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">リピート率分析</h2>

      <div className="mb-6 text-center">
        <p className="mb-2 text-sm text-gray-600">全体のリピート率</p>
        <p data-testid="repeat-rate-overall" className="text-4xl font-bold text-blue-600">
          {repeatRate.overall}%
        </p>
      </div>

      {/* 新規/リピーター円グラフ */}
      <div data-testid="customer-type-pie-chart" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}人`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div data-testid="pie-chart-legend" className="mt-2 text-center text-sm text-gray-600">
        新規顧客 vs リピーター
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">新規顧客</p>
          <p data-testid="new-customers-count" className="text-xl font-bold text-blue-600">
            {repeatRate.newCustomers}人
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">リピーター</p>
          <p data-testid="repeat-customers-count" className="text-xl font-bold text-green-600">
            {repeatRate.repeatCustomers}人
          </p>
        </div>
      </div>
    </Card>
  );
}
