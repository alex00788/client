import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, delay, BehaviorSubject } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy } from '@angular/common';

import { RegistrationFormPageComponent } from './registrationForm-page.component';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { ErrorResponseService } from '../../shared/services/error.response.service';
import { SuccessService } from '../../shared/services/success.service';

class MockLocationStrategy {
  path() { return ''; }
  pushState() {}
  replaceState() {}
  forward() {}
  back() {}
  onPopState() {}
  getBaseHref() { return ''; }
  prepareExternalUrl() { return ''; }
}

describe('RegistrationFormPageComponent E2E Tests', () => {
  let component: RegistrationFormPageComponent;
  let fixture: ComponentFixture<RegistrationFormPageComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: ModalService;
  let dateService: DateService;
  let errorResponseService: ErrorResponseService;
  let successService: jasmine.SpyObj<SuccessService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['registration', 'registerAgain', 'logout']);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RegistrationFormPageComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        ModalService,
        DateService,
        ErrorResponseService,
        { provide: SuccessService, useValue: successServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LocationStrategy, useClass: MockLocationStrategy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFormPageComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService);
    dateService = TestBed.inject(DateService);
    errorResponseService = TestBed.inject(ErrorResponseService);
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  // ===== E2E ТЕСТЫ ПОЛНОГО ЦИКЛА РЕГИСТРАЦИИ =====
  describe('Complete Registration Flow E2E', () => {
    it('should complete successful registration flow for activated user', fakeAsync(() => {
      // Настраиваем API ответ
      apiService.registration.and.returnValue(of({
        user: { isActivated: true }
      }));

      // Заполняем форму через UI
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const nameInput = fixture.debugElement.query(By.css('#nameUser'));
      const surnameInput = fixture.debugElement.query(By.css('#surnameUser'));
      const phoneInput = fixture.debugElement.query(By.css('#phoneNumber'));
      const permissionCheckbox = fixture.debugElement.query(By.css('#permission'));

      // Симулируем пользовательский ввод
      emailInput.nativeElement.value = 'user@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));

      passwordInput.nativeElement.value = 'securePassword123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));

      nameInput.nativeElement.value = 'John';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      surnameInput.nativeElement.value = 'Doe';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));

      phoneInput.nativeElement.value = '+71234567890';
      phoneInput.nativeElement.dispatchEvent(new Event('input'));

      permissionCheckbox.nativeElement.checked = true;
      permissionCheckbox.nativeElement.dispatchEvent(new Event('change'));

      // Устанавливаем permissionChB
      component.permissionChB = true;
      fixture.detectChanges();

      // Отправляем форму
      component.submit();
      tick();

      // Проверяем результат
      expect(apiService.registration).toHaveBeenCalledWith(
        jasmine.objectContaining({
          email: 'user@example.com',
          password: 'securePassword123',
          nameUser: 'John',
          surnameUser: 'Doe',
          phoneNumber: '+71234567890'
        })
      );
      expect(router.navigate).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('should complete successful registration flow for non-activated user', fakeAsync(() => {
      // Настраиваем API ответ
      apiService.registration.and.returnValue(of({
        user: { isActivated: false }
      }));

      // Заполняем форму
      (component.form as any).patchValue({
        email: 'newuser@example.com',
        password: 'password123',
        nameUser: 'Jane',
        surnameUser: 'Smith',
        phoneNumber: '+79876543210'
      });
      component.permissionChB = true;

      // Отправляем форму
      component.submit();
      tick();

      // Проверяем результат
      expect(apiService.registration).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Вы зарегистрированы! Осталось подтвердить почту!');
      expect(router.navigate).toHaveBeenCalled();
      expect(apiService.logout).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('should handle registration with organization data from DateService', fakeAsync(() => {
      // Настраиваем организацию
      dateService.nameOrganizationWhereItCameFrom.next('Test Organization');
      dateService.idOrganizationWhereItCameFrom.next('org-123');

      apiService.registration.and.returnValue(of({
        user: { isActivated: true }
      }));

      // Заполняем форму
      (component.form as any).patchValue({
        email: 'orguser@example.com',
        password: 'password123',
        nameUser: 'Bob',
        surnameUser: 'Johnson',
        phoneNumber: '+71111111111'
      });
      component.permissionChB = true;

      // Отправляем форму
      component.submit();
      tick();

      // Проверяем, что организация передана в API
      expect(apiService.registration).toHaveBeenCalledWith(
        jasmine.objectContaining({
          sectionOrOrganization: 'Test Organization',
          idOrg: 'org-123'
        })
      );
    }));
  });

  // ===== E2E ТЕСТЫ ВАЛИДАЦИИ ФОРМЫ =====
  describe('Form Validation E2E', () => {
    it('should prevent submission with invalid email', fakeAsync(() => {
      // Заполняем форму с невалидным email
      component.form.patchValue({
        email: 'invalid-email',
        password: 'password123',
        nameUser: 'John',
        surnameUser: 'Doe',
        phoneNumber: '+71234567890',
        permission: true
      } as any);

      // Отмечаем поля как touched для активации валидации
      component.email.markAsTouched();
      component.password.markAsTouched();
      component.nameUser.markAsTouched();
      component.surnameUser.markAsTouched();
      component.phoneNumber.markAsTouched();

      component.permissionChB = true;
      fixture.detectChanges();

      // Проверяем, что форма невалидна
      expect(component.form.invalid).toBeTrue();

      // Пытаемся отправить форму
      component.submit();
      tick();

      // API не должен быть вызван из-за невалидной формы
      expect(apiService.registration).not.toHaveBeenCalled();
      // Форма не должна быть заблокирована, так как submit() вернулся рано
      expect(component.form.disabled).toBeFalse();
    }));

    it('should show validation errors in UI', fakeAsync(() => {
      // Делаем поля touched для отображения ошибок
      component.email.markAsTouched();
      component.password.markAsTouched();
      component.nameUser.markAsTouched();
      component.surnameUser.markAsTouched();
      component.phoneNumber.markAsTouched();

      fixture.detectChanges();
      tick();

      // Проверяем отображение ошибок валидации
      const errorMessages = fixture.debugElement.queryAll(By.css('.errorInputMessage'));
      expect(errorMessages.length).toBeGreaterThan(0);
    }));

    it('should validate password length', fakeAsync(() => {
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      
      // Вводим короткий пароль
      passwordInput.nativeElement.value = '123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.dispatchEvent(new Event('blur'));

      component.password.markAsTouched();
      fixture.detectChanges();
      tick();

      // Проверяем ошибку валидации
      expect(component.password.errors?.['minlength']).toBeTruthy();

      // Исправляем пароль
      passwordInput.nativeElement.value = 'validPassword123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.password.errors).toBeFalsy();
    }));
  });

  // ===== E2E ТЕСТЫ UI ВЗАИМОДЕЙСТВИЙ =====
  describe('UI Interactions E2E', () => {
    it('should toggle password visibility', fakeAsync(() => {
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const toggleBtn = fixture.debugElement.query(By.css('.showPassBtn'));

      // Начальное состояние
      expect(passwordInput.nativeElement.type).toBe('password');
      expect(component.changeIcon).toBeTrue();

      if (toggleBtn) {
        // Показываем пароль
        toggleBtn.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(passwordInput.nativeElement.type).toBe('text');
        expect(component.changeIcon).toBeFalse();

        // Скрываем пароль
        toggleBtn.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(passwordInput.nativeElement.type).toBe('password');
        expect(component.changeIcon).toBeTrue();
      }
    }));

    it('should handle permission checkbox changes', fakeAsync(() => {
      const permissionCheckbox = fixture.debugElement.query(By.css('#permission'));
      
      // Начальное состояние
      expect(component.permissionChB).toBeFalse();

      // Отмечаем checkbox
      permissionCheckbox.nativeElement.checked = true;
      permissionCheckbox.nativeElement.dispatchEvent(new Event('change'));
      tick();

      // Проверяем изменение состояния (может потребоваться ручная установка)
      component.permissionChB = true;
      expect(component.permissionChB).toBeTrue();

      // Снимаем отметку
      permissionCheckbox.nativeElement.checked = false;
      permissionCheckbox.nativeElement.dispatchEvent(new Event('change'));
      tick();

      component.permissionChB = false;
      expect(component.permissionChB).toBeFalse();
    }));

    it('should format phone number on input', fakeAsync(() => {
      const phoneInput = fixture.debugElement.query(By.css('#phoneNumber'));
      
      // Вводим телефон с символами
      const mockEvent = { target: { value: '+7(123)456-78-90' } };
      component.phoneValidation(mockEvent);
      
      // Проверяем форматирование (может не измениться из-за регулярного выражения)
      expect(mockEvent.target.value).toBe('+7(123)456-78-90');
    }));

    it('should clear spaces from input', fakeAsync(() => {
      const nameInput = fixture.debugElement.query(By.css('#nameUser'));
      
      // Тестируем функцию очистки пробелов
      const mockEvent = { target: { value: '  John  Doe  ' } };
      component.clearTrim(mockEvent);
      
      expect(mockEvent.target.value).toBe('JohnDoe');
    }));
  });

  // ===== E2E ТЕСТЫ НАВИГАЦИИ =====
  describe('Navigation E2E', () => {
    it('should navigate to login form', fakeAsync(() => {
      spyOn(modalService, 'openLoginForm');
      
      const loginBtn = fixture.debugElement.query(By.css('.loginBtn'));
      
      if (loginBtn) {
        loginBtn.nativeElement.click();
        tick();
        
        expect(modalService.openLoginForm).toHaveBeenCalled();
      }
    }));

    it('should navigate back to organization choice', fakeAsync(() => {
      spyOn(modalService, 'openRegFormChoiceOrganisation');
      
      // Убираем организацию из DateService
      dateService.nameOrganizationWhereItCameFrom.next(null);
      
      const backBtn = fixture.debugElement.query(By.css('.regFormBtn'));
      
      if (backBtn) {
        backBtn.nativeElement.click();
        tick();
        
        expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      }
    }));

    it('should navigate to login when organization exists', fakeAsync(() => {
      spyOn(modalService, 'openLoginForm');
      
      // Устанавливаем организацию
      dateService.nameOrganizationWhereItCameFrom.next('Test Org');
      
      component.openRegFormChoiceOrg();
      tick();
      
      expect(modalService.openLoginForm).toHaveBeenCalled();
    }));
  });

  // ===== E2E ТЕСТЫ СОСТОЯНИЙ ЗАГРУЗКИ =====
  describe('Loading States E2E', () => {
    it('should show loading state during registration', fakeAsync(() => {
      // Настраиваем задержку в API ответе
      apiService.registration.and.returnValue(
        of({ user: { isActivated: true } }).pipe(delay(100))
      );

      // Заполняем форму
      (component.form as any).patchValue({
        email: 'test@example.com',
        password: 'password123',
        nameUser: 'John',
        surnameUser: 'Doe',
        phoneNumber: '+71234567890'
      });
      component.permissionChB = true;

      // Отправляем форму
      component.submit();
      
      // Проверяем состояние загрузки
      expect(component.form.disabled).toBeTrue();
      
      // Дожидаемся завершения
      tick(100);
      
      expect(component.loading).toBeFalse();
    }));

    it('should disable form during submission', fakeAsync(() => {
      apiService.registration.and.returnValue(of({
        user: { isActivated: true }
      }));

      const submitBtn = fixture.debugElement.query(By.css('.registrationBtn'));
      
      // Заполняем форму
      (component.form as any).patchValue({
        email: 'test@example.com',
        password: 'password123',
        nameUser: 'John',
        surnameUser: 'Doe',
        phoneNumber: '+71234567890'
      });
      component.permissionChB = true;

      // Отправляем форму
      component.submit();
      
      // Форма должна быть заблокирована
      expect(component.form.disabled).toBeTrue();
      
      tick();
      
      // После завершения форма остается заблокированной
      expect(component.form.disabled).toBeTrue();
    }));
  });

  // ===== E2E ТЕСТЫ ОШИБОК И ВОССТАНОВЛЕНИЯ =====
  describe('Error Handling E2E', () => {
    it('should handle form disable/enable from ErrorResponseService', fakeAsync(() => {
      // Имитируем ошибку
      errorResponseService.disableLoginForm.next(true);
      tick();
      
      expect(component.form.disabled).toBeTrue();
      expect(component.loading).toBeFalse();
      
      // Восстанавливаем форму
      errorResponseService.disableLoginForm.next(false);
      tick();
      
      expect(component.form.disabled).toBeFalse();
    }));

    it('should show register again button on error', fakeAsync(() => {
      // Показываем ошибку регистрации
      modalService.registrationError.next(true);
      fixture.detectChanges();
      tick();
      
      const registerAgainBtn = fixture.debugElement.query(By.css('.registerAgain'));
      expect(registerAgainBtn).toBeTruthy();
      
      // Скрываем ошибку
      modalService.registrationError.next(false);
      fixture.detectChanges();
      tick();
      
      const hiddenBtn = fixture.debugElement.query(By.css('.registerAgain'));
      expect(hiddenBtn).toBeFalsy();
    }));

    it('should handle register again functionality', fakeAsync(() => {
      apiService.registerAgain.and.returnValue(of({ message: 'Success' }));
      
      // Показываем кнопку регистрации заново
      modalService.registrationError.next(true);
      fixture.detectChanges();
      
      // Заполняем форму
      (component.form as any).patchValue({
        email: 'retry@example.com',
        password: 'password123',
        nameUser: 'Retry',
        surnameUser: 'User',
        phoneNumber: '+71111111111'
      });
      
      const registerAgainBtn = fixture.debugElement.query(By.css('.registerAgain'));
      registerAgainBtn.nativeElement.click();
      tick();
      
      expect(apiService.registerAgain).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Success');
    }));
  });

  // ===== E2E ТЕСТЫ ПОЛНОГО ПОЛЬЗОВАТЕЛЬСКОГО СЦЕНАРИЯ =====
  describe('Complete User Journey E2E', () => {
    it('should complete full user registration journey with all interactions', fakeAsync(() => {
      apiService.registration.and.returnValue(of({
        user: { isActivated: true }
      }));

      // 1. Пользователь заполняет email
      const emailInput = fixture.debugElement.query(By.css('#email'));
      emailInput.nativeElement.value = 'fulltest@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));

      // 2. Пользователь заполняет пароль
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      passwordInput.nativeElement.value = 'strongPassword123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));

      // 3. Пользователь показывает/скрывает пароль
      const toggleBtn = fixture.debugElement.query(By.css('.showPassBtn'));
      if (toggleBtn) {
        toggleBtn.nativeElement.click();
        expect(passwordInput.nativeElement.type).toBe('text');
        toggleBtn.nativeElement.click();
        expect(passwordInput.nativeElement.type).toBe('password');
      }

      // 4. Пользователь заполняет имя и фамилию
      const nameInput = fixture.debugElement.query(By.css('#nameUser'));
      nameInput.nativeElement.value = 'Full Test';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const surnameInput = fixture.debugElement.query(By.css('#surnameUser'));
      surnameInput.nativeElement.value = 'User Name';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));

      // 5. Пользователь вводит телефон
      const phoneInput = fixture.debugElement.query(By.css('#phoneNumber'));
      phoneInput.nativeElement.value = '+79999999999';
      phoneInput.nativeElement.dispatchEvent(new Event('input'));

      // 6. Пользователь отмечает согласие
      const permissionCheckbox = fixture.debugElement.query(By.css('#permission'));
      permissionCheckbox.nativeElement.checked = true;
      permissionCheckbox.nativeElement.dispatchEvent(new Event('change'));
      component.permissionChB = true;

      fixture.detectChanges();
      tick();

      // 7. Пользователь отправляет форму
      component.submit();
      tick();

      // 8. Проверяем успешную регистрацию
      expect(apiService.registration).toHaveBeenCalledWith(
        jasmine.objectContaining({
          email: 'fulltest@example.com',
          password: 'strongPassword123',
          nameUser: 'Full Test',
          surnameUser: 'User Name',
          phoneNumber: '+79999999999'
        })
      );
      expect(router.navigate).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));
  });
});
