'use client';

import Card from '@/components/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from './rechartsComponents';

interface Props {
  monthlyTrends: Array<{ month: string; rate: number }>;
}

/**
 * リピート率推移グラフコンポーネント
 * 過去6ヶ月のリピート率推移を折れ線グラフで表示
 */
export function RepeatRateTrendChart({ monthlyTrends }: Props) {
  return (
    <Card data-testid="repeat-rate-trend-section" className="lg:col-span-2">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">リピート率推移（過去6ヶ月）</h2>

      <div data-testid="repeat-rate-trend-chart" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#10B981"
              strokeWidth={2}
              name="リピート率 (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
