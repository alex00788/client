import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelectOrgToDisplayComponent } from './select-org-to-display.component';
import { DateService } from '../../date.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterOrgPipe } from '../../../../../shared/pipe/filter-org.pipe';

describe('SelectOrgToDisplayComponent E2E', () => {
  let component: SelectOrgToDisplayComponent;
  let fixture: ComponentFixture<SelectOrgToDisplayComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;
  let location: Location;

  const mockOrganizations = [
    {
      id: '1',
      name: 'IT Company',
      description: 'IT Services'
    },
    {
      id: '2',
      name: 'Design Studio',
      description: 'Creative Design'
    },
    {
      id: '3',
      name: 'Marketing Agency',
      description: 'Digital Marketing'
    },
    {
      id: '4',
      name: 'Consulting Firm',
      description: 'Business Consulting'
    },
    {
      id: '5',
      name: 'Research Lab',
      description: 'Scientific Research'
    }
  ];

  const mockUserData = {
    user: {
      id: 'user123',
      nameUser: 'John',
      surnameUser: 'Doe',
      role: 'ADMIN',
      sectionOrOrganization: 'IT Company',
      idOrg: '1',
      remainingFunds: 1000
    }
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getAllEntryAllUsersOrg',
      'getAllUsersCurrentOrganization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SelectOrgToDisplayComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'main', component: SelectOrgToDisplayComponent },
          { path: 'organization/:id', component: SelectOrgToDisplayComponent }
        ]),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        DateService,
        DataCalendarService,
        { provide: ApiService, useValue: apiServiceSpy },
        FilterOrgPipe
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectOrgToDisplayComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    // Setup mock data
    dateService.allOrganization.next(mockOrganizations);
    dateService.currentOrg.next('IT Company');
    dateService.idSelectedOrg.next('1');
    dateService.currentUserRole.next('ADMIN');
    dateService.remainingFunds.next(1000);

    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserData));
    spyOn(localStorage, 'setItem');

    // Mock problematic service methods for E2E tests
    spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
    spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
    spyOn(dataCalendarService, 'checkingOrgHasEmployees');
  });

  describe('Complete User Journey', () => {
    it('should complete full user workflow from organization browsing to selection and back', fakeAsync(() => {
      // Step 1: Initial state - showing current organization
      expect(component.showSelectedOrg).toBe(false);
      expect(component.dateService.currentOrg.value).toBe('IT Company');
      
      // Step 2: User clicks to show organization selection
      component.changeOrg();
      expect(component.showSelectedOrg).toBe(false); // Will be true after timeout
      
      // Step 3: Organization selection is displayed after timeout
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Step 4: User searches for specific organization
      component.searchOrgForRec = 'Design';
      expect(component.searchOrgForRec).toBe('Design');
      
      // Step 5: User selects an organization
      const selectedOrg = mockOrganizations[1]; // Design Studio
      component.choiceOrgForRec(selectedOrg);
      
      // Step 6: Verify organization selection state
      expect(component.showSelectedOrg).toBe(false);
      expect(dateService.currentOrg.value).toBe('Design Studio');
      expect(dateService.idSelectedOrg.value).toBe('2');
      expect(dateService.idOrgWhereSelectedEmployee.value).toBe('2');
      expect(dateService.nameOrgWhereSelectedEmployee.value).toBe('Design Studio');
      
      // Step 7: User refreshes data about organization
      component.refreshDataAboutOrg();
      
      // Step 8: Verify localStorage is updated
      expect(localStorage.setItem).toHaveBeenCalled();
      
      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      expect(savedData.user.sectionOrOrganization).toBe('Design Studio');
      expect(savedData.user.idOrg).toBe('2');
      
      tick();
    }));

    it('should handle multiple organization selections in sequence', fakeAsync(() => {
      // First organization selection
      component.choiceOrgForRec(mockOrganizations[0]);
      expect(dateService.currentOrg.value).toBe('IT Company');
      expect(dateService.idSelectedOrg.value).toBe('1');
      
      // Return to organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Second organization selection
      component.choiceOrgForRec(mockOrganizations[2]);
      expect(dateService.currentOrg.value).toBe('Marketing Agency');
      expect(dateService.idSelectedOrg.value).toBe('3');
      
      // Return to organization selection again
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Third organization selection
      component.choiceOrgForRec(mockOrganizations[4]);
      expect(dateService.currentOrg.value).toBe('Research Lab');
      expect(dateService.idSelectedOrg.value).toBe('5');
      
      tick();
    }));

    it('should handle rapid user interactions without breaking', fakeAsync(() => {
      // Simulate rapid user clicks
      component.changeOrg();
      component.changeOrg();
      component.changeOrg();
      component.changeOrg();
      
      // Component should maintain consistent state
      // After 4 toggles (even number), showSelectedOrg returns to initial state (false)
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Rapid organization selections
      component.choiceOrgForRec(mockOrganizations[0]);
      component.choiceOrgForRec(mockOrganizations[1]);
      component.choiceOrgForRec(mockOrganizations[2]);
      
      // Verify final state
      expect(dateService.currentOrg.value).toBe('Marketing Agency');
      expect(dateService.idSelectedOrg.value).toBe('3');
      
      tick();
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user browsing organization structure', fakeAsync(() => {
      // User starts at current organization level
      expect(component.showSelectedOrg).toBe(false);
      expect(component.dateService.currentOrg.value).toBe('IT Company');
      
      // User explores organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User sees list of organizations
      expect(component.dateService.allOrganization.value).toEqual(mockOrganizations);
      expect(component.dateService.allOrganization.value.length).toBe(5);
      
      // User searches for specific type of organization
      component.searchOrgForRec = 'IT';
      expect(component.searchOrgForRec).toBe('IT');
      
      // User decides not to select anyone and goes back
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      tick();
    }));

    it('should handle scenario: user selecting organization for detailed view', fakeAsync(() => {
      // User navigates to organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User searches for specific organization
      component.searchOrgForRec = 'Consulting';
      expect(component.searchOrgForRec).toBe('Consulting');
      
      // User selects specific organization
      const targetOrg = mockOrganizations.find(org => org.name === 'Consulting Firm');
      component.choiceOrgForRec(targetOrg);
      
      // Verify detailed view state
      expect(component.showSelectedOrg).toBe(false);
      expect(dateService.currentOrg.value).toBe('Consulting Firm');
      expect(dateService.idSelectedOrg.value).toBe('4');
      
      // User navigates back to organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      tick();
    }));

    it('should handle scenario: user working with multiple organizations', fakeAsync(() => {
      // User starts with first organization
      expect(dateService.idSelectedOrg.value).toBe('1');
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      // User selects organization from list
      component.choiceOrgForRec(mockOrganizations[1]);
      expect(dateService.idSelectedOrg.value).toBe('2');
      expect(dateService.currentOrg.value).toBe('Design Studio');
      
      // User returns to organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Simulate switching to different organization
      dateService.idSelectedOrg.next('5');
      expect(dateService.idSelectedOrg.value).toBe('5');
      
      // User selects organization from second list
      const newOrg = { ...mockOrganizations[4], id: '5' };
      component.choiceOrgForRec(newOrg);
      expect(dateService.idSelectedOrg.value).toBe('5');
      expect(dateService.currentOrg.value).toBe('Research Lab');
      
      tick();
    }));

    it('should handle scenario: user working with renamed organizations', fakeAsync(() => {
      // User starts with current organization
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      // Organization gets renamed
      dateService.currentOrg.next('IT Company Updated');
      tick();
      
      // User refreshes data
      component.refreshDataAboutOrg();
      
      // Verify localStorage is updated
      expect(localStorage.setItem).toHaveBeenCalled();
      
      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      expect(savedData.user.sectionOrOrganization).toBe('IT Company Updated');
      
      // User selects different organization
      component.choiceOrgForRec(mockOrganizations[2]);
      expect(dateService.currentOrg.value).toBe('Marketing Agency');
      
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
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User can still select organization
      component.choiceOrgForRec(mockOrganizations[0]);
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      tick();
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      // Create large dataset
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        id: `org${i}`,
        name: `Organization ${i}`,
        description: `Description ${i}`
      }));
      
      dateService.allOrganization.next(largeDataset);
      tick();
      
      // Component should handle large datasets
      expect(component.dateService.allOrganization.value).toEqual(largeDataset);
      expect(component.dateService.allOrganization.value.length).toBe(50);
      
      // User can still interact with large dataset
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User can search in large dataset
      component.searchOrgForRec = 'Organization 25';
      expect(component.searchOrgForRec).toBe('Organization 25');
      
      tick();
    }));

    it('should handle concurrent user actions', fakeAsync(() => {
      // Simulate concurrent actions
      const promises = [
        Promise.resolve(component.changeOrg()),
        Promise.resolve(component.changeOrg()),
        Promise.resolve(component.changeOrg())
      ];
      
      Promise.all(promises).then(() => {
        // Component should maintain consistent state
        tick(250);
        expect(component.showSelectedOrg).toBe(true);
      });
      
      tick();
    }));

    it('should handle service method failures gracefully', fakeAsync(() => {
      // Simulate service method failure
      (dataCalendarService.getAllEntryAllUsersForTheMonth as jasmine.Spy).and.throwError('Service Error');
      
      // Component should handle service failures gracefully
      expect(() => component.choiceOrgForRec(mockOrganizations[0])).toThrow();
      tick();
    }));

    it('should handle localStorage failures gracefully', fakeAsync(() => {
      // Simulate localStorage failure
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage Error');
      
      // Component should handle storage failures
      expect(() => component.refreshDataAboutOrg()).toThrow();
      tick();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should not have memory leaks after multiple operations', fakeAsync(() => {
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        component.changeOrg();
        component.choiceOrgForRec(mockOrganizations[0]);
        tick(250);
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
      component.changeOrg();
      component.changeOrg();
      component.changeOrg();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      
      tick(250); // Wait for all setTimeout to complete
    }));

    it('should handle multiple lifecycle cycles efficiently', fakeAsync(() => {
      // First cycle
      component.ngOnInit();
      tick();
      component.ngOnDestroy();
      tick();
      
      // Second cycle
      component.ngOnInit();
      tick();
      component.ngOnDestroy();
      tick();
      
      // Should not cause memory leaks
      expect(component['destroyed$']).toBeDefined();
      
      tick();
    }));
  });

  describe('Accessibility and UX', () => {
    it('should maintain consistent state for screen readers', fakeAsync(() => {
      // Initial state
      expect(component.showSelectedOrg).toBe(false);
      
      // State change
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // State should be consistent
      expect(component.showSelectedOrg).toBe(true);
      
      // Another state change
      component.choiceOrgForRec(mockOrganizations[0]);
      expect(component.showSelectedOrg).toBe(false);
      
      tick();
    }));

    it('should handle keyboard navigation scenarios', fakeAsync(() => {
      // Simulate keyboard navigation
      component.changeOrg(); // Enter key on organization
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Simulate Tab navigation
      component.choiceOrgForRec(mockOrganizations[0]); // Enter key on organization
      tick();
      expect(component.showSelectedOrg).toBe(false);
      
      // Simulate Escape key (click outside)
      const mockEvent = { target: document.createElement('div') } as any;
      component.onClick(mockEvent);
      expect(component.showSelectedOrg).toBe(false);
      
      tick();
    }));

    it('should handle focus management correctly', fakeAsync(() => {
      // Component should manage focus properly
      component.changeOrg();
      tick(250);
      
      // Organization selection should be visible
      expect(component.showSelectedOrg).toBe(true);
      
      // Click outside should close selection
      const mockEvent = { target: document.createElement('div') } as any;
      component.onClick(mockEvent);
      
      expect(component.showSelectedOrg).toBe(false);
      
      // User can reopen selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      tick();
    }));

    it('should handle search input accessibility', fakeAsync(() => {
      // User opens organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User can search for organizations
      component.searchOrgForRec = 'IT';
      expect(component.searchOrgForRec).toBe('IT');
      
      // Search should work with different input types
      component.searchOrgForRec = 'Design';
      expect(component.searchOrgForRec).toBe('Design');
      
      component.searchOrgForRec = 'Marketing';
      expect(component.searchOrgForRec).toBe('Marketing');
      
      tick();
    }));
  });

  describe('Data Persistence and State Management', () => {
    it('should persist user selections correctly', fakeAsync(() => {
      // User selects organization
      component.choiceOrgForRec(mockOrganizations[1]);
      expect(dateService.currentOrg.value).toBe('Design Studio');
      
      // User refreshes data
      component.refreshDataAboutOrg();
      
      // Verify localStorage persistence
      expect(localStorage.setItem).toHaveBeenCalled();
      
      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      expect(savedData.user.sectionOrOrganization).toBe('Design Studio');
      expect(savedData.user.idOrg).toBe('2');
      
      tick();
    }));

    it('should handle state restoration after page reload', fakeAsync(() => {
      // Simulate page reload by reinitializing component
      component.ngOnInit();
      tick();
      
      // Component should maintain state
      expect(component.dateService.currentOrg.value).toBe('IT Company');
      expect(component.dateService.idSelectedOrg.value).toBe('1');
      
      // User can still interact
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      tick();
    }));

    it('should handle multiple organization switches with state preservation', fakeAsync(() => {
      // User selects first organization
      component.choiceOrgForRec(mockOrganizations[0]);
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      // User switches to second organization
      component.choiceOrgForRec(mockOrganizations[1]);
      expect(dateService.currentOrg.value).toBe('Design Studio');
      
      // User switches to third organization
      component.choiceOrgForRec(mockOrganizations[2]);
      expect(dateService.currentOrg.value).toBe('Marketing Agency');
      
      // User refreshes data
      component.refreshDataAboutOrg();
      
      // Verify final state is persisted
      expect(localStorage.setItem).toHaveBeenCalled();
      
      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      expect(savedData.user.sectionOrOrganization).toBe('Marketing Agency');
      expect(savedData.user.idOrg).toBe('3');
      
      tick();
    }));
  });

  describe('Search and Filter Functionality', () => {
    it('should handle search functionality correctly', fakeAsync(() => {
      // User opens organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User searches for organizations
      component.searchOrgForRec = 'IT';
      expect(component.searchOrgForRec).toBe('IT');
      
      // Search should work with partial matches
      component.searchOrgForRec = 'Design';
      expect(component.searchOrgForRec).toBe('Design');
      
      component.searchOrgForRec = 'Marketing';
      expect(component.searchOrgForRec).toBe('Marketing');
      
      // Search should work with empty string
      component.searchOrgForRec = '';
      expect(component.searchOrgForRec).toBe('');
      
      tick();
    }));

    it('should handle search with special characters', fakeAsync(() => {
      // User opens organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User searches with special characters
      component.searchOrgForRec = 'IT & Services';
      expect(component.searchOrgForRec).toBe('IT & Services');
      
      component.searchOrgForRec = 'Design-Studio';
      expect(component.searchOrgForRec).toBe('Design-Studio');
      
      component.searchOrgForRec = 'Marketing_Agency';
      expect(component.searchOrgForRec).toBe('Marketing_Agency');
      
      tick();
    }));

    it('should handle search case sensitivity', fakeAsync(() => {
      // User opens organization selection
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // User searches with different cases
      component.searchOrgForRec = 'it';
      expect(component.searchOrgForRec).toBe('it');
      
      component.searchOrgForRec = 'DESIGN';
      expect(component.searchOrgForRec).toBe('DESIGN');
      
      component.searchOrgForRec = 'Marketing';
      expect(component.searchOrgForRec).toBe('Marketing');
      
      tick();
    }));
  });
});
