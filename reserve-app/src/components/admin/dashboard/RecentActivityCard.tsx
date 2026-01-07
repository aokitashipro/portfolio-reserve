'use client';

import Card from '@/components/Card';
import { ACTIVITY_DATA } from './types';

/**
 * 最近の活動カードコンポーネント
 * 注: 現在はハードコードされたデータを使用。将来的にAPI連携予定。
 */
export function RecentActivityCard() {
  return (
    <Card data-testid="recent-activity-section">
      <h3 data-testid="recent-activity-title" className="mb-4 text-lg font-semibold text-gray-900">
        最近の活動
      </h3>
      <div className="space-y-3" data-testid="recent-activity-card">
        {ACTIVITY_DATA.map((activity, index) => (
          <div key={index} data-testid="activity-item" className="flex items-start gap-3 text-sm">
            <span data-testid="activity-icon" className="text-lg">
              {activity.icon}
            </span>
            <div className="flex-1">
              <p data-testid="activity-action" className="font-medium text-gray-900">
                {activity.action}
              </p>
              <p data-testid="activity-time" className="text-xs text-gray-500">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
