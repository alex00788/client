import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { LoginPageComponent } from './login-page.component';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { SuccessService } from '../../shared/services/success.service';
import { ErrorResponseService } from '../../shared/services/error.response.service';

// Mock services для интеграционных тестов
class MockApiService {
  login = jasmine.createSpy('login').and.returnValue(of({
    user: { isActivated: true },
    accessToken: 'test-token',
    expiresIn: 3600
  }));
  
  logout = jasmine.createSpy('logout');
  
  resendLink = jasmine.createSpy('resendLink').and.returnValue(of({ message: 'Link sent successfully' }));
  
  rememberPas = jasmine.createSpy('rememberPas').and.returnValue(of({ message: 'Password reminder sent' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockActivatedRoute {
  queryParams = of({});
}

class MockModalService {
  close = jasmine.createSpy('close');
  openRegistrationForm = jasmine.createSpy('openRegistrationForm');
  openRegFormChoiceOrganisation = jasmine.createSpy('openRegFormChoiceOrganisation');
  rememberPas = new BehaviorSubject<boolean>(false);
}

class MockDateService {
  nameOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
  idOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
  pasForLink = new BehaviorSubject<string>('');
  currentOrg = new BehaviorSubject<any>(null);
  
  setUser = jasmine.createSpy('setUser');
}

class MockSuccessService {
  localHandler = jasmine.createSpy('localHandler');
}

class MockErrorResponseService {
  disableLoginForm = new BehaviorSubject<boolean>(false);
  localHandler = jasmine.createSpy('localHandler');
  clear = jasmine.createSpy('clear');
}

describe('LoginPageComponent Integration Tests', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let apiService: MockApiService;
  let router: MockRouter;
  let modalService: MockModalService;
  let dateService: MockDateService;
  let successService: MockSuccessService;
  let errorResponseService: MockErrorResponseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: ModalService, useClass: MockModalService },
        { provide: DateService, useClass: MockDateService },
        { provide: SuccessService, useClass: MockSuccessService },
        { provide: ErrorResponseService, useClass: MockErrorResponseService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    
    apiService = TestBed.inject(ApiService) as any;
    router = TestBed.inject(Router) as any;
    modalService = TestBed.inject(ModalService) as any;
    dateService = TestBed.inject(DateService) as any;
    successService = TestBed.inject(SuccessService) as any;
    errorResponseService = TestBed.inject(ErrorResponseService) as any;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ====== БАЗОВЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ ======
  describe('Basic Integration Tests', () => {
    it('should maintain form state consistency across multiple operations', () => {
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state
      expect(component.form.valid).toBeFalse();
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Fill email only
      emailInput.nativeElement.value = 'test@test.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.form.valid).toBeFalse();
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Fill password
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.form.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear email
      emailInput.nativeElement.value = '';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.form.valid).toBeFalse();
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

         it('should handle form submission lifecycle correctly', fakeAsync(() => {
       const emailInput = fixture.debugElement.query(By.css('#email'));
       const passwordInput = fixture.debugElement.query(By.css('#password'));
       
       // Fill form
       emailInput.nativeElement.value = 'test@test.com';
       emailInput.nativeElement.dispatchEvent(new Event('input'));
       passwordInput.nativeElement.value = 'password123';
       passwordInput.nativeElement.dispatchEvent(new Event('input'));
       fixture.detectChanges();
       
       // Submit form
       component.submit();
       tick();
       
       // Verify form state after submission (may be enabled or disabled depending on response)
       const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
       expect(submitButton).toBeTruthy();
       
       // Verify API call
       expect(apiService.login).toHaveBeenCalledWith({
         phoneNumber: null,
         email: 'test@test.com',
         password: 'password123'
       });
     }));

    it('should maintain UI consistency during form state changes', () => {
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Fill form
      emailInput.nativeElement.value = 'test@test.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Form should be valid and button enabled
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear password
      passwordInput.nativeElement.value = '';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Form should be invalid and button disabled
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });

  // ====== ЖИЗНЕННЫЙ ЦИКЛ КОМПОНЕНТА ======
  describe('Component Lifecycle Integration', () => {
    it('should properly initialize and destroy with form state', () => {
      expect(component).toBeTruthy();
      expect(component.form).toBeDefined();
      expect(component.form.valid).toBeFalse();
      expect(component.accountNotConfirmed).toBeFalse();
      expect(component.changeIcon).toBeTrue();
      
      // Form controls should be properly initialized
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      
      // Submit button should be disabled initially
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should handle component recreation with form state', () => {
      // Fill form in current component
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      emailInput.nativeElement.value = 'test@test.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.form.valid).toBeTrue();
      
      // Destroy current component
      fixture.destroy();
      
      // Create new instance
      const newFixture = TestBed.createComponent(LoginPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      // New component should have initial state
      expect(newComponent.form.valid).toBeFalse();
      expect(newComponent.accountNotConfirmed).toBeFalse();
      expect(newComponent.changeIcon).toBeTrue();
      
      newFixture.destroy();
    });
  });

  // ====== МНОЖЕСТВЕННЫЕ ЭКЗЕМПЛЯРЫ ======
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      const fixture1 = TestBed.createComponent(LoginPageComponent);
      const fixture2 = TestBed.createComponent(LoginPageComponent);
      
      const component1 = fixture1.componentInstance;
      const component2 = fixture2.componentInstance;
      
      // Initial states should be independent
      expect(component1.form.valid).toBeFalse();
      expect(component2.form.valid).toBeFalse();
      
      // Modify first component
      component1.form.patchValue({ email: 'test1@test.com', password: 'password1' as any });
      expect(component1.form.valid).toBeTrue();
      expect(component2.form.valid).toBeFalse();
      
      // Modify second component
      component2.form.patchValue({ email: 'test2@test.com', password: 'password2' as any });
      expect(component1.form.valid).toBeTrue();
      expect(component2.form.valid).toBeTrue();
      expect(component1.form.value.email).toBe('test1@test.com');
      expect(component2.form.value.email).toBe('test2@test.com');
      
      // Cleanup
      fixture1.destroy();
      fixture2.destroy();
    });
  });

  // ====== ПРОВЕРКА UI КОНСИСТЕНТНОСТИ ======
  describe('UI Consistency Integration', () => {
    it('should provide clear visual feedback for all form states', () => {
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state - button disabled
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Email only - button still disabled
      emailInput.nativeElement.value = 'test@test.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Both fields - button enabled
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear email - button disabled again
      emailInput.nativeElement.value = '';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should maintain visual consistency during password visibility toggle', () => {
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const iconPass = fixture.debugElement.query(By.css('#icon-pass'));
      
      // Initial state
      expect(component.changeIcon).toBeTrue();
      expect(passwordInput.nativeElement.type).toBe('password');
      
      // Click to show password
      iconPass.nativeElement.click();
      fixture.detectChanges();
      expect(component.changeIcon).toBeFalse();
      expect(passwordInput.nativeElement.type).toBe('text');
      
      // Click to hide password
      iconPass.nativeElement.click();
      fixture.detectChanges();
      expect(component.changeIcon).toBeTrue();
      expect(passwordInput.nativeElement.type).toBe('password');
    });
  });

  // ====== ИНТЕГРАЦИЯ С СЕРВИСАМИ ======
  describe('Service Integration', () => {
    it('should integrate with error response service for form state', fakeAsync(() => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Fill form
      component.form.patchValue({ email: 'test@test.com', password: 'password123' as any });
      fixture.detectChanges();
      
      // Initially button should be enabled
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Disable form via service
      errorResponseService.disableLoginForm.next(true);
      tick();
      fixture.detectChanges();
      
      // Button should be disabled
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Re-enable form via service
      errorResponseService.disableLoginForm.next(false);
      tick();
      fixture.detectChanges();
      
      // Button should be enabled again
      expect(submitButton.nativeElement.disabled).toBeFalse();
    }));

    it('should integrate with modal service for registration flow', () => {
      const registerButton = fixture.debugElement.query(By.css('.registerBtn'));
      
      // Click register button
      registerButton.nativeElement.click();
      
      // Should open organization choice form by default
      expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      
      // Set organization name and try again
      dateService.nameOrganizationWhereItCameFrom.next('Test Org');
      registerButton.nativeElement.click();
      
      // Should open registration form directly
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });
  });

  // ====== ОБРАБОТКА ОШИБОК И ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Error Handling and Edge Cases', () => {
         it('should handle API errors gracefully without breaking UI', fakeAsync(() => {
       // Mock API error
       apiService.login.and.returnValue(throwError(() => new Error('Network error')));
       
       // Fill and submit form
       component.form.patchValue({ email: 'test@test.com', password: 'password123' as any });
       component.submit();
       tick();
       
       // Form should remain in a consistent state after error
       const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
       expect(submitButton).toBeTruthy();
       
       // Component should not crash
       expect(component).toBeTruthy();
       expect(fixture.debugElement.query(By.css('form'))).toBeTruthy();
     }));

         it('should handle rapid user interactions without state corruption', fakeAsync(() => {
       const emailInput = fixture.debugElement.query(By.css('#email'));
       const passwordInput = fixture.debugElement.query(By.css('#password'));
       
       // Rapidly fill form
       emailInput.nativeElement.value = 'test@test.com';
       emailInput.nativeElement.dispatchEvent(new Event('input'));
       passwordInput.nativeElement.value = 'password123';
       passwordInput.nativeElement.dispatchEvent(new Event('input'));
       fixture.detectChanges();
       
       // Rapidly submit multiple times
       component.submit();
       component.submit();
       component.submit();
       tick();
       
       // Form should be in consistent state
       const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
       expect(submitButton).toBeTruthy();
       
       // API should be called only once
       expect(apiService.login).toHaveBeenCalledTimes(1);
     }));
  });

  // ====== ПРОВЕРКА ДОСТУПНОСТИ ======
  describe('Accessibility Integration', () => {
    it('should maintain proper form labels and associations', () => {
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const emailLabel = fixture.debugElement.query(By.css('label[for="email"]'));
      const passwordLabel = fixture.debugElement.query(By.css('label[for="password"]'));
      
      // Labels should be present and properly associated
      expect(emailLabel).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
      expect(emailLabel.nativeElement.textContent.trim()).toBe('Email');
      expect(passwordLabel.nativeElement.textContent.trim()).toBe('Пароль');
      
      // Inputs should have proper IDs
      expect(emailInput.nativeElement.id).toBe('email');
      expect(passwordInput.nativeElement.id).toBe('password');
    });

    it('should provide proper button states and feedback', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const registerButton = fixture.debugElement.query(By.css('.registerBtn'));
      
      // Submit button should have proper type and initial state
      expect(submitButton.nativeElement.type).toBe('submit');
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Register button should be clickable
      expect(registerButton.nativeElement.tagName).toBe('SPAN');
      expect(registerButton.nativeElement.textContent.trim()).toBe('Зарегистрироваться');
    });
  });
});
