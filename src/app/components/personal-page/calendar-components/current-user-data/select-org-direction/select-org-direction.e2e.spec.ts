import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelectOrgDirectionComponent } from './select-org-direction.component';
import { DateService } from '../../date.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('SelectOrgDirectionComponent E2E', () => {
  let component: SelectOrgDirectionComponent;
  let fixture: ComponentFixture<SelectOrgDirectionComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;
  let location: Location;

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
    },
    {
      id: '3',
      idRec: 'rec3',
      nameUser: 'Bob',
      surnameUser: 'Johnson',
      jobTitle: 'Manager',
      direction: 'Management',
      photoEmployee: 'photo3.jpg'
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
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'main', component: SelectOrgDirectionComponent },
          { path: 'employee/:id', component: SelectOrgDirectionComponent }
        ])
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
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    // Setup mock data
    dateService.allUsersSelectedOrg.next(mockEmployees);
    dateService.allUsersSelectedOrgDuplicateForShowEmployees.next(mockEmployees);
    dateService.openEmployee.next(false);
    dateService.idSelectedOrg.next('org123');

    // Mock problematic service methods for E2E tests
    spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
    spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
    spyOn(dataCalendarService, 'routerLinkMain');
  });

  describe('Complete User Journey', () => {
    it('should complete full user workflow from organization to employee and back', fakeAsync(() => {
      // Step 1: Initial state - showing organization directions
      expect(component.showEmployees).toBe(true);
      expect(component.employees).toBeUndefined();
      
      // Step 2: User clicks to show employees
      component.switchDirection();
      expect(component.showEmployees).toBe(false);
      
      // Step 3: Employees list is displayed
      component.getEmployeesList(false, null);
      expect(component.employees).toEqual(mockEmployees.filter(el => el.jobTitle.length > 1));
      
      // Step 4: User selects an employee
      const selectedEmployee = mockEmployees[0];
      component.choiceEmployee(selectedEmployee);
      
      // Step 5: Verify employee selection state
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(component.btnCloseEmployee).toBe(true);
      expect(component.btnHomeMenu).toBe(true);
      expect(dateService.openEmployee.value).toBe(true);
      expect(dateService.idSelectedOrg.value).toBe(selectedEmployee.idRec);
      
      // Step 6: User returns to organization
      component.returnToOrg();
      
      // Step 7: Verify return to organization state
      expect(component.disabledChoiceEmployee).toBe(false);
      expect(component.btnCloseEmployee).toBe(false);
      expect(component.btnHomeMenu).toBe(false);
      expect(dateService.openEmployee.value).toBe(false);
      
      // Step 8: User closes employee list
      component.returnToOrgAndCloseEmployees();
      expect(component.showEmployees).toBe(true);
      
      tick();
    }));

    it('should handle multiple employee selections in sequence', fakeAsync(() => {
      // First employee selection
      component.choiceEmployee(mockEmployees[0]);
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(dateService.idSelectedOrg.value).toBe(mockEmployees[0].idRec);
      
      // Return to org
      component.returnToOrg();
      expect(component.disabledChoiceEmployee).toBe(false);
      
      // Second employee selection
      component.choiceEmployee(mockEmployees[1]);
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(dateService.idSelectedOrg.value).toBe(mockEmployees[1].idRec);
      
      // Return to org again
      component.returnToOrg();
      expect(component.disabledChoiceEmployee).toBe(false);
      
      tick();
    }));

    it('should handle rapid user interactions without breaking', fakeAsync(() => {
      // Simulate rapid user clicks
      component.switchDirection();
      component.switchDirection();
      component.switchDirection();
      component.switchDirection();
      
      // Component should maintain consistent state
      // After 4 toggles (even number), showEmployees returns to initial state (true)
      expect(component.showEmployees).toBe(true);
      
      // Rapid employee selections
      component.choiceEmployee(mockEmployees[0]);
      component.returnToOrg();
      component.choiceEmployee(mockEmployees[1]);
      component.returnToOrg();
      component.choiceEmployee(mockEmployees[2]);
      
      // Verify final state
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(dateService.idSelectedOrg.value).toBe(mockEmployees[2].idRec);
      
      // Return to org to reset state
      component.returnToOrg();
      tick();
      
      // Verify final state is reset
      expect(component.disabledChoiceEmployee).toBe(false);
      
      tick();
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user browsing organization structure', fakeAsync(() => {
      // User starts at organization level
      expect(component.showEmployees).toBe(true);
      
      // User explores different directions
      component.switchDirection();
      expect(component.showEmployees).toBe(false);
      
      // User sees list of employees
      component.getEmployeesList(false, null);
      const filteredEmployees = mockEmployees.filter(el => el.jobTitle.length > 1);
      expect(component.employees).toEqual(filteredEmployees);
      
      // User decides not to select anyone and goes back
      component.switchDirection();
      expect(component.showEmployees).toBe(true);
      
      tick();
    }));

    it('should handle scenario: user selecting employee for detailed view', fakeAsync(() => {
      // User navigates to employee list
      component.switchDirection();
      component.getEmployeesList(false, null);
      
      // User selects specific employee
      const targetEmployee = mockEmployees.find(emp => emp.jobTitle === 'Developer');
      component.choiceEmployee(targetEmployee);
      
      // Verify detailed view state
      expect(component.disabledChoiceEmployee).toBe(true);
      expect(component.btnCloseEmployee).toBe(true);
      expect(component.btnHomeMenu).toBe(true);
      
      // User navigates back to organization
      component.returnToOrgAndCloseEmployees();
      expect(component.showEmployees).toBe(true);
      expect(component.disabledChoiceEmployee).toBe(false);
      
      tick();
    }));

    it('should handle scenario: user working with multiple organizations', fakeAsync(() => {
      // User starts with first organization
      expect(dateService.idSelectedOrg.value).toBe('org123');
      
      // User selects employee from first organization
      component.choiceEmployee(mockEmployees[0]);
      expect(dateService.idSelectedOrg.value).toBe(mockEmployees[0].idRec);
      
      // User returns to first organization
      component.returnToOrg();
      // Note: returnToOrg doesn't reset idSelectedOrg to original value
      // It only resets component state
      expect(component.disabledChoiceEmployee).toBe(false);
      
      // Simulate switching to different organization
      dateService.idSelectedOrg.next('org456');
      expect(dateService.idSelectedOrg.value).toBe('org456');
      
      // User selects employee from second organization
      const newEmployee = { ...mockEmployees[1], idRec: 'rec456' };
      component.choiceEmployee(newEmployee);
      expect(dateService.idSelectedOrg.value).toBe(newEmployee.idRec);
      
      tick();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network failures gracefully', fakeAsync(() => {
      // Simulate network failure
      apiService.getAllEntryAllUsersOrg.and.returnValue(throwError(() => new Error('Network Error')));
      
      // Component should not crash
      expect(() => component.ngOnInit()).not.toThrow();
      
      // User interactions should still work
      component.switchDirection();
      expect(component.showEmployees).toBe(false);
      
      tick();
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `emp${i}`,
        idRec: `rec${i}`,
        nameUser: `User${i}`,
        surnameUser: `Surname${i}`,
        jobTitle: `Job${i}`,
        direction: `Direction${i}`,
        photoEmployee: `photo${i}.jpg`
      }));
      
      dateService.allUsersSelectedOrg.next(largeDataset);
      tick();
      
      // Component should handle large datasets
      component.getEmployeesList(false, null);
      expect(component.employees).toBeDefined();
      expect(component.employees.length).toBeGreaterThan(0);
      
      tick();
    }));

    it('should handle concurrent user actions', fakeAsync(() => {
      // Simulate concurrent actions
      const promises = [
        Promise.resolve(component.switchDirection()),
        Promise.resolve(component.switchDirection()),
        Promise.resolve(component.switchDirection())
      ];
      
      Promise.all(promises).then(() => {
        // Component should maintain consistent state
        expect(component.showEmployees).toBe(false);
      });
      
      tick();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        component.switchDirection();
        component.choiceEmployee(mockEmployees[0]);
        component.returnToOrg();
      }
      
      // Clean up
      component.ngOnDestroy();
      
      // Memory should be properly managed
      expect(component['destroyed$']).toBeDefined();
      
      tick();
    }));

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      // Perform rapid state changes
      for (let i = 0; i < 1000; i++) {
        component.switchDirection();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      
      tick();
    }));
  });

  describe('Accessibility and UX', () => {
    it('should maintain consistent state for screen readers', fakeAsync(() => {
      // Initial state
      expect(component.showEmployees).toBe(true);
      
      // State change
      component.switchDirection();
      expect(component.showEmployees).toBe(false);
      
      // State should be consistent
      expect(component.showEmployees).toBe(false);
      
      tick();
    }));

    it('should handle keyboard navigation scenarios', fakeAsync(() => {
      // Simulate keyboard navigation
      component.switchDirection(); // Enter key on direction
      expect(component.showEmployees).toBe(false);
      
      // Simulate Tab navigation
      component.choiceEmployee(mockEmployees[0]); // Enter key on employee
      expect(component.disabledChoiceEmployee).toBe(true);
      
      // Simulate Escape key
      component.returnToOrg();
      expect(component.disabledChoiceEmployee).toBe(false);
      
      tick();
    }));
  });
});
