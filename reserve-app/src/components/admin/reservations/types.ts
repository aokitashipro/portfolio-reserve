/**
 * 予約管理モーダル用の型定義
 */

export interface Reservation {
  id: string;
  reservedDate: string;
  reservedTime: string;
  customerName: string;
  menuName: string;
  staffName: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  menuId?: string;
  staffId?: string;
}

export interface ReservationFormData {
  customer?: string;
  menu: string;
  staff: string;
  date: string;
  time: string;
  status?: Reservation['status'];
  notes?: string;
}

/**
 * コンポーネント用Props型定義
 */

export type ViewMode = 'list' | 'calendar';

export interface UniqueItem {
  id: string;
  name: string;
}

export interface ReservationViewTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface ReservationListFilterProps {
  statusFilter: string;
  dateRangeFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (range: string) => void;
  onSearchChange: (query: string) => void;
}

export interface ReservationTableProps {
  reservations: Reservation[];
  onShowDetail: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}

export interface ReservationCalendarFilterProps {
  staffFilter: string;
  menuFilter: string;
  statusFilter: string;
  uniqueStaff: UniqueItem[];
  uniqueMenus: UniqueItem[];
  onStaffChange: (staff: string) => void;
  onMenuChange: (menu: string) => void;
  onStatusChange: (status: string) => void;
}

export interface WeeklyCalendarProps {
  weekDates: Date[];
  weekTitle: string;
  timeSlots: string[];
  reservations: Reservation[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onTimeBlockClick: (date: Date, time: string) => void;
}

/**
 * カスタムフック用の型定義
 */

export interface UseReservationsReturn {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchReservations: () => Promise<void>;
  addReservation: (data: ReservationFormData) => Promise<boolean>;
  editReservation: (id: string, data: ReservationFormData) => Promise<boolean>;
  deleteReservation: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export interface UseReservationModalReturn {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteDialog: boolean;
  showDetailModal: boolean;
  selectedReservation: Reservation | null;
  prefilledDate: string;
  prefilledTime: string;
  openAddModal: (date?: string, time?: string) => void;
  openEditModal: (reservation: Reservation) => void;
  openDeleteDialog: (reservation: Reservation) => void;
  openDetailModal: (reservation: Reservation) => void;
  closeModals: () => void;
  switchToEdit: () => void;
}

export interface UseReservationFilterReturn {
  // リスト表示用
  statusFilter: string;
  dateRangeFilter: string;
  searchQuery: string;
  setStatusFilter: (status: string) => void;
  setDateRangeFilter: (range: string) => void;
  setSearchQuery: (query: string) => void;
  filteredReservations: Reservation[];
  // カレンダー表示用
  staffFilterCalendar: string;
  menuFilterCalendar: string;
  statusFilterCalendar: string;
  setStaffFilterCalendar: (staff: string) => void;
  setMenuFilterCalendar: (menu: string) => void;
  setStatusFilterCalendar: (status: string) => void;
  filteredReservationsCalendar: Reservation[];
  // 派生データ
  uniqueStaff: UniqueItem[];
  uniqueMenus: UniqueItem[];
}

export interface UseWeeklyCalendarReturn {
  currentWeekStart: Date;
  weekDates: Date[];
  weekTitle: string;
  timeSlots: string[];
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
}
