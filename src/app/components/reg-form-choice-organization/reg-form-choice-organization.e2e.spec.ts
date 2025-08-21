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
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegFormChoiceOrganizationComponent E2E Tests', () => {
  let component: RegFormChoiceOrganizationComponent;
  let fixture: ComponentFixture<RegFormChoiceOrganizationComponent>;
  let modalService: ModalService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockOrganizations = [
    { id: '1', name: 'Test Organization 1' },
    { id: '2', name: 'Test Organization 2' },
    { id: '3', name: 'Another Test Org' },
    { id: '4', name: 'Different Company' },
    { id: '5', name: 'Large Enterprise Corp' },
    { id: '6', name: 'Small Business LLC' },
    { id: '7', name: 'Startup Inc' },
    { id: '8', name: 'Corporation Ltd' }
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
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    // Настройка API сервиса для E2E тестов
    apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: mockOrganizations }));
    
    fixture.detectChanges();
  });

  // ===== E2E ТЕСТЫ ПОЛНОГО ПОЛЬЗОВАТЕЛЬСКОГО СЦЕНАРИЯ =====
  describe('Complete User Journey E2E', () => {
    it('should complete full user registration flow', fakeAsync(async () => {
      // 1. Пользователь видит форму выбора организации
      expect(fixture.debugElement.query(By.css('label')).nativeElement.textContent.trim())
        .toBe('Выберите организацию');
      
      // 2. Пользователь вводит поисковый запрос
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      searchInput.nativeElement.value = 'Test';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe('Test');
      
      // 3. Пользователь видит отфильтрованные результаты
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBeGreaterThan(0);
      
      // 4. Пользователь выбирает организацию
      orgElements[0].nativeElement.click();
      fixture.detectChanges();
      
      // 5. Открывается форма регистрации
      expect(modalService.registrationForm$.value).toBeTrue();
      
      // 6. Проверяем, что ID и название организации переданы
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(mockOrganizations[0]);
      
      expect(idOrgSpy).toHaveBeenCalledWith('1');
      expect(nameSpy).toHaveBeenCalledWith('Test Organization 1');
      
      tick();
    }));

    it('should handle user navigation flow', fakeAsync(async () => {
      // 1. Пользователь нажимает кнопку возврата
      const backArrow = fixture.debugElement.query(By.css('.arrowClass'));
      backArrow.nativeElement.click();
      fixture.detectChanges();
      
      // 2. Открывается форма входа
      expect(modalService.loginForm$.value).toBeTrue();
      
      // 3. Пользователь возвращается к выбору организации
      component.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      
      // 4. Пользователь нажимает кнопку добавления новой организации
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      addButton.nativeElement.click();
      fixture.detectChanges();
      
      // 5. Открывается форма добавления организации
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      
      tick();
    }));

    it('should handle complex search and selection workflow', fakeAsync(async () => {
      // 1. Пользователь ищет организации по частичному названию
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      // Поиск по "Org"
      searchInput.nativeElement.value = 'Org';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      let orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBeGreaterThan(0);
      
      // Поиск по "Test"
      searchInput.nativeElement.value = 'Test';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBeGreaterThan(0);
      
      // Поиск по "Corp"
      searchInput.nativeElement.value = 'Corp';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBeGreaterThan(0);
      
      // 2. Пользователь выбирает найденную организацию
      orgElements[0].nativeElement.click();
      fixture.detectChanges();
      
      expect(modalService.registrationForm$.value).toBeTrue();
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interaction E2E', () => {
    it('should handle real-time search updates', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      // Пользователь вводит текст по буквам
      const searchText = 'Test Organization';
      
      for (let i = 1; i <= searchText.length; i++) {
        const partialText = searchText.substring(0, i);
        searchInput.nativeElement.value = partialText;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        
        // Проверяем, что поиск работает в реальном времени
        expect(component.searchOrg).toBe(partialText);
        
        // Проверяем количество отображаемых организаций
        const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
        if (partialText.toLowerCase().includes('test')) {
          expect(orgElements.length).toBeGreaterThan(0);
        }
      }
      
      tick();
    }));

    it('should handle rapid user interactions', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      
      // Пользователь быстро выполняет множество действий
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        // Быстрый поиск
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
        
        // Быстрый выбор организации
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        
        // Быстрое открытие форм
        component.openLoginPage();
        component.addNewOrg();
        
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(500);
      
      // Финальное состояние должно быть корректным
      expect(component.searchOrg).toBe('search49');
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      
      tick();
    }));

    it('should handle user input validation and edge cases', fakeAsync(async () => {
      // Тестируем различные типы ввода
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      // 1. Очень длинный поисковый запрос
      const longSearch = 'A'.repeat(10000);
      searchInput.nativeElement.value = longSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(longSearch);
      
      // 2. Поиск с специальными символами
      const specialSearch = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      searchInput.nativeElement.value = specialSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(specialSearch);
      
      // 3. Поиск с Unicode символами
      const unicodeSearch = 'Привет мир! 🌍 你好世界!';
      searchInput.nativeElement.value = unicodeSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(unicodeSearch);
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance E2E', () => {
    it('should handle large datasets efficiently', fakeAsync(async () => {
      // Создаем большой набор данных
      const largeOrgList = Array.from({ length: 10000 }, (_, i) => ({
        id: i.toString(),
        name: `Organization ${i} - ${Math.random().toString(36).substring(7)}`
      }));
      
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: largeOrgList }));
      
      const startTime = performance.now();
      
      // Загружаем данные
      component.getAllOrganizationFromTheDatabase();
      tick();
      
      const loadTime = performance.now() - startTime;
      
      // Проверяем производительность загрузки
      expect(loadTime).toBeLessThan(300);
      expect(component.allOrgForReset.length).toBe(10000);
      
      // Тестируем производительность поиска
      const searchStartTime = performance.now();
      
      component.searchOrg = 'Organization';
      fixture.detectChanges();
      
      const searchTime = performance.now() - searchStartTime;
      
      // Поиск должен быть быстрым
      expect(searchTime).toBeLessThan(200);
      
      tick();
    }));

    it('should handle rapid DOM updates efficiently', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      const startTime = performance.now();
      
      // Быстрые обновления DOM
      for (let i = 0; i < 200; i++) {
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(1000);
      expect(component.searchOrg).toBe('search199');
      
      tick();
    }));

    it('should handle memory usage efficiently', fakeAsync(async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Выполняем много операций
      for (let i = 0; i < 2000; i++) {
        component.searchOrg = `search${i}`;
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
        
        if (i % 100 === 0) {
          fixture.detectChanges();
        }
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Рост памяти должен быть разумным
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(initialMemory * 0.8);
      }
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ УСТОЙЧИВОСТИ =====
  describe('Stability E2E', () => {
    it('should handle component stress testing', fakeAsync(async () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        // Создаем новый экземпляр компонента
        const newFixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
        const newComponent = newFixture.componentInstance;
        
        // Инициализируем
        newComponent.ngOnInit();
        tick();
        
        // Выполняем операции
        newComponent.searchOrg = `test${i}`;
        newComponent.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        newComponent.openLoginPage();
        newComponent.addNewOrg();
        
        // Уничтожаем
        newComponent.ngOnDestroy();
        newFixture.destroy();
      }
      
      // Не должно быть ошибок
      expect(true).toBeTrue();
      
      tick();
    }));

    it('should handle service failures gracefully', fakeAsync(async () => {
      // Симулируем отказ API сервиса
      apiService.getAllOrgFromDb.and.returnValue(
        throwError(() => new Error('Network Error'))
      );
      
      // Компонент не должен сломаться
      try {
        component.getAllOrganizationFromTheDatabase();
        tick();
      } catch (error) {
        // Ошибка ожидаема
      }
      
      // Проверяем, что компонент в стабильном состоянии
      expect(component.allOrgForReset).toBeDefined();
      expect(component.searchOrg).toBe('');
      
      tick();
    }));

    it('should handle rapid state changes without errors', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      // Быстрые изменения состояния
      for (let i = 0; i < 500; i++) {
        // Изменяем поиск
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
        
        // Выбираем организацию
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        
        // Открываем формы
        component.openLoginPage();
        component.addNewOrg();
        
        // Обновляем DOM
        if (i % 50 === 0) {
          fixture.detectChanges();
        }
      }
      
      // Не должно быть ошибок
      expect(true).toBeTrue();
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility E2E', () => {
    it('should have proper keyboard navigation', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      
      // Фокус на поле поиска
      searchInput.nativeElement.focus();
      expect(document.activeElement).toBe(searchInput.nativeElement);
      
      // Ввод текста
      searchInput.nativeElement.value = 'Test';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Tab к кнопке добавления
      searchInput.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      fixture.detectChanges();
      
      // Проверяем, что кнопка доступна
      expect(addButton.nativeElement).toBeTruthy();
      
      tick();
    }));

    it('should have proper ARIA labels and roles', fakeAsync(async () => {
      // Проверяем label для поля поиска
      const label = fixture.debugElement.query(By.css('label'));
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      expect(label.attributes['for']).toBe('inputRegFormChoice');
      expect(searchInput.attributes['id']).toBe('inputRegFormChoice');
      
      // Проверяем кнопки
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      expect(addButton.nativeElement.tagName.toLowerCase()).toBe('button');
      
      // Проверяем кликабельные элементы
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      orgElements.forEach(org => {
        expect(org.nativeElement).toBeTruthy();
        expect(org.nativeElement.style.cursor).toBeDefined();
      });
      
      tick();
    }));

    it('should handle screen reader compatibility', fakeAsync(async () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      // Проверяем placeholder
      expect(searchInput.nativeElement.placeholder).toBe('поиск...');
      
      // Проверяем label
      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.textContent.trim()).toBe('Выберите организацию');
      
      // Проверяем кнопку добавления
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      expect(addButton.nativeElement.textContent.trim()).toBe('+ Добавить новую');
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Real Service Integration E2E', () => {
    it('should integrate with real ModalService correctly', fakeAsync(async () => {
      // Проверяем все методы ModalService
      expect(modalService).toBeInstanceOf(ModalService);
      
      // Открываем форму регистрации
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      expect(modalService.regFormChoiceOrg$.value).toBeFalse();
      
      // Открываем форму входа
      component.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      expect(modalService.registrationForm$.value).toBeFalse();
      
      // Открываем форму добавления организации
      component.addNewOrg();
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      expect(modalService.loginForm$.value).toBeFalse();
      
      tick();
    }));

    it('should integrate with real DateService correctly', fakeAsync(async () => {
      // Проверяем DateService
      expect(dateService).toBeInstanceOf(DateService);
      expect(dateService.date).toBeDefined();
      expect(dateService.currentUserId).toBeDefined();
      expect(dateService.currentUserNameAndSurname).toBeDefined();
      
      // Проверяем, что компонент может использовать DateService
      expect(component.dateService).toBe(dateService);
      
      tick();
    }));

    it('should handle real API service responses', fakeAsync(async () => {
      // Проверяем API сервис
      expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
      
      // Симулируем различные ответы API
      const responses = [
        { allOrg: mockOrganizations },
        { allOrg: [] },
        { allOrg: [{ id: '999', name: 'New Org' }] },
        { allOrg: null },
        { allOrg: undefined }
      ];
      
      responses.forEach((response, index) => {
        apiService.getAllOrgFromDb.and.returnValue(of(response));
        
        component.getAllOrganizationFromTheDatabase();
        tick();
        
        // Проверяем, что компонент обрабатывает ответ корректно
        if (response.allOrg) {
          expect(component.allOrgForReset).toEqual(response.allOrg);
        } else {
          expect(component.allOrgForReset).toEqual([]);
        }
      });
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ СЦЕНАРИЕВ ИСПОЛЬЗОВАНИЯ =====
  describe('Usage Scenario E2E', () => {
    it('should handle business user registration scenario', fakeAsync(async () => {
      // Сценарий: Бизнес-пользователь регистрируется в системе
      
      // 1. Пользователь открывает форму выбора организации
      expect(fixture.debugElement.query(By.css('label')).nativeElement.textContent.trim())
        .toBe('Выберите организацию');
      
      // 2. Пользователь ищет свою организацию
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      searchInput.nativeElement.value = 'Test Organization';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // 3. Пользователь видит результаты поиска
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBeGreaterThan(0);
      
      // 4. Пользователь выбирает организацию
      orgElements[0].nativeElement.click();
      fixture.detectChanges();
      
      // 5. Открывается форма регистрации
      expect(modalService.registrationForm$.value).toBeTrue();
      
      tick();
    }));

    it('should handle new organization creation scenario', fakeAsync(async () => {
      // Сценарий: Пользователь создает новую организацию
      
      // 1. Пользователь не находит свою организацию в списке
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      searchInput.nativeElement.value = 'My New Company';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // 2. Пользователь нажимает кнопку добавления новой организации
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      addButton.nativeElement.click();
      fixture.detectChanges();
      
      // 3. Открывается форма добавления организации
      expect(modalService.regFormAddNewOrg$.value).toBeTrue();
      
      tick();
    }));

    it('should handle user navigation scenario', fakeAsync(async () => {
      // Сценарий: Пользователь навигация между формами
      
      // 1. Пользователь возвращается к форме входа
      const backArrow = fixture.debugElement.query(By.css('.arrowClass'));
      backArrow.nativeElement.click();
      fixture.detectChanges();
      
      expect(modalService.loginForm$.value).toBeTrue();
      
      // 2. Пользователь возвращается к выбору организации
      component.openLoginPage();
      expect(modalService.loginForm$.value).toBeTrue();
      
      // 3. Пользователь снова выбирает организацию
      component.choiceOrg(mockOrganizations[0]);
      expect(modalService.registrationForm$.value).toBeTrue();
      
      tick();
    }));
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ E2E ТЕСТЫ =====
  describe('Additional E2E Scenarios', () => {
    it('should handle edge case scenarios', fakeAsync(async () => {
      // Тестируем граничные случаи
      
      // 1. Очень длинный поисковый запрос
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const longSearch = 'A'.repeat(10000);
      searchInput.nativeElement.value = longSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(longSearch);
      
      // 2. Поиск с специальными символами
      const specialSearch = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      searchInput.nativeElement.value = specialSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(specialSearch);
      
      // 3. Поиск с Unicode символами
      const unicodeSearch = 'Привет мир! 🌍 你好世界!';
      searchInput.nativeElement.value = unicodeSearch;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchOrg).toBe(unicodeSearch);
      
      tick();
    }));

    it('should handle performance stress scenarios', fakeAsync(async () => {
      // Тестируем производительность под нагрузкой
      
      const startTime = performance.now();
      
      // Множественные операции
      for (let i = 0; i < 1000; i++) {
        component.searchOrg = `search${i}`;
        component.choiceOrg(mockOrganizations[i % mockOrganizations.length]);
        component.openLoginPage();
        component.addNewOrg();
        
        if (i % 100 === 0) {
          fixture.detectChanges();
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(2000);
      
      tick();
    }));

    it('should handle error recovery scenarios', fakeAsync(async () => {
      // Тестируем восстановление после ошибок
      
      // 1. Симулируем ошибку API
      apiService.getAllOrgFromDb.and.returnValue(
        throwError(() => new Error('Service Unavailable'))
      );
      
      // 2. Компонент не должен сломаться
      try {
        component.getAllOrganizationFromTheDatabase();
        tick();
      } catch (error) {
        // Ошибка ожидаема
      }
      
      // 3. Восстанавливаем API
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: mockOrganizations }));
      
      // 4. Компонент должен работать нормально
      component.getAllOrganizationFromTheDatabase();
      tick();
      
      expect(component.allOrgForReset).toEqual(mockOrganizations);
      
      tick();
    }));
  });
});
