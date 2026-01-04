/**
 * API契約テスト
 *
 * このテストファイルは、APIレスポンスの形状（契約）が
 * 一貫して守られていることを検証します。
 *
 * 参考: documents/development/AI時代の品質担保設計_OversightFatigue対策.md
 */

import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  handleApiError,
  createErrorResponse,
} from '@/lib/api-response';

/**
 * APIレスポンスの契約（形状）をZodスキーマで定義
 */
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
      details: z.unknown().optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
});

const SuccessResponseSchema = ApiResponseSchema.extend({
  success: z.literal(true),
  data: z.unknown(),
  error: z.undefined(),
});

const ErrorResponseSchema = ApiResponseSchema.extend({
  success: z.literal(false),
  data: z.undefined(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

/**
 * エラーコードの一覧（契約）
 */
const VALID_ERROR_CODES = [
  // バリデーション
  'VALIDATION_ERROR',
  'BAD_REQUEST',
  // 認証・認可
  'UNAUTHORIZED',
  'FORBIDDEN',
  // リソース
  'NOT_FOUND',
  'DUPLICATE_RECORD',
  'CONFLICT',
  'FOREIGN_KEY_CONSTRAINT',
  // データベース
  'DATABASE_CONNECTION_ERROR',
  'DATABASE_TIMEOUT',
  // ネットワーク・タイムアウト
  'REQUEST_TIMEOUT',
  'CONNECTION_REFUSED',
  'BAD_GATEWAY',
  'SERVICE_UNAVAILABLE',
  'GATEWAY_TIMEOUT',
  // サーバーエラー
  'INTERNAL_ERROR',
  'INTERNAL_SERVER_ERROR',
  'UNKNOWN_ERROR',
  'TOO_MANY_REQUESTS',
] as const;

describe('API Contracts', () => {
  // Mock console.error
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  /**
   * 成功レスポンスの契約テスト
   */
  describe('successResponse contract', () => {
    it('should conform to SuccessResponseSchema with object data', async () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);
      const json = await response.json();

      const result = SuccessResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.error).toBeUndefined();
    });

    it('should conform to SuccessResponseSchema with array data', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const response = successResponse(data);
      const json = await response.json();

      const result = SuccessResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
    });

    it('should conform to SuccessResponseSchema with null data', async () => {
      const response = successResponse(null);
      const json = await response.json();

      const result = SuccessResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
    });

    it('should conform to SuccessResponseSchema with primitive data', async () => {
      const response = successResponse('string value');
      const json = await response.json();

      const result = SuccessResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
    });

    it('should include valid ISO timestamp', async () => {
      const response = successResponse({ test: true });
      const json = await response.json();

      // タイムスタンプがISO 8601形式であることを確認
      expect(() => new Date(json.timestamp)).not.toThrow();
      expect(new Date(json.timestamp).toISOString()).toBe(json.timestamp);
    });

    it('should set correct HTTP status codes', async () => {
      const response200 = successResponse({ test: true }, 200);
      const response201 = successResponse({ test: true }, 201);

      expect(response200.status).toBe(200);
      expect(response201.status).toBe(201);
    });
  });

  /**
   * エラーレスポンスの契約テスト
   */
  describe('errorResponse contract', () => {
    it('should conform to ErrorResponseSchema with message only', async () => {
      const response = errorResponse('Test error');
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.success).toBe(false);
      expect(json.error?.message).toBe('Test error');
    });

    it('should conform to ErrorResponseSchema with code', async () => {
      const response = errorResponse('Test error', 400, 'TEST_CODE');
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('TEST_CODE');
    });

    it('should conform to ErrorResponseSchema with details', async () => {
      const details = { field: 'email', reason: 'invalid format' };
      const response = errorResponse('Validation error', 400, 'VALIDATION_ERROR', details);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.details).toEqual(details);
    });

    it('should include valid ISO timestamp', async () => {
      const response = errorResponse('Test error');
      const json = await response.json();

      expect(() => new Date(json.timestamp)).not.toThrow();
      expect(new Date(json.timestamp).toISOString()).toBe(json.timestamp);
    });

    it('should set correct HTTP status codes', async () => {
      const response400 = errorResponse('Bad request', 400);
      const response404 = errorResponse('Not found', 404);
      const response500 = errorResponse('Server error', 500);

      expect(response400.status).toBe(400);
      expect(response404.status).toBe(404);
      expect(response500.status).toBe(500);
    });
  });

  /**
   * handleApiError の契約テスト
   */
  describe('handleApiError contract', () => {
    it('should return ErrorResponseSchema for ZodError', async () => {
      const schema = z.object({ email: z.string().email() });
      try {
        schema.parse({ email: 'invalid' });
      } catch (error) {
        const response = handleApiError(error);
        const json = await response.json();

        const result = ErrorResponseSchema.safeParse(json);
        expect(result.success).toBe(true);
        expect(json.error?.code).toBe('VALIDATION_ERROR');
        expect(response.status).toBe(400);
      }
    });

    it('should return ErrorResponseSchema for Prisma P2002 (duplicate)', async () => {
      const prismaError = { code: 'P2002', meta: { target: ['email'] } };
      const response = handleApiError(prismaError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('DUPLICATE_RECORD');
      expect(response.status).toBe(409);
    });

    it('should return ErrorResponseSchema for Prisma P2025 (not found)', async () => {
      const prismaError = { code: 'P2025' };
      const response = handleApiError(prismaError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('NOT_FOUND');
      expect(response.status).toBe(404);
    });

    it('should return ErrorResponseSchema for Prisma P2003 (foreign key)', async () => {
      const prismaError = { code: 'P2003' };
      const response = handleApiError(prismaError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('FOREIGN_KEY_CONSTRAINT');
      expect(response.status).toBe(400);
    });

    it('should return ErrorResponseSchema for Prisma P1001 (db connection)', async () => {
      const prismaError = { code: 'P1001' };
      const response = handleApiError(prismaError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(response.status).toBe(503);
    });

    it('should return ErrorResponseSchema for Prisma P2024 (timeout)', async () => {
      const prismaError = { code: 'P2024' };
      const response = handleApiError(prismaError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('DATABASE_TIMEOUT');
      expect(response.status).toBe(504);
    });

    it('should return ErrorResponseSchema for generic Error', async () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('INTERNAL_ERROR');
      expect(response.status).toBe(500);
    });

    it('should return ErrorResponseSchema for unknown error', async () => {
      const response = handleApiError('unknown error string');
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('UNKNOWN_ERROR');
      expect(response.status).toBe(500);
    });

    it('should return ErrorResponseSchema for custom error with statusCode', async () => {
      const customError = { statusCode: 403, message: 'Forbidden', code: 'FORBIDDEN' };
      const response = handleApiError(customError);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(json.error?.code).toBe('FORBIDDEN');
      expect(response.status).toBe(403);
    });
  });

  /**
   * createErrorResponse の契約テスト
   */
  describe('createErrorResponse contract', () => {
    const statusCodes = [400, 401, 403, 404, 409, 429, 500, 502, 503, 504];

    it.each(statusCodes)('should return ErrorResponseSchema for status %i', async (statusCode) => {
      const response = createErrorResponse(statusCode);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      expect(response.status).toBe(statusCode);
    });

    it('should allow custom message override', async () => {
      const customMessage = 'カスタムエラーメッセージ';
      const response = createErrorResponse(400, customMessage);
      const json = await response.json();

      expect(json.error?.message).toBe(customMessage);
    });

    it('should allow custom code override', async () => {
      const customCode = 'CUSTOM_ERROR_CODE';
      const response = createErrorResponse(400, undefined, customCode);
      const json = await response.json();

      expect(json.error?.code).toBe(customCode);
    });

    it('should fallback to 500 for unknown status codes', async () => {
      const response = createErrorResponse(999);
      const json = await response.json();

      const result = ErrorResponseSchema.safeParse(json);
      expect(result.success).toBe(true);
      // デフォルトの500エラーメッセージにフォールバック
      expect(json.error?.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  /**
   * エラーコードの一貫性テスト
   */
  describe('Error code consistency', () => {
    it('should use only valid error codes for ZodError', async () => {
      const schema = z.object({ test: z.string() });
      try {
        schema.parse({ test: 123 });
      } catch (error) {
        const response = handleApiError(error);
        const json = await response.json();
        expect(VALID_ERROR_CODES).toContain(json.error?.code);
      }
    });

    it('should use only valid error codes for Prisma errors', async () => {
      const prismaCodes = ['P2002', 'P2025', 'P2003', 'P1001', 'P2024'];

      for (const code of prismaCodes) {
        const response = handleApiError({ code });
        const json = await response.json();
        expect(VALID_ERROR_CODES).toContain(json.error?.code);
      }
    });

    it('should use only valid error codes for createErrorResponse', async () => {
      const statusCodes = [400, 401, 403, 404, 409, 429, 500, 502, 503, 504];

      for (const statusCode of statusCodes) {
        const response = createErrorResponse(statusCode);
        const json = await response.json();
        expect(VALID_ERROR_CODES).toContain(json.error?.code);
      }
    });
  });

  /**
   * HTTP Status Code と Error Code の対応関係テスト
   */
  describe('HTTP status code and error code mapping', () => {
    const expectedMappings: Array<{ status: number; expectedCodes: string[] }> = [
      { status: 400, expectedCodes: ['BAD_REQUEST', 'VALIDATION_ERROR', 'FOREIGN_KEY_CONSTRAINT'] },
      { status: 401, expectedCodes: ['UNAUTHORIZED'] },
      { status: 403, expectedCodes: ['FORBIDDEN'] },
      { status: 404, expectedCodes: ['NOT_FOUND'] },
      { status: 409, expectedCodes: ['CONFLICT', 'DUPLICATE_RECORD'] },
      { status: 429, expectedCodes: ['TOO_MANY_REQUESTS'] },
      { status: 500, expectedCodes: ['INTERNAL_SERVER_ERROR', 'INTERNAL_ERROR', 'UNKNOWN_ERROR'] },
      { status: 502, expectedCodes: ['BAD_GATEWAY', 'CONNECTION_REFUSED'] },
      { status: 503, expectedCodes: ['SERVICE_UNAVAILABLE', 'DATABASE_CONNECTION_ERROR'] },
      { status: 504, expectedCodes: ['GATEWAY_TIMEOUT', 'REQUEST_TIMEOUT', 'DATABASE_TIMEOUT'] },
    ];

    it.each(expectedMappings)(
      'status $status should map to expected error codes',
      async ({ status, expectedCodes }) => {
        const response = createErrorResponse(status);
        const json = await response.json();
        expect(expectedCodes).toContain(json.error?.code);
      }
    );
  });
});

