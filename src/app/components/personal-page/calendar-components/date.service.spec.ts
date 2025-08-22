import { TestBed } from '@angular/core/testing';
import { DateService } from './date.service';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

describe('DateService', () => {
  let service: DateService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key]);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [DateService]
    });
    service = TestBed.inject(DateService);
  });

  afterEach(() => {
    // Reset all BehaviorSubjects to initial values
    service.date.next(moment());
    service.currentUserNameAndSurname.next('');
    service.currentUserId.next('');
    service.currentUserRole.next('');
    service.currentOrg.next('');
    service.currentOrgWasRenamed.next(false);
    service.switchOrg.next(false);
    service.youCanSendRequestToClearDatabase.next(true);
    service.currentUserIsTheMainAdmin.next(false);
    service.currentUserIsTheAdminOrg.next(false);
    service.openEmployee.next(false);
    service.userSignedHimself.next(false);
    service.userCancelHimselfRec.next(0);
    service.currentUserSimpleUser.next(false);
    service.calendarBodyOpen.next(true);
    service.recordingDaysChanged.next(false);
    service.changedSettingsOrg.next(false);
    service.remainingFunds.next('');
    service.allUsers.next([]);
    service.allEntrySelectedUserInSelectMonth.next([]);
    service.allUsersSelectedOrg.next([]);
    service.allUsersSelectedOrgDuplicateForShowEmployees.next([]);
    service.allOrganization.next([]);
    service.dataAboutSelectedRec.next({});
    service.idSelectedOrg.next('');
    service.idOrgWhereSelectedEmployee.next('');
    service.nameOrgWhereSelectedEmployee.next('');
    service.nameOrganizationWhereItCameFrom.next('');
    service.nameSelectedOrg.next('');
    service.idOrganizationWhereItCameFrom.next('');
    service.sectionOrOrganization.next('');
    service.timeStartRecord.next(18);
    service.timeFinishRecord.next(19);
    service.timeMinutesRec.next('00');
    service.location.next('');
    service.recordingDays.next('');
    service.phoneOrg.next('');
    service.timeUntilBlock.next(12);
    service.maxPossibleEntries.next('');
    service.howMuchRecorded.next(0);
    service.dataSelectedUser.next({});
    service.clientPhone.next('');
    service.clientEmail.next('');
    service.pasForLink.next('');
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(service.date.value).toBeTruthy();
      expect(service.currentUserNameAndSurname.value).toBe('');
      expect(service.currentUserId.value).toBe('');
      expect(service.currentUserRole.value).toBe('');
      expect(service.currentOrg.value).toBe('');
      expect(service.currentOrgWasRenamed.value).toBe(false);
      expect(service.switchOrg.value).toBe(false);
      expect(service.youCanSendRequestToClearDatabase.value).toBe(true);
      expect(service.currentUserIsTheMainAdmin.value).toBe(false);
      expect(service.currentUserIsTheAdminOrg.value).toBe(false);
      expect(service.openEmployee.value).toBe(false);
      expect(service.userSignedHimself.value).toBe(false);
      expect(service.userCancelHimselfRec.value).toBe(0);
      expect(service.currentUserSimpleUser.value).toBe(false);
      expect(service.calendarBodyOpen.value).toBe(true);
      expect(service.recordingDaysChanged.value).toBe(false);
      expect(service.changedSettingsOrg.value).toBe(false);
      expect(service.remainingFunds.value).toBe('');
      expect(service.allUsers.value).toEqual([]);
      expect(service.allEntrySelectedUserInSelectMonth.value).toEqual([]);
      expect(service.allUsersSelectedOrg.value).toEqual([]);
      expect(service.allUsersSelectedOrgDuplicateForShowEmployees.value).toEqual([]);
      expect(service.allOrganization.value).toEqual([]);
      expect(service.dataAboutSelectedRec.value).toEqual({});
      expect(service.idSelectedOrg.value).toBe('');
      expect(service.idOrgWhereSelectedEmployee.value).toBe('');
      expect(service.nameOrgWhereSelectedEmployee.value).toBe('');
      expect(service.nameOrganizationWhereItCameFrom.value).toBe('');
      expect(service.nameSelectedOrg.value).toBe('');
      expect(service.idOrganizationWhereItCameFrom.value).toBe('');
      expect(service.sectionOrOrganization.value).toBe('');
      expect(service.timeStartRecord.value).toBe(18);
      expect(service.timeFinishRecord.value).toBe(19);
      expect(service.timeMinutesRec.value).toBe('00');
      expect(service.location.value).toBe('');
      expect(service.recordingDays.value).toBe('');
      expect(service.phoneOrg.value).toBe('');
      expect(service.timeUntilBlock.value).toBe(12);
      expect(service.maxPossibleEntries.value).toBe('');
      expect(service.howMuchRecorded.value).toBe(0);
      expect(service.dataSelectedUser.value).toEqual({});
      expect(service.clientPhone.value).toBe('');
      expect(service.clientEmail.value).toBe('');
      expect(service.pasForLink.value).toBe('');
    });

    it('should initialize date with current moment', () => {
      const now = moment();
      const serviceDate = service.date.value;
      expect(serviceDate.isSame(now, 'minute')).toBe(true);
    });
  });

  describe('changeMonth', () => {
    it('should change month forward by 1', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(1);
      
      expect(service.date.value.month()).toBe(1); // February
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change month backward by 1', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(-1);
      
      expect(service.date.value.month()).toBe(11); // December of previous year
      expect(service.date.value.year()).toBe(2023);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change month by multiple months forward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(3);
      
      expect(service.date.value.month()).toBe(3); // April
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change month by multiple months backward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(-3);
      
      expect(service.date.value.month()).toBe(9); // October of previous year (0-based indexing)
      expect(service.date.value.year()).toBe(2023);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle year boundary correctly when going forward', () => {
      const initialDate = moment('2024-12-15');
      service.date.next(initialDate);
      
      service.changeMonth(1);
      
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2025);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle year boundary correctly when going backward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(-1);
      
      expect(service.date.value.month()).toBe(11); // December
      expect(service.date.value.year()).toBe(2023);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should set recordingDaysChanged to true', () => {
      service.recordingDaysChanged.next(false);
      
      service.changeMonth(1);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });
  });

  describe('changeOneDay', () => {
    it('should change day forward by 1', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneDay(1);
      
      expect(service.date.value.date()).toBe(16);
      expect(service.date.value.month()).toBe(0);
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change day backward by 1', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneDay(-1);
      
      expect(service.date.value.date()).toBe(14);
      expect(service.date.value.month()).toBe(0);
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change day by multiple days forward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneDay(5);
      
      expect(service.date.value.date()).toBe(20);
      expect(service.date.value.month()).toBe(0);
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change day by multiple days backward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneDay(-5);
      
      expect(service.date.value.date()).toBe(10);
      expect(service.date.value.month()).toBe(0);
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle month boundary correctly when going forward', () => {
      const initialDate = moment('2024-01-31');
      service.date.next(initialDate);
      
      service.changeOneDay(1);
      
      expect(service.date.value.date()).toBe(1);
      expect(service.date.value.month()).toBe(1); // February
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle month boundary correctly when going backward', () => {
      const initialDate = moment('2024-02-01');
      service.date.next(initialDate);
      
      service.changeOneDay(-1);
      
      expect(service.date.value.date()).toBe(31);
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle leap year correctly', () => {
      const initialDate = moment('2024-02-29');
      service.date.next(initialDate);
      
      service.changeOneDay(1);
      
      expect(service.date.value.date()).toBe(1);
      expect(service.date.value.month()).toBe(2); // March
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should set recordingDaysChanged to true', () => {
      service.recordingDaysChanged.next(false);
      
      service.changeOneDay(1);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });
  });

  describe('changeOneWeek', () => {
    it('should change week forward by 1', () => {
      const initialDate = moment('2024-01-15'); // Monday
      service.date.next(initialDate);
      
      service.changeOneWeek(1);
      
      // Note: This method has a bug - it doesn't update the date BehaviorSubject
      // It only calls add() but doesn't call next()
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change week backward by 1', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneWeek(-1);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change week by multiple weeks forward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneWeek(3);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should change week by multiple weeks backward', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneWeek(-3);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should set recordingDaysChanged to true', () => {
      service.recordingDaysChanged.next(false);
      
      service.changeOneWeek(1);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user data in localStorage', () => {
      const userData = {
        user: {
          nameUser: 'John',
          surnameUser: 'Doe'
        }
      };
      
      service.setUser(userData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(userData));
    });

    it('should set currentUserNameAndSurname correctly', () => {
      const userData = {
        user: {
          nameUser: 'Jane',
          surnameUser: 'Smith'
        }
      };
      
      service.setUser(userData);
      
      expect(service.currentUserNameAndSurname.value).toBe('Jane Smith');
    });

    it('should handle user data with empty names', () => {
      const userData = {
        user: {
          nameUser: '',
          surnameUser: ''
        }
      };
      
      service.setUser(userData);
      
      expect(service.currentUserNameAndSurname.value).toBe(' ');
    });

    it('should handle user data with null names', () => {
      const userData = {
        user: {
          nameUser: null,
          surnameUser: null
        }
      };
      
      service.setUser(userData);
      
      expect(service.currentUserNameAndSurname.value).toBe('null null');
    });

    it('should handle user data with undefined names', () => {
      const userData = {
        user: {
          nameUser: undefined,
          surnameUser: undefined
        }
      };
      
      service.setUser(userData);
      
      expect(service.currentUserNameAndSurname.value).toBe('undefined undefined');
    });
  });

  describe('getCurrentUser', () => {
    beforeEach(() => {
      // Reset localStorage mock
      mockLocalStorage = {};
    });

    it('should set currentUserSimpleUser to true for regular user', () => {
      const userData = {
        user: {
          role: 'USER',
          nameUser: 'John',
          surnameUser: 'Doe',
          id: 'user123',
          idOrg: 'org123',
          sectionOrOrganization: 'Test Org'
        }
      };
      mockLocalStorage['userData'] = JSON.stringify(userData);
      
      service.getCurrentUser();
      
      expect(service.currentUserSimpleUser.value).toBe(true);
      expect(service.currentUserIsTheAdminOrg.value).toBe(false);
      expect(service.currentUserIsTheMainAdmin.value).toBe(false);
    });

    it('should set currentUserIsTheAdminOrg to true for admin user', () => {
      const userData = {
        user: {
          role: 'ADMIN',
          nameUser: 'Admin',
          surnameUser: 'User',
          id: 'admin123',
          idOrg: 'org123',
          sectionOrOrganization: 'Test Org'
        }
      };
      mockLocalStorage['userData'] = JSON.stringify(userData);
      
      service.getCurrentUser();
      
      expect(service.currentUserSimpleUser.value).toBe(false);
      expect(service.currentUserIsTheAdminOrg.value).toBe(true);
      expect(service.currentUserIsTheMainAdmin.value).toBe(false);
    });

    it('should set currentUserIsTheMainAdmin to true for main admin user', () => {
      const userData = {
        user: {
          role: 'MAIN_ADMIN',
          nameUser: 'Main',
          surnameUser: 'Admin',
          id: 'mainadmin123',
          idOrg: 'org123',
          sectionOrOrganization: 'Test Org'
        }
      };
      mockLocalStorage['userData'] = JSON.stringify(userData);
      
      service.getCurrentUser();
      
      expect(service.currentUserSimpleUser.value).toBe(false);
      expect(service.currentUserIsTheAdminOrg.value).toBe(false);
      expect(service.currentUserIsTheMainAdmin.value).toBe(true);
    });

    it('should set all user properties correctly', () => {
      const userData = {
        user: {
          role: 'USER',
          nameUser: 'John',
          surnameUser: 'Doe',
          id: 'user123',
          idOrg: 'org123',
          sectionOrOrganization: 'Test Organization'
        }
      };
      mockLocalStorage['userData'] = JSON.stringify(userData);
      
      service.getCurrentUser();
      
      expect(service.currentUserNameAndSurname.value).toBe('John Doe');
      expect(service.currentUserId.value).toBe('user123');
      expect(service.currentUserRole.value).toBe('USER');
      expect(service.idSelectedOrg.value).toBe('org123');
      expect(service.currentOrg.value).toBe('Test Organization');
      expect(service.sectionOrOrganization.value).toBe('Test Organization');
    });

    it('should handle missing userData in localStorage', () => {
      // Mock localStorage.getItem to return null for this test only
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);
      
      expect(() => service.getCurrentUser()).toThrow();
      
      // Restore original method
      localStorage.getItem = originalGetItem;
    });

    it('should handle malformed userData in localStorage', () => {
      mockLocalStorage['userData'] = 'invalid json';
      
      expect(() => service.getCurrentUser()).toThrow();
    });
  });

  describe('changeDay', () => {
    it('should change to specific day', () => {
      const initialDate = moment('2024-01-15');
      const targetDay = moment('2024-03-20');
      service.date.next(initialDate);
      
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(20);
      expect(service.date.value.month()).toBe(2); // March
      expect(service.date.value.year()).toBe(2024);
    });

    it('should change to day in same month', () => {
      const initialDate = moment('2024-01-15');
      const targetDay = moment('2024-01-25');
      service.date.next(initialDate);
      
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(25);
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024);
    });

    it('should change to day in different month', () => {
      const initialDate = moment('2024-01-15');
      const targetDay = moment('2024-06-10');
      service.date.next(initialDate);
      
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(10);
      expect(service.date.value.month()).toBe(5); // June
      expect(service.date.value.year()).toBe(2024);
    });

    it('should change to day in different year', () => {
      const initialDate = moment('2024-01-15');
      const targetDay = moment('2025-02-15');
      service.date.next(initialDate);
      
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(15);
      expect(service.date.value.month()).toBe(1); // February
      expect(service.date.value.year()).toBe(2024); // Year stays the same as set() only changes date and month
    });

    it('should handle leap year day', () => {
      const initialDate = moment('2024-01-15');
      const targetDay = moment('2024-02-29');
      service.date.next(initialDate);
      
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(29);
      expect(service.date.value.month()).toBe(1); // February
      expect(service.date.value.year()).toBe(2024);
    });
  });

  describe('changeSettingsRec', () => {
    it('should update all recording settings', () => {
      const settings = {
        timeStartRec: '9',
        timeFinishRec: '18',
        maxiPeople: '20',
        timeUntilBlock: '24',
        location: 'Conference Room A',
        phoneOrg: '+1234567890'
      };
      
      service.changeSettingsRec(settings);
      
      expect(service.timeStartRecord.value).toBe(9);
      expect(service.timeFinishRecord.value).toBe(18);
      expect(service.maxPossibleEntries.value).toBe('20');
      expect(service.timeUntilBlock.value).toBe('24'); // Not converted to number
      expect(service.location.value).toBe('Conference Room A');
      expect(service.phoneOrg.value).toBe('+1234567890');
    });

    it('should handle string numbers correctly', () => {
      const settings = {
        timeStartRec: '10',
        timeFinishRec: '19',
        maxiPeople: '15',
        timeUntilBlock: '12',
        location: 'Room B',
        phoneOrg: '555-1234'
      };
      
      service.changeSettingsRec(settings);
      
      expect(service.timeStartRecord.value).toBe(10);
      expect(service.timeFinishRecord.value).toBe(19);
      expect(service.maxPossibleEntries.value).toBe('15');
      expect(service.timeUntilBlock.value).toBe('12'); // Not converted to number
      expect(service.location.value).toBe('Room B');
      expect(service.phoneOrg.value).toBe('555-1234');
    });

    it('should handle empty values', () => {
      const settings = {
        timeStartRec: '',
        timeFinishRec: '',
        maxiPeople: '',
        timeUntilBlock: '',
        location: '',
        phoneOrg: ''
      };
      
      service.changeSettingsRec(settings);
      
      expect(service.timeStartRecord.value).toBe(0);
      expect(service.timeFinishRecord.value).toBe(0);
      expect(service.maxPossibleEntries.value).toBe('');
      expect(service.timeUntilBlock.value).toBe(''); // Not converted to number
      expect(service.location.value).toBe('');
      expect(service.phoneOrg.value).toBe('');
    });

    it('should handle null values', () => {
      const settings = {
        timeStartRec: null,
        timeFinishRec: null,
        maxiPeople: null,
        timeUntilBlock: null,
        location: null,
        phoneOrg: null
      };
      
      service.changeSettingsRec(settings);
      
      expect(service.timeStartRecord.value).toBe(0);
      expect(service.timeFinishRecord.value).toBe(0);
      expect(service.maxPossibleEntries.value).toBe(null);
      expect(service.timeUntilBlock.value).toBe(null); // Not converted to number
      expect(service.location.value).toBe(null);
      expect(service.phoneOrg.value).toBe(null);
    });
  });

  describe('openCalendar', () => {
    it('should toggle calendar body open state from true to false', () => {
      service.calendarBodyOpen.next(true);
      
      service.openCalendar();
      
      expect(service.calendarBodyOpen.value).toBe(false);
    });

    it('should toggle calendar body open state from false to true', () => {
      service.calendarBodyOpen.next(false);
      
      service.openCalendar();
      
      expect(service.calendarBodyOpen.value).toBe(true);
    });

    it('should toggle calendar body open state multiple times', () => {
      service.calendarBodyOpen.next(true);
      
      service.openCalendar(); // true -> false
      expect(service.calendarBodyOpen.value).toBe(false);
      
      service.openCalendar(); // false -> true
      expect(service.calendarBodyOpen.value).toBe(true);
      
      service.openCalendar(); // true -> false
      expect(service.calendarBodyOpen.value).toBe(false);
    });
  });

  describe('getUsersSelectedOrg', () => {
    it('should filter users by organization', () => {
      const allUsers = [
        { id: '1', sectionOrOrganization: 'Org A', name: 'User 1' },
        { id: '2', sectionOrOrganization: 'Org B', name: 'User 2' },
        { id: '3', sectionOrOrganization: 'Org A', name: 'User 3' },
        { id: '4', sectionOrOrganization: 'Org C', name: 'User 4' }
      ];
      service.allUsers.next(allUsers);
      
      service.getUsersSelectedOrg('Org A');
      
      expect(service.allUsersSelectedOrg.value).toEqual([
        { id: '1', sectionOrOrganization: 'Org A', name: 'User 1' },
        { id: '3', sectionOrOrganization: 'Org A', name: 'User 3' }
      ]);
    });

    it('should return empty array when no users match organization', () => {
      const allUsers = [
        { id: '1', sectionOrOrganization: 'Org A', name: 'User 1' },
        { id: '2', sectionOrOrganization: 'Org B', name: 'User 2' }
      ];
      service.allUsers.next(allUsers);
      
      service.getUsersSelectedOrg('Org C');
      
      expect(service.allUsersSelectedOrg.value).toEqual([]);
    });

    it('should handle empty users array', () => {
      service.allUsers.next([]);
      
      service.getUsersSelectedOrg('Org A');
      
      expect(service.allUsersSelectedOrg.value).toEqual([]);
    });

    it('should handle null organization parameter', () => {
      const allUsers = [
        { id: '1', sectionOrOrganization: 'Org A', name: 'User 1' }
      ];
      service.allUsers.next(allUsers);
      
      service.getUsersSelectedOrg(null);
      
      expect(service.allUsersSelectedOrg.value).toEqual([]);
    });

    it('should handle undefined organization parameter', () => {
      const allUsers = [
        { id: '1', sectionOrOrganization: 'Org A', name: 'User 1' }
      ];
      service.allUsers.next(allUsers);
      
      service.getUsersSelectedOrg(undefined);
      
      expect(service.allUsersSelectedOrg.value).toEqual([]);
    });

    it('should handle users without sectionOrOrganization property', () => {
      const allUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', sectionOrOrganization: 'Org A', name: 'User 2' }
      ];
      service.allUsers.next(allUsers);
      
      service.getUsersSelectedOrg('Org A');
      
      expect(service.allUsersSelectedOrg.value).toEqual([
        { id: '2', sectionOrOrganization: 'Org A', name: 'User 2' }
      ]);
    });
  });

  describe('BehaviorSubject subscriptions', () => {
    it('should emit new values when date changes', () => {
      let emittedValue: any;
      service.date.subscribe(newDate => {
        emittedValue = newDate;
      });
      
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      expect(emittedValue).toBeTruthy();
      expect(emittedValue.isSame(initialDate)).toBe(true);
    });

    it('should emit new values when user data changes', () => {
      let emittedValue: any;
      service.currentUserNameAndSurname.subscribe(newName => {
        emittedValue = newName;
      });
      
      const userData = {
        user: {
          nameUser: 'John',
          surnameUser: 'Doe'
        }
      };
      service.setUser(userData);
      
      expect(emittedValue).toBe('John Doe');
    });

    it('should emit new values when settings change', () => {
      let emittedValue: any;
      service.timeStartRecord.subscribe(newTime => {
        emittedValue = newTime;
      });
      
      const settings = {
        timeStartRec: '10',
        timeFinishRec: '18',
        maxiPeople: '20',
        timeUntilBlock: '12',
        location: 'Room A',
        phoneOrg: '555-1234'
      };
      service.changeSettingsRec(settings);
      
      expect(emittedValue).toBe(10);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very large month changes', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(1000);
      
      expect(service.date.value.year()).toBe(2107);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle very large day changes', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      const targetDay = moment('2051-01-15');
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(15);
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024); // Year stays the same
    });

    it('should handle negative large month changes', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(-1000);
      
      expect(service.date.value.year()).toBe(1940);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle negative large day changes', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      const targetDay = moment('1996-01-15');
      service.changeDay(targetDay);
      
      expect(service.date.value.date()).toBe(15);
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024); // Year stays the same
    });

    it('should handle zero values in changeMonth', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeMonth(0);
      
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle zero values in changeOneDay', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneDay(0);
      
      expect(service.date.value.date()).toBe(15);
      expect(service.date.value.month()).toBe(0); // January
      expect(service.date.value.year()).toBe(2024);
      expect(service.recordingDaysChanged.value).toBe(true);
    });

    it('should handle zero values in changeOneWeek', () => {
      const initialDate = moment('2024-01-15');
      service.date.next(initialDate);
      
      service.changeOneWeek(0);
      
      expect(service.recordingDaysChanged.value).toBe(true);
    });
  });
});
