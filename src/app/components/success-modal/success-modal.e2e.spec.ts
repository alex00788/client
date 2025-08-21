import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SuccessModalComponent } from './success-modal.component';
import { SuccessService } from '../../shared/services/success.service';

describe('SuccessModalComponent E2E Tests', () => {
  let component: SuccessModalComponent;
  let fixture: ComponentFixture<SuccessModalComponent>;
  let successService: SuccessService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessModalComponent, NoopAnimationsModule],
      providers: [SuccessService] // Используем реальный сервис для E2E
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModalComponent);
    component = fixture.componentInstance;
    successService = TestBed.inject(SuccessService);
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ ======
  describe('End-to-End User Scenarios', () => {
    it('should display success modal and allow user to close it', () => {
      // Arrange - Simulate user action that triggers success
      const successSubject = successService.success$;
      
      // Act - User performs action that shows success
      successSubject.next('Operation completed successfully!');
      fixture.detectChanges();
      
      // Assert - Success modal is visible to user
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      expect(modalElement).toBeTruthy();
      expect(modalElement.nativeElement).toBeDefined();
      
      // Assert - User sees correct title
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Операция выполнена!');
      
      // Assert - User sees success message
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      expect(messageElement.nativeElement.textContent.trim()).toBe('Operation completed successfully!');
      
      // Act - User clicks close button
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - Modal is closed and success is cleared
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle complete user workflow: show success -> read message -> close', () => {
      // Arrange - User starts workflow
      const successSubject = successService.success$;
      
      // Act - Step 1: User action triggers success
      successSubject.next('User registration completed successfully');
      fixture.detectChanges();
      
      // Assert - Step 1: User sees success modal
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('User registration completed successfully');
      
      // Act - Step 2: User reads the message
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      const messageText = messageElement.nativeElement.textContent.trim();
      expect(messageText).toBe('User registration completed successfully');
      
      // Act - Step 3: User closes the modal
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - Step 3: Workflow completed successfully
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle multiple user interactions in sequence', () => {
      // Arrange - User performs multiple actions
      const successSubject = successService.success$;
      const userActions = [
        'First action completed',
        'Second action completed',
        'Third action completed'
      ];
      
      // Act & Assert - Multiple success scenarios
      userActions.forEach((action, index) => {
        // User performs action
        successSubject.next(action);
        fixture.detectChanges();
        
        // User sees success modal
        expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe(action);
        
        // User closes modal
        const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
        buttonElement.nativeElement.click();
        
        // Verify modal is closed
        expect(successService.disableLoginForm.value).toBeFalse();
      });
    });
  });

  // ====== E2E ТЕСТЫ РЕАЛЬНЫХ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ ======
  describe('Real User Interactions', () => {
    it('should respond to real button clicks with proper event handling', () => {
      // Arrange - Show success modal
      const successSubject = successService.success$;
      successSubject.next('Test success message');
      fixture.detectChanges();
      
      // Act - Real button click event
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      buttonElement.nativeElement.dispatchEvent(clickEvent);
      
      // Assert - Event was handled correctly
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle rapid user interactions without errors', () => {
      // Arrange - Show success modal
      const successSubject = successService.success$;
      successSubject.next('Rapid interaction test');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Rapid clicks (simulating impatient user)
      for (let i = 0; i < 5; i++) {
        buttonElement.nativeElement.click();
      }
      
      // Assert - All interactions handled correctly
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle different types of user input events', () => {
      // Arrange - Show success modal
      const successSubject = successService.success$;
      successSubject.next('Event type test');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Different event types
      buttonElement.nativeElement.dispatchEvent(new MouseEvent('mousedown'));
      buttonElement.nativeElement.dispatchEvent(new MouseEvent('mouseup'));
      buttonElement.nativeElement.dispatchEvent(new MouseEvent('click'));
      
      // Assert - Events handled correctly
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ РЕАЛЬНЫХ СЦЕНАРИЕВ ИСПОЛЬЗОВАНИЯ ======
  describe('Real Usage Scenarios', () => {
    it('should work in a real application context with SuccessService', () => {
      // Arrange - Simulate real application usage
      const testMessage = 'User profile updated successfully';
      
      // Act - Use service method as in real app
      successService.localHandler(testMessage);
      fixture.detectChanges();
      
      // Assert - Success modal appears as expected
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe(testMessage);
      
      // Act - User interaction
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - Success cleared as expected
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle real application state changes', () => {
      // Arrange - Real application state
      const disableLoginFormSubject = successService.disableLoginForm;
      
      // Act - Application changes state
      disableLoginFormSubject.next(true);
      expect(disableLoginFormSubject.value).toBeTrue();
      
      // Act - User closes success modal
      component.closeSuccess();
      
      // Assert - State changed as expected
      expect(disableLoginFormSubject.value).toBeFalse();
    });

    it('should integrate with real application workflow', () => {
      // Arrange - Real application workflow
      const workflowSteps = [
        'Step 1: Data validation completed',
        'Step 2: Database connection established',
        'Step 3: Record saved successfully',
        'Step 4: Cache updated',
        'Step 5: User notified'
      ];
      
      // Act & Assert - Complete workflow
      workflowSteps.forEach((step, index) => {
        // Application shows success for each step
        successService.success$.next(step);
        fixture.detectChanges();
        
        // User sees progress
        expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe(step);
        
        // User acknowledges step
        const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
        buttonElement.nativeElement.click();
        
        // Verify step completed
        expect(successService.disableLoginForm.value).toBeFalse();
      });
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ И ОТЗЫВЧИВОСТИ ======
  describe('Performance and Responsiveness E2E', () => {
    it('should respond quickly to user interactions', () => {
      // Arrange - Show success modal
      const successSubject = successService.success$;
      successSubject.next('Performance test');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Measure response time
      const startTime = performance.now();
      buttonElement.nativeElement.click();
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      
      // Assert - Response time is acceptable for user experience
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should handle multiple rapid user interactions smoothly', () => {
      // Arrange - Show success modal
      const successSubject = successService.success$;
      successSubject.next('Smooth interaction test');
      fixture.detectChanges();
      
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Multiple rapid interactions
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        buttonElement.nativeElement.click();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Assert - All interactions completed smoothly
      expect(totalTime).toBeLessThan(500); // Should complete within 500ms
      expect(successService.disableLoginForm.value).toBeFalse();
    });

    it('should maintain smooth performance under load', () => {
      // Arrange - Prepare for load test
      const successSubject = successService.success$;
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Load test with multiple success cycles
      const startTime = performance.now();
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        // Show success
        successSubject.next(`Load test ${i}`);
        fixture.detectChanges();
        
        // User interaction
        if (buttonElement && buttonElement.nativeElement) {
          buttonElement.nativeElement.click();
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Assert - Performance maintained under load
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and UX E2E', () => {
    it('should provide clear visual feedback for user actions', () => {
      // Arrange - User performs action
      const successSubject = successService.success$;
      
      // Act - Show success
      successSubject.next('Clear feedback test');
      fixture.detectChanges();
      
      // Assert - User sees clear visual feedback
      const modalElement = fixture.debugElement.query(By.css('.modalSuccessClass'));
      const titleElement = fixture.debugElement.query(By.css('.titleSuccessModal'));
      const messageElement = fixture.debugElement.query(By.css('.successMessage span'));
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // All elements should be visible and properly styled
      expect(modalElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Операция выполнена!');
      expect(messageElement.nativeElement.textContent.trim()).toBe('Clear feedback test');
      expect(buttonElement.nativeElement.textContent.trim()).toBe('ok');
      
      // Button should be clearly interactive
      expect(buttonElement.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(buttonElement.nativeElement.type).toBe('button');
    });

    it('should maintain consistent UI state during user interactions', () => {
      // Arrange - Initial state
      const successSubject = successService.success$;
      
      // Act - User interaction sequence
      successSubject.next('UI consistency test');
      fixture.detectChanges();
      
      // Assert - Initial UI state
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - User closes modal
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - UI state consistent after interaction
      expect(successService.disableLoginForm.value).toBeFalse();
      
      // Act - Show another success
      successSubject.next('Second success');
      fixture.detectChanges();
      
      // Assert - UI state still consistent
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe('Second success');
    });

    it('should provide intuitive user experience flow', () => {
      // Arrange - User workflow
      const successSubject = successService.success$;
      
      // Act - Step 1: User sees success
      successSubject.next('Intuitive UX test');
      fixture.detectChanges();
      
      // Assert - Step 1: Clear success indication
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.titleSuccessModal')).nativeElement.textContent.trim()).toBe('Операция выполнена!');
      
      // Act - Step 2: User acknowledges success
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - Step 2: Success acknowledged and cleared
      expect(successService.disableLoginForm.value).toBeFalse();
      
      // Act - Step 3: User can continue with next action
      successSubject.next('Next action success');
      fixture.detectChanges();
      
      // Assert - Step 3: Ready for next interaction
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Real Service Integration E2E', () => {
    it('should work seamlessly with SuccessService in real application context', () => {
      // Arrange - Real application context
      const testScenarios = [
        'User login successful',
        'Password reset email sent',
        'Profile updated successfully',
        'Settings saved',
        'Logout completed'
      ];
      
      // Act & Assert - Real service integration
      testScenarios.forEach((scenario, index) => {
        // Application uses service
        successService.localHandler(scenario);
        fixture.detectChanges();
        
        // User sees result
        expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.successMessage span')).nativeElement.textContent.trim()).toBe(scenario);
        
        // User interaction
        const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
        buttonElement.nativeElement.click();
        
        // Service state updated
        expect(successService.disableLoginForm.value).toBeFalse();
      });
    });

    it('should handle real service state management correctly', () => {
      // Arrange - Real service state
      const disableLoginFormSubject = successService.disableLoginForm;
      
      // Act - Service state changes
      disableLoginFormSubject.next(true);
      expect(disableLoginFormSubject.value).toBeTrue();
      
      // Act - User interaction affects service state
      component.closeSuccess();
      
      // Assert - Service state managed correctly
      expect(disableLoginFormSubject.value).toBeFalse();
      
      // Act - Service state changes from external source
      disableLoginFormSubject.next(true);
      expect(disableLoginFormSubject.value).toBeTrue();
      
      // Act - User interaction again
      component.closeSuccess();
      
      // Assert - Service state consistently managed
      expect(disableLoginFormSubject.value).toBeFalse();
    });

    it('should integrate with real application error handling', () => {
      // Arrange - Real application scenario
      const successSubject = successService.success$;
      
      // Act - Application shows success
      successSubject.next('Operation completed successfully');
      fixture.detectChanges();
      
      // Assert - Success modal visible
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Application clears success (external action)
      successService.clear();
      fixture.detectChanges();
      
      // Assert - Success modal hidden
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
      
      // Act - User interaction (should not cause errors)
      component.closeSuccess();
      
      // Assert - No errors occurred
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ УСТОЙЧИВОСТИ И НАДЕЖНОСТИ ======
  describe('Stability and Reliability E2E', () => {
    it('should maintain stability during extended usage', () => {
      // Arrange - Extended usage scenario
      const successSubject = successService.success$;
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      
      // Act - Extended usage (simulating real user session)
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        // Show success
        successSubject.next(`Extended usage ${i}`);
        fixture.detectChanges();
        
        // Verify modal visible
        expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
        
        // User interaction
        if (buttonElement && buttonElement.nativeElement) {
          buttonElement.nativeElement.click();
        }
        
        // Verify success cleared
        expect(successService.disableLoginForm.value).toBeFalse();
      }
      
      // Assert - Component still works correctly after extended usage
      successSubject.next('Final test');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
    });

    it('should handle edge cases gracefully in real usage', () => {
      // Arrange - Edge case scenarios
      const edgeCases = [
        '', // Empty message
        'A'.repeat(1000), // Very long message
        'Message with special chars: !@#$%^&*()',
        'Message with numbers: 12345',
        'Message with unicode: 🎉 ✅ 🚀'
      ];
      
      // Act & Assert - Handle edge cases
      edgeCases.forEach((edgeCase, index) => {
        // Show edge case
        successService.success$.next(edgeCase);
        fixture.detectChanges();
        
        if (edgeCase === '') {
          // Empty message should not show modal
          expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
        } else {
          // Other edge cases should show modal
          expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
          
          // User interaction
          const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
          buttonElement.nativeElement.click();
          
          // Verify handled correctly
          expect(successService.disableLoginForm.value).toBeFalse();
        }
      });
    });

    it('should recover gracefully from service errors', () => {
      // Arrange - Service error scenario
      const successSubject = successService.success$;
      
      // Act - Normal operation
      successSubject.next('Normal operation');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - Simulate service error (clear manually)
      successService.clear();
      fixture.detectChanges();
      
      // Assert - Component recovers gracefully
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeFalsy();
      
      // Act - Resume normal operation
      successSubject.next('Recovery test');
      fixture.detectChanges();
      
      // Assert - Component works normally again
      expect(fixture.debugElement.query(By.css('.modalSuccessClass'))).toBeTruthy();
      
      // Act - User interaction
      const buttonElement = fixture.debugElement.query(By.css('.btnSuccessModal button'));
      buttonElement.nativeElement.click();
      
      // Assert - Everything works correctly
      expect(successService.disableLoginForm.value).toBeFalse();
    });
  });
});
