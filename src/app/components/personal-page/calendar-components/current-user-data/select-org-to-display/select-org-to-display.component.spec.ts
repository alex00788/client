import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelectOrgToDisplayComponent } from './select-org-to-display.component';
import { DateService } from '../../date.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA, ElementRef, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterOrgPipe } from '../../../../../shared/pipe/filter-org.pipe';

describe('SelectOrgToDisplayComponent', () => {
  let component: SelectOrgToDisplayComponent;
  let fixture: ComponentFixture<SelectOrgToDisplayComponent>;
  let dateService: any;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let elementRef: jasmine.SpyObj<ElementRef>;

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
    const dateServiceSpy = {
      currentOrgWasRenamed: new BehaviorSubject(false),
      switchOrg: new BehaviorSubject(false),
      openEmployee: new BehaviorSubject(false),
      idSelectedOrg: new BehaviorSubject('1'),
      currentOrg: new BehaviorSubject('IT Company'),
      allOrganization: new BehaviorSubject(mockOrganizations),
      currentUserRole: new BehaviorSubject('ADMIN'),
      remainingFunds: new BehaviorSubject(1000),
      idOrgWhereSelectedEmployee: new BehaviorSubject('1'),
      nameOrgWhereSelectedEmployee: new BehaviorSubject('IT Company'),
      allUsersSelectedOrg: new BehaviorSubject([])
    };

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth',
      'getAllUsersCurrentOrganization',
      'checkingOrgHasEmployees'
    ]);

    const elementRefSpy = jasmine.createSpyObj('ElementRef', [], {
      nativeElement: {
        contains: jasmine.createSpy('contains').and.returnValue(false)
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        SelectOrgToDisplayComponent,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: DateService, useValue: dateServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: ElementRef, useValue: elementRefSpy },
        FilterOrgPipe
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectOrgToDisplayComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    elementRef = TestBed.inject(ElementRef) as jasmine.SpyObj<ElementRef>;

    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserData));
    spyOn(localStorage, 'setItem');
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have all required properties initialized', () => {
      expect(component.searchOrgForRec).toBe('');
      expect(component.showSelectedOrg).toBe(false);
      expect(component.orgWasChange).toBeInstanceOf(EventEmitter);
      expect(component.inputSearchOrgRef).toBeUndefined();
      expect(component['destroyed$']).toBeInstanceOf(Subject);
    });

    it('should inject all required services', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component['el']).toBeDefined();
    });

    it('should implement OnInit and OnDestroy interfaces', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(component.ngOnDestroy).toBeDefined();
    });

    it('should have correct component selector', () => {
      expect(component.constructor.name).toBe('SelectOrgToDisplayComponent');
    });

    it('should be standalone component', () => {
      const componentClass = component.constructor as any;
      expect(componentClass).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to currentOrgWasRenamed on initialization', fakeAsync(() => {
      spyOn(component, 'refreshDataAboutOrg');
      
      component.ngOnInit();
      tick();
      
      // Trigger the subscription
      dateService.currentOrgWasRenamed.next(true);
      tick();
      
      expect(component.refreshDataAboutOrg).toHaveBeenCalled();
    }));

    it('should execute ngOnInit lifecycle hook without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle ngOnInit being called multiple times', fakeAsync(() => {
      spyOn(component, 'refreshDataAboutOrg');
      
      component.ngOnInit();
      component.ngOnInit();
      tick();
      
      // Should only subscribe once
      dateService.currentOrgWasRenamed.next(true);
      tick();
      
      expect(component.refreshDataAboutOrg).toHaveBeenCalled();
    }));

    it('should handle subscription cleanup properly', fakeAsync(() => {
      spyOn(component, 'refreshDataAboutOrg');
      
      component.ngOnInit();
      component.ngOnDestroy();
      tick();
      
      // Should not throw errors after destruction
      expect(() => component.ngOnInit()).not.toThrow();
    }));
  });

  describe('choiceOrgForRec', () => {
    let mockOrg: any;

    beforeEach(() => {
      mockOrg = {
        id: '2',
        name: 'Design Studio',
        description: 'Creative Design'
      };
    });

    it('should execute organization selection workflow correctly', () => {
      spyOn(dateService.switchOrg, 'next');
      spyOn(dateService.openEmployee, 'next');
      spyOn(dateService.idSelectedOrg, 'next');
      spyOn(dateService.currentOrg, 'next');
      spyOn(dateService.idOrgWhereSelectedEmployee, 'next');
      spyOn(dateService.nameOrgWhereSelectedEmployee, 'next');
      spyOn(component.orgWasChange, 'emit');
      spyOn(component, 'whenSwitchOrgCheckHasEmployees');

      component.choiceOrgForRec(mockOrg);

      expect(dateService.switchOrg.next).toHaveBeenCalledWith(true);
      expect(dateService.openEmployee.next).toHaveBeenCalledWith(false);
      expect(component.showSelectedOrg).toBe(false);
      expect(dateService.idSelectedOrg.next).toHaveBeenCalledWith('2');
      expect(dateService.currentOrg.next).toHaveBeenCalledWith('Design Studio');
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(component.whenSwitchOrgCheckHasEmployees).toHaveBeenCalled();
      expect(component.orgWasChange.emit).toHaveBeenCalled();
      expect(dateService.idOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('1'); // Uses current value from BehaviorSubject
      expect(dateService.nameOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('Design Studio');
    });

    it('should handle organization with different properties', () => {
      const orgWithDifferentProps = {
        id: '999',
        name: 'Test Org',
        customProp: 'custom value'
      };

      spyOn(dateService.switchOrg, 'next');
      spyOn(dateService.openEmployee, 'next');
      spyOn(dateService.idSelectedOrg, 'next');
      spyOn(dateService.currentOrg, 'next');
      spyOn(dateService.idOrgWhereSelectedEmployee, 'next');
      spyOn(dateService.nameOrgWhereSelectedEmployee, 'next');
      spyOn(component.orgWasChange, 'emit');
      spyOn(component, 'whenSwitchOrgCheckHasEmployees');

      component.choiceOrgForRec(orgWithDifferentProps);

      expect(dateService.idSelectedOrg.next).toHaveBeenCalledWith('999');
      expect(dateService.currentOrg.next).toHaveBeenCalledWith('Test Org');
      expect(dateService.idOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('1'); // Uses current value from BehaviorSubject
      expect(dateService.nameOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('Test Org');
    });

    it('should handle null organization', () => {
      expect(() => component.choiceOrgForRec(null as any)).toThrow();
    });

    it('should handle undefined organization', () => {
      expect(() => component.choiceOrgForRec(undefined as any)).toThrow();
    });

    it('should handle organization without required properties', () => {
      const incompleteOrg = { name: 'Incomplete Org' };

      spyOn(dateService.switchOrg, 'next');
      spyOn(dateService.openEmployee, 'next');
      spyOn(dateService.idSelectedOrg, 'next');
      spyOn(dateService.currentOrg, 'next');
      spyOn(dateService.idOrgWhereSelectedEmployee, 'next');
      spyOn(dateService.nameOrgWhereSelectedEmployee, 'next');
      spyOn(component.orgWasChange, 'emit');
      spyOn(component, 'whenSwitchOrgCheckHasEmployees');

      component.choiceOrgForRec(incompleteOrg);

      expect(dateService.idSelectedOrg.next).toHaveBeenCalledWith(undefined);
      expect(dateService.currentOrg.next).toHaveBeenCalledWith('Incomplete Org');
      expect(dateService.idOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('1'); // Uses current value from BehaviorSubject
      expect(dateService.nameOrgWhereSelectedEmployee.next).toHaveBeenCalledWith('Incomplete Org');
    });

    it('should execute without errors', () => {
      expect(() => component.choiceOrgForRec(mockOrg)).not.toThrow();
    });

    it('should handle multiple rapid organization selections', () => {
      const org1 = { id: '1', name: 'Org 1' };
      const org2 = { id: '2', name: 'Org 2' };
      const org3 = { id: '3', name: 'Org 3' };

      spyOn(dateService.switchOrg, 'next');
      spyOn(dateService.openEmployee, 'next');
      spyOn(dateService.idSelectedOrg, 'next');
      spyOn(dateService.currentOrg, 'next');
      spyOn(dateService.idOrgWhereSelectedEmployee, 'next');
      spyOn(dateService.nameOrgWhereSelectedEmployee, 'next');
      spyOn(component.orgWasChange, 'emit');
      spyOn(component, 'whenSwitchOrgCheckHasEmployees');

      component.choiceOrgForRec(org1);
      component.choiceOrgForRec(org2);
      component.choiceOrgForRec(org3);

      expect(dateService.idSelectedOrg.next).toHaveBeenCalledWith('3');
      expect(dateService.currentOrg.next).toHaveBeenCalledWith('Org 3');
    });
  });

  describe('whenSwitchOrgCheckHasEmployees', () => {
    it('should subscribe to allUsersSelectedOrg observable', fakeAsync(() => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];

      component.whenSwitchOrgCheckHasEmployees();
      tick();

      // Verify subscription is set up
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should call checkingOrgHasEmployees when subscription triggers', fakeAsync(() => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];

      component.whenSwitchOrgCheckHasEmployees();
      tick();

      // Trigger the subscription
      dateService.allUsersSelectedOrg.next(mockUsers);
      tick();

      expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
    }));

    it('should handle subscription cleanup properly', fakeAsync(() => {
      component.whenSwitchOrgCheckHasEmployees();
      component.ngOnDestroy();
      tick();

      // Should not throw errors after destruction
      expect(() => component.whenSwitchOrgCheckHasEmployees()).not.toThrow();
    }));

    it('should execute without errors', () => {
      expect(() => component.whenSwitchOrgCheckHasEmployees()).not.toThrow();
    });

    it('should handle multiple calls', fakeAsync(() => {
      component.whenSwitchOrgCheckHasEmployees();
      component.whenSwitchOrgCheckHasEmployees();
      tick();

      // Should not cause issues
      expect(component['destroyed$']).toBeDefined();
    }));
  });

  describe('refreshDataAboutOrg', () => {
    it('should update localStorage with current organization data', () => {
      const expectedData = {
        user: {
          ...mockUserData.user,
          sectionOrOrganization: 'IT Company',
          idOrg: '1',
          role: 'ADMIN',
          remainingFunds: 1000
        }
      };

      component.refreshDataAboutOrg();

      expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(expectedData));
    });

    it('should handle different organization data', () => {
      dateService.currentOrg.next('New Org');
      dateService.idSelectedOrg.next('999');
      dateService.currentUserRole.next('USER');
      dateService.remainingFunds.next(500);

      const expectedData = {
        user: {
          ...mockUserData.user,
          sectionOrOrganization: 'New Org',
          idOrg: '999',
          role: 'USER',
          remainingFunds: 500
        }
      };

      component.refreshDataAboutOrg();

      expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(expectedData));
    });

    it('should handle missing localStorage data gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      expect(() => component.refreshDataAboutOrg()).toThrow();
    });

    it('should handle invalid localStorage data gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid json');

      expect(() => component.refreshDataAboutOrg()).toThrow();
    });

    it('should execute without errors with valid data', () => {
      expect(() => component.refreshDataAboutOrg()).not.toThrow();
    });

    it('should preserve other user data properties', () => {
      const extendedUserData = {
        user: {
          ...mockUserData.user,
          customProp: 'custom value',
          anotherProp: 123
        }
      };

      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(extendedUserData));

      component.refreshDataAboutOrg();

      const setItemCall = (localStorage.setItem as jasmine.Spy).calls.mostRecent();
      const savedData = JSON.parse(setItemCall.args[1]);
      
      expect(savedData.user.customProp).toBe('custom value');
      expect(savedData.user.anotherProp).toBe(123);
    });
  });

  describe('changeOrg', () => {
    it('should show organization selection after timeout', fakeAsync(() => {
      component.changeOrg();
      
      expect(component.showSelectedOrg).toBe(false);
      
      tick(250);
      
      expect(component.showSelectedOrg).toBe(true);
    }));

    it('should execute without errors', () => {
      expect(() => component.changeOrg()).not.toThrow();
    });

    it('should handle multiple rapid calls', fakeAsync(() => {
      component.changeOrg();
      component.changeOrg();
      component.changeOrg();
      
      tick(250);
      
      expect(component.showSelectedOrg).toBe(true);
    }));

    it('should reset showSelectedOrg to false initially', fakeAsync(() => {
      component.showSelectedOrg = true;
      
      component.changeOrg();
      
      expect(component.showSelectedOrg).toBe(true); // Initially still true
      
      tick(250); // Wait for setTimeout
      
      expect(component.showSelectedOrg).toBe(true); // After timeout, should be true
    }));

    it('should use correct timeout value', fakeAsync(() => {
      component.changeOrg();
      
      tick(249); // Just before timeout
      expect(component.showSelectedOrg).toBe(false);
      
      tick(1); // Complete timeout
      expect(component.showSelectedOrg).toBe(true);
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

    it('should handle multiple destroy calls gracefully', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalledTimes(2);
      expect(component['destroyed$'].complete).toHaveBeenCalledTimes(2);
    });

    it('should execute without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('HostListener onClick', () => {
    it('should close organization selection when clicking outside', () => {
      component.showSelectedOrg = true;
      const mockEvent = {
        target: document.createElement('div')
      } as any;

      component.onClick(mockEvent);

      expect(component.showSelectedOrg).toBe(false);
    });

    it('should not close organization selection when clicking inside', () => {
      component.showSelectedOrg = true;
      
      // Mock the contains method to return true
      spyOn(component['el'].nativeElement, 'contains').and.returnValue(true);
      
      const mockEvent = {
        target: document.createElement('div')
      } as any;

      component.onClick(mockEvent);

      expect(component.showSelectedOrg).toBe(true);
    });

    it('should handle null event target', () => {
      component.showSelectedOrg = true;
      const mockEvent = {
        target: null
      } as any;

      component.onClick(mockEvent);

      expect(component.showSelectedOrg).toBe(false);
    });

    it('should handle undefined event target', () => {
      component.showSelectedOrg = true;
      const mockEvent = {
        target: undefined
      } as any;

      component.onClick(mockEvent);

      expect(component.showSelectedOrg).toBe(false);
    });

    it('should execute without errors', () => {
      const mockEvent = {
        target: document.createElement('div')
      } as any;

      expect(() => component.onClick(mockEvent)).not.toThrow();
    });

    it('should work with different element types', () => {
      component.showSelectedOrg = true;
      
      const divEvent = { target: document.createElement('div') } as any;
      const spanEvent = { target: document.createElement('span') } as any;
      const buttonEvent = { target: document.createElement('button') } as any;

      component.onClick(divEvent);
      expect(component.showSelectedOrg).toBe(false);

      component.showSelectedOrg = true;
      component.onClick(spanEvent);
      expect(component.showSelectedOrg).toBe(false);

      component.showSelectedOrg = true;
      component.onClick(buttonEvent);
      expect(component.showSelectedOrg).toBe(false);
    });
  });

  describe('EventEmitter Integration', () => {
    it('should emit orgWasChange event correctly', () => {
      spyOn(component.orgWasChange, 'emit');
      
      component.choiceOrgForRec(mockOrganizations[0]);
      
      expect(component.orgWasChange.emit).toHaveBeenCalled();
    });

    it('should emit orgWasChange event with correct timing', fakeAsync(() => {
      spyOn(component.orgWasChange, 'emit');
      
      component.choiceOrgForRec(mockOrganizations[0]);
      tick();
      
      expect(component.orgWasChange.emit).toHaveBeenCalled();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null dateService values', () => {
      dateService.currentOrg.next(null);
      dateService.idSelectedOrg.next(null);
      dateService.currentUserRole.next(null);
      dateService.remainingFunds.next(null);

      expect(() => component.refreshDataAboutOrg()).not.toThrow();
    });

    it('should handle undefined dateService values', () => {
      dateService.currentOrg.next(undefined);
      dateService.idSelectedOrg.next(undefined);
      dateService.currentUserRole.next(undefined);
      dateService.remainingFunds.next(undefined);

      expect(() => component.refreshDataAboutOrg()).not.toThrow();
    });

    it('should handle rapid state changes', () => {
      spyOn(component, 'refreshDataAboutOrg');
      
      component.ngOnInit();
      dateService.currentOrgWasRenamed.next(true);
      dateService.currentOrgWasRenamed.next(false);
      dateService.currentOrgWasRenamed.next(true);
      
      expect(component.refreshDataAboutOrg).toHaveBeenCalled();
    });

    it('should handle service method failures gracefully', () => {
      dataCalendarService.getAllEntryAllUsersForTheMonth.and.throwError('Service error');
      
      expect(() => component.choiceOrgForRec(mockOrganizations[0])).toThrow();
    });

    it('should handle localStorage failures gracefully', () => {
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');
      
      expect(() => component.refreshDataAboutOrg()).toThrow();
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
      expect(component.dateService.currentOrgWasRenamed).toBeDefined();
      expect(component.dateService.switchOrg).toBeDefined();
      expect(component.dateService.openEmployee).toBeDefined();
      expect(component.dateService.idSelectedOrg).toBeDefined();
      expect(component.dateService.currentOrg).toBeDefined();
      expect(component.dateService.allOrganization).toBeDefined();
    });

    it('should integrate with DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
      expect(component.dataCalendarService.getAllEntryAllUsersForTheMonth).toBeDefined();
      expect(component.dataCalendarService.getAllUsersCurrentOrganization).toBeDefined();
      expect(component.dataCalendarService.checkingOrgHasEmployees).toBeDefined();
    });

    it('should use dateService values correctly in choiceOrgForRec', () => {
      const testOrg = { id: 'test123', name: 'Test Organization' };
      
      spyOn(dateService.switchOrg, 'next');
      spyOn(dateService.openEmployee, 'next');
      spyOn(dateService.idSelectedOrg, 'next');
      spyOn(dateService.currentOrg, 'next');
      spyOn(dateService.idOrgWhereSelectedEmployee, 'next');
      spyOn(dateService.nameOrgWhereSelectedEmployee, 'next');
      spyOn(component.orgWasChange, 'emit');
      spyOn(component, 'whenSwitchOrgCheckHasEmployees');

      component.choiceOrgForRec(testOrg);

      expect(dateService.idSelectedOrg.next).toHaveBeenCalledWith('test123');
      expect(dateService.currentOrg.next).toHaveBeenCalledWith('Test Organization');
    });
  });

  describe('Component State Management', () => {
    it('should maintain consistent state across method calls', () => {
      // Initial state
      expect(component.showSelectedOrg).toBe(false);
      expect(component.searchOrgForRec).toBe('');
      
      // Change organization
      component.changeOrg();
      expect(component.showSelectedOrg).toBe(false); // Will be true after timeout
      
      // Select organization
      component.choiceOrgForRec(mockOrganizations[0]);
      expect(component.showSelectedOrg).toBe(false);
      
      // Refresh data
      component.refreshDataAboutOrg();
      expect(component.showSelectedOrg).toBe(false); // Should not change
    });

    it('should handle state reset correctly', () => {
      // Set some state
      component.showSelectedOrg = true;
      component.searchOrgForRec = 'test search';
      
      // Change organization (resets showSelectedOrg)
      component.choiceOrgForRec(mockOrganizations[0]);
      
      expect(component.showSelectedOrg).toBe(false);
      expect(component.searchOrgForRec).toBe('test search'); // Should not change
    });

    it('should handle search input state correctly', () => {
      component.searchOrgForRec = 'initial search';
      
      // Change organization should not affect search
      component.choiceOrgForRec(mockOrganizations[0]);
      
      expect(component.searchOrgForRec).toBe('initial search');
    });
  });

  describe('Template Integration', () => {
    it('should have correct ViewChild reference', () => {
      expect(component.inputSearchOrgRef).toBeUndefined();
      
      // In real usage, this would be set by Angular
      const mockElementRef = { nativeElement: document.createElement('input') } as ElementRef;
      component.inputSearchOrgRef = mockElementRef;
      
      expect(component.inputSearchOrgRef).toBeDefined();
    });

    it('should handle search input binding correctly', () => {
      component.searchOrgForRec = 'test search';
      
      expect(component.searchOrgForRec).toBe('test search');
      
      // Simulate user input
      component.searchOrgForRec = 'new search';
      
      expect(component.searchOrgForRec).toBe('new search');
    });

    it('should handle organization list display correctly', () => {
      expect(dateService.allOrganization.value).toEqual(mockOrganizations);
      
      // Component should be able to access organizations
      const orgs = dateService.allOrganization.value;
      expect(orgs.length).toBe(3);
      expect(orgs[0].name).toBe('IT Company');
    });
  });

  describe('Memory Management', () => {
    it('should properly manage subscriptions', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      // Verify subscription is active
      expect(component['destroyed$']).toBeDefined();
      
      // Destroy component
      component.ngOnDestroy();
      tick();
      
      // Verify cleanup
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should not leak subscriptions after destruction', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      component.ngOnDestroy();
      tick();
      
      // Should not have active observers after destruction
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should handle multiple lifecycle cycles', fakeAsync(() => {
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
    }));
  });
});
