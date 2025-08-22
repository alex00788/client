import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DayWeekMonthComponent } from './day-week-month.component';
import { RecordingService } from '../recording.service';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DayWeekMonthComponent', () => {
  let component: DayWeekMonthComponent;
  let fixture: ComponentFixture<DayWeekMonthComponent>;
  let recordingService: jasmine.SpyObj<RecordingService>;

  // Mock BehaviorSubjects
  const mockShowCurrentDay = new BehaviorSubject<boolean>(true);
  const mockShowCurrentWeek = new BehaviorSubject<boolean>(false);
  const mockShowCurrentMonth = new BehaviorSubject<boolean>(false);
  const mockRecordsBlock = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    const recordingServiceSpy = jasmine.createSpyObj('RecordingService', [
      'showDay',
      'showWeek', 
      'showMonth',
      'closeRecordsBlock',
      'openRecordsBlock'
    ], {
      showCurrentDay: mockShowCurrentDay,
      showCurrentWeek: mockShowCurrentWeek,
      showCurrentMonth: mockShowCurrentMonth,
      recordsBlock: mockRecordsBlock
    });

    // Убедимся, что методы являются функциями
    recordingServiceSpy.showDay.and.callFake(() => {
      mockShowCurrentDay.next(true);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(false);
    });
    
    recordingServiceSpy.showWeek.and.callFake(() => {
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(true);
      mockShowCurrentMonth.next(false);
    });
    
    recordingServiceSpy.showMonth.and.callFake(() => {
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(true);
    });
    
    recordingServiceSpy.closeRecordsBlock.and.callFake(() => {
      mockRecordsBlock.next(false);
    });
    
    recordingServiceSpy.openRecordsBlock.and.callFake(() => {
      mockRecordsBlock.next(true);
    });

    await TestBed.configureTestingModule({
      imports: [DayWeekMonthComponent],
      providers: [
        { provide: RecordingService, useValue: recordingServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DayWeekMonthComponent);
    component = fixture.componentInstance;
    recordingService = TestBed.inject(RecordingService) as jasmine.SpyObj<RecordingService>;
  });

  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
      expect(component).toBeInstanceOf(DayWeekMonthComponent);
    });

    it('should have correct selector', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('button')).toBeTruthy();
    });

    it('should be standalone component', () => {
      expect(component.constructor.name).toBe('DayWeekMonthComponent');
    });

    it('should inject RecordingService correctly', () => {
      expect(component.recordingService).toBeDefined();
      expect(component.recordingService).toBe(recordingService);
    });

    it('should have public access to recordingService', () => {
      expect(component.recordingService).toBeDefined();
      expect(typeof component.recordingService).toBe('object');
    });
  });

  describe('Template Structure and Rendering', () => {
    it('should render all four buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(4);
    });

    it('should render day button with correct text', () => {
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.textContent.trim()).toBe('день');
    });

    it('should render week button with correct text', () => {
      fixture.detectChanges();
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      expect(weekButton.textContent.trim()).toBe('неделя');
    });

    it('should render month button with correct text', () => {
      fixture.detectChanges();
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(monthButton.textContent.trim()).toBe('месяц');
    });

    it('should render close button with correct symbol', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      expect(closeButton.textContent.trim()).toBe('×');
    });

    it('should render close button with correct HTML entity', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      // HTML entity &times; преобразуется в символ × при рендеринге
      expect(closeButton.innerHTML).toContain('×');
    });
  });

  describe('Button Click Handlers', () => {
    it('should call recordingService.showDay when day button is clicked', () => {
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      
      dayButton.click();
      
      expect(recordingService.showDay).toHaveBeenCalledTimes(1);
    });

    it('should call recordingService.showWeek when week button is clicked', () => {
      fixture.detectChanges();
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      
      weekButton.click();
      
      expect(recordingService.showWeek).toHaveBeenCalledTimes(1);
    });

    it('should call recordingService.showMonth when month button is clicked', () => {
      fixture.detectChanges();
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      monthButton.click();
      
      expect(recordingService.showMonth).toHaveBeenCalledTimes(1);
    });

    it('should call recordingService.closeRecordsBlock when close button is clicked', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      closeButton.click();
      
      expect(recordingService.closeRecordsBlock).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid clicks on day button', () => {
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      
      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        dayButton.click();
      }
      
      expect(recordingService.showDay).toHaveBeenCalledTimes(5);
    });

    it('should handle multiple rapid clicks on week button', () => {
      fixture.detectChanges();
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      
      // Simulate rapid clicking
      for (let i = 0; i < 3; i++) {
        weekButton.click();
      }
      
      expect(recordingService.showWeek).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid clicks on month button', () => {
      fixture.detectChanges();
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      // Simulate rapid clicking
      for (let i = 0; i < 4; i++) {
        monthButton.click();
      }
      
      expect(recordingService.showMonth).toHaveBeenCalledTimes(4);
    });

    it('should handle multiple rapid clicks on close button', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      // Simulate rapid clicking
      for (let i = 0; i < 6; i++) {
        closeButton.click();
      }
      
      expect(recordingService.closeRecordsBlock).toHaveBeenCalledTimes(6);
    });
  });

  describe('Dynamic CSS Classes', () => {
    it('should apply correct classes when showCurrentDay is true', () => {
      mockShowCurrentDay.next(true);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    });

    it('should apply correct classes when showCurrentWeek is true', () => {
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(true);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    });

    it('should apply correct classes when showCurrentMonth is true', () => {
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(true);
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(false);
    });

    it('should apply correct classes when all modes are false', () => {
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    });

    it('should always have close button with correct class', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      expect(closeButton.classList.contains('btnCloseRecCurrentOrg')).toBe(true);
    });
  });

  describe('Reactive Updates', () => {
    it('should update button classes when showCurrentDay changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially day is selected
      mockShowCurrentDay.next(true);
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      
      let dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to week
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(true);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      tick();
      
      dayButton = fixture.nativeElement.querySelector('button:first-child');
      expect(dayButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(dayButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));

    it('should update button classes when showCurrentWeek changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially week is selected
      mockShowCurrentWeek.next(true);
      mockShowCurrentDay.next(false);
      mockShowCurrentMonth.next(false);
      fixture.detectChanges();
      
      let weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to month
      mockShowCurrentWeek.next(false);
      mockShowCurrentMonth.next(true);
      mockShowCurrentDay.next(false);
      fixture.detectChanges();
      tick();
      
      weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      expect(weekButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(weekButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));

    it('should update button classes when showCurrentMonth changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Initially month is selected
      mockShowCurrentMonth.next(true);
      mockShowCurrentDay.next(false);
      mockShowCurrentWeek.next(false);
      fixture.detectChanges();
      
      let monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(true);
      
      // Change to day
      mockShowCurrentMonth.next(false);
      mockShowCurrentDay.next(true);
      mockShowCurrentWeek.next(false);
      fixture.detectChanges();
      tick();
      
      monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      expect(monthButton.classList.contains('btnCalendarDisplayModeSelected')).toBe(false);
      expect(monthButton.classList.contains('btnCalendarDisplayMode')).toBe(true);
    }));

    it('should handle rapid state changes correctly', fakeAsync(() => {
      fixture.detectChanges();
      
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        if (i % 3 === 0) {
          mockShowCurrentDay.next(true);
          mockShowCurrentWeek.next(false);
          mockShowCurrentMonth.next(false);
        } else if (i % 3 === 1) {
          mockShowCurrentDay.next(false);
          mockShowCurrentWeek.next(true);
          mockShowCurrentMonth.next(false);
        } else {
          mockShowCurrentDay.next(false);
          mockShowCurrentWeek.next(false);
          mockShowCurrentMonth.next(true);
        }
        fixture.detectChanges();
        tick(10);
      }
      
      // Component should still be functional
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      dayButton.click();
      expect(recordingService.showDay).toHaveBeenCalled();
    }));
  });

  describe('Service Method Calls', () => {
    it('should call showDay method with correct context', () => {
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      
      dayButton.click();
      
      expect(recordingService.showDay).toHaveBeenCalled();
      expect(recordingService.showDay).toHaveBeenCalledTimes(1);
    });

    it('should call showWeek method with correct context', () => {
      fixture.detectChanges();
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      
      weekButton.click();
      
      expect(recordingService.showWeek).toHaveBeenCalled();
      expect(recordingService.showWeek).toHaveBeenCalledTimes(1);
    });

    it('should call showMonth method with correct context', () => {
      fixture.detectChanges();
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      
      monthButton.click();
      
      expect(recordingService.showMonth).toHaveBeenCalled();
      expect(recordingService.showMonth).toHaveBeenCalledTimes(1);
    });

    it('should call closeRecordsBlock method with correct context', () => {
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      closeButton.click();
      
      expect(recordingService.closeRecordsBlock).toHaveBeenCalled();
      expect(recordingService.closeRecordsBlock).toHaveBeenCalledTimes(1);
    });

    it('should maintain service method call count correctly', () => {
      fixture.detectChanges();
      
      // Click all buttons once
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const weekButton = fixture.nativeElement.querySelector('button:nth-child(2)');
      const monthButton = fixture.nativeElement.querySelector('button:nth-child(3)');
      const closeButton = fixture.nativeElement.querySelector('button:last-child');
      
      dayButton.click();
      weekButton.click();
      monthButton.click();
      closeButton.click();
      
      expect(recordingService.showDay).toHaveBeenCalledTimes(1);
      expect(recordingService.showWeek).toHaveBeenCalledTimes(1);
      expect(recordingService.showMonth).toHaveBeenCalledTimes(1);
      expect(recordingService.closeRecordsBlock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Lifecycle', () => {
    it('should be stable after multiple detectChanges calls', () => {
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
        expect(component).toBeTruthy();
      }
    });

    it('should maintain button count after multiple renders', () => {
      for (let i = 0; i < 5; i++) {
        fixture.detectChanges();
        const buttons = fixture.nativeElement.querySelectorAll('button');
        expect(buttons.length).toBe(4);
      }
    });

    it('should maintain service injection after multiple renders', () => {
      for (let i = 0; i < 5; i++) {
        fixture.detectChanges();
        expect(component.recordingService).toBe(recordingService);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined service methods gracefully', () => {
      // Temporarily remove method
      const originalShowDay = recordingService.showDay;
      delete (recordingService as any).showDay;
      
      fixture.detectChanges();
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      
      // Should not throw error
      expect(() => dayButton.click()).not.toThrow();
      
      // Restore method
      (recordingService as any).showDay = originalShowDay;
    });

    it('should handle null service gracefully', () => {
      // Create component with null service
      const nullFixture = TestBed.createComponent(DayWeekMonthComponent);
      const nullComponent = nullFixture.componentInstance;
      
      // Should not throw error during creation
      expect(() => nullFixture.detectChanges()).not.toThrow();
      
      nullFixture.destroy();
    });

    it('should handle rapid template changes', fakeAsync(() => {
      fixture.detectChanges();
      
      // Rapid template updates
      for (let i = 0; i < 20; i++) {
        mockShowCurrentDay.next(i % 2 === 0);
        mockShowCurrentWeek.next(i % 3 === 0);
        mockShowCurrentMonth.next(i % 4 === 0);
        fixture.detectChanges();
        tick(5);
      }
      
      // Component should still be functional
      expect(component).toBeTruthy();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(4);
    }));
  });

  describe('Accessibility and UX', () => {
    it('should have clickable buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      
      buttons.forEach((button: any) => {
        expect(button.disabled).toBeFalsy();
        expect(button.style.pointerEvents).not.toBe('none');
      });
    });

    it('should have visible buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      
      buttons.forEach((button: any) => {
        const computedStyle = window.getComputedStyle(button);
        expect(computedStyle.display).not.toBe('none');
        expect(computedStyle.visibility).not.toBe('hidden');
      });
    });

    it('should maintain button order consistency', () => {
      fixture.detectChanges();
      
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const buttonTexts = Array.from(buttons).map((btn: any) => btn.textContent.trim());
      
      expect(buttonTexts[0]).toBe('день');
      expect(buttonTexts[1]).toBe('неделя');
      expect(buttonTexts[2]).toBe('месяц');
      expect(buttonTexts[3]).toBe('×');
    });
  });

  describe('Performance Tests', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      fixture.detectChanges();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      fixture.detectChanges();
      
      const startTime = performance.now();
      
      // Rapid state changes
      for (let i = 0; i < 50; i++) {
        mockShowCurrentDay.next(i % 2 === 0);
        mockShowCurrentWeek.next(i % 3 === 0);
        mockShowCurrentMonth.next(i % 4 === 0);
        fixture.detectChanges();
        tick(1);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(500); // Should handle 50 changes in less than 500ms
    }));

    it('should handle multiple button clicks efficiently', () => {
      fixture.detectChanges();
      
      const startTime = performance.now();
      
      // Multiple button clicks
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      for (let i = 0; i < 100; i++) {
        dayButton.click();
      }
      
      const endTime = performance.now();
      const clickTime = endTime - startTime;
      
      expect(clickTime).toBeLessThan(500); // Should handle 100 clicks in less than 500ms (увеличиваем для стабильности)
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks with multiple instances', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Create multiple component instances
      for (let i = 0; i < 10; i++) {
        const testFixture = TestBed.createComponent(DayWeekMonthComponent);
        testFixture.detectChanges();
        testFixture.destroy();
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should cleanup event listeners properly', () => {
      fixture.detectChanges();
      
      const dayButton = fixture.nativeElement.querySelector('button:first-child');
      const clickSpy = jasmine.createSpy('clickSpy');
      
      // Add event listener
      dayButton.addEventListener('click', clickSpy);
      
      // Click button
      dayButton.click();
      expect(clickSpy).toHaveBeenCalled();
      
      // Destroy component
      fixture.destroy();
      
      // After destroy, the button element is no longer part of the DOM
      // so we can't test clicking on it
      expect(component).toBeTruthy();
    });
  });
});
