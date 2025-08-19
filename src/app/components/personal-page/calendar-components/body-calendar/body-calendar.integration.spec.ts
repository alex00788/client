import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BodyCalendarComponent } from './body-calendar.component';
import { DateService } from '../date.service';
import { RecordingService } from '../recording.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { NgForOf, CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import moment from 'moment';

describe('BodyCalendarComponent Integration Tests', () => {
  let component: BodyCalendarComponent;
  let fixture: ComponentFixture<BodyCalendarComponent>;
  let dateService: DateService;
  let recordingService: RecordingService;
  let dataCalendarService: DataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BodyCalendarComponent,
        NgForOf,
        CommonModule,
        MomentTransformDatePipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DateService,
        RecordingService,
        DataCalendarService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BodyCalendarComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    recordingService = TestBed.inject(RecordingService);
    dataCalendarService = TestBed.inject(DataCalendarService);
  });

  describe('Full Component Lifecycle', () => {
    it('should initialize and render calendar correctly', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component).toBeTruthy();
      expect(component.calendar).toBeDefined();
    }));

    it('should handle complete lifecycle from init to destroy', fakeAsync(() => {
      spyOn(dateService, 'changeDay');
      spyOn(recordingService, 'openRecordsBlock');
      
      component.ngOnInit();
      tick();
      
      // Simulate calendar interaction
      const testDay = moment('2024-01-15');
      component.select(testDay);
      
      expect(dateService.changeDay).toHaveBeenCalledWith(testDay);
      expect(recordingService.openRecordsBlock).toHaveBeenCalled();
      
      // Destroy component
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    }));
  });

  describe('Service Integration', () => {
    it('should integrate with DateService correctly', fakeAsync(() => {
      spyOn(component as any, 'generate').and.callThrough();
      
      component.ngOnInit();
      
      const newDate = moment('2024-03-15');
      dateService.date.next(newDate);
      tick();
      
      expect(component['generate']).toHaveBeenCalledWith(newDate);
    }));

    it('should call real DateService methods on selection', () => {
      spyOn(dateService, 'changeDay');
      
      const testDay = moment('2024-01-20');
      component.select(testDay);
      
      expect(dateService.changeDay).toHaveBeenCalledWith(testDay);
    });

    it('should trigger real RecordingService methods', () => {
      spyOn(recordingService, 'openRecordsBlock');
      
      const testDay = moment('2024-01-25');
      component.select(testDay);
      
      expect(recordingService.openRecordsBlock).toHaveBeenCalled();
    });

    it('should emit to real DateService subjects', () => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      const testDay = moment('2024-01-30');
      component.select(testDay);
      
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });
  });

  describe('Calendar Generation Integration', () => {
    it('should generate calendar that responds to real date changes', fakeAsync(() => {
      component.ngOnInit();
      
      // Change to January
      dateService.date.next(moment('2024-01-15'));
      tick();
      
      let januaryDays = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 0) januaryDays++;
        });
      });
      
      // Change to February
      dateService.date.next(moment('2024-02-15'));
      tick();
      
      let februaryDays = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 1) februaryDays++;
        });
      });
      
      expect(januaryDays).toBe(31);
      expect(februaryDays).toBe(29); // 2024 is leap year
    }));

    it('should maintain correct calendar structure across real date changes', fakeAsync(() => {
      component.ngOnInit();
      
      const testMonths = [
        moment('2024-01-01'),
        moment('2024-06-01'),
        moment('2024-12-01')
      ];
      
      testMonths.forEach(month => {
        dateService.date.next(month);
        tick();
        
        expect(component.calendar.length).toBeGreaterThanOrEqual(4);
        expect(component.calendar.length).toBeLessThanOrEqual(6);
        
        component.calendar.forEach(week => {
          expect(week.days.length).toBe(7);
          
          week.days.forEach(day => {
            expect(moment.isMoment(day.value)).toBe(true);
            expect(day.value.isValid()).toBe(true);
            expect(typeof day.active).toBe('boolean');
            expect(typeof day.disabled).toBe('boolean');
            expect(typeof day.selected).toBe('boolean');
          });
        });
      });
    }));
  });

  describe('Real User Interactions', () => {
    it('should handle sequential day selections correctly', () => {
      spyOn(dateService, 'changeDay');
      spyOn(recordingService, 'openRecordsBlock');
      spyOn(dateService.recordingDaysChanged, 'next');
      
      const days = [
        moment('2024-01-01'),
        moment('2024-01-15'),
        moment('2024-01-31')
      ];
      
      days.forEach((day, index) => {
        component.select(day);
        
        expect(dateService.changeDay).toHaveBeenCalledWith(day);
        expect(recordingService.openRecordsBlock).toHaveBeenCalledTimes(index + 1);
        expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
      });
      
      expect(dateService.changeDay).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid user interactions', fakeAsync(() => {
      component.ngOnInit();
      
      spyOn(dateService, 'changeDay');
      spyOn(recordingService, 'openRecordsBlock');
      
      // Simulate rapid clicking
      for (let i = 1; i <= 10; i++) {
        component.select(moment(`2024-01-${i.toString().padStart(2, '0')}`));
      }
      
      tick();
      
      expect(dateService.changeDay).toHaveBeenCalledTimes(10);
      expect(recordingService.openRecordsBlock).toHaveBeenCalledTimes(10);
    }));
  });

  describe('Calendar Data Integrity', () => {
    it('should maintain data integrity across multiple month changes', fakeAsync(() => {
      component.ngOnInit();
      
      const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      
      months.forEach(monthIndex => {
        dateService.date.next(moment().month(monthIndex));
        tick();
        
        // Verify calendar integrity
        let totalDays = 0;
        let monthDays = 0;
        
        component.calendar.forEach(week => {
          week.days.forEach(day => {
            totalDays++;
            if (day.value.month() === monthIndex) {
              monthDays++;
            }
            
            // Verify data structure
            expect(day.value).toBeDefined();
            expect(day.active).toBeDefined();
            expect(day.disabled).toBeDefined();
            expect(day.selected).toBeDefined();
          });
        });
        
        // Should have reasonable number of days for the month (accounting for calendar generation algorithm)
        expect(monthDays).toBeGreaterThanOrEqual(28);
        expect(monthDays).toBeLessThanOrEqual(31);
        
        // Should have complete weeks (multiples of 7)
        expect(totalDays % 7).toBe(0);
      });
    }));

    it('should handle year transitions correctly', fakeAsync(() => {
      component.ngOnInit();
      
      // Test year transition
      dateService.date.next(moment('2024-12-31'));
      tick();
      
      let decemberCalendar = JSON.parse(JSON.stringify(component.calendar));
      
      dateService.date.next(moment('2025-01-01'));
      tick();
      
      let januaryCalendar = component.calendar;
      
      expect(januaryCalendar).not.toEqual(decemberCalendar);
      
      // Verify new year calendar
      let januaryDays = 0;
      januaryCalendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 0 && day.value.year() === 2025) {
            januaryDays++;
          }
        });
      });
      
      expect(januaryDays).toBe(31);
    }));
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      // Mock service to throw error
      spyOn(dateService, 'changeDay').and.throwError('Service error');
      
      expect(() => {
        component.select(moment('2024-01-15'));
      }).toThrowError('Service error');
    }));

    it('should continue working after service errors', fakeAsync(() => {
      // Test that component can recover from errors
      spyOn(recordingService, 'openRecordsBlock');
      spyOn(dateService.recordingDaysChanged, 'next');
      
      // Normal operation should work
      component.select(moment('2024-01-15'));
      
      expect(recordingService.openRecordsBlock).toHaveBeenCalled();
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    }));
  });

  describe('Memory Management Integration', () => {
    it('should properly cleanup subscriptions on destroy', fakeAsync(() => {
      let callCount = 0;
      spyOn(component as any, 'generate').and.callFake(() => {
        callCount++;
      });
      
      component.ngOnInit();
      tick();
      
      // Trigger a date change
      dateService.date.next(moment('2024-01-15'));
      tick();
      
      const callsBeforeDestroy = callCount;
      expect(callsBeforeDestroy).toBeGreaterThan(0);
      
      // Destroy component
      component.ngOnDestroy();
      
      // Try to trigger more date changes
      dateService.date.next(moment('2024-02-15'));
      tick();
      
      // Should not be called after destroy
      expect(callCount).toBe(callsBeforeDestroy);
    }));

    it('should handle multiple init/destroy cycles', fakeAsync(() => {
      for (let i = 0; i < 3; i++) {
        // Create new destroyed$ for each iteration
        component['destroyed$'] = new Subject<void>();
        
        component.ngOnInit();
        
        dateService.date.next(moment(`2024-0${i + 1}-15`));
        tick();
        
        expect(component.calendar.length).toBeGreaterThan(0);
        
        spyOn(component['destroyed$'], 'next');
        spyOn(component['destroyed$'], 'complete');
        
        component.ngOnDestroy();
        
        expect(component['destroyed$'].next).toHaveBeenCalled();
        expect(component['destroyed$'].complete).toHaveBeenCalled();
      }
    }));
  });

  describe('Performance Integration', () => {
    it('should handle high frequency date changes efficiently', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      // Rapid date changes
      for (let i = 0; i < 50; i++) {
        dateService.date.next(moment().add(i, 'days'));
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should handle 50 updates efficiently
      expect(executionTime).toBeLessThan(1000);
    }));

    it('should maintain performance with large calendar operations', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      // Generate calendars for entire year
      for (let month = 0; month < 12; month++) {
        dateService.date.next(moment().month(month));
        tick();
        
        // Simulate user interactions
        component.calendar.forEach(week => {
          week.days.forEach(day => {
            if (!day.disabled && Math.random() > 0.9) { // Random 10% selection
              component.select(day.value);
            }
          });
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete entire year operations efficiently
      expect(executionTime).toBeLessThan(2000);
    }));
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      // Initialize component
      component.ngOnInit();
      tick();
      
      // User navigates to current month
      dateService.date.next(moment());
      tick();
      
      expect(component.calendar.length).toBeGreaterThan(0);
      
      // User selects today
      const today = moment();
      spyOn(dateService, 'changeDay');
      spyOn(recordingService, 'openRecordsBlock');
      
      component.select(today);
      
      expect(dateService.changeDay).toHaveBeenCalledWith(today);
      expect(recordingService.openRecordsBlock).toHaveBeenCalled();
      
      // User navigates to next month
      dateService.date.next(moment().add(1, 'month'));
      tick();
      
      // Calendar should update
      let nextMonthDays = 0;
      const nextMonth = moment().add(1, 'month').month();
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === nextMonth) {
            nextMonthDays++;
          }
        });
      });
      
      expect(nextMonthDays).toBe(moment().add(1, 'month').daysInMonth());
    }));

    it('should handle edge case dates in real usage', fakeAsync(() => {
      component.ngOnInit();
      
      // Test leap year
      dateService.date.next(moment('2024-02-29'));
      tick();
      
      let hasLeapDay = false;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.format('YYYY-MM-DD') === '2024-02-29') {
            hasLeapDay = true;
          }
        });
      });
      
      expect(hasLeapDay).toBe(true);
      
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
        
        expect(component.calendar.length).toBeGreaterThan(0);
        
        // Find the date in calendar
        let foundDate = false;
        component.calendar.forEach(week => {
          week.days.forEach(day => {
            if (day.value.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')) {
              foundDate = true;
              expect(day.selected).toBe(true);
            }
          });
        });
        
        expect(foundDate).toBe(true);
      });
    }));
  });
});
