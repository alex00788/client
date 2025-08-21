import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { LoginPageComponent } from './login-page.component';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { SuccessService } from '../../shared/services/success.service';
import { ErrorResponseService } from '../../shared/services/error.response.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginPageComponent E2E Tests', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let successService: jasmine.SpyObj<SuccessService>;
  let errorResponseService: jasmine.SpyObj<ErrorResponseService>;
  let dateService: jasmine.SpyObj<DateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'login', 'logout', 'resendLink', 'rememberPas'
    ]);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'close', 'openRegistrationForm', 'openRegFormChoiceOrganisation'
    ]);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);
    const errorResponseServiceSpy = jasmine.createSpyObj('ErrorResponseService', [
      'localHandler', 'clear'
    ]);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['setUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Настройка моков для BehaviorSubject
    dateServiceSpy.nameOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
    dateServiceSpy.idOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
    dateServiceSpy.pasForLink = new BehaviorSubject<string>('');
    dateServiceSpy.currentOrg = new BehaviorSubject<any>(null);
    errorResponseServiceSpy.disableLoginForm = new BehaviorSubject<boolean>(false);
    modalServiceSpy.rememberPas = new BehaviorSubject<boolean>(false);

    // Настройка возвращаемых значений для API
    apiServiceSpy.login.and.returnValue(of({
      user: { isActivated: true },
      accessToken: 'test-token',
      expiresIn: 3600
    }));
    apiServiceSpy.resendLink.and.returnValue(of({ message: 'Link sent successfully' }));
    apiServiceSpy.rememberPas.and.returnValue(of({ message: 'Password reminder sent' }));

    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy },
        { provide: ErrorResponseService, useValue: errorResponseServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    errorResponseService = TestBed.inject(ErrorResponseService) as jasmine.SpyObj<ErrorResponseService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ОСНОВНОЙ ФУНКЦИОНАЛЬНОСТИ ======
  describe('Basic E2E Functionality', () => {
    it('should create component and display login form', () => {
      expect(component).toBeTruthy();
      expect(component.title).toBe('Вход в личный кабинет');
      
      const form = fixture.debugElement.query(By.css('form'));
      const emailInput = fixture.debugElement.query(By.css('#email'));
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      expect(form).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });

    it('should have valid form when email and password are filled', () => {
      // Fill form
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      expect(component.form.valid).toBeTrue();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should have invalid form when required fields are empty', () => {
      component.form.patchValue({
        email: '',
        password: '' as any
      });
      
      expect(component.form.valid).toBeFalse();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should call login API on form submission', fakeAsync(() => {
      // Fill form
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      // Submit form
      component.submit();
      tick();
      
      expect(apiService.login).toHaveBeenCalledWith({
        phoneNumber: null,
        email: 'test@example.com',
        password: 'password123' as any
      });
    }));

    it('should navigate to personal page on successful login', fakeAsync(() => {
      // Fill form
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      // Submit form
      component.submit();
      tick();
      
      expect(router.navigate).toHaveBeenCalledWith(['personal-page']);
      expect(modalService.close).toHaveBeenCalled();
      expect(dateService.setUser).toHaveBeenCalled();
    }));

    it('should handle non-activated account', fakeAsync(() => {
      // Setup API to return non-activated user
      apiService.login.and.returnValue(of({ user: { isActivated: false } }));
      
      // Fill form
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      // Submit form
      component.submit();
      tick();
      
      expect(errorResponseService.localHandler).toHaveBeenCalledWith('активируйте аккаунт, пройдите по ссылке в почте...');
      expect(component.accountNotConfirmed).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(apiService.logout).toHaveBeenCalled();
    }));

    it('should toggle password visibility', () => {
      const passwordInput = fixture.debugElement.query(By.css('#password'));
      
      // Initial state - password hidden
      expect(component.changeIcon).toBeTrue();
      expect(passwordInput.nativeElement.getAttribute('type')).toBe('password');
      
      // Toggle to show password
      component.showOrHidePassword();
      fixture.detectChanges();
      
      expect(component.changeIcon).toBeFalse();
      expect(passwordInput.nativeElement.getAttribute('type')).toBe('text');
      
      // Toggle to hide password again
      component.showOrHidePassword();
      fixture.detectChanges();
      
      expect(component.changeIcon).toBeTrue();
      expect(passwordInput.nativeElement.getAttribute('type')).toBe('password');
    });

    it('should handle input trimming', () => {
      const mockEvent = { target: { value: ' test@example.com' } };
      component.clearTrim(mockEvent);
      
      // clearTrim should remove the first space
      expect(mockEvent.target.value).toBe('test@example.com');
    });

    it('should open registration form', () => {
      component.openRegistrationPage();
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle organization choice for registration', () => {
      // Without organization link
      component.openRegFormChoiceOrg();
      expect(modalService.openRegFormChoiceOrganisation).toHaveBeenCalled();
      
      // Reset spy
      modalService.openRegFormChoiceOrganisation.calls.reset();
      modalService.openRegistrationForm.calls.reset();
      
      // With organization link
      (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next('Test Org');
      component.openRegFormChoiceOrg();
      expect(modalService.openRegistrationForm).toHaveBeenCalled();
    });

    it('should handle resend link functionality', fakeAsync(() => {
      // Set up component state
      component.accountNotConfirmed = true;
      component.form.patchValue({ email: 'test@example.com' });
      (dateService.pasForLink as BehaviorSubject<string>).next('password123');
      
      component.resendLink();
      tick();
      
      expect(apiService.resendLink).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123' as any
      });
      expect(errorResponseService.clear).toHaveBeenCalled();
      expect(modalService.close).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('Link sent successfully');
      expect(component.accountNotConfirmed).toBeFalse();
    }));

    it('should handle remember password functionality', fakeAsync(() => {
      component.form.patchValue({ email: 'test@example.com' });
      
      component.rememberPas();
      tick();
      
      expect(apiService.rememberPas).toHaveBeenCalledWith('test@example.com');
      expect(successService.localHandler).toHaveBeenCalledWith('Password reminder sent');
    }));

    it('should disable form on submission', fakeAsync(() => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      component.submit();
      
      expect(component.form.disabled).toBeTrue();
      
      tick();
    }));

    it('should disable form and call login API', fakeAsync(() => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123' as any
      });
      
      component.submit();
      
      // Form should be disabled immediately
      expect(component.form.disabled).toBeTrue();
      expect(apiService.login).toHaveBeenCalled();
      
      tick();
    }));

    it('should clean up on destroy', () => {
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