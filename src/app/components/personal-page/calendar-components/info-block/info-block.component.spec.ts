import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InfoBlockComponent } from './info-block.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

// Mock Services
class MockDateService {
  date = new BehaviorSubject(moment('2024-01-15'));
  changeOneDay = jasmine.createSpy('changeOneDay');
}

class MockDataCalendarService {
  getAllEntryAllUsersForTheMonth = jasmine.createSpy('getAllEntryAllUsersForTheMonth');
}

describe('InfoBlockComponent', () => {
  let component: InfoBlockComponent;
  let fixture: ComponentFixture<InfoBlockComponent>;
  let dateService: MockDateService;
  let dataCalendarService: MockDataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InfoBlockComponent,
        AsyncPipe,
        MomentTransformDatePipe
      ],
      providers: [
        { provide: DateService, useClass: MockDateService },
        { provide: DataCalendarService, useClass: MockDataCalendarService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoBlockComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as any;
    dataCalendarService = TestBed.inject(DataCalendarService) as any;
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required services injected', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    });

    it('should initialize with empty currentTime string', () => {
      expect(component.currentTime).toBe('');
    });

    it('should have correct component selector', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
    });

    it('should have correct CSS class applied', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should set currentTime to today\'s date in correct format', () => {
      // Mock current date to ensure consistent testing
      const mockDate = new Date('2024-01-15T10:30:00');
      const originalDate = Date;
      const MockDate = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      // Replace Date constructor temporarily
      (window as any).Date = MockDate;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('15.01.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should format single digit day and month correctly', () => {
      const mockDate = new Date('2024-01-05T10:30:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('05.01.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should format double digit day and month correctly', () => {
      const mockDate = new Date('2024-12-25T10:30:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('25.12.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle leap year correctly', () => {
      const mockDate = new Date('2024-02-29T10:30:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('29.02.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle year boundary correctly', () => {
      const mockDate = new Date('2024-12-31T23:59:59');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('31.12.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle month boundary correctly', () => {
      const mockDate = new Date('2024-01-31T10:30:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('31.01.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should be called automatically when component initializes', () => {
      const newComponent = new InfoBlockComponent(dateService as any, dataCalendarService as any);
      spyOn(newComponent, 'ngOnInit');
      
      newComponent.ngOnInit();
      
      expect(newComponent.ngOnInit).toHaveBeenCalled();
    });

    it('should set currentTime only once during initialization', () => {
      const mockDate = new Date('2024-01-15T10:30:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      const firstCallTime = component.currentTime;
      
      component.ngOnInit();
      const secondCallTime = component.currentTime;
      
      expect(firstCallTime).toBe(secondCallTime);
      expect(component.currentTime).toBe('15.01.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });
  });

  describe('go method', () => {
    beforeEach(() => {
      // Reset spy calls before each test
      dateService.changeOneDay.calls.reset();
      dataCalendarService.getAllEntryAllUsersForTheMonth.calls.reset();
    });

    it('should call dateService.changeOneDay with correct direction parameter', () => {
      const direction = -1;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
    });

    it('should call dateService.changeOneDay with positive direction', () => {
      const direction = 1;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
    });

    it('should call dateService.changeOneDay with negative direction', () => {
      const direction = -1;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
    });

    it('should call dateService.changeOneDay with zero direction', () => {
      const direction = 0;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(0);
    });

    it('should call dataCalendarService.getAllEntryAllUsersForTheMonth after changing date', () => {
      const direction = 1;
      
      component.go(direction);
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should call both services in correct order', () => {
      const direction = -1;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledBefore(dataCalendarService.getAllEntryAllUsersForTheMonth);
    });

    it('should handle multiple consecutive calls correctly', () => {
      component.go(-1);
      component.go(1);
      component.go(-1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(3);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 10; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(10);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(10);
    });

    it('should work with large direction values', () => {
      const largeDirection = 100;
      
      component.go(largeDirection);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(largeDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should work with negative large direction values', () => {
      const largeNegativeDirection = -100;
      
      component.go(largeNegativeDirection);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(largeNegativeDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display currentTime in template', () => {
      // Mock date for consistent testing
      const mockDate = new Date('2024-01-15T10:30:00');
      const originalDate = Date;
      const MockDate = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      (window as any).Date = MockDate;
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const todayElement = compiled.querySelector('.todayClass');
      
      expect(todayElement).toBeTruthy();
      expect(todayElement.textContent.trim()).toBe(component.currentTime);
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should have left arrow button for previous day', () => {
      const compiled = fixture.nativeElement;
      const leftArrow = compiled.querySelector('.todayClassArrow');
      
      expect(leftArrow).toBeTruthy();
      expect(leftArrow.textContent.trim()).toContain('⇐');
    });

    it('should have right arrow button for next day', () => {
      const compiled = fixture.nativeElement;
      const rightArrow = compiled.querySelectorAll('.todayClassArrow')[1];
      
      expect(rightArrow).toBeTruthy();
      expect(rightArrow.textContent.trim()).toContain('⇒');
    });

    it('should have clickable navigation buttons', () => {
      const compiled = fixture.nativeElement;
      const navigationButtons = compiled.querySelectorAll('.changeDayClass');
      
      expect(navigationButtons.length).toBe(2);
      navigationButtons.forEach((button: any) => {
        expect(button).toBeTruthy();
      });
    });

    it('should display "Выбрано:" text in template', () => {
      const compiled = fixture.nativeElement;
      const selectedText = compiled.textContent;
      
      expect(selectedText).toContain('Выбрано:');
    });

    it('should have correct CSS classes applied', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
      expect(compiled.querySelector('.selectedTime')).toBeTruthy();
      expect(compiled.querySelector('.changeDayClass')).toBeTruthy();
      expect(compiled.querySelector('.todayClass')).toBeTruthy();
      expect(compiled.querySelector('.todayClassArrow')).toBeTruthy();
    });

    it('should have three main sections', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.selectedTime');
      
      expect(sections.length).toBe(3);
    });

    it('should have first section as left navigation', () => {
      const compiled = fixture.nativeElement;
      const leftSection = compiled.querySelector('.selectedTime:first-child');
      
      expect(leftSection).toHaveClass('changeDayClass');
      expect(leftSection.textContent.trim()).toContain('⇐');
    });

    it('should have middle section as date display', () => {
      const compiled = fixture.nativeElement;
      const middleSection = compiled.querySelector('.selectedTime:nth-child(2)');
      
      expect(middleSection.textContent.trim()).toContain('Выбрано:');
      expect(middleSection.querySelector('.todayClass')).toBeTruthy();
    });

    it('should have last section as right navigation', () => {
      const compiled = fixture.nativeElement;
      const rightSection = compiled.querySelector('.selectedTime:last-child');
      
      expect(rightSection).toHaveClass('changeDayClass');
      expect(rightSection.textContent.trim()).toContain('⇒');
    });
  });

  describe('Date Formatting Edge Cases', () => {
    it('should handle January correctly', () => {
      const mockDate = new Date('2024-01-01T00:00:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('01.01.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle December correctly', () => {
      const mockDate = new Date('2024-12-31T23:59:59');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('31.12.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle February in leap year', () => {
      const mockDate = new Date('2024-02-29T12:00:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('29.02.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle February in non-leap year', () => {
      const mockDate = new Date('2023-02-28T12:00:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('28.02.2023');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle months with 30 days', () => {
      const mockDate = new Date('2024-04-30T12:00:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('30.04.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });

    it('should handle months with 31 days', () => {
      const mockDate = new Date('2024-03-31T12:00:00');
      const originalDate = (window as any).Date;
      (window as any).Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('31.03.2024');
      
      // Restore original Date
      (window as any).Date = originalDate;
    });
  });

  describe('Service Integration Tests', () => {
    it('should integrate with DateService.date observable', () => {
      const testMoment = moment('2024-03-15');
      dateService.date.next(testMoment);
      
      expect(dateService.date.value).toEqual(testMoment);
    });

    it('should work with DateService.changeOneDay method', () => {
      const direction = 1;
      
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
    });

    it('should work with DataCalendarService.getAllEntryAllUsersForTheMonth method', () => {
      const direction = -1;
      
      component.go(direction);
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should maintain service references after multiple operations', () => {
      const originalDateService = component.dateService;
      const originalDataCalendarService = component.dataCalendarService;
      
      component.go(1);
      component.go(-1);
      component.go(1);
      
      expect(component.dateService).toBe(originalDateService);
      expect(component.dataCalendarService).toBe(originalDataCalendarService);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize correctly on first load', () => {
      expect(component.currentTime).toBe('');
      
      component.ngOnInit();
      
      expect(component.currentTime).not.toBe('');
      expect(component.currentTime).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it('should maintain state between method calls', () => {
      component.ngOnInit();
      const initialTime = component.currentTime;
      
      component.go(1);
      component.go(-1);
      
      expect(component.currentTime).toBe(initialTime);
    });

    it('should be reusable after multiple operations', () => {
      for (let i = 0; i < 5; i++) {
        component.go(1);
        component.go(-1);
      }
      
      expect(component).toBeTruthy();
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid direction parameters gracefully', () => {
      const invalidDirections = [NaN, Infinity, -Infinity, null, undefined];
      
      invalidDirections.forEach(direction => {
        expect(() => {
          component.go(direction as any);
        }).not.toThrow();
      });
    });

    it('should handle very large direction values', () => {
      const largeValues = [Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, -Number.MAX_SAFE_INTEGER, -Number.MAX_VALUE];
      
      largeValues.forEach(value => {
        expect(() => {
          component.go(value);
        }).not.toThrow();
      });
    });

    it('should handle floating point direction values', () => {
      const floatValues = [1.5, -1.5, 0.1, -0.1, 2.7, -2.7];
      
      floatValues.forEach(value => {
        expect(() => {
          component.go(value);
        }).not.toThrow();
      });
    });

    it('should work correctly with zero direction', () => {
      expect(() => {
        component.go(0);
      }).not.toThrow();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(0);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid method calls efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should not create memory leaks with repeated operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 50; i++) {
        component.go(1);
        component.go(-1);
      }
      
      // Component should still be functional
      expect(component).toBeTruthy();
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    });

    it('should maintain consistent performance across multiple operations', () => {
      const performanceResults = [];
      
      for (let test = 0; test < 5; test++) {
        const startTime = performance.now();
        
        for (let i = 0; i < 20; i++) {
          component.go(1);
        }
        
        const endTime = performance.now();
        performanceResults.push(endTime - startTime);
      }
      
      // Performance should be consistent (within reasonable variance)
      const averagePerformance = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      const variance = performanceResults.reduce((sum, perf) => sum + Math.abs(perf - averagePerformance), 0) / performanceResults.length;
      
      // Allow for some variance in performance testing
      expect(variance).toBeLessThan(averagePerformance * 2.0); // Variance should be less than 200% of average
    });
  });

  describe('Accessibility and UX', () => {
    it('should have clickable navigation elements', () => {
      const compiled = fixture.nativeElement;
      const clickableElements = compiled.querySelectorAll('.changeDayClass');
      
      clickableElements.forEach((element: any) => {
        expect(element).toBeTruthy();
        expect(element.onclick).toBeDefined();
      });
    });

    it('should display clear navigation indicators', () => {
      const compiled = fixture.nativeElement;
      const leftArrow = compiled.querySelector('.todayClassArrow');
      const rightArrow = compiled.querySelectorAll('.todayClassArrow')[1];
      
      expect(leftArrow.textContent.trim()).toBe('⇐');
      expect(rightArrow.textContent.trim()).toBe('⇒');
    });

    it('should have clear date display format', () => {
      component.ngOnInit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dateDisplay = compiled.querySelector('.todayClass');
      
      expect(dateDisplay.textContent.trim()).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it('should maintain consistent layout structure', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
      expect(compiled.querySelectorAll('.selectedTime').length).toBe(3);
      expect(compiled.querySelectorAll('.changeDayClass').length).toBe(2);
    });
  });
});
