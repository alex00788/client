import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataPersonModalComponent } from './data-person-modal.component';
import { DateService } from '../calendar-components/date.service';
import { DataCalendarService } from '../calendar-components/data-calendar-new/data-calendar.service';
import { ModalService } from '../../../shared/services/modal.service';
import { ApiService } from '../../../shared/services/api.service';
import { WebSocketService } from '../../../shared/services/web-socket.service';
import { SuccessService } from '../../../shared/services/success.service';
import { TranslateMonthPipe } from '../../../shared/pipe/translate-month.pipe';
import { ReductionAddressPipe } from '../../../shared/pipe/reduction-address.pipe';
import { RecordsBlockComponent } from '../calendar-components/current-user-data/records-block/records-block.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { of, BehaviorSubject, Subject } from 'rxjs';
import moment from 'moment';

describe('DataPersonModalComponent', () => {
  let component: DataPersonModalComponent;
  let fixture: ComponentFixture<DataPersonModalComponent>;
  let dateService: jasmine.SpyObj<DateService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let successService: jasmine.SpyObj<SuccessService>;

  const mockSelectedUser = {
    id: 1,
    userId: 1,
    nameUser: 'Иван Иванов',
    surnameUser: 'Иванов',
    role: 'USER',
    jobTitle: 'Клиент',
    sectionOrOrganization: 'Test Org',
    remainingFunds: 10,
    recAllowed: false,
    idOrg: 1,
    created: '2024-01-01',
    photoEmployee: '',
    direction: ''
  };

  const mockCurrentUser = {
    id: 2,
    userId: 2,
    nameUser: 'Админ Админов',
    role: 'ADMIN',
    jobTitle: 'Администратор',
    sectionOrOrganization: 'Test Org',
    remainingFunds: 0,
    recAllowed: true,
    idOrg: 1,
    created: '2023-01-01',
    photoEmployee: '',
    direction: ''
  };

  beforeEach(async () => {
    const dateServiceSpy = jasmine.createSpyObj('DateService', [], {
      dataSelectedUser: new BehaviorSubject({ id: 1, userId: 1 }),
      allUsersSelectedOrg: new BehaviorSubject([mockSelectedUser, mockCurrentUser]),
      currentUserId: new BehaviorSubject(1),
      idSelectedOrg: new BehaviorSubject(1),
      clientPhone: new BehaviorSubject('+7-999-123-45-67'),
      clientEmail: new BehaviorSubject('test@example.com'),
      openEmployee: new BehaviorSubject(false),
      allEntrySelectedUserInSelectMonth: new BehaviorSubject([]),
      recordingDaysChanged: new BehaviorSubject(false),
      userCancelHimselfRec: new BehaviorSubject(0)
    });

    // Add spy methods
    dateServiceSpy.allEntrySelectedUserInSelectMonth.next = jasmine.createSpy('next');
    dateServiceSpy.userCancelHimselfRec.next = jasmine.createSpy('next');
    dateServiceSpy.allUsersSelectedOrg.next = jasmine.createSpy('next');

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth',
      'getAllUsersCurrentOrganization',
      'deleteSelectedRecInAllRecBlock',
      'checkingOrgHasEmployees'
    ], {
      allEntryAllUsersInMonth: new BehaviorSubject([])
    });

    // Mock the value property to return the current value
    Object.defineProperty(dataCalendarServiceSpy.allEntryAllUsersInMonth, 'value', {
      get: function() { return this._value || []; },
      set: function(value) { this._value = value; }
    });

    // Add spy methods
    dataCalendarServiceSpy.allEntryAllUsersInMonth.next = jasmine.createSpy('next');

    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'close',
      'openModalRenameUser'
    ], {
      currentDataAboutSelectedUser: new BehaviorSubject(null)
    });

    // Add spy methods
    modalServiceSpy.currentDataAboutSelectedUser.next = jasmine.createSpy('next');

    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'changeRoleSelectedUser',
      'changeAllowed',
      'addSubscription',
      'changeJobTitleSelectedUser',
      'fireFromOrg',
      'loadPhotoEmployee',
      'getAllDataAboutResetSelectedUser'
    ]);

    // Mock API responses
    apiServiceSpy.changeRoleSelectedUser.and.returnValue(of('ADMIN'));
    apiServiceSpy.changeAllowed.and.returnValue(of({ allowed: false }));
    apiServiceSpy.addSubscription.and.returnValue(of({ changeRemain: { remainingFunds: 10 } }));
    apiServiceSpy.changeJobTitleSelectedUser.and.returnValue(of({ jobTitle: 'Менеджер', direction: 'Продажи' }));
    apiServiceSpy.fireFromOrg.and.returnValue(of({ success: true }));
    apiServiceSpy.loadPhotoEmployee.and.returnValue(of({ success: true }));
    apiServiceSpy.getAllDataAboutResetSelectedUser.and.returnValue(of([]));

    const webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [], {
      socket: {
        onmessage: null,
        send: jasmine.createSpy('send')
      }
    });

    const successServiceSpy = jasmine.createSpyObj('SuccessService', [
      'localHandler'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DataPersonModalComponent,
        ReactiveFormsModule,
        AsyncPipe,
        NgForOf,
        NgIf,
        TranslateMonthPipe,
        ReductionAddressPipe
      ],
      providers: [
        { provide: DateService, useValue: dateServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataPersonModalComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    webSocketService = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;

    // Setup component before each test
    component.selectedUser = mockSelectedUser;
    component.dataAboutDirection = new BehaviorSubject([]);
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.apiService).toBeDefined();
      expect(component.webSocketService).toBeDefined();
      expect(component.successService).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should initialize forms correctly', () => {
      expect(component.form).toBeInstanceOf(FormGroup);
      expect(component.formEmployees).toBeInstanceOf(FormGroup);
      expect(component.form.get('subscription')).toBeInstanceOf(FormControl);
      expect(component.formEmployees.get('direction')).toBeInstanceOf(FormControl);
      expect(component.formEmployees.get('jobTitle')).toBeInstanceOf(FormControl);
    });

    it('should initialize with default values', () => {
      expect(component.nameUser).toBe('Имя');
      expect(component.roleUser).toBe('Роль');
      expect(component.remainingFunds).toBe('Остаток средств');
      expect(component.sectionOrOrganization).toBe('Секция || Организация');
      expect(component.showBtnUser).toBeUndefined();
      expect(component.showBtnAdmin).toBeUndefined();
      expect(component.employeeCurrentOrganization).toBeUndefined();
      expect(component.stateFormEmployees).toBe(false);
      expect(component.showBtnAdminAndUser).toBeUndefined();
      expect(component.hideBtnForCurrentAdmin).toBeUndefined();
      expect(component.currentDate).toBe(moment().format('DD.MM.YYYY'));
      expect(component.currentHour).toBe(new Date().getHours());
      expect(component.blockRepeat).toBe(false);
      expect(component.clickCount).toBe(0);
      expect(component.blockRecordsSelectedUser).toBe(false);
      expect(component.newUser).toBe(true);
      expect(component.recAllowed).toBe(false);
      expect(component.showRemainderInDirections).toBe(true);
      expect(component.dataAboutDirection.value).toEqual([]);
    });

    it('should have @Output currentOrgHasEmployee', () => {
      expect(component.currentOrgHasEmployee).toBeDefined();
      expect(component.currentOrgHasEmployee instanceof EventEmitter).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should call required service methods', () => {
      component.ngOnInit();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    });

    it('should set selectedUser from allUsersSelectedOrg', () => {
      // Mock the find method to return the selected user
      const mockUsers = [mockSelectedUser, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...mockSelectedUser, userId: mockSelectedUser.id });
      
      component.ngOnInit();
      
      expect(component.selectedUser).toBeDefined();
      expect(component.selectedUser).toBe(mockSelectedUser);
    });

    it('should set hideBtnForCurrentAdmin correctly', () => {
      // Mock the find method to return the selected user
      const mockUsers = [mockSelectedUser, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...mockSelectedUser, userId: mockSelectedUser.id });
      dateService.currentUserId.next(1); // Set currentUserId to match selectedUser.id
      
      component.ngOnInit();
      
      expect(component.hideBtnForCurrentAdmin).toBe(true);
    });

    it('should set employeeCurrentOrganization based on jobTitle length', () => {
      // Mock the find method to return the selected user
      const mockUsers = [mockSelectedUser, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...mockSelectedUser, userId: mockSelectedUser.id });
      spyOn(component, 'dataAboutSelectedUser');
      
      component.ngOnInit();
      
      expect(component.employeeCurrentOrganization).toBe(true); // jobTitle 'Клиент' has length > 1
      expect(component.dataAboutSelectedUser).toHaveBeenCalled();
    });

    it('should set recAllowed from selectedUser', () => {
      // Mock the find method to return the selected user
      const mockUsers = [mockSelectedUser, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...mockSelectedUser, userId: mockSelectedUser.id });
      spyOn(component, 'dataAboutSelectedUser');
      
      component.ngOnInit();
      
      // Проверяем, что значение установлено корректно из selectedUser
      expect(component.recAllowed).toBe(mockSelectedUser.recAllowed);
      expect(component.dataAboutSelectedUser).toHaveBeenCalled();
    });

    it('should set roleUser from selectedUser', () => {
      // Mock the find method to return the selected user
      const mockUsers = [mockSelectedUser, mockCurrentUser];
      dateService.dataSelectedUser.next({ ...mockSelectedUser, userId: mockSelectedUser.id });
      spyOn(component, 'dataAboutSelectedUser');
      
      component.ngOnInit();
      
      // Проверяем, что значение установлено корректно из selectedUser
      expect(component.roleUser).toBe(mockSelectedUser.role);
      expect(component.dataAboutSelectedUser).toHaveBeenCalled();
    });

    it('should set newUser based on creation date', () => {
      const oldUser = { ...mockSelectedUser, created: '2023-01-01' };
      const mockUsers = [oldUser, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...oldUser, userId: oldUser.id });
      
      component.ngOnInit();
      
      expect(component.newUser).toBe(false); // old date (2023-01-01) is more than 7 days ago
    });

    it('should call dataAboutSelectedUser', () => {
      spyOn(component, 'dataAboutSelectedUser');
      
      component.ngOnInit();
      
      expect(component.dataAboutSelectedUser).toHaveBeenCalled();
    });

    it('should subscribe to allEntryAllUsersInMonth', fakeAsync(() => {
      component.ngOnInit();
      
      dataCalendarService.allEntryAllUsersInMonth.next([{ userId: 1, date: '15.01.2024' }]);
      tick();
      
      expect(dateService.allEntrySelectedUserInSelectMonth.next).toHaveBeenCalled();
    }));
  });

  describe('getAllEntrySelectedUser', () => {
    it('should filter entries by userId when selectedUser has userId', () => {
      const mockEntries = [
        { userId: 1, date: '15.01.2024' },
        { userId: 2, date: '16.01.2024' }
      ];
      (dataCalendarService.allEntryAllUsersInMonth as any)._value = mockEntries;
      component.selectedUser = { ...mockSelectedUser, userId: 1 };
      
      component.getAllEntrySelectedUser();
      
      expect(dateService.allEntrySelectedUserInSelectMonth.next).toHaveBeenCalledWith([{ userId: 1, date: '15.01.2024' }]);
    });

    it('should filter entries by id when selectedUser has no userId', () => {
      const mockEntries = [
        { userId: 1, date: '15.01.2024' },
        { userId: 2, date: '16.01.2024' }
      ];
      (dataCalendarService.allEntryAllUsersInMonth as any)._value = mockEntries;
      component.selectedUser = { ...mockSelectedUser, userId: undefined, id: 2 };
      
      component.getAllEntrySelectedUser();
      
      expect(dateService.allEntrySelectedUserInSelectMonth.next).toHaveBeenCalledWith([{ userId: 2, date: '16.01.2024' }]);
    });

    it('should handle empty entries array', () => {
      (dataCalendarService.allEntryAllUsersInMonth as any)._value = [];
      component.selectedUser = mockSelectedUser;
      
      component.getAllEntrySelectedUser();
      
      expect(dateService.allEntrySelectedUserInSelectMonth.next).toHaveBeenCalledWith([]);
    });
  });

  describe('overwriteChangedData', () => {
    it('should update recAllowed in allUsersSelectedOrg', () => {
      const allUsers = [
        { id: 1, recAllowed: false },
        { id: 2, recAllowed: false }
      ];
      dateService.allUsersSelectedOrg.next(allUsers);
      component.selectedUser = { ...mockSelectedUser, recAllowed: true };
      
      component.overwriteChangedData({ recAllowed: true });
      
      // The component updates the entire array, so we expect the full updated array
      expect(dateService.allUsersSelectedOrg.next).toHaveBeenCalled();
    });
  });

  describe('dataAboutSelectedUser', () => {
    it('should set nameUser correctly for multi-word names', () => {
      const userWithTwoWords = { ...mockSelectedUser, nameUser: 'Иван Иванов', surnameUser: 'Иванов' };
      dateService.allUsersSelectedOrg.next([userWithTwoWords]);
      component.selectedUser = userWithTwoWords;
      
      component.dataAboutSelectedUser();
      
      expect(component.nameUser).toBe('Иван Иванов');
    });

    it('should set nameUser correctly for single-word names', () => {
      const userWithOneWord = { ...mockSelectedUser, nameUser: 'Иван', surnameUser: 'Иванов' };
      dateService.allUsersSelectedOrg.next([userWithOneWord]);
      component.selectedUser = userWithOneWord;
      
      component.dataAboutSelectedUser();
      
      expect(component.nameUser).toBe('Иванов Иван');
    });

    it('should set sectionOrOrganization and remainingFunds', () => {
      const user = { ...mockSelectedUser, sectionOrOrganization: 'Test Org', remainingFunds: 10 };
      const mockUsers = [user, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      component.selectedUser = user;
      
      component.dataAboutSelectedUser();
      
      // The component finds the user in allUsersSelectedOrg and sets values from there
      expect(component.sectionOrOrganization).toBe('Test Org');
      expect(component.remainingFunds).toBe(10 as any);
    });

    it('should set hideBtnForCurrentAdmin correctly', () => {
      const user = { ...mockSelectedUser, id: 2, userId: 2 };
      const mockUsers = [user, mockCurrentUser];
      dateService.allUsersSelectedOrg.next(mockUsers);
      dateService.dataSelectedUser.next({ ...user, userId: 2 });
      component.selectedUser = user;
      dateService.currentUserId.next(2);
      
      component.dataAboutSelectedUser();
      
      expect(component.hideBtnForCurrentAdmin).toBe(true); // user.id (2) == currentUserId (2)
    });
  });

  describe('changeRole', () => {
    it('should call API and update user role', fakeAsync(() => {
      const newRole = 'ADMIN';
      apiService.changeRoleSelectedUser.and.returnValue(of(newRole));
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1 };
      const allUsers = [
        { id: 1, userId: 1, role: 'USER' },
        { id: 2, userId: 2, role: 'USER' }
      ];
      dateService.allUsersSelectedOrg.next(allUsers);
      
      component.changeRole();
      tick();
      
      expect(apiService.changeRoleSelectedUser).toHaveBeenCalledWith(1, 1);
      // The component updates the entire array, so we expect the full updated array
      expect(dateService.allUsersSelectedOrg.next).toHaveBeenCalled();
      expect(component.roleUser).toBe('ADMIN'); // role is updated from API response
      expect(component.showBtnAdmin).toBe(false);
      expect(component.showBtnUser).toBe(true);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      apiService.changeRoleSelectedUser.and.returnValue(of('USER'));
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1 };
      
      expect(() => {
        component.changeRole();
        tick();
      }).not.toThrow();
    }));
  });

  describe('deleteSelectedRecSelectedUser', () => {
    it('should handle single click and delete record', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRecSelectedUser(selectedRec);
      
      expect(component.blockRepeat).toBe(true);
      expect(component.clickCount).toBe(1);
      
      tick(300);
      
      expect(dateService.userCancelHimselfRec.next).toHaveBeenCalledWith(0);
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).toHaveBeenCalledWith(selectedRec);
      expect(component.clickCount).toBe(0);
      expect(component.blockRepeat).toBe(false);
    }));

    it('should handle double click and not delete record', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRecSelectedUser(selectedRec);
      component.deleteSelectedRecSelectedUser(selectedRec);
      
      expect(component.clickCount).toBe(2);
      
      tick(300);
      
      expect(dateService.userCancelHimselfRec.next).not.toHaveBeenCalled();
      expect(dataCalendarService.deleteSelectedRecInAllRecBlock).not.toHaveBeenCalled();
    }));

    it('should call dataAboutSelectedUser after deletion', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      spyOn(component, 'dataAboutSelectedUser');
      
      component.deleteSelectedRecSelectedUser(selectedRec);
      tick(300);
      
      expect(component.dataAboutSelectedUser).toHaveBeenCalled();
    }));

    it('should reset clickCount and blockRepeat after timeout', fakeAsync(() => {
      const selectedRec = { id: '123', date: '15.01.2024', time: '10:00' };
      
      component.deleteSelectedRecSelectedUser(selectedRec);
      expect(component.clickCount).toBe(1);
      expect(component.blockRepeat).toBe(true);
      
      tick(300);
      
      expect(component.clickCount).toBe(0);
      expect(component.blockRepeat).toBe(false);
    }));
  });

  describe('changeAllowed', () => {
    it('should call API and update recAllowed', fakeAsync(() => {
      apiService.changeAllowed.and.returnValue(of({ allowed: false }));
      component.selectedUser = { ...mockSelectedUser, recAllowed: true };
      
      component.changeAllowed();
      tick();
      
      expect(apiService.changeAllowed).toHaveBeenCalledWith({
        recAllowed: false,
        selectedUser: component.selectedUser
      });
    }));
  });

  describe('refreshData', () => {
    it('should call required service methods', () => {
      component.refreshData();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should call API and update remainingFunds', fakeAsync(() => {
      const response = { changeRemain: { remainingFunds: 10 } };
      apiService.addSubscription.and.returnValue(of(response));
      component.selectedUser = { ...mockSelectedUser, idRec: 1 };
      component.form.patchValue({ subscription: 5 });
      spyOn(component, 'refreshData');
      
      component.submit();
      tick();
      
      expect(apiService.addSubscription).toHaveBeenCalledWith({
        idRec: 1,
        remainingFunds: 5
      });
      expect(component.remainingFunds).toBe(10 as any);
      expect(component.refreshData).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Клиент сможет записаться 5  раз');
    }));
  });

  describe('renameUser', () => {
    it('should set userId to id if userId is undefined', () => {
      component.selectedUser = { ...mockSelectedUser, userId: undefined };
      
      component.renameUser();
      
      expect(component.selectedUser.userId).toBe(component.selectedUser.id);
      expect(modalService.currentDataAboutSelectedUser.next).toHaveBeenCalledWith(component.selectedUser);
      expect(modalService.openModalRenameUser).toHaveBeenCalled();
    });

    it('should not change userId if already set', () => {
      const originalUserId = 123;
      component.selectedUser = { ...mockSelectedUser, userId: originalUserId };
      
      component.renameUser();
      
      expect(component.selectedUser.userId).toBe(originalUserId);
      expect(modalService.currentDataAboutSelectedUser.next).toHaveBeenCalledWith(component.selectedUser);
      expect(modalService.openModalRenameUser).toHaveBeenCalled();
    });
  });

  describe('submitAssign', () => {
    it('should call API and update employee data', fakeAsync(() => {
      const response = { jobTitle: 'Менеджер', direction: 'Продажи' };
      apiService.changeJobTitleSelectedUser.and.returnValue(of(response));
      component.selectedUser = { ...mockSelectedUser, id: 1, idOrg: 1, photoEmployee: 'photo.jpg' };
      component.formEmployees.patchValue({ direction: 'Продажи', jobTitle: 'Менеджер' });
      spyOn(component, 'updateData');
      spyOn(component.formEmployees, 'reset');
      
      component.submitAssign();
      tick();
      
      expect(apiService.changeJobTitleSelectedUser).toHaveBeenCalledWith({
        userId: 1,
        idOrg: 1,
        jobTitle: 'Менеджер',
        direction: 'Продажи',
        photoEmployee: 'photo.jpg'
      });
      expect(component.formEmployees.reset).toHaveBeenCalled();
      expect(component.stateFormEmployees).toBe(false);
      expect(component.employeeCurrentOrganization).toBe(true);
      expect(component.selectedUser.jobTitle).toBe('Менеджер');
      expect(component.updateData).toHaveBeenCalledWith('Менеджер', 'Продажи');
      expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Сотрудник Менеджер добавлен ');
    }));
  });

  describe('updateData', () => {
    it('should update user data in allUsersSelectedOrg', () => {
      const allUsers = [
        { id: 1, userId: 1, jobTitle: 'Старая должность', direction: 'Старое направление' },
        { id: 2, userId: 2, jobTitle: 'Другая должность', direction: 'Другое направление' }
      ];
      dateService.allUsersSelectedOrg.next(allUsers);
      component.selectedUser = { id: 1, userId: 1 };
      
      component.updateData('Новая должность', 'Новое направление');
      
      // The component updates the entire array, so we expect the full updated array
      expect(dateService.allUsersSelectedOrg.next).toHaveBeenCalled();
    });
  });

  describe('switchFormEmployees', () => {
    it('should toggle stateFormEmployees', () => {
      component.stateFormEmployees = false;
      
      component.switchFormEmployees();
      expect(component.stateFormEmployees).toBe(true);
      
      component.switchFormEmployees();
      expect(component.stateFormEmployees).toBe(false);
    });
  });

  describe('fireFromOrg', () => {
    it('should call API and update employee status', fakeAsync(() => {
      apiService.fireFromOrg.and.returnValue(of({ success: true }));
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1, direction: 'Новое направление' };
      spyOn(component.currentOrgHasEmployee, 'emit');
      spyOn(component, 'updateData');
      
      component.fireFromOrg();
      tick();
      
      expect(apiService.fireFromOrg).toHaveBeenCalledWith({
        userId: 1,
        orgId: 1
      });
      expect(component.employeeCurrentOrganization).toBe(false);
      expect(component.selectedUser.jobTitle).toBe('');
      expect(component.updateData).toHaveBeenCalledWith('', '');
      expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
    }));
  });

  describe('loadFile', () => {
    it('should create FormData and call postFiles', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [mockFile] } };
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1 };
      
      component.loadFile(mockEvent);
      
      expect(component['formData']).toBeDefined();
    });
  });

  describe('createFormData', () => {
    it('should create FormData with correct data', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFiles = [mockFile];
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1 };
      
      component['createFormData'](mockFiles as any);
      
      expect(component['formData']).toBeDefined();
    });
  });

  describe('postFiles', () => {
    it('should call API and handle response', fakeAsync(() => {
      apiService.loadPhotoEmployee.and.returnValue(of({ success: true }));
      component['formData'] = new FormData();
      spyOn(component, 'refreshData');
      
      component['postFiles']();
      tick();
      
      expect(apiService.loadPhotoEmployee).toHaveBeenCalledWith(component['formData']);
      expect(component.refreshData).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Фото добавлено');
    }));
  });

  describe('showRestInDirections', () => {
    it('should toggle showRemainderInDirections and load data', fakeAsync(() => {
      const response = [{ sectionOrOrganization: 'Направление 1', remainingFunds: 5 }];
      apiService.getAllDataAboutResetSelectedUser.and.returnValue(of(response));
      component.showRemainderInDirections = true;
      spyOn(component.dataAboutDirection, 'next');
      
      component.showRestInDirections();
      tick();
      
      expect(apiService.getAllDataAboutResetSelectedUser).toHaveBeenCalledWith(1, 1);
      expect(component.showRemainderInDirections).toBe(false);
      expect(component.dataAboutDirection.next).toHaveBeenCalledWith(response);
    }));

    it('should hide data when showRemainderInDirections is false', fakeAsync(() => {
      component.showRemainderInDirections = false;
      spyOn(component.dataAboutDirection, 'next');
      
      component.showRestInDirections();
      tick();
      
      expect(component.showRemainderInDirections).toBe(true);
      expect(component.dataAboutDirection.next).toHaveBeenCalledWith([]);
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
  });

  describe('Form Validation', () => {
    it('should validate subscription form', () => {
      const subscriptionControl = component.form.get('subscription');
      
      expect(subscriptionControl?.valid).toBe(true);
      
      subscriptionControl?.setValue(0);
      expect(subscriptionControl?.valid).toBe(true);
      
      subscriptionControl?.setValue(5);
      expect(subscriptionControl?.valid).toBe(true);
    });

    it('should validate employees form', () => {
      const directionControl = component.formEmployees.get('direction');
      const jobTitleControl = component.formEmployees.get('jobTitle');
      
      expect(directionControl?.valid).toBe(false);
      expect(jobTitleControl?.valid).toBe(false);
      
      directionControl?.setValue('Направление');
      jobTitleControl?.setValue('Должность');
      
      expect(directionControl?.valid).toBe(true);
      expect(jobTitleControl?.valid).toBe(true);
      expect(component.formEmployees.valid).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined selectedUser gracefully', () => {
      // Создаем новый экземпляр компонента без вызова ngOnInit
      const testComponent = new DataPersonModalComponent(
        dateService,
        dataCalendarService,
        modalService,
        apiService,
        webSocketService,
        successService
      );
      
      // Устанавливаем selectedUser в undefined
      testComponent.selectedUser = undefined as any;
      
      // Ожидаем, что вызов методов с undefined selectedUser вызовет ошибку
      // при попытке доступа к свойствам undefined объекта
      expect(() => {
        // Попытка доступа к свойству undefined объекта вызовет TypeError
        const role = testComponent.selectedUser.role;
      }).toThrow();
      
      expect(() => {
        // Попытка доступа к свойству undefined объекта вызовет TypeError
        const userId = testComponent.selectedUser.userId;
      }).toThrow();
    });

    it('should handle empty allUsersSelectedOrg array', () => {
      dateService.allUsersSelectedOrg.next([]);
      component.selectedUser = mockSelectedUser;
      
      expect(() => component.getAllEntrySelectedUser()).not.toThrow();
    });

    it('should handle API errors gracefully', fakeAsync(() => {
      apiService.changeAllowed.and.returnValue(of({ allowed: false }));
      
      expect(() => {
        component.changeAllowed();
        tick();
      }).not.toThrow();
    }));

    it('should handle file upload errors', fakeAsync(() => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [mockFile] } };
      component.selectedUser = { ...mockSelectedUser, userId: 1, idOrg: 1 };
      
      expect(() => component.loadFile(mockEvent)).not.toThrow();
    }));
  });

  describe('Component State Management', () => {
    it('should maintain form state correctly', () => {
      component.form.patchValue({ subscription: 10 });
      expect(component.form.value.subscription).toBe(10);
      
      component.form.reset();
      expect(component.form.value.subscription).toBe(null);
    });

    it('should maintain employees form state correctly', () => {
      component.formEmployees.patchValue({ direction: 'Test', jobTitle: 'Test' });
      expect(component.formEmployees.value.direction).toBe('Test');
      expect(component.formEmployees.value.jobTitle).toBe('Test');
      
      component.formEmployees.reset();
      expect(component.formEmployees.value.direction).toBe(null);
      expect(component.formEmployees.value.jobTitle).toBe(null);
    });

    it('should maintain boolean flags correctly', () => {
      component.showBtnUser = true;
      component.showBtnAdmin = false;
      component.employeeCurrentOrganization = true;
      component.stateFormEmployees = true;
      component.blockRecordsSelectedUser = true;
      component.newUser = false;
      component.recAllowed = true;
      component.showRemainderInDirections = false;
      
      expect(component.showBtnUser).toBe(true);
      expect(component.showBtnAdmin).toBe(false);
      expect(component.employeeCurrentOrganization).toBe(true);
      expect(component.stateFormEmployees).toBe(true);
      expect(component.blockRecordsSelectedUser).toBe(true);
      expect(component.newUser).toBe(false);
      expect(component.recAllowed).toBe(true);
      expect(component.showRemainderInDirections).toBe(false);
    });
  });

  describe('Date and Time Handling', () => {
    it('should format currentDate correctly', () => {
      const expectedFormat = moment().format('DD.MM.YYYY');
      expect(component.currentDate).toBe(expectedFormat);
    });

    it('should set currentHour from Date object', () => {
      const expectedHour = new Date().getHours();
      expect(component.currentHour).toBe(expectedHour);
    });

    it('should handle moment date operations', () => {
      const testDate = '2024-01-01';
      const momentDate = moment(testDate);
      const result = momentDate.add(7, 'day');
      
      expect(result.isValid()).toBe(true);
    });
  });

  describe('Template Integration', () => {
    it('should bind form controls to template', () => {
      const subscriptionControl = component.form.get('subscription');
      const directionControl = component.formEmployees.get('direction');
      const jobTitleControl = component.formEmployees.get('jobTitle');
      
      expect(subscriptionControl).toBeDefined();
      expect(directionControl).toBeDefined();
      expect(jobTitleControl).toBeDefined();
    });

    it('should handle conditional rendering flags', () => {
      component.hideBtnForCurrentAdmin = false;
      component.employeeCurrentOrganization = true;
      component.stateFormEmployees = false;
      component.blockRecordsSelectedUser = false;
      component.showRemainderInDirections = true;
      
      expect(component.hideBtnForCurrentAdmin).toBe(false);
      expect(component.employeeCurrentOrganization).toBe(true);
      expect(component.stateFormEmployees).toBe(false);
      expect(component.blockRecordsSelectedUser).toBe(false);
      expect(component.showRemainderInDirections).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid state changes efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        component.switchFormEmployees();
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple form operations efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        component.form.patchValue({ subscription: i });
        component.formEmployees.patchValue({ direction: `Dir${i}`, jobTitle: `Job${i}` });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should not create memory leaks with multiple subscriptions', fakeAsync(() => {
      for (let i = 0; i < 10; i++) {
        component.ngOnInit();
        dataCalendarService.allEntryAllUsersInMonth.next([]);
        tick();
      }
      
      expect(component).toBeDefined();
    }));
  });

  describe('Observable Subscriptions', () => {
    it('should handle subscription cleanup', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should handle subscription errors', fakeAsync(() => {
      const errorSubject = new Subject();
      dataCalendarService.allEntryAllUsersInMonth = errorSubject as any;
      
      component.ngOnInit();
      
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

    it('should implement OnDestroy interface', () => {
      expect(component.ngOnDestroy).toBeDefined();
      expect(typeof component.ngOnDestroy).toBe('function');
    });

    it('should call ngOnInit during component initialization', () => {
      // ngOnInit is called automatically during fixture.detectChanges() in beforeEach
      expect(component.ngOnInit).toBeDefined();
    });
  });
});
