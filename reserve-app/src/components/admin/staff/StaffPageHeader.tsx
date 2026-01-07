import Button from '@/components/Button';

interface StaffPageHeaderProps {
  onAddClick: () => void;
}

/**
 * スタッフ管理ページのヘッダー
 */
export default function StaffPageHeader({ onAddClick }: StaffPageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">
        スタッフ管理
      </h1>
      <Button
        data-testid="add-staff-button"
        onClick={onAddClick}
        variant="primary"
        size="md"
      >
        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        スタッフを追加
      </Button>
    </div>
  );
}
