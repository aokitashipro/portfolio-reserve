'use client';

import Card from '@/components/Card';
import Button from '@/components/Button';
import type { Reservation } from './types';
import { getStatusStyles } from './types';

interface Props {
  reservations: Reservation[];
}

/**
 * 本日の予約一覧コンポーネント
 */
export function TodayReservationsList({ reservations }: Props) {
  const renderStatusBadge = (status: string) => {
    const { className, label } = getStatusStyles(status);
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      >
        {label}
      </span>
    );
  };

  return (
    <Card data-testid="today-reservations-section">
      <div className="mb-6 flex items-center justify-between">
        <h2 data-testid="today-reservations-title" className="text-xl font-semibold text-gray-900">
          本日の予約
        </h2>
        <Button data-testid="view-all-reservations" variant="outline" size="sm">
          すべて表示
        </Button>
      </div>

      <div className="space-y-3" data-testid="today-reservations-list">
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              data-testid="reservation-item"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  data-testid="reservation-time"
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600"
                >
                  {reservation.time}
                </div>
                <div>
                  <p data-testid="reservation-customer" className="font-medium text-gray-900">
                    {reservation.customer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span data-testid="reservation-menu">{reservation.menu}</span> /{' '}
                    <span data-testid="reservation-staff">{reservation.staff}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span data-testid="reservation-status">{renderStatusBadge(reservation.status)}</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p data-testid="no-reservations-message" className="text-gray-500">
              本日の予約はありません
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
