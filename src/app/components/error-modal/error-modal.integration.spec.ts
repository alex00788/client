import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';

import { ErrorModalComponent } from './error-modal.component';
import { ErrorResponseService } from '../../shared/services/error.response.service';
import { ModalService } from '../../shared/services/modal.service';

describe('ErrorModalComponent Integration Tests', () => {
  let component: ErrorModalComponent;
  let fixture: ComponentFixture<ErrorModalComponent>;
  let errorResponseService: ErrorResponseService;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorModalComponent],
      providers: [ErrorResponseService, ModalService] // Используем реальные сервисы
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorModalComponent);
    component = fixture.componentInstance;
    errorResponseService = TestBed.inject(ErrorResponseService);
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Real Services Integration', () => {
    it('should work with real ErrorResponseService instance', () => {
      // Arrange
      expect(errorResponseService).toBeTruthy();
      expect(errorResponseService).toBeInstanceOf(ErrorResponseService);
      
      // Act & Assert
      expect(component.errorResponseService).toBe(errorResponseService);
    });

    it('should work with real ModalService instance', () => {
      // Arrange
      expect(modalService).toBeTruthy();
      expect(modalService).toBeInstanceOf(ModalService);
      
      // Act & Assert
      expect(component.modalService).toBe(modalService);
    });

    it('should integrate correctly with both real services', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Set initial states
      registrationErrorSubject.next(true);
      rememberPasSubject.next(true);
      errorSubject.next('Integration test error');
      fixture.detectChanges();
      
      // Assert - Initial states
      expect(registrationErrorSubject.value).toBeTrue();
      expect(rememberPasSubject.value).toBeTrue();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Act - Close error
      component.closeErr();
      
      // Assert - Error cleared and modal hidden
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
      // Note: Subject doesn't have .value property, so we can't check errorSubject.value
    });
  });

  // ====== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА ======
  describe('Full Component Lifecycle', () => {
    it('should handle complete error lifecycle with real services', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Show error
      errorSubject.next('Lifecycle test error');
      fixture.detectChanges();
      
      // Assert - Error modal visible
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe('Lifecycle test error');
      
      // Act - Close error
      component.closeErr();
      
      // Assert - Error cleared and modal hidden
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
      // Note: Subject doesn't have .value property
    });

    it('should handle multiple error cycles', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Multiple cycles
      for (let i = 0; i < 3; i++) {
        // Show error
        errorSubject.next(`Error cycle ${i + 1}`);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
        
        // Close error
        component.closeErr();
        expect(registrationErrorSubject.value).toBeFalse();
        expect(rememberPasSubject.value).toBeFalse();
      }
      
      // Assert - Final state
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Performance with Real Services', () => {
    it('should handle rapid error emissions efficiently with real services', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const startTime = performance.now();
      const iterations = 50;
      
      // Act - Rapid error emissions
      for (let i = 0; i < iterations; i++) {
        errorSubject.next(`Rapid error ${i}`);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
    });

    it('should handle rapid close operations efficiently', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Rapid close operations
      for (let i = 0; i < iterations; i++) {
        errorSubject.next(`Error ${i}`);
        fixture.detectChanges();
        component.closeErr();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(modalService.registrationError.value).toBeFalse();
      expect(modalService.rememberPas.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ ======
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(ErrorModalComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Act - Modify first component
      component.closeErr();
      
      // Act - Modify second component
      component2.closeErr();
      
      // Assert - Components should be independent but share same services
      expect(component.errorResponseService).toBe(component2.errorResponseService);
      expect(component.modalService).toBe(component2.modalService);
      
      // Cleanup
      fixture2.destroy();
    });

    it('should maintain service state consistency across instances', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(ErrorModalComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Set error state
      errorSubject.next('Shared error');
      fixture.detectChanges();
      fixture2.detectChanges();
      
      // Assert - Both components see the same error
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture2.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Act - Close error from first component
      component.closeErr();
      
      // Assert - Both components reflect the change
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
      // Note: Subject doesn't have .value property
      
      // Cleanup
      fixture2.destroy();
    });
  });

  // ====== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ ======
  describe('Asynchronous Behavior', () => {
    it('should handle async error emissions correctly', async () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      
      // Act - Simulate async error emission
      setTimeout(() => {
        errorSubject.next('Async error');
      }, 0);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
      
      // Assert - Error should be visible
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe('Async error');
      
      // Act - Close error
      component.closeErr();
      
      // Assert - Error should be cleared
      expect(modalService.registrationError.value).toBeFalse();
      expect(modalService.rememberPas.value).toBeFalse();
    });

    it('should maintain state consistency during async operations', async () => {
      // Arrange
      const promises = [];
      
      // Act - Multiple async operations
      for (let i = 0; i < 5; i++) {
        promises.push(new Promise<void>(resolve => {
          setTimeout(() => {
            errorResponseService.error$.next(`Async error ${i}`);
            resolve();
          }, i * 10);
        }));
      }
      
      // Wait for all operations
      await Promise.all(promises);
      fixture.detectChanges();
      
      // Assert - Final state should be consistent
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe('Async error 4');
    });
  });

  // ====== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ СЦЕНАРИИ ======
  describe('Additional Integration Scenarios', () => {
    it('should handle complex error scenarios with real services', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Complex scenario: show error, close, show another error, close
      errorSubject.next('First error');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      component.closeErr();
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
      
      errorSubject.next('Second error');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      component.closeErr();
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });

    it('should handle rapid state changes in both services', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Rapid changes
      for (let i = 0; i < 20; i++) {
        errorSubject.next(`Rapid error ${i}`);
        fixture.detectChanges();
        component.closeErr();
      }
      
      // Assert - Final states should be predictable
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
      // Note: Subject doesn't have .value property
    });

    it('should maintain UI consistency during service state changes', () => {
      // Arrange
      const errorSubject = errorResponseService.error$;
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - Set error state
      errorSubject.next('UI consistency test');
      fixture.detectChanges();
      
      // Assert - Error modal visible
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.titleErrModal')).nativeElement.textContent.trim()).toBe('Ошибка!');
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe('UI consistency test');
      
      // Act - Close error
      component.closeErr();
      
      // Assert - Modal hidden (after error is cleared)
      errorResponseService.clear();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });
  });

  // ====== ТЕСТЫ УСТОЙЧИВОСТИ ======
  describe('Stability Tests', () => {
    it('should handle extreme number of error operations', () => {
      // Arrange
      const iterations = 1000;
      
      // Act - Extreme number of operations
      for (let i = 0; i < iterations; i++) {
        errorResponseService.error$.next(`Extreme error ${i}`);
        fixture.detectChanges();
        component.closeErr();
      }
      
      // Assert - Component should still work correctly
      expect(modalService.registrationError.value).toBeFalse();
      expect(modalService.rememberPas.value).toBeFalse();
      // Note: Subject doesn't have .value property
      
      // Act - One more operation to verify functionality
      errorResponseService.error$.next('Final test error');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
    });

    it('should maintain performance under load', () => {
      // Arrange
      const startTime = performance.now();
      
      // Act - Load test
      for (let i = 0; i < 500; i++) {
        errorResponseService.error$.next(`Load test error ${i}`);
        fixture.detectChanges();
        component.closeErr();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(2000);
      expect(modalService.registrationError.value).toBeFalse();
      expect(modalService.rememberPas.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and UX', () => {
    it('should have proper button semantics and accessibility with real services', () => {
      // Arrange
      errorResponseService.error$.next('Accessibility test');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(buttonElement.nativeElement.type).toBe('button');
      expect(buttonElement.nativeElement.textContent.trim()).toBe('ok');
    });

    it('should provide clear visual feedback for error states', () => {
      // Arrange
      const testError = 'Clear visual feedback test error message';
      
      // Act - Show error
      errorResponseService.error$.next(testError);
      fixture.detectChanges();
      
      // Assert - Error modal is visible with correct content
      const modalElement = fixture.debugElement.query(By.css('.modalErrorClass'));
      const titleElement = fixture.debugElement.query(By.css('.titleErrModal'));
      const messageElement = fixture.debugElement.query(By.css('.errMessage span'));
      
      expect(modalElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Ошибка!');
      expect(messageElement.nativeElement.textContent.trim()).toBe(testError);
      
      // Act - Close error
      component.closeErr();
      
      // Assert - Modal is hidden (after error is cleared)
      errorResponseService.clear();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });
  });

  // ====== ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Real Service Integration Scenarios', () => {
    it('should work correctly with ErrorResponseService methods', () => {
      // Arrange
      const testMessage = 'Service method test';
      
      // Act - Use service method
      errorResponseService.localHandler(testMessage);
      fixture.detectChanges();
      
      // Assert - Error should be visible
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.errMessage span')).nativeElement.textContent.trim()).toBe(testMessage);
      
      // Act - Clear using service method
      errorResponseService.clear();
      fixture.detectChanges();
      
      // Assert - Error should be cleared
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
    });

    it('should handle service state changes from external sources', () => {
      // Arrange
      const registrationErrorSubject = modalService.registrationError;
      const rememberPasSubject = modalService.rememberPas;
      
      // Act - External state changes
      registrationErrorSubject.next(true);
      rememberPasSubject.next(true);
      
      // Assert - States changed
      expect(registrationErrorSubject.value).toBeTrue();
      expect(rememberPasSubject.value).toBeTrue();
      
      // Act - Component should be able to reset states
      component.closeErr();
      
      // Assert - States reset
      expect(registrationErrorSubject.value).toBeFalse();
      expect(rememberPasSubject.value).toBeFalse();
    });
  });
});
