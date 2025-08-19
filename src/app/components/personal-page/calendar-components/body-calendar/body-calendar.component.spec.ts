import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BodyCalendarComponent } from './body-calendar.component';
import { DateService } from '../date.service';
import { RecordingService } from '../recording.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { NgForOf } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import moment from 'moment';

// Mock Services
class MockDateService {
  date = new BehaviorSubject(moment());
  recordingDaysChanged = new Subject<boolean>();
  
  changeDay = jasmine.createSpy('changeDay');
}

class MockRecordingService {
  openRecordsBlock = jasmine.createSpy('openRecordsBlock');
}

class MockDataCalendarService {
  // Add any necessary mock methods here
}

describe('BodyCalendarComponent', () => {
  let component: BodyCalendarComponent;
  let fixture: ComponentFixture<BodyCalendarComponent>;
  let dateService: MockDateService;
  let recordingService: MockRecordingService;
  let dataCalendarService: MockDataCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BodyCalendarComponent,
        NgForOf,
        MomentTransformDatePipe
      ],
      providers: [
        { provide: DateService, useClass: MockDateService },
        { provide: RecordingService, useClass: MockRecordingService },
        { provide: DataCalendarService, useClass: MockDataCalendarService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BodyCalendarComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as any;
    recordingService = TestBed.inject(RecordingService) as any;
    dataCalendarService = TestBed.inject(DataCalendarService) as any;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty calendar array', () => {
      expect(component.calendar).toEqual([]);
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$']).toBeInstanceOf(Subject);
    });

    it('should inject all required services', () => {
      expect(component.recordingService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.dateService).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to dateService.date changes', fakeAsync(() => {
      spyOn(component as any, 'generate');
      
      component.ngOnInit();
      
      const testMoment = moment('2024-01-15');
      dateService.date.next(testMoment);
      tick();
      
      expect(component['generate']).toHaveBeenCalledWith(testMoment);
    }));

    it('should call generate method when date changes', fakeAsync(() => {
      const generateSpy = spyOn(component as any, 'generate');
      
      component.ngOnInit();
      
      const newDate = moment('2024-03-15');
      dateService.date.next(newDate);
      tick();
      
      expect(generateSpy).toHaveBeenCalledWith(newDate);
    }));

    it('should bind generate method to component context', fakeAsync(() => {
      const originalGenerate = component['generate'];
      spyOn(component as any, 'generate').and.callThrough();
      
      component.ngOnInit();
      
      dateService.date.next(moment('2024-01-15'));
      tick();
      
      expect(component['generate']).toHaveBeenCalled();
    }));
  });

  describe('generate method', () => {
    let testMoment: moment.Moment;

    beforeEach(() => {
      testMoment = moment('2024-01-15'); // Mid-January 2024
    });

    it('should generate calendar for given month', () => {
      component['generate'](testMoment);
      
      expect(component.calendar).toBeDefined();
      expect(component.calendar.length).toBeGreaterThan(0);
    });

    it('should create weeks with 7 days each', () => {
      component['generate'](testMoment);
      
      component.calendar.forEach(week => {
        expect(week.days.length).toBe(7);
      });
    });

    it('should mark current day as active', () => {
      const today = moment();
      component['generate'](today);
      
      let foundActiveDay = false;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.active) {
            expect(day.value.format('YYYY-MM-DD')).toBe(today.format('YYYY-MM-DD'));
            foundActiveDay = true;
          }
        });
      });
      
      if (today.month() === today.month()) {
        expect(foundActiveDay).toBe(true);
      }
    });

    it('should mark selected day correctly', () => {
      component['generate'](testMoment);
      
      let foundSelectedDay = false;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.selected) {
            expect(day.value.format('YYYY-MM-DD')).toBe(testMoment.format('YYYY-MM-DD'));
            foundSelectedDay = true;
          }
        });
      });
      
      expect(foundSelectedDay).toBe(true);
    });

    it('should mark days from other months as disabled', () => {
      component['generate'](testMoment);
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() !== testMoment.month()) {
            expect(day.disabled).toBe(true);
          } else {
            expect(day.disabled).toBe(false);
          }
        });
      });
    });

    it('should create proper calendar structure for different months', () => {
      const months = [
        moment('2024-01-15'), // January middle
        moment('2024-02-15'), // February middle  
        moment('2024-12-15')  // December middle
      ];

      months.forEach(month => {
        component['generate'](month);
        
        expect(component.calendar.length).toBeGreaterThanOrEqual(4);
        expect(component.calendar.length).toBeLessThanOrEqual(6);
        
        // Check that all days of the month are included
        let daysInMonth = 0;
        component.calendar.forEach(week => {
          week.days.forEach(day => {
            if (day.value.month() === month.month() && day.value.year() === month.year()) {
              daysInMonth++;
            }
          });
        });
        
        // Calendar should include all days of the month
        expect(daysInMonth).toBeGreaterThanOrEqual(28); // At least 28 days for any month
        expect(daysInMonth).toBeLessThanOrEqual(31); // At most 31 days
      });
    });

    it('should handle leap year correctly', () => {
      const leapYearFeb = moment('2024-02-01'); // 2024 is a leap year
      component['generate'](leapYearFeb);
      
      let febDays = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 1 && day.value.year() === 2024) { // February is month 1
            febDays++;
          }
        });
      });
      
      expect(febDays).toBe(29); // February 2024 has 29 days
    });
  });

  describe('select method', () => {
    let testDay: moment.Moment;

    beforeEach(() => {
      testDay = moment('2024-01-15');
    });

    it('should call dateService.changeDay with selected day', () => {
      component.select(testDay);
      
      expect(dateService.changeDay).toHaveBeenCalledWith(testDay);
    });

    it('should call recordingService.openRecordsBlock', () => {
      component.select(testDay);
      
      expect(recordingService.openRecordsBlock).toHaveBeenCalled();
    });

    it('should emit recordingDaysChanged event', () => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      component.select(testDay);
      
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });

    it('should handle multiple selections correctly', () => {
      const day1 = moment('2024-01-15');
      const day2 = moment('2024-01-20');
      
      component.select(day1);
      component.select(day2);
      
      expect(dateService.changeDay).toHaveBeenCalledTimes(2);
      expect(dateService.changeDay).toHaveBeenCalledWith(day1);
      expect(dateService.changeDay).toHaveBeenCalledWith(day2);
      expect(recordingService.openRecordsBlock).toHaveBeenCalledTimes(2);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed$ subject', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should prevent memory leaks by unsubscribing', () => {
      const destroyedSubject = component['destroyed$'];
      spyOn(destroyedSubject, 'next');
      spyOn(destroyedSubject, 'complete');
      
      component.ngOnInit();
      component.ngOnDestroy();
      
      expect(destroyedSubject.next).toHaveBeenCalled();
      expect(destroyedSubject.complete).toHaveBeenCalled();
    });
  });

  describe('Calendar Data Validation', () => {
    it('should have valid moment objects for all days', () => {
      component['generate'](moment('2024-01-15'));
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          expect(moment.isMoment(day.value)).toBe(true);
          expect(day.value.isValid()).toBe(true);
        });
      });
    });

    it('should have consistent boolean properties', () => {
      component['generate'](moment('2024-01-15'));
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          expect(typeof day.active).toBe('boolean');
          expect(typeof day.disabled).toBe('boolean');
          expect(typeof day.selected).toBe('boolean');
        });
      });
    });

    it('should only have one selected day per calendar', () => {
      component['generate'](moment('2024-01-15'));
      
      let selectedCount = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.selected) {
            selectedCount++;
          }
        });
      });
      
      expect(selectedCount).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle future dates correctly', () => {
      const futureDate = moment().add(5, 'years');
      
      expect(() => {
        component['generate'](futureDate);
      }).not.toThrow();
      
      expect(component.calendar.length).toBeGreaterThan(0);
    });

    it('should handle past dates correctly', () => {
      const pastDate = moment().subtract(10, 'years');
      
      expect(() => {
        component['generate'](pastDate);
      }).not.toThrow();
      
      expect(component.calendar.length).toBeGreaterThan(0);
    });

    it('should handle selection of different day types', () => {
      component['generate'](moment('2024-01-15'));
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          expect(() => {
            component.select(day.value);
          }).not.toThrow();
        });
      });
    });
  });

  describe('Integration with Services', () => {
    it('should react to date service changes', fakeAsync(() => {
      component.ngOnInit();
      
      dateService.date.next(moment('2024-03-01'));
      tick();
      
      expect(component.calendar.length).toBeGreaterThan(0);
    }));

    it('should maintain subscription until component destruction', fakeAsync(() => {
      let callCount = 0;
      spyOn(component as any, 'generate').and.callFake(() => {
        callCount++;
      });
      
      component.ngOnInit();
      tick();
      
      dateService.date.next(moment('2024-01-01'));
      tick();
      
      dateService.date.next(moment('2024-02-01'));
      tick();
      
      expect(callCount).toBe(3); // 1 from init + 2 from manual triggers
      
      component.ngOnDestroy();
      
      dateService.date.next(moment('2024-03-01'));
      tick();
      
      // Should not be called after destroy
      expect(callCount).toBe(3);
    }));
  });

  describe('Performance Tests', () => {
    it('should generate calendar efficiently', () => {
      const startTime = performance.now();
      
      component['generate'](moment('2024-01-15'));
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50);
    });

    it('should handle rapid date changes efficiently', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 12; i++) {
        dateService.date.next(moment().month(i));
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(200);
    }));
  });

  describe('State Management', () => {
    it('should update calendar state when date changes', () => {
      component['generate'](moment('2024-01-15'));
      const januaryCalendar = JSON.parse(JSON.stringify(component.calendar));
      
      component['generate'](moment('2024-02-15'));
      const februaryCalendar = component.calendar;
      
      expect(februaryCalendar).not.toEqual(januaryCalendar);
    });

    it('should maintain consistent calendar structure across months', () => {
      const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      
      months.forEach(monthIndex => {
        component['generate'](moment().month(monthIndex));
        
        expect(component.calendar.length).toBeGreaterThanOrEqual(4);
        expect(component.calendar.length).toBeLessThanOrEqual(6);
        
        component.calendar.forEach(week => {
          expect(week.days.length).toBe(7);
        });
      });
    });
  });
});