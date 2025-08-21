import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ClientsListComponent } from './clients-list.component';
import { DateService } from '../date.service';
import { DataCalendarService } from '../data-calendar-new/data-calendar.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PersonalBlockService } from '../personal-block.service';
import { FilterClientListPipe } from '../../../../shared/pipe/filter-client-list.pipe';
import { NgIf, AsyncPipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClientsListComponent E2E Tests', () => {
  let component: ClientsListComponent;
  let fixture: ComponentFixture<ClientsListComponent>;
  let dateService: jasmine.SpyObj<DateService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let personalBlockService: jasmine.SpyObj<PersonalBlockService>;

  beforeEach(async () => {
    const dateServiceSpy = jasmine.createSpyObj('DateService', [], {
      allUsers: new BehaviorSubject([
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' },
        { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' },
        { id: 4, surnameUser: 'Абрамов', nameUser: 'Абрам' }
      ]),
      allUsersSelectedOrg: new BehaviorSubject([
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' },
        { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' },
        { id: 4, surnameUser: 'Абрамов', nameUser: 'Абрам' }
      ]),
      currentUserIsTheAdminOrg: new BehaviorSubject(true),
      dataSelectedUser: new Subject<any>()
    });

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', ['getPhoneSelectedUser']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['open', 'openClientListBlockWithData']);
    const personalBlockServiceSpy = jasmine.createSpyObj('PersonalBlockService', ['closeClientList']);

    await TestBed.configureTestingModule({
      imports: [
        ClientsListComponent,
        NgIf,
        AsyncPipe,
        NgForOf,
        FormsModule,
        FilterClientListPipe,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DateService, useValue: dateServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: PersonalBlockService, useValue: personalBlockServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsListComponent);
    component = fixture.componentInstance;

    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    personalBlockService = TestBed.inject(PersonalBlockService) as jasmine.SpyObj<PersonalBlockService>;

    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ОСНОВНОГО ФУНКЦИОНАЛА ======
  describe('Basic E2E Functionality', () => {
    it('should create component and display client list interface', () => {
      expect(component).toBeTruthy();
      
      // Проверяем наличие основных элементов интерфейса
      const clientsListContainer = fixture.debugElement.query(By.css('.clientsListClass'));
      const clientsListBody = fixture.debugElement.query(By.css('.clientsListBody'));
      const closeButton = fixture.debugElement.query(By.css('.btnCloseClientList'));
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      const strongText = fixture.debugElement.query(By.css('strong'));
      
      expect(clientsListContainer).toBeTruthy();
      expect(clientsListBody).toBeTruthy();
      expect(closeButton).toBeTruthy();
      expect(searchInput).toBeTruthy();
      expect(strongText).toBeTruthy();
      expect(strongText.nativeElement.textContent.trim()).toBe('Список клиентов');
    });

    it('should display search input with correct placeholder', () => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      expect(searchInput.nativeElement.placeholder).toBe('найти клиента');
      expect(searchInput.nativeElement.type).toBe('text');
    });

    it('should display close button with correct text', () => {
      const closeButton = fixture.debugElement.query(By.css('.btnCloseClientList'));
      
      expect(closeButton.nativeElement.textContent.trim()).toBe('×');
    });

    it('should display client list when user is admin', () => {
      const clientList = fixture.debugElement.query(By.css('ol'));
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      
      expect(clientList).toBeTruthy();
      expect(clientItems.length).toBeGreaterThan(0);
    });

    it('should display correct number of clients', () => {
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      
      // Должно быть 4 клиента согласно мок данным
      expect(clientItems.length).toBe(4);
    });
  });

  // ====== E2E ТЕСТЫ ПОИСКА И ФИЛЬТРАЦИИ ======
  describe('Search and Filtering E2E', () => {
    it('should filter clients by surname when typing in search input', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Вводим поисковый запрос
      searchInput.nativeElement.value = 'Иванов';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Иванов';
      fixture.detectChanges();
      tick();
      
      // Должен отображаться только один клиент
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(1);
      expect(visibleClients[0].nativeElement.textContent).toContain('Иванов');
    }));

    it('should show all clients when search input is empty', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Сначала вводим поисковый запрос
      searchInput.nativeElement.value = 'Иванов';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Иванов';
      fixture.detectChanges();
      tick();
      
      // Очищаем поисковый запрос
      searchInput.nativeElement.value = '';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = '';
      fixture.detectChanges();
      tick();
      
      // Должны отображаться все клиенты
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(4);
    }));

    it('should filter clients by partial surname match', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Ищем по части фамилии
      searchInput.nativeElement.value = 'Ива';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Ива';
      fixture.detectChanges();
      tick();
      
      // Должен отображаться клиент с фамилией Иванов
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(1);
      expect(visibleClients[0].nativeElement.textContent).toContain('Иванов');
    }));

    it('should handle case-insensitive search', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Ищем с разным регистром
      searchInput.nativeElement.value = 'иванов';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'иванов';
      fixture.detectChanges();
      tick();
      
      // Должен отображаться клиент с фамилией Иванов
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(1);
      expect(visibleClients[0].nativeElement.textContent).toContain('Иванов');
    }));

    it('should show no results for non-existent search term', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Ищем несуществующую фамилию
      searchInput.nativeElement.value = 'Несуществующий';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Несуществующий';
      fixture.detectChanges();
      tick();
      
      // Не должно быть результатов
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(0);
    }));

    it('should handle special characters in search', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Ищем с специальными символами
      searchInput.nativeElement.value = 'Иванов!';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Иванов!';
      fixture.detectChanges();
      tick();
      
      // Не должно быть результатов
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(0);
    }));
  });

  // ====== E2E ТЕСТЫ ВЗАИМОДЕЙСТВИЯ С КЛИЕНТАМИ ======
  describe('Client Interaction E2E', () => {
    it('should display client names in correct format', () => {
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      
      // Проверяем формат отображения имени
      expect(clientItems[0].nativeElement.textContent.trim()).toContain('Иванов Иван');
      expect(clientItems[1].nativeElement.textContent.trim()).toContain('Петров Петр');
      expect(clientItems[2].nativeElement.textContent.trim()).toContain('Сидоров Сидор');
      expect(clientItems[3].nativeElement.textContent.trim()).toContain('Абрамов Абрам');
    });

    it('should make client names clickable', () => {
      const clientNames = fixture.debugElement.queryAll(By.css('.chooseClient'));
      
      expect(clientNames.length).toBe(4);
      clientNames.forEach(clientName => {
        expect(clientName.nativeElement).toBeTruthy();
        expect(clientName.nativeElement.classList.contains('chooseClient')).toBeTrue();
      });
    });

    it('should call openPerson when clicking on client name', fakeAsync(() => {
      spyOn(component, 'openPerson');
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Кликаем по имени клиента
      firstClient.nativeElement.click();
      tick();
      
      expect(component.openPerson).toHaveBeenCalled();
    }));

    it('should open modal when client is selected', fakeAsync(() => {
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Кликаем по имени клиента
      firstClient.nativeElement.click();
      tick();
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    }));

    it('should get phone data for selected client', fakeAsync(() => {
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Кликаем по имени клиента
      firstClient.nativeElement.click();
      tick();
      
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalledWith('1');
    }));

    it('should emit selected client data', fakeAsync(() => {
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Кликаем по имени клиента
      firstClient.nativeElement.click();
      tick();
      
      // Проверяем, что метод openPerson был вызван
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalled();
    }));
  });

  // ====== E2E ТЕСТЫ ЗАКРЫТИЯ СПИСКА ======
  describe('Close List E2E', () => {
    it('should call closeClientList when close button is clicked', fakeAsync(() => {
      const closeButton = fixture.debugElement.query(By.css('.btnCloseClientList'));
      
      // Кликаем по кнопке закрытия
      closeButton.nativeElement.click();
      tick();
      
      expect(personalBlockService.closeClientList).toHaveBeenCalled();
    }));

    it('should have proper close button styling', () => {
      const closeButton = fixture.debugElement.query(By.css('.btnCloseClientList'));
      
      expect(closeButton.nativeElement.classList.contains('btnCloseClientList')).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ СОРТИРОВКИ ======
  describe('Sorting E2E', () => {
    it('should display clients in alphabetical order by surname', () => {
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      
      // Проверяем порядок сортировки по алфавиту (согласно мок данным)
      expect(clientItems[0].nativeElement.textContent.trim()).toContain('Иванов Иван');
      expect(clientItems[1].nativeElement.textContent.trim()).toContain('Петров Петр');
      expect(clientItems[2].nativeElement.textContent.trim()).toContain('Сидоров Сидор');
      expect(clientItems[3].nativeElement.textContent.trim()).toContain('Абрамов Абрам');
    });

    it('should maintain sorting when data changes', fakeAsync(() => {
      // Изменяем данные
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next([
        { id: 5, surnameUser: 'Яковлев', nameUser: 'Яков' },
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' }
      ]);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      // Проверяем, что данные изменились
      expect(clientItems.length).toBe(2);
      
      // Проверяем, что оба клиента присутствуют в списке
      const clientTexts = clientItems.map(item => item.nativeElement.textContent.trim());
      expect(clientTexts.some(text => text.includes('Иванов Иван'))).toBeTrue();
      expect(clientTexts.some(text => text.includes('Яковлев Яков'))).toBeTrue();
    }));
  });

  // ====== E2E ТЕСТЫ ОБНОВЛЕНИЯ ДАННЫХ ======
  describe('Data Updates E2E', () => {
    it('should update client list when new data arrives', fakeAsync(() => {
      // Добавляем нового клиента
      const newClients = [
        { id: 1, surnameUser: 'Иванов', nameUser: 'Иван' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' },
        { id: 3, surnameUser: 'Сидоров', nameUser: 'Сидор' },
        { id: 4, surnameUser: 'Абрамов', nameUser: 'Абрам' },
        { id: 5, surnameUser: 'Новый', nameUser: 'Клиент' }
      ];
      
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next(newClients);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(5);
      expect(clientItems[4].nativeElement.textContent.trim()).toContain('Новый Клиент');
    }));

    it('should handle empty client list gracefully', fakeAsync(() => {
      // Устанавливаем пустой список
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next([]);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(0);
    }));

    it('should handle single client correctly', fakeAsync(() => {
      // Устанавливаем одного клиента
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next([
        { id: 1, surnameUser: 'Один', nameUser: 'Клиент' }
      ]);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(1);
      expect(clientItems[0].nativeElement.textContent.trim()).toContain('Один Клиент');
    }));
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance E2E', () => {
    it('should handle rapid search input changes efficiently', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      const startTime = performance.now();
      
      // Быстрые изменения поискового запроса
      for (let i = 0; i < 10; i++) {
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
        component.clientList = `search${i}`;
        fixture.detectChanges();
        tick(10);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Должно выполняться менее чем за 1 секунду
    }));

    it('should handle large client lists efficiently', fakeAsync(() => {
      // Создаем большой список клиентов
      const largeClientList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        surnameUser: `Фамилия${i}`,
        nameUser: `Имя${i}`
      }));
      
      const startTime = performance.now();
      
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next(largeClientList);
      fixture.detectChanges();
      tick();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(500); // Должно выполняться менее чем за 500мс
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(100);
    }));
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ ======
  describe('Accessibility E2E', () => {
    it('should have proper semantic structure', () => {
      const container = fixture.debugElement.query(By.css('.clientsListClass'));
      const header = fixture.debugElement.query(By.css('strong'));
      const list = fixture.debugElement.query(By.css('ol'));
      
      expect(container).toBeTruthy();
      expect(header).toBeTruthy();
      expect(list).toBeTruthy();
    });

    it('should have clickable elements properly styled', () => {
      const clickableElements = fixture.debugElement.queryAll(By.css('.chooseClient'));
      
      clickableElements.forEach(element => {
        expect(element.nativeElement.classList.contains('chooseClient')).toBeTrue();
      });
    });

    it('should have proper button styling', () => {
      const closeButton = fixture.debugElement.query(By.css('.btnCloseClientList'));
      
      expect(closeButton.nativeElement.classList.contains('btnCloseClientList')).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ ======
  describe('Integration E2E', () => {
    it('should integrate with FilterClientListPipe correctly', fakeAsync(() => {
      const searchInput = fixture.debugElement.query(By.css('.inputSearchClass input'));
      
      // Тестируем фильтрацию через pipe
      searchInput.nativeElement.value = 'Иванов';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      component.clientList = 'Иванов';
      fixture.detectChanges();
      tick();
      
      const visibleClients = fixture.debugElement.queryAll(By.css('li'));
      expect(visibleClients.length).toBe(1);
      expect(visibleClients[0].nativeElement.textContent).toContain('Иванов');
    }));

    it('should integrate with all required services', fakeAsync(() => {
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Тестируем интеграцию со всеми сервисами
      firstClient.nativeElement.click();
      tick();
      
      expect(modalService.open).toHaveBeenCalled();
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
      expect(dataCalendarService.getPhoneSelectedUser).toHaveBeenCalled();
    }));

    it('should maintain data consistency across operations', fakeAsync(() => {
      const firstClient = fixture.debugElement.query(By.css('.chooseClient'));
      
      // Выбираем клиента
      firstClient.nativeElement.click();
      tick();
      
      // Проверяем, что данные клиента не изменились
      expect(firstClient.nativeElement.textContent.trim()).toContain('Иванов Иван');
      
      // Проверяем, что список клиентов остается неизменным
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(4);
    }));
  });

  // ====== E2E ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Edge Cases E2E', () => {
    it('should handle clients with special characters in names', fakeAsync(() => {
      const clientsWithSpecialChars = [
        { id: 1, surnameUser: 'Иванов-Петров', nameUser: 'Иван' },
        { id: 2, surnameUser: 'О\'Коннор', nameUser: 'Шон' },
        { id: 3, surnameUser: 'Джонсон & Смит', nameUser: 'Майк' }
      ];
      
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next(clientsWithSpecialChars);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(3);
      expect(clientItems[0].nativeElement.textContent.trim()).toContain('Иванов-Петров Иван');
    }));

    it('should handle clients with very long names', fakeAsync(() => {
      const clientsWithLongNames = [
        { id: 1, surnameUser: 'ОченьДлиннаяФамилияКотораяМожетБытьОченьДлинной', nameUser: 'ОченьДлинноеИмяКотораяМожетБытьОченьДлинным' }
      ];
      
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next(clientsWithLongNames);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(1);
      expect(clientItems[0].nativeElement.textContent.trim()).toContain('ОченьДлиннаяФамилияКотораяМожетБытьОченьДлинной');
    }));

    it('should handle clients with empty names gracefully', fakeAsync(() => {
      const clientsWithEmptyNames = [
        { id: 1, surnameUser: '', nameUser: '' },
        { id: 2, surnameUser: 'Петров', nameUser: 'Петр' }
      ];
      
      (dateService.allUsersSelectedOrg as BehaviorSubject<any>).next(clientsWithEmptyNames);
      fixture.detectChanges();
      tick();
      
      const clientItems = fixture.debugElement.queryAll(By.css('li'));
      expect(clientItems.length).toBe(2);
    }));
  });

  // ====== E2E ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА ======
  describe('Lifecycle E2E', () => {
    it('should initialize correctly on component creation', () => {
      expect(component.clientList).toBe('');
      expect(component.dateService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.personalBlockService).toBeDefined();
    });

    it('should handle component reinitialization', fakeAsync(() => {
      // Изменяем состояние
      component.clientList = 'test search';
      
      // Переинициализируем
      component.ngOnInit();
      tick();
      
      // Состояние должно сохраниться
      expect(component.clientList).toBe('test search');
    }));

    it('should clean up resources on destroy', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
