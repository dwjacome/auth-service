import { FunctionsUtil } from './functions.util';

describe('FunctionsUtil', () => {
  describe('generateUnixTimestamp', () => {
    it('should generate a valid Unix timestamp', () => {
      const timestamp = FunctionsUtil.generateUnixTimestamp();
      
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should generate different timestamps for different calls', () => {
      const timestamp1 = FunctionsUtil.generateUnixTimestamp();
      // Force a small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Wait for at least 1ms
      }
      const timestamp2 = FunctionsUtil.generateUnixTimestamp();
      
      expect(timestamp1).not.toBe(timestamp2);
    });

    it('should generate timestamp in milliseconds', () => {
      const timestamp = FunctionsUtil.generateUnixTimestamp();
      const currentTimeInMilliseconds = Date.now();
      
      // The timestamp should be close to current time in milliseconds
      expect(Math.abs(timestamp - currentTimeInMilliseconds)).toBeLessThan(100);
    });
  });

  describe('generateUnixTimestamp consistency', () => {
    it('should generate timestamps that are monotonically increasing', () => {
      const timestamps = [];
      
      for (let i = 0; i < 10; i++) {
        timestamps.push(FunctionsUtil.generateUnixTimestamp());
      }
      
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    });
  });
}); 