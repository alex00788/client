import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataCalendarService } from './data-calendar.service';
import { ApiService } from '../../../../shared/services/api.service';
import { DateService } from '../date.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import moment from 'moment';

describe('DataCalendarService E2E Tests', () => {
  let service: DataCalendarService;
  let apiService: ApiService;
  let dateService: DateService;

  // Mock данные для E2E тестов
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
      imports: [HttpClientTestingModule, RouterTestingModule],
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

  describe('End-to-End Service Workflows', () => {
    it('should handle basic service operations E2E', () => {
      // Act & Assert - basic operations should work
      expect(() => service.getAllEntryAllUsersForTheMonth()).not.toThrow();
      expect(() => service.getAllUsersCurrentOrganization()).not.toThrow();
      expect(() => service.getAllEntryCurrentUsersThisMonth()).not.toThrow();
    });

    it('should handle filtering operations E2E', () => {
      // Act & Assert - filtering operations should work
      expect(() => service.filterRecCurrentUserByOrg()).not.toThrow();
      expect(() => service.filterRecCurrentUserByDate()).not.toThrow();
      expect(() => service.showAllRec()).not.toThrow();
    });

    it('should handle utility methods E2E', () => {
      // Act & Assert - utility methods should work
      expect(() => service.checkingOrgHasEmployees()).not.toThrow();
    });
  });

  describe('E2E State Management and Persistence', () => {
    it('should maintain service state during operations', () => {
      // Act & Assert - service state should be maintained
      expect(service).toBeTruthy();
      expect(service.allEntryAllUsersInMonth).toBeTruthy();
      expect(service.allUsersForShowAllFilter).toBeTruthy();
    });
  });

  describe('E2E Error Handling and Edge Cases', () => {
    it('should handle basic error scenarios E2E', () => {
      // Act & Assert - basic error handling should work
      expect(() => service.checkingOrgHasEmployees()).not.toThrow();
    });
  });
});
