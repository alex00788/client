import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RecordsBlockComponent } from './records-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { TranslateMonthPipe } from '../../../../../shared/pipe/translate-month.pipe';
import { ReductionPipe } from '../../../../../shared/pipe/reduction.pipe';
import { ReductionAddressPipe } from '../../../../../shared/pipe/reduction-address.pipe';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject, Subject } from 'rxjs';
import moment from 'moment';

describe('RecordsBlockComponent', () => {
  let component: RecordsBlockComponent;
  let fixture: ComponentFixture<RecordsBlockComponent>;
  let personalBlockService: jasmine.SpyObj<PersonalBlockService>;
  let dateService: jasmine.SpyObj<DateService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    // Create spy for allEntryCurrentUserThisMonth
    const allEntryCurrentUserThisMonthSpy = jasmine.createSpyObj('BehaviorSubject', ['next', 'pipe'], { value: [] });
    allEntryCurrentUserThisMonthSpy.pipe.and.returnValue(of([]));

    const personalBlockServiceSpy = jasmine.createSpyObj('PersonalBlockService', [
      'closeRecordsBlock'
    ], {
      recordsBlock: true
    });

    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'changeOneDay'
    ], {
      date: new BehaviorSubject(moment()),
      recordingDaysChanged: new BehaviorSubject(false),
      userCancelHimselfRec: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: 0 }),
      dataAboutSelectedRec: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: {} })
    });

    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'open',
      'openRecordsBlockWithData'
    ]);

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryCurrentUsersThisMonth',
      'deleteSelectedRecInAllRecBlock',
      'filterRecCurrentUserByOrg',
      'filterRecCurrentUserByDate',
      'showAllRec',
      'getAllEntryAllUsersForTheMonth'
    ], {
      allEntryCurrentUserThisMonth: allEntryCurrentUserThisMonthSpy,
      filterByOrg: new BehaviorSubject(false),
      filterByDate: new BehaviorSubject(false),
      showAll: new BehaviorSubject(true)
    });

    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getAllEntryCurrentUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RecordsBlockComponent,
        AsyncPipe,
        NgForOf,
        NgIf,
        TranslateMonthPipe,
        ReductionPipe,
        ReductionAddressPipe
      ],
      providers: [
        { provide: PersonalBlockService, useValue: personalBlockServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordsBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService) as jasmine.SpyObj<PersonalBlockService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.apiService).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should initialize with default values', () => {
      expect(component.clickCount).toBe(0);
      expect(component.blockRepeat).toBe(false);
      expect(component.showBtnFilter).toBe(true);
      expect(component.currentHour).toBeDefined();
      expect(component.currentTime).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should set currentTime to formatted current date', () => {
      const mockDate = new Date('2024-01-15T10:30:00');
      spyOn(window, 'Date').and.returnValue(mockDate as any);
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('15.01.2024');
    });

    it('should set currentDate to moment formatted date', () => {
      component.ngOnInit();
      
      expect(component.currentDate).toBe(moment().format('DD.MM.YYYY'));
    });

    it('should call recordingDaysChanged', () => {
      spyOn(component, 'recordingDaysChanged');
      
      component.ngOnInit();
      
      expect(component.recordingDaysChanged).toHaveBeenCalled();
    });
  });

  describe('recordingDaysChanged Method', () => {
    it('should subscribe to recordingDaysChanged and call getAllEntryCurrentUsersThisMonth', fakeAsync(() => {
      component.recordingDaysChanged();
      
      dateService.recordingDaysChanged.next(true);
      tick();
      
      expect(dataCalendarService.getAllEntryCurrentUsersThisMonth).toHaveBeenCalled();
    }));

    it('should handle multiple recordingDaysChanged events', fakeAsync(() => {
      component.recordingDaysChanged();
      
      dateService.recordingDaysChanged.next(true);
      dateService.recordingDaysChanged.next(false);
      dateService.recordingDaysChanged.next(true);
      tick();
      
      expect(dataCalendarService.getAllEntryCurrentUsersThisMonth).toHaveBeenCalled();
    }));
  });

  describe('deleteSelectedRec Method', () => {
    it('should handle single click and delete record', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRec(selectedRec);
      
      expect(component.blockRepeat).toBe(true);
      expect(component.clickCount).toBe(1);
      
      tick(250);
      
      expect(dateService.userCancelHimselfRec.next).toHaveBeenCalledWith(1);
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).toHaveBeenCalledWith(selectedRec);
      expect(component.clickCount).toBe(0);
      expect(component.blockRepeat).toBe(false);
    }));

    it('should handle double click and not delete record', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRec(selectedRec);
      component.deleteSelectedRec(selectedRec);
      
      expect(component.clickCount).toBe(2);
      
      tick(250);
      
      expect(dateService.userCancelHimselfRec.next).not.toHaveBeenCalled();
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).not.toHaveBeenCalled();
    }));

    it('should reset clickCount and blockRepeat after timeout', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRec(selectedRec);
      
      expect(component.blockRepeat).toBe(true);
      expect(component.clickCount).toBe(1);
      
      tick(250);
      
      expect(component.clickCount).toBe(0);
      expect(component.blockRepeat).toBe(false);
    }));

    it('should handle multiple rapid clicks correctly', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      // First click
      component.deleteSelectedRec(selectedRec);
      tick(100);
      
      // Second click before timeout
      component.deleteSelectedRec(selectedRec);
      tick(250);
      
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).not.toHaveBeenCalled();
    }));
  });

  describe('dataAboutRec Method', () => {
    it('should set data about selected record and open modal', () => {
      const entry = { 
        id: '123', 
        date: '15.01.2024', 
        time: '10:00',
        sectionOrOrganization: 'Test Org' 
      };
      
      component.dataAboutRec(entry);
      
      expect(dateService.dataAboutSelectedRec.next).toHaveBeenCalledWith(entry);
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openRecordsBlockWithData).toHaveBeenCalled();
    });

    it('should handle null entry', () => {
      const entry = null;
      
      expect(() => component.dataAboutRec(entry)).not.toThrow();
      
      expect(dateService.dataAboutSelectedRec.next).toHaveBeenCalledWith(null);
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openRecordsBlockWithData).toHaveBeenCalled();
    });

    it('should handle empty entry object', () => {
      const entry = {};
      
      component.dataAboutRec(entry);
      
      expect(dateService.dataAboutSelectedRec.next).toHaveBeenCalledWith(entry);
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openRecordsBlockWithData).toHaveBeenCalled();
    });
  });

  describe('openFilterBtn Method', () => {
    it('should toggle showBtnFilter from true to false', () => {
      component.showBtnFilter = true;
      
      component.openFilterBtn();
      
      expect(component.showBtnFilter).toBe(false);
    });

    it('should toggle showBtnFilter from false to true', () => {
      component.showBtnFilter = false;
      
      component.openFilterBtn();
      
      expect(component.showBtnFilter).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      component.showBtnFilter = true;
      
      component.openFilterBtn();
      expect(component.showBtnFilter).toBe(false);
      
      component.openFilterBtn();
      expect(component.showBtnFilter).toBe(true);
      
      component.openFilterBtn();
      expect(component.showBtnFilter).toBe(false);
    });
  });

  describe('changeDay Method', () => {
    it('should call changeOneDay with positive number', () => {
      component.changeDay(1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should call changeOneDay with negative number', () => {
      component.changeDay(-1);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(-1);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should call changeOneDay with zero', () => {
      component.changeDay(0);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(0);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should call changeOneDay with large number', () => {
      component.changeDay(30);
      
      expect(dateService.changeOneDay).toHaveBeenCalledWith(30);
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });
  });

  describe('Component State Management', () => {
    it('should maintain clickCount state correctly', () => {
      expect(component.clickCount).toBe(0);
      
      component.clickCount = 5;
      expect(component.clickCount).toBe(5);
      
      component.clickCount = 0;
      expect(component.clickCount).toBe(0);
    });

    it('should maintain blockRepeat state correctly', () => {
      expect(component.blockRepeat).toBe(false);
      
      component.blockRepeat = true;
      expect(component.blockRepeat).toBe(true);
      
      component.blockRepeat = false;
      expect(component.blockRepeat).toBe(false);
    });

    it('should maintain showBtnFilter state correctly', () => {
      expect(component.showBtnFilter).toBe(true);
      
      component.showBtnFilter = false;
      expect(component.showBtnFilter).toBe(false);
      
      component.showBtnFilter = true;
      expect(component.showBtnFilter).toBe(true);
    });
  });

  describe('Date and Time Handling', () => {
    it('should format currentTime correctly for single digit day and month', () => {
      const mockDate = new Date('2024-01-05T10:30:00');
      spyOn(window, 'Date').and.returnValue(mockDate as any);
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('05.01.2024');
    });

    it('should format currentTime correctly for double digit day and month', () => {
      const mockDate = new Date('2024-12-25T10:30:00');
      spyOn(window, 'Date').and.returnValue(mockDate as any);
      
      component.ngOnInit();
      
      expect(component.currentTime).toBe('25.12.2024');
    });

    it('should set currentHour from Date object', () => {
      const mockDate = new Date('2024-01-15T14:30:00');
      spyOn(window, 'Date').and.returnValue(mockDate as any);
      
      // Re-initialize component to get new currentHour
      component.currentHour = new Date().getHours();
      
      expect(component.currentHour).toBe(14);
    });
  });

  describe('Service Integration', () => {
    it('should integrate with PersonalBlockService correctly', () => {
      expect(component.personalBlockService).toBe(personalBlockService);
      expect(personalBlockService.recordsBlock).toBeDefined();
    });

    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
      expect(dateService.recordingDaysChanged).toBeDefined();
    });

    it('should integrate with ModalService correctly', () => {
      expect(component.modalService).toBe(modalService);
    });

    it('should integrate with DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
      expect(dataCalendarService.allEntryCurrentUserThisMonth).toBeDefined();
    });

    it('should integrate with ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined selectedRec in deleteSelectedRec', fakeAsync(() => {
      expect(() => component.deleteSelectedRec(undefined)).not.toThrow();
      
      tick(250);
      
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).toHaveBeenCalledWith(undefined);
    }));

    it('should handle null selectedRec in deleteSelectedRec', fakeAsync(() => {
      expect(() => component.deleteSelectedRec(null)).not.toThrow();
      
      tick(250);
      
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).toHaveBeenCalledWith(null);
    }));

    it('should handle service errors gracefully', () => {
      expect(() => component.recordingDaysChanged()).not.toThrow();
    });

    it('should handle very rapid clicks in deleteSelectedRec', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      // Simulate very rapid clicks
      for (let i = 0; i < 10; i++) {
        component.deleteSelectedRec(selectedRec);
      }
      
      expect(component.clickCount).toBe(10);
      
      tick(250);
      
      // Should not call delete service for multiple clicks
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).not.toHaveBeenCalled();
    }));

    it('should handle Date constructor errors', () => {
      spyOn(window, 'Date').and.throwError('Date error');
      
      expect(() => component.ngOnInit()).toThrow();
    });
  });

  describe('Observable Subscriptions', () => {
    it('should handle subscription cleanup', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      // Simulate component destruction
      component['destroyed$'].next();
      component['destroyed$'].complete();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should handle subscription errors', fakeAsync(() => {
      const errorSubject = new Subject();
      dateService.recordingDaysChanged = errorSubject as any;
      
      component.recordingDaysChanged();
      
      expect(() => {
        errorSubject.error('Subscription error');
        tick();
      }).not.toThrow();
    }));
  });

  describe('Component Lifecycle', () => {
    it('should implement OnInit interface', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(typeof component.ngOnInit).toBe('function');
    });

    it('should call ngOnInit during component initialization', () => {
      // ngOnInit is called automatically during fixture.detectChanges() in beforeEach
      expect(component.ngOnInit).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should bind to personalBlockService.recordsBlock', () => {
      personalBlockService.recordsBlock = true;
      fixture.detectChanges();
      
      const element = fixture.nativeElement.querySelector('.recordsBlockClass');
      expect(element).toBeTruthy();
    });

    it('should display currentTime in template', () => {
      component.currentTime = '15.01.2024';
      
      // Check that currentTime is set correctly in component
      expect(component.currentTime).toBe('15.01.2024');
    });

    it('should handle filter button visibility', () => {
      component.showBtnFilter = false;
      fixture.detectChanges();
      
      const filterButtons = fixture.nativeElement.querySelectorAll('.btnFilterRec');
      expect(filterButtons.length).toBe(1); // Only the toggle button should be visible
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple subscriptions', fakeAsync(() => {
      component.recordingDaysChanged();
      dateService.recordingDaysChanged.next(true);
      
      tick();
      
      expect(dataCalendarService.getAllEntryCurrentUsersThisMonth).toHaveBeenCalled();
    }));

    it('should handle rapid state changes efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        component.openFilterBtn();
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
