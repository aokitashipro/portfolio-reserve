'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import Button from '@/components/Button';
import {
  AddReservationModal,
  EditReservationModal,
  DeleteReservationDialog,
  ReservationDetailModal,
  ReservationViewTabs,
  ReservationListFilter,
  ReservationTable,
  ReservationCalendarFilter,
  WeeklyCalendar,
  ReservationPageHeader,
  ReservationPageMessages,
  useReservations,
  useReservationModal,
  useReservationFilter,
  useWeeklyCalendar,
  formatDateString,
} from '@/components/admin/reservations';
import type { ViewMode } from '@/components/admin/reservations';

// LocalStorageからviewModeを取得（クライアントサイドのみ）
const getInitialViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'list';
  const saved = localStorage.getItem('adminReservationsViewMode');
  return saved === 'calendar' ? 'calendar' : 'list';
};

export default function AdminReservationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

  // カスタムフック
  const {
    reservations,
    loading,
    error,
    successMessage,
    fetchReservations,
    addReservation,
    editReservation,
    deleteReservation,
  } = useReservations();

  const {
    showAddModal,
    showEditModal,
    showDeleteDialog,
    showDetailModal,
    selectedReservation,
    prefilledDate,
    prefilledTime,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    openDetailModal,
    closeModals,
    switchToEdit,
  } = useReservationModal();

  const {
    statusFilter,
    dateRangeFilter,
    searchQuery,
    setStatusFilter,
    setDateRangeFilter,
    setSearchQuery,
    filteredReservations,
    staffFilterCalendar,
    menuFilterCalendar,
    statusFilterCalendar,
    setStaffFilterCalendar,
    setMenuFilterCalendar,
    setStatusFilterCalendar,
    filteredReservationsCalendar,
    uniqueStaff,
    uniqueMenus,
  } = useReservationFilter(reservations);

  const {
    weekDates,
    weekTitle,
    timeSlots,
    handlePrevWeek,
    handleNextWeek,
  } = useWeeklyCalendar();

  // viewModeが変更されたらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('adminReservationsViewMode', viewMode);
  }, [viewMode]);

  // タイムブロッククリック
  const handleTimeBlockClick = (date: Date, time: string) => {
    const dateStr = formatDateString(date);
    const reservation = filteredReservationsCalendar.find(
      (r) => r.reservedDate === dateStr && r.reservedTime === time
    );

    if (reservation) {
      openDetailModal(reservation);
    } else {
      openAddModal(dateStr, time);
    }
  };

  // 予約追加送信
  const handleAddSubmit = async (formData: Parameters<typeof addReservation>[0]) => {
    const success = await addReservation(formData);
    if (success) closeModals();
  };

  // 予約編集送信
  const handleEditSubmit = async (formData: Parameters<typeof editReservation>[1]) => {
    if (!selectedReservation) return;
    const success = await editReservation(selectedReservation.id, formData);
    if (success) closeModals();
  };

  // 予約削除確認
  const handleDeleteConfirm = async () => {
    if (!selectedReservation) return;
    const success = await deleteReservation(selectedReservation.id);
    if (success) closeModals();
  };

  // 詳細モーダルからキャンセル
  const handleCancelFromDetail = async () => {
    if (!selectedReservation) return;
    await editReservation(selectedReservation.id, {
      menu: selectedReservation.menuName,
      staff: selectedReservation.staffName,
      date: selectedReservation.reservedDate,
      time: selectedReservation.reservedTime,
      status: 'CANCELLED',
      notes: selectedReservation.notes,
    });
    closeModals();
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex h-96 items-center justify-center">
            <div data-testid="loading-message" className="text-gray-500">読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <div data-testid="error-message" className="rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
          <Button data-testid="retry-button" onClick={fetchReservations} className="mt-4">
            再試行
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8">
        <ReservationPageHeader onAddClick={() => openAddModal()} />
        <ReservationPageMessages successMessage={successMessage} />
        <ReservationViewTabs viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* 一覧表示 */}
        {viewMode === 'list' && (
          <>
            <ReservationListFilter
              statusFilter={statusFilter}
              dateRangeFilter={dateRangeFilter}
              searchQuery={searchQuery}
              onStatusChange={setStatusFilter}
              onDateRangeChange={setDateRangeFilter}
              onSearchChange={setSearchQuery}
            />
            <ReservationTable
              reservations={filteredReservations}
              onShowDetail={openDetailModal}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          </>
        )}

        {/* カレンダー表示 */}
        {viewMode === 'calendar' && (
          <>
            <ReservationCalendarFilter
              staffFilter={staffFilterCalendar}
              menuFilter={menuFilterCalendar}
              statusFilter={statusFilterCalendar}
              uniqueStaff={uniqueStaff}
              uniqueMenus={uniqueMenus}
              onStaffChange={setStaffFilterCalendar}
              onMenuChange={setMenuFilterCalendar}
              onStatusChange={setStatusFilterCalendar}
            />
            <WeeklyCalendar
              weekDates={weekDates}
              weekTitle={weekTitle}
              timeSlots={timeSlots}
              reservations={filteredReservationsCalendar}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onTimeBlockClick={handleTimeBlockClick}
            />
          </>
        )}

        {/* モーダル */}
        {showAddModal && (
          <AddReservationModal
            onClose={closeModals}
            onSubmit={handleAddSubmit}
            prefilledDate={prefilledDate}
            prefilledTime={prefilledTime}
          />
        )}

        {showEditModal && selectedReservation && (
          <EditReservationModal
            reservation={selectedReservation}
            onClose={closeModals}
            onSubmit={handleEditSubmit}
          />
        )}

        {showDeleteDialog && selectedReservation && (
          <DeleteReservationDialog
            reservation={selectedReservation}
            onClose={closeModals}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {showDetailModal && selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={closeModals}
            onEdit={switchToEdit}
            onCancel={handleCancelFromDetail}
          />
        )}
      </main>
    </div>
  );
}
