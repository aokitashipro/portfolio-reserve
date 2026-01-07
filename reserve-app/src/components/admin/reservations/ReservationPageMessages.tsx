interface ReservationPageMessagesProps {
  successMessage: string | null;
}

/**
 * 予約管理ページの成功メッセージ表示
 */
export default function ReservationPageMessages({ successMessage }: ReservationPageMessagesProps) {
  if (!successMessage) {
    return null;
  }

  return (
    <div data-testid="success-message" className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">
      {successMessage}
    </div>
  );
}
