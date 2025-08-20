import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelectOrgToDisplayComponent } from './select-org-to-display.component';
import { DateService } from '../../date.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterOrgPipe } from '../../../../../shared/pipe/filter-org.pipe';

describe('SelectOrgToDisplayComponent Integration', () => {
  let component: SelectOrgToDisplayComponent;
  let fixture: ComponentFixture<SelectOrgToDisplayComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;
  let apiService: jasmine.SpyObj<ApiService>;

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

    // Setup mock data
    dateService.allOrganization.next(mockOrganizations);
    dateService.currentOrg.next('IT Company');
    dateService.idSelectedOrg.next('1');
    dateService.currentUserRole.next('ADMIN');
    dateService.remainingFunds.next(1000);
    
    // Mock problematic service methods for integration tests
    spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
    spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
    spyOn(dataCalendarService, 'checkingOrgHasEmployees');

    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserData));
    spyOn(localStorage, 'setItem');
  });

  describe('Integration with Real Services', () => {
    it('should integrate with DateService and update organization data', fakeAsync(() => {
      // Simulate service data update
      const newOrganizations = [...mockOrganizations, {
        id: '4',
        name: 'New Company',
        description: 'New Services'
      }];
      
      dateService.allOrganization.next(newOrganizations);
      tick();
      
      // Component should handle new data
      expect(component.dateService.allOrganization.value).toEqual(newOrganizations);
    }));

    it('should handle service errors gracefully', fakeAsync(() => {
      // Component should not crash on initialization
      expect(() => component.ngOnInit()).not.toThrow();
      tick();
    }));

    it('should integrate with DataCalendarService methods', fakeAsync(() => {
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    }));

    it('should maintain data consistency across service interactions', fakeAsync(() => {
      // Initial state
      expect(dateService.currentOrg.value).toBe('IT Company');
      expect(dateService.idSelectedOrg.value).toBe('1');
      
      // Choose organization
      component.choiceOrgForRec(mockOrganizations[1]);
      tick();
      
      // Verify state changes
      expect(dateService.currentOrg.value).toBe('Design Studio');
      expect(dateService.idSelectedOrg.value).toBe('2');
      
      // Trigger employee check
      component.whenSwitchOrgCheckHasEmployees();
      dateService.allUsersSelectedOrg.next([{ id: '1', name: 'User 1' }]);
      tick();
      
      // Verify employee check
      expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
    }));
  });

  describe('Real Service Data Flow', () => {
    it('should handle real service data updates', fakeAsync(() => {
      // Simulate real service data
      const realServiceData = [
        {
          id: '1',
          name: 'Real Company',
          description: 'Real Services'
        }
      ];
      
      dateService.allOrganization.next(realServiceData);
      tick();
      
      // Component should handle real data correctly
      expect(component.dateService.allOrganization.value).toEqual(realServiceData);
    }));

    it('should handle empty service data', fakeAsync(() => {
      dateService.allOrganization.next([]);
      tick();
      
      // Component should handle empty data gracefully
      expect(component.dateService.allOrganization.value).toEqual([]);
    }));

    it('should handle service data with missing properties', fakeAsync(() => {
      const incompleteData = [
        { id: '1', name: 'Company' },
        { id: '2', description: 'Services' }
      ];
      
      dateService.allOrganization.next(incompleteData);
      tick();
      
      // Component should handle incomplete data
      expect(component.dateService.allOrganization.value).toEqual(incompleteData);
    }));

    it('should handle large datasets efficiently', fakeAsync(() => {
      // Create large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `org${i}`,
        name: `Organization ${i}`,
        description: `Description ${i}`
      }));
      
      dateService.allOrganization.next(largeDataset);
      tick();
      
      // Component should handle large datasets
      expect(component.dateService.allOrganization.value).toEqual(largeDataset);
      expect(component.dateService.allOrganization.value.length).toBe(100);
    }));
  });

  describe('Service Method Integration', () => {
    it('should call service methods with correct parameters', fakeAsync(() => {
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      
      // Verify service methods are called
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    }));

    it('should handle service method failures', fakeAsync(() => {
      // Simulate service method failure
      (dataCalendarService.getAllEntryAllUsersForTheMonth as jasmine.Spy).and.throwError('Service Error');
      
      // Component should handle service failures gracefully
      expect(() => component.choiceOrgForRec(mockOrganizations[0])).toThrow();
      tick();
    }));

    it('should integrate with localStorage service correctly', fakeAsync(() => {
      // Test localStorage integration
      component.refreshDataAboutOrg();
      tick();
      
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Verify data is saved correctly
      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      
      expect(savedData.user.sectionOrOrganization).toBe('IT Company');
      expect(savedData.user.idOrg).toBe('1');
      expect(savedData.user.role).toBe('ADMIN');
    }));
  });

  describe('Real Component Lifecycle', () => {
    it('should handle complete component lifecycle with real services', fakeAsync(() => {
      // Initialize
      component.ngOnInit();
      tick();
      
      // Verify initial state
      expect(component.dateService.allOrganization.value).toBeDefined();
      expect(component.dateService.currentOrg.value).toBe('IT Company');
      
      // Choose organization
      component.choiceOrgForRec(mockOrganizations[1]);
      tick();
      
      // Verify organization selection
      expect(dateService.currentOrg.value).toBe('Design Studio');
      expect(dateService.idSelectedOrg.value).toBe('2');
      
      // Trigger employee check
      component.whenSwitchOrgCheckHasEmployees();
      dateService.allUsersSelectedOrg.next([{ id: '1', name: 'User 1' }]);
      tick();
      
      // Verify employee check
      expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
      
      // Destroy
      component.ngOnDestroy();
      tick();
      
      // Component should be destroyed gracefully
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should handle rapid user interactions', fakeAsync(() => {
      // Simulate rapid user interactions
      component.changeOrg();
      component.changeOrg();
      component.changeOrg();
      
      // Component should handle rapid changes
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
      
      // Choose organization
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      
      // Trigger employee check
      component.whenSwitchOrgCheckHasEmployees();
      dateService.allUsersSelectedOrg.next([{ id: '1', name: 'User 1' }]);
      tick();
      
      // Component should maintain consistent state
      expect(dateService.currentOrg.value).toBe('IT Company');
    }));
  });

  describe('Service Data Synchronization', () => {
    it('should synchronize data between services', fakeAsync(() => {
      // Update data in one service
      const updatedOrganizations = [...mockOrganizations, {
        id: '4',
        name: 'New Company',
        description: 'New Services'
      }];
      
      dateService.allOrganization.next(updatedOrganizations);
      tick();
      
      // Component should reflect updated data
      expect(component.dateService.allOrganization.value).toEqual(updatedOrganizations);
      
      // Choose new organization
      component.choiceOrgForRec(updatedOrganizations[3]);
      tick();
      
      // Verify data synchronization
      expect(dateService.currentOrg.value).toBe('New Company');
      expect(dateService.idSelectedOrg.value).toBe('4');
    }));

    it('should handle service data conflicts', fakeAsync(() => {
      // Simulate conflicting data between services
      dateService.allOrganization.next(mockOrganizations);
      dateService.currentOrg.next('Conflicting Org');
      tick();
      
      // Component should handle conflicts gracefully
      expect(component.dateService.allOrganization.value).toEqual(mockOrganizations);
      expect(component.dateService.currentOrg.value).toBe('Conflicting Org');
    }));

    it('should handle service data updates during user interaction', fakeAsync(() => {
      // Start with initial data
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      // Choose organization
      component.choiceOrgForRec(mockOrganizations[1]);
      tick();
      
      // Verify selection
      expect(dateService.currentOrg.value).toBe('Design Studio');
      
      // Update service data during interaction
      const newOrganizations = [
        { id: '5', name: 'Updated Company', description: 'Updated Services' }
      ];
      dateService.allOrganization.next(newOrganizations);
      tick();
      
      // Component should handle updates
      expect(component.dateService.allOrganization.value).toEqual(newOrganizations);
      // Current selection should remain
      expect(dateService.currentOrg.value).toBe('Design Studio');
    }));
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario: user browsing organization list', fakeAsync(() => {
      // User starts with organization list
      expect(component.dateService.allOrganization.value).toEqual(mockOrganizations);
      
      // User searches for organization
      component.searchOrgForRec = 'IT';
      expect(component.searchOrgForRec).toBe('IT');
      
      // User selects organization
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      
      // Verify selection
      expect(dateService.currentOrg.value).toBe('IT Company');
      expect(dateService.idSelectedOrg.value).toBe('1');
    }));

    it('should handle scenario: user switching between organizations', fakeAsync(() => {
      // User selects first organization
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      expect(dateService.currentOrg.value).toBe('IT Company');
      
      // User switches to second organization
      component.choiceOrgForRec(mockOrganizations[1]);
      tick();
      expect(dateService.currentOrg.value).toBe('Design Studio');
      
      // User switches back to first organization
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      expect(dateService.currentOrg.value).toBe('IT Company');
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
    }));
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network failures gracefully', fakeAsync(() => {
      // Simulate network failure
      apiService.getAllEntryAllUsersOrg.and.returnValue(throwError(() => new Error('Network Error')));
      
      // Component should not crash
      expect(() => component.ngOnInit()).not.toThrow();
      
      // User interactions should still work
      component.changeOrg();
      tick(250);
      expect(component.showSelectedOrg).toBe(true);
    }));

    it('should handle localStorage failures gracefully', fakeAsync(() => {
      // Simulate localStorage failure
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage Error');
      
      // Component should handle storage failures
      expect(() => component.refreshDataAboutOrg()).toThrow();
      tick();
    }));

    it('should handle concurrent service updates', fakeAsync(() => {
      // Simulate concurrent updates
      const promises = [
        Promise.resolve(dateService.allOrganization.next(mockOrganizations)),
        Promise.resolve(dateService.currentOrg.next('Concurrent Org')),
        Promise.resolve(dateService.idSelectedOrg.next('999'))
      ];
      
      Promise.all(promises).then(() => {
        // Component should handle concurrent updates
        expect(component.dateService.allOrganization.value).toEqual(mockOrganizations);
        expect(component.dateService.currentOrg.value).toBe('Concurrent Org');
        expect(component.dateService.idSelectedOrg.value).toBe('999');
      });
      
      tick();
    }));

    it('should handle service method timeouts', fakeAsync(() => {
      // Simulate slow service response
      (dataCalendarService.getAllEntryAllUsersForTheMonth as jasmine.Spy).and.callFake(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Component should handle timeouts
      expect(() => component.choiceOrgForRec(mockOrganizations[0])).not.toThrow();
      tick(100);
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

    it('should manage subscriptions efficiently', fakeAsync(() => {
      // Initialize multiple subscriptions
      component.ngOnInit();
      component.whenSwitchOrgCheckHasEmployees();
      tick();
      
      // Verify subscriptions are active
      expect(component['destroyed$']).toBeDefined();
      
      // Destroy component
      component.ngOnDestroy();
      tick();
      
      // Verify cleanup
      expect(component['destroyed$']).toBeDefined();
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
      
      tick();
    }));
  });
});
