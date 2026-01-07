'use client';

import Card from '@/components/Card';
import { STAFF_DATA } from './types';

/**
 * スタッフ出勤状況カードコンポーネント
 * 注: 現在はハードコードされたデータを使用。将来的にAPI連携予定。
 */
export function StaffStatusCard() {
  return (
    <Card data-testid="staff-status-section">
      <h3 data-testid="staff-status-title" className="mb-4 text-lg font-semibold text-gray-900">
        スタッフ出勤状況
      </h3>
      <div className="space-y-3" data-testid="staff-status-card">
        {STAFF_DATA.map((staff) => (
          <div key={staff.name} data-testid="staff-item" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                {staff.name.charAt(0)}
              </div>
              <div>
                <p data-testid="staff-name" className="text-sm font-medium text-gray-900">
                  {staff.name}
                </p>
                <p data-testid="staff-status-text" className="text-xs text-gray-500">
                  {staff.status}
                </p>
              </div>
            </div>
            <div
              data-testid="staff-indicator"
              className={`h-2 w-2 rounded-full ${staff.available ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
