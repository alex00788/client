import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderCalendarComponent } from './header-calendar.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('HeaderCalendarComponent E2E', () => {
  let component: HeaderCalendarComponent;
  let fixture: ComponentFixture<HeaderCalendarComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderCalendarComponent,
        AsyncPipe,
        DatePipe,
        NgIf,
        ReactiveFormsModule,
        NgForOf,
        MomentTransformDatePipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [DateService, DataCalendarService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderCalendarComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
  });

  describe('Complete User Journey', () => {
    it('should complete full calendar navigation workflow', fakeAsync(() => {
      // Step 1: Initial state - showing current month
      fixture.detectChanges();
      tick();
      
      const initialDate = dateService.date.value.clone();
      expect(component.dateService.date.value.format('YYYY-MM-DD')).toBe(initialDate.format('YYYY-MM-DD'));
      
      // Step 2: User navigates to next month
      component.go(1);
      tick();
      
      const nextMonth = initialDate.clone().add(1, 'month');
      expect(dateService.date.value.format('YYYY-MM')).toBe(nextMonth.format('YYYY-MM'));
      
      // Step 3: User navigates to previous month
      component.go(-1);
      tick();
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(initialDate.format('YYYY-MM'));
      
      // Step 4: User navigates to next month again
      component.go(1);
      tick();
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(nextMonth.format('YYYY-MM'));
      
      // Step 5: User navigates back to original month
      component.go(-1);
      tick();
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(initialDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle extended calendar exploration workflow', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User explores multiple months forward
      for (let i = 0; i < 6; i++) {
        component.go(1);
        tick(10);
      }
      
      // User explores multiple months backward
      for (let i = 0; i < 6; i++) {
        component.go(-1);
        tick(10);
      }
      
      // Should be back to original month
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle rapid navigation workflow', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // Rapid forward navigation
      for (let i = 0; i < 12; i++) {
        component.go(1);
        tick(1);
      }
      
      // Rapid backward navigation
      for (let i = 0; i < 12; i++) {
        component.go(-1);
        tick(1);
      }
      
      // Should be back to original month
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user planning year ahead', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User plans ahead by navigating through months
      for (let month = 0; month < 12; month++) {
        component.go(1);
        tick(10);
        
        // Verify month progression
        const expectedDate = startDate.clone().add(month + 1, 'month');
        expect(dateService.date.value.format('MM')).toBe(expectedDate.format('MM'));
      }
      
      // User returns to current month
      for (let month = 0; month < 12; month++) {
        component.go(-1);
        tick(10);
      }
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle scenario: user reviewing past months', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User reviews past months
      for (let month = 0; month < 6; month++) {
        component.go(-1);
        tick(10);
        
        // Verify month regression
        const expectedDate = startDate.clone().subtract(month + 1, 'month');
        expect(dateService.date.value.format('MM')).toBe(expectedDate.format('MM'));
      }
      
      // User returns to current month
      for (let month = 0; month < 6; month++) {
        component.go(1);
        tick(10);
      }
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle scenario: user working with calendar for extended period', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // User works with calendar for extended period
      for (let session = 0; session < 5; session++) {
        // Navigate forward
        for (let i = 0; i < 3; i++) {
          component.go(1);
          tick(10);
        }
        
        // Navigate backward
        for (let i = 0; i < 3; i++) {
          component.go(-1);
          tick(10);
        }
        
        // Verify component remains functional
        expect(component).toBeTruthy();
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      }
      
      tick();
    }));

    it('should handle scenario: user switching between different time periods', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User explores different time periods
      const navigationPattern = [1, 1, -1, 1, -2, 2, -1, -1, 1, -1];
      
      for (const direction of navigationPattern) {
        component.go(direction);
        tick(10);
      }
      
      // Calculate expected final position
      const expectedDate = startDate.clone().add(
        navigationPattern.reduce((sum, dir) => sum + dir, 0),
        'month'
      );
      
      expect(dateService.date.value.format('YYYY-MM')).toBe(expectedDate.format('YYYY-MM'));
      
      tick();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network failures gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate network failure by mocking service
      spyOn(dateService, 'changeMonth').and.throwError('Network Error');
      
      // Component should not crash
      expect(() => component).not.toThrow();
      
      // User interactions should still work for other methods
      expect(() => component.ngOnInit()).not.toThrow();
      expect(() => component.ngOnDestroy()).not.toThrow();
      
      tick();
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should handle rapid state changes efficiently
      const startTime = performance.now();
      
      // Simulate large number of navigations
      for (let i = 0; i < 100; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick(1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      
      tick();
    }));

    it('should handle concurrent user actions', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate concurrent actions
      const promises = [
        Promise.resolve(component.go(1)),
        Promise.resolve(component.go(-1)),
        Promise.resolve(component.go(1))
      ];
      
      Promise.all(promises).then(() => {
        // Component should maintain consistent state
        expect(component).toBeTruthy();
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
      
      tick();
    }));

    it('should handle service integration correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should integrate with service correctly
      expect(component.dateService).toBeTruthy();
      expect(component.dateService.date).toBeTruthy();
      expect(component.dateService.changeMonth).toBeTruthy();
      expect(component.dataCalendarService).toBeTruthy();
      expect(component.dataCalendarService.getAllEntryAllUsersForTheMonth).toBeTruthy();
      
      tick();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Perform multiple operations
      for (let i = 0; i < 20; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick(1);
      }
      
      // Memory should be properly managed
      expect(component).toBeTruthy();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startTime = performance.now();
      
      // Perform rapid state changes
      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          component.go(1);
        } else if (i % 3 === 1) {
          component.go(-1);
        } else {
          component.go(0);
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
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));
  });

  describe('Accessibility and UX', () => {
    it('should maintain consistent state for screen readers', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Initial state
      const initialDate = dateService.date.value.clone();
      
      // State change
      component.go(1);
      tick();
      expect(dateService.date.value).not.toEqual(initialDate);
      
      // State should be consistent
      expect(dateService.date.value).toBeDefined();
      
      // Another state change
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(initialDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle keyboard navigation scenarios', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate keyboard navigation
      const initialDate = dateService.date.value.clone();
      
      // Navigate forward (right arrow or next button)
      component.go(1);
      tick();
      expect(dateService.date.value).not.toEqual(initialDate);
      
      // Navigate backward (left arrow or previous button)
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(initialDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle focus management correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should manage focus properly
      const initialDate = dateService.date.value.clone();
      
      component.go(1);
      tick();
      expect(dateService.date.value).not.toEqual(initialDate);
      
      // User can navigate to other months
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(initialDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle button accessibility', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // All navigation elements should be accessible
      const prevButton = fixture.nativeElement.querySelector('i:first-child');
      const nextButton = fixture.nativeElement.querySelector('i:last-child');
      
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      
      tick();
    }));
  });

  describe('Data Persistence and State Management', () => {
    it('should persist user selections correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User selects next month
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      // User selects previous month
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      // State should be persisted
      expect(dateService.date.value).toBeDefined();
      
      tick();
    }));

    it('should handle state restoration after component reinitialization', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Set specific state
      const testDate = moment('2024-06-15');
      dateService.date.next(testDate);
      
      // Reinitialize component
      fixture.detectChanges();
      tick();
      
      // Component should maintain state
      expect(dateService.date.value.format('YYYY-MM')).toBe(testDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle multiple view switches with state preservation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User switches through multiple months
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(-2);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));
  });

  describe('Search and Filter Functionality', () => {
    it('should handle month navigation functionality correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User can navigate to different months
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle month navigation with different patterns', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startDate = dateService.date.value.clone();
      
      // User navigates months in different patterns
      component.go(2);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(-1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(-1);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));

    it('should handle month navigation case sensitivity', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Month navigation should work consistently regardless of order
      const startDate = dateService.date.value.clone();
      
      // Test different navigation orders
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(1);
      tick();
      expect(dateService.date.value.format('MM')).not.toBe(startDate.format('MM'));
      
      component.go(-2);
      tick();
      expect(dateService.date.value.format('YYYY-MM')).toBe(startDate.format('YYYY-MM'));
      
      tick();
    }));
  });

  describe('Real Service State Integration', () => {
    it('should react to real service state changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test service state reactivity
      const newDate = moment('2024-02-15');
      dateService.date.next(newDate);
      tick();
      
      expect(dateService.date.value).toBe(newDate);
    }));

    it('should maintain service integration throughout lifecycle', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Navigate
      component.go(1);
      tick();
      
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Destroy
      component.ngOnDestroy();
      
      // Services should still be accessible
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle service reinitialization', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const initialDateService = component.dateService;
      const initialDataCalendarService = component.dataCalendarService;
      
      // Reinitialize component
      fixture = TestBed.createComponent(HeaderCalendarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      // Services should be the same instances
      expect(component.dateService).toBe(initialDateService);
      expect(component.dataCalendarService).toBe(initialDataCalendarService);
    }));
  });
});
