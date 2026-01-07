'use client';

import Card from '@/components/Card';
import type { RepeatRate } from './types';

interface Props {
  repeatRate: RepeatRate;
}

/**
 * サマリーカードコンポーネント
 * リピート率、新規顧客数、リピート顧客数を表示
 */
export function SummaryCards({ repeatRate }: Props) {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-3" data-testid="summary-cards">
      <Card data-testid="summary-card">
        <p data-testid="summary-card-label" className="mb-1 text-sm font-medium text-gray-600">
          全体リピート率
        </p>
        <p data-testid="summary-card-value" className="text-2xl font-bold text-gray-900">
          {repeatRate.overall}%
        </p>
      </Card>

      <Card data-testid="summary-card">
        <p data-testid="summary-card-label" className="mb-1 text-sm font-medium text-gray-600">
          新規顧客数
        </p>
        <p data-testid="summary-card-value" className="text-2xl font-bold text-gray-900">
          {repeatRate.newCustomers}人
        </p>
      </Card>

      <Card data-testid="summary-card">
        <p data-testid="summary-card-label" className="mb-1 text-sm font-medium text-gray-600">
          リピート顧客数
        </p>
        <p data-testid="summary-card-value" className="text-2xl font-bold text-gray-900">
          {repeatRate.repeatCustomers}人
        </p>
      </Card>
    </div>
  );
}
