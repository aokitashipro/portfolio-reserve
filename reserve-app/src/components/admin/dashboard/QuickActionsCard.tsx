'use client';

import Card from '@/components/Card';
import Button from '@/components/Button';

/**
 * クイックアクションカードコンポーネント
 */
export function QuickActionsCard() {
  return (
    <Card data-testid="quick-actions-section">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">クイックアクション</h3>
      <div className="space-y-3" data-testid="quick-actions-card">
        <Button data-testid="add-reservation-button" fullWidth variant="primary" size="md">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          新規予約を追加
        </Button>
        <Button data-testid="add-customer-button" fullWidth variant="outline" size="md">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          顧客を追加
        </Button>
      </div>
    </Card>
  );
}
