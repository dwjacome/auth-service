import { ResponsesUtil } from './responses.util';

describe('ResponsesUtil', () => {
  describe('response', () => {
    it('should create a successful response with data', () => {
      const code = 200;
      const message = 'Success';
      const data = [{ id: '1', name: 'Test' }];

      const result = ResponsesUtil.response(code, message, data);

      expect(result).toEqual({
        code,
        message,
        data,
      });
    });

    it('should create a response without data', () => {
      const code = 204;
      const message = 'No content';

      const result = ResponsesUtil.response(code, message);

      expect(result).toEqual({
        code,
        message,
        data: [],
      });
    });

    it('should create a response with empty array when data is not provided', () => {
      const code = 200;
      const message = 'Success';

      const result = ResponsesUtil.response(code, message);

      expect((result as any).data).toEqual([]);
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 400, 401, 403, 404, 500];

      statusCodes.forEach(code => {
        const result = ResponsesUtil.response(code, 'Test message');
        expect((result as any).code).toBe(code);
      });
    });

    it('should handle different data types', () => {
      const stringData = ['test'];
      const numberData = [1, 2, 3];
      const objectData = [{ key: 'value' }];
      const mixedData = ['string', 123, { obj: true }];

      expect((ResponsesUtil.response(200, 'test', stringData) as any).data).toEqual(stringData);
      expect((ResponsesUtil.response(200, 'test', numberData) as any).data).toEqual(numberData);
      expect((ResponsesUtil.response(200, 'test', objectData) as any).data).toEqual(objectData);
      expect((ResponsesUtil.response(200, 'test', mixedData) as any).data).toEqual(mixedData);
    });
  });
}); 