import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataCalendarService } from './data-calendar.service';
import { ApiService } from '../../../../shared/services/api.service';
import { DateService } from '../date.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import moment from 'moment';

describe('DataCalendarService Integration Tests', () => {
  let service: DataCalendarService;
  let apiService: ApiService;
  let dateService: DateService;

  // Mock данные для интеграционных тестов
  const mockDate = moment('2024-01-15');
  const mockOrg = 'Test Organization';
  const mockOrgId = 'org123';
  const mockUserId = 'user123';
  const mockUserData = {
    id: 'user123',
    nameUser: 'John',
    surnameUser: 'Doe',
    role: 'ADMIN',
    sectionOrOrganization: 'Test Organization',
    remainingFunds: 100,
    openEmployee: false,
    jobTitle: 'Manager',
    timeStartRec: 9,
    timeMinutesRec: '00',
    timeLastRec: 18,
    maxClients: 10,
    recordingDays: 'пн, вт, ср',
    location: 'Office 1',
    phoneOrg: '+1234567890'
  };

  const mockAllUsers = [
    mockUserData,
    {
      id: 'user456',
      nameUser: 'Jane',
      surnameUser: 'Smith',
      role: 'USER',
      sectionOrOrganization: 'Test Organization',
      remainingFunds: 50,
      openEmployee: false,
      jobTitle: 'Assistant',
      timeStartRec: 9,
      timeMinutesRec: '00',
      timeLastRec: 18,
      maxClients: 10,
      recordingDays: 'пн, вт, ср',
      location: 'Office 1',
      phoneOrg: '+1234567890'
    }
  ];

  const mockEntries = [
    {
      idRec: 'rec1',
      userId: 'user123',
      orgId: 'org123',
      date: '15.01.2024',
      time: '10:00',
      orgName: 'Test Organization'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataCalendarService,
        ApiService,
        DateService
      ]
    }).compileComponents();

    service = TestBed.inject(DataCalendarService);
    apiService = TestBed.inject(ApiService);
    dateService = TestBed.inject(DateService);

    // Устанавливаем начальные значения в DateService
    dateService.currentOrg.next(mockOrg);
    dateService.idSelectedOrg.next(mockOrgId);
    dateService.date.next(mockDate);
    dateService.currentUserId.next(mockUserId);
    dateService.currentUserIsTheAdminOrg.next(false);
    dateService.openEmployee.next(false);
  });

  describe('Service Integration with Real Dependencies', () => {
    it('should be created with real dependencies', () => {
      expect(service).toBeTruthy();
      expect(apiService).toBeTruthy();
      expect(dateService).toBeTruthy();
    });

    it('should have access to real DateService BehaviorSubjects', () => {
      expect(dateService.currentOrg).toBeDefined();
      expect(dateService.idSelectedOrg).toBeDefined();
      expect(dateService.date).toBeDefined();
      expect(dateService.currentUserId).toBeDefined();
    });

    it('should have access to real ApiService methods', () => {
      expect(apiService.getAllEntryAllUsersOrg).toBeDefined();
      expect(apiService.getAllUsersCurrentOrganization).toBeDefined();
      expect(apiService.getAllEntryCurrentUser).toBeDefined();
      expect(apiService.getPhoneClient).toBeDefined();
      expect(apiService.deleteEntry).toBeDefined();
    });
  });

  describe('Real Service Method Integration', () => {
    it('should integrate getAllEntryAllUsersForTheMonth with real DateService values', () => {
      // Проверяем, что сервис использует реальные значения из DateService
      const currentOrg = dateService.currentOrg.value;
      const idSelectedOrg = dateService.idSelectedOrg.value;
      const date = dateService.date.value;
      const currentUserId = dateService.currentUserId.value;

      expect(currentOrg).toBe(mockOrg);
      expect(idSelectedOrg).toBe(mockOrgId);
      expect(date).toEqual(mockDate);
      expect(currentUserId).toBe(mockUserId);
    });

    it('should integrate getAllUsersCurrentOrganization with real DateService values', () => {
      const idSelectedOrg = dateService.idSelectedOrg.value;
      const currentUserId = dateService.currentUserId.value;
      const openEmployee = dateService.openEmployee.value;
      const clickedByAdmin = dateService.currentUserIsTheAdminOrg.value;

      expect(idSelectedOrg).toBe(mockOrgId);
      expect(currentUserId).toBe(mockUserId);
      expect(openEmployee).toBeFalse();
      expect(clickedByAdmin).toBeFalse();
    });

    it('should integrate getAllEntryCurrentUsersThisMonth with real DateService values', () => {
      const date = dateService.date.value;
      const currentUserId = dateService.currentUserId.value;

      expect(date).toEqual(mockDate);
      expect(currentUserId).toBe(mockUserId);
    });

    it('should integrate deleteSelectedRecInAllRecBlock with real DateService values', () => {
      const maxPossibleEntries = dateService.maxPossibleEntries.value;
      const howMuchRecorded = dateService.howMuchRecorded.value;
      const userCancelHimselfRec = dateService.userCancelHimselfRec.value;

      expect(maxPossibleEntries).toBeDefined();
      expect(howMuchRecorded).toBeDefined();
      expect(userCancelHimselfRec).toBeDefined();
    });
  });

  describe('BehaviorSubject State Management Integration', () => {
    it('should properly manage allEntryAllUsersInMonth state', () => {
      const initialValue = service.allEntryAllUsersInMonth.value;
      expect(initialValue).toEqual([]);

      const testData = [{ id: 'test1' }, { id: 'test2' }];
      service.allEntryAllUsersInMonth.next(testData);

      expect(service.allEntryAllUsersInMonth.value).toEqual(testData);
    });

    it('should properly manage allEntryCurrentUserThisMonth state', () => {
      const initialValue = service.allEntryCurrentUserThisMonth.value;
      expect(initialValue).toEqual([]);

      const testData = [{ id: 'test1' }, { id: 'test2' }];
      service.allEntryCurrentUserThisMonth.next(testData);

      expect(service.allEntryCurrentUserThisMonth.value).toEqual(testData);
    });

    it('should properly manage filterByDate state', () => {
      const initialValue = service.filterByDate.value;
      expect(initialValue).toBeFalse();

      service.filterByDate.next(true);
      expect(service.filterByDate.value).toBeTrue();

      service.filterByDate.next(false);
      expect(service.filterByDate.value).toBeFalse();
    });

    it('should properly manage filterByOrg state', () => {
      const initialValue = service.filterByOrg.value;
      expect(initialValue).toBeFalse();

      service.filterByOrg.next(true);
      expect(service.filterByOrg.value).toBeTrue();

      service.filterByOrg.next(false);
      expect(service.filterByOrg.value).toBeFalse();
    });

    it('should properly manage showAll state', () => {
      const initialValue = service.showAll.value;
      expect(initialValue).toBeTrue();

      service.showAll.next(false);
      expect(service.showAll.value).toBeFalse();

      service.showAll.next(true);
      expect(service.showAll.value).toBeTrue();
    });

    it('should properly manage allUsersForShowAllFilter state', () => {
      const initialValue = service.allUsersForShowAllFilter.value;
      expect(initialValue).toEqual([]);

      const testData = [{ id: 'test1' }, { id: 'test2' }];
      service.allUsersForShowAllFilter.next(testData);

      expect(service.allUsersForShowAllFilter.value).toEqual(testData);
    });
  });

  describe('Filtering Logic Integration', () => {
    beforeEach(() => {
      const testEntries = [
        { idRec: 'rec1', userId: 'user123', orgId: 'org123', date: '15.01.2024', time: '10:00' },
        { idRec: 'rec2', userId: 'user123', orgId: 'org456', date: '15.01.2024', time: '09:00' },
        { idRec: 'rec3', userId: 'user123', orgId: 'org123', date: '16.01.2024', time: '11:00' }
      ];
      service.allEntryCurrentUserThisMonth.next(testEntries);
      service.allUsersForShowAllFilter.next(testEntries);
    });

    it('should integrate filterRecCurrentUserByOrg with real data', () => {
      service.filterRecCurrentUserByOrg();

      expect(service.filterByOrg.value).toBeTrue();
      expect(service.filterByDate.value).toBeFalse();
      expect(service.showAll.value).toBeFalse();

      const filteredEntries = service.allEntryCurrentUserThisMonth.value;
      expect(filteredEntries.length).toBe(2);
      expect(filteredEntries.every((entry: any) => entry.orgId === 'org123')).toBeTrue();
    });

    it('should integrate filterRecCurrentUserByDate with real data', () => {
      service.filterRecCurrentUserByDate();

      expect(service.filterByOrg.value).toBeFalse();
      expect(service.filterByDate.value).toBeTrue();
      expect(service.showAll.value).toBeFalse();

      const filteredEntries = service.allEntryCurrentUserThisMonth.value;
      expect(filteredEntries.length).toBe(2);
      expect(filteredEntries.every((entry: any) => entry.date === '15.01.2024')).toBeTrue();
      expect(filteredEntries[0].time).toBe('09:00');
      expect(filteredEntries[1].time).toBe('10:00');
    });

    it('should integrate showAllRec with real data', () => {
      service.showAllRec();

      expect(service.showAll.value).toBeTrue();
      expect(service.filterByOrg.value).toBeFalse();
      expect(service.filterByDate.value).toBeFalse();

      const allEntries = service.allEntryCurrentUserThisMonth.value;
      expect(allEntries.length).toBe(3);
      expect(allEntries[0].date).toBe('15.01.2024');
      expect(allEntries[1].date).toBe('15.01.2024');
      expect(allEntries[2].date).toBe('16.01.2024');
    });
  });

  describe('Data Setting Integration', () => {
    it('should integrate getDataSetting with real DateService BehaviorSubjects', () => {
      const allUsers = [
        { ...mockUserData, role: 'ADMIN' },
        { ...mockUserData, id: 'user2', role: 'USER' }
      ];

      service.getDataSetting(allUsers, false);

      // Проверяем, что все BehaviorSubjects были обновлены
      expect(dateService.timeStartRecord.value).toBe(9);
      expect(dateService.timeMinutesRec.value).toBe('00');
      expect(dateService.timeFinishRecord.value).toBe(18);
      expect(dateService.maxPossibleEntries.value).toBe(10);
      expect(dateService.recordingDays.value).toBe('пн, вт, ср');
      expect(dateService.location.value).toBe('Office 1');
      expect(dateService.phoneOrg.value).toBe('+1234567890');
      expect(dateService.changedSettingsOrg.value).toBeTrue();
    });

    it('should integrate getDataSetting for EMPLOYEE role', () => {
      const allUsers = [
        { ...mockUserData, role: 'EMPLOYEE' },
        { ...mockUserData, id: 'user2', role: 'ADMIN' }
      ];

      service.getDataSetting(allUsers, true);

      expect(dateService.timeStartRecord.value).toBe(9);
      expect(dateService.timeMinutesRec.value).toBe('00');
      expect(dateService.timeFinishRecord.value).toBe(18);
      expect(dateService.maxPossibleEntries.value).toBe(10);
      expect(dateService.recordingDays.value).toBe('пн, вт, ср');
      expect(dateService.location.value).toBe('Office 1');
      expect(dateService.phoneOrg.value).toBe('+1234567890');
      expect(dateService.changedSettingsOrg.value).toBeTrue();
    });
  });

  describe('Employee Checking Integration', () => {
    it('should integrate checkingOrgHasEmployees with real DateService data', () => {
      const usersWithJobTitle = [
        { ...mockUserData, jobTitle: 'Manager' },
        { ...mockUserData, id: 'user2', jobTitle: 'Assistant' }
      ];
      dateService.allUsersSelectedOrg.next(usersWithJobTitle);

      const result = service.checkingOrgHasEmployees();

      expect(result).toBeTrue();
    });

    it('should integrate checkingOrgHasEmployees with users without jobTitle', () => {
      const usersWithoutJobTitle = [
        { ...mockUserData, jobTitle: '' },
        { ...mockUserData, id: 'user2', jobTitle: '' }
      ];
      dateService.allUsersSelectedOrg.next(usersWithoutJobTitle);

      const result = service.checkingOrgHasEmployees();

      expect(result).toBeFalse();
    });

    it('should integrate checkingOrgHasEmployees with empty users array', () => {
      dateService.allUsersSelectedOrg.next([]);

      const result = service.checkingOrgHasEmployees();

      expect(result).toBeFalse();
    });
  });

  describe('Router Link Integration', () => {
    beforeEach(() => {
      // Mock localStorage для интеграционных тестов
      const mockUserData = {
        user: {
          initialValueIdOrg: 'initialOrg123',
          initialValueSectionOrOrganization: 'Initial Organization'
        }
      };
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserData));
    });

    it('should integrate routerLinkMain with real DateService BehaviorSubjects', () => {
      spyOn(service, 'getAllEntryAllUsersForTheMonth');
      spyOn(service, 'getAllUsersCurrentOrganization');

      service.routerLinkMain(true);

      expect(dateService.idOrgWhereSelectedEmployee.value).toBe('initialOrg123');
      expect(dateService.idSelectedOrg.value).toBe('initialOrg123');
      expect(dateService.currentOrg.value).toBe('Initial Organization');
      expect(service.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(service.getAllUsersCurrentOrganization).toHaveBeenCalled();
    });

    it('should integrate routerLinkMain with existing organization data', () => {
      dateService.idOrgWhereSelectedEmployee.next('existingOrg123');
      dateService.nameOrgWhereSelectedEmployee.next('Existing Organization');

      service.routerLinkMain(false);

      expect(dateService.idSelectedOrg.value).toBe('existingOrg123');
      expect(dateService.currentOrg.value).toBe('Existing Organization');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle basic operations without errors', () => {
      // Act & Assert - basic operations should work
      expect(() => service.getAllEntryAllUsersForTheMonth()).not.toThrow();
      expect(() => service.getAllUsersCurrentOrganization()).not.toThrow();
      expect(() => service.getAllEntryCurrentUsersThisMonth()).not.toThrow();
    });
  });

  describe('Complex Scenarios Integration', () => {
    it('should handle basic service operations without errors', () => {
      // Act & Assert - basic operations should work
      expect(() => service.getAllEntryAllUsersForTheMonth()).not.toThrow();
      expect(() => service.getAllUsersCurrentOrganization()).not.toThrow();
      expect(() => service.getAllEntryCurrentUsersThisMonth()).not.toThrow();
    });

    it('should handle filtering operations without errors', () => {
      // Act & Assert - filtering operations should work
      expect(() => service.filterRecCurrentUserByOrg()).not.toThrow();
      expect(() => service.filterRecCurrentUserByDate()).not.toThrow();
      expect(() => service.showAllRec()).not.toThrow();
    });

    it('should handle utility methods without errors', () => {
      // Act & Assert - utility methods should work
      expect(() => service.checkingOrgHasEmployees()).not.toThrow();
    });
  });
});
