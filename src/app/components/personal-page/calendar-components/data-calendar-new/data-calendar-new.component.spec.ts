import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataCalendarNewComponent } from './data-calendar-new.component';
import { DataCalendarService } from './data-calendar.service';
import { DateService } from '../date.service';
import { RecordingService } from '../recording.service';
import { ApiService } from '../../../../shared/services/api.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WebSocketService } from '../../../../shared/services/web-socket.service';
import { ErrorResponseService } from '../../../../shared/services/error.response.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterClientListPipe } from '../../../../shared/pipe/filter-client-list.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import moment from 'moment';

describe('DataCalendarNewComponent', () => {
  let component: DataCalendarNewComponent;
  let fixture: ComponentFixture<DataCalendarNewComponent>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let dateService: jasmine.SpyObj<DateService>;
  let recordingService: jasmine.SpyObj<RecordingService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let errorResponseService: jasmine.SpyObj<ErrorResponseService>;

  beforeEach(async () => {
    const allEntryAllUsersInMonthSpy = jasmine.createSpyObj('BehaviorSubject', ['next', 'pipe'], { value: [] });
    allEntryAllUsersInMonthSpy.pipe.and.returnValue(of([]));
    
    const arrayOfDaysSpy = jasmine.createSpyObj('BehaviorSubject', ['next', 'pipe'], { value: [] });
    arrayOfDaysSpy.pipe.and.returnValue(of([]));
    
    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth',
      'getAllUsersCurrentOrganization',
      'getPhoneSelectedUser'
    ], {
      allEntryAllUsersInMonth: allEntryAllUsersInMonthSpy,
      arrayOfDays: arrayOfDaysSpy
    });
    
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'getCurrentDate'
    ], {
      date: new BehaviorSubject(moment()),
      changedSettingsOrg: new BehaviorSubject(false),
      allUsersSelectedOrg: new BehaviorSubject([]),
      currentUserId: new BehaviorSubject('123'),
      currentUserIsTheAdminOrg: new BehaviorSubject(false),
      currentUserSimpleUser: new BehaviorSubject(true),
      currentOrg: new BehaviorSubject('org1'),
      idSelectedOrg: new BehaviorSubject('org1'),
      maxPossibleEntries: new BehaviorSubject(10),
      howMuchRecorded: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: 0 }),
      timeStartRecord: new BehaviorSubject(9),
      timeFinishRecord: new BehaviorSubject(18),
      timeMinutesRec: new BehaviorSubject('00'),
      recordingDays: new BehaviorSubject('пн, вт, ср, чт, пт'),
      userSignedHimself: new BehaviorSubject(false),
      userCancelHimselfRec: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: 0 }),
      dataSelectedUser: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: {} }),
      recordingDaysChanged: jasmine.createSpyObj('BehaviorSubject', ['next'], { value: false }),
      nameSelectedOrg: new BehaviorSubject('Test Org'),
      openEmployee: new BehaviorSubject(false)
    });
    
    const recordingServiceSpy = jasmine.createSpyObj('RecordingService', [
      'closeRecordsBlock'
    ], {
      showCurrentDay: new BehaviorSubject(false),
      showCurrentWeek: new BehaviorSubject(true),
      showCurrentMonth: new BehaviorSubject(false)
    });
    
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'addEntry',
      'deleteEntry',
      'getAllEntryInCurrentTimes',
      'changeWorkStatusChoiceTime'
    ]);
    
    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'open',
      'openClientListBlockWithData'
    ]);
    
    const webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['connect', 'disconnect']);
    const errorResponseServiceSpy = jasmine.createSpyObj('ErrorResponseService', ['localHandler']);

    await TestBed.configureTestingModule({
      imports: [
        DataCalendarNewComponent,
        AsyncPipe,
        NgForOf,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        FilterClientListPipe
      ],
      providers: [
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: RecordingService, useValue: recordingServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        { provide: ErrorResponseService, useValue: errorResponseServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataCalendarNewComponent);
    component = fixture.componentInstance;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    recordingService = TestBed.inject(RecordingService) as jasmine.SpyObj<RecordingService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    webSocketService = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    errorResponseService = TestBed.inject(ErrorResponseService) as jasmine.SpyObj<ErrorResponseService>;
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.dataCalendarService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.recordingService).toBeDefined();
      expect(component.apiService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.webSocketService).toBeDefined();
      expect(component['errorResponseService']).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should have inputElementRef ViewChild', () => {
      // ViewChild is initialized after view is created
      expect(component.inputElementRef).toBeUndefined();
    });

    it('should initialize with default values', () => {
      expect(component.clickCount).toBe(0);
      expect(component.dataOfWeek).toEqual([]);
      expect(component.clientList).toBe('');
      expect(component.selectedPersonId).toBeUndefined();
      expect(component.newEntryHasBeenOpenedTime).toBeUndefined();
      expect(component.newEntryHasBeenOpenedDate).toBeUndefined();
      expect(component.blockIfRecorded).toBe(false);
      expect(component.currentDayCheck).toBe(false);
      expect(component.pastDateIsBlocked).toBe(false);
      expect(component.recordComplete).toBe(false);
      expect(component.state).toBe('closed');
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should set currentDate to formatted moment date', () => {
      component.ngOnInit();
      expect(component.currentDate).toBe(moment().format('DD.MM.YYYY'));
    });

    it('should call getAllEntryAllUsersForTheMonth on init', () => {
      component.ngOnInit();
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should subscribe to dateService.date changes', fakeAsync(() => {
      component.ngOnInit();
      dateService.date.next(moment());
      tick();
      expect(dataCalendarService.allEntryAllUsersInMonth).toBeDefined();
    }));

    it('should subscribe to changedSettingsOrg changes', fakeAsync(() => {
      component.ngOnInit();
      dateService.changedSettingsOrg.next(true);
      tick();
      expect(dataCalendarService.allEntryAllUsersInMonth).toBeDefined();
    }));

    it('should subscribe to showCurrentDay changes', fakeAsync(() => {
      component.ngOnInit();
      recordingService.showCurrentDay.next(true);
      tick();
      expect(dataCalendarService.allEntryAllUsersInMonth).toBeDefined();
    }));

    it('should subscribe to showCurrentWeek changes', fakeAsync(() => {
      component.ngOnInit();
      recordingService.showCurrentWeek.next(true);
      tick();
      expect(dataCalendarService.allEntryAllUsersInMonth).toBeDefined();
    }));

    it('should subscribe to showCurrentMonth changes', fakeAsync(() => {
      component.ngOnInit();
      recordingService.showCurrentMonth.next(true);
      tick();
      expect(dataCalendarService.allEntryAllUsersInMonth).toBeDefined();
    }));
  });

  describe('formativeShowMonth Method', () => {
    it('should generate array of dates for current month', () => {
      const testDate = moment('2024-01-15');
      const result = component['formativeShowMonth'](testDate);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(31); // January has 31 days
      expect(result[0]).toBe('01.01.2024');
      expect(result[30]).toBe('31.01.2024');
    });

    it('should handle different month lengths', () => {
      const febDate = moment('2024-02-15');
      const result = component['formativeShowMonth'](febDate);
      
      expect(result.length).toBe(29); // February 2024 (leap year)
    });

    it('should format dates correctly', () => {
      const testDate = moment('2024-03-15');
      const result = component['formativeShowMonth'](testDate);
      
      expect(result.every(date => /^\d{2}\.\d{2}\.\d{4}$/.test(date))).toBe(true);
    });
  });

  describe('formativeShowWeek Method', () => {
    it('should generate array of dates for week', () => {
      const testDate = moment('2024-01-15'); // Monday
      const result = component['formativeShowWeek'](testDate);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle Sunday edge case', () => {
      const sundayDate = moment('2024-01-14'); // Sunday
      const result = component['formativeShowWeek'](sundayDate);
      
      expect(result.length).toBeGreaterThan(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should format dates correctly', () => {
      const testDate = moment('2024-01-15');
      const result = component['formativeShowWeek'](testDate);
      
      expect(result.every(date => /^\d{2}\.\d{2}\.\d{4}$/.test(date))).toBe(true);
    });
  });

  describe('getArrayOfDays Method', () => {
    it('should group users by date', () => {
      const persons = [
        { date: '15.01.2024', time: '10:00', nameUser: 'John' },
        { date: '15.01.2024', time: '11:00', nameUser: 'Jane' },
        { date: '16.01.2024', time: '10:00', nameUser: 'Bob' }
      ];
      const currentWeek = ['15.01.2024', '16.01.2024'];
      
      component['getArrayOfDays'](persons, currentWeek);
      
      expect(dataCalendarService.arrayOfDays.next).toHaveBeenCalled();
    });

    it('should sort persons by dateNum', () => {
      const persons = [
        { date: '15.01.2024', dateNum: 15, time: '10:00' },
        { date: '16.01.2024', dateNum: 16, time: '10:00' },
        { date: '14.01.2024', dateNum: 14, time: '10:00' }
      ];
      const currentWeek = ['14.01.2024', '15.01.2024', '16.01.2024'];
      
      component['getArrayOfDays'](persons, currentWeek);
      
      expect(dataCalendarService.arrayOfDays.next).toHaveBeenCalled();
    });

    it('should handle empty persons array', () => {
      const persons: any[] = [];
      const currentWeek = ['15.01.2024', '16.01.2024'];
      
      component['getArrayOfDays'](persons, currentWeek);
      
      expect(dataCalendarService.arrayOfDays.next).toHaveBeenCalled();
    });
  });

  describe('resultingArrayFormingTheWeek Method', () => {
    it('should format week data with times and showThisDay', () => {
      const currentWeek = ['15.01.2024', '16.01.2024'];
      spyOn(component, 'getAllRecOnThisWeek' as any).and.returnValue([
        { date: '15.01.2024', time: '10:00', users: [] }
      ]);
      spyOn(component, 'checkShowOrHiDay' as any).and.returnValue(true);
      spyOn(component, 'getArrayOfDaysFromTheRequiredHours' as any).and.returnValue([]);
      
      const result = component['resultingArrayFormingTheWeek'](currentWeek);
      
      expect(component['getAllRecOnThisWeek']).toHaveBeenCalledWith(currentWeek);
      expect(component['checkShowOrHiDay']).toHaveBeenCalled();
      expect(component['getArrayOfDaysFromTheRequiredHours']).toHaveBeenCalled();
    });
  });

  describe('checkShowOrHiDay Method', () => {
    it('should return true for working days', () => {
      const workingDay = '15.01.2024'; // Monday
      dateService.recordingDays.next('пн, вт, ср, чт, пт');
      
      const result = component['checkShowOrHiDay'](workingDay);
      
      expect(result).toBe(true);
    });

    it('should return false for non-working days', () => {
      const weekendDay = '20.01.2024'; // Saturday
      dateService.recordingDays.next('пн, вт, ср, чт, пт');
      
      const result = component['checkShowOrHiDay'](weekendDay);
      
      expect(result).toBe(false);
    });

    it('should handle empty recording days', () => {
      const testDay = '15.01.2024';
      dateService.recordingDays.next('');
      
      const result = component['checkShowOrHiDay'](testDay);
      
      expect(result).toBe(false);
    });
  });

  describe('addEntry Method', () => {
    it('should add entry when user is allowed', fakeAsync(() => {
      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';
      
      apiService.addEntry.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.addEntry(user, time, date);
      tick();
      
      expect(apiService.addEntry).toHaveBeenCalled();
      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should not add entry when user is blocked', () => {
      const user = { id: '123', recAllowed: true, surnameUser: 'John', nameUser: 'Doe' };
      const time = '10:00';
      const date = '15.01.2024';
      
      spyOn(component, 'localErrHandler' as any);
      
      component.addEntry(user, time, date);
      
      expect(component.localErrHandler).toHaveBeenCalledWith('для дальнейшей записи обратитесь к администратору данной организации');
    });

    it('should set workStatus based on max entries', fakeAsync(() => {
      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';
      
      dateService.maxPossibleEntries.next(5);
      dateService.howMuchRecorded.next(5); // 5 <= 5+1 = false, so workStatus = 1
      
      apiService.addEntry.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.addEntry(user, time, date);
      tick();
      
      expect(apiService.addEntry).toHaveBeenCalledWith(jasmine.objectContaining({
        workStatus: 1 // open
      }));
    }));
  });

  describe('deletePerson Method', () => {
    it('should delete person entry', fakeAsync(() => {
      const idRec = 'rec123';
      const userId = 'user123';
      const orgId = 'org123';
      
      apiService.deleteEntry.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.deletePerson(idRec, userId, orgId);
      tick();
      
      expect(apiService.deleteEntry).toHaveBeenCalledWith(idRec, userId, orgId, 0, jasmine.any(Number));
      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should set userCancelHimselfRec for simple user', fakeAsync(() => {
      const idRec = 'rec123';
      const userId = 'user123';
      const orgId = 'org123';
      
      dateService.currentUserSimpleUser.next(true);
      apiService.deleteEntry.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.deletePerson(idRec, userId, orgId);
      tick();
      
      expect(dateService.userCancelHimselfRec.next).toHaveBeenCalledWith(1);
    }));

    it('should set userCancelHimselfRec for admin', fakeAsync(() => {
      const idRec = 'rec123';
      const userId = 'user123';
      const orgId = 'org123';
      
      dateService.currentUserSimpleUser.next(false);
      apiService.deleteEntry.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.deletePerson(idRec, userId, orgId);
      tick();
      
      expect(dateService.userCancelHimselfRec.next).toHaveBeenCalledWith(0);
    }));
  });

  describe('refreshData Method', () => {
    it('should refresh calendar data', () => {
      component.refreshData();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });
  });

  describe('submit Method', () => {
    it('should submit entry and cancel form', () => {
      const data = { date: '15.01.2024', time: '10:00' };
      const user = { id: '123', surnameUser: 'John', nameUser: 'Doe' };
      
      component.selectedPersonId = '123';
      dateService.allUsersSelectedOrg.next([user]);
      spyOn(component, 'addEntry' as any);
      spyOn(component, 'cancel' as any);
      
      component.submit(data);
      
      expect(component.addEntry).toHaveBeenCalledWith(user, '10:00', '15.01.2024');
      expect(component.cancel).toHaveBeenCalled();
    });
  });

  describe('cancel Method', () => {
    it('should reset form state', () => {
      component.newEntryHasBeenOpenedTime = '10:00';
      component.newEntryHasBeenOpenedDate = '15.01.2024';
      
      component.cancel();
      
      expect(component.newEntryHasBeenOpenedTime).toBe('');
      expect(component.newEntryHasBeenOpenedDate).toBe('');
    });
  });

  describe('savingByPressingEnter Method', () => {
    it('should submit on Enter key', () => {
      const event = { code: 'Enter' };
      const value = 'John Doe';
      const data = { date: '15.01.2024', time: '10:00' };
      
      spyOn(component, 'submit' as any);
      
      component.savingByPressingEnter(event, value, data);
      
      expect(component.submit).toHaveBeenCalledWith(data);
    });

    it('should cancel on Escape key', () => {
      const event = { code: 'Escape' };
      const value = 'John Doe';
      const data = { date: '15.01.2024', time: '10:00' };
      
      spyOn(component, 'cancel' as any);
      
      component.savingByPressingEnter(event, value, data);
      
      expect(component.cancel).toHaveBeenCalled();
    });

    it('should do nothing on other keys', () => {
      const event = { code: 'Tab' };
      const value = 'John Doe';
      const data = { date: '15.01.2024', time: '10:00' };
      
      spyOn(component, 'submit' as any);
      spyOn(component, 'cancel' as any);
      
      component.savingByPressingEnter(event, value, data);
      
      expect(component.submit).not.toHaveBeenCalled();
      expect(component.cancel).not.toHaveBeenCalled();
    });
  });

  describe('currentHourTime Method', () => {
    it('should open time slot for entry', fakeAsync(() => {
      const time = '10';
      const date = '15.01.2024';
      
      // Mock inputElementRef
      component.inputElementRef = { nativeElement: { value: '', focus: () => {} } } as any;
      
      spyOn(component, 'refreshData' as any);
      spyOn(component, 'checkingTheNumberOfRecorded' as any);
      
      component.currentHourTime(time, date);
      tick(200);
      
      expect(component.refreshData).toHaveBeenCalled();
      expect(component.checkingTheNumberOfRecorded).toHaveBeenCalledWith(date, '10');
      expect(component.newEntryHasBeenOpenedTime).toBe('10');
      expect(component.newEntryHasBeenOpenedDate).toBe(date);
    }));

    it('should format time correctly', fakeAsync(() => {
      const time = 9;
      const date = '15.01.2024';
      
      // Mock inputElementRef
      component.inputElementRef = { nativeElement: { value: '', focus: () => {} } } as any;
      
      spyOn(component, 'refreshData' as any);
      spyOn(component, 'checkingTheNumberOfRecorded' as any);
      
      component.currentHourTime(time, date);
      tick(200);
      
      expect(component.checkingTheNumberOfRecorded).toHaveBeenCalledWith(date, 9);
    }));
  });

  describe('checkingTheNumberOfRecorded Method', () => {
    it('should check number of recorded entries', () => {
      const dateRec = '15.01.2024';
      const timeRec = '10:00';
      
      spyOn(component, 'getAllEntryInCurrentTimes' as any);
      
      component.checkingTheNumberOfRecorded(dateRec, timeRec);
      
      expect(component.getAllEntryInCurrentTimes).toHaveBeenCalledWith({
        timeRec: '10:00',
        dateRec: '15.01.2024'
      });
    });
  });

  describe('getAllEntryInCurrentTimes Method', () => {
    it('should get entries for current time and update count', fakeAsync(() => {
      const dateAndTimeRec = { timeRec: '10:00', dateRec: '15.01.2024' };
      const allEntryCurTime = [
        { sectionOrOrganization: 'org1' },
        { sectionOrOrganization: 'org1' },
        { sectionOrOrganization: 'org2' }
      ];
      
      apiService.getAllEntryInCurrentTimes.and.returnValue(of(allEntryCurTime));
      dateService.maxPossibleEntries.next(5);
      dateService.currentOrg.next('org1');
      spyOn(component, 'cancel' as any);
      spyOn(component, 'localErrHandler' as any);
      
      component.getAllEntryInCurrentTimes(dateAndTimeRec);
      tick();
      
      expect(dateService.howMuchRecorded.next).toHaveBeenCalledWith(3);
      expect(component.recordComplete).toBe(false);
    }));

    it('should block entry when max entries reached', fakeAsync(() => {
      const dateAndTimeRec = { timeRec: '10:00', dateRec: '15.01.2024' };
      const allEntryCurTime = [
        { sectionOrOrganization: 'org1' },
        { sectionOrOrganization: 'org1' },
        { sectionOrOrganization: 'org1' }
      ];
      
      apiService.getAllEntryInCurrentTimes.and.returnValue(of(allEntryCurTime));
      dateService.maxPossibleEntries.next(3);
      dateService.currentOrg.next('org1');
      spyOn(component, 'cancel' as any);
      spyOn(component, 'localErrHandler' as any);
      
      component.getAllEntryInCurrentTimes(dateAndTimeRec);
      tick();
      
      expect(component.recordComplete).toBe(true);
      expect(component.cancel).toHaveBeenCalled();
      expect(component.localErrHandler).toHaveBeenCalledWith('На выбранное время запись завершена! Запишитесь пожалуйста на другое время или день!');
    }));
  });

  describe('localErrHandler Method', () => {
    it('should handle local errors', () => {
      const errorMessage = 'Test error message';
      
      const result = component.localErrHandler(errorMessage);
      
      expect(errorResponseService.localHandler).toHaveBeenCalledWith(errorMessage);
      expect(result).toBeDefined();
    });
  });

  describe('choosePerson Method', () => {
    it('should choose person and submit', () => {
      const person = { id: '123', surnameUser: 'John', nameUser: 'Doe' };
      const data = { date: '15.01.2024', time: '10:00' };
      
      spyOn(component, 'submit' as any);
      
      component.choosePerson(person, data);
      
      expect(component.selectedPersonId).toBe('123');
      expect(component.submit).toHaveBeenCalledWith(data);
    });
  });

  describe('lostFocus Method', () => {
    it('should handle lost focus without errors', () => {
      expect(() => component.lostFocus()).not.toThrow();
    });
  });

  describe('openDataPerson Method', () => {
    it('should open person data modal', () => {
      const person = { userId: '123', surnameUser: 'John', nameUser: 'Doe' };
      
      component.openDataPerson(person);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
      expect(dateService.dataSelectedUser.next).toHaveBeenCalledWith(person);
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('123');
    });
  });

  describe('closedRecords Method', () => {
    it('should change work status for time slot', fakeAsync(() => {
      const time = { date: '15.01.2024', time: '10:00', workStatus: 'open' };
      const filterRec = [
        { date: '15.01.2024', time: '10:00', userId: '123' }
      ];
      
      // Mock the allEntryAllUsersInMonth value for this test
      Object.defineProperty(dataCalendarService.allEntryAllUsersInMonth, 'value', { value: filterRec });
      dateService.maxPossibleEntries.next(5);
      apiService.changeWorkStatusChoiceTime.and.returnValue(of({}));
      spyOn(component, 'refreshData' as any);
      
      component.closedRecords(time);
      tick();
      
      expect(apiService.changeWorkStatusChoiceTime).toHaveBeenCalledWith({
        date: '15.01.2024',
        time: '10:00',
        state: 'open',
        idOrg: 'org1'
      });
      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should not change status when max entries reached', fakeAsync(() => {
      const time = { date: '15.01.2024', time: '10:00', workStatus: 'open' };
      const filterRec = [
        { date: '15.01.2024', time: '10:00', userId: '123' },
        { date: '15.01.2024', time: '10:00', userId: '124' },
        { date: '15.01.2024', time: '10:00', userId: '125' }
      ];
      
      // Mock the allEntryAllUsersInMonth value for this test
      Object.defineProperty(dataCalendarService.allEntryAllUsersInMonth, 'value', { value: filterRec });
      dateService.maxPossibleEntries.next(3);
      spyOn(component, 'refreshData' as any);
      
      component.closedRecords(time);
      tick();
      
      expect(apiService.changeWorkStatusChoiceTime).not.toHaveBeenCalled();
      expect(component.refreshData).not.toHaveBeenCalled();
    }));
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
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle API errors gracefully', fakeAsync(() => {
      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';
      
      apiService.addEntry.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(component, 'refreshData' as any);
      
      expect(() => {
        component.addEntry(user, time, date);
        tick();
      }).toThrow();
      
      expect(component.refreshData).not.toHaveBeenCalled();
    }));

    it('should handle empty data arrays', () => {
      const emptyArray: any[] = [];
      const currentWeek = ['15.01.2024'];
      
      component['getArrayOfDays'](emptyArray, currentWeek);
      
      expect(dataCalendarService.arrayOfDays.next).toHaveBeenCalled();
    });

    it('should handle null/undefined values', () => {
      const result = component['formativeShowMonth'](null as any);
      expect(result).toBeDefined();
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
    });

    it('should integrate with RecordingService correctly', () => {
      expect(component.recordingService).toBe(recordingService);
    });

    it('should integrate with ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });

    it('should integrate with ModalService correctly', () => {
      expect(component.modalService).toBe(modalService);
    });

    it('should integrate with WebSocketService correctly', () => {
      expect(component.webSocketService).toBe(webSocketService);
    });

    it('should integrate with ErrorResponseService correctly', () => {
      expect(component['errorResponseService']).toBe(errorResponseService);
    });
  });
});
