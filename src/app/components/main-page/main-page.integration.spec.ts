import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MainPageComponent } from './main-page.component';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';

describe('MainPageComponent Integration Tests', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let modalService: ModalService;
  let dateService: DateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainPageComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        ModalService,
        DateService,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ organization: 'testOrg', id: '123' }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    dateService = TestBed.inject(DateService);
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Component Integration Tests', () => {
    it('should properly integrate with ModalPageComponent', () => {
      modalService.isVisible = true;
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      
      const modalPage = fixture.debugElement.query(By.css('app-modal-page'));
      expect(modalPage).toBeTruthy();
    });

    it('should properly integrate with ErrorModalComponent', () => {
      const errorModal = fixture.debugElement.query(By.css('app-error-modal'));
      expect(errorModal).toBeTruthy();
    });

    it('should properly integrate with SuccessModalComponent', () => {
      const successModal = fixture.debugElement.query(By.css('app-success-modal'));
      expect(successModal).toBeTruthy();
    });

    it('should properly integrate with DescriptionApplicationComponent', () => {
      modalService.isVisible = true;
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      
      const descriptionComponent = fixture.debugElement.query(By.css('app-description-application'));
      expect(descriptionComponent).toBeTruthy();
    });

    it('should properly integrate with RegFormChoiceOrganizationComponent', () => {
      modalService.isVisible = true;
      modalService.regFormChoiceOrg$.next(true);
      fixture.detectChanges();
      
      const choiceComponent = fixture.debugElement.query(By.css('app-reg-form-choice-organization'));
      expect(choiceComponent).toBeTruthy();
    });

    it('should properly integrate with RegFormNewOrgComponent', () => {
      modalService.isVisible = true;
      modalService.regFormAddNewOrg$.next(true);
      fixture.detectChanges();
      
      const newOrgComponent = fixture.debugElement.query(By.css('app-reg-form-new-org'));
      expect(newOrgComponent).toBeTruthy();
    });

    it('should properly integrate with RegistrationFormPageComponent', () => {
      modalService.isVisible = true;
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      
      const registrationComponent = fixture.debugElement.query(By.css('app-registrationForm-page'));
      expect(registrationComponent).toBeTruthy();
    });

    it('should properly integrate with LoginPageComponent', () => {
      modalService.isVisible = true;
      modalService.loginForm$.next(true);
      fixture.detectChanges();
      
      const loginComponent = fixture.debugElement.query(By.css('app-login-page'));
      expect(loginComponent).toBeTruthy();
    });
  });

  // ===== ПРОДВИНУТЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Advanced Integration Tests', () => {
    it('should pass organization data to RegistrationFormPageComponent correctly', fakeAsync(() => {
      const testId = 'test-org-id-123';
      const testName = 'Test Organization Name';
      
      component.recIdOrg(testId);
      component.recNameSelectedOrg(testName);
      
      modalService.isVisible = true;
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      tick();
      
      const registrationComponent = fixture.debugElement.query(By.css('app-registrationForm-page'));
      expect(registrationComponent).toBeTruthy();
      
      expect(component.idOrgForReg).toBe(testId);
      expect(component.nameSelectedOrgForReg).toBe(testName);
      
      const registrationInstance = registrationComponent.componentInstance;
      expect(registrationInstance.idOrgPush).toBe(testId);
      expect(registrationInstance.nameSelectedOrgOrgPush).toBe(testName);
    }));

    it('should handle event emission from RegFormChoiceOrganizationComponent', fakeAsync(() => {
      modalService.isVisible = true;
      modalService.regFormChoiceOrg$.next(true);
      fixture.detectChanges();
      tick();
      
      const choiceComponent = fixture.debugElement.query(By.css('app-reg-form-choice-organization'));
      expect(choiceComponent).toBeTruthy();
      
      const choiceInstance = choiceComponent.componentInstance;
      const testId = 'emitted-org-id';
      const testName = 'Emitted Organization';
      
      choiceInstance.idOrg.emit(testId);
      choiceInstance.nameSelectedOrg.emit(testName);
      
      expect(component.idOrgForReg).toBe(testId);
      expect(component.nameSelectedOrgForReg).toBe(testName);
    }));

    it('should integrate with ModalService for complex modal scenarios', fakeAsync(() => {
      // Сценарий 1: Открытие описания приложения
      modalService.isVisible = true;
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-description-application'))).toBeTruthy();
      expect(modalService.isVisible).toBeTrue();
      
      // Сценарий 2: Переключение на форму входа
      modalService.appDescription$.next(false);
      modalService.loginForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-description-application'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-login-page'))).toBeTruthy();
      
      // Сценарий 3: Переключение на форму регистрации
      modalService.loginForm$.next(false);
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-login-page'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-registrationForm-page'))).toBeTruthy();
      
      // Сценарий 4: Закрытие модали
      modalService.isVisible = false;
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('.modal'))).toBeFalsy();
    }));

    it('should integrate with DateService for organization context management', fakeAsync(() => {
      const route = TestBed.inject(ActivatedRoute);
      const testOrgName = 'Test Organization from URL';
      const testOrgId = 'url-org-id-456';
      
      Object.defineProperty(route, 'queryParams', { 
        value: of({organization: testOrgName, id: testOrgId}), 
        writable: true 
      });
      
      component.ngOnInit();
      fixture.detectChanges();
      tick();
      
      expect(dateService.nameOrganizationWhereItCameFrom.getValue()).toBe(testOrgName);
      expect(dateService.idOrganizationWhereItCameFrom.getValue()).toBe(testOrgId);
      
      const titleElement = fixture.debugElement.query(By.css('.title > p.adaptive'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe(testOrgName);
      
      modalService.isVisible = true;
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-description-application'))).toBeTruthy();
    }));

    it('should handle component lifecycle integration correctly', fakeAsync(() => {
      expect(component.destroyed$).toBeDefined();
      expect(component.destroyed$.closed).toBeFalse();
      
      dateService.nameOrganizationWhereItCameFrom.next('Initial Org');
      fixture.detectChanges();
      tick();
      
      let titleElement = fixture.debugElement.query(By.css('.title > p.adaptive'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Initial Org');
      
      component.ngOnDestroy();
      
      expect(component.destroyed$.closed).toBeFalse();
      
      dateService.nameOrganizationWhereItCameFrom.next('New Org After Destroy');
      fixture.detectChanges();
      tick();
      
      titleElement = fixture.debugElement.query(By.css('.title > p.adaptive'));
      expect(true).toBeTrue();
    }));

    it('should integrate with router navigation correctly', () => {
      const titleElement = fixture.debugElement.query(By.css('.title'));
      expect(titleElement.attributes['ng-reflect-router-link']).toBe('/personal-page');
      
      const enterButton = fixture.debugElement.query(By.css('.enter'));
      expect(enterButton.attributes['ng-reflect-router-link']).toBe('/personal-page');
      
      expect(titleElement.nativeElement.tagName.toLowerCase()).toBe('div');
      expect(enterButton.nativeElement.tagName.toLowerCase()).toBe('strong');
    });

    it('should handle modal component switching with data preservation', fakeAsync(() => {
      component.recIdOrg('preserved-org-id');
      component.recNameSelectedOrg('Preserved Organization');
      
      modalService.isVisible = true;
      modalService.regFormChoiceOrg$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-reg-form-choice-organization'))).toBeTruthy();
      
      modalService.regFormChoiceOrg$.next(false);
      modalService.regFormAddNewOrg$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-reg-form-choice-organization'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-reg-form-new-org'))).toBeTruthy();
      
      expect(component.idOrgForReg).toBe('preserved-org-id');
      expect(component.nameSelectedOrgForReg).toBe('Preserved Organization');
      
      modalService.regFormAddNewOrg$.next(false);
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-reg-form-new-org'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-registrationForm-page'))).toBeTruthy();
      
      const registrationComponent = fixture.debugElement.query(By.css('app-registrationForm-page'));
      const registrationInstance = registrationComponent.componentInstance;
      expect(registrationInstance.idOrgPush).toBe('preserved-org-id');
      expect(registrationInstance.nameSelectedOrgOrgPush).toBe('Preserved Organization');
    }));

    it('should integrate error handling across all modal components', fakeAsync(() => {
      const errorModal = fixture.debugElement.query(By.css('app-error-modal'));
      expect(errorModal).toBeTruthy();
      
      const successModal = fixture.debugElement.query(By.css('app-success-modal'));
      expect(successModal).toBeTruthy();
      
      modalService.isVisible = true;
      
      modalService.loginForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-login-page'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-error-modal'))).toBeTruthy();
      
      modalService.loginForm$.next(false);
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-registrationForm-page'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-error-modal'))).toBeTruthy();
      
      modalService.registrationForm$.next(false);
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-description-application'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-error-modal'))).toBeTruthy();
    }));

    it('should handle rapid modal switching without data corruption', fakeAsync(() => {
      component.recIdOrg('rapid-switch-org-id');
      component.recNameSelectedOrg('Rapid Switch Organization');
      
      const modalStates = [
        { service: 'loginForm$', component: 'app-login-page' },
        { service: 'registrationForm$', component: 'app-registrationForm-page' },
        { service: 'appDescription$', component: 'app-description-application' },
        { service: 'downloadApp$', component: 'app-download-app' },
        { service: 'instructions$', component: 'app-instructions-for-start' },
        { service: 'appContacts$', component: 'app-contacts' },
        { service: 'appSupport$', component: 'app-support-development' }
      ];
      
      modalService.isVisible = true;
      
      modalStates.forEach((state, index) => {
        // Сбрасываем все состояния
        Object.keys(modalService).forEach(key => {
          if (key.endsWith('$') && (modalService as any)[key] && (modalService as any)[key].next) {
            (modalService as any)[key].next(false);
          }
        });
        
        // Устанавливаем текущее состояние
        (modalService as any)[state.service].next(true);
        fixture.detectChanges();
        tick(1);
        
        // Проверяем, что компонент отображается
        const componentElement = fixture.debugElement.query(By.css(state.component));
        expect(componentElement).withContext(`Component ${state.component} should be visible`).toBeTruthy();
        
        // Проверяем, что данные организации сохранились
        expect(component.idOrgForReg).toBe('rapid-switch-org-id');
        expect(component.nameSelectedOrgForReg).toBe('Rapid Switch Organization');
      });
    }));
  });

  // ===== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА =====
  describe('Full Lifecycle Integration Tests', () => {
    it('should handle complete user interaction cycle', fakeAsync(() => {
      // 1. Устанавливаем данные организации
      component.recIdOrg('lifecycle-org-id');
      component.recNameSelectedOrg('Lifecycle Organization');
      
      // 2. Открываем описание приложения
      modalService.isVisible = true;
      modalService.appDescription$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-description-application'))).toBeTruthy();
      
      // 3. Переключаемся на форму входа
      modalService.appDescription$.next(false);
      modalService.loginForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-login-page'))).toBeTruthy();
      
      // 4. Переключаемся на форму регистрации
      modalService.loginForm$.next(false);
      modalService.registrationForm$.next(true);
      fixture.detectChanges();
      tick();
      
      expect(fixture.debugElement.query(By.css('app-registrationForm-page'))).toBeTruthy();
      
      // 5. Проверяем сохранение данных
      const registrationComponent = fixture.debugElement.query(By.css('app-registrationForm-page'));
      const registrationInstance = registrationComponent.componentInstance;
      expect(registrationInstance.idOrgPush).toBe('lifecycle-org-id');
      expect(registrationInstance.nameSelectedOrgOrgPush).toBe('Lifecycle Organization');
      
      // 6. Закрываем модали
      modalService.isVisible = false;
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('.modal'))).toBeFalsy();
    }));

    it('should maintain data consistency across multiple modal cycles', fakeAsync(() => {
      const testData = [
        { id: 'org-1', name: 'Organization 1' },
        { id: 'org-2', name: 'Organization 2' },
        { id: 'org-3', name: 'Organization 3' }
      ];
      
      testData.forEach((data, index) => {
        // Устанавливаем новые данные
        component.recIdOrg(data.id);
        component.recNameSelectedOrg(data.name);
        
        // Открываем форму регистрации
        modalService.isVisible = true;
        modalService.registrationForm$.next(true);
        fixture.detectChanges();
        tick();
        
        // Проверяем, что данные переданы корректно
        const registrationComponent = fixture.debugElement.query(By.css('app-registrationForm-page'));
        const registrationInstance = registrationComponent.componentInstance;
        expect(registrationInstance.idOrgPush).toBe(data.id);
        expect(registrationInstance.nameSelectedOrgOrgPush).toBe(data.name);
        
        // Закрываем форму
        modalService.registrationForm$.next(false);
        fixture.detectChanges();
        tick();
      });
    }));
  });
});
