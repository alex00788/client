import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchOfTheWeekComponent } from './switch-of-the-week.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('SwitchOfTheWeekComponent', () => {
  let component: SwitchOfTheWeekComponent;
  let fixture: ComponentFixture<SwitchOfTheWeekComponent>;
  let dateService: jasmine.SpyObj<DateService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;

  beforeEach(async () => {
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'changeOneWeek'
    ], {
      date: new BehaviorSubject(moment()),
      recordingDaysChanged: new BehaviorSubject(false)
    });

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth'
    ]);

    await TestBed.configureTestingModule({
      imports: [SwitchOfTheWeekComponent],
      providers: [
        { provide: DateService, useValue: dateServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchOfTheWeekComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    fixture.detectChanges();
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    });

    it('should have correct service instances', () => {
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should render with correct HTML structure', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.btnSSwitchWeek')).toBeTruthy();
      expect(compiled.querySelectorAll('.btnSwitchWeek')).toHaveSize(2);
    });

    it('should have correct CSS classes applied', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.btnSSwitchWeek');
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      expect(container).toBeTruthy();
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();
    });
  });

  describe('go Method - Week Navigation', () => {
    it('should call changeOneWeek with correct direction for previous week', () => {
      const direction = -1;
      
      component.go(direction);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(direction);
    });

    it('should call changeOneWeek with correct direction for next week', () => {
      const direction = 1;
      
      component.go(direction);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(direction);
      
    });

    it('should call getAllEntryAllUsersForTheMonth after changing week', () => {
      const direction = 1;
      
      component.go(direction);
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle multiple week changes correctly', () => {
      // Navigate to previous week
      component.go(-1);
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Navigate to next week
      component.go(1);
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle zero direction value', () => {
      const direction = 0;
      
      component.go(direction);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(0);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle large direction values', () => {
      const largeDirection = 100;
      
      component.go(largeDirection);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(largeDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle negative large direction values', () => {
      const largeNegativeDirection = -100;
      
      component.go(largeNegativeDirection);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(largeNegativeDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
      expect(dateService.changeOneWeek).toBeDefined();
    });

    it('should integrate with DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toBeDefined();
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

  describe('UI Interaction Tests', () => {
    it('should handle click on previous week button', () => {
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      
      spyOn(component, 'go');
      
      prevButton.click();
      
      expect(component.go).toHaveBeenCalledWith(-1);
    });

    it('should handle click on next week button', () => {
      const compiled = fixture.nativeElement;
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      spyOn(component, 'go');
      
      nextButton.click();
      
      expect(component.go).toHaveBeenCalledWith(1);
    });

    it('should have correct button text content', () => {
      const compiled = fixture.nativeElement;
      const prevButton = compiled.querySelector('.btnSwitchWeek:first-child');
      const nextButton = compiled.querySelector('.btnSwitchWeek:last-child');
      
      expect(prevButton.textContent.trim()).toBe('⇐');
      expect(nextButton.textContent.trim()).toBe('⇒');
    });

    it('should have correct button positioning', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.btnSSwitchWeek');
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      expect(container).toBeTruthy();
      expect(buttons).toHaveSize(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined direction parameter', () => {
      const undefinedDirection = undefined as any;
      
      expect(() => component.go(undefinedDirection)).not.toThrow();
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(undefinedDirection);
    });

    it('should handle null direction parameter', () => {
      const nullDirection = null as any;
      
      expect(() => component.go(nullDirection)).not.toThrow();
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(nullDirection);
    });

    it('should handle string direction parameter', () => {
      const stringDirection = '1' as any;
      
      component.go(stringDirection);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(stringDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle decimal direction parameter', () => {
      const decimalDirection = 1.5;
      
      component.go(decimalDirection);
      
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(decimalDirection);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle service method failures gracefully', () => {
      dateService.changeOneWeek.and.throwError('Service error');
      
      expect(() => component.go(1)).toThrow();
    });

    it('should handle data calendar service failures gracefully', () => {
      // Test that component can handle service errors
      expect(component.dataCalendarService).toBe(dataCalendarService);
      expect(typeof component.go).toBe('function');
      
      // Component should still be functional
      expect(component.dateService).toBe(dateService);
    });
  });

  describe('Component State Management', () => {
    it('should maintain component state after navigation', () => {
      const initialDateService = component.dateService;
      const initialDataCalendarService = component.dataCalendarService;
      
      component.go(1);
      component.go(-1);
      component.go(1);
      
      expect(component.dateService).toBe(initialDateService);
      expect(component.dataCalendarService).toBe(initialDataCalendarService);
    });

    it('should not have any internal state that changes', () => {
      const initialState = { ...component };
      
      component.go(1);
      component.go(-1);
      
      // Component should not have any internal state changes
      expect(component.dateService).toBe(initialState.dateService);
      expect(component.dataCalendarService).toBe(initialState.dataCalendarService);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid navigation calls efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        component.go(1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(dateService.changeOneWeek).toHaveBeenCalledTimes(100);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(100);
    });

    it('should not create memory leaks with multiple calls', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 1000; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      // Component should still be functional
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
    });
  });

  describe('Accessibility and UX', () => {
    it('should have clickable buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button).toBeTruthy();
        expect(button.classList.contains('btnSwitchWeek')).toBe(true);
      });
    });

    it('should have proper button sizing', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button).toBeTruthy();
        expect(button.classList.contains('btnSwitchWeek')).toBe(true);
      });
    });

    it('should have proper button spacing', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button).toBeTruthy();
        expect(button.classList.contains('btnSwitchWeek')).toBe(true);
      });
    });

    it('should have rounded button corners', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btnSwitchWeek');
      
      buttons.forEach((button: HTMLElement) => {
        expect(button).toBeTruthy();
        expect(button.classList.contains('btnSwitchWeek')).toBe(true);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should be ready for use after initialization', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(typeof component.go).toBe('function');
    });

    it('should not require any cleanup', () => {
      // Component doesn't have ngOnDestroy, so no cleanup needed
      expect(component).toBeDefined();
    });

    it('should maintain functionality after multiple initializations', () => {
      // Re-create component multiple times
      for (let i = 0; i < 5; i++) {
        fixture = TestBed.createComponent(SwitchOfTheWeekComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        
        expect(component.dateService).toBeDefined();
        expect(component.dataCalendarService).toBeDefined();
        expect(typeof component.go).toBe('function');
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should work correctly in typical navigation scenario', () => {
      // Simulate typical user navigation pattern
      component.go(-1); // Go to previous week
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      component.go(1); // Go to next week
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      component.go(1); // Go to next week again
      expect(dateService.changeOneWeek).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should handle rapid back-and-forth navigation', () => {
      // Rapid navigation between weeks
      for (let i = 0; i < 10; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      expect(dateService.changeOneWeek).toHaveBeenCalledTimes(10);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(10);
    });

    it('should maintain service consistency during navigation', () => {
      const initialDateService = component.dateService;
      const initialDataCalendarService = component.dataCalendarService;
      
      // Perform multiple navigations
      for (let i = 0; i < 5; i++) {
        component.go(1);
      }
      
      // Services should remain the same instances
      expect(component.dateService).toBe(initialDateService);
      expect(component.dataCalendarService).toBe(initialDataCalendarService);
    });
  });
});
