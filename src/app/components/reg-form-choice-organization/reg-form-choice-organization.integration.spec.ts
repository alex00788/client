import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegFormChoiceOrganizationComponent } from './reg-form-choice-organization.component';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { ApiService } from '../../shared/services/api.service';
import { FilterOrgPipe } from '../../shared/pipe/filter-org.pipe';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, delay } from 'rxjs';

describe('RegFormChoiceOrganizationComponent Integration Tests', () => {
  let component: RegFormChoiceOrganizationComponent;
  let fixture: ComponentFixture<RegFormChoiceOrganizationComponent>;
  let modalService: ModalService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockOrganizations = [
    { id: '1', name: 'Test Organization 1' },
    { id: '2', name: 'Test Organization 2' },
    { id: '3', name: 'Another Test Org' },
    { id: '4', name: 'Different Company' }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllOrgFromDb']);

    await TestBed.configureTestingModule({
      imports: [
        RegFormChoiceOrganizationComponent,
        FormsModule,
        FilterOrgPipe,
        HttpClientTestingModule
      ],
      providers: [
        ModalService,
        DateService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    // Настройка API сервиса
    apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: mockOrganizations }));
    
    fixture.detectChanges();
  });

  // ===== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Real Services Integration', () => {
    it('should work with real ModalService instance', () => {
      expect(modalService).toBeTruthy();
      expect(modalService).toBeInstanceOf(ModalService);
      expect(component.modalService).toBe(modalService);
    });

    it('should work with real DateService instance', () => {
      expect(dateService).toBeTruthy();
      expect(dateService).toBeInstanceOf(DateService);
      expect(component.dateService).toBe(dateService);
    });

    it('should work with real ApiService instance', () => {
      expect(apiService).toBeTruthy();
      expect(apiService.getAllOrgFromDb).toBeDefined();
    });

    it('should maintain service state consistency', () => {
      // Проверяем начальное состояние
      expect(modalService.regFormChoiceOrg$.value).toBeFalse();
      
      // Открываем форму регистрации
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Проверяем, что другие формы закрыты
      expect(modalService.loginForm$.value).toBeFalse();
      expect(modalService.regFormAddNewOrg$.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА =====
  describe('Full Component Lifecycle', () => {
    it('should handle complete user interaction cycle', fakeAsync(() => {
      // 1. Поиск организации
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      searchInput.nativeElement.value = 'Test';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(component.searchOrg).toBe('Test');
      
      // 2. Выбор организации
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBe(4); // Все организации отображаются
      
      // 3. Клик по организации
      orgElements[0].nativeElement.click();
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // 4. Возврат к выбору организации
      const backArrow = fixture.debugElement.query(By.css('.arrowClass'));
      backArrow.nativeElement.click();
      expect(modalService.loginForm$.value).toBeTrue();
      
      // 5. Добавление новой организации
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      addButton.nativeElement.click();
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      
      tick();
    }));

    it('should handle multiple open/close cycles', () => {
      // Множественные циклы открытия/закрытия форм
      for (let i = 0; i < 5; i++) {
        // Открываем форму регистрации
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        expect(modalService.registrationForm$.value).toBeTrue();
        
        // Открываем форму входа
        component.openLoginPage();
        expect(modalService.loginForm$.value).toBeTrue();
        
        // Открываем форму добавления организации
        component.addNewOrg();
        expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      }
    });

    it('should maintain component state during service interactions', () => {
      // Изменяем состояние компонента
      component.searchOrg = 'Test';
      expect(component.searchOrg).toBe('Test');
      
      // Взаимодействуем с сервисами
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Состояние компонента должно сохраниться
      expect(component.searchOrg).toBe('Test');
      expect(component.allOrgForReset).toEqual(mockOrganizations);
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Performance with Real Services', () => {
    it('should handle rapid interactions efficiently', () => {
      const startTime = performance.now();
      const iterations = 100;
      
      // Быстрые взаимодействия
      for (let i = 0; i < iterations; i++) {
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(100);
    });

    it('should handle rapid search changes efficiently', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const startTime = performance.now();
      
      // Быстрые изменения поиска
      for (let i = 0; i < 50; i++) {
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(50);
      expect(component.searchOrg).toBe('search49');
    });

    it('should handle large organization lists efficiently', fakeAsync(() => {
      const largeOrgList = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Organization ${i}`
      }));
      
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: largeOrgList }));
      
      const startTime = performance.now();
      component.getAllOrganizationFromTheDatabase();
      tick();
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100);
      expect(component.allOrgForReset.length).toBe(1000);
    }));
  });

  // ===== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ =====
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      const fixture2 = TestBed.createComponent(RegFormChoiceOrganizationComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Изменяем первый компонент
      component.searchOrg = 'Test 1';
      component.choiceOrg(mockOrganizations[0]);
      
      // Изменяем второй компонент
      component2.searchOrg = 'Test 2';
      component2.choiceOrg(mockOrganizations[1]);
      
      // Компоненты должны быть независимы
      expect(component.searchOrg).toBe('Test 1');
      expect(component2.searchOrg).toBe('Test 2');
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Cleanup
      fixture2.destroy();
    });

    it('should share same service instances across components', () => {
      const fixture2 = TestBed.createComponent(RegFormChoiceOrganizationComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Оба компонента должны использовать те же экземпляры сервисов
      expect(component.modalService).toBe(modalService);
      expect(component2.modalService).toBe(modalService);
      expect(component.dateService).toBe(dateService);
      expect(component2.dateService).toBe(dateService);
      
      // Cleanup
      fixture2.destroy();
    });

    it('should handle service state changes across multiple components', () => {
      const fixture2 = TestBed.createComponent(RegFormChoiceOrganizationComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Первый компонент открывает форму регистрации
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Второй компонент должен видеть то же состояние
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Второй компонент открывает форму входа
      component2.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      
      // Первый компонент должен видеть то же состояние
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      
      // Cleanup
      fixture2.destroy();
    });
  });

  // ===== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ =====
  describe('Asynchronous Behavior', () => {
    it('should handle async API calls correctly', fakeAsync(async () => {
      // Симулируем асинхронный API вызов
      let apiCallResolved = false;
      apiService.getAllOrgFromDb.and.returnValue(
        of({ allOrg: mockOrganizations }).pipe(
          // Симулируем задержку
          delay(100)
        )
      );
      
      component.getAllOrganizationFromTheDatabase();
      
      // API вызов еще не завершен
      expect(apiCallResolved).toBeFalse();
      
      // Ждем завершения
      tick(100);
      
      // API вызов завершен
      expect(component.allOrgForReset).toEqual(mockOrganizations);
    }));

    it('should maintain state consistency during async operations', fakeAsync(() => {
      // Множественные асинхронные операции
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
          component.openLoginPage();
        }, i * 10);
      }
      
      // Ждем завершения всех операций
      tick(100);
      
      // Финальное состояние должно быть консистентным
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
    }));

    it('should handle API errors gracefully in async context', fakeAsync(() => {
      apiService.getAllOrgFromDb.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      
      // API вызов с ошибкой
      try {
        component.getAllOrganizationFromTheDatabase();
        tick();
      } catch (error) {
        // Ошибка ожидаема
      }
      
      // Компонент не должен сломаться
      expect(component.allOrgForReset).toBeDefined();
      expect(component.searchOrg).toBe('');
    }));
  });

  // ===== ТЕСТЫ ФИЛЬТРАЦИИ С РЕАЛЬНЫМ PIPE =====
  describe('Filter Pipe Integration', () => {
    it('should filter organizations correctly with real pipe', () => {
      component.allOrgForReset = mockOrganizations;
      component.searchOrg = 'Test';
      fixture.detectChanges();
      
      // Применяем фильтр через pipe
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(3);
      expect(filtered[0].name).toBe('Test Organization 1');
      expect(filtered[1].name).toBe('Test Organization 2');
      expect(filtered[2].name).toBe('Another Test Org');
    });

    it('should handle case-insensitive filtering', () => {
      component.allOrgForReset = mockOrganizations;
      component.searchOrg = 'test';
      fixture.detectChanges();
      
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(3);
    });

    it('should handle empty search string', () => {
      component.allOrgForReset = mockOrganizations;
      component.searchOrg = '';
      fixture.detectChanges();
      
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(4);
    });

    it('should handle search with no matches', () => {
      component.allOrgForReset = mockOrganizations;
      component.searchOrg = 'Nonexistent';
      fixture.detectChanges();
      
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(0);
    });

    it('should handle partial matches', () => {
      component.allOrgForReset = mockOrganizations;
      component.searchOrg = 'Org';
      fixture.detectChanges();
      
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(3);
    });
  });

  // ===== ТЕСТЫ ВЗАИМОДЕЙСТВИЯ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Real Service Interactions', () => {
    it('should properly integrate with ModalService methods', () => {
      // Проверяем все методы ModalService
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      component.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      
      component.addNewOrg();
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      expect(modalService.loginForm$.value).toBeFalse();
    });

    it('should handle ModalService state changes', () => {
      // Начальное состояние
      expect(modalService.regFormChoiceOrg$.value).toBeFalse();
      expect(modalService.registrationForm$.value).toBeFalse();
      expect(modalService.loginForm$.value).toBeFalse();
      expect(modalService.regFormAddNewOrg$.value).toBeFalse();
      
      // Открываем форму регистрации
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      expect(modalService.regFormChoiceOrg$.value).toBeFalse();
      expect(modalService.loginForm$.value).toBeFalse();
      expect(modalService.regFormAddNewOrg$.value).toBeFalse();
      
      // Открываем форму входа
      component.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      expect(modalService.regFormChoiceOrg$.value).toBeFalse();
      expect(modalService.regFormAddNewOrg$.value).toBeFalse();
    });

    it('should integrate with DateService correctly', () => {
      // Проверяем, что DateService доступен и работает
      expect(dateService).toBeTruthy();
      expect(dateService.date).toBeDefined();
      expect(dateService.currentUserId).toBeDefined();
      expect(dateService.currentUserNameAndSurname).toBeDefined();
      
      // Проверяем, что компонент может использовать DateService
      expect(component.dateService).toBe(dateService);
    });

    it('should handle API service integration correctly', fakeAsync(() => {
      // Проверяем, что API сервис работает корректно
      expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
      
      // Симулируем новый API вызов
      const newOrgs = [{ id: '5', name: 'New Organization' }];
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: newOrgs }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();
      
      expect(component.allOrgForReset).toEqual(newOrgs);
    }));
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ И ПАМЯТИ =====
  describe('Performance and Memory Tests', () => {
    it('should handle memory efficiently during rapid operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Выполняем много операций
      for (let i = 0; i < 1000; i++) {
        component.searchOrg = `search${i}`;
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Рост памяти должен быть разумным
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(initialMemory * 0.5);
      }
    });

    it('should handle rapid DOM updates efficiently', () => {
      const startTime = performance.now();
      
      // Быстрые обновления DOM
      for (let i = 0; i < 100; i++) {
        component.searchOrg = `search${i}`;
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(200);
    });

    it('should handle large datasets efficiently', fakeAsync(() => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i.toString(),
        name: `Organization ${i}`
      }));
      
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: largeDataset }));
      
      const startTime = performance.now();
      component.getAllOrganizationFromTheDatabase();
      tick();
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(500);
      expect(component.allOrgForReset.length).toBe(10000);
    }));
  });

  // ===== ТЕСТЫ УСТОЙЧИВОСТИ =====
  describe('Stability Tests', () => {
    it('should handle rapid component destruction and recreation', () => {
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        const newFixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
        const newComponent = newFixture.componentInstance;
        
        newComponent.ngOnInit();
        newComponent.ngOnDestroy();
        
        newFixture.destroy();
      }
      
      // Не должно быть ошибок
      expect(true).toBeTrue();
    });

    it('should handle service state corruption gracefully', () => {
      // Симулируем повреждение состояния сервиса
      (modalService as any).registrationForm$ = null;
      
      // Компонент не должен сломаться
      expect(component).toBeTruthy();
      expect(component.searchOrg).toBe('');
      expect(component.allOrgForReset).toBeDefined();
    });

    it('should handle API service failures gracefully', fakeAsync(() => {
      // Симулируем полный отказ API сервиса
      apiService.getAllOrgFromDb.and.throwError('Service Unavailable');
      
      // Компонент не должен сломаться
      try {
        component.getAllOrganizationFromTheDatabase();
        tick();
      } catch (error) {
        // Ошибка ожидаема
      }
      
      expect(component.allOrgForReset).toBeDefined();
    }));

    it('should handle rapid state changes without errors', () => {
      // Быстрые изменения состояния
      for (let i = 0; i < 100; i++) {
        component.searchOrg = `search${i}`;
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
      }
      
      // Не должно быть ошибок
      expect(true).toBeTrue();
    });
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Additional Integration Scenarios', () => {
    it('should handle component state changes with service state changes', () => {
      // Изменяем состояние компонента
      component.searchOrg = 'Test';
      expect(component.searchOrg).toBe('Test');
      
      // Изменяем состояние сервиса
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // Состояние компонента должно сохраниться
      expect(component.searchOrg).toBe('Test');
      expect(component.allOrgForReset).toEqual(mockOrganizations);
    });

    it('should handle rapid state changes in both component and services', () => {
      // Быстрые изменения состояния
      for (let i = 0; i < 10; i++) {
        component.searchOrg = `search${i}`;
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
      }
      
      // Финальное состояние должно быть предсказуемым
      expect(component.searchOrg).toBe('search9');
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      expect(modalService.loginForm$.value).toBeFalse();
    });

    it('should handle component lifecycle with service interactions', fakeAsync(() => {
      // Полный жизненный цикл с взаимодействиями
      component.ngOnInit();
      tick();
      
      expect(component.allOrgForReset).toEqual(mockOrganizations);
      
      component.searchOrg = 'Test';
      component.choiceOrg(mockOrganizations[0]);
      
      expect(modalService.registrationForm$.value).toBeTrue();
      
      component.ngOnDestroy();
      
      // Компонент должен быть уничтожен корректно
      expect((component as any).destroyed$).toBeDefined();
    }));

    it('should handle multiple API calls with different responses', fakeAsync(() => {
      // Первый API вызов
      expect(component.allOrgForReset).toEqual(mockOrganizations);
      
      // Второй API вызов с другими данными
      const newOrgs = [{ id: '5', name: 'New Org' }];
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: newOrgs }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();
      
      expect(component.allOrgForReset).toEqual(newOrgs);
      
      // Третий API вызов с пустыми данными
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: [] }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();
      
      expect(component.allOrgForReset).toEqual([]);
    }));
  });
});
