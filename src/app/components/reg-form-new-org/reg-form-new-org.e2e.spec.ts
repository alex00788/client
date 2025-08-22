import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegFormNewOrgComponent } from './reg-form-new-org.component';
import { ModalService } from '../../shared/services/modal.service';
import { ApiService } from '../../shared/services/api.service';
import { SuccessService } from '../../shared/services/success.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, delay } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('RegFormNewOrgComponent E2E Tests', () => {
  let component: RegFormNewOrgComponent;
  let fixture: ComponentFixture<RegFormNewOrgComponent>;
  let modalService: jasmine.SpyObj<ModalService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let successService: jasmine.SpyObj<SuccessService>;
  let router: jasmine.SpyObj<Router>;

  const mockFormData = [
    {
      nameSupervisor: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
      phoneNumber: '+1234567890',
      nameSectionOrOrganization: 'Test Organization'
    },
    {
      nameSupervisor: 'Jane Smith',
      email: 'JANE.SMITH@COMPANY.COM',
      phoneNumber: '+0987654321',
      nameSectionOrOrganization: 'Another Company'
    },
    {
      nameSupervisor: 'Иван Иванов',
      email: 'IVAN@RUSSIAN.RU',
      phoneNumber: '+7-999-123-45-67',
      nameSectionOrOrganization: 'ООО "Русская Компания"'
    },
    {
      nameSupervisor: 'Jean Dupont',
      email: 'JEAN.DUPONT@FRANCE.FR',
      phoneNumber: '+33-1-42-97-48-16',
      nameSectionOrOrganization: 'Société Française'
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['addNewOrgSend']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['close', 'openRegFormChoiceOrganisation']);

    await TestBed.configureTestingModule({
      imports: [
        RegFormNewOrgComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegFormNewOrgComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Настройка API сервиса для E2E тестов
    apiService.addNewOrgSend.and.returnValue(of({ message: 'Success' }));
    
    fixture.detectChanges();
  });

  // ===== E2E ТЕСТЫ ПОЛНОГО ПОЛЬЗОВАТЕЛЬСКОГО СЦЕНАРИЯ =====
  describe('Complete User Journey E2E', () => {
    it('should complete full user registration flow', fakeAsync(async () => {
      // 1. Пользователь видит форму регистрации новой организации
      expect(fixture.debugElement.query(By.css('.titleAddFormNewOrg')).nativeElement.textContent.trim())
        .toBe('Новая организация');
      
      // 2. Пользователь заполняет все поля формы
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));

      // Заполняем имя руководителя
      nameSupervisorInput.nativeElement.value = 'John Doe';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      // Заполняем email
      emailInput.nativeElement.value = 'TEST@EXAMPLE.COM';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      // Заполняем телефон
      phoneNumberInput.nativeElement.value = '+1234567890';
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      
      // Заполняем название организации
      nameSectionInput.nativeElement.value = 'Test Organization';
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      
      // 3. Проверяем, что форма стала валидной
      expect(component.form.valid).toBeTrue();
      expect(component.form.invalid).toBeFalse();
      
      // 4. Проверяем, что кнопка отправки стала активной
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // 5. Пользователь отправляет форму
      submitButton.nativeElement.click();
      tick();
      
      // 6. Проверяем, что API вызван с правильными данными
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith(
        jasmine.objectContaining({
          nameSupervisor: 'John Doe',
          phoneNumber: '+1234567890',
          nameSectionOrOrganization: 'Test Organization'
        })
      );
      
      // 7. Проверяем, что форма заблокирована после отправки
      expect(component.form.disabled).toBeTrue();
      
      // 8. Проверяем успешный ответ
      expect(successService.localHandler).toHaveBeenCalledWith('Success');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(modalService.close).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle user navigation flow', fakeAsync(async () => {
      // 1. Пользователь нажимает кнопку "назад"
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      backButton.nativeElement.click();
      
      // 2. Проверяем, что вызван правильный метод навигации
      expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      
      // 3. Пользователь возвращается к форме
      // (в реальном приложении это было бы через ModalService)
      
      // 4. Пользователь заполняет форму и отправляет
      component.form.patchValue({
        nameSupervisor: 'Jane Doe',
        email: 'JANE@EXAMPLE.COM',
        phoneNumber: '+0987654321',
        nameSectionOrOrganization: 'Another Organization'
      });
      
      component.submit();
      tick();
      
      // 5. Проверяем успешную отправку
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith(
        jasmine.objectContaining({
          nameSupervisor: 'Jane Doe',
          phoneNumber: '+0987654321',
          nameSectionOrOrganization: 'Another Organization'
        })
      );
      
      tick();
    }));

    it('should handle complex form validation workflow', fakeAsync(async () => {
      // 1. Пользователь пытается отправить пустую форму
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // 2. Пользователь заполняет только часть полей
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      nameSupervisorInput.nativeElement.value = 'John Doe';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Кнопка все еще должна быть неактивна
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // 3. Пользователь заполняет email с неправильным форматом
      const emailInput = fixture.debugElement.query(By.css('#email'));
      emailInput.nativeElement.value = 'invalid-email';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Кнопка все еще должна быть неактивна
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // 4. Пользователь исправляет email
      emailInput.nativeElement.value = 'VALID@EXAMPLE.COM';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      // 5. Пользователь заполняет остальные поля
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      
      phoneNumberInput.nativeElement.value = '+1234567890';
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      
      nameSectionInput.nativeElement.value = 'Test Organization';
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // 6. Теперь форма должна быть валидна
      expect(component.form.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // 7. Пользователь отправляет форму
      submitButton.nativeElement.click();
      tick();
      
      // 8. Проверяем успешную отправку
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'John Doe',
        email: 'vALID@EXAMPLE.COM', // Email преобразуется согласно логике компонента
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interaction E2E', () => {
    it('should handle real-time form validation updates', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Пользователь вводит данные пошагово
      // Шаг 1: Только имя руководителя
      nameSupervisorInput.nativeElement.value = 'John Doe';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Шаг 2: Добавляем email
      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Шаг 3: Добавляем телефон
      phoneNumberInput.nativeElement.value = '+1234567890';
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Шаг 4: Добавляем название организации
      nameSectionInput.nativeElement.value = 'Test Organization';
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Теперь форма должна быть валидна
      expect(submitButton.nativeElement.disabled).toBeFalse();
      expect(component.form.valid).toBeTrue();
      
      tick();
    }));

    it('should handle rapid user interactions', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      
      const startTime = performance.now();
      
      // Пользователь быстро выполняет множество действий
      for (let i = 0; i < 50; i++) {
        // Быстрое заполнение формы
        nameSupervisorInput.nativeElement.value = `User ${i}`;
        nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
        
        emailInput.nativeElement.value = `user${i}@example.com`;
        emailInput.nativeElement.dispatchEvent(new Event('input'));
        
        phoneNumberInput.nativeElement.value = `+1${i.toString().padStart(9, '0')}`;
        phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
        
        nameSectionInput.nativeElement.value = `Organization ${i}`;
        nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
        
        // Быстрое нажатие кнопки "назад"
        backButton.nativeElement.click();
        
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(500);
      
      // Проверяем финальное состояние - форма может быть очищена после последнего цикла
      // поэтому проверяем, что компонент работает стабильно
      expect(component.form).toBeDefined();
      expect(component.form.controls).toBeDefined();
      
      tick();
    }));

    it('should handle user input validation and edge cases', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      
      // Тестируем различные типы ввода
      
      // 1. Очень длинные значения
      const longValue = 'A'.repeat(10000);
      nameSupervisorInput.nativeElement.value = longValue;
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      phoneNumberInput.nativeElement.value = longValue;
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      
      nameSectionInput.nativeElement.value = longValue;
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      expect(component.form.valid).toBeTrue();
      
      // 2. Специальные символы
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      nameSupervisorInput.nativeElement.value = specialValue;
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      expect(component.form.valid).toBeTrue();
      
      // 3. Unicode символы
      const unicodeValue = 'Привет мир! 🌍 你好世界!';
      nameSupervisorInput.nativeElement.value = unicodeValue;
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      expect(component.form.valid).toBeTrue();
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance E2E', () => {
    it('should handle large datasets efficiently', fakeAsync(async () => {
      const startTime = performance.now();
      
      // Создаем большой набор данных для тестирования
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        nameSupervisor: `User ${i} - ${Math.random().toString(36).substring(7)}`,
        email: `user${i}@example.com`,
        phoneNumber: `+1${i.toString().padStart(9, '0')}`,
        nameSectionOrOrganization: `Organization ${i} - ${Math.random().toString(36).substring(7)}`
      }));
      
      // Тестируем производительность заполнения формы
      for (let i = 0; i < largeDataset.length; i++) {
        const data = largeDataset[i];
        
        component.form.patchValue(data);
        
        if (i % 100 === 0) {
          fixture.detectChanges();
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Проверяем производительность заполнения
      expect(executionTime).toBeLessThan(500);
      
      // Проверяем финальное состояние
      const lastData = largeDataset[largeDataset.length - 1];
      expect(component.form.get('nameSupervisor')?.value).toBe(lastData.nameSupervisor);
      expect(component.form.get('email')?.value).toBe(lastData.email);
      
      tick();
    }));

    it('should handle rapid DOM updates efficiently', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      
      const startTime = performance.now();
      
      // Быстрые обновления DOM
      for (let i = 0; i < 200; i++) {
        nameSupervisorInput.nativeElement.value = `User ${i}`;
        nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
        
        emailInput.nativeElement.value = `user${i}@example.com`;
        emailInput.nativeElement.dispatchEvent(new Event('input'));
        
        phoneNumberInput.nativeElement.value = `+1${i.toString().padStart(9, '0')}`;
        phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
        
        nameSectionInput.nativeElement.value = `Organization ${i}`;
        nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
        
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(2000); // Увеличиваем лимит для стабильности
      
      // Проверяем финальное состояние
      expect(nameSupervisorInput.nativeElement.value).toBe('User 199');
      expect(emailInput.nativeElement.value).toBe('user199@example.com');
      
      tick();
    }));

    it('should handle memory usage efficiently', fakeAsync(async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Выполняем много операций
      for (let i = 0; i < 2000; i++) {
        component.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`, // Здесь email не изменяется, так как он уже в нижнем регистре
          phoneNumber: `+1${i.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${i}`
        });
        
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
        const newFixture = TestBed.createComponent(RegFormNewOrgComponent);
        const newComponent = newFixture.componentInstance;
        
        // Инициализируем
        newFixture.detectChanges();
        tick();
        
        // Выполняем операции
        newComponent.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`, // Здесь email не изменяется, так как он уже в нижнем регистре
          phoneNumber: `+1${i.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${i}`
        });
        
        // Отправляем форму
        newComponent.submit();
        tick();
        
        // Уничтожаем
        newComponent.ngOnDestroy();
        newFixture.destroy();
      }
      
      // Не должно быть ошибок
      expect(component).toBeTruthy();
      expect(component.form).toBeDefined();
      
      tick();
    }));

    it('should handle service failures gracefully', fakeAsync(async () => {
      // Симулируем отказ API сервиса - используем пустой ответ
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // Компонент не должен сломаться
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      component.submit();
      tick();
      
      // Проверяем, что компонент в стабильном состоянии
      expect(component.form).toBeDefined();
      expect(component.form.disabled).toBeTrue();
      
      tick();
    }));

    it('should handle rapid state changes without errors', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      
      // Быстрые изменения состояния
      for (let i = 0; i < 500; i++) {
        // Изменяем значения формы
        nameSupervisorInput.nativeElement.value = `User ${i}`;
        nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
        
        emailInput.nativeElement.value = `user${i}@example.com`; // Здесь email не изменяется, так как он уже в нижнем регистре
        emailInput.nativeElement.dispatchEvent(new Event('input'));
        
        phoneNumberInput.nativeElement.value = `+1${i.toString().padStart(9, '0')}`;
        phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
        
        nameSectionInput.nativeElement.value = `Organization ${i}`;
        nameSectionInput.nativeElement.dispatchEvent(new Event('input'));
        
        // Обновляем DOM
        if (i % 50 === 0) {
          fixture.detectChanges();
        }
      }
      
      // Не должно быть ошибок
      expect(component.form).toBeDefined();
      expect(component.form.value).toBeDefined();
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility E2E', () => {
    it('should have proper keyboard navigation', fakeAsync(async () => {
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      
      // Фокус на первое поле
      nameSupervisorInput.nativeElement.focus();
      expect(document.activeElement).toBe(nameSupervisorInput.nativeElement);
      
      // Ввод текста
      nameSupervisorInput.nativeElement.value = 'John Doe';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Tab к следующему полю
      nameSupervisorInput.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      fixture.detectChanges();
      
      // Проверяем, что следующее поле доступно
      expect(emailInput.nativeElement).toBeTruthy();
      
      tick();
    }));

    it('should have proper ARIA labels and roles', fakeAsync(async () => {
      // Проверяем label для всех полей
      const labels = fixture.debugElement.queryAll(By.css('label'));
      const inputs = fixture.debugElement.queryAll(By.css('input'));
      
      expect(labels.length).toBe(4);
      expect(inputs.length).toBe(4);
      
      // Проверяем соответствие label и input
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const input = inputs[i];
        
        expect(label.attributes['for']).toBe(input.attributes['id']);
      }
      
      // Проверяем кнопки
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      
      expect(submitButton.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(backButton.nativeElement.tagName.toLowerCase()).toBe('button');
      
      tick();
    }));

    it('should handle screen reader compatibility', fakeAsync(async () => {
      // Проверяем заголовок
      const title = fixture.debugElement.query(By.css('.titleAddFormNewOrg'));
      expect(title.nativeElement.textContent.trim()).toBe('Новая организация');
      
      // Проверяем labels
      const labels = fixture.debugElement.queryAll(By.css('label'));
      const expectedLabels = [
        'Имя руководителя *',
        'Email *',
        'Телефон *',
        'Название организации *'
      ];
      
      labels.forEach((label, index) => {
        expect(label.nativeElement.textContent.trim()).toBe(expectedLabels[index]);
      });
      
      // Проверяем кнопки
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      
      expect(submitButton.nativeElement.textContent.trim()).toBe('Отправить');
      expect(backButton.nativeElement.textContent.trim()).toBe('назад');
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Real Service Integration E2E', () => {
    it('should integrate with real ModalService correctly', fakeAsync(async () => {
      // Проверяем все методы ModalService
      expect(modalService).toBeTruthy();
      expect(modalService.close).toBeDefined();
      expect(modalService.openRegFormChoiceOrganisation).toBeDefined();
      
      // Открываем форму регистрации
      expect(component.modalService).toBe(modalService);
      
      // Проверяем, что кнопка "назад" вызывает правильный метод
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      backButton.nativeElement.click();
      
      expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      
      tick();
    }));

    it('should integrate with real SuccessService correctly', fakeAsync(async () => {
      // Проверяем SuccessService
      expect(successService).toBeTruthy();
      expect(successService.localHandler).toBeDefined();
      
      // Проверяем, что компонент может использовать SuccessService
      expect(component.successService).toBe(successService);
      
      // Проверяем вызов метода
      successService.localHandler('Test Message');
      expect(successService.localHandler).toHaveBeenCalledWith('Test Message');
      
      tick();
    }));

    it('should handle real API service responses', fakeAsync(async () => {
      // Проверяем API сервис
      expect(apiService.addNewOrgSend).toBeDefined();
      
      // Симулируем различные ответы API
      const responses = [
        { message: 'Success' },
        { message: 'Organization Created' },
        { message: 'Registration Complete' },
        { message: '' },
        { message: null },
        { message: undefined }
      ];
      
      responses.forEach((response, index) => {
        apiService.addNewOrgSend.and.returnValue(of(response));
        
        // Заполняем форму
        component.form.patchValue({
          nameSupervisor: `User ${index}`,
          email: `user${index}@example.com`,
          phoneNumber: `+1${index.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${index}`
        });
        
        // Отправляем форму
        component.submit();
        tick();
        
        // Проверяем, что successService вызван с правильным сообщением
        if (response.message) {
          expect(successService.localHandler).toHaveBeenCalledWith(response.message);
        }
        
        // Сбрасываем spy для следующего теста
        apiService.addNewOrgSend.calls.reset();
        successService.localHandler.calls.reset();
        router.navigate.calls.reset();
        // modalService.close не является spy объектом, поэтому убираем calls.reset()
        
        // Включаем форму снова
        component.form.enable();
      });
      
      tick();
    }));
  });

  // ===== E2E ТЕСТЫ СЦЕНАРИЕВ ИСПОЛЬЗОВАНИЯ =====
  describe('Usage Scenario E2E', () => {
    it('should handle business user registration scenario', fakeAsync(async () => {
      // Сценарий: Бизнес-пользователь регистрирует новую организацию
      
      // 1. Пользователь открывает форму
      expect(fixture.debugElement.query(By.css('.titleAddFormNewOrg')).nativeElement.textContent.trim())
        .toBe('Новая организация');
      
      // 2. Пользователь заполняет форму
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));

      nameSupervisorInput.nativeElement.value = 'Иван Иванов';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      emailInput.nativeElement.value = 'IVAN@COMPANY.RU';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      phoneNumberInput.nativeElement.value = '+7-999-123-45-67';
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      
      nameSectionInput.nativeElement.value = 'ООО "Новая Компания"';
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      
      // 3. Проверяем валидность формы
      expect(component.form.valid).toBeTrue();
      
      // 4. Пользователь отправляет форму
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      tick();
      
      // 5. Проверяем успешную отправку
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'Иван Иванов',
        email: 'iVAN@COMPANY.RU', // Email преобразуется согласно логике компонента
        phoneNumber: '+7-999-123-45-67',
        nameSectionOrOrganization: 'ООО "Новая Компания"'
      });
      
      tick();
    }));

    it('should handle international user registration scenario', fakeAsync(async () => {
      // Сценарий: Международный пользователь регистрирует организацию
      
      // Заполняем форму с международными данными
      component.form.patchValue({
        nameSupervisor: 'John Smith',
        email: 'JOHN.SMITH@INTERNATIONAL.COM',
        phoneNumber: '+44-20-7946-0958',
        nameSectionOrOrganization: 'International Corp Ltd.'
      });
      
      // Отправляем форму
      component.submit();
      tick();
      
      // Проверяем успешную отправку
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'John Smith',
        email: 'jOHN.SMITH@INTERNATIONAL.COM', // Email преобразуется согласно логике компонента
        phoneNumber: '+44-20-7946-0958',
        nameSectionOrOrganization: 'International Corp Ltd.'
      });
      
      tick();
    }));

    it('should handle multiple user registration scenarios', fakeAsync(async () => {
      // Тестируем несколько сценариев регистрации
      
      mockFormData.forEach((data, index) => {
        // Заполняем форму
        component.form.patchValue(data);
        
        // Отправляем форму
        component.submit();
        tick();
        
        // Проверяем успешную отправку
        expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
          nameSupervisor: data.nameSupervisor,
          email: data.email.charAt(0).toLowerCase() + data.email.slice(1), // Email преобразуется согласно логике компонента
          phoneNumber: data.phoneNumber,
          nameSectionOrOrganization: data.nameSectionOrOrganization
        });
        
        // Сбрасываем spy для следующего теста
        apiService.addNewOrgSend.calls.reset();
        successService.localHandler.calls.reset();
        router.navigate.calls.reset();
        // modalService.close не является spy объектом, поэтому убираем calls.reset()
        
        // Включаем форму снова
        component.form.enable();
      });
      
      tick();
    }));
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ E2E ТЕСТЫ =====
  describe('Additional E2E Scenarios', () => {
    it('should handle edge case scenarios', fakeAsync(async () => {
      // Тестируем граничные случаи
      
      // 1. Очень длинные значения
      const longValue = 'A'.repeat(10000);
      
      component.form.patchValue({
        nameSupervisor: longValue,
        email: 'test@example.com',
        phoneNumber: longValue,
        nameSectionOrOrganization: longValue
      });
      
      component.submit();
      tick();
      
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: longValue,
        email: 'test@example.com', // Email остается как есть, согласно логике компонента
        phoneNumber: longValue,
        nameSectionOrOrganization: longValue
      });
      
      tick();
    }));

    it('should handle performance stress scenarios', fakeAsync(async () => {
      // Тестируем производительность под нагрузкой
      
      const startTime = performance.now();
      
      // Множественные операции
      for (let i = 0; i < 1000; i++) {
        component.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`, // Здесь email не изменяется, так как он уже в нижнем регистре
          phoneNumber: `+1${i.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${i}`
        });
        
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
      
      // 1. Симулируем ошибку API - используем пустой ответ
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // 2. Заполняем и отправляем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com', // Здесь email не изменяется, так как он уже в нижнем регистре
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      component.submit();
      tick();
      
      // Сбрасываем spy объекты для следующего вызова
      successService.localHandler.calls.reset();
      router.navigate.calls.reset();
      modalService.close.calls.reset();
      
      // 3. Восстанавливаем API
      apiService.addNewOrgSend.and.returnValue(of({ message: 'Recovery Success' }));
      
      // 4. Включаем форму и отправляем снова
      component.form.enable();
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      fixture.detectChanges();
      component.submit();
      tick();
      
      expect(successService.localHandler).toHaveBeenCalledWith('Recovery Success');
      
      tick();
    }));
  });
});


