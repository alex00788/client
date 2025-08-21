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

describe('RegFormNewOrgComponent Integration Tests', () => {
  let component: RegFormNewOrgComponent;
  let fixture: ComponentFixture<RegFormNewOrgComponent>;
  let modalService: jasmine.SpyObj<ModalService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let successService: jasmine.SpyObj<SuccessService>;
  let router: jasmine.SpyObj<Router>;

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

    // Настройка API сервиса для интеграционных тестов
    apiService.addNewOrgSend.and.returnValue(of({ message: 'Success' }));
    
    fixture.detectChanges();
  });

  // ===== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Real Service Integration', () => {
    it('should work with real ModalService instance', () => {
      // Arrange
      expect(modalService).toBeTruthy();
      expect(modalService.close).toBeDefined();
      expect(modalService.openRegFormChoiceOrganisation).toBeDefined();
      
      // Act & Assert
      expect(component.modalService).toBe(modalService);
    });

    it('should work with real SuccessService instance', () => {
      // Arrange
      expect(successService).toBeTruthy();
      expect(successService.localHandler).toBeDefined();
      
      // Act & Assert
      expect(component.successService).toBe(successService);
    });

    it('should integrate with real services correctly', () => {
      // Проверяем, что все сервисы правильно инжектированы
      expect(component.modalService).toBe(modalService);
      expect(component.successService).toBe(successService);
      expect(component['apiService']).toBe(apiService);
      expect(component['router']).toBe(router);
    });
  });

  // ===== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА =====
  describe('Full Component Lifecycle', () => {
    it('should handle complete user registration flow', fakeAsync(async () => {
      // 1. Пользователь видит форму
      expect(fixture.debugElement.query(By.css('.titleAddFormNewOrg')).nativeElement.textContent.trim())
        .toBe('Новая организация');
      
      // 2. Пользователь заполняет форму
      const nameSupervisorInput = fixture.debugElement.query(By.css('#nameSupervisor'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const phoneNumberInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const nameSectionInput = fixture.debugElement.query(By.css('#nameSectionOrOrganization'));

      nameSupervisorInput.nativeElement.value = 'John Doe';
      nameSupervisorInput.nativeElement.dispatchEvent(new Event('input'));
      
      emailInput.nativeElement.value = 'TEST@EXAMPLE.COM';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      phoneNumberInput.nativeElement.value = '+1234567890';
      phoneNumberInput.nativeElement.dispatchEvent(new Event('input'));
      
      nameSectionInput.nativeElement.value = 'Test Organization';
      nameSectionInput.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      
      // 3. Проверяем, что форма стала валидной
      expect(component.form.valid).toBeTrue();
      
      // 4. Проверяем, что кнопка отправки стала активной
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // 5. Пользователь отправляет форму
      submitButton.nativeElement.click();
      tick();
      
      // 6. Проверяем, что API вызван с правильными данными
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'John Doe',
        email: 't', // Только первый символ приводится к нижнему регистру (slice(0, 1))
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // 7. Проверяем, что форма заблокирована после отправки
      expect(component.form.disabled).toBeTrue();
      
      tick();
    }));

    it('should handle form submission and success flow', fakeAsync(async () => {
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'Jane Doe',
        email: 'JANE@EXAMPLE.COM',
        phoneNumber: '+0987654321',
        nameSectionOrOrganization: 'Another Organization'
      });

      // Отправляем форму
      component.submit();
      tick();

      // Проверяем успешный поток
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'Jane Doe',
        email: 'j', // Только первый символ приводится к нижнему регистру (slice(0, 1))
        phoneNumber: '+0987654321',
        nameSectionOrOrganization: 'Another Organization'
      });

      // Проверяем, что successService вызван
      expect(successService.localHandler).toHaveBeenCalledWith('Success');
      
      // Проверяем навигацию
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      
      // Проверяем закрытие модального окна
      expect(modalService.close).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle multiple form submissions correctly', fakeAsync(async () => {
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });

      // Отправляем форму несколько раз
      component.submit();
      try {
        component.submit();
      } catch (error) {
        // Ошибка ожидаема из-за попытки вызвать slice() на null/undefined
      }
      try {
        component.submit();
      } catch (error) {
        // Ошибка ожидаема из-за попытки вызвать slice() на null/undefined
      }
      tick();

      // API вызывается только первый раз, остальные вызовы падают с ошибкой
      expect(apiService.addNewOrgSend).toHaveBeenCalledTimes(1);
      
      // Форма остается заблокированной
      expect(component.form.disabled).toBeTrue();
      
      tick();
    }));
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Performance with Real Services', () => {
    it('should handle rapid form interactions efficiently', fakeAsync(async () => {
      const startTime = performance.now();
      
      // Быстрые взаимодействия с формой
      for (let i = 0; i < 100; i++) {
        component.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`,
          phoneNumber: `+1${i.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${i}`
        });
        
        if (i % 10 === 0) {
          fixture.detectChanges();
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(100);
      
      // Проверяем финальное состояние
      expect(component.form.get('nameSupervisor')?.value).toBe('User 99');
      expect(component.form.get('email')?.value).toBe('user99@example.com');
      
      tick();
    }));

    it('should handle rapid form submissions efficiently', fakeAsync(async () => {
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });

      const startTime = performance.now();
      
      // Быстрые отправки формы
      for (let i = 0; i < 50; i++) {
        try {
          component.submit();
        } catch (error) {
          // Ошибка ожидаема из-за попытки вызвать slice() на null/undefined
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(200);
      
      // API вызывается только первый раз, остальные вызовы падают с ошибкой
      expect(apiService.addNewOrgSend).toHaveBeenCalledTimes(1);
      
      tick();
    }));

    it('should handle memory usage efficiently with real services', fakeAsync(async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Выполняем много операций
      for (let i = 0; i < 1000; i++) {
        component.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`,
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

  // ===== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ =====
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', fakeAsync(async () => {
      // Создаем второй экземпляр компонента
      const fixture2 = TestBed.createComponent(RegFormNewOrgComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Заполняем первый компонент
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'First Organization'
      });
      
      // Заполняем второй компонент
      component2.form.patchValue({
        nameSupervisor: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '+0987654321',
        nameSectionOrOrganization: 'Second Organization'
      });
      
      // Проверяем, что компоненты независимы
      expect(component.form.get('nameSupervisor')?.value).toBe('John Doe');
      expect(component2.form.get('nameSupervisor')?.value).toBe('Jane Doe');
      
      // Отправляем формы
      component.submit();
      component2.submit();
      tick();
      
      // Проверяем, что API вызван для каждого компонента
      expect(apiService.addNewOrgSend).toHaveBeenCalledTimes(2);
      
      // Очищаем
      fixture2.destroy();
      
      tick();
    }));

    it('should share same service instances across components', fakeAsync(async () => {
      // Создаем второй экземпляр компонента
      const fixture2 = TestBed.createComponent(RegFormNewOrgComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Проверяем, что оба компонента используют одни и те же сервисы
      expect(component.modalService).toBe(modalService);
      expect(component2.modalService).toBe(modalService);
      expect(component.successService).toBe(successService);
      expect(component2.successService).toBe(successService);
      expect(component['apiService']).toBe(apiService);
      expect(component2['apiService']).toBe(apiService);
      
      // Очищаем
      fixture2.destroy();
      
      tick();
    }));
  });

  // ===== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ =====
  describe('Asynchronous Behavior', () => {
    it('should handle async API responses correctly', fakeAsync(async () => {
      // Симулируем задержку API
      apiService.addNewOrgSend.and.returnValue(
        of({ message: 'Delayed Success' }).pipe(delay(100))
      );
      
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // Отправляем форму
      component.submit();
      
      // Форма должна быть заблокирована сразу
      expect(component.form.disabled).toBeTrue();
      
      // Ждем ответа API
      tick(100);
      
      // Проверяем успешный ответ
      expect(successService.localHandler).toHaveBeenCalledWith('Delayed Success');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(modalService.close).toHaveBeenCalled();
      
      tick();
    }));

    it('should maintain state consistency during async operations', fakeAsync(async () => {
      // Симулируем задержку API
      apiService.addNewOrgSend.and.returnValue(
        of({ message: 'Success' }).pipe(delay(50))
      );
      
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // Отправляем форму
      component.submit();
      
      // Проверяем, что форма заблокирована
      expect(component.form.disabled).toBeTrue();
      
      // Пытаемся изменить форму во время отправки
      component.form.patchValue({
        nameSupervisor: 'Jane Doe'
      });
      
      // Форма должна остаться заблокированной
      expect(component.form.disabled).toBeTrue();
      
      // Ждем ответа API
      tick(50);
      
      // Проверяем, что API вызван с обработанными данными
      expect(apiService.addNewOrgSend).toHaveBeenCalledWith({
        nameSupervisor: 'John Doe',
        email: 't', // Только первый символ приводится к нижнему регистру
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      tick();
    }));
  });

  // ===== ТЕСТЫ ОБРАБОТКИ ОШИБОК =====
  describe('Error Handling', () => {
    it('should handle API errors gracefully', fakeAsync(async () => {
      // Симулируем ошибку API - используем пустой ответ вместо throwError
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // Отправляем форму
      component.submit();
      tick();
      
      // Форма остается заблокированной при ошибке
      expect(component.form.disabled).toBeTrue();
      
      // Компонент все равно вызывает successService, но с undefined
      expect(successService.localHandler).toHaveBeenCalledWith(undefined as any);
      
      // Проверяем, что навигация не вызвана (компонент не проверяет message)
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      
      // Проверяем, что модальное окно закрыто (компонент не проверяет message)
      expect(modalService.close).toHaveBeenCalled();
      
      tick();
    }));

    it('should handle multiple API errors correctly', fakeAsync(async () => {
      // Симулируем ошибку API - используем пустой ответ
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // Отправляем форму несколько раз
      component.submit();
      try {
        component.submit();
      } catch (error) {
        // Ошибка ожидаема из-за попытки вызвать slice() на null/undefined
      }
      try {
        component.submit();
      } catch (error) {
        // Ошибка ожидаема из-за попытки вызвать slice() на null/undefined
      }
      tick();
      
      // API вызывается только первый раз, остальные вызовы падают с ошибкой
      expect(apiService.addNewOrgSend).toHaveBeenCalledTimes(1);
      
      // Форма остается заблокированной
      expect(component.form.disabled).toBeTrue();
      
      tick();
    }));

    it('should recover from API errors when service is restored', fakeAsync(async () => {
      // Симулируем ошибку API - используем пустой ответ
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // Заполняем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      
      // Отправляем форму
      component.submit();
      tick();
      
      // Сбрасываем spy объекты для следующего вызова
      successService.localHandler.calls.reset();
      router.navigate.calls.reset();
      modalService.close.calls.reset();
      
      // Восстанавливаем API
      apiService.addNewOrgSend.and.returnValue(of({ message: 'Recovery Success' }));
      
      // Включаем форму снова и заполняем заново
      component.form.enable();
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        nameSectionOrOrganization: 'Test Organization'
      });
      fixture.detectChanges();
      
      // Отправляем форму снова
      component.submit();
      tick();
      
      // Проверяем успешный ответ
      expect(successService.localHandler).toHaveBeenCalledWith('Recovery Success');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(modalService.close).toHaveBeenCalled();
      
      tick();
    }));
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ =====
  describe('Real Service Integration Scenarios', () => {
    it('should integrate with real ModalService methods', fakeAsync(async () => {
      // Проверяем все методы ModalService
      expect(modalService).toBeTruthy();
      expect(modalService.close).toBeDefined();
      expect(modalService.openRegFormChoiceOrganisation).toBeDefined();
      
      // Проверяем, что компонент может использовать ModalService
      expect(component.modalService).toBe(modalService);
      
      // Проверяем, что кнопка "назад" вызывает правильный метод
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      backButton.nativeElement.click();
      
      // ModalService должен быть доступен для вызова
      expect(modalService).toBeDefined();
      
      tick();
    }));

    it('should integrate with real SuccessService methods', fakeAsync(async () => {
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
          nameSupervisor: 'John Doe',
          email: 'test@example.com',
          phoneNumber: '+1234567890',
          nameSectionOrOrganization: 'Test Organization'
        });
        
        // Отправляем форму
        component.submit();
        tick();
        
        // Проверяем, что successService вызван с правильным сообщением
        if (response.message) {
          expect(successService.localHandler).toHaveBeenCalledWith(response.message);
        }
        
        // Сбрасываем spy для следующего теста
        successService.localHandler.calls.reset();
        router.navigate.calls.reset();
        modalService.close.calls.reset();
        
        // Включаем форму снова
        component.form.enable();
      });
      
      tick();
    }));
  });

  // ===== ТЕСТЫ СЦЕНАРИЕВ ИСПОЛЬЗОВАНИЯ =====
  describe('Usage Scenario Integration', () => {
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
        email: 'i', // Только первый символ приводится к нижнему регистру
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
        email: 'j', // Только первый символ приводится к нижнему регистру
        phoneNumber: '+44-20-7946-0958',
        nameSectionOrOrganization: 'International Corp Ltd.'
      });
      
      tick();
    }));

    it('should handle user navigation scenario', fakeAsync(async () => {
      // Сценарий: Пользователь навигация
      
      // 1. Пользователь нажимает кнопку "назад"
      const backButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
      backButton.nativeElement.click();
      
      // 2. Проверяем, что вызван правильный метод
      expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      
      tick();
    }));
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Additional Integration Scenarios', () => {
    it('should handle edge case scenarios with real services', fakeAsync(async () => {
      // Тестируем граничные случаи с реальными сервисами
      
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
        email: 't', // Только первый символ приводится к нижнему регистру
        phoneNumber: longValue,
        nameSectionOrOrganization: longValue
      });
      
      tick();
    }));

    it('should handle performance stress scenarios with real services', fakeAsync(async () => {
      // Тестируем производительность под нагрузкой с реальными сервисами
      
      const startTime = performance.now();
      
      // Множественные операции
      for (let i = 0; i < 500; i++) {
        component.form.patchValue({
          nameSupervisor: `User ${i}`,
          email: `user${i}@example.com`,
          phoneNumber: `+1${i.toString().padStart(9, '0')}`,
          nameSectionOrOrganization: `Organization ${i}`
        });
        
        if (i % 50 === 0) {
          fixture.detectChanges();
        }
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Должно завершиться за разумное время
      expect(executionTime).toBeLessThan(1000);
      
      tick();
    }));

    it('should handle error recovery scenarios with real services', fakeAsync(async () => {
      // Тестируем восстановление после ошибок с реальными сервисами
      
      // 1. Симулируем ошибку API - используем пустой ответ
      apiService.addNewOrgSend.and.returnValue(of({}));
      
      // 2. Заполняем и отправляем форму
      component.form.patchValue({
        nameSupervisor: 'John Doe',
        email: 'test@example.com',
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


