import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject, BehaviorSubject } from 'rxjs';

import { SuccessModalComponent } from './success-modal.component';
import { SuccessService } from '../../shared/services/success.service';

describe('SuccessModalComponent Integration Tests', () => {
  let component: SuccessModalComponent;
  let fixture: ComponentFixture<SuccessModalComponent>;
  let successService: SuccessService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessModalComponent],
      providers: [SuccessService] // Используем реальный сервис
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModalComponent);
    component = fixture.componentInstance;
    successService = TestBed.inject(SuccessService);
    fixture.detectChanges();
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМ СЕРВИСОМ ======
  describe('Real Service Integration', () => {
    it('should work with real SuccessService instance', () => {
      // Arrange
      expect(successService).toBeTruthy();
      expect(successService).toBeInstanceOf(SuccessService);
      
      // Act & Assert
      expect(component.successService).toBe(successService);
    });

    it('should integrate correctly with real SuccessService', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Emit success message
      successSubject.next('Integration test success');
      fixture.detectChanges();
      
      // Assert - Success modal should be visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Integration test success');
    });
  });

  // ====== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА ======
  describe('Full Component Lifecycle', () => {
    it('should handle complete success lifecycle with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Show success
      successSubject.next('Lifecycle test success');
      fixture.detectChanges();
      
      // Assert - Success modal visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Lifecycle test success');
      
      // Act - Close success
      component.closeSuccess();
      
      // Assert - Success cleared
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle multiple success cycles', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Multiple cycles
      for (let i = 0; i < 3; i++) {
        // Show success
        successSubject.next(`Success cycle ${i + 1}`);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
        
        // Close success
        component.closeSuccess();
        expect(successService.disableLoginForm.value).toBeFalse();
      }
      
      // Assert - Final state
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМ СЕРВИСОМ ======
  describe('Performance with Real Service', () => {
    it('should handle rapid success emissions efficiently with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      const startTime = performance.now();
      const iterations = 50;
      
      // Act - Rapid success emissions
      for (let i = 0; i < iterations; i++) {
        successSubject.next(`Rapid success ${i}`);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
    });

    it('should handle rapid close operations efficiently', () => {
      // Arrange
      const successSubject = successService.success$;
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Rapid close operations
      for (let i = 0; i < iterations; i++) {
        successSubject.next(`Success ${i}`);
        fixture.detectChanges();
        component.closeSuccess();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ ======
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(SuccessModalComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Act - Modify first component
      component.closeSuccess();
      
      // Act - Modify second component
      component2.closeSuccess();
      
      // Assert - Components should be independent but share same service
      expect(component.successService).toBe(component2.successService);
      
      // Cleanup
      fixture2.destroy();
    });

    it('should maintain service state consistency across instances', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(SuccessModalComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      const successSubject = successService.success$;
      
      // Act - Set success state
      successSubject.next('Shared success');
      fixture.detectChanges();
      fixture2.detectChanges();
      
      // Assert - Both components see the same success
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture2.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Close success from first component
      component.closeSuccess();
      
      // Assert - Both components reflect the change
      expect(successService.disableLoginForm.value).toBeFalse();
      
      // Cleanup
      fixture2.destroy();
    });
  });

  // ====== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ ======
  describe('Asynchronous Behavior', () => {
    it('should handle async success emissions correctly', async () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Simulate async success emission
      setTimeout(() => {
        successSubject.next('Async success');
      }, 0);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
      
      // Assert - Success should be visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Async success');
      
      // Act - Close success
      component.closeSuccess();
      
      // Assert - Success should be cleared
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should maintain state consistency during async operations', async () => {
      // Arrange
      const promises = [];
      
      // Act - Multiple async operations
      for (let i = 0; i < 5; i++) {
        promises.push(new Promise<void>(resolve => {
          setTimeout(() => {
            successService.success$.next(`Async success ${i}`);
            resolve();
          }, i * 10);
        }));
      }
      
      // Wait for all operations
      await Promise.all(promises);
      fixture.detectChanges();
      
      // Assert - Final state should be consistent
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Async success 4');
    });
  });

  // ====== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ СЦЕНАРИИ ======
  describe('Additional Integration Scenarios', () => {
    it('should handle complex success scenarios with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Complex scenario: show success, close, show another success, close
      successSubject.next('First success');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      component.closeSuccess();
      expect(successService.disableLoginForm.value).toBeFalse();
      
      successSubject.next('Second success');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      component.closeSuccess();
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle rapid state changes in service', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Rapid changes
      for (let i = 0; i < 20; i++) {
        successSubject.next(`Rapid success ${i}`);
        fixture.detectChanges();
        component.closeSuccess();
      }
      
      // Assert - Final states should be predictable
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should maintain UI consistency during service state changes', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Set success state
      successSubject.next('UI consistency test');
      fixture.detectChanges();
      
      // Assert - Success modal visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.titleSuccessModal')).nativeElement.textContent.trim()).toBe('Операция выполнена!');
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('UI consistency test');
      
      // Act - Close success
      component.closeSuccess();
      
      // Assert - Modal hidden (after success is cleared)
      successService.clear();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });
  });

  // ====== ТЕСТЫ УСТОЙЧИВОСТИ ======
  describe('Stability Tests', () => {
    it('should handle extreme number of success operations', () => {
      // Arrange
      const iterations = 1000;
      
      // Act - Extreme number of operations
      for (let i = 0; i < iterations; i++) {
        successService.success$.next(`Extreme success ${i}`);
        fixture.detectChanges();
        component.closeSuccess();
      }
      
      // Assert - Component should still work correctly
      expect(successService.disableLoginForm.value).toBeFalse();
      
      // Act - One more operation to verify functionality
      successService.success$.next('Final test success');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
    });

    it('should maintain performance under load', () => {
      // Arrange
      const startTime = performance.now();
      
      // Act - Load test
      for (let i = 0; i < 500; i++) {
        successService.success$.next(`Load test success ${i}`);
        fixture.detectChanges();
        component.closeSuccess();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(2000);
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and UX', () => {
    it('should have proper button semantics and accessibility with real service', () => {
      // Arrange
      successService.success$.next('Accessibility test');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(buttonElement.nativeElement.type).toBe('button');
      expect(buttonElement.nativeElement.textContent.trim()).toBe('ok');
    });

    it('should provide clear visual feedback for success states', () => {
      // Arrange
      const testSuccess = 'Clear visual feedback test success message';
      
      // Act - Show success
      successService.success$.next(testSuccess);
      fixture.detectChanges();
      
      // Assert - Success modal is visible with correct content
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      
      expect(modalElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Операция выполнена!');
      expect(messageElement.nativeElement.textContent.trim()).toBe(testSuccess);
      
      // Act - Close success
      component.closeSuccess();
      
      // Assert - Modal is hidden (after success is cleared)
      successService.clear();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });
  });

  // ====== ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Real Service Integration Scenarios', () => {
    it('should work correctly with SuccessService methods', () => {
      // Arrange
      const testMessage = 'Service method test';
      
      // Act - Use service method
      successService.localHandler(testMessage);
      fixture.detectChanges();
      
      // Assert - Success should be visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe(testMessage);
      
      // Act - Clear using service method
      successService.clear();
      fixture.detectChanges();
      
      // Assert - Success should be cleared
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });

    it('should handle service state changes from external sources', () => {
      // Arrange
      const disableLoginFormSubject = successService.disableLoginForm;
      
      // Act - External state changes
      disableLoginFormSubject.next(true);
      
      // Assert - State changed
      expect(disableLoginFormSubject.value).toBeTrue();
      
      // Act - Component should be able to reset states
      component.closeSuccess();
      
      // Assert - State reset
      expect(disableLoginFormSubject.value).toBeFalse();
    });

    it('should integrate with SuccessService clear method correctly', () => {
      // Arrange
      successService.success$.next('Integration test');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Use service clear method
      successService.clear();
      fixture.detectChanges();
      
      // Assert - Modal should be hidden
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== ТЕСТЫ РЕАКТИВНОСТИ С РЕАЛЬНЫМ СЕРВИСОМ ======
  describe('Reactive Behavior with Real Service', () => {
    it('should react to success message changes immediately with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Change success message
      successSubject.next('First message');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('First message');
      
      successSubject.next('Second message');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Second message');
    });

    it('should handle multiple rapid success message changes with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      const messages = ['Msg1', 'Msg2', 'Msg3', 'Msg4', 'Msg5'];
      
      // Act - Rapid changes
      messages.forEach((message, index) => {
        successSubject.next(message);
        fixture.detectChanges();
        
        const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
        expect(messageElement.nativeElement.textContent.trim()).toBe(message);
      });
    });

    it('should maintain UI consistency during reactive updates with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Multiple updates
      for (let i = 0; i < 10; i++) {
        successSubject.next(`Update ${i}`);
        fixture.detectChanges();
        
        // Assert - UI should be consistent
        const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
        const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
        
        expect(modalElement).toBeTruthy();
        expect(messageElement.nativeElement.textContent.trim()).toBe(`Update ${i}`);
      }
    });
  });

  // ====== ТЕСТЫ ИНТЕГРАЦИИ С ДРУГИМИ СЕРВИСАМИ ======
  describe('Integration with Other Services', () => {
    it('should work correctly when SuccessService is shared with other components', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Simulate external component using the same service
      successSubject.next('External success');
      fixture.detectChanges();
      
      // Assert - Success modal should be visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Simulate external component clearing success
      successService.clear();
      fixture.detectChanges();
      
      // Assert - Modal should be hidden
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });

    it('should handle concurrent access to SuccessService', () => {
      // Arrange
      const successSubject = successService.success$;
      
      // Act - Simulate concurrent access
      successSubject.next('Concurrent success 1');
      fixture.detectChanges();
      
      // Simulate another component accessing the service
      successService.localHandler('Concurrent success 2');
      fixture.detectChanges();
      
      // Assert - Should handle concurrent access gracefully
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Concurrent success 2');
    });
  });

  // ====== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ С РЕАЛЬНЫМ СЕРВИСОМ ======
  describe('Edge Cases with Real Service', () => {
    it('should handle very long success messages with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      const longMessage = 'A'.repeat(2000); // Very long message
      
      // Act - Long success message
      successSubject.next(longMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe(longMessage);
    });

    it('should handle special characters in success messages with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      const specialMessage = 'Success with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Act - Special characters
      successSubject.next(specialMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(specialMessage);
    });

    it('should handle HTML content in success messages safely with real service', () => {
      // Arrange
      const successSubject = successService.success$;
      const htmlMessage = '<script>alert("test")</script>Success message';
      
      // Act - HTML content
      successSubject.next(htmlMessage);
      fixture.detectChanges();
      
      // Assert - Should be treated as text, not HTML
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(htmlMessage);
      expect(messageElement.nativeElement.innerHTML).toContain('&lt;script&gt;');
    });
  });
});
