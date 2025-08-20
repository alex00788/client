import { TestBed } from '@angular/core/testing';
import { DataCalendarService } from './data-calendar.service';
import { ApiService } from '../../../../shared/services/api.service';
import { DateService } from '../date.service';
import { BehaviorSubject, of } from 'rxjs';
import moment from 'moment';

describe('DataCalendarService', () => {
  let service: DataCalendarService;
  let apiService: jasmine.SpyObj<ApiService>;
  let dateService: jasmine.SpyObj<DateService>;

  // Mock данные
  const mockDate = moment('2024-01-15');
  const mockOrg = 'Test Organization';
  const mockOrgId = 'org123';
  const mockUserId = 'user123';

  beforeEach(() => {
    // Create spies for services
    apiService = jasmine.createSpyObj('ApiService', [
      'getAllEntryAllUsersOrg',
      'getAllUsersCurrentOrganization',
      'getAllEntryCurrentUser',
      'getPhoneClient',
      'deleteEntry'
    ]);

    dateService = jasmine.createSpyObj('DateService', [
      'allEntryAllUsersInMonth',
      'allUsersOrganization',
      'allEntryCurrentUsersThisMonth',
      'clientPhone',
      'clientEmail',
      'nameSelectedOrg',
      'remainingFunds',
      'recordingDaysChanged',
      'timeStartRecord',
      'currentUserId',
      'currentUserIsTheAdminOrg',
      'timeMinutesRec',
      'timeFinishRecord',
      'maxPossibleEntries',
      'recordingDays',
      'location',
      'phoneOrg',
      'changedSettingsOrg',
      'allUsersSelectedOrg',
      'idSelectedOrg',
      'currentOrg',
      'idOrgWhereSelectedEmployee',
      'nameOrgWhereSelectedEmployee',
      'sectionOrOrganization',
      'howMuchRecorded',
      'userCancelHimselfRec',
      'date',
      'openEmployee',
      'currentUserRole',
      'currentUserSimpleUser',
      'currentUserNameAndSurname',
      'filterByOrg',
      'filterByDate',
      'showAll',
      'allUsersForShowAllFilter'
    ], {
      allEntryAllUsersInMonth: new BehaviorSubject([]),
      allUsersOrganization: new BehaviorSubject([]),
      allEntryCurrentUsersThisMonth: new BehaviorSubject([]),
      clientPhone: new BehaviorSubject(''),
      clientEmail: new BehaviorSubject(''),
      nameSelectedOrg: new BehaviorSubject(''),
      remainingFunds: new BehaviorSubject(0),
      recordingDaysChanged: new BehaviorSubject([]),
      timeStartRecord: new BehaviorSubject(9),
      currentUserId: new BehaviorSubject(mockUserId),
      currentUserIsTheAdminOrg: new BehaviorSubject(false),
      timeMinutesRec: new BehaviorSubject('00'),
      timeFinishRecord: new BehaviorSubject(18),
      maxPossibleEntries: new BehaviorSubject(10),
      recordingDays: new BehaviorSubject('пн, вт, ср'),
      location: new BehaviorSubject(''),
      phoneOrg: new BehaviorSubject(''),
      changedSettingsOrg: new BehaviorSubject(false),
      allUsersSelectedOrg: new BehaviorSubject([]),
      idSelectedOrg: new BehaviorSubject(mockOrgId),
      currentOrg: new BehaviorSubject(mockOrg),
      idOrgWhereSelectedEmployee: new BehaviorSubject(mockOrgId),
      nameOrgWhereSelectedEmployee: new BehaviorSubject(mockOrg),
      sectionOrOrganization: new BehaviorSubject(mockOrg),
      howMuchRecorded: new BehaviorSubject(0),
      userCancelHimselfRec: new BehaviorSubject(0),
      date: new BehaviorSubject(mockDate),
      openEmployee: new BehaviorSubject(false),
      currentUserRole: new BehaviorSubject(''),
      currentUserSimpleUser: new BehaviorSubject(false),
      currentUserNameAndSurname: new BehaviorSubject(''),
      filterByOrg: new BehaviorSubject(false),
      filterByDate: new BehaviorSubject(false),
      showAll: new BehaviorSubject(false),
      allUsersForShowAllFilter: new BehaviorSubject([])
    });

    // Configure API service spies to return observables
    apiService.getAllEntryAllUsersOrg.and.returnValue(of([]));
    apiService.getAllUsersCurrentOrganization.and.returnValue(of([]));
    apiService.getAllEntryCurrentUser.and.returnValue(of([]));
    apiService.getPhoneClient.and.returnValue(of({ phone: '+1234567890', email: 'test@example.com' }));
    apiService.deleteEntry.and.returnValue(of({ success: true }));

    // Create service instance
    service = new DataCalendarService(apiService, dateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have BehaviorSubject properties initialized', () => {
    expect(service.allEntryAllUsersInMonth).toBeTruthy();
    expect(service.allUsersForShowAllFilter).toBeTruthy();
    expect(service.filterByOrg).toBeTruthy();
    expect(service.filterByDate).toBeTruthy();
    expect(service.showAll).toBeTruthy();
  });

  it('should call API service when getAllEntryAllUsersForTheMonth is called', () => {
    service.getAllEntryAllUsersForTheMonth();
    expect(apiService.getAllEntryAllUsersOrg).toHaveBeenCalled();
  });

  it('should call API service when getAllUsersCurrentOrganization is called', () => {
    service.getAllUsersCurrentOrganization();
    expect(apiService.getAllUsersCurrentOrganization).toHaveBeenCalled();
  });

  it('should call API service when getAllEntryCurrentUsersThisMonth is called', () => {
    service.getAllEntryCurrentUsersThisMonth();
    expect(apiService.getAllEntryCurrentUser).toHaveBeenCalled();
  });

  it('should call API service when getPhoneSelectedUser is called', () => {
    service.getPhoneSelectedUser('user123');
    expect(apiService.getPhoneClient).toHaveBeenCalledWith('user123');
  });

  it('should call API service when deleteSelectedRecInAllRecBlock is called', () => {
    const selectedRec = { idRec: 'rec1', userId: 'user123', orgId: 'org123' };
    service.deleteSelectedRecInAllRecBlock(selectedRec);
    expect(apiService.deleteEntry).toHaveBeenCalled();
  });

  it('should filter entries by organization when filterRecCurrentUserByOrg is called', () => {
    service.filterRecCurrentUserByOrg();
    expect(service.filterByOrg.value).toBe(true);
    expect(service.filterByDate.value).toBe(false);
    expect(service.showAll.value).toBe(false);
  });

  it('should filter entries by date when filterRecCurrentUserByDate is called', () => {
    service.filterRecCurrentUserByDate();
    expect(service.filterByOrg.value).toBe(false);
    expect(service.filterByDate.value).toBe(true);
    expect(service.showAll.value).toBe(false);
  });

  it('should show all records when showAllRec is called', () => {
    service.showAllRec();
    expect(service.showAll.value).toBe(true);
    expect(service.filterByOrg.value).toBe(false);
    expect(service.filterByDate.value).toBe(false);
  });

  it('should check if organization has employees', () => {
    const result = service.checkingOrgHasEmployees();
    expect(typeof result).toBe('boolean');
  });

  it('should handle routerLinkMain with returnToYourPage = true', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
      user: {
        initialValueIdOrg: 'org123',
        initialValueSectionOrOrganization: 'Test Organization'
      }
    }));

    service.routerLinkMain(true);
    
    // Проверяем, что метод выполнился без ошибок
    expect(service).toBeTruthy();
  });

  it('should handle routerLinkMain with returnToYourPage = false', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
      user: {
        initialValueIdOrg: 'org123',
        initialValueSectionOrOrganization: 'Test Organization'
      }
    }));

    service.routerLinkMain(false);
    
    // Проверяем, что метод выполнился без ошибок
    expect(service).toBeTruthy();
  });
});
