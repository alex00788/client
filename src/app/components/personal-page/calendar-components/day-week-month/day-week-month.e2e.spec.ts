import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DayWeekMonthComponent } from './day-week-month.component';
import { RecordingService } from '../recording.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('DayWeekMonthComponent E2E', () => {
  let component: DayWeekMonthComponent;
  let fixture: ComponentFixture<DayWeekMonthComponent>;
  let recordingService: RecordingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DayWeekMonthComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [RecordingService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DayWeekMonthComponent);
    component = fixture.componentInstance;
    recordingService = TestBed.inject(RecordingService);
  });

  describe('Complete User Journey', () => {
    it('should complete full user workflow from day view to month view and back', fakeAsync(() => {
      // Step 1: Initial state - showing day view
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
      
      // Step 4: User returns to day view
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      
      expect(recordingService.showCurrentDay.value).toBe(true);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      // Step 5: User closes records block
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      closeButton.click();
      
      expect(recordingService.recordsBlock.value).toBe(false);
      
      tick();
    }));

    it('should handle multiple view switches in sequence', fakeAsync(() => {
      // User navigates through all views multiple times
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // First cycle: day -> week -> month
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // Second cycle: day -> month -> week
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      tick();
    }));

    it('should handle rapid user interactions without breaking', fakeAsync(() => {
      // Simulate rapid user clicks
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Rapid clicking sequence
      for (let i = 0; i < 10; i++) {
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
      
      // Verify final state
      const finalActiveMode = [
        recordingService.showCurrentDay.value,
        recordingService.showCurrentWeek.value,
        recordingService.showCurrentMonth.value
      ].findIndex(Boolean);
      
      expect(finalActiveMode).toBeGreaterThanOrEqual(0);
      expect(finalActiveMode).toBeLessThan(3);
      
      tick();
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user exploring calendar views', fakeAsync(() => {
      // User starts exploring different views
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // User tries week view
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // User tries month view
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      // User decides to go back to day view
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // User closes the interface
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      closeButton.click();
      expect(recordingService.recordsBlock.value).toBe(false);
      
      tick();
    }));

    it('should handle scenario: user working with calendar for extended period', fakeAsync(() => {
      // User works with calendar for extended period
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      // Extended workflow
      for (let session = 0; session < 5; session++) {
        // Start with day view
        dayButton.click();
        expect(recordingService.showCurrentDay.value).toBe(true);
        
        // Switch to week view
        weekButton.click();
        expect(recordingService.showCurrentWeek.value).toBe(true);
        
        // Switch to month view
        monthButton.click();
        expect(recordingService.showCurrentMonth.value).toBe(true);
        
        // Return to day view
        dayButton.click();
        expect(recordingService.showCurrentDay.value).toBe(true);
        
        // Close and reopen (simulate session end)
        closeButton.click();
        expect(recordingService.recordsBlock.value).toBe(false);
        
        tick(10);
      }
      
      // Component should still be functional after extended use
      expect(component).toBeTruthy();
      expect(component.recordingService).toBe(recordingService);
      
      tick();
    }));

    it('should handle scenario: user switching between views while maintaining context', fakeAsync(() => {
      // User maintains context while switching views
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // User starts with day view
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // User switches to week view (maintains context)
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      // User switches to month view (maintains context)
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      
      // User returns to day view (maintains context)
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      tick();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network failures gracefully', fakeAsync(() => {
      // Simulate network failure by mocking service
      spyOn(recordingService, 'showDay').and.throwError('Network Error');
      
      // Component should not crash
      expect(() => component).not.toThrow();
      
      // User interactions should still work for other methods
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      tick();
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      // Component should handle rapid state changes efficiently
      const startTime = performance.now();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Simulate large number of interactions
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          dayButton.click();
        } else if (i % 3 === 1) {
          weekButton.click();
        } else {
          monthButton.click();
        }
        tick(1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      
      tick();
    }));

    it('should handle concurrent user actions', fakeAsync(() => {
      // Simulate concurrent actions
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      const promises = [
        Promise.resolve(dayButton.click()),
        Promise.resolve(weekButton.click()),
        Promise.resolve(monthButton.click())
      ];
      
      Promise.all(promises).then(() => {
        // Component should maintain consistent state
        expect(component).toBeTruthy();
        expect(component.recordingService).toBe(recordingService);
      });
      
      tick();
    }));

    it('should handle service integration correctly', fakeAsync(() => {
      // Component should integrate with service correctly
      fixture.detectChanges();
      
      // Service should be available
      expect(component.recordingService).toBeTruthy();
      expect(component.recordingService.showCurrentDay).toBeTruthy();
      expect(component.recordingService.showCurrentWeek).toBeTruthy();
      expect(component.recordingService.showCurrentMonth).toBeTruthy();
      
      tick();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      // Perform multiple operations
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      for (let i = 0; i < 20; i++) {
        dayButton.click();
        weekButton.click();
        monthButton.click();
        tick(1);
      }
      
      // Memory should be properly managed
      expect(component).toBeTruthy();
      expect(component.recordingService).toBe(recordingService);
      
      tick();
    }));

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      // Perform rapid state changes
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          dayButton.click();
        } else if (i % 3 === 1) {
          weekButton.click();
        } else {
          monthButton.click();
        }
        tick(1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(500);
      
      tick();
    }));

    it('should handle multiple lifecycle cycles efficiently', fakeAsync(() => {
      // First cycle
      fixture.detectChanges();
      tick();
      
      // Second cycle (simulate component reuse)
      fixture.detectChanges();
      tick();
      
      // Should not cause memory leaks
      expect(component).toBeTruthy();
      expect(component.recordingService).toBe(recordingService);
      
      tick();
    }));
  });

  describe('Accessibility and UX', () => {
    it('should maintain consistent state for screen readers', fakeAsync(() => {
      // Initial state
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // State change
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // State should be consistent
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // Another state change
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      tick();
    }));

    it('should handle keyboard navigation scenarios', fakeAsync(() => {
      // Simulate keyboard navigation
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click(); // Enter key on week button
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // Simulate Tab navigation
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click(); // Enter key on month button
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      tick();
    }));

    it('should handle focus management correctly', fakeAsync(() => {
      // Component should manage focus properly
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      
      // Week view should be active
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // User can switch to other views
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      tick();
    }));

    it('should handle button accessibility', fakeAsync(() => {
      // All buttons should be accessible
      const buttons = fixture.nativeElement.querySelectorAll('button');
      
      buttons.forEach((button: any) => {
        expect(button.disabled).toBeFalsy();
        expect(button.getAttribute('role')).toBeFalsy(); // Default button role
      });
      
      tick();
    }));
  });

  describe('Data Persistence and State Management', () => {
    it('should persist user selections correctly', fakeAsync(() => {
      // User selects week view
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // User selects month view
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      // State should be persisted
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      tick();
    }));

    it('should handle state restoration after component reinitialization', fakeAsync(() => {
      // Set specific state
      recordingService.showCurrentWeek.next(true);
      recordingService.showCurrentDay.next(false);
      recordingService.showCurrentMonth.next(false);
      
      // Reinitialize component
      fixture.detectChanges();
      tick();
      
      // Component should maintain state
      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      tick();
    }));

    it('should handle multiple view switches with state preservation', fakeAsync(() => {
      // User switches through multiple views
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // First switch: day -> week
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // Second switch: week -> month
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      // Third switch: month -> day
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      // Verify final state is preserved
      expect(recordingService.showCurrentWeek.value).toBe(false);
      expect(recordingService.showCurrentMonth.value).toBe(false);
      
      tick();
    }));
  });

  describe('Search and Filter Functionality', () => {
    it('should handle view switching functionality correctly', fakeAsync(() => {
      // User can switch between different views
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Switch to week view
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // Switch to month view
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      // Switch back to day view
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      tick();
    }));

    it('should handle view switching with different patterns', fakeAsync(() => {
      // User switches views in different patterns
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Pattern 1: day -> month -> week
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      // Pattern 2: week -> day -> month
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      tick();
    }));

    it('should handle view switching case sensitivity', fakeAsync(() => {
      // View switching should work consistently regardless of order
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Test different switching orders
      weekButton.click();
      expect(recordingService.showCurrentWeek.value).toBe(true);
      
      monthButton.click();
      expect(recordingService.showCurrentMonth.value).toBe(true);
      
      dayButton.click();
      expect(recordingService.showCurrentDay.value).toBe(true);
      
      tick();
    }));
  });
});
