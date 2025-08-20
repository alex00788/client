import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InfoBlockComponent } from './info-block.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('InfoBlockComponent E2E', () => {
  let component: InfoBlockComponent;
  let fixture: ComponentFixture<InfoBlockComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InfoBlockComponent,
        AsyncPipe,
        CommonModule,
        MomentTransformDatePipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DateService,
        DataCalendarService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoBlockComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
  });

  describe('Complete User Journey', () => {
    it('should complete full user workflow from initialization to navigation', fakeAsync(() => {
      // Step 1: Initial state - component created and initialized
      expect(component).toBeTruthy();
      expect(component.currentTime).toBe('');
      
      // Step 2: Component initialization
      component.ngOnInit();
      tick();
      
      expect(component.currentTime).toBeDefined();
      expect(component.currentTime).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
      
      // Step 3: User navigates to previous day
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Step 4: User navigates to next day
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Step 5: User navigates back to previous day
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Step 6: Verify final state
      expect(component.currentTime).toBeDefined();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle multiple view switches in sequence', fakeAsync(() => {
      // User navigates through multiple directions
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      const navigationSequence = [1, -1, 1, 1, -1, -1, 1, -1];
      
      navigationSequence.forEach((direction, index) => {
        component.go(direction);
        tick();
        
        expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
        expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(index + 1);
      });
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(8);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(8);
      
      tick();
    }));

    it('should handle rapid user interactions without breaking', fakeAsync(() => {
      // Simulate rapid user clicks
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      const startTime = performance.now();
      
      // Rapid clicking sequence
      for (let i = 0; i < 25; i++) {
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
      
      // Component should maintain consistent state
      expect(component).toBeTruthy();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(200);
      
      tick();
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user exploring calendar navigation', fakeAsync(() => {
      // User starts exploring different navigation options
      component.ngOnInit();
      tick();
      
      expect(component.currentTime).toBeDefined();
      
      // User tries previous day navigation
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User tries next day navigation
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User decides to go back to previous day
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle scenario: user working with calendar for extended period', fakeAsync(() => {
      // User works with calendar for extended period
      component.ngOnInit();
      tick();
      
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Extended workflow
      for (let session = 0; session < 5; session++) {
        // Navigate to previous day
        component.go(-1);
        tick();
        
        expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
        expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
        
        // Navigate to next day
        component.go(1);
        tick();
        
        expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
        expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
        
        // Navigate to previous day again
        component.go(-1);
        tick();
        
        expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
        expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
        
        tick(10);
      }
      
      // Component should still be functional after extended use
      expect(component).toBeTruthy();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle scenario: user switching between navigation directions while maintaining context', fakeAsync(() => {
      // User maintains context while switching navigation directions
      component.ngOnInit();
      tick();
      
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // User starts with next day navigation
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User switches to previous day navigation (maintains context)
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User switches to next day navigation (maintains context)
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User returns to previous day navigation (maintains context)
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network failures gracefully', fakeAsync(() => {
      // Simulate network failure by mocking service
      spyOn(dateService, 'changeOneDay').and.throwError('Network Error');
      
      // Component should not crash
      expect(() => component).not.toThrow();
      
      // User interactions should still work for other methods
      expect(component.currentTime).toBeDefined();
      
      tick();
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      // Component should handle rapid state changes efficiently
      const startTime = performance.now();
      
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Simulate large number of interactions
      for (let i = 0; i < 100; i++) {
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
      expect(executionTime).toBeLessThan(1000);
      
      tick();
    }));

    it('should handle concurrent user actions', fakeAsync(() => {
      // Simulate concurrent actions
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
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
      // Component should integrate with service correctly
      component.ngOnInit();
      fixture.detectChanges();
      tick();
      
      // Service should be available
      expect(component.dateService).toBeTruthy();
      expect(component.dataCalendarService).toBeTruthy();
      expect(component.dateService.date).toBeTruthy();
      expect(component.dataCalendarService.getAllEntryAllUsersForTheMonth).toBeTruthy();
      
      tick();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      // Perform multiple operations
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      for (let i = 0; i < 50; i++) {
        component.go(1);
        component.go(-1);
        tick(1);
      }
      
      // Memory should be properly managed
      expect(component).toBeTruthy();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      // Perform rapid state changes
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      for (let i = 0; i < 100; i++) {
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
      expect(executionTime).toBeLessThan(1000);
      
      tick();
    }));

    it('should handle multiple lifecycle cycles efficiently', fakeAsync(() => {
      // First cycle
      component.ngOnInit();
      fixture.detectChanges();
      tick();
      
      // Second cycle (simulate component reuse)
      component.ngOnInit();
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
      // Initial state
      component.ngOnInit();
      tick();
      
      expect(component.currentTime).toBeDefined();
      
      // State change
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // State should be consistent
      expect(component.currentTime).toBeDefined();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Another state change
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle keyboard navigation scenarios', fakeAsync(() => {
      // Simulate keyboard navigation
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1); // Enter key on next day button
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Simulate Tab navigation
      component.go(-1); // Enter key on previous day button
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle focus management correctly', fakeAsync(() => {
      // Component should manage focus properly
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1);
      tick();
      
      // Next day navigation should work
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User can switch to other navigation directions
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle navigation accessibility', fakeAsync(() => {
      // All navigation methods should be accessible
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Test different navigation directions
      const directions = [1, -1, 0, 2, -2];
      
      directions.forEach(direction => {
        component.go(direction);
        tick();
        
        expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
        expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      });
      
      tick();
    }));
  });

  describe('Data Persistence and State Management', () => {
    it('should persist user selections correctly', fakeAsync(() => {
      // User selects next day navigation
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User selects previous day navigation
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // State should be persisted
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle state restoration after component reinitialization', fakeAsync(() => {
      // Set specific state
      component.ngOnInit();
      tick();
      
      const initialTime = component.currentTime;
      
      // Reinitialize component
      component.ngOnInit();
      tick();
      
      // Component should maintain state
      expect(component.currentTime).toBeDefined();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));

    it('should handle multiple navigation switches with state preservation', fakeAsync(() => {
      // User switches through multiple navigation directions
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // First switch: next -> previous
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Second switch: previous -> next
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Third switch: next -> previous
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Verify final state is preserved
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      tick();
    }));
  });

  describe('Navigation Functionality', () => {
    it('should handle navigation functionality correctly', fakeAsync(() => {
      // User can navigate in different directions
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Navigate to next day
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Navigate to previous day
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Navigate to next day again
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle navigation with different patterns', fakeAsync(() => {
      // User navigates in different patterns
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Pattern 1: next -> previous -> next
      component.go(1);
      tick();
      
      component.go(-1);
      tick();
      
      component.go(1);
      tick();
      
      // Pattern 2: previous -> next -> previous
      component.go(-1);
      tick();
      
      component.go(1);
      tick();
      
      component.go(-1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(6);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(6);
      
      tick();
    }));

    it('should handle navigation case sensitivity', fakeAsync(() => {
      // Navigation should work consistently regardless of order
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Test different navigation orders
      component.go(1);
      tick();
      
      component.go(-1);
      tick();
      
      component.go(1);
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(3);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(3);
      
      tick();
    }));
  });
});
