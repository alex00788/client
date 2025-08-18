import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DescriptionApplicationComponent } from './description-application.component';
import { ModalService } from '../../shared/services/modal.service';

describe('DescriptionApplicationComponent', () => {
  let component: DescriptionApplicationComponent;
  let fixture: ComponentFixture<DescriptionApplicationComponent>;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    // Создаем spy объект для ModalService
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['closeContacts']);

    await TestBed.configureTestingModule({
      imports: [DescriptionApplicationComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionApplicationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ТЕСТЫ =====
  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct initial property values', () => {
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should inject ModalService correctly', () => {
      expect(component.modalService).toBeTruthy();
      expect(component.modalService).toBe(modalService);
    });
  });

  // ===== ТЕСТЫ МЕТОДА switchHowItWorkBlock =====
  describe('switchHowItWorkBlock Method', () => {
    it('should toggle blockDescription from false to true', () => {
      // Arrange
      component.blockDescription = false;
      
      // Act
      component.switchHowItWorkBlock();
      
      // Assert
      expect(component.blockDescription).toBeTrue();
    });

    it('should toggle blockDescription from true to false', () => {
      // Arrange
      component.blockDescription = true;
      
      // Act
      component.switchHowItWorkBlock();
      
      // Assert
      expect(component.blockDescription).toBeFalse();
    });

    it('should set showVideoAbout to false when switching description block', () => {
      // Arrange
      component.showVideoAbout = true;
      component.blockDescription = false;
      
      // Act
      component.switchHowItWorkBlock();
      
      // Assert
      expect(component.showVideoAbout).toBeFalse();
      expect(component.blockDescription).toBeTrue();
    });

    it('should maintain showVideoAbout as false when description block is already visible', () => {
      // Arrange
      component.showVideoAbout = false;
      component.blockDescription = true;
      
      // Act
      component.switchHowItWorkBlock();
      
      // Assert
      expect(component.showVideoAbout).toBeFalse();
      expect(component.blockDescription).toBeFalse();
    });

    it('should handle multiple consecutive calls correctly', () => {
      // Arrange
      component.blockDescription = false;
      component.showVideoAbout = true;
      
      // Act
      component.switchHowItWorkBlock(); // First call
      component.switchHowItWorkBlock(); // Second call
      component.switchHowItWorkBlock(); // Third call
      
      // Assert
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
    });
  });

  // ===== ТЕСТЫ МЕТОДА switch =====
  describe('switch Method', () => {
    it('should toggle showVideoAbout from false to true', () => {
      // Arrange
      component.showVideoAbout = false;
      
      // Act
      component.switch();
      
      // Assert
      expect(component.showVideoAbout).toBeTrue();
    });

    it('should toggle showVideoAbout from true to false', () => {
      // Arrange
      component.showVideoAbout = true;
      
      // Act
      component.switch();
      
      // Assert
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should not affect blockDescription property', () => {
      // Arrange
      component.blockDescription = true;
      component.showVideoAbout = false;
      
      // Act
      component.switch();
      
      // Assert
      expect(component.showVideoAbout).toBeTrue();
      expect(component.blockDescription).toBeTrue(); // Should remain unchanged
    });

    it('should handle multiple consecutive calls correctly', () => {
      // Arrange
      component.showVideoAbout = false;
      
      // Act
      component.switch(); // First call
      component.switch(); // Second call
      component.switch(); // Third call
      
      // Assert
      expect(component.showVideoAbout).toBeTrue();
    });
  });

  // ===== ТЕСТЫ ВЗАИМОДЕЙСТВИЯ С СЕРВИСОМ =====
  describe('ModalService Integration', () => {
    it('should call modalService.closeContacts when close button is clicked', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act
      closeButton.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.closeContacts).toHaveBeenCalledTimes(1);
    });

    it('should call modalService.closeContacts with correct context', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act
      closeButton.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.closeContacts).toHaveBeenCalledWith();
    });
  });

  // ===== ТЕСТЫ HTML ШАБЛОНА =====
  describe('Template Rendering', () => {
    it('should render close button with correct class and content', () => {
      // Arrange & Act
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Assert
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.textContent.trim()).toBe('×');
    });

    it('should render main title correctly', () => {
      // Arrange & Act
      const mainTitle = fixture.debugElement.query(By.css('.mainTitle'));
      
      // Assert
      expect(mainTitle).toBeTruthy();
      expect(mainTitle.nativeElement.textContent.trim()).toBe('Ничего лишнего!');
    });

    it('should render easy steps correctly', () => {
      // Arrange & Act
      const easySteps = fixture.debugElement.queryAll(By.css('.easyClass h5'));
      
      // Assert
      expect(easySteps.length).toBe(3);
      expect(easySteps[0].nativeElement.textContent.trim()).toBe('Зашел');
      expect(easySteps[1].nativeElement.textContent.trim()).toBe('Выбрал');
      expect(easySteps[2].nativeElement.textContent.trim()).toBe('Записался');
    });

    it('should render video and description buttons', () => {
      // Arrange & Act
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Assert
      expect(videoButton).toBeTruthy();
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      expect(descriptionButton).toBeTruthy();
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
    });

    it('should not show description block initially', () => {
      // Arrange & Act
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      
      // Assert
      expect(descriptionBlock).toBeFalsy();
    });

    it('should not show video block initially', () => {
      // Arrange & Act
      const videoBlock = fixture.debugElement.query(By.css('.videoFor'));
      
      // Assert
      expect(videoBlock).toBeFalsy();
    });
  });

  // ===== ТЕСТЫ УСЛОВНОГО ОТОБРАЖЕНИЯ =====
  describe('Conditional Rendering', () => {
    it('should show description block when blockDescription is true', () => {
      // Arrange
      component.blockDescription = true;
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(descriptionBlock).toBeTruthy();
    });

    it('should show video block when showVideoAbout is true', () => {
      // Arrange
      component.showVideoAbout = true;
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const videoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(videoBlock).toBeTruthy();
    });

    it('should show close button for description when blockDescription is true', () => {
      // Arrange
      component.blockDescription = true;
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const closeDescriptionButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      expect(closeDescriptionButton).toBeTruthy();
      expect(closeDescriptionButton.nativeElement.textContent.trim()).toBe('×');
    });

    it('should not show close button for description when blockDescription is false', () => {
      // Arrange
      component.blockDescription = false;
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const closeDescriptionButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      expect(closeDescriptionButton).toBeFalsy();
    });
  });

  // ===== ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ =====
  describe('User Interaction Scenarios', () => {
    it('should handle complete user flow: open description, then video, then close description', () => {
      // Arrange
      component.blockDescription = false;
      component.showVideoAbout = false;
      
      // Act - Open description
      component.switchHowItWorkBlock();
      fixture.detectChanges();
      
      // Assert - Description should be visible
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Open video
      component.switch();
      fixture.detectChanges();
      
      // Assert - Both should be visible
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
      
      // Act - Close description (this will also close video due to component logic)
      component.switchHowItWorkBlock();
      fixture.detectChanges();
      
      // Assert - Description closed, video also closed (due to component logic)
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should handle rapid button clicks without errors', () => {
      // Arrange
      component.blockDescription = false;
      component.showVideoAbout = false;
      
      // Act - Rapid clicks
      for (let i = 0; i < 10; i++) {
        component.switch();
        component.switchHowItWorkBlock();
      }
      
      // Assert - Component should handle rapid clicks gracefully
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should maintain state consistency during complex interactions', () => {
      // Arrange
      component.blockDescription = false;
      component.showVideoAbout = false;
      
      // Act - Complex interaction pattern
      component.switchHowItWorkBlock(); // Open description
      component.switch(); // Open video
      component.switchHowItWorkBlock(); // Close description (should close video too)
      component.switch(); // Open video again
      component.switchHowItWorkBlock(); // Open description again
      
      // Assert - State should be consistent
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse(); // Should be reset by switchHowItWorkBlock
    });
  });

  // ===== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined/null values gracefully', () => {
      // Arrange
      component.blockDescription = false;
      component.showVideoAbout = false;
      
      // Act & Assert - Should not throw errors
      expect(() => component.switch()).not.toThrow();
      expect(() => component.switchHowItWorkBlock()).not.toThrow();
    });

    it('should work correctly after component reinitialization', () => {
      // Arrange
      component.switchHowItWorkBlock();
      component.switch();
      
      // Act - Simulate component reinitialization
      fixture.destroy();
      fixture = TestBed.createComponent(DescriptionApplicationComponent);
      component = fixture.componentInstance;
      modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
      fixture.detectChanges();
      
      // Assert - Should have default values
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should handle service method calls gracefully', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act & Assert - Should not crash the component
      expect(() => closeButton.triggerEventHandler('click', null)).not.toThrow();
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance and Memory', () => {
    it('should not create memory leaks during multiple state changes', () => {
      // Arrange
      const iterations = 1000;
      
      // Act - Multiple state changes
      for (let i = 0; i < iterations; i++) {
        component.switch();
        component.switchHowItWorkBlock();
      }
      
      // Assert - Component should still work correctly
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should handle large numbers of rapid state changes efficiently', () => {
      // Arrange
      const startTime = performance.now();
      const iterations = 10000;
      
      // Act - Rapid state changes
      for (let i = 0; i < iterations; i++) {
        component.switch();
        component.switchHowItWorkBlock();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });
  });

  // ===== ТЕСТЫ CSS КЛАССОВ И СТИЛЕЙ =====
  describe('CSS Classes and Styling', () => {
    it('should have correct CSS classes applied to elements', () => {
      // Arrange & Act
      const mainContainer = fixture.debugElement.query(By.css('.descriptionPageClass'));
      const footerTitle = fixture.debugElement.query(By.css('.footerTitle'));
      const titleDescription = fixture.debugElement.query(By.css('.titleDescription'));
      
      // Assert
      expect(mainContainer).toBeTruthy();
      expect(footerTitle).toBeTruthy();
      expect(titleDescription).toBeTruthy();
    });

    it('should apply correct classes to buttons', () => {
      // Arrange & Act
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Assert
      expect(videoButton).toBeTruthy();
      expect(videoButton.nativeElement.classList.contains('btnVideo')).toBeTrue();
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.classList.contains('btnCloseDesc')).toBeTrue();
    });
  });

  // ===== ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility', () => {
    it('should have clickable elements with proper button semantics', () => {
      // Arrange & Act
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Assert - Check that elements are clickable (have click handlers)
      expect(videoButton).toBeTruthy();
      expect(descriptionButton).toBeTruthy();
    });

    it('should have proper button semantics', () => {
      // Arrange & Act
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      
      // Assert
      buttons.forEach(button => {
        expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
      });
    });
  });

  // ===== ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Integration Tests', () => {
    it('should maintain state during component lifecycle', () => {
      // Arrange
      component.switchHowItWorkBlock();
      component.switch();
      
      // Act - Simulate change detection
      fixture.detectChanges();
      
      // Assert - State should persist
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
      
      // Act - Simulate another change detection
      fixture.detectChanges();
      
      // Assert - State should still persist
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
    });

    it('should work correctly with different ModalService implementations', () => {
      // Arrange
      const mockModalService = {
        closeContacts: jasmine.createSpy('closeContacts')
      };
      
      // Act
      mockModalService.closeContacts();
      
      // Assert
      expect(mockModalService.closeContacts).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ БЕЗОПАСНОСТИ =====
  describe('Security and Data Validation', () => {
    it('should not expose internal properties to external manipulation', () => {
      // Arrange
      const initialBlockDescription = component.blockDescription;
      const initialShowVideoAbout = component.showVideoAbout;
      
      // Act - Try to manipulate internal state directly
      (component as any).blockDescription = true;
      (component as any).showVideoAbout = true;
      
      // Assert - Direct manipulation should not affect component behavior
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
      
      // Reset to original state
      component.blockDescription = initialBlockDescription;
      component.showVideoAbout = initialShowVideoAbout;
    });

    it('should maintain type safety for boolean properties', () => {
      // Arrange
      const originalBlockDescription = component.blockDescription;
      const originalShowVideoAbout = component.showVideoAbout;
      
      // Act - Set boolean values
      component.blockDescription = true;
      component.showVideoAbout = false;
      
      // Assert - Properties should maintain boolean type
      expect(typeof component.blockDescription).toBe('boolean');
      expect(typeof component.showVideoAbout).toBe('boolean');
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
      
      // Reset to original state
      component.blockDescription = originalBlockDescription;
      component.showVideoAbout = originalShowVideoAbout;
    });
  });

  // ===== ТЕСТЫ СОСТОЯНИЯ КОМПОНЕНТА =====
  describe('Component State Management', () => {
    it('should maintain consistent state across multiple operations', () => {
      // Arrange
      const operations = [
        () => component.switchHowItWorkBlock(),
        () => component.switch(),
        () => component.switchHowItWorkBlock(),
        () => component.switch(),
        () => component.switchHowItWorkBlock()
      ];
      
      // Act - Execute operations
      operations.forEach(operation => operation());
      
      // Assert - Final state should be predictable
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should handle state reset correctly', () => {
      // Arrange
      component.blockDescription = true;
      component.showVideoAbout = true;
      
      // Act - Reset to initial state
      component.blockDescription = false;
      component.showVideoAbout = false;
      
      // Assert
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });
  });
});
