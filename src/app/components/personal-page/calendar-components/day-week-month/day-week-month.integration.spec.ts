import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DayWeekMonthComponent } from './day-week-month.component';
import { RecordingService } from '../recording.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

describe('DayWeekMonthComponent Integration Tests', () => {
  let component: DayWeekMonthComponent;
  let fixture: ComponentFixture<DayWeekMonthComponent>;
  let recordingService: RecordingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayWeekMonthComponent],
      providers: [RecordingService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DayWeekMonthComponent);
    component = fixture.componentInstance;
    recordingService = TestBed.inject(RecordingService);
  });

  describe('Real Service Integration', () => {
    it('should integrate with real RecordingService', () => {
      expect(component.recordingService).toBe(recordingService);
      expect(component.recordingService).toBeInstanceOf(RecordingService);
    });

    it('should have access to real BehaviorSubjects', () => {
      expect(component.recordingService.showCurrentDay).toBeInstanceOf(BehaviorSubject);
      expect(component.recordingService.showCurrentWeek).toBeInstanceOf(BehaviorSubject);
      expect(component.recordingService.showCurrentMonth).toBeInstanceOf(BehaviorSubject);
      expect(component.recordingService.recordsBlock).toBeInstanceOf(BehaviorSubject);
    });

    it('should call real showDay method', () => {
      spyOn(recordingService, 'showDay');
      
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      
      expect(recordingService.showDay).toHaveBeenCalled();
    });

    it('should call real showWeek method', () => {
      spyOn(recordingService, 'showWeek');
      
      fixture.detectChanges();
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      
      expect(recordingService.showWeek).toHaveBeenCalled();
    });

    it('should call real showMonth method', () => {
      spyOn(recordingService, 'showMonth');
      
      fixture.detectChanges();
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click();
      
      expect(recordingService.showMonth).toHaveBeenCalled();
    });

    it('should call real closeRecordsBlock method', () => {
      spyOn(recordingService, 'closeRecordsBlock');
      
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      closeButton.click();
      
      expect(recordingService.closeRecordsBlock).toHaveBeenCalled();
    });
  });

  describe('Real BehaviorSubject Integration', () => {
    it('should react to real showCurrentDay changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially day is selected
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      
      let dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to week
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      tick();
      
      dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));

    it('should react to real showCurrentWeek changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially week is selected
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      
      let weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to month
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(true);
      recordingService.showCurrentDay.next(false);
      fixture.detectChanges();
      tick();
      
      weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));

    it('should react to real showCurrentMonth changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially month is selected
      recordingService.showCurrentMonth.next(true);
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(false);
      fixture.detectChanges();
      
      let monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to day
      recordingService.showCurrentMonth.next(false);
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      fixture.detectChanges();
      tick();
      
      monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));
  });

  describe('Real Service Method Behavior', () => {
    it('should actually change BehaviorSubject values when showDay is called', () => {
      // Set initial state
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentMonth.next(false);
      
      // Call showDay
      recordingService.showDay();
      
      // Verify state changes
      expect(recordingService.showCurrentDay.value).toBe(true);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
    });

    it('should actually change BehaviorSubject values when showWeek is called', () => {
      // Set initial state
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      
      // Call showWeek
      recordingService.showWeek();
      
      // Verify state changes
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentMonth.value).toBe(false);
    });

    it('should actually change BehaviorSubject values when showMonth is called', () => {
      // Set initial state
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      
      // Call showMonth
      recordingService.showMonth();
      
      // Verify state changes
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(true);
    });

    it('should actually change BehaviorSubject values when closeRecordsBlock is called', () => {
      // Set initial state
      recordingService.recordsBlock.next(true);
      
      // Call closeRecordsBlock
      recordingService.closeRecordsBlock();
      
      // Verify state changes
      expect(recordingService.recordsBlock.value).toBe(false);
    });
  });

  describe('Full User Workflow Integration', () => {
    it('should handle complete user workflow: day -> week -> month -> close', fakeAsync(() => {
      fixture.detectChanges();
      
      // Step 1: User clicks day button
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      
      expect(recordingService.showCurrentDay.value).toBe(true);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      // Step 2: User clicks week button
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      // Step 3: User clicks month button
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click();
      
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      // Step 4: User clicks close button
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      closeButton.click();
      
      expect(recordingService.recordsBlock.value).toBe(false);
      
      tick();
    }));

    it('should handle rapid user interactions with real service', fakeAsync(() => {
      fixture.detectChanges();
      
      // Rapid clicking on different buttons
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Click sequence: day -> week -> month -> day -> week
      dayButton.click();
      weekButton.click();
      monthButton.click();
      dayButton.click();
      weekButton.click();
      
      // Verify final state
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      tick();
    }));

    it('should maintain consistent state during rapid interactions', fakeAsync(() => {
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Simulate rapid user interactions
      for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) {
          dayButton.click();
        } else if (i % 3 === 1) {
          weekButton.click();
        } else {
          monthButton.click();
        }
        tick(1);
      }
      
      // Component should maintain consistent state
      expect(component).toBeTruthy();
      expect(component.recordingService).toBe(recordingService);
      
      // Only one mode should be active
      const activeModes = [
        recordingService.showCurrentDay.value,
        recordingService.showCurrentWeek.value,
        recordingService.showCurrentMonth.value
      ].filter(Boolean);
      
      expect(activeModes.length).toBe(1);
      
      tick();
    }));
  });

  describe('Real Template Updates', () => {
    it('should update template when service state changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially day is selected
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      
      let dayButton = fixture.nativeElement.querySelector('button:first-child');
      let weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      let monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      
      // Change to week
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      tick();
      
      dayButton = fixture.nativeElement.querySelector('button:first-child');
      weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      
      // Change to month
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(true);
      fixture.detectChanges();
      tick();
      
      dayButton = fixture.nativeElement.querySelector('button:first-child');
      weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
    }));

    it('should handle multiple template updates efficiently', fakeAsync(() => {
      fixture.detectChanges();
      
      const startTime = performance.now();
      
      // Multiple template updates
      for (let i = 0; i < 30; i++) {
        recordingService.showCurrentDay.next(i % 3 === 0);
        recordingService.showCurrentWeek.next(i % 3 === 1);
        recordingService.showCurrentMonth.next(i % 3 === 2);
        fixture.detectChanges();
        tick(1);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle 30 updates efficiently
      expect(totalTime).toBeLessThan(1000);
      
      // Verify final state
      expect(component).toBeTruthy();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(4);
    }));
  });

  describe('Service State Persistence', () => {
    it('should maintain service state across component re-renders', fakeAsync(() => {
      fixture.detectChanges();
      
      // Set specific state
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentMonth.next(false);
      recordingService.recordsBlock.next(true);
      
      // Re-render component
      fixture.detectChanges();
      tick();
      
      // State should be preserved
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      expect(recordingService.recordsBlock.value).toBe(true);
    }));

    it('should handle service state changes from external sources', fakeAsync(() => {
      fixture.detectChanges();
      
      // External state change
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      tick();
      
      // Template should reflect external changes
      let dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Another external change
      recordingService.showCurrentMonth.next(true);
      recordingService.showCurrentDay.next(false);
      fixture.detectChanges();
      tick();
      
      dayButton = fixture.nativeElement.querySelector('button:first-child');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
    }));
  });

  describe('Error Handling Integration', () => {
    it('should handle service integration correctly', () => {
      fixture.detectChanges();
      
      // Component should work with real service
      expect(component.recordingService).toBeTruthy();
      expect(component.recordingService.showCurrentDay).toBeTruthy();
      expect(component.recordingService.showCurrentWeek).toBeTruthy();
      expect(component.recordingService.showCurrentMonth).toBeTruthy();
    });

    it('should maintain component stability', () => {
      fixture.detectChanges();
      
      // Component should remain stable
      expect(component).toBeTruthy();
      
      // All buttons should be functional
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(4);
      
      buttons.forEach((button: any) => {
        expect(button).toBeTruthy();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle high frequency service calls efficiently', fakeAsync(() => {
      fixture.detectChanges();
      
      const startTime = performance.now();
      
      // High frequency service calls
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          recordingService.showDay();
        } else if (i % 3 === 1) {
          recordingService.showWeek();
        } else {
          recordingService.showMonth();
        }
        tick(1);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle 100 service calls efficiently
      expect(totalTime).toBeLessThan(500);
    }));

    it('should maintain performance with large number of template updates', fakeAsync(() => {
      fixture.detectChanges();
      
      const startTime = performance.now();
      
      // Large number of template updates
      for (let i = 0; i < 200; i++) {
        recordingService.showCurrentDay.next(i % 2 === 0);
        recordingService.showCurrentWeek.next(i % 3 === 0);
        recordingService.showCurrentMonth.next(i % 4 === 0);
        fixture.detectChanges();
        tick(1);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle 200 updates efficiently
      expect(totalTime).toBeLessThan(1000);
      
      // Component should still be functional
      expect(component).toBeTruthy();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(4);
    }));
  });

  describe('Real-world Scenarios Integration', () => {
    it('should handle typical calendar navigation workflow', fakeAsync(() => {
      fixture.detectChanges();
      
      // User starts with day view
      recordingService.showCurrentDay.next(true);
      recordingService.showCurrentWeek.next(false);
      recordingService.showCurrentMonth.next(false);
      fixture.detectChanges();
      
      let dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // User switches to week view
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      // User switches to month view
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click();
      
      expect(recordingService.showCurrentMonth.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      
      // User closes records block
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      closeButton.click();
      
      expect(recordingService.recordsBlock.value).toBe(false);
      
      tick();
    }));

    it('should handle rapid user navigation between views', fakeAsync(() => {
      fixture.detectChanges();
      
      // Rapid navigation
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Click sequence: day -> week -> month -> day -> week -> month
      dayButton.click();
      weekButton.click();
      monthButton.click();
      dayButton.click();
      weekButton.click();
      monthButton.click();
      
      // Verify final state
      expect(recordingService.showCurrentMonth.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      
      tick();
    }));

    it('should handle concurrent user interactions', fakeAsync(() => {
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Simulate concurrent interactions
      const promises = [
        Promise.resolve(dayButton.click()),
        Promise.resolve(weekButton.click()),
        Promise.resolve(monthButton.click())
      ];
      
      Promise.all(promises).then(() => {
        // Final state should be month (last clicked)
        expect(recordingService.showCurrentMonth.value).toBe(true);
        expect(recordingService.showCurrentDay.value).toBe(false);
        expect(recordingService.showCurrentWeek.value).toBe(false);
      });
      
      tick();
    }));
  });
});
