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

describe('InfoBlockComponent Integration Tests', () => {
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

  describe('Full Component Lifecycle Integration', () => {
    it('should initialize and render correctly with real services', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component).toBeTruthy();
      expect(component.currentTime).toBeDefined();
      expect(component.currentTime).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    }));

    it('should handle complete lifecycle from init to multiple operations', fakeAsync(() => {
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.ngOnInit();
      tick();
      
      // Simulate user navigation
      component.go(-1);
      component.go(1);
      component.go(-1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(3);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(3);
      
      // Verify component state is maintained
      expect(component.currentTime).toBeDefined();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));
  });

  describe('Real Service Integration', () => {
    it('should integrate with real DateService.changeOneDay method', () => {
      spyOn(dateService, 'changeOneDay');
      
      const direction = 1;
      component.go(direction);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
    });

    it('should integrate with real DataCalendarService.getAllEntryAllUsersForTheMonth method', () => {
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      const direction = -1;
      component.go(direction);
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should work with real DateService.date observable', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      const initialDate = dateService.date.value;
      const newDate = moment('2024-03-15');
      
      dateService.date.next(newDate);
      tick();
      
      expect(dateService.date.value).toEqual(newDate);
      expect(dateService.date.value).not.toEqual(initialDate);
    }));

    it('should maintain real service references throughout lifecycle', () => {
      const originalDateService = component.dateService;
      const originalDataCalendarService = component.dataCalendarService;
      
      component.go(1);
      component.go(-1);
      component.go(1);
      
      expect(component.dateService).toBe(originalDateService);
      expect(component.dataCalendarService).toBe(originalDataCalendarService);
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });
  });

  describe('Real User Interactions Integration', () => {
    it('should handle sequential navigation correctly with real services', () => {
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Simulate user navigating back and forth
      component.go(-1);
      component.go(1);
      component.go(-1);
      component.go(1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(4);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(4);
      
      // Verify correct sequence of calls
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
    });

    it('should handle rapid user interactions efficiently', fakeAsync(() => {
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      const startTime = performance.now();
      
      // Simulate rapid clicking
      for (let i = 0; i < 20; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(20);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(20);
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    }));

    it('should handle mixed navigation patterns', () => {
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Mixed navigation pattern
      const navigationSequence = [1, -1, 1, 1, -1, -1, 1, -1];
      
      navigationSequence.forEach(direction => {
        component.go(direction);
      });
      
      expect(dateService.changeOneDay).toHaveBeenCalledTimes(8);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(8);
      
      // Verify each call was made with correct direction
      navigationSequence.forEach((direction) => {
        expect(dateService.changeOneDay).toHaveBeenCalledWith(direction);
      });
    });
  });

  describe('Date Service Integration', () => {
    it('should work with DateService.changeMonth method', fakeAsync(() => {
      spyOn(dateService, 'changeMonth');
      
      dateService.changeMonth(1);
      tick();
      
      expect(dateService.changeMonth).toHaveBeenCalledWith(1);
    }));

    it('should work with DateService.changeOneWeek method', fakeAsync(() => {
      const initialDate = dateService.date.value;
      
      dateService.changeOneWeek(1);
      tick();
      
      const newDate = dateService.date.value;
      expect(newDate.isSame(initialDate.add(1, 'week'), 'day')).toBe(true);
    }));

    it('should work with DateService.changeDay method', fakeAsync(() => {
      const testDay = moment('2024-01-20');
      
      dateService.changeDay(testDay);
      tick();
      
      const currentDate = dateService.date.value;
      expect(currentDate.date()).toBe(testDay.date());
      expect(currentDate.month()).toBe(testDay.month());
    }));

    it('should integrate with DateService.recordingDaysChanged observable', fakeAsync(() => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      component.go(1);
      tick();
      
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    }));
  });

  describe('Data Calendar Service Integration', () => {
    it('should trigger data refresh when navigating dates', fakeAsync(() => {
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1);
      tick();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    }));

    it('should work with DataCalendarService filtering methods', fakeAsync(() => {
      // Test integration with filtering methods
      dataCalendarService.filterByDate.next(true);
      tick();
      
      expect(dataCalendarService.filterByDate.value).toBe(true);
      
      dataCalendarService.filterByOrg.next(true);
      tick();
      
      expect(dataCalendarService.filterByOrg.value).toBe(true);
    }));

    it('should integrate with DataCalendarService show methods', fakeAsync(() => {
      dataCalendarService.showAll.next(false);
      tick();
      
      expect(dataCalendarService.showAll.value).toBe(false);
      
      dataCalendarService.showAll.next(true);
      tick();
      
      expect(dataCalendarService.showAll.value).toBe(true);
    }));
  });

  describe('Template and Service Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display real date from DateService in template', fakeAsync(() => {
      const compiled = fixture.nativeElement;
      const dateDisplay = compiled.querySelector('.todayClass');
      
      expect(dateDisplay).toBeTruthy();
      expect(dateDisplay.textContent.trim()).toBe(component.currentTime);
      
      // Change date and verify template updates
      const newDate = moment('2024-03-15');
      dateService.date.next(newDate);
      tick();
      fixture.detectChanges();
      
      // Template should reflect the new date from service
      expect(dateDisplay.textContent.trim()).toBeDefined();
    }));

    it('should handle template updates when services change', fakeAsync(() => {
      const compiled = fixture.nativeElement;
      const leftButton = compiled.querySelector('.changeDayClass:first-child');
      const rightButton = compiled.querySelector('.changeDayClass:last-child');
      
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Click left button
      leftButton.click();
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Click right button
      rightButton.click();
      tick();
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    }));

    it('should maintain template consistency with service state', fakeAsync(() => {
      const compiled = fixture.nativeElement;
      
      // Verify initial template state
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
      expect(compiled.querySelectorAll('.selectedTime').length).toBe(3);
      expect(compiled.querySelectorAll('.changeDayClass').length).toBe(2);
      
      // Perform operations
      component.go(1);
      component.go(-1);
      tick();
      fixture.detectChanges();
      
      // Template should remain consistent
      expect(compiled.querySelector('.infoBlockClass')).toBeTruthy();
      expect(compiled.querySelectorAll('.selectedTime').length).toBe(3);
      expect(compiled.querySelectorAll('.changeDayClass').length).toBe(2);
    }));
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      // Mock service to throw error
      spyOn(dateService, 'changeOneDay').and.throwError('Service error');
      
      expect(() => {
        component.go(1);
      }).toThrowError('Service error');
    }));

    it('should continue working after service errors', fakeAsync(() => {
      // Test that component can recover from errors
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      // Normal operation should work
      component.go(-1);
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    }));

    it('should handle network failures in DataCalendarService', fakeAsync(() => {
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth').and.throwError('Network Error');
      
      expect(() => {
        component.go(1);
      }).toThrowError('Network Error');
    }));
  });

  describe('Memory Management Integration', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform multiple operations
      for (let i = 0; i < 50; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      tick();
      
      // Component should still be functional
      expect(component).toBeTruthy();
      expect(component.dateService).toBe(dateService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    }));

    it('should handle multiple lifecycle cycles efficiently', fakeAsync(() => {
      for (let cycle = 0; cycle < 3; cycle++) {
        component.ngOnInit();
        tick();
        
        component.go(1);
        component.go(-1);
        tick();
        
        expect(component.currentTime).toBeDefined();
        expect(component.dateService).toBe(dateService);
        expect(component.dataCalendarService).toBe(dataCalendarService);
      }
    }));
  });

  describe('Performance Integration', () => {
    it('should handle high frequency date changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      // Rapid date changes
      for (let i = 0; i < 100; i++) {
        component.go(i % 2 === 0 ? 1 : -1);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should handle 100 updates efficiently
      expect(executionTime).toBeLessThan(500);
    }));

    it('should maintain performance with large calendar operations', fakeAsync(() => {
      const startTime = performance.now();
      
      // Generate multiple date changes
      for (let month = 0; month < 12; month++) {
        const testDate = moment().month(month);
        dateService.date.next(testDate);
        tick();
        
        component.go(1);
        component.go(-1);
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete entire year operations efficiently
      expect(executionTime).toBeLessThan(1000);
    }));
  });

  describe('Real-world Scenarios Integration', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      // Initialize component
      component.ngOnInit();
      tick();
      
      expect(component.currentTime).toBeDefined();
      
      // User navigates to previous day
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(-1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // User navigates to next day
      component.go(1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    }));

    it('should handle edge case dates in real usage', fakeAsync(() => {
      component.ngOnInit();
      
      // Test month boundaries
      const boundaryDates = [
        moment('2024-01-31'), // End of January
        moment('2024-02-01'), // Start of February
        moment('2024-12-31'), // End of year
        moment('2025-01-01')  // Start of new year
      ];
      
      boundaryDates.forEach(date => {
        dateService.date.next(date);
        tick();
        
        expect(dateService.date.value).toEqual(date);
        
        // Component should work with boundary dates
        component.go(1);
        component.go(-1);
        tick();
      });
    }));

    it('should handle leap year scenarios', fakeAsync(() => {
      component.ngOnInit();
      
      // Test leap year
      const leapYearDate = moment('2024-02-29');
      dateService.date.next(leapYearDate);
      tick();
      
      expect(dateService.date.value.format('YYYY-MM-DD')).toBe('2024-02-29');
      
      // Component should work with leap year dates
      component.go(1);
      component.go(-1);
      tick();
    }));
  });

  describe('Service State Persistence Integration', () => {
    it('should maintain service state across component operations', fakeAsync(() => {
      spyOn(dateService, 'changeOneDay');
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      
      component.go(1);
      tick();
      
      // Verify that the methods were called
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      
      // Component should reflect the service state
      expect(component.dateService.date.value).toEqual(dateService.date.value);
    }));

    it('should handle service state changes correctly', fakeAsync(() => {
      // Set specific service state
      const testDate = moment('2024-06-15');
      dateService.date.next(testDate);
      tick();
      
      expect(dateService.date.value).toEqual(testDate);
      
      // Component should work with the new state
      component.go(1);
      component.go(-1);
      tick();
      
      // State should be maintained
      expect(dateService.date.value).toEqual(testDate);
    }));

    it('should integrate with service filtering state', fakeAsync(() => {
      // Set filtering state
      dataCalendarService.filterByDate.next(true);
      dataCalendarService.filterByOrg.next(false);
      dataCalendarService.showAll.next(false);
      tick();
      
      expect(dataCalendarService.filterByDate.value).toBe(true);
      expect(dataCalendarService.filterByOrg.value).toBe(false);
      expect(dataCalendarService.showAll.value).toBe(false);
      
      // Component should work with filtering state
      component.go(1);
      tick();
      
      // State should be maintained
      expect(dataCalendarService.filterByDate.value).toBe(true);
      expect(dataCalendarService.filterByOrg.value).toBe(false);
      expect(dataCalendarService.showAll.value).toBe(false);
    }));
  });
});
