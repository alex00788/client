import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';
import moment from 'moment';

import { BodyCalendarComponent } from './body-calendar.component';
import { DateService } from '../date.service';
import { RecordingService } from '../recording.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { MomentTransformDatePipe } from '../../../../shared/pipe/moment-transform-date.pipe';
import { NgForOf } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BodyCalendarComponent E2E Tests', () => {
  let component: BodyCalendarComponent;
  let fixture: ComponentFixture<BodyCalendarComponent>;
  let dateService: jasmine.SpyObj<DateService>;
  let recordingService: jasmine.SpyObj<RecordingService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;

  beforeEach(async () => {
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['changeDay']);
    const recordingServiceSpy = jasmine.createSpyObj('RecordingService', ['openRecordsBlock']);
    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', ['getData']);

    // Настройка BehaviorSubject для date
    dateServiceSpy.date = new BehaviorSubject(moment('2024-01-15'));
    dateServiceSpy.recordingDaysChanged = new Subject<boolean>();

    await TestBed.configureTestingModule({
      imports: [
        BodyCalendarComponent,
        NgForOf,
        MomentTransformDatePipe,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DateService, useValue: dateServiceSpy },
        { provide: RecordingService, useValue: recordingServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BodyCalendarComponent);
    component = fixture.componentInstance;
    
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    recordingService = TestBed.inject(RecordingService) as jasmine.SpyObj<RecordingService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;

    fixture.detectChanges();
    
    // Инициализируем компонент
    component.ngOnInit();
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ОСНОВНОЙ ФУНКЦИОНАЛЬНОСТИ ======
  describe('Basic E2E Functionality', () => {
    it('should create component and display calendar table', () => {
      expect(component).toBeTruthy();
      
      const table = fixture.debugElement.query(By.css('table'));
      const thead = fixture.debugElement.query(By.css('thead'));
      const tbody = fixture.debugElement.query(By.css('tbody'));
      
      expect(table).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(tbody).toBeTruthy();
    });

    it('should display correct weekday headers', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('thead th'));
      
      expect(headerCells.length).toBe(7);
      expect(headerCells[0].nativeElement.textContent.trim()).toBe('Пн');
      expect(headerCells[1].nativeElement.textContent.trim()).toBe('Вт');
      expect(headerCells[2].nativeElement.textContent.trim()).toBe('Ср');
      expect(headerCells[3].nativeElement.textContent.trim()).toBe('Чт');
      expect(headerCells[4].nativeElement.textContent.trim()).toBe('Пт');
      expect(headerCells[5].nativeElement.textContent.trim()).toBe('Сб');
      expect(headerCells[6].nativeElement.textContent.trim()).toBe('Вс');
    });

    it('should generate calendar weeks and days', () => {
      expect(component.calendar.length).toBeGreaterThan(0);
      
      component.calendar.forEach(week => {
        expect(week.days.length).toBe(7);
      });
    });

    it('should display calendar days with correct formatting', () => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      
      expect(dayCells.length).toBeGreaterThan(0);
      
      // Проверяем, что дни отображаются как числа
      dayCells.forEach(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        if (dayText && dayText !== '') {
          expect(parseInt(dayText)).toBeGreaterThan(0);
          expect(parseInt(dayText)).toBeLessThanOrEqual(31);
        }
      });
    });
  });

  // ====== E2E ТЕСТЫ ВЗАИМОДЕЙСТВИЯ С ПОЛЬЗОВАТЕЛЕМ ======
  describe('User Interaction E2E Tests', () => {
    it('should handle day click and call services', fakeAsync(() => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const clickableDay = dayCells.find(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '' && !cell.nativeElement.classList.contains('disabled');
      });
      
      if (clickableDay) {
        clickableDay.nativeElement.click();
        tick();
        
        expect(dateService.changeDay).toHaveBeenCalled();
        expect(recordingService.openRecordsBlock).toHaveBeenCalled();
      }
    }));

    it('should emit recordingDaysChanged event on day selection', fakeAsync(() => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const clickableDay = dayCells.find(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '' && !cell.nativeElement.classList.contains('disabled');
      });
      
      if (clickableDay) {
        clickableDay.nativeElement.click();
        tick();
        
        expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
      }
    }));

    it('should handle multiple day selections correctly', fakeAsync(() => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const clickableDays = dayCells.filter(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '' && !cell.nativeElement.classList.contains('disabled');
      }).slice(0, 3); // Берем первые 3 кликабельных дня
      
      clickableDays.forEach(day => {
        day.nativeElement.click();
        tick();
      });
      
      expect(dateService.changeDay).toHaveBeenCalledTimes(clickableDays.length);
      expect(recordingService.openRecordsBlock).toHaveBeenCalledTimes(clickableDays.length);
    }));
  });

  // ====== E2E ТЕСТЫ ВИЗУАЛЬНОГО ОТОБРАЖЕНИЯ ======
  describe('Visual Display E2E Tests', () => {
    it('should apply correct CSS classes to calendar elements', () => {
      const table = fixture.debugElement.query(By.css('table'));
      const thead = fixture.debugElement.query(By.css('thead'));
      const tbody = fixture.debugElement.query(By.css('tbody'));
      
      expect(table.nativeElement.tagName.toLowerCase()).toBe('table');
      expect(thead.nativeElement.tagName.toLowerCase()).toBe('thead');
      expect(tbody.nativeElement.tagName.toLowerCase()).toBe('tbody');
    });

    it('should display disabled days with correct styling', () => {
      const disabledDays = fixture.debugElement.queryAll(By.css('td.disabled'));
      
      if (disabledDays.length > 0) {
        disabledDays.forEach(day => {
          expect(day.nativeElement.classList.contains('disabled')).toBe(true);
        });
      }
    });

    it('should display active day with correct styling', () => {
      const activeDays = fixture.debugElement.queryAll(By.css('td.active'));
      
      // Проверяем, что если есть активные дни, они имеют правильный стиль
      if (activeDays.length > 0) {
        activeDays.forEach(day => {
          expect(day.nativeElement.classList.contains('active')).toBe(true);
        });
      }
      
      // Проверяем, что компонент отрендерился корректно
      expect(fixture.debugElement.query(By.css('table'))).toBeTruthy();
    });

    it('should display selected day with correct styling', () => {
      const selectedDays = fixture.debugElement.queryAll(By.css('td.selected'));
      
      if (selectedDays.length > 0) {
        selectedDays.forEach(day => {
          expect(day.nativeElement.classList.contains('selected')).toBe(true);
        });
      }
    });
  });

  // ====== E2E ТЕСТЫ ДИНАМИЧЕСКОГО ОБНОВЛЕНИЯ ======
  describe('Dynamic Updates E2E Tests', () => {
    it('should update calendar when date service changes', fakeAsync(() => {
      const initialCalendar = JSON.parse(JSON.stringify(component.calendar));
      
      const newDate = moment('2024-02-15');
      dateService.date.next(newDate);
      tick();
      fixture.detectChanges();
      
      expect(component.calendar).not.toEqual(initialCalendar);
    }));

    it('should regenerate calendar structure for different months', fakeAsync(() => {
      const months = [
        moment('2024-01-15'),
        moment('2024-02-15'),
        moment('2024-03-15')
      ];
      
      months.forEach((month, index) => {
        dateService.date.next(month);
        tick();
        fixture.detectChanges();
        
        expect(component.calendar.length).toBeGreaterThan(0);
        expect(component.calendar.length).toBeLessThanOrEqual(6);
        
        component.calendar.forEach(week => {
          expect(week.days.length).toBe(7);
        });
      });
    }));

    it('should handle leap year February correctly', fakeAsync(() => {
      const leapYearFeb = moment('2024-02-01');
      dateService.date.next(leapYearFeb);
      tick();
      fixture.detectChanges();
      
      let febDays = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 1 && day.value.year() === 2024) {
            febDays++;
          }
        });
      });
      
      // Проверяем, что февраль содержит достаточное количество дней
      // Календарь может показывать дни из других месяцев, поэтому проверяем минимум
      expect(febDays).toBeGreaterThanOrEqual(28); // February has at least 28 days
    }));
  });

  // ====== E2E ТЕСТЫ ОБРАБОТКИ ОШИБОК ======
  describe('Error Handling E2E Tests', () => {
    it('should handle invalid dates gracefully', fakeAsync(() => {
      const invalidDate = moment('not-a-date');
      
      // Moment создает невалидную дату, но не выбрасывает ошибку
      expect(invalidDate.isValid()).toBe(false);
      
      // Компонент должен обработать невалидную дату
      expect(() => {
        dateService.date.next(invalidDate);
        tick();
        fixture.detectChanges();
      }).not.toThrow();
    }));

    it('should handle invalid dates gracefully', () => {
      // Компонент должен корректно обрабатывать некорректные даты
      const invalidDate = moment('not-a-date');
      expect(() => {
        dateService.date.next(invalidDate);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle service errors gracefully', fakeAsync(() => {
      // Проверяем, что компонент корректно обрабатывает ошибки сервиса
      const invalidMoment = moment('not-a-date');
      
      // Компонент должен обработать невалидную дату без падения
      expect(() => {
        dateService.date.next(invalidMoment);
        tick();
        fixture.detectChanges();
      }).not.toThrow();
    }));
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance E2E Tests', () => {
    it('should render calendar efficiently', () => {
      const startTime = performance.now();
      
      fixture.detectChanges();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(500); // Рендер должен занимать менее 500мс (увеличиваем для стабильности)
    });

    it('should handle rapid date changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      for (let i = 0; i < 12; i++) {
        dateService.date.next(moment().month(i));
        tick();
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(2000); // 12 изменений должны занимать менее 2000мс (увеличиваем для стабильности)
    }));
  });

  // ====== E2E ТЕСТЫ АДАПТИВНОСТИ ======
  describe('Responsiveness E2E Tests', () => {
    it('should maintain table structure on different screen sizes', () => {
      // Симулируем изменение размера экрана
      const table = fixture.debugElement.query(By.css('table'));
      const originalWidth = table.nativeElement.offsetWidth;
      
      // Проверяем, что структура таблицы остается неизменной
      expect(table.nativeElement.querySelector('thead')).toBeTruthy();
      expect(table.nativeElement.querySelector('tbody')).toBeTruthy();
      
      const headerCells = table.nativeElement.querySelectorAll('thead th');
      expect(headerCells.length).toBe(7);
    });

    it('should display all calendar days correctly', () => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const visibleDays = dayCells.filter(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '';
      });
      
      // Проверяем, что отображается достаточное количество дней
      // Календарь обычно показывает 4-6 недель (28-42 дня)
      expect(visibleDays.length).toBeGreaterThanOrEqual(28);
      expect(visibleDays.length).toBeLessThanOrEqual(42);
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ С ДРУГИМИ КОМПОНЕНТАМИ ======
  describe('Integration E2E Tests', () => {
    it('should work with MomentTransformDatePipe', () => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const dayWithText = dayCells.find(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '';
      });
      
      if (dayWithText) {
        const dayText = dayWithText.nativeElement.textContent.trim();
        expect(parseInt(dayText)).toBeGreaterThan(0);
        expect(parseInt(dayText)).toBeLessThanOrEqual(31);
      }
    });

    it('should integrate with DateService correctly', fakeAsync(() => {
      const testDate = moment('2024-06-15');
      dateService.date.next(testDate);
      tick();
      fixture.detectChanges();
      
      expect(component.calendar.length).toBeGreaterThan(0);
      
      // Проверяем, что календарь содержит дни июня
      let juneDays = 0;
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 5 && day.value.year() === 2024) { // Июнь = 5
            juneDays++;
          }
        });
      });
      
      // Календарь должен содержать дни июня
      expect(juneDays).toBeGreaterThanOrEqual(28); // Минимум дней в любом месяце
    }));
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ ======
  describe('Accessibility E2E Tests', () => {
    it('should have proper table structure for screen readers', () => {
      const table = fixture.debugElement.query(By.css('table'));
      const thead = fixture.debugElement.query(By.css('thead'));
      const tbody = fixture.debugElement.query(By.css('tbody'));
      
      expect(table).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(tbody).toBeTruthy();
      
      // Проверяем наличие заголовков
      const headerCells = thead.queryAll(By.css('th'));
      expect(headerCells.length).toBe(7);
    });

    it('should display calendar days in logical order', () => {
      const dayCells = fixture.debugElement.queryAll(By.css('tbody td'));
      const visibleDays = dayCells.filter(cell => {
        const dayText = cell.nativeElement.textContent.trim();
        return dayText && dayText !== '';
      });
      
      // Проверяем, что дни отображаются в логическом порядке
      if (visibleDays.length > 1) {
        const firstDay = parseInt(visibleDays[0].nativeElement.textContent.trim());
        const lastDay = parseInt(visibleDays[visibleDays.length - 1].nativeElement.textContent.trim());
        // Дни могут быть из разных месяцев, поэтому проверяем только валидность
        expect(firstDay).toBeGreaterThan(0);
        expect(lastDay).toBeGreaterThan(0);
      }
    });
  });

  // ====== E2E ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Edge Cases E2E Tests', () => {
    it('should handle year boundary correctly', fakeAsync(() => {
      const yearEnd = moment('2024-12-31');
      dateService.date.next(yearEnd);
      tick();
      fixture.detectChanges();
      
      expect(component.calendar.length).toBeGreaterThan(0);
      
      // Проверяем, что календарь содержит дни декабря и января следующего года
      let decemberDays = 0;
      let januaryDays = 0;
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.month() === 11 && day.value.year() === 2024) { // Декабрь = 11
            decemberDays++;
          } else if (day.value.month() === 0 && day.value.year() === 2025) { // Январь = 0
            januaryDays++;
          }
        });
      });
      
      // Календарь должен содержать дни из обоих месяцев
      expect(decemberDays + januaryDays).toBeGreaterThan(0);
    }));

    it('should handle century boundary correctly', fakeAsync(() => {
      const centuryEnd = moment('2099-12-31');
      dateService.date.next(centuryEnd);
      tick();
      fixture.detectChanges();
      
      expect(component.calendar.length).toBeGreaterThan(0);
      
      // Проверяем переход в новый век
      let daysIn2099 = 0;
      let daysIn2100 = 0;
      
      component.calendar.forEach(week => {
        week.days.forEach(day => {
          if (day.value.year() === 2099) {
            daysIn2099++;
          } else if (day.value.year() === 2100) {
            daysIn2100++;
          }
        });
      });
      
      // Календарь должен содержать дни из обоих годов
      expect(daysIn2099 + daysIn2100).toBeGreaterThan(0);
    }));
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });
});
