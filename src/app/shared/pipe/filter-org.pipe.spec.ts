import { FilterOrgPipe } from './filter-org.pipe';

describe('FilterOrgPipe', () => {
  let pipe: FilterOrgPipe;

  beforeEach(() => {
    pipe = new FilterOrgPipe();
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
      expect(pipe.constructor.name).toBe('FilterOrgPipe');
    });
  });

  describe('Basic Filtering Functionality', () => {
    it('should filter organizations by name (case insensitive)', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Microsoft' }]);
    });

    it('should filter organizations by partial name match', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'soft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Microsoft' }]);
    });

    it('should return empty array when no matches found', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'xyz';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle exact matches', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'Google';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Google' }]);
    });

    it('should return multiple matches', () => {
      const organizations = [
        { name: 'Microsoft Corporation' },
        { name: 'Microsoft Azure' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'Microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([
        { name: 'Microsoft Corporation' },
        { name: 'Microsoft Azure' }
      ]);
    });
  });

  describe('Case Insensitivity', () => {
    it('should find matches regardless of search string case', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      
      expect(pipe.transform(organizations, 'MICROSOFT')).toEqual([{ name: 'Microsoft' }]);
      expect(pipe.transform(organizations, 'microsoft')).toEqual([{ name: 'Microsoft' }]);
      expect(pipe.transform(organizations, 'Microsoft')).toEqual([{ name: 'Microsoft' }]);
      expect(pipe.transform(organizations, 'MiCrOsOfT')).toEqual([{ name: 'Microsoft' }]);
    });

    it('should find matches regardless of organization name case', () => {
      const organizations = [
        { name: 'MICROSOFT' },
        { name: 'google' },
        { name: 'Apple' }
      ];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'MICROSOFT' }]);
    });

    it('should handle mixed case scenarios', () => {
      const organizations = [
        { name: 'McDonald\'s Corporation' },
        { name: 'O\'Reilly Media' },
        { name: 'AT&T Inc.' }
      ];
      
      expect(pipe.transform(organizations, 'mcdonald\'s')).toEqual([{ name: 'McDonald\'s Corporation' }]);
      expect(pipe.transform(organizations, 'O\'REILLY')).toEqual([{ name: 'O\'Reilly Media' }]);
      expect(pipe.transform(organizations, 'at&t')).toEqual([{ name: 'AT&T Inc.' }]);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty search string', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = '';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual(organizations);
    });

    it('should handle whitespace-only search string', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = '   ';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle single character search', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'a';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Apple' }]);
    });

    it('should handle very long search strings', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      const searchStr = 'a'.repeat(1000);
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle very long organization names', () => {
      const longName = 'International Business Machines Corporation ' + 'a'.repeat(1000);
      const organizations = [
        { name: longName },
        { name: 'Microsoft' }
      ];
      const searchStr = 'International';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: longName }]);
    });

    it('should handle organizations with spaces in names', () => {
      const organizations = [
        { name: 'Microsoft Corporation' },
        { name: 'Google LLC' },
        { name: 'Apple Inc.' }
      ];
      const searchStr = 'Corporation';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Microsoft Corporation' }]);
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should handle null organizations array', () => {
      const organizations = null as any;
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle undefined organizations array', () => {
      const organizations = undefined as any;
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle null search string', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' }
      ];
      const searchStr = null as any;
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle undefined search string', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' }
      ];
      const searchStr = undefined as any;
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle non-array organizations input', () => {
      const organizations = 'not an array' as any;
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle non-string search input', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' }
      ];
      const searchStr = 123 as any;
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });
  });

  describe('Data Structure Handling', () => {
    it('should handle organizations with missing name property', () => {
      const organizations = [
        { name: 'Microsoft' },
        { title: 'Test Org' }, // missing name
        { name: 'Google' }
      ];
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle organizations with null name property', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: null },
        { name: 'Google' }
      ];
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle organizations with undefined name property', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: undefined },
        { name: 'Google' }
      ];
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle organizations with non-string name property', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 123 },
        { name: 'Google' }
      ];
      const searchStr = 'microsoft';
      
      expect(() => pipe.transform(organizations, searchStr)).toThrow();
    });

    it('should handle empty organizations array', () => {
      const organizations: any[] = [];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([]);
    });

    it('should handle organizations array with single element', () => {
      const organizations = [{ name: 'Microsoft' }];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([{ name: 'Microsoft' }]);
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle special characters in organization names', () => {
      const organizations = [
        { name: 'AT&T Inc.' },
        { name: 'Johnson & Johnson' },
        { name: 'Ben & Jerry\'s' }
      ];
      
      expect(pipe.transform(organizations, 'at&t')).toEqual([{ name: 'AT&T Inc.' }]);
      expect(pipe.transform(organizations, 'johnson & johnson')).toEqual([{ name: 'Johnson & Johnson' }]);
      expect(pipe.transform(organizations, 'ben & jerry\'s')).toEqual([{ name: 'Ben & Jerry\'s' }]);
    });

    it('should handle accented characters', () => {
      const organizations = [
        { name: 'Nestlé' },
        { name: 'Citroën' },
        { name: 'Björk Industries' }
      ];
      
      expect(pipe.transform(organizations, 'nestlé')).toEqual([{ name: 'Nestlé' }]);
      expect(pipe.transform(organizations, 'citroën')).toEqual([{ name: 'Citroën' }]);
      expect(pipe.transform(organizations, 'björk')).toEqual([{ name: 'Björk Industries' }]);
    });

    it('should handle numbers in organization names', () => {
      const organizations = [
        { name: '3M Company' },
        { name: '7-Eleven' },
        { name: 'Microsoft365' }
      ];
      
      expect(pipe.transform(organizations, '3m')).toEqual([{ name: '3M Company' }]);
      expect(pipe.transform(organizations, '7-eleven')).toEqual([{ name: '7-Eleven' }]);
      expect(pipe.transform(organizations, '365')).toEqual([{ name: 'Microsoft365' }]);
    });

    it('should handle symbols in organization names', () => {
      const organizations = [
        { name: 'H&M' },
        { name: 'P&G' },
        { name: 'A.T. Kearney' }
      ];
      
      expect(pipe.transform(organizations, 'h&m')).toEqual([{ name: 'H&M' }]);
      expect(pipe.transform(organizations, 'p&g')).toEqual([{ name: 'P&G' }]);
      expect(pipe.transform(organizations, 'a.t. kearney')).toEqual([{ name: 'A.T. Kearney' }]);
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should handle large organization arrays efficiently', () => {
      const organizations = Array.from({ length: 10000 }, (_, i) => ({
        name: `Organization${i}`
      }));
      const searchStr = 'organization5000';
      
      const startTime = performance.now();
      const result = pipe.transform(organizations, searchStr);
      const endTime = performance.now();
      
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Organization5000');
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple matches efficiently', () => {
      const organizations = Array.from({ length: 1000 }, (_, i) => ({
        name: `TechCorp${i}`
      }));
      const searchStr = 'techcorp';
      
      const startTime = performance.now();
      const result = pipe.transform(organizations, searchStr);
      const endTime = performance.now();
      
      expect(result.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Return Value Validation', () => {
    it('should return a new array (not reference to original)', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' }
      ];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).not.toBe(organizations);
      expect(result).toEqual([{ name: 'Microsoft' }]);
    });

    it('should preserve original array structure', () => {
      const organizations = [
        { name: 'Microsoft', id: 1, employees: 150000 },
        { name: 'Google', id: 2, employees: 120000 }
      ];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result[0]).toEqual({ name: 'Microsoft', id: 1, employees: 150000 });
    });

    it('should return empty array for no matches', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' }
      ];
      const searchStr = 'xyz';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should maintain order of original array', () => {
      const organizations = [
        { name: 'Microsoft Azure' },
        { name: 'Google Cloud' },
        { name: 'Microsoft Office' },
        { name: 'Amazon Web Services' },
        { name: 'Microsoft Teams' }
      ];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(result).toEqual([
        { name: 'Microsoft Azure' },
        { name: 'Microsoft Office' },
        { name: 'Microsoft Teams' }
      ]);
    });
  });

  describe('Method Signature and Type Safety', () => {
    it('should have correct method signature', () => {
      expect(pipe.transform.length).toBe(2); // Two parameters: allOrg and searchStr
    });

    it('should return array type', () => {
      const organizations = [{ name: 'Microsoft' }];
      const searchStr = 'microsoft';
      
      const result = pipe.transform(organizations, searchStr);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle method chaining', () => {
      const organizations = [
        { name: 'Microsoft' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      
      const result = pipe.transform(organizations, 'o')
        .filter(org => org.name.length > 7);
      
      expect(result).toEqual([{ name: 'Microsoft' }]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with real-world organization data structure', () => {
      const organizations = [
        { 
          id: 1, 
          name: 'Microsoft Corporation', 
          industry: 'Technology',
          founded: 1975,
          headquarters: 'Redmond, WA'
        },
        { 
          id: 2, 
          name: 'Google LLC', 
          industry: 'Technology',
          founded: 1998,
          headquarters: 'Mountain View, CA'
        },
        { 
          id: 3, 
          name: 'Apple Inc.', 
          industry: 'Technology',
          founded: 1976,
          headquarters: 'Cupertino, CA'
        }
      ];
      
      const result = pipe.transform(organizations, 'microsoft');
      
      expect(result).toEqual([{ 
        id: 1, 
        name: 'Microsoft Corporation', 
        industry: 'Technology',
        founded: 1975,
        headquarters: 'Redmond, WA'
      }]);
    });

    it('should work with complex nested objects', () => {
      const organizations = [
        { 
          id: 1, 
          name: 'Microsoft Corporation',
          details: { 
            ceo: 'Satya Nadella',
            revenue: '168 billion',
            products: ['Windows', 'Office', 'Azure']
          }
        },
        { 
          id: 2, 
          name: 'Google LLC',
          details: { 
            ceo: 'Sundar Pichai',
            revenue: '257 billion',
            products: ['Search', 'Android', 'Cloud']
          }
        }
      ];
      
      const result = pipe.transform(organizations, 'google');
      
      expect(result).toEqual([{ 
        id: 2, 
        name: 'Google LLC',
        details: { 
          ceo: 'Sundar Pichai',
          revenue: '257 billion',
          products: ['Search', 'Android', 'Cloud']
        }
      }]);
    });

    it('should handle organizations with similar names', () => {
      const organizations = [
        { name: 'Microsoft Corporation' },
        { name: 'Microsoft Azure' },
        { name: 'Microsoft Office 365' },
        { name: 'Google' },
        { name: 'Apple' }
      ];
      
      const result = pipe.transform(organizations, 'microsoft');
      
      expect(result).toEqual([
        { name: 'Microsoft Corporation' },
        { name: 'Microsoft Azure' },
        { name: 'Microsoft Office 365' }
      ]);
    });
  });

  describe('Partial Match Scenarios', () => {
    it('should find organizations by partial name beginning', () => {
      const organizations = [
        { name: 'Microsoft Corporation' },
        { name: 'Microchip Technology' },
        { name: 'Google LLC' }
      ];
      
      const result = pipe.transform(organizations, 'micro');
      
      expect(result).toEqual([
        { name: 'Microsoft Corporation' },
        { name: 'Microchip Technology' }
      ]);
    });

    it('should find organizations by partial name middle', () => {
      const organizations = [
        { name: 'International Business Machines' },
        { name: 'Business Software Alliance' },
        { name: 'Google LLC' }
      ];
      
      const result = pipe.transform(organizations, 'business');
      
      expect(result).toEqual([
        { name: 'International Business Machines' },
        { name: 'Business Software Alliance' }
      ]);
    });

    it('should find organizations by partial name ending', () => {
      const organizations = [
        { name: 'Microsoft Corporation' },
        { name: 'Apple Corporation' },
        { name: 'Google LLC' }
      ];
      
      const result = pipe.transform(organizations, 'corporation');
      
      expect(result).toEqual([
        { name: 'Microsoft Corporation' },
        { name: 'Apple Corporation' }
      ]);
    });
  });
});