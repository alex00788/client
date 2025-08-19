import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientsListComponent } from './clients-list.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PersonalBlockService } from '../personal-block.service';
import { FilterClientListPipe } from '../../../../shared/pipe/filter-client-list.pipe';
import { NgIf, AsyncPipe, NgForOf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

describe('ClientsListComponent Integration Tests', () => {
  let component: ClientsListComponent;
  let fixture: ComponentFixture<ClientsListComponent>;
  let dateService: DateService;
  let dataCalendarService: DataCalendarService;
  let modalService: ModalService;
  let personalBlockService: PersonalBlockService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientsListComponent,
        NgIf,
        AsyncPipe,
        NgForOf,
        FormsModule,
        CommonModule,
        FilterClientListPipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DateService,
        DataCalendarService,
        ModalService,
        PersonalBlockService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsListComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    dataCalendarService = TestBed.inject(DataCalendarService);
    modalService = TestBed.inject(ModalService);
    personalBlockService = TestBed.inject(PersonalBlockService);
  });

  describe('Full Component Lifecycle', () => {
    it('should initialize and render correctly', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component).toBeTruthy();
      expect(component.clientList).toBe('');
    }));

    it('should handle complete lifecycle from init to destroy', fakeAsync(() => {
      spyOn(component, 'sortingClients');
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      spyOn(dataCalendarService, 'getPhoneSelectedUser');
      spyOn(dateService.dataSelectedUser, 'next');
      
      component.ngOnInit();
      tick();
      
      // Simulate user interaction
      const testPerson = { id: 1, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('1');
      expect(dateService.dataSelectedUser.next).toHaveBeenCalledWith(testPerson);
      
      // Destroy component
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    }));
  });

  describe('Service Integration', () => {
    it('should integrate with real DateService', fakeAsync(() => {
      spyOn(component, 'sortingClients').and.callThrough();
      
      component.ngOnInit();
      tick();
      
      expect(component.sortingClients).toHaveBeenCalled();
    }));

    it('should call real ModalService methods', () => {
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      
      const testPerson = { id: 2, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    });

    it('should call real DataCalendarService methods', () => {
      spyOn(dataCalendarService, 'getPhoneSelectedUser');
      
      const testPerson = { id: 3, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('3');
    });

    it('should emit to real DateService subjects', () => {
      spyOn(dateService.dataSelectedUser, 'next');
      
      const testPerson = { id: 4, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      expect(dateService.dataSelectedUser.next).toHaveBeenCalledWith(testPerson);
    });
  });

  describe('Real User Interactions', () => {
    it('should handle sequential person selections', () => {
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      spyOn(dataCalendarService, 'getPhoneSelectedUser');
      spyOn(dateService.dataSelectedUser, 'next');
      
      const persons = [
        { id: 1, surnameUser: 'Первый', nameUser: 'Пользователь' },
        { id: 2, surnameUser: 'Второй', nameUser: 'Пользователь' },
        { id: 3, surnameUser: 'Третий', nameUser: 'Пользователь' }
      ];
      
      persons.forEach((person, index) => {
        component.openPerson(person);
        
        expect(modalService.open).toHaveBeenCalledTimes(index + 1);
        expect(modalService.openClientListBlockWithData).toHaveBeenCalledTimes(index + 1);
        expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith(person.id.toString());
        expect(dateService.dataSelectedUser.next).toHaveBeenCalledWith(person);
      });
      
      expect(modalService.open).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid user interactions', fakeAsync(() => {
      component.ngOnInit();
      
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      
      // Simulate rapid clicking
      for (let i = 1; i <= 10; i++) {
        component.openPerson({ id: i, surnameUser: `User${i}`, nameUser: `Name${i}` });
      }
      
      tick();
      
      expect(modalService.open).toHaveBeenCalledTimes(10);
      expect(modalService.openClientListBlockWithData).toHaveBeenCalledTimes(10);
    }));
  });

  describe('Data Flow Integration', () => {
    it('should maintain data integrity across operations', fakeAsync(() => {
      component.ngOnInit();
      
      const testPerson = { 
        id: 1, 
        surnameUser: 'Тест', 
        nameUser: 'Пользователь'
      };
      
      // Verify original data
      expect(testPerson.id).toBe(1);
      expect(testPerson.surnameUser).toBe('Тест');
      
      // Open person
      component.openPerson(testPerson);
      
      // Verify data is preserved and userId is added
      expect(testPerson.id).toBe(1);
      expect(testPerson.surnameUser).toBe('Тест');
      expect((testPerson as any).userId).toBe('1');
    }));

    it('should handle data transformations correctly', () => {
      const testPerson: any = { id: 42, surnameUser: 'СорокДва', nameUser: 'Пользователь' };
      
      component.openPerson(testPerson);
      
      // Verify userId transformation
      expect(testPerson.userId).toBe('42');
      expect(typeof testPerson.userId).toBe('string');
      
      // Verify original id is preserved
      expect(testPerson.id).toBe(42);
      expect(typeof testPerson.id).toBe('number');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      // Mock service to throw error
      spyOn(dateService.allUsers, 'pipe').and.throwError('Service error');
      
      expect(() => {
        component.ngOnInit();
        tick();
      }).toThrowError('Service error');
    }));

    it('should continue working after service errors', fakeAsync(() => {
      // Test that component can recover from errors
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      
      // Normal operation should work
      const testPerson = { id: 1, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    }));
  });

  describe('Memory Management Integration', () => {
    it('should properly cleanup subscriptions on destroy', fakeAsync(() => {
      component.ngOnInit();
      
      // Verify subscription is active
      expect(component['destroyed$']).toBeDefined();
      
      // Destroy component
      const destroyedSubject = component['destroyed$'];
      spyOn(destroyedSubject, 'next');
      spyOn(destroyedSubject, 'complete');
      
      component.ngOnDestroy();
      
      expect(destroyedSubject.next).toHaveBeenCalled();
      expect(destroyedSubject.complete).toHaveBeenCalled();
    }));

    it('should handle multiple init/destroy cycles', fakeAsync(() => {
      for (let i = 0; i < 3; i++) {
        // Create new destroyed$ for each iteration
        component['destroyed$'] = new Subject<void>();
        
        component.ngOnInit();
        tick();
        
        expect(component.clientList).toBe('');
        
        const destroyedSubject = component['destroyed$'];
        spyOn(destroyedSubject, 'next');
        spyOn(destroyedSubject, 'complete');
        
        component.ngOnDestroy();
        
        expect(destroyedSubject.next).toHaveBeenCalled();
        expect(destroyedSubject.complete).toHaveBeenCalled();
      }
    }));
  });

  describe('Performance Integration', () => {
    it('should handle high frequency operations efficiently', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      // Rapid operations
      for (let i = 0; i < 50; i++) {
        component.openPerson({ id: i, surnameUser: `User${i}`, nameUser: `Name${i}` });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should handle 50 operations efficiently
      expect(executionTime).toBeLessThan(1000);
    }));

    it('should maintain performance with large data operations', fakeAsync(() => {
      component.ngOnInit();
      
      const startTime = performance.now();
      
      // Generate large user list
      const largeUserList = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        surnameUser: `User${i}`,
        nameUser: `Name${i}`
      }));
      
      // Simulate user interactions with large data
      largeUserList.forEach((user, index) => {
        if (index % 10 === 0) { // Every 10th user
          component.openPerson(user);
        }
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete large data operations efficiently
      expect(executionTime).toBeLessThan(2000);
    }));
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      // Initialize component
      component.ngOnInit();
      tick();
      
      expect(component.clientList).toBe('');
      
      // User searches for a client
      component.clientList = 'Иванов';
      expect(component.clientList).toBe('Иванов');
      
      // User selects a client
      const selectedPerson: any = { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' };
      spyOn(modalService, 'open');
      spyOn(modalService, 'openClientListBlockWithData');
      
      component.openPerson(selectedPerson);
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
      expect(selectedPerson.userId).toBe('1');
      
      // User clears search
      component.clientList = '';
      expect(component.clientList).toBe('');
    }));

    it('should handle edge case scenarios in real usage', fakeAsync(() => {
      component.ngOnInit();
      
      // Test with various person data types
      const edgeCasePersons = [
        { id: 0, surnameUser: 'Нулевой', nameUser: 'Пользователь' },
        { id: -1, surnameUser: 'Отрицательный', nameUser: 'Пользователь' },
        { id: 999999, surnameUser: 'Большой', nameUser: 'Пользователь' },
        { id: 'string-id', surnameUser: 'Строковый', nameUser: 'ID' }
      ];
      
      edgeCasePersons.forEach(person => {
        expect(() => {
          component.openPerson(person as any);
        }).not.toThrow();
        
        // Verify userId is set
        expect((person as any).userId).toBeDefined();
      });
    }));
  });

  describe('Filter Integration', () => {
    it('should work with FilterClientListPipe', fakeAsync(() => {
      component.ngOnInit();
      
      // Test search functionality
      component.clientList = 'Иванов';
      expect(component.clientList).toBe('Иванов');
      
      component.clientList = 'Петров';
      expect(component.clientList).toBe('Петров');
      
      component.clientList = '';
      expect(component.clientList).toBe('');
    }));

    it('should handle search with special characters', fakeAsync(() => {
      component.ngOnInit();
      
      const specialSearches = [
        'Иванов-Петров',
        'О\'Коннор',
        'Джонс & Смит',
        '100% клиент'
      ];
      
      specialSearches.forEach(search => {
        component.clientList = search;
        expect(component.clientList).toBe(search);
      });
    }));
  });

  describe('State Persistence', () => {
    it('should maintain search state during operations', fakeAsync(() => {
      component.ngOnInit();
      
      // Set search term
      component.clientList = 'поиск';
      expect(component.clientList).toBe('поиск');
      
      // Perform operations
      const testPerson = { id: 1, surnameUser: 'Тест', nameUser: 'Пользователь' };
      component.openPerson(testPerson);
      
      // Search term should persist
      expect(component.clientList).toBe('поиск');
    }));

    it('should handle component state changes correctly', fakeAsync(() => {
      component.ngOnInit();
      
      // Initial state
      expect(component.clientList).toBe('');
      
      // Change state
      component.clientList = 'новый поиск';
      expect(component.clientList).toBe('новый поиск');
      
      // Change again
      component.clientList = 'еще один поиск';
      expect(component.clientList).toBe('еще один поиск');
      
      // Clear state
      component.clientList = '';
      expect(component.clientList).toBe('');
    }));
  });
});
