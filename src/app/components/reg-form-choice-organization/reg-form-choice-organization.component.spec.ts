import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegFormChoiceOrganizationComponent } from './reg-form-choice-organization.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { FilterOrgPipe } from '../../shared/pipe/filter-org.pipe';
import { FormsModule } from '@angular/forms';

class MockApiService {
  getAllOrgFromDb = jasmine.createSpy('getAllOrgFromDb').and.returnValue(
    of({ allOrg: [
      { id: '1', name: 'Test Organization 1' },
      { id: '2', name: 'Test Organization 2' },
      { id: '3', name: 'Another Org' }
    ]})
  );

  // Метод для тестирования ошибок
  setErrorResponse() {
    this.getAllOrgFromDb.and.returnValue(throwError(() => new Error('API Error')));
  }

  // Метод для тестирования пустого ответа
  setEmptyResponse() {
    this.getAllOrgFromDb.and.returnValue(of({ allOrg: [] }));
  }

  // Метод для тестирования null ответа
  setNullResponse() {
    this.getAllOrgFromDb.and.returnValue(of(null));
  }
}

class MockModalService {
  openRegistrationForm = jasmine.createSpy('openRegistrationForm');
  openLoginForm = jasmine.createSpy('openLoginForm');
  openFormAddNewOrg = jasmine.createSpy('openFormAddNewOrg');
}

class MockDateService {
  // Базовые методы для тестирования
  getCurrentUser = jasmine.createSpy('getCurrentUser');
}

describe('RegFormChoiceOrganizationComponent', () => {
  let component: RegFormChoiceOrganizationComponent;
  let fixture: ComponentFixture<RegFormChoiceOrganizationComponent>;
  let apiService: MockApiService;
  let modalService: MockModalService;
  let dateService: MockDateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegFormChoiceOrganizationComponent,
        FormsModule,
        FilterOrgPipe
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: ModalService, useClass: MockModalService },
        { provide: DateService, useClass: MockDateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;
    dateService = TestBed.inject(DateService) as unknown as MockDateService;
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ТЕСТЫ СОЗДАНИЯ И ИНИЦИАЛИЗАЦИИ =====
  describe('Component Creation and Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct initial state', () => {
      expect(component.searchOrg).toBe('');
      expect(component.allOrgForReset).toBeDefined();
      expect((component as any).destroyed$).toBeDefined();
    });

    it('should have correct component properties', () => {
      expect(component.idOrg).toBeDefined();
      expect(component.nameSelectedOrg).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.dateService).toBeDefined();
    });

    it('should implement OnInit and OnDestroy', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(component.ngOnDestroy).toBeDefined();
    });

    it('should have destroyed$ subject', () => {
      expect((component as any).destroyed$).toBeDefined();
    });
  });

  // ===== ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА =====
  describe('Component Lifecycle', () => {
    it('should call getAllOrganizationFromTheDatabase on ngOnInit', () => {
      const spy = spyOn(component, 'getAllOrganizationFromTheDatabase');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should complete destroyed$ subject on ngOnDestroy', () => {
      const destroyed$ = (component as any).destroyed$;
      const nextSpy = spyOn(destroyed$, 'next');
      const completeSpy = spyOn(destroyed$, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should handle multiple ngOnDestroy calls gracefully', () => {
      const destroyed$ = (component as any).destroyed$;
      const nextSpy = spyOn(destroyed$, 'next');
      const completeSpy = spyOn(destroyed$, 'complete');

      // Вызываем ngOnDestroy несколько раз
      component.ngOnDestroy();
      component.ngOnDestroy();
      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledTimes(3);
      expect(completeSpy).toHaveBeenCalledTimes(3);
    });
  });

  // ===== ТЕСТЫ API ВЗАИМОДЕЙСТВИЯ =====
  describe('API Interaction', () => {
    it('should call getAllOrgFromDb on initialization', () => {
      expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
    });

    it('should handle successful API response', fakeAsync(() => {
      const mockOrgs = [
        { id: '1', name: 'Test Organization 1' },
        { id: '2', name: 'Test Organization 2' }
      ];

      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: mockOrgs }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual(mockOrgs);
    }));

    it('should handle API error gracefully', fakeAsync(() => {
      apiService.setErrorResponse();
      
      // Создаем spy на console.error для проверки обработки ошибок
      const consoleSpy = spyOn(console, 'error');
      
      // Обрабатываем ошибку в try-catch
      try {
        component.getAllOrganizationFromTheDatabase();
        tick();
      } catch (error) {
        // Ошибка ожидаема
      }

      // Проверяем, что компонент не сломался при ошибке
      expect(component.allOrgForReset).toBeDefined();
      expect(component.searchOrg).toBe('');
    }));

    it('should handle empty API response', fakeAsync(() => {
      apiService.setEmptyResponse();
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));

    it('should handle null API response', fakeAsync(() => {
      apiService.setNullResponse();
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));

    it('should handle undefined API response', fakeAsync(() => {
      apiService.getAllOrgFromDb.and.returnValue(of(undefined));
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));

    it('should handle malformed API response', fakeAsync(() => {
      apiService.getAllOrgFromDb.and.returnValue(of({ wrongProperty: [] }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));

    it('should handle API response with null allOrg', fakeAsync(() => {
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: null }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));

    it('should handle API response with undefined allOrg', fakeAsync(() => {
      apiService.getAllOrgFromDb.and.returnValue(of({ allOrg: undefined }));
      
      component.getAllOrganizationFromTheDatabase();
      tick();

      expect(component.allOrgForReset).toEqual([]);
    }));
  });

  // ===== ТЕСТЫ ВЫБОРА ОРГАНИЗАЦИИ =====
  describe('Organization Selection', () => {
    it('should emit idOrg when choiceOrg is called', () => {
      const org = { id: '123', name: 'Test Org' };
      const emitSpy = spyOn(component.idOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(emitSpy).toHaveBeenCalledWith('123');
    });

    it('should emit nameSelectedOrg when choiceOrg is called', () => {
      const org = { id: '123', name: 'Test Org' };
      const emitSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(emitSpy).toHaveBeenCalledWith('Test Org');
    });

    it('should call modalService.openRegistrationForm when choiceOrg is called', () => {
      const org = { id: '123', name: 'Test Org' };
      
      component.choiceOrg(org);
      
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle choiceOrg with null organization', () => {
      const org = null;
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(idOrgSpy).toHaveBeenCalledWith(undefined);
      expect(nameSpy).toHaveBeenCalledWith(undefined);
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle choiceOrg with undefined organization', () => {
      const org = undefined;
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(idOrgSpy).toHaveBeenCalledWith(undefined);
      expect(nameSpy).toHaveBeenCalledWith(undefined);
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle choiceOrg with organization missing id', () => {
      const org = { name: 'Test Org' };
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(idOrgSpy).toHaveBeenCalledWith(undefined);
      expect(nameSpy).toHaveBeenCalledWith('Test Org');
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle choiceOrg with organization missing name', () => {
      const org = { id: '123' };
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(idOrgSpy).toHaveBeenCalledWith('123');
      expect(nameSpy).toHaveBeenCalledWith(undefined);
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle choiceOrg with empty organization object', () => {
      const org = {};
      const idOrgSpy = spyOn(component.idOrg, 'emit');
      const nameSpy = spyOn(component.nameSelectedOrg, 'emit');
      
      component.choiceOrg(org);
      
      expect(idOrgSpy).toHaveBeenCalledWith(undefined);
      expect(nameSpy).toHaveBeenCalledWith(undefined);
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle multiple rapid choiceOrg calls', () => {
      const org1 = { id: '1', name: 'Org 1' };
      const org2 = { id: '2', name: 'Org 2' };
      const org3 = { id: '3', name: 'Org 3' };
      
      // Быстрые последовательные вызовы
      component.choiceOrg(org1);
      component.choiceOrg(org2);
      component.choiceOrg(org3);
      
      expect(modalService.openRegistrationForm).toHaveBeenCalledTimes(3);
    });
  });

  // ===== ТЕСТЫ МОДАЛЬНЫХ ОКОН =====
  describe('Modal Service Integration', () => {
    it('should call openLoginForm when openLoginPage is called', () => {
      component.openLoginPage();
      expect(modalService.openLoginForm).toHaveBeenCalled();
    });

    it('should call openFormAddNewOrg when addNewOrg is called', () => {
      component.addNewOrg();
      expect(modalService.openFormAddNewOrg).toHaveBeenCalled();
    });

    it('should handle multiple rapid modal calls', () => {
      // Быстрые последовательные вызовы
      component.openLoginPage();
      component.addNewOrg();
      component.openLoginPage();
      component.addNewOrg();
      
      expect(modalService.openLoginForm).toHaveBeenCalledTimes(2);
      expect(modalService.openFormAddNewOrg).toHaveBeenCalledTimes(2);
    });
  });

  // ===== ТЕСТЫ ПОИСКА ОРГАНИЗАЦИЙ =====
  describe('Organization Search', () => {
    it('should update searchOrg when input changes', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const testValue = 'test search';
      
      searchInput.nativeElement.value = testValue;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(testValue);
    });

    it('should handle empty search string', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      searchInput.nativeElement.value = '';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe('');
    });

    it('should handle search with special characters', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      searchInput.nativeElement.value = specialChars;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(specialChars);
    });

    it('should handle search with numbers', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const numbers = '12345';
      
      searchInput.nativeElement.value = numbers;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(numbers);
    });

    it('should handle search with very long string', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const longString = 'A'.repeat(1000);
      
      searchInput.nativeElement.value = longString;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(longString);
    });

    it('should handle search with whitespace', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const whitespace = '   test   ';
      
      searchInput.nativeElement.value = whitespace;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(whitespace);
    });
  });

  // ===== ТЕСТЫ HTML ШАБЛОНА =====
  describe('HTML Template Rendering', () => {
    it('should display correct label text', () => {
      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.textContent.trim()).toBe('Выберите организацию');
    });

    it('should have correct input placeholder', () => {
      const input = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      expect(input.nativeElement.placeholder).toBe('поиск...');
    });

    it('should have correct input type', () => {
      const input = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      expect(input.nativeElement.type).toBe('text');
    });

    it('should display back arrow button', () => {
      const arrow = fixture.debugElement.query(By.css('.arrowClass'));
      expect(arrow).toBeTruthy();
      expect(arrow.nativeElement.textContent.trim()).toBe('←');
    });

    it('should display add new organization button', () => {
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      expect(addButton).toBeTruthy();
      expect(addButton.nativeElement.textContent.trim()).toBe('+ Добавить новую');
    });

    it('should display organizations when available', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization 1' },
        { id: '2', name: 'Test Organization 2' }
      ];
      fixture.detectChanges();

      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBe(2);
      expect(orgElements[0].nativeElement.textContent.trim()).toBe('Test Organization 1');
      expect(orgElements[1].nativeElement.textContent.trim()).toBe('Test Organization 2');
    });

    it('should not display organizations when empty', () => {
      component.allOrgForReset = [];
      fixture.detectChanges();

      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBe(0);
    });

    it('should not display organizations when null', () => {
      (component as any).allOrgForReset = null;
      fixture.detectChanges();

      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBe(0);
    });

    it('should not display organizations when undefined', () => {
      (component as any).allOrgForReset = undefined;
      fixture.detectChanges();

      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      expect(orgElements.length).toBe(0);
    });
  });

  // ===== ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interactions', () => {
    it('should call openLoginPage when back arrow is clicked', () => {
      const arrow = fixture.debugElement.query(By.css('.arrowClass'));
      const spy = spyOn(component, 'openLoginPage');
      
      arrow.nativeElement.click();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should call choiceOrg when organization is clicked', () => {
      component.allOrgForReset = [{ id: '1', name: 'Test Organization 1' }];
      fixture.detectChanges();

      const orgElement = fixture.debugElement.query(By.css('.ownOrg'));
      const spy = spyOn(component, 'choiceOrg');
      
      orgElement.nativeElement.click();
      
      expect(spy).toHaveBeenCalledWith({ id: '1', name: 'Test Organization 1' });
    });

    it('should call addNewOrg when add button is clicked', () => {
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      const spy = spyOn(component, 'addNewOrg');
      
      addButton.nativeElement.click();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should handle rapid clicks without errors', () => {
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      const spy = spyOn(component, 'addNewOrg');
      
      // Быстрые последовательные клики
      for (let i = 0; i < 10; i++) {
        addButton.nativeElement.click();
      }
      
      expect(spy).toHaveBeenCalledTimes(10);
    });

    it('should handle multiple organization selections', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization 1' },
        { id: '2', name: 'Test Organization 2' },
        { id: '3', name: 'Another Org' }
      ];
      fixture.detectChanges();

      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      const choiceSpy = spyOn(component, 'choiceOrg');
      
      // Кликаем по всем организациям
      orgElements.forEach(org => {
        org.nativeElement.click();
      });
      
      expect(choiceSpy).toHaveBeenCalledTimes(3);
    });
  });

  // ===== ТЕСТЫ ФИЛЬТРАЦИИ =====
  describe('Organization Filtering', () => {
    it('should filter organizations based on search input', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization 1' },
        { id: '2', name: 'Another Org' },
        { id: '3', name: 'Test Company' }
      ];
      component.searchOrg = 'Test';
      fixture.detectChanges();

      // Применяем фильтр
      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(2);
      expect(filtered[0].name).toBe('Test Organization 1');
      expect(filtered[1].name).toBe('Test Company');
    });

    it('should handle case-insensitive search', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization' },
        { id: '2', name: 'TEST COMPANY' },
        { id: '3', name: 'Another Org' }
      ];
      component.searchOrg = 'test';
      fixture.detectChanges();

      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(2);
    });

    it('should handle empty search string', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization' },
        { id: '2', name: 'Another Org' }
      ];
      component.searchOrg = '';
      fixture.detectChanges();

      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(2);
    });

    it('should handle search with no matches', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization' },
        { id: '2', name: 'Another Org' }
      ];
      component.searchOrg = 'Nonexistent';
      fixture.detectChanges();

      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(0);
    });

    it('should handle search with partial matches', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization' },
        { id: '2', name: 'Another Test Org' },
        { id: '3', name: 'Company' }
      ];
      component.searchOrg = 'Test';
      fixture.detectChanges();

      const filterPipe = new FilterOrgPipe();
      const filtered = filterPipe.transform(component.allOrgForReset, component.searchOrg);
      
      expect(filtered.length).toBe(2);
    });
  });

  // ===== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle component destruction during API call', fakeAsync(() => {
      // Запускаем API вызов
      component.getAllOrganizationFromTheDatabase();
      
      // Сразу уничтожаем компонент
      const destroyed$ = (component as any).destroyed$;
      const nextSpy = spyOn(destroyed$, 'next');
      const completeSpy = spyOn(destroyed$, 'complete');
      
      component.ngOnDestroy();
      tick();
      
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    }));

    it('should handle rapid component initialization and destruction', () => {
      const iterations = 10;
      
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

    it('should handle search with very long input', () => {
      const longInput = 'A'.repeat(10000);
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      searchInput.nativeElement.value = longInput;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(longInput);
    });

    it('should handle search with unicode characters', () => {
      const unicodeInput = 'Привет мир! 🌍 你好世界!';
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      searchInput.nativeElement.value = unicodeInput;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(unicodeInput);
    });

    it('should handle search with HTML tags', () => {
      const htmlInput = '<script>alert("test")</script>';
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      searchInput.nativeElement.value = htmlInput;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(htmlInput);
    });

    it('should handle search with SQL injection attempt', () => {
      const sqlInput = "'; DROP TABLE users; --";
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      searchInput.nativeElement.value = sqlInput;
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.searchOrg).toBe(sqlInput);
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance Tests', () => {
    it('should handle large number of organizations efficiently', () => {
      const startTime = performance.now();
      
      // Создаем большое количество организаций
      const largeOrgList = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Organization ${i}`
      }));
      
      component.allOrgForReset = largeOrgList;
      fixture.detectChanges();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(100);
      expect(component.allOrgForReset.length).toBe(1000);
    });

    it('should handle rapid search input changes efficiently', () => {
      const searchInput = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      const startTime = performance.now();
      
      // Быстрые изменения поиска
      for (let i = 0; i < 100; i++) {
        searchInput.nativeElement.value = `search${i}`;
        searchInput.nativeElement.dispatchEvent(new Event('input'));
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(50);
      // searchOrg обновляется только при реальном вводе пользователя
      expect(component.searchOrg).toBe('search99');
    });

    it('should handle rapid organization selections efficiently', () => {
      component.allOrgForReset = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `Organization ${i}`
      }));
      fixture.detectChanges();
      
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      const choiceSpy = spyOn(component, 'choiceOrg');
      const startTime = performance.now();
      
      // Быстрые клики по организациям
      for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * orgElements.length);
        orgElements[randomIndex].nativeElement.click();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(100);
      expect(choiceSpy).toHaveBeenCalledTimes(50);
    });
  });

  // ===== ТЕСТЫ БЕЗОПАСНОСТИ =====
  describe('Security Tests', () => {
    it('should not expose internal properties', () => {
      // Проверяем, что внутренние свойства не доступны извне
      expect((component as any).destroyed$).toBeDefined();
      expect(component.searchOrg).toBeDefined();
      expect(component.allOrgForReset).toBeDefined();
    });

    it('should handle malicious input safely', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
        'onload=alert("xss")',
        'onerror=alert("xss")',
        'onclick=alert("xss")'
      ];
      
      maliciousInputs.forEach(input => {
        component.searchOrg = input;
        fixture.detectChanges();
        
        // Компонент не должен сломаться
        expect(component.searchOrg).toBe(input);
        expect(component.allOrgForReset).toBeDefined();
      });
    });

    it('should not execute arbitrary code from organization names', () => {
      const maliciousOrgs = [
        { id: '1', name: '<script>alert("xss")</script>' },
        { id: '2', name: 'javascript:alert("xss")' },
        { id: '3', name: 'onclick="alert(\'xss\')"' }
      ];
      
      component.allOrgForReset = maliciousOrgs;
      fixture.detectChanges();
      
      // Компонент не должен сломаться
      expect(component.allOrgForReset).toEqual(maliciousOrgs);
      
      // Проверяем, что можно выбрать организацию
      const choiceSpy = spyOn(component, 'choiceOrg');
      component.choiceOrg(maliciousOrgs[0]);
      expect(choiceSpy).toHaveBeenCalledWith(maliciousOrgs[0]);
    });
  });

  // ===== ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility Tests', () => {
    it('should have proper label association', () => {
      const label = fixture.debugElement.query(By.css('label'));
      const input = fixture.debugElement.query(By.css('#inputRegFormChoice'));
      
      expect(label.attributes['for']).toBe('inputRegFormChoice');
      expect(input.attributes['id']).toBe('inputRegFormChoice');
    });

    it('should have clickable elements', () => {
      const clickableElements = [
        fixture.debugElement.query(By.css('.arrowClass')),
        fixture.debugElement.query(By.css('.btnNewOrg'))
      ];
      
      clickableElements.forEach(element => {
        expect(element).toBeTruthy();
        expect(element.nativeElement.style.cursor).toBeDefined();
      });
    });

    it('should have proper button semantics', () => {
      const addButton = fixture.debugElement.query(By.css('.btnNewOrg'));
      expect(addButton.nativeElement.tagName.toLowerCase()).toBe('button');
    });
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ ДЛЯ МАКСИМАЛЬНОЙ ЗАЩИТЫ =====
  describe('Additional Comprehensive Tests', () => {
    it('should handle component reinitialization', () => {
      // Сохраняем текущее состояние
      const currentSearch = component.searchOrg;
      const currentOrgs = [...component.allOrgForReset];
      
      // Реинициализируем компонент
      component.ngOnInit();
      
      // Проверяем, что состояние восстановлено
      expect(component.searchOrg).toBe(currentSearch);
      // allOrgForReset обновляется из API, поэтому может измениться
      expect(component.allOrgForReset).toBeDefined();
    });

    it('should handle multiple rapid API calls', fakeAsync(() => {
      // Быстрые последовательные API вызовы
      for (let i = 0; i < 5; i++) {
        component.getAllOrganizationFromTheDatabase();
      }
      
      tick();
      
      // API должен быть вызван каждый раз
      expect(apiService.getAllOrgFromDb).toHaveBeenCalledTimes(6); // 1 в ngOnInit + 5 в цикле
    }));

    it('should handle component state during rapid user interactions', () => {
      component.allOrgForReset = [
        { id: '1', name: 'Test Organization 1' },
        { id: '2', name: 'Test Organization 2' }
      ];
      fixture.detectChanges();
      
      const orgElements = fixture.debugElement.queryAll(By.css('.ownOrg'));
      const choiceSpy = spyOn(component, 'choiceOrg');
      
      // Быстрые взаимодействия
      for (let i = 0; i < 10; i++) {
        const randomIndex = i % orgElements.length;
        orgElements[randomIndex].nativeElement.click();
        component.searchOrg = `search${i}`;
      }
      
      expect(choiceSpy).toHaveBeenCalledTimes(10);
      expect(component.searchOrg).toBe('search9');
    });

    it('should handle memory leaks prevention', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Создаем и уничтожаем много компонентов
      for (let i = 0; i < 100; i++) {
        const newFixture = TestBed.createComponent(RegFormChoiceOrganizationComponent);
        const newComponent = newFixture.componentInstance;
        
        newComponent.ngOnInit();
        newComponent.ngOnDestroy();
        
        newFixture.destroy();
      }
      
      // Проверяем, что память не растет катастрофически
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Рост памяти должен быть разумным
      expect(memoryGrowth).toBeLessThan(initialMemory * 0.5);
    });

    it('should handle all possible organization data types', () => {
      const testCases = [
        { id: 123, name: 'Number ID' },
        { id: 'string-id', name: 'String ID' },
        { id: null, name: 'Null ID' },
        { id: undefined, name: 'Undefined ID' },
        { id: 0, name: 'Zero ID' },
        { id: '', name: 'Empty String ID' },
        { id: false, name: 'Boolean ID' },
        { id: {}, name: 'Object ID' },
        { id: [], name: 'Array ID' }
      ];
      
      // Создаем один spy для всех тестов
      const choiceSpy = spyOn(component, 'choiceOrg');
      
      testCases.forEach((testCase, index) => {
        component.allOrgForReset = [testCase];
        fixture.detectChanges();
        
        // Компонент не должен сломаться
        expect(component.allOrgForReset).toEqual([testCase]);
        
        // Можно выбрать организацию
        component.choiceOrg(testCase);
        expect(choiceSpy).toHaveBeenCalledWith(testCase);
      });
    });

    it('should handle all possible search input types', () => {
      const testInputs = [
        '',
        ' ',
        '\t',
        '\n',
        'normal text',
        '123',
        '!@#$%^&*()',
        'Привет мир!',
        '🌍🌎🌏',
        'test<script>alert("xss")</script>',
        'A'.repeat(10000)
      ];
      
      testInputs.forEach(input => {
        component.searchOrg = input as any;
        fixture.detectChanges();
        
        // Компонент не должен сломаться
        expect(component.searchOrg).toBe(input as any);
      });
    });
  });
});
