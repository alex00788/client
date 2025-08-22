import { FilterClientListPipe } from './filter-client-list.pipe';

describe('FilterClientListPipe', () => {
  let pipe: FilterClientListPipe;

  beforeEach(() => {
    pipe = new FilterClientListPipe();
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
      expect(pipe.constructor.name).toBe('FilterClientListPipe');
    });
  });

  describe('Basic Filtering Functionality', () => {
    it('should filter users by surname (case insensitive)', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: 'Smith' }]);
    });

    it('should filter users by partial surname match', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'son';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: 'Johnson' }]);
    });

    it('should return empty array when no matches found', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'xyz';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle exact matches', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'Johnson';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: 'Johnson' }]);
    });
  });

  describe('Case Insensitivity', () => {
    it('should find matches regardless of search string case', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      
      expect(pipe.transform(users, 'SMITH')).toEqual([{ surnameUser: 'Smith' }]);
      expect(pipe.transform(users, 'smith')).toEqual([{ surnameUser: 'Smith' }]);
      expect(pipe.transform(users, 'Smith')).toEqual([{ surnameUser: 'Smith' }]);
      expect(pipe.transform(users, 'sMiTh')).toEqual([{ surnameUser: 'Smith' }]);
    });

    it('should find matches regardless of user surname case', () => {
      const users = [
        { surnameUser: 'SMITH' },
        { surnameUser: 'johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: 'SMITH' }]);
    });

    it('should handle mixed case scenarios', () => {
      const users = [
        { surnameUser: 'McDonald' },
        { surnameUser: 'O\'Connor' },
        { surnameUser: 'van der Berg' }
      ];
      
      expect(pipe.transform(users, 'mcdonald')).toEqual([{ surnameUser: 'McDonald' }]);
      expect(pipe.transform(users, 'O\'CONNOR')).toEqual([{ surnameUser: 'O\'Connor' }]);
      expect(pipe.transform(users, 'van der berg')).toEqual([{ surnameUser: 'van der Berg' }]);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty search string', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = '';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual(users);
    });

    it('should handle whitespace-only search string', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = '   ';
      
      const result = pipe.transform(users, searchStr);
      
      // Whitespace-only string should return empty array as no surname contains only spaces
      expect(result).toEqual([]);
    });

    it('should handle single character search', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 's';
      
      const result = pipe.transform(users, searchStr);
      
      // 's' should match 'Smith', 'Johnson', and 'Williams' (case insensitive)
      expect(result).toEqual([{ surnameUser: 'Smith' }, { surnameUser: 'Johnson' }, { surnameUser: 'Williams' }]);
    });

    it('should handle very long search strings', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      const searchStr = 'a'.repeat(1000);
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle very long surnames', () => {
      const longSurname = 'a'.repeat(1000);
      const users = [
        { surnameUser: longSurname },
        { surnameUser: 'Smith' }
      ];
      const searchStr = 'a';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: longSurname }]);
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should handle null users array', () => {
      const users = null as any;
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle undefined users array', () => {
      const users = undefined as any;
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle null search string', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = null as any;
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle undefined search string', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = undefined as any;
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle non-array users input', () => {
      const users = 'not an array' as any;
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle non-string search input', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 123 as any;
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });
  });

  describe('Data Structure Handling', () => {
    it('should handle users with missing surnameUser property', () => {
      const users = [
        { surnameUser: 'Smith' },
        { name: 'John' }, // missing surnameUser
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle users with null surnameUser property', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: null },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle users with undefined surnameUser property', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: undefined },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle users with non-string surnameUser property', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 123 },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'smith';
      
      expect(() => pipe.transform(users, searchStr)).toThrow();
    });

    it('should handle empty users array', () => {
      const users: any[] = [];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle users array with single element', () => {
      const users = [{ surnameUser: 'Smith' }];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([{ surnameUser: 'Smith' }]);
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle special characters in surnames', () => {
      const users = [
        { surnameUser: 'O\'Connor' },
        { surnameUser: 'McDonald' },
        { surnameUser: 'van der Berg' }
      ];
      
      expect(pipe.transform(users, 'o\'connor')).toEqual([{ surnameUser: 'O\'Connor' }]);
      expect(pipe.transform(users, 'mcdonald')).toEqual([{ surnameUser: 'McDonald' }]);
      expect(pipe.transform(users, 'van der berg')).toEqual([{ surnameUser: 'van der Berg' }]);
    });

    it('should handle accented characters', () => {
      const users = [
        { surnameUser: 'Müller' },
        { surnameUser: 'García' },
        { surnameUser: 'Björk' }
      ];
      
      expect(pipe.transform(users, 'müller')).toEqual([{ surnameUser: 'Müller' }]);
      expect(pipe.transform(users, 'garcía')).toEqual([{ surnameUser: 'García' }]);
      expect(pipe.transform(users, 'björk')).toEqual([{ surnameUser: 'Björk' }]);
    });

    it('should handle numbers in surnames', () => {
      const users = [
        { surnameUser: 'Smith123' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      
      expect(pipe.transform(users, 'smith123')).toEqual([{ surnameUser: 'Smith123' }]);
      expect(pipe.transform(users, '123')).toEqual([{ surnameUser: 'Smith123' }]);
    });

    it('should handle symbols in surnames', () => {
      const users = [
        { surnameUser: 'Smith@' },
        { surnameUser: 'Johnson#' },
        { surnameUser: 'Williams$' }
      ];
      
      expect(pipe.transform(users, 'smith@')).toEqual([{ surnameUser: 'Smith@' }]);
      expect(pipe.transform(users, '@')).toEqual([{ surnameUser: 'Smith@' }]);
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should handle large user arrays efficiently', () => {
      const users = Array.from({ length: 10000 }, (_, i) => ({
        surnameUser: `User${i}`
      }));
      const searchStr = 'user5000';
      
      const startTime = performance.now();
      const result = pipe.transform(users, searchStr);
      const endTime = performance.now();
      
      expect(result.length).toBe(1);
      expect(result[0].surnameUser).toBe('User5000');
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple matches efficiently', () => {
      const users = Array.from({ length: 1000 }, (_, i) => ({
        surnameUser: `Smith${i}`
      }));
      const searchStr = 'smith';
      
      const startTime = performance.now();
      const result = pipe.transform(users, searchStr);
      const endTime = performance.now();
      
      expect(result.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Return Value Validation', () => {
    it('should return a new array (not reference to original)', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).not.toBe(users);
      expect(result).toEqual([{ surnameUser: 'Smith' }]);
    });

    it('should preserve original array structure', () => {
      const users = [
        { surnameUser: 'Smith', age: 30 },
        { surnameUser: 'Johnson', age: 25 }
      ];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result[0]).toEqual({ surnameUser: 'Smith', age: 30 });
    });

    it('should return empty array for no matches', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' }
      ];
      const searchStr = 'xyz';
      
      const result = pipe.transform(users, searchStr);
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Method Signature and Type Safety', () => {
    it('should have correct method signature', () => {
      expect(pipe.transform.length).toBe(2); // Two parameters: allUsers and searchStr
    });

    it('should return array type', () => {
      const users = [{ surnameUser: 'Smith' }];
      const searchStr = 'smith';
      
      const result = pipe.transform(users, searchStr);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle method chaining', () => {
      const users = [
        { surnameUser: 'Smith' },
        { surnameUser: 'Johnson' },
        { surnameUser: 'Williams' }
      ];
      
      const result = pipe.transform(users, 's')
        .filter(user => user.surnameUser.length > 5);
      
      expect(result).toEqual([{ surnameUser: 'Johnson' }, { surnameUser: 'Williams' }]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with real-world user data structure', () => {
      const users = [
        { id: 1, nameUser: 'John', surnameUser: 'Smith', email: 'john@example.com' },
        { id: 2, nameUser: 'Jane', surnameUser: 'Johnson', email: 'jane@example.com' },
        { id: 3, nameUser: 'Bob', surnameUser: 'Williams', email: 'bob@example.com' }
      ];
      
      const result = pipe.transform(users, 'smith');
      
      expect(result).toEqual([{ id: 1, nameUser: 'John', surnameUser: 'Smith', email: 'john@example.com' }]);
    });

    it('should work with complex nested objects', () => {
      const users = [
        { 
          id: 1, 
          nameUser: 'John', 
          surnameUser: 'Smith', 
          address: { city: 'New York', country: 'USA' }
        },
        { 
          id: 2, 
          nameUser: 'Jane', 
          surnameUser: 'Johnson', 
          address: { city: 'London', country: 'UK' }
        }
      ];
      
      const result = pipe.transform(users, 'johnson');
      
      expect(result).toEqual([{ 
        id: 2, 
        nameUser: 'Jane', 
        surnameUser: 'Johnson', 
        address: { city: 'London', country: 'UK' }
      }]);
    });
  });
});
