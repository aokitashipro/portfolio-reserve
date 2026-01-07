'use client';

import { useState, useMemo } from 'react';
import type { Reservation, UniqueItem, UseReservationFilterReturn } from './types';

/**
 * 予約フィルタリングを管理するカスタムフック
 */
export function useReservationFilter(reservations: Reservation[]): UseReservationFilterReturn {
  // リスト表示用フィルター
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // カレンダー表示用フィルター
  const [staffFilterCalendar, setStaffFilterCalendar] = useState('all');
  const [menuFilterCalendar, setMenuFilterCalendar] = useState('all');
  const [statusFilterCalendar, setStatusFilterCalendar] = useState('all');

  // リスト表示用フィルタリング結果
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      if (statusFilter !== 'all' && reservation.status !== statusFilter.toUpperCase()) {
        return false;
      }
      if (searchQuery && !reservation.customerName.includes(searchQuery)) {
        return false;
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  // カレンダー表示用フィルタリング結果
  const filteredReservationsCalendar = useMemo(() => {
    return reservations.filter((reservation) => {
      if (staffFilterCalendar !== 'all' && reservation.staffId !== staffFilterCalendar) {
        return false;
      }
      if (menuFilterCalendar !== 'all' && reservation.menuId !== menuFilterCalendar) {
        return false;
      }
      if (statusFilterCalendar !== 'all' && reservation.status !== statusFilterCalendar.toUpperCase()) {
        return false;
      }
      return true;
    });
  }, [reservations, staffFilterCalendar, menuFilterCalendar, statusFilterCalendar]);

  // ユニークなスタッフ一覧
  const uniqueStaff: UniqueItem[] = useMemo(() => {
    const staffMap = new Map<string, string>();
    reservations.forEach((r) => {
      if (r.staffId && r.staffName) {
        staffMap.set(r.staffId, r.staffName);
      }
    });
    return Array.from(staffMap.entries()).map(([id, name]) => ({ id, name }));
  }, [reservations]);

  // ユニークなメニュー一覧
  const uniqueMenus: UniqueItem[] = useMemo(() => {
    const menuMap = new Map<string, string>();
    reservations.forEach((r) => {
      if (r.menuId && r.menuName) {
        menuMap.set(r.menuId, r.menuName);
      }
    });
    return Array.from(menuMap.entries()).map(([id, name]) => ({ id, name }));
  }, [reservations]);

  return {
    // リスト表示用
    statusFilter,
    dateRangeFilter,
    searchQuery,
    setStatusFilter,
    setDateRangeFilter,
    setSearchQuery,
    filteredReservations,
    // カレンダー表示用
    staffFilterCalendar,
    menuFilterCalendar,
    statusFilterCalendar,
    setStaffFilterCalendar,
    setMenuFilterCalendar,
    setStatusFilterCalendar,
    filteredReservationsCalendar,
    // 派生データ
    uniqueStaff,
    uniqueMenus,
  };
}
