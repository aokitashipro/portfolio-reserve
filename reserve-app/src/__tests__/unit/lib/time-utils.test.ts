/**
 * time-utils.ts のユニットテスト
 *
 * 時間処理ユーティリティ関数のテスト
 */

import {
  parseTimeString,
  minutesSinceStartOfDay,
  formatMinutesToTime,
  isValidTimeFormat,
  hasTimeOverlap,
  isBreakTime,
  generateTimeSlots,
} from '@/lib/time-utils';

describe('time-utils', () => {
  describe('parseTimeString', () => {
    it('正常な時間文字列をパースできる', () => {
      expect(parseTimeString('09:30')).toEqual({ hour: 9, minute: 30 });
      expect(parseTimeString('14:45')).toEqual({ hour: 14, minute: 45 });
      expect(parseTimeString('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(parseTimeString('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('不正なフォーマットでエラーをスローする', () => {
      expect(() => parseTimeString('25:00')).toThrow('Invalid time format: expected HH:MM format');
      expect(() => parseTimeString('12:60')).toThrow('Invalid time format: expected HH:MM format');
      expect(() => parseTimeString('9:30')).toThrow('Invalid time format: expected HH:MM format');
      expect(() => parseTimeString('invalid')).toThrow('Invalid time format: expected HH:MM format');
    });
  });

  describe('minutesSinceStartOfDay', () => {
    it('時間文字列を経過分数に変換できる', () => {
      expect(minutesSinceStartOfDay('00:00')).toBe(0);
      expect(minutesSinceStartOfDay('01:00')).toBe(60);
      expect(minutesSinceStartOfDay('09:30')).toBe(570);
      expect(minutesSinceStartOfDay('14:45')).toBe(885);
      expect(minutesSinceStartOfDay('23:59')).toBe(1439);
    });

    it('不正なフォーマットでエラーをスローする', () => {
      expect(() => minutesSinceStartOfDay('invalid')).toThrow();
    });
  });

  describe('formatMinutesToTime', () => {
    it('経過分数を時間文字列に変換できる', () => {
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(60)).toBe('01:00');
      expect(formatMinutesToTime(570)).toBe('09:30');
      expect(formatMinutesToTime(885)).toBe('14:45');
      expect(formatMinutesToTime(1439)).toBe('23:59');
    });

    it('負の値でエラーをスローする', () => {
      expect(() => formatMinutesToTime(-1)).toThrow('Minutes must be non-negative');
    });

    it('1440以上の値でエラーをスローする', () => {
      expect(() => formatMinutesToTime(1440)).toThrow('Minutes must be less than 1440');
      expect(() => formatMinutesToTime(1500)).toThrow('Minutes must be less than 1440');
    });
  });

  describe('isValidTimeFormat', () => {
    it('有効な時間フォーマットを正しく判定する', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:30')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('12:00')).toBe(true);
    });

    it('無効な時間フォーマットを正しく判定する', () => {
      expect(isValidTimeFormat('25:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('9:30')).toBe(false);
      expect(isValidTimeFormat('09:5')).toBe(false);
      expect(isValidTimeFormat('invalid')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
      expect(isValidTimeFormat('24:00')).toBe(false);
    });
  });

  describe('hasTimeOverlap', () => {
    it('重複する時間範囲を正しく判定する', () => {
      // 9:00-10:00 と 9:30-10:30 は重複
      expect(hasTimeOverlap(540, 600, 570, 630)).toBe(true);

      // 完全に含まれる場合
      expect(hasTimeOverlap(540, 660, 570, 630)).toBe(true);

      // 開始が範囲内
      expect(hasTimeOverlap(570, 660, 540, 600)).toBe(true);
    });

    it('重複しない時間範囲を正しく判定する', () => {
      // 9:00-10:00 と 10:00-11:00 は重複しない（境界は含まない）
      expect(hasTimeOverlap(540, 600, 600, 660)).toBe(false);

      // 9:00-10:00 と 11:00-12:00 は重複しない
      expect(hasTimeOverlap(540, 600, 660, 720)).toBe(false);
    });
  });

  describe('isBreakTime', () => {
    it('休憩時間内の時刻を正しく判定する', () => {
      expect(isBreakTime('12:30', '12:00', '13:00')).toBe(true);
      expect(isBreakTime('12:00', '12:00', '13:00')).toBe(true);
      expect(isBreakTime('12:59', '12:00', '13:00')).toBe(true);
    });

    it('休憩時間外の時刻を正しく判定する', () => {
      expect(isBreakTime('14:00', '12:00', '13:00')).toBe(false);
      expect(isBreakTime('11:59', '12:00', '13:00')).toBe(false);
      expect(isBreakTime('13:00', '12:00', '13:00')).toBe(false);
    });

    it('異なる休憩時間帯でも正しく判定する', () => {
      expect(isBreakTime('15:30', '15:00', '16:00')).toBe(true);
      expect(isBreakTime('09:00', '09:00', '09:30')).toBe(true);
    });
  });

  describe('generateTimeSlots', () => {
    it('30分間隔でタイムスロットを生成する', () => {
      const slots = generateTimeSlots('09:00', '12:00');
      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
    });

    it('60分間隔でタイムスロットを生成する', () => {
      const slots = generateTimeSlots('09:00', '12:00', 60);
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('15分間隔でタイムスロットを生成する', () => {
      const slots = generateTimeSlots('10:00', '11:00', 15);
      expect(slots).toEqual(['10:00', '10:15', '10:30', '10:45']);
    });

    it('開始時刻と終了時刻が同じ場合、空配列を返す', () => {
      const slots = generateTimeSlots('09:00', '09:00');
      expect(slots).toEqual([]);
    });

    it('短い時間範囲でも正しく生成する', () => {
      const slots = generateTimeSlots('09:00', '09:30');
      expect(slots).toEqual(['09:00']);
    });

    it('終日の時間範囲でも正しく生成する', () => {
      const slots = generateTimeSlots('00:00', '23:30', 60);
      expect(slots).toHaveLength(24);
      expect(slots[0]).toBe('00:00');
      expect(slots[23]).toBe('23:00');
    });
  });
});
