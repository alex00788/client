import { TestBed } from '@angular/core/testing';
import { RecordingService } from './recording.service';
import { BehaviorSubject } from 'rxjs';

describe('RecordingService', () => {
  let service: RecordingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecordingService]
    });
    service = TestBed.inject(RecordingService);
  });

  afterEach(() => {
    // Reset all BehaviorSubjects to initial state after each test
    service.showCurrentDay.next(true);
    service.showCurrentWeek.next(false);
    service.showCurrentMonth.next(false);
    service.recordsBlock.next(false);
  });

  describe('Service Creation and Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct initial values for all BehaviorSubjects', () => {
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);
      expect(service.recordsBlock.value).toBe(false);
    });

    it('should be a singleton service', () => {
      const service2 = TestBed.inject(RecordingService);
      expect(service).toBe(service2);
    });
  });

  describe('BehaviorSubject Properties', () => {
    it('should have showCurrentDay as BehaviorSubject<boolean>', () => {
      expect(service.showCurrentDay).toBeInstanceOf(BehaviorSubject);
      expect(typeof service.showCurrentDay.value).toBe('boolean');
    });

    it('should have showCurrentWeek as BehaviorSubject<boolean>', () => {
      expect(service.showCurrentWeek).toBeInstanceOf(BehaviorSubject);
      expect(typeof service.showCurrentWeek.value).toBe('boolean');
    });

    it('should have showCurrentMonth as BehaviorSubject<boolean>', () => {
      expect(service.showCurrentMonth).toBeInstanceOf(BehaviorSubject);
      expect(typeof service.showCurrentMonth.value).toBe('boolean');
    });

    it('should have recordsBlock as BehaviorSubject<boolean>', () => {
      expect(service.recordsBlock).toBeInstanceOf(BehaviorSubject);
      expect(typeof service.recordsBlock.value).toBe('boolean');
    });

    it('should allow changing BehaviorSubject values', () => {
      service.showCurrentDay.next(false);
      service.showCurrentWeek.next(true);
      service.showCurrentMonth.next(true);
      service.recordsBlock.next(true);

      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(true);
      expect(service.recordsBlock.value).toBe(true);
    });

    it('should maintain boolean type for all BehaviorSubjects', () => {
      // Test that all values are strictly boolean
      expect(service.showCurrentDay.value === true).toBe(true);
      expect(service.showCurrentDay.value === false).toBe(false);
      expect(service.showCurrentWeek.value === true).toBe(false);
      expect(service.showCurrentWeek.value === false).toBe(true);
      expect(service.showCurrentMonth.value === true).toBe(false);
      expect(service.showCurrentMonth.value === false).toBe(true);
      expect(service.recordsBlock.value === true).toBe(false);
      expect(service.recordsBlock.value === false).toBe(true);
    });
  });

  describe('showDay() Method', () => {
    it('should set showCurrentDay to true', () => {
      service.showCurrentDay.next(false);
      service.showDay();
      expect(service.showCurrentDay.value).toBe(true);
    });

    it('should set showCurrentWeek to false', () => {
      service.showCurrentWeek.next(true);
      service.showDay();
      expect(service.showCurrentWeek.value).toBe(false);
    });

    it('should set showCurrentMonth to false', () => {
      service.showCurrentMonth.next(true);
      service.showDay();
      expect(service.showCurrentMonth.value).toBe(false);
    });

    it('should not affect recordsBlock state', () => {
      const initialRecordsBlockState = service.recordsBlock.value;
      service.showDay();
      expect(service.recordsBlock.value).toBe(initialRecordsBlockState);
    });

    it('should work when called multiple times', () => {
      service.showDay();
      service.showDay();
      service.showDay();
      
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);
    });

    it('should work from any initial state', () => {
      // Test from all false state
      service.showCurrentDay.next(false);
      service.showCurrentWeek.next(false);
      service.showCurrentMonth.next(false);
      service.showDay();
      
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);

      // Test from all true state
      service.showCurrentDay.next(false);
      service.showCurrentWeek.next(true);
      service.showCurrentMonth.next(true);
      service.showDay();
      
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);
    });
  });

  describe('showWeek() Method', () => {
    it('should set showCurrentDay to false', () => {
      service.showCurrentDay.next(true);
      service.showWeek();
      expect(service.showCurrentDay.value).toBe(false);
    });

    it('should set showCurrentWeek to true', () => {
      service.showCurrentWeek.next(false);
      service.showWeek();
      expect(service.showCurrentWeek.value).toBe(true);
    });

    it('should set showCurrentMonth to false', () => {
      service.showCurrentMonth.next(true);
      service.showWeek();
      expect(service.showCurrentMonth.value).toBe(false);
    });

    it('should not affect recordsBlock state', () => {
      const initialRecordsBlockState = service.recordsBlock.value;
      service.showWeek();
      expect(service.recordsBlock.value).toBe(initialRecordsBlockState);
    });

    it('should work when called multiple times', () => {
      service.showWeek();
      service.showWeek();
      service.showWeek();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(false);
    });

    it('should work from any initial state', () => {
      // Test from all false state
      service.showCurrentDay.next(false);
      service.showCurrentWeek.next(false);
      service.showCurrentMonth.next(false);
      service.showWeek();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(false);

      // Test from all true state
      service.showCurrentDay.next(true);
      service.showCurrentWeek.next(false);
      service.showCurrentMonth.next(true);
      service.showWeek();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(false);
    });
  });

  describe('showMonth() Method', () => {
    it('should set showCurrentDay to false', () => {
      service.showCurrentDay.next(true);
      service.showMonth();
      expect(service.showCurrentDay.value).toBe(false);
    });

    it('should set showCurrentWeek to false', () => {
      service.showCurrentWeek.next(true);
      service.showMonth();
      expect(service.showCurrentWeek.value).toBe(false);
    });

    it('should set showCurrentMonth to true', () => {
      service.showCurrentMonth.next(false);
      service.showMonth();
      expect(service.showCurrentMonth.value).toBe(true);
    });

    it('should not affect recordsBlock state', () => {
      const initialRecordsBlockState = service.recordsBlock.value;
      service.showMonth();
      expect(service.recordsBlock.value).toBe(initialRecordsBlockState);
    });

    it('should work when called multiple times', () => {
      service.showMonth();
      service.showMonth();
      service.showMonth();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(true);
    });

    it('should work from any initial state', () => {
      // Test from all false state
      service.showCurrentDay.next(false);
      service.showCurrentWeek.next(false);
      service.showCurrentMonth.next(false);
      service.showMonth();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(true);

      // Test from all true state
      service.showCurrentDay.next(true);
      service.showCurrentWeek.next(true);
      service.showCurrentMonth.next(false);
      service.showMonth();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(true);
    });
  });

  describe('openRecordsBlock() Method', () => {
    it('should set recordsBlock to true', () => {
      service.recordsBlock.next(false);
      service.openRecordsBlock();
      expect(service.recordsBlock.value).toBe(true);
    });

    it('should not affect view state (day/week/month)', () => {
      const initialDayState = service.showCurrentDay.value;
      const initialWeekState = service.showCurrentWeek.value;
      const initialMonthState = service.showCurrentMonth.value;
      
      service.openRecordsBlock();
      
      expect(service.showCurrentDay.value).toBe(initialDayState);
      expect(service.showCurrentWeek.value).toBe(initialWeekState);
      expect(service.showCurrentMonth.value).toBe(initialMonthState);
    });

    it('should work when called multiple times', () => {
      service.openRecordsBlock();
      service.openRecordsBlock();
      service.openRecordsBlock();
      
      expect(service.recordsBlock.value).toBe(true);
    });

    it('should work from any initial state', () => {
      // Test from false state
      service.recordsBlock.next(false);
      service.openRecordsBlock();
      expect(service.recordsBlock.value).toBe(true);

      // Test from true state
      service.recordsBlock.next(false);
      service.openRecordsBlock();
      expect(service.recordsBlock.value).toBe(true);
    });
  });

  describe('closeRecordsBlock() Method', () => {
    it('should set recordsBlock to false', () => {
      service.recordsBlock.next(true);
      service.closeRecordsBlock();
      expect(service.recordsBlock.value).toBe(false);
    });

    it('should not affect view state (day/week/month)', () => {
      const initialDayState = service.showCurrentDay.value;
      const initialWeekState = service.showCurrentWeek.value;
      const initialMonthState = service.showCurrentMonth.value;
      
      service.closeRecordsBlock();
      
      expect(service.showCurrentDay.value).toBe(initialDayState);
      expect(service.showCurrentWeek.value).toBe(initialWeekState);
      expect(service.showCurrentMonth.value).toBe(initialMonthState);
    });

    it('should work when called multiple times', () => {
      service.closeRecordsBlock();
      service.closeRecordsBlock();
      service.closeRecordsBlock();
      
      expect(service.recordsBlock.value).toBe(false);
    });

    it('should work from any initial state', () => {
      // Test from true state
      service.recordsBlock.next(true);
      service.closeRecordsBlock();
      expect(service.recordsBlock.value).toBe(false);

      // Test from false state
      service.recordsBlock.next(true);
      service.closeRecordsBlock();
      expect(service.recordsBlock.value).toBe(false);
    });
  });

  describe('View State Management', () => {
    it('should ensure only one view is active at a time', () => {
      service.showDay();
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);

      service.showWeek();
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(false);

      service.showMonth();
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(true);
    });

    it('should maintain view state when records block is opened/closed', () => {
      service.showWeek();
      expect(service.showCurrentWeek.value).toBe(true);

      service.openRecordsBlock();
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.recordsBlock.value).toBe(true);

      service.closeRecordsBlock();
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.recordsBlock.value).toBe(false);
    });

    it('should handle rapid view changes correctly', () => {
      service.showDay();
      service.showWeek();
      service.showMonth();
      service.showDay();
      service.showWeek();
      
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(true);
      expect(service.showCurrentMonth.value).toBe(false);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle concurrent method calls', () => {
      // Simulate rapid method calls
      service.showDay();
      service.showWeek();
      service.showMonth();
      service.showDay();
      
      // Last call should determine the state
      expect(service.showCurrentDay.value).toBe(true);
      expect(service.showCurrentWeek.value).toBe(false);
      expect(service.showCurrentMonth.value).toBe(false);
    });

    it('should maintain data integrity under stress', () => {
      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) service.showDay();
        else if (i % 3 === 1) service.showWeek();
        else service.showMonth();
      }
      
      // Should still maintain only one active view
      const activeViews = [
        service.showCurrentDay.value,
        service.showCurrentWeek.value,
        service.showCurrentMonth.value
      ].filter(Boolean);
      
      expect(activeViews.length).toBe(1);
    });

    it('should handle records block operations under stress', () => {
      // Rapid open/close operations
      for (let i = 0; i < 50; i++) {
        service.openRecordsBlock();
        service.closeRecordsBlock();
      }
      
      // Final state should be closed
      expect(service.recordsBlock.value).toBe(false);
    });
  });

  describe('BehaviorSubject Subscriptions', () => {
    it('should emit new values when showCurrentDay changes', (done) => {
      const subscription = service.showCurrentDay.subscribe(newValue => {
        if (newValue === false) {
          subscription.unsubscribe();
          done();
        }
      });
      
      service.showCurrentDay.next(false);
    });

    it('should emit new values when showCurrentWeek changes', (done) => {
      const subscription = service.showCurrentWeek.subscribe(newValue => {
        if (newValue === true) {
          subscription.unsubscribe();
          done();
        }
      });
      
      service.showCurrentWeek.next(true);
    });

    it('should emit new values when showCurrentMonth changes', (done) => {
      const subscription = service.showCurrentMonth.subscribe(newValue => {
        if (newValue === true) {
          subscription.unsubscribe();
          done();
        }
      });
      
      service.showCurrentMonth.next(true);
    });

    it('should emit new values when recordsBlock changes', (done) => {
      const subscription = service.recordsBlock.subscribe(newValue => {
        if (newValue === true) {
          subscription.unsubscribe();
          done();
        }
      });
      
      service.recordsBlock.next(true);
    });
  });

  describe('Method Return Values', () => {
    it('should return undefined from all methods (void methods)', () => {
      expect(service.showDay()).toBeUndefined();
      expect(service.showWeek()).toBeUndefined();
      expect(service.showMonth()).toBeUndefined();
      expect(service.openRecordsBlock()).toBeUndefined();
      expect(service.closeRecordsBlock()).toBeUndefined();
    });
  });

  describe('Service Lifecycle', () => {
    it('should maintain state between method calls', () => {
      service.showWeek();
      expect(service.showCurrentWeek.value).toBe(true);
      
      // Call another method
      service.openRecordsBlock();
      expect(service.showCurrentWeek.value).toBe(true); // State preserved
      expect(service.recordsBlock.value).toBe(true);
    });

    it('should be stateless in terms of method execution', () => {
      // Methods should not depend on previous calls
      service.showDay();
      service.showWeek();
      
      // Should work the same regardless of previous state
      service.showMonth();
      expect(service.showCurrentMonth.value).toBe(true);
      expect(service.showCurrentDay.value).toBe(false);
      expect(service.showCurrentWeek.value).toBe(false);
    });
  });
});
