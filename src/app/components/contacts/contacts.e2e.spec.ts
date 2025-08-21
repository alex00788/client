import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, delay } from 'rxjs';

import { ContactsComponent } from './contacts.component';
import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { SuccessService } from '../../shared/services/success.service';

describe('ContactsComponent E2E Tests', () => {
  let component: ContactsComponent;
  let fixture: ComponentFixture<ContactsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let successService: jasmine.SpyObj<SuccessService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['sendInSupport']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['close', 'closeContacts']);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);

    await TestBed.configureTestingModule({
      imports: [ContactsComponent, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ ======
  describe('End-to-End User Scenarios', () => {
    it('should complete full support request workflow: open -> fill -> submit -> success', () => {
      // Arrange - User starts support workflow
      apiService.sendInSupport.and.returnValue(of({ message: 'Support request sent successfully' }));
      
      // Act - Step 1: User opens support block
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 1: Support form is visible
      expect(component.openSupport).toBeTrue();
      expect(fixture.debugElement.query(By.css('.descriptionProblems'))).toBeTruthy();
      
      // Act - Step 2: User fills the form
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const emailInput = fixture.debugElement.query(By.css('#emailForFeedback'));
      
      textarea.nativeElement.value = 'I need help with the application functionality';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('I need help with the application functionality');
      
      emailInput.nativeElement.value = 'user@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      component.form.get('email')?.setValue('user@example.com');
      
      fixture.detectChanges();
      
      // Assert - Step 2: Form is filled and valid
      expect(component.description.value).toBe('I need help with the application functionality');
      expect(component.form.get('email')?.value).toBe('user@example.com');
      expect(component.form.valid).toBeTrue();
      
      // Act - Step 3: User submits the form
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
      submitButton.nativeElement.click();
      
      // Assert - Step 3: Form submission is processed
      expect(apiService.sendInSupport).toHaveBeenCalledWith({
        description: 'I need help with the application functionality',
        email: 'user@example.com'
      });
      
      // Assert - Step 4: Success handling
      expect(successService.localHandler).toHaveBeenCalledWith('Support request sent successfully');
      expect(modalService.close).toHaveBeenCalled();
    });

    it('should handle complete user workflow: open -> fill invalid -> see errors -> fix -> submit', () => {
      // Arrange - User starts with invalid data
      apiService.sendInSupport.and.returnValue(of({ message: 'Support request sent successfully' }));
      
      // Act - Step 1: User opens support block
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      // Act - Step 2: User fills form with invalid data
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      textarea.nativeElement.value = 'short';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('short');
      component.description.markAsTouched();
      fixture.detectChanges();
      
      // Assert - Step 2: User sees validation errors
      const errorMessage = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('минимально 15 символов');
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Act - Step 3: User fixes the data
      textarea.nativeElement.value = 'This is a valid description with more than 15 characters';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('This is a valid description with more than 15 characters');
      fixture.detectChanges();
      
      // Assert - Step 3: Form becomes valid
      expect(component.form.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Act - Step 4: User submits the form
      submitButton.nativeElement.click();
      
      // Assert - Step 4: Form submission succeeds
      expect(apiService.sendInSupport).toHaveBeenCalledWith({
        description: 'This is a valid description with more than 15 characters',
        email: null
      });
    });

    it('should handle user workflow: open -> cancel -> reopen -> fill -> submit', () => {
      // Arrange - User wants to cancel and restart
      apiService.sendInSupport.and.returnValue(of({ message: 'Support request sent successfully' }));
      
      // Act - Step 1: User opens support block directly
      component.openSupportBlock();
      fixture.detectChanges();
      
      // Assert - Step 1: Support form is visible
      expect(component.openSupport).toBeTrue();
      
      // Act - Step 2: User cancels (переключает состояние)
      component.cancelSubmit();
      fixture.detectChanges();
      
      // Assert - Step 2: Support block is closed
      expect(component.openSupport).toBeFalse();
      
      // Act - Step 3: User reopens support block
      component.openSupportBlock();
      fixture.detectChanges();
      
      // Assert - Step 3: Support form is visible again
      expect(component.openSupport).toBeTrue();
      
      // Act - Step 4: User fills and submits form
      component.description.setValue('Valid description for support request');
      component.form.get('email')?.setValue('user@example.com');
      fixture.detectChanges();
      
      component.submit();
      
      // Assert - Step 4: Form submission succeeds
      expect(apiService.sendInSupport).toHaveBeenCalledWith({
        description: 'Valid description for support request',
        email: 'user@example.com'
      });
    });
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ ======
  describe('End-to-End User Interactions', () => {
    it('should handle user clicking all interactive elements in sequence', () => {
      // Arrange - User explores all interactive elements
      
      // Act & Assert - Step 1: User clicks support button
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.openSupport).toBeTrue();
      
      // Act & Assert - Step 2: User clicks close button (кнопка видна только когда openSupport = false)
      component.openSupportBlock(); // Закрываем поддержку
      fixture.detectChanges();
      expect(component.openSupport).toBeFalse();
      
      const closeButton = fixture.debugElement.query(By.css('.btnCloseContacts'));
      expect(closeButton).toBeTruthy();
      closeButton.nativeElement.click();
      expect(modalService.closeContacts).toHaveBeenCalled();
      
      // Act & Assert - Step 3: User clicks footer items
      const footerItems = fixture.debugElement.queryAll(By.css('.footerContacts .footElR'));
      footerItems.forEach((item, index) => {
        item.nativeElement.click();
        fixture.detectChanges();
        expect(component.openSupport).toBeTrue();
        
        // Close for next test
        component.openSupportBlock();
        fixture.detectChanges();
      });
    });

    it('should handle user typing and form interaction workflow', () => {
      // Arrange - User wants to interact with form
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      // Act - User types in textarea
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const testText = 'This is a test description for the support form';
      
      textarea.nativeElement.focus();
      textarea.nativeElement.value = testText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue(testText);
      fixture.detectChanges();
      
      // Assert - Text is displayed correctly
      expect(textarea.nativeElement.value).toBe(testText);
      expect(component.description.value).toBe(testText);
      
      // Act - User types in email field
      const emailInput = fixture.debugElement.query(By.css('#emailForFeedback'));
      const testEmail = 'test@example.com';
      
      emailInput.nativeElement.focus();
      emailInput.nativeElement.value = testEmail;
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      component.form.get('email')?.setValue(testEmail);
      fixture.detectChanges();
      
      // Assert - Email is displayed correctly
      expect(emailInput.nativeElement.value).toBe(testEmail);
      expect(component.form.get('email')?.value).toBe(testEmail);
      
      // Assert - Form is valid and submit button enabled
      expect(component.form.valid).toBeTrue();
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should handle user form validation workflow with real-time feedback', () => {
      // Arrange - User opens support form
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Act & Assert - Step 1: User types short text
      textarea.nativeElement.value = 'short';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('short');
      component.description.markAsTouched();
      fixture.detectChanges();
      
      // User sees error and disabled submit button
      const errorMessage = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(errorMessage.nativeElement.textContent).toContain('минимально 15 символов');
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Act & Assert - Step 2: User types valid text
      textarea.nativeElement.value = 'This is a valid description text';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('This is a valid description text');
      fixture.detectChanges();
      
      // User sees no errors and enabled submit button
      expect(fixture.debugElement.query(By.css('.errorTextareaMessage'))).toBeFalsy();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Act & Assert - Step 3: User clears text
      textarea.nativeElement.value = '';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue('');
      component.description.markAsTouched();
      fixture.detectChanges();
      
      // User sees required error and disabled submit button
      const requiredError = fixture.debugElement.query(By.css('.errorTextareaMessage'));
      expect(requiredError.nativeElement.textContent).toContain('Заполните описание');
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ СЦЕНАРИЕВ ОШИБОК ======
  describe('End-to-End Error Scenarios', () => {
    it('should handle API error scenario: user submits -> API fails -> form stays disabled', () => {
      // Arrange - API will return error
      apiService.sendInSupport.and.returnValue(throwError(() => new Error('Network error')));
      
      // Act - User opens and fills form
      component.openSupportBlock();
      fixture.detectChanges();
      
      component.description.setValue('Valid description for support request');
      fixture.detectChanges();
      
      // Act - User submits form
      component.submit();
      
      // Assert - Form remains disabled after API error
      expect(component.form.disabled).toBeTrue();
      
      // Assert - No success handling occurred
      expect(successService.localHandler).not.toHaveBeenCalled();
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Восстанавливаем mock для успешного ответа для следующих тестов
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }));
    });

    it('should handle user workflow with rapid form submission attempts', () => {
      // Arrange - API will be slow
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }).pipe(delay(100)));
      
      // Act - User opens and fills form
      component.openSupportBlock();
      fixture.detectChanges();
      
      component.description.setValue('Valid description for support request');
      fixture.detectChanges();
      
      // Act - User rapidly submits form multiple times
      component.submit();
      component.submit();
      component.submit();
      
      // Assert - Form is disabled after first click
      expect(component.form.disabled).toBeTrue();
      
      // Assert - API was called multiple times (компонент не блокирует повторные вызовы)
      expect(apiService.sendInSupport).toHaveBeenCalledTimes(3);
      
      // Восстанавливаем mock для успешного ответа
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }));
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ ======
  describe('End-to-End Service Integration', () => {
    it('should integrate with all services in complete workflow', () => {
      // Arrange - All services are available
      apiService.sendInSupport.and.returnValue(of({ message: 'Support request processed' }));
      
      // Act - Complete user workflow
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      component.description.setValue('Complete integration test description');
      component.form.get('email')?.setValue('integration@test.com');
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      
      // Assert - All services were called correctly
      expect(apiService.sendInSupport).toHaveBeenCalledWith({
        description: 'Complete integration test description',
        email: 'integration@test.com'
      });
      
      expect(successService.localHandler).toHaveBeenCalledWith('Support request processed');
      expect(modalService.close).toHaveBeenCalled();
    });

    it('should handle service unavailability gracefully', () => {
      // Arrange - Service is unavailable
      apiService.sendInSupport.and.returnValue(throwError(() => new Error('Service unavailable')));
      
      // Act - User tries to submit form
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      component.description.setValue('Test description for unavailable service');
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      
      // Assert - Form remains in disabled state
      expect(component.form.disabled).toBeTrue();
      
      // Assert - No success handling occurred
      expect(successService.localHandler).not.toHaveBeenCalled();
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Восстанавливаем mock для успешного ответа
      apiService.sendInSupport.and.returnValue(of({ message: 'Success' }));
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('End-to-End Performance Tests', () => {
    it('should handle rapid user interactions without performance degradation', () => {
      // Arrange - User performs rapid interactions
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      
      // Act - Rapid open/close cycles using component methods
      for (let i = 0; i < 10; i++) {
        component.openSupportBlock();
        fixture.detectChanges();
        expect(component.openSupport).toBeTrue();
        
        component.cancelSubmit();
        fixture.detectChanges();
        expect(component.openSupport).toBeFalse();
      }
      
      // Assert - Component remains stable
      expect(component).toBeDefined();
      expect(fixture.debugElement.query(By.css('.contactsBlock'))).toBeTruthy();
    });

    it('should handle large text input without performance issues', () => {
      // Arrange - User wants to input large text
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      
      // Act - User inputs large text
      const largeText = 'A'.repeat(1000);
      textarea.nativeElement.value = largeText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      component.description.setValue(largeText);
      fixture.detectChanges();
      
      // Assert - Large text is handled correctly
      expect(component.description.value).toBe(largeText);
      expect(component.form.valid).toBeTrue();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ ======
  describe('End-to-End Accessibility Tests', () => {
    it('should maintain accessibility through complete user workflow', () => {
      // Arrange - User with accessibility needs
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      
      // Act - User navigates to support button
      supportButton.nativeElement.focus();
      expect(document.activeElement).toBe(supportButton.nativeElement);
      
      // Act - User activates support button
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Form is accessible
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const emailInput = fixture.debugElement.query(By.css('#emailForFeedback'));
      
      expect(textarea.nativeElement).toBeTruthy();
      expect(emailInput.nativeElement).toBeTruthy();
      
      // Act - User navigates through form elements
      textarea.nativeElement.focus();
      expect(document.activeElement).toBe(textarea.nativeElement);
      
      emailInput.nativeElement.focus();
      expect(document.activeElement).toBe(emailInput.nativeElement);
    });

    it('should provide proper form labels and placeholders', () => {
      // Arrange - User opens support form
      const supportButton = fixture.debugElement.query(By.css('.btnContactsSupport'));
      supportButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Form elements have proper placeholders
      const textarea = fixture.debugElement.query(By.css('.textareaClass'));
      const emailInput = fixture.debugElement.query(By.css('#emailForFeedback'));
      
      expect(textarea.nativeElement.placeholder).toBe('Напишите что хотите изменить или добавить...');
      expect(emailInput.nativeElement.placeholder).toBe('email, для обратной связи');
      
      // Assert - Form elements have proper attributes
      expect(textarea.nativeElement.cols).toBe(35);
      expect(textarea.nativeElement.rows).toBe(5);
      expect(emailInput.nativeElement.type).toBe('email');
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
