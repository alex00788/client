import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ContactsComponent } from './contacts.component';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { SuccessService } from '../../shared/services/success.service';

describe('ContactsComponent Integration Tests', () => {
  let component: ContactsComponent;
  let fixture: ComponentFixture<ContactsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let successService: jasmine.SpyObj<SuccessService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['sendInSupport']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['close', 'closeContacts']);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);

    // Настраиваем mock для ApiService
    apiServiceSpy.sendInSupport.and.returnValue(of({ message: 'Success' }));

    await TestBed.configureTestingModule({
      imports: [
        ContactsComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    fixture.detectChanges();
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ANGLAR МОДУЛЯМИ ======
  describe('Angular Modules Integration', () => {
    it('should integrate with HttpClientTestingModule', () => {
      // Проверяем, что HttpClientTestingModule доступен
      const httpClient = TestBed.inject(HttpClientTestingModule);
      expect(httpClient).toBeDefined();
    });

    it('should integrate with ReactiveFormsModule', () => {
      // Проверяем, что ReactiveFormsModule доступен
      const reactiveForms = TestBed.inject(ReactiveFormsModule);
      expect(reactiveForms).toBeDefined();
    });

    it('should work with form controls integration', () => {
      expect(component.form).toBeDefined();
      expect(component.form.controls.description).toBeDefined();
      expect(component.form.controls.email).toBeDefined();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С DOM ======
  describe('DOM Integration Tests', () => {
    it('should integrate all HTML elements correctly', () => {
      const contactsBlock = fixture.debugElement.query(By.css('.contactsBlock'));
      expect(contactsBlock).toBeTruthy();

      // Проверяем интеграцию всех дочерних элементов
      const titleSection = contactsBlock.query(By.css('.titleContacts'));
      const footerSection = contactsBlock.query(By.css('.footerContacts'));

      expect(titleSection).toBeTruthy();
      expect(footerSection).toBeTruthy();
    });

    it('should maintain DOM structure integrity', () => {
      const contactsBlock = fixture.debugElement.query(By.css('.contactsBlock'));
      const children = contactsBlock.children;

      expect(children.length).toBeGreaterThanOrEqual(2);

      // Проверяем наличие основных секций
      expect(contactsBlock.query(By.css('.titleContacts'))).toBeTruthy();
      expect(contactsBlock.query(By.css('form'))).toBeTruthy();
      expect(contactsBlock.query(By.css('.footerContacts'))).toBeTruthy();
    });

    it('should integrate text content with DOM elements', () => {
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      const footerItems = fixture.debugElement.queryAll(By.css('.footerContacts .footEl'));

      expect(supportButton.nativeElement.textContent.trim()).toBe('написать в поддержку…');
      expect(footerItems.length).toBe(3);
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С CSS ======
  describe('CSS Integration Tests', () => {
    it('should integrate CSS classes with HTML elements', () => {
      const contactsBlock = fixture.debugElement.query(By.css('.contactsBlock'));
      const titleSection = fixture.debugElement.query(By.css('.titleContacts'));
      const footerSection = fixture.debugElement.query(By.css('.footerContacts'));

      expect(contactsBlock.nativeElement.classList.contains('contactsBlock')).toBeTrue();
      expect(titleSection.nativeElement.classList.contains('titleContacts')).toBeTrue();
      expect(footerSection.nativeElement.classList.contains('footerContacts')).toBeTrue();
    });

    it('should maintain CSS class consistency', () => {
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      const closeButton = fixture.debugElement.query(By.css('.btnCloseContacts'));

      expect(supportButton.nativeElement.classList.contains('btnContactsSupport')).toBeTrue();
      expect(closeButton.nativeElement.classList.contains('btnCloseContacts')).toBeTrue();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ФОРМАМИ ======
  describe('Form Integration Tests', () => {
    it('should integrate form controls with DOM elements', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const emailInput = fixture.debugElement.query(By.css('#emailForFeedback'));

      expect(textarea).toBeTruthy();
      expect(emailInput).toBeTruthy();
      
      // Проверяем, что элементы формы связаны с контролами
      expect(component.form.controls.description).toBeDefined();
      expect(component.form.controls.email).toBeDefined();
    });

    it('should integrate form validation with UI feedback', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      const descriptionControl = component.description;
      descriptionControl.setValue('short');
      descriptionControl.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('минимально 15 символов');
    });

    it('should integrate form submission with button states', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();

      component.description.setValue('valid description text');
      fixture.detectChanges();

      expect(submitButton.nativeElement.disabled).toBeFalse();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С СЕРВИСАМИ ======
  describe('Services Integration Tests', () => {
    it('should integrate with ApiService for form submission', () => {
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }));

      component.openSupportBlock();
      component.description.setValue('valid description text');
      fixture.detectChanges();

      component.submit();

      expect(apiService.sendInSupport).toHaveBeenCalledWith({
        description: 'valid description text',
        email: null
      });
    });

    it('should integrate with ModalService for closing', () => {
      // Кнопка закрытия видна только когда openSupport = false
      expect(component.openSupport).toBeFalse();
      
      const closeButton = fixture.debugElement.query(By.css('.btnCloseContacts'));
      expect(closeButton).toBeTruthy();
      closeButton.nativeElement.click();

      expect(modalService.closeContacts).toHaveBeenCalled();
    });

    it('should integrate with SuccessService for success handling', () => {
      apiService.sendInSupport.and.returnValue(of({ message: 'Success message' }));

      component.openSupportBlock();
      component.description.setValue('valid description text');
      fixture.detectChanges();

      component.submit();

      expect(successService.localHandler).toHaveBeenCalledWith('Success message');
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С СОСТОЯНИЕМ ======
  describe('State Integration Tests', () => {
    it('should integrate component state with UI visibility', () => {
      // Начальное состояние - поддержка закрыта
      expect(component.openSupport).toBeFalse();
      let supportBlock = fixture.debugElement.query(By.css('.descriptionProblems'));
      expect(supportBlock).toBeFalsy();

      // Открываем поддержку
      component.openSupportBlock();
      fixture.detectChanges();
      expect(component.openSupport).toBeTrue();
      supportBlock = fixture.debugElement.query(By.css('.descriptionProblems'));
      expect(supportBlock).toBeTruthy();
    });

    it('should integrate form state with component behavior', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      // Форма включена
      expect(component.form.enabled).toBeTrue();

      // Отправляем форму
      component.description.setValue('valid description text');
      component.submit();

      // Форма должна быть заблокирована после отправки
      expect(component.form.disabled).toBeTrue();
      
      // Проверяем, что API был вызван
      expect(apiService.sendInSupport).toHaveBeenCalled();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ВАЛИДАЦИЕЙ ======
  describe('Validation Integration Tests', () => {
    it('should integrate validation rules with form behavior', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      const descriptionControl = component.description;
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));

      // Пустое описание - форма невалидна
      descriptionControl.setValue('');
      descriptionControl.markAsTouched();
      fixture.detectChanges();

      expect(submitButton.nativeElement.disabled).toBeTrue();

      // Короткое описание - форма невалидна
      descriptionControl.setValue('short');
      fixture.detectChanges();

      expect(submitButton.nativeElement.disabled).toBeTrue();

      // Валидное описание - форма валидна
      descriptionControl.setValue('valid description text');
      fixture.detectChanges();

      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should integrate validation messages with form state', () => {
      component.openSupportBlock();
      fixture.detectChanges();

      const descriptionControl = component.description;

      // Проверяем required ошибку
      descriptionControl.markAsTouched();
      fixture.detectChanges();

      let errorMessage = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(errorMessage.nativeElement.textContent).toContain('Заполните описание');

      // Проверяем minlength ошибку
      descriptionControl.setValue('short');
      fixture.detectChanges();

      errorMessage = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(errorMessage.nativeElement.textContent).toContain('минимально 15 символов');
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ОБРАБОТКОЙ ОШИБОК ======
  describe('Error Handling Integration Tests', () => {
    it('should integrate error handling with form state', () => {
      // Временно меняем mock для ошибки
      apiService.sendInSupport.and.returnValue(throwError(() => new Error('API Error')));

      component.openSupportBlock();
      component.description.setValue('valid description text');
      fixture.detectChanges();

      component.submit();

      // При ошибке форма остается заблокированной
      expect(component.form.disabled).toBeTrue();
      
      // Восстанавливаем mock для успешного ответа
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }));
    });

    it('should handle missing DOM elements gracefully', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ЖИЗНЕННЫМ ЦИКЛОМ ======
  describe('Lifecycle Integration Tests', () => {
    it('should integrate component lifecycle with services', () => {
      const destroyed$ = (component as any).destroyed$;
      expect(destroyed$).toBeDefined();

      // Проверяем, что destroyed$ это Subject
      expect(destroyed$.next).toBeDefined();
      expect(destroyed$.complete).toBeDefined();
    });

    it('should maintain stability through multiple change detection cycles', () => {
      for (let i = 0; i < 3; i++) {
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
      }
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С ВЗАИМОДЕЙСТВИЕМ ======
  describe('Interaction Integration Tests', () => {
    it('should integrate user interactions with component state', () => {
      // Клик по кнопке поддержки
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.openSupport).toBeTrue();

      // Клик по кнопке закрытия
      const closeButton = fixture.debugElement.query(By.css('button[type="button"]'));
      closeButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.openSupport).toBeFalse();
    });

    it('should integrate footer interactions with component behavior', () => {
      const footerItems = fixture.debugElement.queryAll(By.css('.footerContacts .footElR'));

      footerItems.forEach(item => {
        item.nativeElement.click();
        fixture.detectChanges();
        expect(component.openSupport).toBeTrue();

        // Закрываем для следующего теста
        component.openSupportBlock();
        fixture.detectChanges();
      });
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С СОВМЕСТИМОСТЬЮ ======
  describe('Compatibility Integration Tests', () => {
    it('should integrate with different testing environments', () => {
      expect(TestBed).toBeDefined();
      expect(fixture).toBeDefined();
      expect(component).toBeDefined();

      const contactsBlock = fixture.debugElement.query(By.css('.contactsBlock'));
      expect(contactsBlock).toBeTruthy();
    });

    it('should maintain compatibility through module changes', () => {
      expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
      expect(component.form).toBeDefined();
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАКТИВНОСТЬЮ ======
  describe('Reactivity Integration Tests', () => {
    it('should integrate change detection with DOM updates', () => {
      expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();

      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
    });

    it('should handle multiple change detection cycles', () => {
      for (let i = 0; i < 3; i++) {
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
      }
    });
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С МЕТАДАННЫМИ ======
  describe('Metadata Integration Tests', () => {
    it('should integrate component metadata correctly', () => {
      expect(component.constructor.name).toBe('ContactsComponent');
    });

    it('should maintain metadata through lifecycle', () => {
      expect(component.constructor.name).toBe('ContactsComponent');

      fixture.detectChanges();
      expect(component.constructor.name).toBe('ContactsComponent');
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
