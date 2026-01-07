interface StaffPageMessagesProps {
  successMessage: string | null;
  error: string | null;
}

/**
 * スタッフ管理ページの成功・エラーメッセージ表示
 */
export default function StaffPageMessages({ successMessage, error }: StaffPageMessagesProps) {
  if (!successMessage && !error) {
    return null;
  }

  return (
    <>
      {successMessage && (
        <div data-testid="success-message" className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}
      {error && (
        <div data-testid="error-message" className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}
    </>
  );
}
