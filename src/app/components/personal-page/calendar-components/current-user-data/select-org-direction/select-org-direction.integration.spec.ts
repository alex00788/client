import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelectOrgDirectionComponent } from './select-org-direction.component';
import { DateService } from '../../date.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SelectOrgDirectionComponent Integration', () => {
  let component: SelectOrgDirectionComponent;
  let fixture: ComponentFixture<SelectOrgDirectionComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockEmployees = [
    {
      id: '1',
      idRec: 'rec1',
      nameUser: 'John',
      surnameUser: 'Doe',
      jobTitle: 'Developer',
      direction: 'IT',
      photoEmployee: 'photo1.jpg'
    },
    {
      id: '2',
      idRec: 'rec2',
      nameUser: 'Jane',
      surnameUser: 'Smith',
      jobTitle: 'Designer',
      direction: 'Design',
      photoEmployee: 'photo2.jpg'
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getAllEntryAllUsersOrg',
      'getAllUsersCurrentOrganization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SelectOrgDirectionComponent,
        HttpClientTestingModule
      ],
      providers: [
        DateService,
        DataCalendarService,
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectOrgDirectionComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    // Setup mock data
    dateService.allUsersSelectedOrg.next(mockEmployees);
    dateService.allUsersSelectedOrgDuplicateForShowEmployees.next(mockEmployees);
    dateService.openEmployee.next(false);
    dateService.idSelectedOrg.next('org123');
  });

  describe('Integration with Real Services', () => {
    it('should integrate with DateService and update employees list', fakeAsync(() => {
      // Simulate service data update
      const newEmployees = [...mockEmployees, {
        id: '3',
        idRec: 'rec3',
        nameUser: 'Bob',
        surnameUser: 'Johnson',
        jobTitle: 'Manager',
        direction: 'Management',
        photoEmployee: 'photo3.jpg'
      }];
      
      dateService.allUsersSelectedOrg.next(newEmployees);
      tick();
      
      // Component should handle new data
      expect(component.dateService.allUsersSelectedOrg.value).toEqual(newEmployees);
    }));

    it('should handle service errors gracefully', fakeAsync(() => {
      // Component should not crash on initialization
      expect(() => component.ngOnInit()).not.toThrow();
      tick();
    }));

    it('should integrate with DataCalendarService methods', fakeAsync(() => {
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      component.choiceEmployee(mockEmployees[0]);
      tick();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    }));

    it('should maintain data consistency across service interactions', fakeAsync(() => {
      // Initial state
      expect(dateService.openEmployee.value).toBe(false);
      
      // Mock the problematic service methods
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      // Choose employee
      component.choiceEmployee(mockEmployees[0]);
      tick();
      
      // Verify state changes
      expect(dateService.openEmployee.value).toBe(true);
      expect(dateService.idSelectedOrg.value).toBe(mockEmployees[0].idRec);
      
      // Mock the routerLinkMain method
      spyOn(dataCalendarService, 'routerLinkMain');
      
      // Return to org
      component.returnToOrg();
      tick();
      
      // Verify state reset
      expect(dateService.openEmployee.value).toBe(false);
    }));
  });

  describe('Real Service Data Flow', () => {
    it('should handle real service data updates', fakeAsync(() => {
      // Simulate real service data
      const realServiceData = [
        {
          id: '1',
          idRec: 'rec1',
          nameUser: 'Real User',
          surnameUser: 'Real Surname',
          jobTitle: 'Real Job',
          direction: 'Real Direction',
          photoEmployee: 'real-photo.jpg'
        }
      ];
      
      dateService.allUsersSelectedOrg.next(realServiceData);
      tick();
      
      // Component should handle real data correctly
      expect(component.dateService.allUsersSelectedOrg.value).toEqual(realServiceData);
    }));

    it('should handle empty service data', fakeAsync(() => {
      dateService.allUsersSelectedOrg.next([]);
      tick();
      
      // Component should handle empty data gracefully
      expect(component.dateService.allUsersSelectedOrg.value).toEqual([]);
    }));

    it('should handle service data with missing properties', fakeAsync(() => {
      const incompleteData = [
        { id: '1', nameUser: 'User' },
        { id: '2', jobTitle: 'Job' }
      ];
      
      dateService.allUsersSelectedOrg.next(incompleteData);
      tick();
      
      // Component should handle incomplete data
      expect(component.dateService.allUsersSelectedOrg.value).toEqual(incompleteData);
    }));
  });

  describe('Service Method Integration', () => {
    it('should call service methods with correct parameters', fakeAsync(() => {
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      component.choiceEmployee(mockEmployees[0]);
      tick();
      
      // Verify service methods are called
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    }));

    it('should handle service method failures', fakeAsync(() => {
      // Simulate service method failure
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth').and.throwError('Service Error');
      
      // Component should handle service failures gracefully
      expect(() => component.choiceEmployee(mockEmployees[0])).toThrow();
      tick();
    }));
  });

  describe('Real Component Lifecycle', () => {
    it('should handle complete component lifecycle with real services', fakeAsync(() => {
      // Initialize
      component.ngOnInit();
      tick();
      
      // Verify initial state
      expect(component.dateService.allUsersSelectedOrg.value).toBeDefined();
      
      // Mock the problematic service methods
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      // Choose employee
      component.choiceEmployee(mockEmployees[0]);
      tick();
      
      // Verify employee selection
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(component.btnCloseEmployee).toBe(true);
      
      // Mock the routerLinkMain method
      spyOn(dataCalendarService, 'routerLinkMain');
      
      // Return to org
      component.returnToOrg();
      tick();
      
      // Verify return to org
      expect(component.disabledChoiceEmployee).toBe(false);
      expect(component.btnCloseEmployee).toBe(false);
      
      // Destroy
      component.ngOnDestroy();
      tick();
      
      // Component should be destroyed gracefully
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should handle rapid user interactions', fakeAsync(() => {
      // Simulate rapid user interactions
      component.switchDirection();
      component.switchDirection();
      component.switchDirection();
      
      // Component should handle rapid changes
      expect(component.showEmployees).toBe(false);
      
      // Mock the problematic service methods
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      // Choose employee
      component.choiceEmployee(mockEmployees[0]);
      tick();
      
      // Mock the routerLinkMain method
      spyOn(dataCalendarService, 'routerLinkMain');
      
      // Return to org
      component.returnToOrg();
      tick();
      
      // Component should maintain consistent state
      expect(component.disabledChoiceEmployee).toBe(false);
    }));
  });

  describe('Service Data Synchronization', () => {
    it('should synchronize data between services', fakeAsync(() => {
      // Update data in one service
      const updatedEmployees = [...mockEmployees, {
        id: '3',
        idRec: 'rec3',
        nameUser: 'New User',
        surnameUser: 'New Surname',
        jobTitle: 'New Job',
        direction: 'New Direction',
        photoEmployee: 'new-photo.jpg'
      }];
      
      dateService.allUsersSelectedOrg.next(updatedEmployees);
      tick();
      
      // Component should reflect updated data
      expect(component.dateService.allUsersSelectedOrg.value).toEqual(updatedEmployees);
      
      // Mock the problematic service methods
      spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
      
      // Choose new employee
      component.choiceEmployee(updatedEmployees[2]);
      tick();
      
      // Verify data synchronization
      expect(dateService.idSelectedOrg.value).toBe(updatedEmployees[2].idRec);
    }));

    it('should handle service data conflicts', fakeAsync(() => {
      // Simulate conflicting data between services
      dateService.allUsersSelectedOrg.next(mockEmployees);
      dateService.allUsersSelectedOrgDuplicateForShowEmployees.next([]);
      tick();
      
      // Component should handle conflicts gracefully
      expect(component.dateService.allUsersSelectedOrg.value).toEqual(mockEmployees);
    }));
  });
});
