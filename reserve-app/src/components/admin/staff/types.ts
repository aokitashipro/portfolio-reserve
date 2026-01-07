/**
 * スタッフ管理モーダル用の型定義
 */

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isActive: boolean;
  _count?: {
    reservations: number;
  };
}

export interface StaffFormData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ShiftData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ShiftFormData {
  [key: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface VacationFormData {
  startDate: string;
  endDate: string;
  reason: string;
}

export const DAY_OF_WEEK_MAP: { [key: string]: DayOfWeek } = {
  '月曜日': 'MONDAY',
  '火曜日': 'TUESDAY',
  '水曜日': 'WEDNESDAY',
  '木曜日': 'THURSDAY',
  '金曜日': 'FRIDAY',
  '土曜日': 'SATURDAY',
  '日曜日': 'SUNDAY',
};

export const DAYS = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

/**
 * コンポーネント用Props型定義
 */

export interface StaffSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface StaffListItemProps {
  staff: Staff;
  onEdit: () => void;
  onDelete: () => void;
  onShiftSetting: () => void;
}

export interface StaffListProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onShiftSetting: (staff: Staff) => void;
}

/**
 * カスタムフック用の型定義
 */

export interface UseStaffReturn {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchStaff: () => Promise<void>;
  addStaff: (data: StaffFormData) => Promise<boolean>;
  editStaff: (id: string, data: StaffFormData) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;
  clearMessages: () => void;
}

export interface UseStaffModalReturn {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteDialog: boolean;
  showShiftModal: boolean;
  selectedStaff: Staff | null;
  formData: StaffFormData;
  openAddModal: () => void;
  openEditModal: (staff: Staff) => void;
  openDeleteDialog: (staff: Staff) => void;
  openShiftModal: (staff: Staff) => void;
  closeModals: () => void;
  setFormData: React.Dispatch<React.SetStateAction<StaffFormData>>;
}

export interface UseShiftVacationReturn {
  shiftFormData: ShiftFormData;
  vacationFormData: VacationFormData;
  activeTab: 'shift' | 'vacation';
  initializeShiftData: (staff: Staff) => Promise<void>;
  submitShift: (staffId: string) => Promise<boolean>;
  submitVacation: (staffId: string) => Promise<boolean>;
  setActiveTab: (tab: 'shift' | 'vacation') => void;
  setShiftFormData: React.Dispatch<React.SetStateAction<ShiftFormData>>;
  setVacationFormData: React.Dispatch<React.SetStateAction<VacationFormData>>;
  resetShiftVacation: () => void;
  error: string | null;
  successMessage: string | null;
}
