import { addDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Reservation {
  id: string;
  reservedDate: string;
  reservedTime: string;
  customerName: string;
  menuName: string;
  staffName: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
}

interface WeeklyCalendarGridProps {
  weekStart: Date;
  reservations: Reservation[];
  staffFilter: string;
  menuFilter: string;
  statusFilter: string;
  onTimeBlockClick: (day: number, time: string, reservation: Reservation | null) => void;
}

export function WeeklyCalendarGrid({
  weekStart,
  reservations,
  staffFilter,
  menuFilter,
  statusFilter,
  onTimeBlockClick,
}: WeeklyCalendarGridProps) {
  // 営業時間（9:00-18:00）
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // 曜日（月〜日）
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // 予約をフィルタリング
  const filteredReservations = reservations.filter(r => {
    if (staffFilter !== 'all' && r.staffName !== staffFilter) return false;
    if (menuFilter !== 'all' && r.menuName !== menuFilter) return false;
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'confirmed': 'CONFIRMED',
        'pending': 'PENDING',
        'cancelled': 'CANCELLED',
        'completed': 'COMPLETED',
      };
      if (r.status !== statusMap[statusFilter]) return false;
    }
    return true;
  });

  // 特定の日時の予約を取得
  const getReservationForSlot = (day: Date, time: string): Reservation | null => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return filteredReservations.find(
      r => r.reservedDate === dateStr && r.reservedTime === time
    ) || null;
  };

  // タイムブロックの色を取得
  const getBlockColor = (reservation: Reservation | null, isBreak: boolean, isClosed: boolean): string => {
    if (isClosed) return 'bg-gray-100 text-gray-400';
    if (isBreak) return 'bg-gray-50 text-gray-400';
    if (!reservation) return 'bg-green-100 text-green-800 hover:bg-green-200';

    switch (reservation.status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 休憩時間判定（12:00）
  const isBreakTime = (time: string) => time === '12:00';

  // 定休日判定（日曜日 = dayIndex 6）
  const isClosed = (dayIndex: number) => dayIndex === 6;

  return (
    <div className="min-w-[1000px]">
      {/* ヘッダー（曜日） */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 font-bold text-center bg-gray-50">時間</div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 font-bold text-center bg-gray-50 border-l">
            {format(day, 'EEE d日', { locale: ja })}
          </div>
        ))}
      </div>

      {/* タイムスロット */}
      {timeSlots.map((time) => (
        <div key={time} className="grid grid-cols-8 border-b">
          {/* 時間列 */}
          <div className="p-2 font-medium text-center bg-gray-50">{time}</div>

          {/* 曜日ごとのタイムブロック */}
          {weekDays.map((day, dayIndex) => {
            const reservation = getReservationForSlot(day, time);
            const isBreak = isBreakTime(time);
            const dayIsClosed = isClosed(dayIndex);
            const blockColor = getBlockColor(reservation, isBreak, dayIsClosed);
            const isDisabled = isBreak || dayIsClosed;

            return (
              <div
                key={dayIndex}
                data-testid="time-block"
                data-day={dayIndex}
                data-time={time}
                onClick={() => !isDisabled && onTimeBlockClick(dayIndex, time, reservation)}
                className={`
                  p-2 border-l text-xs cursor-pointer transition-colors
                  ${blockColor}
                  ${isDisabled ? 'cursor-not-allowed' : ''}
                `}
                {...(isDisabled && { disabled: true })}
              >
                {dayIsClosed ? (
                  <div className="text-center">[休]</div>
                ) : isBreak ? (
                  <div className="text-center">休憩時間</div>
                ) : reservation ? (
                  <div>
                    <div className="font-bold truncate">{reservation.customerName}</div>
                    <div className="truncate">{reservation.menuName}</div>
                  </div>
                ) : (
                  <div className="text-center text-green-700">[空]</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export function ReservationDetailModal({ reservation, onClose }: ReservationDetailModalProps) {
  const statusLabels: Record<Reservation['status'], string> = {
    PENDING: '保留中',
    CONFIRMED: '確定済み',
    CANCELLED: 'キャンセル済み',
    COMPLETED: '完了',
    NO_SHOW: '無断キャンセル',
  };

  return (
    <div
      data-testid="reservation-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 data-testid="detail-modal-title" className="mb-6 text-2xl font-bold">
          予約詳細
        </h2>

        <div className="space-y-3">
          <div>
            <span className="font-medium">顧客名:</span>{' '}
            <span data-testid="detail-modal-customer">{reservation.customerName}</span>
          </div>
          <div>
            <span className="font-medium">メニュー:</span>{' '}
            <span data-testid="detail-modal-menu">{reservation.menuName}</span>
          </div>
          <div>
            <span className="font-medium">スタッフ:</span>{' '}
            <span data-testid="detail-modal-staff">{reservation.staffName}</span>
          </div>
          <div>
            <span className="font-medium">ステータス:</span>{' '}
            <span data-testid="detail-modal-status">{statusLabels[reservation.status]}</span>
          </div>
          <div>
            <span className="font-medium">予約日:</span>{' '}
            <span data-testid="detail-modal-date">{reservation.reservedDate}</span>
          </div>
          <div>
            <span className="font-medium">予約時間:</span>{' '}
            <span data-testid="detail-modal-time">{reservation.reservedTime}</span>
          </div>
          {reservation.notes && (
            <div>
              <span className="font-medium">備考:</span> {reservation.notes}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            data-testid="detail-modal-edit-button"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            編集
          </button>
          <button
            data-testid="detail-modal-cancel-button"
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            キャンセル
          </button>
          <button
            data-testid="detail-modal-close-button"
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
