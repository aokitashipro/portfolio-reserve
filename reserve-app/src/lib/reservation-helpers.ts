/**
 * 予約処理ヘルパー関数
 *
 * POST /api/reservations の複雑な処理を分離し、再利用可能にする
 */

import { prisma } from '@/lib/prisma';
import { minutesSinceStartOfDay, hasTimeOverlap } from '@/lib/time-utils';
import type { PrismaClient } from '@prisma/client';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'demo-booking';

/**
 * 利用可能なスタッフを自動割り当て
 *
 * @param reservedDate - 予約日
 * @param reservedTime - 予約時刻（HH:MM形式）
 * @param menuDuration - メニュー所要時間（分）
 * @returns 割り当てられたスタッフID、見つからない場合はnull
 *
 * @example
 * const staffId = await findAvailableStaff('2025-01-20', '14:00', 60);
 * if (!staffId) {
 *   throw new Error('空いているスタッフが見つかりません');
 * }
 */
export async function findAvailableStaff(
  reservedDate: string,
  reservedTime: string,
  menuDuration: number
): Promise<string | null> {
  // 利用可能なスタッフを検索
  const availableStaff = await prisma.bookingStaff.findMany({
    where: {
      tenantId: TENANT_ID,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (availableStaff.length === 0) {
    return null;
  }

  // 予約時間帯を計算
  const reservedStartMinutes = minutesSinceStartOfDay(reservedTime);
  const reservedEndMinutes = reservedStartMinutes + menuDuration;

  // 各スタッフの予約状況を確認し、空いているスタッフを見つける
  for (const staff of availableStaff) {
    // スタッフの既存予約を確認
    const staffReservations = await prisma.bookingReservation.findMany({
      where: {
        tenantId: TENANT_ID,
        staffId: staff.id,
        reservedDate: new Date(reservedDate),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        menu: { select: { duration: true } },
      },
    });

    // 時間重複チェック
    let isAvailable = true;
    for (const res of staffReservations) {
      const resStartMinutes = minutesSinceStartOfDay(res.reservedTime);
      const resEndMinutes = resStartMinutes + res.menu.duration;

      // 時間が重複している場合
      if (hasTimeOverlap(reservedStartMinutes, reservedEndMinutes, resStartMinutes, resEndMinutes)) {
        isAvailable = false;
        break;
      }
    }

    // 空いているスタッフが見つかった
    if (isAvailable) {
      return staff.id;
    }
  }

  // 空いているスタッフが見つからなかった
  return null;
}

/**
 * ユーザーの予約時間重複チェック
 *
 * トランザクション内で使用する。
 * 同じユーザーが同じ時間帯に既に予約している場合はエラーをスロー。
 *
 * @param tx - Prismaトランザクションクライアント
 * @param userId - ユーザーID
 * @param reservedDate - 予約日
 * @param reservedTime - 予約時刻（HH:MM形式）
 * @param menuDuration - メニュー所要時間（分）
 * @throws {Error} 既にこの時間帯に予約がある場合
 *
 * @example
 * await prisma.$transaction(async (tx) => {
 *   await checkUserReservationConflicts(tx, userId, '2025-01-20', '14:00', 60);
 *   // 予約作成処理...
 * });
 */
export async function checkUserReservationConflicts(
  tx: Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  userId: string,
  reservedDate: string,
  reservedTime: string,
  menuDuration: number
): Promise<void> {
  // ユーザー自身の既存予約を取得
  const userReservations = await tx.bookingReservation.findMany({
    where: {
      tenantId: TENANT_ID,
      userId,
      reservedDate: new Date(reservedDate),
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: {
      menu: { select: { duration: true } },
    },
  });

  const newStartMinutes = minutesSinceStartOfDay(reservedTime);
  const newEndMinutes = newStartMinutes + menuDuration;

  // 時間重複チェック
  for (const userRes of userReservations) {
    const resStartMinutes = minutesSinceStartOfDay(userRes.reservedTime);
    const resEndMinutes = resStartMinutes + userRes.menu.duration;

    if (hasTimeOverlap(newStartMinutes, newEndMinutes, resStartMinutes, resEndMinutes)) {
      throw new Error('既にこの時間帯に予約があります');
    }
  }
}

/**
 * スタッフの予約時間重複チェック
 *
 * トランザクション内で使用する。
 * 指定されたスタッフが同じ時間帯に既に予約を受けている場合はエラーをスロー。
 *
 * @param tx - Prismaトランザクションクライアント
 * @param staffId - スタッフID
 * @param reservedDate - 予約日
 * @param reservedTime - 予約時刻（HH:MM形式）
 * @param menuDuration - メニュー所要時間（分）
 * @throws {Error} スタッフが指定時間帯に対応できない場合
 *
 * @example
 * await prisma.$transaction(async (tx) => {
 *   await checkStaffReservationConflicts(tx, staffId, '2025-01-20', '14:00', 60);
 *   // 予約作成処理...
 * });
 */
export async function checkStaffReservationConflicts(
  tx: Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  staffId: string,
  reservedDate: string,
  reservedTime: string,
  menuDuration: number
): Promise<void> {
  // スタッフの既存予約を取得
  const staffReservations = await tx.bookingReservation.findMany({
    where: {
      tenantId: TENANT_ID,
      staffId,
      reservedDate: new Date(reservedDate),
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: {
      menu: { select: { duration: true } },
    },
  });

  const newStartMinutes = minutesSinceStartOfDay(reservedTime);
  const newEndMinutes = newStartMinutes + menuDuration;

  // 時間重複チェック
  for (const staffRes of staffReservations) {
    const resStartMinutes = minutesSinceStartOfDay(staffRes.reservedTime);
    const resEndMinutes = resStartMinutes + staffRes.menu.duration;

    if (hasTimeOverlap(newStartMinutes, newEndMinutes, resStartMinutes, resEndMinutes)) {
      throw new Error('選択されたスタッフは指定時間帯に対応できません');
    }
  }
}

/**
 * 全体の予約時間重複チェック（スタッフ指定なしの場合）
 *
 * トランザクション内で使用する。
 * スタッフ指定なしの予約で、同じ時間帯に既に予約がある場合はエラーをスロー。
 *
 * @param tx - Prismaトランザクションクライアント
 * @param reservedDate - 予約日
 * @param reservedTime - 予約時刻（HH:MM形式）
 * @param menuDuration - メニュー所要時間（分）
 * @throws {Error} この時間は既に予約済みの場合
 *
 * @example
 * await prisma.$transaction(async (tx) => {
 *   await checkGeneralReservationConflicts(tx, '2025-01-20', '14:00', 60);
 *   // 予約作成処理...
 * });
 */
export async function checkGeneralReservationConflicts(
  tx: Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  reservedDate: string,
  reservedTime: string,
  menuDuration: number
): Promise<void> {
  // スタッフ指定なしの既存予約を取得
  const allReservations = await tx.bookingReservation.findMany({
    where: {
      tenantId: TENANT_ID,
      staffId: null,
      reservedDate: new Date(reservedDate),
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: {
      menu: { select: { duration: true } },
    },
  });

  const newStartMinutes = minutesSinceStartOfDay(reservedTime);
  const newEndMinutes = newStartMinutes + menuDuration;

  // 時間重複チェック
  for (const res of allReservations) {
    const resStartMinutes = minutesSinceStartOfDay(res.reservedTime);
    const resEndMinutes = resStartMinutes + res.menu.duration;

    if (hasTimeOverlap(newStartMinutes, newEndMinutes, resStartMinutes, resEndMinutes)) {
      throw new Error('この時間は既に予約済みです');
    }
  }
}
