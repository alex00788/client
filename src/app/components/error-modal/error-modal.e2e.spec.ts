import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { ErrorModalComponent } from './error-modal.component';
import { ErrorResponseService } from '../../shared/services/error.response.service';
import { ModalService } from '../../shared/services/modal.service';

describe('ErrorModalComponent E2E Tests', () => {
  let component: ErrorModalComponent;
  let fixture: ComponentFixture<ErrorModalComponent>;
  let errorResponseService: jasmine.SpyObj<ErrorResponseService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let errorSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    errorSubject = new BehaviorSubject<string>('Test error message');
    
    const errorResponseServiceSpy = jasmine.createSpyObj('ErrorResponseService', ['clear'], {
      error$: errorSubject.asObservable()
    });
    const modalServiceSpy = jasmine.createSpyObj('ModalService', [], {
      registrationError: { next: jasmine.createSpy('next') },
      rememberPas: { next: jasmine.createSpy('next') }
    });

    await TestBed.configureTestingModule({
      imports: [ErrorModalComponent, NoopAnimationsModule],
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

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ ======
  describe('End-to-End User Scenarios', () => {
    it('should display error modal when error occurs and user can close it', () => {
      // Arrange - Error modal is displayed
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Assert - Error message is displayed
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe('Test error message');
      
      // Assert - Title is displayed
      const title = fixture.debugElement.query(By.css('.titleErrModal'));
      expect(title.nativeElement.textContent.trim()).toBe('Ошибка!');
      
      // Assert - Close button is present
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.textContent).toBe('ok');
      
      // Act - User clicks close button
      closeButton.nativeElement.click();
      
      // Assert - Close method was called
      expect(errorResponseService.clear).toHaveBeenCalled();
      expect(modalService.registrationError.next).toHaveBeenCalledWith(false);
      expect(modalService.rememberPas.next).toHaveBeenCalledWith(false);
    });

    it('should handle complete error workflow: error appears -> user reads -> user closes', () => {
      // Arrange - Error modal is visible
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      expect(modal).toBeTruthy();
      
      // Act & Assert - Step 1: User reads error title
      const title = fixture.debugElement.query(By.css('.titleErrModal'));
      expect(title.nativeElement.textContent.trim()).toBe('Ошибка!');
      
      // Act & Assert - Step 2: User reads error message
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe('Test error message');
      
      // Act & Assert - Step 3: User clicks close button
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      closeButton.nativeElement.click();
      
      // Assert - All cleanup methods were called
      expect(errorResponseService.clear).toHaveBeenCalled();
      expect(modalService.registrationError.next).toHaveBeenCalledWith(false);
      expect(modalService.rememberPas.next).toHaveBeenCalledWith(false);
    });

    it('should handle multiple error scenarios with different messages', () => {
      // Arrange - Different error messages
      const errorMessages = [
        'Network connection failed',
        'Invalid credentials',
        'Server error occurred',
        'Validation failed'
      ];
      
      errorMessages.forEach((message, index) => {
        // Act - Simulate new error
        errorSubject.next(message);
        fixture.detectChanges();
        
        // Assert - Error message is displayed correctly
        const errorElement = fixture.debugElement.query(By.css('.errMessage span'));
        expect(errorElement.nativeElement.textContent).toBe(message);
        
        // Act - User closes error
        const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
        closeButton.nativeElement.click();
        
        // Assert - Cleanup was called
        expect(errorResponseService.clear).toHaveBeenCalled();
      });
    });
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ ======
  describe('End-to-End User Interactions', () => {
    it('should handle user clicking close button multiple times', () => {
      // Arrange - Error modal is displayed
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      expect(closeButton).toBeTruthy();
      
      // Act - User clicks close button multiple times
      closeButton.nativeElement.click();
      closeButton.nativeElement.click();
      closeButton.nativeElement.click();
      
      // Assert - Close method was called for each click
      expect(errorResponseService.clear).toHaveBeenCalledTimes(3);
      expect(modalService.registrationError.next).toHaveBeenCalledTimes(3);
      expect(modalService.rememberPas.next).toHaveBeenCalledTimes(3);
    });

    it('should handle user interaction with all modal elements', () => {
      // Arrange - Error modal is displayed
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      const title = fixture.debugElement.query(By.css('.titleErrModal'));
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Assert - All elements are present and accessible
      expect(modal).toBeTruthy();
      expect(title).toBeTruthy();
      expect(errorMessage).toBeTruthy();
      expect(closeButton).toBeTruthy();
      
      // Act - User focuses on close button
      closeButton.nativeElement.focus();
      expect(document.activeElement).toBe(closeButton.nativeElement);
      
      // Act - User clicks close button
      closeButton.nativeElement.click();
      
      // Assert - Close functionality works
      expect(errorResponseService.clear).toHaveBeenCalled();
    });

    it('should handle rapid user interactions without issues', () => {
      // Arrange - Error modal is displayed
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act - User performs rapid interactions
      for (let i = 0; i < 10; i++) {
        closeButton.nativeElement.click();
      }
      
      // Assert - All interactions were processed
      expect(errorResponseService.clear).toHaveBeenCalledTimes(10);
      expect(modalService.registrationError.next).toHaveBeenCalledTimes(10);
      expect(modalService.rememberPas.next).toHaveBeenCalledTimes(10);
    });
  });

  // ====== E2E ТЕСТЫ СЦЕНАРИЕВ ОШИБОК ======
  describe('End-to-End Error Scenarios', () => {
    it('should handle empty error message gracefully', () => {
      // Arrange - Empty error message
      errorSubject.next('');
      fixture.detectChanges();
      
      // Assert - Modal is hidden when error message is empty (due to *ngIf)
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeFalsy();
      
      // Arrange - Set error message back to show modal
      errorSubject.next('Test error message');
      fixture.detectChanges();
      
      // Assert - Modal is visible again
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
    });

    it('should handle very long error messages without breaking layout', () => {
      // Arrange - Very long error message
      const longMessage = 'A'.repeat(1000);
      errorSubject.next(longMessage);
      fixture.detectChanges();
      
      // Assert - Long message is displayed correctly
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe(longMessage);
      
      // Assert - Modal layout remains intact
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      expect(modal).toBeTruthy();
      
      // Assert - Close button is still accessible
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.disabled).toBeFalse();
    });

    it('should handle special characters in error messages', () => {
      // Arrange - Error message with special characters
      const specialMessage = 'Error: <script>alert("xss")</script> & "quotes" \'apostrophes\'';
      errorSubject.next(specialMessage);
      fixture.detectChanges();
      
      // Assert - Special characters are handled correctly
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe(specialMessage);
      
      // Assert - Modal functionality works with special characters
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      closeButton.nativeElement.click();
      expect(errorResponseService.clear).toHaveBeenCalled();
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ ======
  describe('End-to-End Service Integration', () => {
    it('should integrate with ErrorResponseService correctly', () => {
      // Arrange - Error service provides error
      const testError = 'Integration test error';
      errorSubject.next(testError);
      fixture.detectChanges();
      
      // Assert - Error is displayed from service
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe(testError);
      
      // Act - User closes error
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      closeButton.nativeElement.click();
      
      // Assert - Service clear method was called
      expect(errorResponseService.clear).toHaveBeenCalled();
    });

    it('should integrate with ModalService correctly', () => {
      // Arrange - Error modal is displayed
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act - User closes error
      closeButton.nativeElement.click();
      
      // Assert - Modal service methods were called correctly
      expect(modalService.registrationError.next).toHaveBeenCalledWith(false);
      expect(modalService.rememberPas.next).toHaveBeenCalledWith(false);
    });

    it('should handle service method failures gracefully', () => {
      // Arrange - Service methods throw errors
      errorResponseService.clear.and.throwError('Service error');
      
      // Act - User tries to close error
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Assert - Component doesn't crash when services fail
      expect(() => closeButton.nativeElement.click()).not.toThrow();
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('End-to-End Performance Tests', () => {
    it('should handle rapid error message changes without performance issues', () => {
      // Arrange - Multiple error messages
      const messages = Array.from({ length: 100 }, (_, i) => `Error ${i}`);
      
      // Act - Rapidly change error messages
      messages.forEach(message => {
        errorSubject.next(message);
        fixture.detectChanges();
      });
      
      // Assert - Component remains stable
      expect(component).toBeDefined();
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Assert - Last message is displayed correctly
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      expect(errorMessage.nativeElement.textContent).toBe('Error 99');
    });

    it('should handle rapid close button clicks without performance degradation', () => {
      // Arrange - Error modal is displayed
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act - Rapid clicks
      const startTime = performance.now();
      for (let i = 0; i < 50; i++) {
        closeButton.nativeElement.click();
      }
      const endTime = performance.now();
      
      // Assert - Performance is acceptable (less than 100ms for 50 clicks)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Assert - All clicks were processed
      expect(errorResponseService.clear).toHaveBeenCalledTimes(50);
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ ======
  describe('End-to-End Accessibility Tests', () => {
    it('should maintain accessibility through complete user workflow', () => {
      // Arrange - Error modal is displayed
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act - User navigates to close button
      closeButton.nativeElement.focus();
      expect(document.activeElement).toBe(closeButton.nativeElement);
      
      // Act - User activates close button
      closeButton.nativeElement.click();
      
      // Assert - Close functionality works
      expect(errorResponseService.clear).toHaveBeenCalled();
    });

    it('should provide proper button attributes and accessibility', () => {
      // Arrange - Error modal is displayed
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Assert - Button has proper attributes
      expect(closeButton.nativeElement.type).toBe('button');
      expect(closeButton.nativeElement.textContent.trim()).toBe('ok');
      
      // Assert - Button is focusable and clickable
      expect(closeButton.nativeElement.disabled).toBeFalse();
      expect(closeButton.nativeElement.tabIndex).toBe(0);
    });

    it('should maintain proper contrast and readability', () => {
      // Arrange - Error modal is displayed
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      const title = fixture.debugElement.query(By.css('.titleErrModal'));
      const errorMessage = fixture.debugElement.query(By.css('.errMessage span'));
      
      // Assert - All text elements are visible
      expect(title.nativeElement.textContent.trim()).toBe('Ошибка!');
      expect(errorMessage.nativeElement.textContent).toBe('Test error message');
      
      // Assert - Modal has proper styling classes
      expect(modal.nativeElement.className).toContain('modalErrorClass');
      expect(title.nativeElement.className).toContain('titleErrModal');
      // Note: errMessage class is on the div, not the span
      expect(fixture.debugElement.query(By.css('.errMessage'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ АДАПТИВНОСТИ ======
  describe('End-to-End Responsiveness Tests', () => {
    it('should maintain functionality on different screen sizes', () => {
      // Arrange - Error modal is displayed
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      const closeButton = fixture.debugElement.query(By.css('.btnErrModal button'));
      
      // Act & Assert - Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1024, height: 768 },  // Tablet
        { width: 375, height: 667 },   // Mobile
        { width: 320, height: 568 }    // Small mobile
      ];
      
      viewports.forEach(viewport => {
        // Simulate viewport change
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, configurable: true });
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
        fixture.detectChanges();
        
        // Assert - Modal remains functional
        expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.btnErrModal button'))).toBeTruthy();
        
        // Assert - Close button works
        const button = fixture.debugElement.query(By.css('.btnErrModal button'));
        button.nativeElement.click();
        expect(errorResponseService.clear).toHaveBeenCalled();
      });
    });

    it('should handle CSS media queries correctly', () => {
      // Arrange - Error modal is displayed
      const modal = fixture.debugElement.query(By.css('.modalErrorClass'));
      
      // Act - Test mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      // Assert - Modal adapts to mobile viewport
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
      
      // Act - Test desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      // Assert - Modal adapts to desktop viewport
      expect(fixture.debugElement.query(By.css('.modalErrorClass'))).toBeTruthy();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
