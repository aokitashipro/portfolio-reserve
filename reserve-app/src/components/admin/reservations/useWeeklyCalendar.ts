'use client';

import { useState, useMemo, useCallback } from 'react';
import { generateTimeSlots, formatWeekTitle, generateWeekDates } from './utils';
import type { UseWeeklyCalendarReturn } from './types';

/**
 * 週間カレンダーの状態を管理するカスタムフック
 */
export function useWeeklyCalendar(): UseWeeklyCalendarReturn {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const baseDate = new Date('2026-01-06');
    baseDate.setHours(0, 0, 0, 0);
    return baseDate;
  });

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const weekTitle = useMemo(() => formatWeekTitle(currentWeekStart), [currentWeekStart]);
  const weekDates = useMemo(() => generateWeekDates(currentWeekStart), [currentWeekStart]);

  const handlePrevWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  const handleNextWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  return {
    currentWeekStart,
    weekDates,
    weekTitle,
    timeSlots,
    handlePrevWeek,
    handleNextWeek,
  };
}
