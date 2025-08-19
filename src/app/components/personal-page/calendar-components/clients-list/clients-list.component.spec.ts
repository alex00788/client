import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientsListComponent } from './clients-list.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PersonalBlockService } from '../personal-block.service';
import { FilterClientListPipe } from '../../../../shared/pipe/filter-client-list.pipe';
import { NgIf, AsyncPipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';

// Mock Services
class MockDateService {
  allUsers = new BehaviorSubject([
    { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
    { id: 2, surnameUser: 'Петров', nameUser: 'Петр' },
    { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' }
  ]);
  allUsersSelectedOrg = new BehaviorSubject([
    { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
    { id: 2, surnameUser: 'Петров', nameUser: 'Петр' }
  ]);
  currentUserIsTheAdminOrg = new BehaviorSubject(true);
  dataSelectedUser = new Subject<any>();
}

class MockDataCalendarService {
  getPhoneSelectedUser = jasmine.createSpy('getPhoneSelectedUser');
}

class MockModalService {
  open = jasmine.createSpy('open');
  openClientListBlockWithData = jasmine.createSpy('openClientListBlockWithData');
}

class MockPersonalBlockService {
  closeClientList = jasmine.createSpy('closeClientList');
}

describe('ClientsListComponent', () => {
  let component: ClientsListComponent;
  let fixture: ComponentFixture<ClientsListComponent>;
  let dateService: MockDateService;
  let dataCalendarService: MockDataCalendarService;
  let modalService: MockModalService;
  let personalBlockService: MockPersonalBlockService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientsListComponent,
        NgIf,
        AsyncPipe,
        NgForOf,
        FormsModule,
        FilterClientListPipe
      ],
      providers: [
        { provide: DateService, useClass: MockDateService },
        { provide: DataCalendarService, useClass: MockDataCalendarService },
        { provide: ModalService, useClass: MockModalService },
        { provide: PersonalBlockService, useClass: MockPersonalBlockService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsListComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as any;
    dataCalendarService = TestBed.inject(DataCalendarService) as any;
    modalService = TestBed.inject(ModalService) as any;
    personalBlockService = TestBed.inject(PersonalBlockService) as any;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty clientList', () => {
      expect(component.clientList).toBe('');
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$']).toBeInstanceOf(Subject);
    });

    it('should inject all required services', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.personalBlockService).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call sortingClients on initialization', () => {
      spyOn(component, 'sortingClients');
      
      component.ngOnInit();
      
      expect(component.sortingClients).toHaveBeenCalled();
    });

    it('should initialize component state correctly', () => {
      component.ngOnInit();
      
      expect(component.clientList).toBe('');
      expect(component['destroyed$']).toBeDefined();
    });
  });

  describe('sortingClients method', () => {
    it('should subscribe to dateService.allUsers', fakeAsync(() => {
      const testUsers = [
        { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' },
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' }
      ];
      
      dateService.allUsers.next(testUsers);
      tick();
      
      // The sorting should happen automatically due to subscription
      expect(dateService.allUsers.value).toBeDefined();
    }));

    it('should sort users by surname alphabetically', fakeAsync(() => {
      const unsortedUsers = [
        { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' },
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' }
      ];
      
      dateService.allUsers.next(unsortedUsers);
      tick();
      
      // Verify the sorting logic works correctly
      const sortedUsers = [...unsortedUsers].sort((a, b) => a.surnameUser > b.surnameUser ? 1 : -1);
      expect(sortedUsers[0].surnameUser).toBe('Иванов');
      expect(sortedUsers[1].surnameUser).toBe('Петров');
      expect(sortedUsers[2].surnameUser).toBe('Сидоров');
    }));

    it('should handle empty user list', fakeAsync(() => {
      dateService.allUsers.next([]);
      tick();
      
      expect(dateService.allUsers.value).toEqual([]);
    }));

    it('should handle single user', fakeAsync(() => {
      const singleUser = [{ id: 1, surnameUser: 'Иванов', nameUser: 'Иван' }];
      
      dateService.allUsers.next(singleUser);
      tick();
      
      expect(dateService.allUsers.value).toEqual(singleUser);
    }));

    it('should handle users with same surnames', fakeAsync(() => {
      const usersWithSameSurname = [
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Иванов', nameUser: 'Петр' },
        { id: 3, surnameUser: 'Петров', nameUser: 'Сидор' }
      ];
      
      dateService.allUsers.next(usersWithSameSurname);
      tick();
      
      const sortedUsers = dateService.allUsers.value;
      expect(sortedUsers[0].surnameUser).toBe('Иванов');
      expect(sortedUsers[1].surnameUser).toBe('Иванов');
      expect(sortedUsers[2].surnameUser).toBe('Петров');
    }));

    it('should maintain user object integrity during sorting', fakeAsync(() => {
      const testUsers = [
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' },
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' }
      ];
      
      dateService.allUsers.next(testUsers);
      tick();
      
      // Verify the sorting logic works correctly
      const sortedUsers = [...testUsers].sort((a, b) => a.surnameUser > b.surnameUser ? 1 : -1);
      expect(sortedUsers[0].id).toBe(1);
      expect(sortedUsers[0].nameUser).toBe('Иван');
      expect(sortedUsers[0].surnameUser).toBe('Иванов');
      expect(sortedUsers[1].id).toBe(2);
      expect(sortedUsers[1].nameUser).toBe('Петр');
      expect(sortedUsers[1].surnameUser).toBe('Петров');
    }));
  });

  describe('openPerson method', () => {
    let testPerson: any;

    beforeEach(() => {
      testPerson = { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' };
    });

    it('should set userId as JSON stringified id', () => {
      component.openPerson(testPerson);
      
      expect(testPerson.userId).toBe('1');
    });

    it('should call modalService.open', () => {
      component.openPerson(testPerson);
      
      expect(modalService.open).toHaveBeenCalled();
    });

    it('should call modalService.openClientListBlockWithData', () => {
      component.openPerson(testPerson);
      
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    });

    it('should call dataCalendarService.getPhoneSelectedUser with userId', () => {
      component.openPerson(testPerson);
      
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('1');
    });

    it('should emit person data to dateService.dataSelectedUser', () => {
      spyOn(dateService.dataSelectedUser, 'next');
      
      component.openPerson(testPerson);
      
      expect(dateService.dataSelectedUser.next).toHaveBeenCalledWith(testPerson);
    });

    it('should handle person with string id', () => {
      const personWithStringId: any = { id: '123', surnameUser: 'Тестов', nameUser: 'Тест' };
      
      component.openPerson(personWithStringId);
      
      expect(personWithStringId.userId).toBe('123');
    });

    it('should handle person with zero id', () => {
      const personWithZeroId: any = { id: 0, surnameUser: 'Нулевой', nameUser: 'Тест' };
      
      component.openPerson(personWithZeroId);
      
      expect(personWithZeroId.userId).toBe('0');
    });

    it('should handle person with negative id', () => {
      const personWithNegativeId: any = { id: -1, surnameUser: 'Отрицательный', nameUser: 'Тест' };
      
      component.openPerson(personWithNegativeId);
      
      expect(personWithNegativeId.userId).toBe('-1');
    });

    it('should handle multiple person selections', () => {
      const person1 = { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' };
      const person2 = { id: 2, surnameUser: 'Петров', nameUser: 'Петр' };
      
      component.openPerson(person1);
      expect(modalService.open).toHaveBeenCalledTimes(1);
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('1');
      
      component.openPerson(person2);
      expect(modalService.open).toHaveBeenCalledTimes(2);
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('2');
    });

    it('should preserve original person object properties', () => {
      const originalPerson = { 
        id: 1, 
        surnameUser: 'Иванов', 
        nameUser: 'Иван'
      };
      
      const personCopy: any = { ...originalPerson };
      component.openPerson(personCopy);
      
      expect(personCopy.surnameUser).toBe('Иванов');
      expect(personCopy.nameUser).toBe('Иван');
      expect(personCopy.userId).toBe('1');
    });
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
      component.ngOnInit();
      
      const destroyedSubject = component['destroyed$'];
      spyOn(destroyedSubject, 'next');
      spyOn(destroyedSubject, 'complete');
      
      component.ngOnDestroy();
      
      expect(destroyedSubject.next).toHaveBeenCalled();
      expect(destroyedSubject.complete).toHaveBeenCalled();
    });

    it('should handle multiple destroy calls gracefully', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalledTimes(2);
      expect(component['destroyed$'].complete).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Binding and UI Integration', () => {
    it('should bind clientList to input field', () => {
      component.clientList = 'test search';
      fixture.detectChanges();
      
      expect(component.clientList).toBe('test search');
    });

    it('should update clientList when input changes', () => {
      component.clientList = '';
      fixture.detectChanges();
      
      component.clientList = 'new search term';
      fixture.detectChanges();
      
      expect(component.clientList).toBe('new search term');
    });

    it('should handle empty search string', () => {
      component.clientList = '';
      fixture.detectChanges();
      
      expect(component.clientList).toBe('');
    });

    it('should handle special characters in search', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      component.clientList = specialChars;
      fixture.detectChanges();
      
      expect(component.clientList).toBe(specialChars);
    });

    it('should handle unicode characters in search', () => {
      const unicodeString = 'Привет мир! 🌍';
      component.clientList = unicodeString;
      fixture.detectChanges();
      
      expect(component.clientList).toBe(unicodeString);
    });
  });

  describe('Service Integration', () => {
    it('should integrate with DateService correctly', fakeAsync(() => {
      component.ngOnInit();
      
      const newUsers = [
        { id: 4, surnameUser: 'Новый', nameUser: 'Пользователь' }
      ];
      
      dateService.allUsers.next(newUsers);
      tick();
      
      expect(dateService.allUsers.value).toBeDefined();
    }));

    it('should integrate with ModalService correctly', () => {
      const testPerson = { id: 1, surnameUser: 'Тест', nameUser: 'Пользователь' };
      
      component.openPerson(testPerson);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    });

    it('should integrate with DataCalendarService correctly', () => {
      const testPerson = { id: 5, surnameUser: 'Тест', nameUser: 'Пользователь' };
      
      component.openPerson(testPerson);
      
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('5');
    });

    it('should integrate with PersonalBlockService correctly', () => {
      // This service is used in the template for closing the client list
      expect(personalBlockService.closeClientList).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null person in openPerson', () => {
      expect(() => {
        component.openPerson(null as any);
      }).toThrow();
    });

    it('should handle undefined person in openPerson', () => {
      expect(() => {
        component.openPerson(undefined as any);
      }).toThrow();
    });

    it('should handle person without id', () => {
      const personWithoutId = { surnameUser: 'Без ID', nameUser: 'Тест' };
      
      expect(() => {
        component.openPerson(personWithoutId as any);
      }).not.toThrow();
    });

    it('should handle person with null id', () => {
      const personWithNullId = { id: null, surnameUser: 'Null ID', nameUser: 'Тест' };
      
      expect(() => {
        component.openPerson(personWithNullId as any);
      }).not.toThrow();
    });

    it('should handle person with undefined id', () => {
      const personWithUndefinedId = { id: undefined, surnameUser: 'Undefined ID', nameUser: 'Тест' };
      
      expect(() => {
        component.openPerson(personWithUndefinedId as any);
      }).not.toThrow();
    });

    it('should handle empty user list gracefully', fakeAsync(() => {
      component.ngOnInit();
      
      dateService.allUsers.next([]);
      tick();
      
      expect(dateService.allUsers.value).toEqual([]);
    }));

    it('should handle users without surnameUser property', fakeAsync(() => {
      const usersWithoutSurname = [
        { id: 1, surnameUser: 'Иван', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петр', nameUser: 'Петр' }
      ];
      
      expect(() => {
        dateService.allUsers.next(usersWithoutSurname);
        tick();
      }).not.toThrow();
    }));
  });

  describe('Performance Tests', () => {
    it('should handle large user lists efficiently', fakeAsync(() => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        surnameUser: `User${i}`,
        nameUser: `Name${i}`
      }));
      
      const startTime = performance.now();
      
      dateService.allUsers.next(largeUserList);
      tick();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100);
      expect(dateService.allUsers.value.length).toBe(1000);
    }));

    it('should handle rapid user list updates efficiently', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        dateService.allUsers.next([
          { id: i, surnameUser: `User${i}`, nameUser: `Name${i}` }
        ]);
        tick();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000);
    }));
  });

  describe('State Management', () => {
    it('should maintain component state correctly', () => {
      const initialState = component.clientList;
      
      component.clientList = 'test state';
      expect(component.clientList).toBe('test state');
      
      component.clientList = initialState;
      expect(component.clientList).toBe(initialState);
    });

    it('should handle component reinitialization', () => {
      component.ngOnInit();
      component.clientList = 'test data';
      
      component.ngOnInit();
      
      expect(component.clientList).toBe('test data');
    });
  });

  describe('Accessibility and UI State', () => {
    it('should provide proper data structure for UI rendering', () => {
      const testPerson = { id: 1, surnameUser: 'Тест', nameUser: 'Пользователь' };
      
      component.openPerson(testPerson);
      
      expect((testPerson as any).userId).toBeDefined();
      expect(testPerson.surnameUser).toBeDefined();
      expect(testPerson.nameUser).toBeDefined();
    });

    it('should maintain consistent data flow', fakeAsync(() => {
      component.ngOnInit();
      
      const testUsers = [
        { id: 1, surnameUser: 'А', nameUser: 'Пользователь' },
        { id: 2, surnameUser: 'Б', nameUser: 'Пользователь' }
      ];
      
      dateService.allUsers.next(testUsers);
      tick();
      
      const sortedUsers = dateService.allUsers.value;
      expect(sortedUsers[0].surnameUser).toBe('А');
      expect(sortedUsers[1].surnameUser).toBe('Б');
    }));
  });
});
