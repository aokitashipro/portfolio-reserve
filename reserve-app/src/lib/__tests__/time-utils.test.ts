/**
 * 時間処理ユーティリティのユニットテスト
 */

import {
  parseTimeString,
  minutesSinceStartOfDay,
  formatMinutesToTime,
  isValidTimeFormat,
} from '../time-utils';

describe('time-utils', () => {
  describe('parseTimeString', () => {
    it('正しい時間文字列をパースできる', () => {
      expect(parseTimeString('09:30')).toEqual({ hour: 9, minute: 30 });
      expect(parseTimeString('14:45')).toEqual({ hour: 14, minute: 45 });
      expect(parseTimeString('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(parseTimeString('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('不正な時間文字列でエラーをスローする', () => {
      expect(() => parseTimeString('abc:def')).toThrow('Invalid time format');
      expect(() => parseTimeString('25:00')).toThrow('Invalid time format');
      expect(() => parseTimeString('12:60')).toThrow('Invalid time format');
      expect(() => parseTimeString('12-30')).toThrow('Invalid time format');
      expect(() => parseTimeString('')).toThrow('Invalid time format');
    });

    it('時間の境界値を正しく処理する', () => {
      expect(parseTimeString('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(parseTimeString('23:59')).toEqual({ hour: 23, minute: 59 });
    });
  });

  describe('minutesSinceStartOfDay', () => {
    it('正しく分数に変換できる', () => {
      expect(minutesSinceStartOfDay('00:00')).toBe(0);
      expect(minutesSinceStartOfDay('00:30')).toBe(30);
      expect(minutesSinceStartOfDay('01:00')).toBe(60);
      expect(minutesSinceStartOfDay('09:30')).toBe(570); // 9 * 60 + 30
      expect(minutesSinceStartOfDay('14:45')).toBe(885); // 14 * 60 + 45
      expect(minutesSinceStartOfDay('23:59')).toBe(1439); // 23 * 60 + 59
    });

    it('不正な時間文字列でエラーをスローする', () => {
      expect(() => minutesSinceStartOfDay('invalid')).toThrow('Invalid time format');
      expect(() => minutesSinceStartOfDay('25:00')).toThrow('Invalid time format');
    });
  });

  describe('formatMinutesToTime', () => {
    it('分数を時間文字列に変換できる', () => {
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(30)).toBe('00:30');
      expect(formatMinutesToTime(60)).toBe('01:00');
      expect(formatMinutesToTime(570)).toBe('09:30');
      expect(formatMinutesToTime(885)).toBe('14:45');
      expect(formatMinutesToTime(1439)).toBe('23:59');
    });

    it('負の値でエラーをスローする', () => {
      expect(() => formatMinutesToTime(-1)).toThrow('Minutes must be non-negative');
    });

    it('1日を超える値でエラーをスローする', () => {
      expect(() => formatMinutesToTime(1440)).toThrow('Minutes must be less than 1440');
      expect(() => formatMinutesToTime(2000)).toThrow('Minutes must be less than 1440');
    });
  });

  describe('isValidTimeFormat', () => {
    it('正しい時間フォーマットを検証できる', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:30')).toBe(true);
      expect(isValidTimeFormat('14:45')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
    });

    it('不正な時間フォーマットを検出できる', () => {
      expect(isValidTimeFormat('abc:def')).toBe(false);
      expect(isValidTimeFormat('25:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('12-30')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
      expect(isValidTimeFormat('1:30')).toBe(false); // 0パディングなし
      expect(isValidTimeFormat('12:5')).toBe(false); // 0パディングなし
    });
  });

  describe('統合テスト: parseTimeString + formatMinutesToTime', () => {
    it('時間文字列 → 分数 → 時間文字列の変換が可逆的である', () => {
      const testCases = ['00:00', '09:30', '14:45', '23:59'];

      for (const time of testCases) {
        const minutes = minutesSinceStartOfDay(time);
        const converted = formatMinutesToTime(minutes);
        expect(converted).toBe(time);
      }
    });
  });
});
