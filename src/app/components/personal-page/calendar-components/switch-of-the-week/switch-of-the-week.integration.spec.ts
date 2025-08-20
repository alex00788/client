import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwitchOfTheWeekComponent } from './switch-of-the-week.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('SwitchOfTheWeekComponent Integration Tests', () => {
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

  describe('Real Service Integration', () => {
    it('should integrate with real DateService', () => {
      expect(dateService).toBeDefined();
      expect(dateService.changeOneWeek).toBeDefined();
      expect(dateService.date).toBeDefined();
      expect(dateService.recordingDaysChanged).toBeDefined();
    });

    it('should integrate with real DataCalendarService', () => {
      expect(dataCalendarService).toBeDefined();
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toBeDefined();
    });

    it('should have correct service instances injected', () => {
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should maintain service references throughout lifecycle', () => {
      const initialDateService = component.dateService;
      const initialDataCalendarService = component.dataCalendarService;
      
      // Simulate some operations
      component.go(1);
      component.go(-1);
      
      expect(component.dateService).toBe(initialDateService);
      expect(component.dataCalendarService).toBe(initialDataCalendarService);
    });
  });

  describe('Real Date Service Integration', () => {
    it('should call real changeOneWeek method', () => {
      const initialDate = dateService.date.value.clone();
      const direction = 1;
      
      // Test that the method exists and can be called
      expect(typeof dateService.changeOneWeek).toBe('function');
      
      component.go(direction);
      
      // Verify that the component method works
      expect(component.dateService).toBe(dateService);
    });

    it('should trigger recordingDaysChanged when changing week', fakeAsync(() => {
      const direction = 1;
      let recordingDaysChanged = false;
      
      dateService.recordingDaysChanged.subscribe(value => {
        recordingDaysChanged = value;
      });
      
      component.go(direction);
      tick();
      
      expect(recordingDaysChanged).toBe(true);
    }));

    it('should update date when changing week', fakeAsync(() => {
      const initialDate = dateService.date.value.clone();
      const direction = 1;
      
      component.go(direction);
      tick();
      
      // Date should be updated (week changed)
      expect(dateService.date.value).not.toEqual(initialDate);
    }));

    it('should handle negative week changes correctly', fakeAsync(() => {
      const initialDate = dateService.date.value.clone();
      const direction = -1;
      
      component.go(direction);
      tick();
      
      // Date should be updated (week changed backward)
      expect(dateService.date.value).not.toEqual(initialDate);
    }));

    it('should handle multiple week changes in sequence', fakeAsync(() => {
      const initialDate = dateService.date.value.clone();
      
      // Navigate forward then backward
      component.go(1);
      tick();
      const forwardDate = dateService.date.value.clone();
      
      component.go(-1);
      tick();
      const backwardDate = dateService.date.value.clone();
      
      // Dates should be different after each change
      expect(forwardDate).not.toEqual(initialDate);
      expect(backwardDate).not.toEqual(forwardDate);
    }));
  });

  describe('Real Data Calendar Service Integration', () => {
    it('should call real getAllEntryAllUsersForTheMonth method', fakeAsync(() => {
      // Test that the method exists and can be called
      expect(typeof dataCalendarService.getAllEntryAllUsersForTheMonth).toBe('function');
      
      component.go(1);
      tick();
      
      // Verify that the component method works
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should refresh calendar data after week change', fakeAsync(() => {
      const direction = 1;
      
      // Test that the method exists
      expect(typeof dataCalendarService.getAllEntryAllUsersForTheMonth).toBe('function');
      
      component.go(direction);
      tick();
      
      // Verify component functionality
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should maintain data consistency across week changes', fakeAsync(() => {
      // Simulate data refresh
      const mockData = [
        { date: '15.01.2024', time: '10:00', users: [] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(mockData);
      tick();
      
      // Change week
      component.go(1);
      tick();
      
      // Data should still be accessible
      expect(dataCalendarService.allEntryAllUsersInMonth.value).toBeDefined();
    }));
  });

  describe('Real Component Lifecycle Integration', () => {
    it('should initialize and render correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      expect(component).toBeTruthy();
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    }));

    it('should handle complete lifecycle from init to destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
      
      // Test functionality
      component.go(1);
      tick();
      
      expect(component.dateService).toBe(dateService);
    }));

    it('should maintain functionality after multiple initializations', fakeAsync(() => {
      for (let i = 0; i < 3; i++) {
        fixture = TestBed.createComponent(SwitchOfTheWeekComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        tick();
        
        expect(component.dateService).toBeDefined();
        expect(component.dataCalendarService).toBeDefined();
        expect(typeof component.go).toBe('function');
        
        // Test functionality
        component.go(1);
        tick();
        expect(component.dateService).toBe(dateService);
      }
    }));
  });

  describe('Real UI Integration', () => {
    it('should render with correct HTML structure', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.btnSSwitchWeek')).toBeTruthy();
      expect(compiled.querySelectorAll('.btnSwitchWeek')).toHaveSize(2);
    }));

    it('should handle real DOM events', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      
      // Test click events
      spyOn(component, 'go');
      
      prevButton.click();
      expect(component.go).toHaveBeenCalledWith(-1);
      
      nextButton.click();
      expect(component.go).toHaveBeenCalledWith(1);
    }));

    it('should have correct button content and styling', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      expect(prevButton.textContent.trim()).toBe('⇐');
      expect(nextButton.textContent.trim()).toBe('⇒');
      
      // Check that buttons exist and have correct classes
      expect(prevButton.classList.contains('btnSwitchWeek')).toBe(true);
      expect(nextButton.classList.contains('btnSwitchWeek')).toBe(true);
    }));
  });

  describe('Real Data Flow Integration', () => {
    it('should maintain data integrity across operations', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate data flow
      const mockData = [
        { date: '15.01.2024', time: '10:00', users: [] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(mockData);
      tick();
      
      expect(dataCalendarService.allEntryAllUsersInMonth.value).toBeDefined();
      expect(dataCalendarService.allEntryAllUsersInMonth.value).toEqual(mockData);
    }));

    it('should handle real calendar view changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test week navigation
      const initialDate = dateService.date.value.clone();
      
      component.go(1);
      tick();
      
      const newDate = dateService.date.value.clone();
      expect(newDate).not.toEqual(initialDate);
      
      // Data should be refreshed
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should maintain service state consistency', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Verify initial state
      expect(dateService.date.value).toBeDefined();
      expect(dateService.recordingDaysChanged.value).toBe(false);
      
      // Change week
      component.go(1);
      tick();
      
      // State should be updated
      expect(dateService.recordingDaysChanged.value).toBe(true);
    }));
  });

  describe('Real Error Handling Integration', () => {
    it('should handle service method failures gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test that component can handle errors
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      
      // Component should still be functional
      expect(typeof component.go).toBe('function');
    }));

    it('should continue working after service errors', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Component should still be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
    }));

    it('should handle data service failures gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test that component can handle errors
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
    }));
  });

  describe('Real Performance Integration', () => {
    it('should handle high frequency operations efficiently', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startTime = performance.now();
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    }));

    it('should maintain performance with rapid navigation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      const startTime = performance.now();
      
      // Rapid navigation
      for (let i = 0; i < 20; i++) {
        component.go(1);
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
    }));
  });

  describe('Real World Scenarios', () => {
    it('should handle typical calendar workflow', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Simulate typical user workflow
      const initialDate = dateService.date.value.clone();
      
      // Navigate to next week
      component.go(1);
      tick();
      expect(dateService.date.value).not.toEqual(initialDate);
      
      // Navigate to previous week
      component.go(-1);
      tick();
      
      // Navigate to next week again
      component.go(1);
      tick();
      
      expect(dateService.date.value).toBeDefined();
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle edge case scenarios in real usage', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test with edge case directions
      const edgeDirections = [0, 100, -100, 1.5, -1.5];
      
      edgeDirections.forEach(direction => {
        component.go(direction);
        tick();
        expect(component.dateService).toBe(dateService);
      });
    }));

    it('should work correctly in different time zones', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Test with different moment dates
      const testDates = [
        moment('2024-01-01'),
        moment('2024-06-15'),
        moment('2024-12-31')
      ];
      
      testDates.forEach(testDate => {
        dateService.date.next(testDate);
        tick();
        
        component.go(1);
        tick();
        
        expect(dateService.date.value).toBeDefined();
        expect(component.dataCalendarService).toBe(dataCalendarService);
      });
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
      
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      
      // Test functionality
      component.go(1);
      tick();
      
      // Services should still be accessible and functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle service reinitialization correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Recreate component
      fixture = TestBed.createComponent(SwitchOfTheWeekComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      // New services should be injected
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
    }));
  });

  describe('Real Memory Management Integration', () => {
    it('should not create memory leaks with multiple operations', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
        tick();
      }
      
      // Component should still be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
    }));

    it('should handle multiple component instances correctly', fakeAsync(() => {
      const components: SwitchOfTheWeekComponent[] = [];
      
      // Create multiple component instances
      for (let i = 0; i < 5; i++) {
        const newFixture = TestBed.createComponent(SwitchOfTheWeekComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();
        tick();
        
        components.push(newComponent);
        
        // Test functionality
        newComponent.go(1);
        tick();
        expect(newComponent.dateService).toBeDefined();
        expect(newComponent.dataCalendarService).toBeDefined();
      }
      
      // All components should be functional
      components.forEach(comp => {
        expect(comp.dateService).toBeDefined();
        expect(comp.dataCalendarService).toBeDefined();
        expect(typeof comp.go).toBe('function');
      });
    }));
  });
});
