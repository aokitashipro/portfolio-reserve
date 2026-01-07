import Button from '@/components/Button';

interface ReservationPageHeaderProps {
  onAddClick: () => void;
}

/**
 * 予約管理ページのヘッダー
 */
export default function ReservationPageHeader({ onAddClick }: ReservationPageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">
        予約一覧
      </h1>
      <Button data-testid="add-reservation-button" variant="primary" onClick={onAddClick}>
        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新規予約を追加
      </Button>
    </div>
  );
}
