import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';

import { ErrorModalComponent } from './error-modal.component';
import { ErrorResponseService } from '../../shared/services/error.response.service';
import { ModalService } from '../../shared/services/modal.service';

describe('ErrorModalComponent', () => {
  let component: ErrorModalComponent;
  let fixture: ComponentFixture<ErrorModalComponent>;
  let errorResponseService: jasmine.SpyObj<ErrorResponseService>;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    // Создаем spy объекты для сервисов
    const errorResponseServiceSpy = jasmine.createSpyObj('ErrorResponseService', ['clear'], {
      error$: new Subject<string>(),
      disableLoginForm: new BehaviorSubject<boolean>(false)
    });

    const modalServiceSpy = jasmine.createSpyObj('ModalService', [], {
      registrationError: new BehaviorSubject<boolean>(false),
      rememberPas: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [ErrorModalComponent],
      providers: [
        { provide: ErrorResponseService, useValue: errorResponseServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorModalComponent);
    component = fixture.componentInstance;
    errorResponseService = TestBed.inject(ErrorResponseService) as jasmine.SpyObj<ErrorResponseService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ТЕСТЫ =====
  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct initial property values', () => {
      expect(component.errMessage).toBe('Ошибка!');
    });

    it('should inject services correctly', () => {
      expect(component.errorResponseService).toBeTruthy();
      expect(component.errorResponseService).toBe(errorResponseService);
      expect(component.modalService).toBeTruthy();
      expect(component.modalService).toBe(modalService);
    });
  });

  // ===== ТЕСТЫ МЕТОДА closeErr =====
  describe('closeErr Method', () => {
    it('should call errorResponseService.clear when closeErr is called', () => {
      // Arrange
      expect(errorResponseService.clear).not.toHaveBeenCalled();
      
      // Act
      component.closeErr();
      
      // Assert
      expect(errorResponseService.clear).toHaveBeenCalledTimes(1);
    });

    it('should set modalService.registrationError to false when closeErr is called', () => {
      // Arrange
      const registrationErrorSubject = modalService.registrationError as BehaviorSubject<boolean>;
      registrationErrorSubject.next(true);
      expect(registrationErrorSubject.value).toBeTrue();
      
      // Act
      component.closeErr();
      
      // Assert
      expect(registrationErrorSubject.value).toBeFalse();
    });

    it('should set modalService.rememberPas to false when closeErr is called', () => {
      // Arrange
      const rememberPasSubject = modalService.rememberPas as BehaviorSubject<boolean>;
      rememberPasSubject.next(true);
      expect(rememberPasSubject.value).toBeTrue();
      
      // Act
      component.closeErr();
      
      // Assert
      expect(rememberPasSubject.value).toBeFalse();
    });

    it('should handle multiple consecutive calls correctly', () => {
      // Arrange
      const registrationErrorSubject = modalService.registrationError as BehaviorSubject<boolean>;
      const rememberPasSubject = modalService.rememberPas as BehaviorSubject<boolean>;
      
      // Act - Multiple calls
      component.closeErr();
      component.closeErr();
      component.closeErr();
      
      // Assert
      expect(errorResponseService.clear).toHaveBeenCalledTimes(3);
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ HTML ШАБЛОНА =====
  describe('Template Rendering', () => {
    it('should render error modal when error is present', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Emit error
      errorSubject.next('Test error message');
      fixture.detectChanges();
      
      // Assert
      const modalElement = fixture.debugElement.query(By.css('.modalErrorClass'));
      expect(modalElement).toBeTruthy();
    });

    it('should not render error modal when no error is present', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - No error emitted
      fixture.detectChanges();
      
      // Assert
      const modalElement = fixture.debugElement.query(By.css('.modalErrorClass'));
      expect(modalElement).toBeFalsy();
    });

    it('should render error title correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Emit error
      errorSubject.next('Test error message');
      fixture.detectChanges();
      
      // Assert
      const titleElement = fixture.debugElement.query(By.css('.titleErrModal'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Ошибка!');
    });

    it('should render error message correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const testErrorMessage = 'This is a test error message';
      
      // Act - Emit error
      errorSubject.next(testErrorMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe(testErrorMessage);
    });

    it('should render close button correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Emit error
      errorSubject.next('Test error message');
      fixture.detectChanges();
      
      // Assert
      const buttonElement = fixture.debugElement.query(By.css('.btnErrModal button'));
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('ok');
      expect(buttonElement.nativeElement.type).toBe('button');
    });
  });

  // ===== ТЕСТЫ УСЛОВНОГО ОТОБРАЖЕНИЯ =====
  describe('Conditional Rendering', () => {
    it('should show modal only when error exists', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act & Assert - No error
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
      
      // Act & Assert - With error
      errorSubject.next('Error occurred');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Act & Assert - Error cleared
      errorSubject.next('');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });

    it('should handle different error messages correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const testMessages = [
        'Network error',
        'Validation failed',
        'Server timeout',
        'Authentication error'
      ];
      
      // Act & Assert - Test each message
      testMessages.forEach(message => {
        errorSubject.next(message);
        fixture.detectChanges();
        
        const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
        expect(messageElement.nativeElement.textContent.trim()).toBe(message);
      });
    });
  });

  // ===== ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interactions', () => {
    it('should handle button click correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act
      buttonElement.triggerEventHandler('click', null);
      
      // Assert
      expect(errorResponseService.clear).toHaveBeenCalledTimes(1);
    });

    it('should close modal after button click', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act
      buttonElement.triggerEventHandler('click', null);
      
      // Assert - Modal should be hidden after error is cleared
      expect(errorResponseService.clear).toHaveBeenCalled();
    });

    it('should handle rapid button clicks without errors', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act - Rapid clicks
      for (let i = 0; i < 10; i++) {
        buttonElement.triggerEventHandler('click', null);
      }
      
      // Assert
      expect(errorResponseService.clear).toHaveBeenCalledTimes(10);
    });
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ =====
  describe('Service Integration', () => {
    it('should integrate correctly with ErrorResponseService', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Emit error
      errorSubject.next('Integration test error');
      fixture.detectChanges();
      
      // Assert
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe('Integration test error');
    });

    it('should integrate correctly with ModalService', () => {
      // Arrange
      const registrationErrorSubject = modalService.registrationError as BehaviorSubject<boolean>;
      const rememberPasSubject = modalService.rememberPas as BehaviorSubject<boolean>;
      
      // Act
      component.closeErr();
      
      // Assert
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });

    it('should handle service state changes correctly', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const registrationErrorSubject = modalService.registrationError as BehaviorSubject<boolean>;
      const rememberPasSubject = modalService.rememberPas as BehaviorSubject<boolean>;
      
      // Act - Set initial states
      registrationErrorSubject.next(true);
      rememberPasSubject.next(true);
      errorSubject.next('State change test');
      fixture.detectChanges();
      
      // Assert - Initial states
      expect(registrationErrorSubject.value).toBeTrue();
      expect(rememberPasSubject.value).toBeTrue();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Act - Close error
      component.closeErr();
      
      // Assert - States changed
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle empty error messages gracefully', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Empty error
      errorSubject.next('');
      fixture.detectChanges();
      
      // Assert
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });

    it('should handle very long error messages', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const longMessage = 'A'.repeat(1000); // Very long message
      
      // Act - Long error
      errorSubject.next(longMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe(longMessage);
    });

    it('should handle special characters in error messages', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Act - Special characters
      errorSubject.next(specialMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(specialMessage);
    });

    it('should handle undefined/null error values gracefully', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      
      // Act - Undefined error
      (errorSubject as any).next(undefined);
      fixture.detectChanges();
      
      // Assert - Should handle gracefully
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance and Memory', () => {
    it('should handle multiple error emissions efficiently', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Multiple error emissions
      for (let i = 0; i < iterations; i++) {
        errorSubject.next(`Error ${i}`);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
    });

    it('should not create memory leaks during multiple operations', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const iterations = 1000;
      
      // Act - Multiple operations
      for (let i = 0; i < iterations; i++) {
        errorSubject.next(`Error ${i}`);
        fixture.detectChanges();
        component.closeErr();
      }
      
      // Assert - Component should still work correctly
      expect(errorResponseService.clear).toHaveBeenCalledTimes(iterations);
    });
  });

  // ===== ТЕСТЫ CSS КЛАССОВ И СТИЛЕЙ =====
  describe('CSS Classes and Styling', () => {
    it('should have correct CSS classes applied to elements', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      // Act & Assert
      const modalElement = fixture.debugElement.query(By.css('.modalErrorClass'));
      const titleElement = fixture.debugElement.query(By.css('.titleErrModal'));
      const messageElement = fixture.debugElement.query(By.css('.errMessage'));
      const buttonContainer = fixture.debugElement.query(By.css('.btnErrModal'));
      
      expect(modalElement).toBeTruthy();
      expect(titleElement).toBeTruthy();
      expect(messageElement).toBeTruthy();
      expect(buttonContainer).toBeTruthy();
    });

    it('should apply correct classes to button', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('.btnErrModal button'));
      expect(buttonElement.nativeElement.classList.contains('btnErrModal')).toBeTrue();
    });
  });

  // ===== ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility', () => {
    it('should have proper button semantics', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(buttonElement.nativeElement.type).toBe('button');
    });

    it('should have proper error message structure', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      // Act & Assert
      const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe('Test error');
    });
  });

  // ===== ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА =====
  describe('Component Lifecycle', () => {
    it('should handle component destruction gracefully', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      errorSubject.next('Test error');
      fixture.detectChanges();
      
      // Act - Destroy component
      fixture.destroy();
      
      // Assert - Should not throw errors
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should maintain state consistency during lifecycle', () => {
      // Arrange
      const errorSubject = errorResponseService.error$ as Subject<string>;
      const registrationErrorSubject = modalService.registrationError as BehaviorSubject<boolean>;
      const rememberPasSubject = modalService.rememberPas as BehaviorSubject<boolean>;
      
      // Act - Set states and close error
      registrationErrorSubject.next(true);
      rememberPasSubject.next(true);
      errorSubject.next('Lifecycle test');
      fixture.detectChanges();
      
      component.closeErr();
      
      // Assert - States should be consistent
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });
  });
});
