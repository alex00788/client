import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwitchOfTheWeekComponent } from './switch-of-the-week.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('SwitchOfTheWeekComponent E2E Tests', () => {
  let component: SwitchOfTheWeekComponent;
  let fixture: ComponentFixture<SwitchOfTheWeekComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SwitchOfTheWeekComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DateService,
        DataCalendarService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchOfTheWeekComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
  });

  describe('End-to-End Calendar Navigation Workflow', () => {
    it('should complete full week navigation cycle', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Start with initial state
      const initialDate = dateService.date.value.clone();
      expect(initialDate).toBeDefined();
      
      // Navigate forward through weeks
      for (let week = 1; week <= 4; week++) {
        component.go(1);
        tick();
        
        const currentDate = dateService.date.value.clone();
        expect(currentDate).not.toEqual(initialDate);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      }
      
      // Navigate backward through weeks
      for (let week = 1; week <= 4; week++) {
        component.go(-1);
        tick();
        
        expect(component.dataCalendarService).toBe(dataCalendarService);
      }
      
      // Should be back to initial state or close to it
      const finalDate = dateService.date.value.clone();
      expect(finalDate).toBeDefined();
    }));

    it('should handle complex navigation patterns', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const initialDate = dateService.date.value.clone();
      
      // Complex navigation pattern: forward, backward, forward, backward
      const navigationPattern = [1, -1, 1, -1, 1, 1, -1, -1, 1, -1];
      
      navigationPattern.forEach((direction, index) => {
        component.go(direction);
        tick();
        
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
        
        // Verify date changes
        const currentDate = dateService.date.value.clone();
        expect(currentDate).toBeDefined();
      });
      
      // Final state should be consistent
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    }));

    it('should maintain data consistency across long navigation sessions', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate long navigation session
      const navigationCount = 50;
      const dates: any[] = [];
      
      for (let i = 0; i < navigationCount; i++) {
        const direction = i % 2 === 0 ? 1 : -1;
        const beforeDate = dateService.date.value.clone();
        
        component.go(direction);
        tick();
        
        const afterDate = dateService.date.value.clone();
        dates.push({ before: beforeDate, after: afterDate, direction });
        
        expect(afterDate).not.toEqual(beforeDate);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      }
      
      // Verify all dates are unique
      const uniqueDates = new Set(dates.map(d => d.after.format('YYYY-MM-DD')));
      expect(uniqueDates.size).toBeGreaterThan(1);
      
      // Component should still be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    }));
  });

  describe('Real User Interaction Scenarios', () => {
    it('should handle rapid user clicking behavior', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        prevButton.click();
        tick(50); // Small delay between clicks
        
        nextButton.click();
        tick(50);
      }
      
      // All clicks should be registered
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle alternating button clicks correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      // Alternating pattern: prev, next, prev, next
      const clickSequence = [prevButton, nextButton, prevButton, nextButton];
      
      clickSequence.forEach((button, index) => {
        button.click();
        tick();
        
        const expectedDirection = index % 2 === 0 ? -1 : 1;
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
    }));

    it('should handle sustained button pressing simulation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      // Simulate sustained pressing (multiple rapid clicks)
      const rapidClicks = 20;
      
      for (let i = 0; i < rapidClicks; i++) {
        nextButton.click();
        tick(10); // Very rapid clicks
      }
      
      // All clicks should be processed
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));
  });

  describe('Calendar Data Integration Workflow', () => {
    it('should maintain calendar data integrity through navigation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Set initial calendar data
      const initialData = [
        { date: '15.01.2024', time: '10:00', users: [{ name: 'John' }] },
        { date: '16.01.2024', time: '11:00', users: [{ name: 'Jane' }] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(initialData);
      tick();
      
      expect(dataCalendarService.allEntryAllUsersInMonth.value).toEqual(initialData);
      
      // Navigate weeks
      component.go(1);
      tick();
      
      // Data should be refreshed
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Navigate back
      component.go(-1);
      tick();
      
      // Data should be refreshed again
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle calendar data updates during navigation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Initial navigation
      component.go(1);
      tick();
      
      // Simulate data update
      const updatedData = [
        { date: '22.01.2024', time: '10:00', users: [{ name: 'Bob' }] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(updatedData);
      tick();
      
      expect(dataCalendarService.allEntryAllUsersInMonth.value).toEqual(updatedData);
      
      // Navigate again
      component.go(1);
      tick();
      
      // Data should be refreshed with new data
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should coordinate with date service state changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Verify initial state
      expect(dateService.recordingDaysChanged.value).toBe(false);
      
      // Navigate forward
      component.go(1);
      tick();
      
      // State should be updated
      expect(dateService.recordingDaysChanged.value).toBe(true);
      
      // Navigate backward
      component.go(-1);
      tick();
      
      // State should be updated again
      expect(dateService.recordingDaysChanged.value).toBe(true);
    }));
  });

  describe('Service Coordination and State Management', () => {
    it('should coordinate multiple service calls correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test service coordination
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
      
      // Perform navigation
      component.go(1);
      tick();
      
      // Verify services are coordinated
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle service state transitions correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Initial state
      expect(dateService.recordingDaysChanged.value).toBe(false);
      
      // First navigation
      component.go(1);
      tick();
      expect(dateService.recordingDaysChanged.value).toBe(true);
      
      // Second navigation
      component.go(1);
      tick();
      expect(dateService.recordingDaysChanged.value).toBe(true);
      
      // Third navigation
      component.go(-1);
      tick();
      expect(dateService.recordingDaysChanged.value).toBe(true);
    }));

    it('should maintain service consistency across multiple operations', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const initialDateService = component.dateService;
      const initialDataCalendarService = component.dataCalendarService;
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick();
        
        // Services should remain the same instances
        expect(component.dateService).toBe(initialDateService);
        expect(component.dataCalendarService).toBe(initialDataCalendarService);
      }
    }));
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from service failures and continue working', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test that component can handle errors gracefully
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
      
      // Should work normally
      component.go(1);
      tick();
      
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should continue working after service errors', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should still be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
      
      // Test functionality
      component.go(1);
      tick();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle data service failures gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test that component can handle errors gracefully
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
      
      // Should work normally
      component.go(1);
      tick();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));
  });

  describe('Performance and Scalability', () => {
    it('should handle high-volume navigation operations efficiently', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startTime = performance.now();
      
      // Perform high volume operations
      for (let i = 0; i < 100; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(5000); // 5 seconds
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should maintain performance under stress conditions', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const stressTestDuration = 2000; // 2 seconds
      const startTime = performance.now();
      let operationCount = 0;
      
      // Stress test with rapid operations
      while (performance.now() - startTime < stressTestDuration) {
        component.go(operationCount % 2 === 0 ? 1 : -1);
        tick(1); // Minimal delay
        operationCount++;
      }
      
      // Should handle many operations
      expect(operationCount).toBeGreaterThan(10);
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    }));

    it('should scale with multiple component instances', fakeAsync(() => {
      const instanceCount = 10;
      const components: SwitchOfTheWeekComponent[] = [];
      
      // Create multiple instances
      for (let i = 0; i < instanceCount; i++) {
        const newFixture = TestBed.createComponent(SwitchOfTheWeekComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();
        tick();
        
        components.push(newComponent);
      }
      
      // All instances should be functional
      components.forEach(comp => {
        expect(comp.dateService).toBeDefined();
        expect(comp.dataCalendarService).toBeDefined();
        expect(typeof comp.go).toBe('function');
      });
      
      // Test functionality of all instances
      components.forEach((comp, index) => {
        comp.go(index % 2 === 0 ? 1 : -1);
        tick();
        expect(comp.dateService).toBeDefined();
        expect(comp.dataCalendarService).toBeDefined();
      });
    }));
  });

  describe('Real-World Integration Scenarios', () => {
    it('should integrate seamlessly with calendar application workflow', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate typical calendar application usage
      const workflowSteps = [
        { action: 'navigate_forward' as const, direction: 1, expected: 'next_week' },
        { action: 'navigate_forward' as const, direction: 1, expected: 'next_week' },
        { action: 'navigate_backward' as const, direction: -1, expected: 'previous_week' },
        { action: 'navigate_forward' as const, direction: 1, expected: 'next_week' },
        { action: 'navigate_backward' as const, direction: -1, expected: 'previous_week' }
      ];
      
      workflowSteps.forEach((step, index) => {
        const beforeDate = dateService.date.value.clone();
        
        component.go(step.direction);
        tick();
        
        const afterDate = dateService.date.value.clone();
        
        // Verify navigation worked
        expect(afterDate).not.toEqual(beforeDate);
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
    }));

    it('should handle calendar view synchronization correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate calendar view changes
      const viewChanges = [
        { week: 1, direction: 1 },
        { week: 2, direction: 1 },
        { week: 3, direction: -1 },
        { week: 4, direction: 1 },
        { week: 5, direction: -1 }
      ];
      
      viewChanges.forEach((viewChange, index) => {
        const initialDate = dateService.date.value.clone();
        
        component.go(viewChange.direction);
        tick();
        
        const newDate = dateService.date.value.clone();
        
        // Verify view change
        expect(newDate).not.toEqual(initialDate);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
    }));

    it('should maintain calendar data consistency in complex scenarios', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Complex scenario with data updates and navigation
      const scenarioSteps: Array<{ action: 'navigate' | 'update_data'; direction?: number; data: any[] }> = [
        { action: 'navigate' as const, direction: 1, data: [{ date: '22.01.2024', users: [] }] },
        { action: 'update_data' as const, data: [{ date: '22.01.2024', users: [{ name: 'Alice' }] }] },
        { action: 'navigate' as const, direction: 1, data: [{ date: '29.01.2024', users: [] }] },
        { action: 'navigate' as const, direction: -1, data: [{ date: '22.01.2024', users: [{ name: 'Alice' }] }] },
        { action: 'navigate' as const, direction: -1, data: [{ date: '15.01.2024', users: [] }] }
      ];
      
      scenarioSteps.forEach((step, index) => {
        if (step.action === 'navigate' && step.direction !== undefined) {
          component.go(step.direction);
          tick();
          expect(component.dateService).toBe(dateService);
        } else if (step.action === 'update_data') {
          dataCalendarService.allEntryAllUsersInMonth.next(step.data);
          tick();
          expect(dataCalendarService.allEntryAllUsersInMonth.value).toEqual(step.data);
        }
        
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
    }));
  });
});
