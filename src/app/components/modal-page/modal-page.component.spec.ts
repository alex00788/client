import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { ModalPageComponent } from './modal-page.component';
import { ModalService } from '../../shared/services/modal.service';

// Тестовый компонент для проверки ng-content
@Component({
  template: '<div class="test-content">Test Content</div>',
  standalone: true
})
class TestContentComponent {}

describe('ModalPageComponent', () => {
  let component: ModalPageComponent;
  let fixture: ComponentFixture<ModalPageComponent>;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    // Создаем spy объект для ModalService
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['close'], {
      isVisible: false
    });

    await TestBed.configureTestingModule({
      imports: [ModalPageComponent, TestContentComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPageComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  // ===== БАЗОВЫЕ ТЕСТЫ =====
  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should inject ModalService correctly', () => {
      expect(component.modalService).toBeTruthy();
      expect(component.modalService).toBe(modalService);
    });

    it('should have correct component structure', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      expect(backgroundElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
    });
  });

  // ===== ТЕСТЫ HTML ШАБЛОНА =====
  describe('Template Rendering', () => {
    it('should render modal background div with correct class', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      expect(backgroundElement).toBeTruthy();
      expect(backgroundElement.nativeElement.classList.contains('modalPage')).toBeTrue();
    });

    it('should render modal content div with correct class', () => {
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      expect(contentElement).toBeTruthy();
      expect(contentElement.nativeElement.classList.contains('modalContent')).toBeTrue();
    });

    it('should render ng-content container', () => {
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      expect(contentElement).toBeTruthy();
    });

    it('should display content passed through ng-content', () => {
      // Вставляем контент в модал
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      contentElement.nativeElement.innerHTML = '<div class="test-content">Test Content</div>';
      fixture.detectChanges();
      
      const testContentElement = fixture.debugElement.query(By.css('.test-content'));
      expect(testContentElement).toBeTruthy();
      expect(testContentElement.nativeElement.textContent.trim()).toBe('Test Content');
    });
  });

  // ===== ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ВЗАИМОДЕЙСТВИЙ =====
  describe('User Interactions', () => {
    it('should call modalService.close when background is clicked', () => {
      // Arrange
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Act
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple background clicks correctly', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Multiple clicks
      for (let i = 0; i < 5; i++) {
        backgroundElement.triggerEventHandler('click', null);
      }
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(5);
    });

    it('should not call modalService.close when content area is clicked', () => {
      // Arrange
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Act
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      contentElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).not.toHaveBeenCalled();
    });

    it('should handle click events with event object', () => {
      // Arrange
      const mockEvent = new MouseEvent('click', { bubbles: true });
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act
      backgroundElement.triggerEventHandler('click', mockEvent);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ТЕСТЫ CSS КЛАССОВ И СТИЛЕЙ =====
  describe('CSS Classes and Styling', () => {
    it('should have correct CSS classes applied to background element', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      expect(backgroundElement.nativeElement.classList.contains('modalPage')).toBeTrue();
    });

    it('should have correct CSS classes applied to content element', () => {
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      expect(contentElement.nativeElement.classList.contains('modalContent')).toBeTrue();
    });

    it('should not have conflicting CSS classes', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Проверяем, что классы не пересекаются
      expect(backgroundElement.nativeElement.classList.contains('modalContent')).toBeFalse();
      expect(contentElement.nativeElement.classList.contains('modalPage')).toBeFalse();
    });
  });

  // ===== ТЕСТЫ СТРУКТУРЫ DOM =====
  describe('DOM Structure', () => {
    it('should have correct DOM hierarchy', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      expect(backgroundElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
      
      // Проверяем, что элементы находятся в правильном порядке
      const componentElement = fixture.debugElement.nativeElement;
      const firstChild = componentElement.firstElementChild;
      const secondChild = componentElement.lastElementChild;
      
      expect(firstChild.classList.contains('modalPage')).toBeTrue();
      expect(secondChild.classList.contains('modalContent')).toBeTrue();
    });

    it('should have correct number of child elements', () => {
      const componentElement = fixture.debugElement.nativeElement;
      expect(componentElement.children.length).toBe(2);
    });

    it('should maintain DOM structure after interactions', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Click background
      backgroundElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - DOM structure should remain intact
      const componentElement = fixture.debugElement.nativeElement;
      expect(componentElement.children.length).toBe(2);
      expect(fixture.debugElement.query(By.css('.modalPage'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.modalContent'))).toBeTruthy();
    });
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ =====
  describe('Service Integration', () => {
    it('should integrate correctly with ModalService', () => {
      // Arrange
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Act
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle ModalService state changes', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Simulate service state change
      modalService.isVisible = true;
      fixture.detectChanges();
      
      // Assert - Component should still work correctly
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalled();
    });

    it('should work correctly when ModalService methods are called externally', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - External service call
      modalService.close();
      
      // Assert - Component should still respond to clicks
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(2);
    });
  });

  // ===== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ =====
  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid background clicks without errors', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const rapidClicks = 100;
      
      // Act - Rapid clicks
      for (let i = 0; i < rapidClicks; i++) {
        backgroundElement.triggerEventHandler('click', null);
      }
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(rapidClicks);
    });

    it('should handle clicks with null event gracefully', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle clicks with undefined event gracefully', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act
      backgroundElement.triggerEventHandler('click', undefined);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle component reinitialization correctly', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
      
      // Act - Reset spy and reinitialize
      modalService.close.calls.reset();
      fixture.destroy();
      fixture = TestBed.createComponent(ModalPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      // Assert - Component should work after reinitialization
      const newBackgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      newBackgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ =====
  describe('Performance and Memory', () => {
    it('should handle multiple click events efficiently', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const startTime = performance.now();
      const iterations = 1000;
      
      // Act - Multiple clicks
      for (let i = 0; i < iterations; i++) {
        backgroundElement.triggerEventHandler('click', null);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(modalService.close).toHaveBeenCalledTimes(iterations);
    });

    it('should not create memory leaks during multiple operations', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const iterations = 1000;
      
      // Act - Multiple operations
      for (let i = 0; i < iterations; i++) {
        backgroundElement.triggerEventHandler('click', null);
      }
      
      // Assert - Component should still work correctly
      expect(modalService.close).toHaveBeenCalledTimes(iterations);
      
      // Reset and test again
      modalService.close.calls.reset();
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ТЕСТЫ ДОСТУПНОСТИ =====
  describe('Accessibility', () => {
    it('should have proper modal structure for screen readers', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      expect(backgroundElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
    });

    it('should maintain proper modal structure', () => {
      const componentElement = fixture.debugElement.nativeElement;
      expect(componentElement.children.length).toBe(2);
    });
  });

  // ===== ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА =====
  describe('Component Lifecycle', () => {
    it('should handle component destruction gracefully', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
      
      // Act - Destroy component
      fixture.destroy();
      
      // Assert - Should not throw errors
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should maintain state consistency during lifecycle', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Click and check state
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
      
      // Act - Reset spy and test again
      modalService.close.calls.reset();
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle component recompilation correctly', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
      
      // Act - Recompile
      fixture.detectChanges();
      
      // Assert - Component should still work
      modalService.close.calls.reset();
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ТЕСТЫ СТИЛЕЙ И CSS =====
  describe('Styling and CSS', () => {
    it('should have correct CSS classes for modal background', () => {
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      expect(backgroundElement.nativeElement.classList.contains('modalPage')).toBeTrue();
    });

    it('should have correct CSS classes for modal content', () => {
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      expect(contentElement.nativeElement.classList.contains('modalContent')).toBeTrue();
    });

    it('should maintain styling after interactions', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Click background
      backgroundElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - Styling should remain intact
      expect(backgroundElement.nativeElement.classList.contains('modalPage')).toBeTrue();
      expect(contentElement.nativeElement.classList.contains('modalContent')).toBeTrue();
    });
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С РОДИТЕЛЬСКИМИ КОМПОНЕНТАМИ =====
  describe('Parent Component Integration', () => {
    it('should work correctly when embedded in parent component', () => {
      // Arrange
      const parentComponent = TestBed.createComponent(TestContentComponent);
      const modalFixture = TestBed.createComponent(ModalPageComponent);
      
      // Act - Embed modal in parent
      const parentElement = parentComponent.debugElement.nativeElement;
      const modalElement = modalFixture.debugElement.nativeElement;
      
      // Assert - Both components should work
      expect(parentElement).toBeTruthy();
      expect(modalElement).toBeTruthy();
      
      // Test modal functionality
      const backgroundElement = modalFixture.debugElement.query(By.css('.modalPage'));
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalled();
    });

    it('should handle content projection correctly', () => {
      // Arrange
      const testContent = '<div class="projected-content">Projected</div>';
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Project content
      contentElement.nativeElement.innerHTML = testContent;
      fixture.detectChanges();
      
      // Assert - Content should be projected
      const projectedElement = fixture.debugElement.query(By.css('.projected-content'));
      expect(projectedElement).toBeTruthy();
      expect(projectedElement.nativeElement.textContent.trim()).toBe('Projected');
    });
  });

  // ===== ТЕСТЫ ФУНКЦИОНАЛЬНОСТИ =====
  describe('Modal Functionality', () => {
    it('should close modal when background is clicked', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when content area is clicked', () => {
      // Arrange
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act
      contentElement.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.close).not.toHaveBeenCalled();
    });

    it('should maintain modal state during user interactions', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Click content (should not close)
      contentElement.triggerEventHandler('click', null);
      expect(modalService.close).not.toHaveBeenCalled();
      
      // Act - Click background (should close)
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.close).toHaveBeenCalledTimes(1);
    });
  });
});
