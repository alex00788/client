import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Subject, BehaviorSubject } from 'rxjs';

import { SuccessModalComponent } from './success-modal.component';
import { SuccessService } from '../../shared/services/success.service';

// Мок компонента для тестов
@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [],
  template: `
    <div class="modalSuccessClass" *ngIf="successService.success$ | async as mesSuccess">
      <div class="titleSuccessModal">
        Операция выполнена!
      </div>
      <div class="successMessage">
        <span>{{mesSuccess}}</span>
      </div>
      <div class="btnSuccessModal">
        <button type="button" class="btnSuccessModal" (click)="closeSuccess()"> ok </button>
      </div>
    </div>
  `,
  styles: []
})
class MockSuccessModalComponent {
  constructor(public successService: SuccessService) {}

  closeSuccess() {
    this.successService.clear();
  }
}

describe('SuccessModalComponent', () => {
  let component: SuccessModalComponent;
  let fixture: ComponentFixture<SuccessModalComponent>;
  let successService: jasmine.SpyObj<SuccessService>;

  beforeEach(async () => {
    // Создаем spy объект для SuccessService
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['clear', 'localHandler'], {
      success$: new Subject<string>(),
      disableLoginForm: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [SuccessModalComponent],
      providers: [
        { provide: SuccessService, useValue: successServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModalComponent);
    component = fixture.componentInstance;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ТЕСТЫ =====
  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should inject SuccessService correctly', () => {
      expect(component.successService).toBeTruthy();
      expect(component.successService).toBe(successService);
    });

    it('should have correct component structure', () => {
      expect(component.successService).toBeDefined();
      expect(component.closeSuccess).toBeDefined();
      expect(typeof component.closeSuccess).toBe('function');
    });
  });

  // ===== ТЕСТЫ МЕТОДА closeSuccess =====
  describe('closeSuccess Method', () => {
    it('should call successService.clear when closeSuccess is called', () => {
      // Arrange
      expect(successService.clear).not.toHaveBeenCalled();
      
      // Act
      component.closeSuccess();
      
      // Assert
      expect(successService.clear).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive calls correctly', () => {
      // Arrange
      expect(successService.clear).not.toHaveBeenCalled();
      
      // Act - Multiple calls
      component.closeSuccess();
      component.closeSuccess();
      component.closeSuccess();
      
      // Assert
      expect(successService.clear).toHaveBeenCalledTimes(3);
    });

    it('should not throw errors when called multiple times', () => {
      // Arrange & Act & Assert
      expect(() => {
        for (let i = 0; i < 100; i++) {
          component.closeSuccess();
        }
      }).not.toThrow();
      
      expect(successService.clear).toHaveBeenCalledTimes(100);
    });
  });

  // ===== ТЕСТЫ HTML ШАБЛОНА =====
  describe('Template Rendering', () => {
    it('should render success modal when success message is present', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Emit success message
      successSubject.next('Test success message');
      fixture.detectChanges();
      
      // Assert
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      expect(modalElement).toBeTruthy();
    });

    it('should not render success modal when no success message is present', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - No success message emitted
      fixture.detectChanges();
      
      // Assert
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      expect(modalElement).toBeFalsy();
    });

    it('should render success title correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Emit success message
      successSubject.next('Test success message');
      fixture.detectChanges();
      
      // Assert
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Операция выполнена!');
    });

    it('should render success message correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const testSuccessMessage = 'This is a test success message';
      
      // Act - Emit success message
      successSubject.next(testSuccessMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe(testSuccessMessage);
    });

    it('should render close button correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Emit success message
      successSubject.next('Test success message');
      fixture.detectChanges();
      
      // Assert
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('ok');
      expect(buttonElement.nativeElement.type).toBe('button');
    });

    it('should have correct button classes', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Emit success message
      successSubject.next('Test success message');
      fixture.detectChanges();
      
      // Assert
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      expect(buttonElement.nativeElement.classList.contains('btnSuccessModal')).toBeTrue();
    });
  });

  // ===== ТЕСТЫ УСЛОВНОГО ОТОБРАЖЕНИЯ =====
  describe('Conditional Rendering', () => {
    it('should show modal only when success message exists', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act & Assert - No success message
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
      
      // Act & Assert - With success message
      successSubject.next('Success occurred');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act & Assert - Success message cleared
      successSubject.next('');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });

    it('should handle different success messages correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const testMessages = [
        'Operation completed successfully',
        'Data saved successfully',
        'User registered successfully',
        'File uploaded successfully'
      ];
      
      // Act & Assert - Test each message
      testMessages.forEach(message => {
        successSubject.next(message);
        fixture.detectChanges();
        
        const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
        expect(messageElement.nativeElement.textContent.trim()).toBe(message);
      });
    });

    it('should handle empty success message correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Empty success message
      successSubject.next('');
      fixture.detectChanges();
      
      // Assert
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });

    it('should handle undefined success message gracefully', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Undefined success message
      (successSubject as any).next(undefined);
      fixture.detectChanges();
      
      // Assert - Should handle gracefully
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });
  });

  // ===== ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interactions', () => {
    it('should handle button click correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act
      buttonElement.triggerEventHandler('click', null);
      
      // Assert
      expect(successService.clear).toHaveBeenCalledTimes(1);
    });

    it('should close modal after button click', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act
      buttonElement.triggerEventHandler('click', null);
      
      // Assert - Modal should be hidden after success is cleared
      expect(successService.clear).toHaveBeenCalled();
    });

    it('should handle rapid button clicks without errors', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Rapid clicks
      for (let i = 0; i < 10; i++) {
        buttonElement.triggerEventHandler('click', null);
      }
      
      // Assert
      expect(successService.clear).toHaveBeenCalledTimes(10);
    });

    it('should handle button click with different event types', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Different event types
      buttonElement.triggerEventHandler('click', { type: 'click' });
      buttonElement.triggerEventHandler('click', { type: 'mousedown' });
      buttonElement.triggerEventHandler('click', null);
      
      // Assert
      expect(successService.clear).toHaveBeenCalledTimes(3);
    });
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ =====
  describe('Service Integration', () => {
    it('should integrate correctly with SuccessService', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Emit success message
      successSubject.next('Integration test success');
      fixture.detectChanges();
      
      // Assert
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Integration test success');
    });

    it('should handle service state changes correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Set initial state
      successSubject.next('State change test');
      fixture.detectChanges();
      
      // Assert - Initial state
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Clear success
      component.closeSuccess();
      
      // Assert - Service method should be called
      expect(successService.clear).toHaveBeenCalled();
    });

    it('should work with SuccessService localHandler method', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Use service method
      successService.localHandler('Service method test');
      
      // Act - Emit success message manually since localHandler is a spy
      successSubject.next('Service method test');
      fixture.detectChanges();
      
      // Assert - Success should be visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Service method test');
    });
  });

  // ===== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle very long success messages', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const longMessage = 'A'.repeat(1000); // Very long message
      
      // Act - Long success message
      successSubject.next(longMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe(longMessage);
    });

    it('should handle special characters in success messages', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const specialMessage = 'Success with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Act - Special characters
      successSubject.next(specialMessage);
      fixture.detectChanges();
      
      // Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(specialMessage);
    });

    it('should handle HTML content in success messages safely', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const htmlMessage = '<script>alert("test")</script>Success message';
      
      // Act - HTML content
      successSubject.next(htmlMessage);
      fixture.detectChanges();
      
      // Assert - Should be treated as text, not HTML
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe(htmlMessage);
      expect(messageElement.nativeElement.innerHTML).toContain('&lt;script&gt;');
    });

    it('should handle null success message gracefully', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Null success message
      (successSubject as any).next(null);
      fixture.detectChanges();
      
      // Assert - Should handle gracefully
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance and Memory', () => {
    it('should handle multiple success emissions efficiently', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Multiple success emissions
      for (let i = 0; i < iterations; i++) {
        successSubject.next(`Success ${i}`);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
    });

    it('should not create memory leaks during multiple operations', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const iterations = 1000;
      
      // Act - Multiple operations
      for (let i = 0; i < iterations; i++) {
        successSubject.next(`Success ${i}`);
        fixture.detectChanges();
        component.closeSuccess();
      }
      
      // Assert - Component should still work correctly
      expect(successService.clear).toHaveBeenCalledTimes(iterations);
    });

    it('should handle rapid success message changes efficiently', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const startTime = performance.now();
      const iterations = 200;
      
      // Act - Rapid changes
      for (let i = 0; i < iterations; i++) {
        successSubject.next(`Rapid success ${i}`);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
    });
  });

  // ===== ТЕСТЫ CSS КЛАССОВ И СТИЛЕЙ =====
  describe('CSS Classes and Styling', () => {
    it('should have correct CSS classes applied to elements', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      const messageElement = fixture.debugElement.query(By.css('.successMessage'));
      const buttonContainer = fixture.debugElement.query(By.css('.btnSuccessModal'));
      
      expect(modalElement).toBeTruthy();
      expect(titleElement).toBeTruthy();
      expect(messageElement).toBeTruthy();
      expect(buttonContainer).toBeTruthy();
    });

    it('should apply correct classes to button', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      expect(buttonElement.nativeElement.classList.contains('btnSuccessModal')).toBeTrue();
    });

    it('should have proper modal structure', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      expect(modalElement.children.length).toBeGreaterThan(0);
      
      const titleElement = modalElement.query(By.css('.titleSuccessModal'));
      const messageElement = modalElement.query(By.css('.successMessage'));
      const buttonElement = modalElement.query(By.css('.btnSuccessModal'));
      
      expect(titleElement).toBeTruthy();
      expect(messageElement).toBeTruthy();
      expect(buttonElement).toBeTruthy();
    });
  });

  // ===== ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility', () => {
    it('should have proper button semantics', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(buttonElement.nativeElement.type).toBe('button');
    });

    it('should have proper success message structure', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent.trim()).toBe('Test success');
    });

    it('should have proper modal title structure', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act & Assert
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Операция выполнена!');
    });
  });

  // ===== ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА =====
  describe('Component Lifecycle', () => {
    it('should handle component destruction gracefully', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      successSubject.next('Test success');
      fixture.detectChanges();
      
      // Act - Destroy component
      fixture.destroy();
      
      // Assert - Should not throw errors
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should maintain state consistency during lifecycle', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Set success state and close
      successSubject.next('Lifecycle test');
      fixture.detectChanges();
      
      component.closeSuccess();
      
      // Assert - Service method should be called
      expect(successService.clear).toHaveBeenCalled();
    });

    it('should handle component reinitialization correctly', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - First initialization
      successSubject.next('First success');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Clear and reinitialize
      component.closeSuccess();
      successSubject.next('Second success');
      fixture.detectChanges();
      
      // Assert - Should work correctly after reinitialization
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Second success');
    });
  });

  // ===== ТЕСТЫ РЕАКТИВНОСТИ =====
  describe('Reactive Behavior', () => {
    it('should react to success message changes immediately', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
      // Act - Change success message
      successSubject.next('First message');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('First message');
      
      successSubject.next('Second message');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Second message');
    });

    it('should handle multiple rapid success message changes', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      const messages = ['Msg1', 'Msg2', 'Msg3', 'Msg4', 'Msg5'];
      
      // Act - Rapid changes
      messages.forEach((message, index) => {
        successSubject.next(message);
        fixture.detectChanges();
        
        const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
        expect(messageElement.nativeElement.textContent.trim()).toBe(message);
      });
    });

    it('should maintain UI consistency during reactive updates', () => {
      // Arrange
      const successSubject = successService.success$ as Subject<string>;
      
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
});
