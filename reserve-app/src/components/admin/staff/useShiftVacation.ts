'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Staff,
  ShiftData,
  ShiftFormData,
  VacationFormData,
  UseShiftVacationReturn,
} from './types';
import { DAY_OF_WEEK_MAP, DAYS } from './types';

const INITIAL_VACATION_DATA: VacationFormData = {
  startDate: '',
  endDate: '',
  reason: '',
};

/**
 * 時間文字列を分に変換
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * シフト・休暇設定を管理するカスタムフック
 */
export function useShiftVacation(): UseShiftVacationReturn {
  const [shiftFormData, setShiftFormData] = useState<ShiftFormData>({});
  const [vacationFormData, setVacationFormData] = useState<VacationFormData>(INITIAL_VACATION_DATA);
  const [activeTab, setActiveTab] = useState<'shift' | 'vacation'>('shift');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // メッセージ自動クリア
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const initializeShiftData = useCallback(async (staff: Staff) => {
    // 初期シフトデータを作成
    const initialShiftData: ShiftFormData = {};
    DAYS.forEach(day => {
      initialShiftData[day] = {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
      };
    });

    try {
      const response = await fetch(`/api/admin/staff/${staff.id}/shifts`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        result.data.forEach((shift: ShiftData) => {
          const dayName = Object.keys(DAY_OF_WEEK_MAP).find(
            key => DAY_OF_WEEK_MAP[key] === shift.dayOfWeek
          );
          if (dayName) {
            initialShiftData[dayName] = {
              enabled: shift.isActive,
              startTime: shift.startTime,
              endTime: shift.endTime,
            };
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    }

    setShiftFormData(initialShiftData);
  }, []);

  const submitShift = useCallback(async (staffId: string): Promise<boolean> => {
    try {
      const shifts: ShiftData[] = [];
      let validationError = false;

      Object.entries(shiftFormData).forEach(([day, data]) => {
        if (data.enabled) {
          const dayOfWeek = DAY_OF_WEEK_MAP[day];
          if (dayOfWeek) {
            const startMinutes = timeToMinutes(data.startTime);
            const endMinutes = timeToMinutes(data.endTime);

            if (endMinutes <= startMinutes) {
              setError('退勤時間は出勤時間より後である必要があります');
              validationError = true;
              return;
            }

            shifts.push({
              dayOfWeek,
              startTime: data.startTime,
              endTime: data.endTime,
              isActive: true,
            });
          }
        }
      });

      if (validationError) { return false; }

      if (shifts.length === 0) {
        setError('少なくとも1つのシフトを設定してください');
        return false;
      }

      const response = await fetch(`/api/admin/staff/${staffId}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shifts }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('シフトを保存しました');
        return true;
      } else {
        setError(result.error?.message || result.error || 'シフトの保存に失敗しました');
        return false;
      }
    } catch (err) {
      setError('シフトの保存に失敗しました');
      console.error('Submit shift error:', err);
      return false;
    }
  }, [shiftFormData]);

  const submitVacation = useCallback(async (staffId: string): Promise<boolean> => {
    try {
      if (!vacationFormData.startDate || !vacationFormData.endDate) {
        setError('休暇期間を入力してください');
        return false;
      }

      const response = await fetch(`/api/admin/staff/${staffId}/vacations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vacationFormData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('休暇を設定しました');
        return true;
      } else {
        setError(result.error?.message || result.error || '休暇の設定に失敗しました');
        return false;
      }
    } catch (err) {
      setError('休暇の設定に失敗しました');
      console.error('Submit vacation error:', err);
      return false;
    }
  }, [vacationFormData]);

  const resetShiftVacation = useCallback(() => {
    setShiftFormData({});
    setVacationFormData(INITIAL_VACATION_DATA);
    setActiveTab('shift');
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    shiftFormData,
    vacationFormData,
    activeTab,
    initializeShiftData,
    submitShift,
    submitVacation,
    setActiveTab,
    setShiftFormData,
    setVacationFormData,
    resetShiftVacation,
    error,
    successMessage,
  };
}
