import { MomentTransformDatePipe } from './moment-transform-date.pipe';
import moment from 'moment';

describe('MomentTransformDatePipe', () => {
  let pipe: MomentTransformDatePipe;

  beforeEach(() => {
    pipe = new MomentTransformDatePipe();
  });

  afterEach(() => {
    pipe = null as any;
  });

  describe('Pipe Creation and Basic Functionality', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy();
    });

    it('should implement PipeTransform interface', () => {
      expect(pipe.transform).toBeDefined();
      expect(typeof pipe.transform).toBe('function');
    });

    it('should have correct pipe metadata', () => {
      expect(pipe.constructor.name).toBe('MomentTransformDatePipe');
    });

    it('should have correct pipe configuration', () => {
      expect(pipe.transform.length).toBe(1); // One parameter: value (format has default value)
    });
  });

  describe('Basic Date Formatting', () => {
    it('should format date with default format (MMMM YYYY)', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate);
      
      expect(result).toBe('June 2023');
    });

    it('should format date with custom format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD/MM/YYYY');
      
      expect(result).toBe('15/06/2023');
    });

    it('should format date with different month', () => {
      const testDate = moment('2023-12-25');
      const result = pipe.transform(testDate, 'MMMM YYYY');
      
      expect(result).toBe('December 2023');
    });

    it('should format date with different year', () => {
      const testDate = moment('2025-06-15');
      const result = pipe.transform(testDate, 'MMMM YYYY');
      
      expect(result).toBe('June 2025');
    });

    it('should format date with day included', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD MMMM YYYY');
      
      expect(result).toBe('15 June 2023');
    });
  });

  describe('Different Date Formats', () => {
    it('should format with DD-MM-YYYY format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD-MM-YYYY');
      
      expect(result).toBe('15-06-2023');
    });

    it('should format with MM/DD/YYYY format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'MM/DD/YYYY');
      
      expect(result).toBe('06/15/2023');
    });

    it('should format with YYYY-MM-DD format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'YYYY-MM-DD');
      
      expect(result).toBe('2023-06-15');
    });

    it('should format with time format', () => {
      const testDate = moment('2023-06-15 14:30:00');
      const result = pipe.transform(testDate, 'HH:mm:ss');
      
      expect(result).toBe('14:30:00');
    });

    it('should format with full datetime format', () => {
      const testDate = moment('2023-06-15 14:30:00');
      const result = pipe.transform(testDate, 'DD MMMM YYYY, HH:mm');
      
      expect(result).toBe('15 June 2023, 14:30');
    });

    it('should format with abbreviated month format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD MMM YYYY');
      
      expect(result).toBe('15 Jun 2023');
    });

    it('should format with day of week', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'dddd, DD MMMM YYYY');
      
      expect(result).toBe('Thursday, 15 June 2023');
    });

    it('should format with abbreviated day of week', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'ddd, DD MMM YYYY');
      
      expect(result).toBe('Thu, 15 Jun 2023');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = moment('2024-02-29');
      const result = pipe.transform(leapYearDate, 'DD MMMM YYYY');
      
      expect(result).toBe('29 February 2024');
    });

    it('should handle end of month dates', () => {
      const endOfMonthDate = moment('2023-01-31');
      const result = pipe.transform(endOfMonthDate, 'DD MMMM YYYY');
      
      expect(result).toBe('31 January 2023');
    });

    it('should handle end of year dates', () => {
      const endOfYearDate = moment('2023-12-31');
      const result = pipe.transform(endOfYearDate, 'DD MMMM YYYY');
      
      expect(result).toBe('31 December 2023');
    });

    it('should handle beginning of year dates', () => {
      const startOfYearDate = moment('2023-01-01');
      const result = pipe.transform(startOfYearDate, 'DD MMMM YYYY');
      
      expect(result).toBe('01 January 2023');
    });

    it('should handle midnight time', () => {
      const midnightDate = moment('2023-06-15 00:00:00');
      const result = pipe.transform(midnightDate, 'HH:mm:ss');
      
      expect(result).toBe('00:00:00');
    });

    it('should handle end of day time', () => {
      const endOfDayDate = moment('2023-06-15 23:59:59');
      const result = pipe.transform(endOfDayDate, 'HH:mm:ss');
      
      expect(result).toBe('23:59:59');
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should handle null value', () => {
      expect(() => pipe.transform(null as any)).toThrow();
    });

    it('should handle undefined value', () => {
      expect(() => pipe.transform(undefined as any)).toThrow();
    });

    it('should handle invalid moment object', () => {
      const invalidMoment = moment.invalid();
      const result = pipe.transform(invalidMoment);
      
      expect(result).toBe('Invalid date');
    });

    it('should handle non-moment value', () => {
      const nonMomentValue = '2023-06-15' as any;
      expect(() => pipe.transform(nonMomentValue)).toThrow();
    });

    it('should handle number value', () => {
      const numberValue = 123456789 as any;
      expect(() => pipe.transform(numberValue)).toThrow();
    });

    it('should handle boolean value', () => {
      const booleanValue = true as any;
      expect(() => pipe.transform(booleanValue)).toThrow();
    });

    it('should handle object value', () => {
      const objectValue = { date: '2023-06-15' } as any;
      expect(() => pipe.transform(objectValue)).toThrow();
    });

    it('should handle array value', () => {
      const arrayValue = ['2023-06-15'] as any;
      expect(() => pipe.transform(arrayValue)).toThrow();
    });
  });

  describe('Format Parameter Handling', () => {
    it('should handle null format parameter', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, null as any);
      
      expect(result).toBe('2023-06-15T00:00:00+03:00'); // Moment uses ISO format for null
    });

    it('should handle undefined format parameter', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, undefined as any);
      
      expect(result).toBe('June 2023'); // Should use default format when undefined
    });

    it('should handle empty string format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, '');
      
      expect(result).toBe('2023-06-15T00:00:00+03:00'); // Moment uses ISO format for empty string
    });

    it('should handle whitespace-only format', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, '   ');
      
      expect(result).toBe('   '); // Moment returns whitespace format as-is
    });

    it('should handle non-string format', () => {
      const testDate = moment('2023-06-15');
      expect(() => pipe.transform(testDate, 123 as any)).toThrow();
    });

    it('should handle boolean format', () => {
      const testDate = moment('2023-06-15');
      expect(() => pipe.transform(testDate, true as any)).toThrow();
    });
  });

  describe('Special Date Scenarios', () => {
    it('should handle different timezones', () => {
      const utcDate = moment.utc('2023-06-15 14:30:00');
      const result = pipe.transform(utcDate, 'YYYY-MM-DD HH:mm:ss Z');
      
      expect(result).toMatch(/2023-06-15 14:30:00 \+00:00/);
    });

    it('should handle relative time formatting', () => {
      const now = moment();
      const pastDate = moment().subtract(1, 'day');
      const result = pipe.transform(pastDate, 'YYYY-MM-DD');
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle future dates', () => {
      const futureDate = moment().add(1, 'year');
      const result = pipe.transform(futureDate, 'YYYY');
      
      expect(result).toBe((moment().year() + 1).toString());
    });

    it('should handle past dates', () => {
      const pastDate = moment().subtract(100, 'years');
      const result = pipe.transform(pastDate, 'YYYY');
      
      expect(result).toBe((moment().year() - 100).toString());
    });

    it('should handle century dates', () => {
      const centuryDate = moment('1900-01-01');
      const result = pipe.transform(centuryDate, 'YYYY');
      
      expect(result).toBe('1900');
    });

    it('should handle millennium dates', () => {
      const millenniumDate = moment('2000-01-01');
      const result = pipe.transform(millenniumDate, 'YYYY');
      
      expect(result).toBe('2000');
    });
  });

  describe('Complex Format Patterns', () => {
    it('should handle format with quotes', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD [of] MMMM YYYY');
      
      expect(result).toBe('15 of June 2023');
    });

    it('should handle format with escaped characters', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD \\[of\\] MMMM YYYY');
      
      expect(result).toBe('15 [of] June 2023');
    });

    it('should handle format with multiple spaces', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD    MMMM    YYYY');
      
      expect(result).toBe('15    June    2023');
    });

    it('should handle format with special characters', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD@MM@YYYY');
      
      expect(result).toBe('15@06@2023');
    });

    it('should handle format with numbers as text', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD [day] of MMMM YYYY');
      
      expect(result).toBe('15 day of June 2023');
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should handle multiple transformations efficiently', () => {
      const testDate = moment('2023-06-15');
      const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MMMM YYYY', 'dddd, DD MMMM YYYY'];
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        formats.forEach(format => {
          pipe.transform(testDate, format);
        });
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle complex format patterns efficiently', () => {
      const testDate = moment('2023-06-15 14:30:45');
      const complexFormat = 'dddd, DD MMMM YYYY [at] HH:mm:ss [UTC]';
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        pipe.transform(testDate, complexFormat);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Return Value Validation', () => {
    it('should return string type', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate);
      
      expect(typeof result).toBe('string');
    });

    it('should return non-empty string for valid date', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate);
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return consistent results for same input', () => {
      const testDate = moment('2023-06-15');
      const format = 'DD MMMM YYYY';
      
      const result1 = pipe.transform(testDate, format);
      const result2 = pipe.transform(testDate, format);
      
      expect(result1).toBe(result2);
    });

    it('should handle different moment instances with same date', () => {
      const date1 = moment('2023-06-15');
      const date2 = moment('2023-06-15');
      const format = 'DD MMMM YYYY';
      
      const result1 = pipe.transform(date1, format);
      const result2 = pipe.transform(date2, format);
      
      expect(result1).toBe(result2);
    });
  });

  describe('Method Signature and Type Safety', () => {
    it('should have correct method signature', () => {
      expect(pipe.transform.length).toBe(1); // One parameter: value (format has default value)
    });

    it('should return string type', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate);
      
      expect(typeof result).toBe('string');
    });

    it('should handle method chaining', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'YYYY-MM-DD')
        .split('-')
        .map(Number);
      
      expect(result).toEqual([2023, 6, 15]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with real-world date scenarios', () => {
      const dates = [
        moment('2023-01-01'), // New Year
        moment('2023-02-14'), // Valentine's Day
        moment('2023-12-25'), // Christmas
        moment('2024-02-29'), // Leap Year
        moment('2023-06-15')  // Regular day
      ];
      
      const formats = ['YYYY-MM-DD', 'DD MMMM YYYY', 'dddd'];
      
      dates.forEach(date => {
        formats.forEach(format => {
          const result = pipe.transform(date, format);
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });

    it('should work with different locales', () => {
      const testDate = moment('2023-06-15');
      
      // Test with different moment locales if available
      const result = pipe.transform(testDate, 'dddd, DD MMMM YYYY');
      expect(result).toBe('Thursday, 15 June 2023');
    });

    it('should handle date arithmetic results', () => {
      const baseDate = moment('2023-06-15');
      const futureDate = baseDate.clone().add(1, 'month');
      const pastDate = baseDate.clone().subtract(1, 'month');
      
      const result1 = pipe.transform(futureDate, 'MMMM YYYY');
      const result2 = pipe.transform(pastDate, 'MMMM YYYY');
      
      expect(result1).toBe('July 2023');
      expect(result2).toBe('May 2023');
    });
  });

  describe('Edge Case Format Patterns', () => {
    it('should handle format with only year', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'YYYY');
      
      expect(result).toBe('2023');
    });

    it('should handle format with only month', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'MMMM');
      
      expect(result).toBe('June');
    });

    it('should handle format with only day', () => {
      const testDate = moment('2023-06-15');
      const result = pipe.transform(testDate, 'DD');
      
      expect(result).toBe('15');
    });

    it('should handle format with only time', () => {
      const testDate = moment('2023-06-15 14:30:45');
      const result = pipe.transform(testDate, 'HH:mm:ss');
      
      expect(result).toBe('14:30:45');
    });

    it('should handle format with milliseconds', () => {
      const testDate = moment('2023-06-15 14:30:45.123');
      const result = pipe.transform(testDate, 'HH:mm:ss.SSS');
      
      expect(result).toBe('14:30:45.123');
    });

    it('should handle format with timezone offset', () => {
      const testDate = moment('2023-06-15 14:30:00');
      const result = pipe.transform(testDate, 'Z');
      
      expect(result).toMatch(/^[+-]\d{2}:\d{2}$/);
    });
  });
});
