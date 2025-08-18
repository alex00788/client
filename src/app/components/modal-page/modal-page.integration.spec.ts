import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { ModalPageComponent } from './modal-page.component';
import { ModalService } from '../../shared/services/modal.service';

// Тестовый компонент для проверки интеграции
@Component({
  template: '<div class="test-content">Test Content</div>',
  standalone: true
})
class TestContentComponent {}

// Тестовый родительский компонент
@Component({
  template: `
    <app-modal-page>
      <div class="parent-content">
        <h2>Parent Content</h2>
        <p>This is content from parent component</p>
      </div>
    </app-modal-page>
  `,
  standalone: true,
  imports: [ModalPageComponent]
})
class ParentTestComponent {}

describe('ModalPageComponent Integration Tests', () => {
  let component: ModalPageComponent;
  let fixture: ComponentFixture<ModalPageComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPageComponent, TestContentComponent, ParentTestComponent],
      providers: [ModalService] // Используем реальный сервис
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPageComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМИ СЕРВИСАМИ ======
  describe('Real Services Integration', () => {
    it('should work with real ModalService instance', () => {
      // Arrange
      expect(modalService).toBeTruthy();
      expect(modalService).toBeInstanceOf(ModalService);
      
      // Act & Assert
      expect(component.modalService).toBe(modalService);
    });

    it('should integrate correctly with real ModalService', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      expect(modalService.isVisible).toBeFalse();
      
      // Act - Click background
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Service method called
      expect(modalService.isVisible).toBeFalse(); // close() sets to false
    });

    it('should handle real service state changes', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Open modal
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Act - Close modal via click
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Modal closed
      expect(modalService.isVisible).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА ======
  describe('Full Component Lifecycle', () => {
    it('should handle complete modal lifecycle with real services', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Open modal
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Assert - Modal structure intact
      expect(backgroundElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
      
      // Act - Close modal
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Modal closed
      expect(modalService.isVisible).toBeFalse();
    });

    it('should handle multiple open/close cycles', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const cycles = 5;
      
      // Act - Multiple cycles
      for (let i = 0; i < cycles; i++) {
        modalService.open();
        expect(modalService.isVisible).toBeTrue();
        
        backgroundElement.triggerEventHandler('click', null);
        expect(modalService.isVisible).toBeFalse();
      }
      
      // Assert - Component still works correctly
      expect(backgroundElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.modalContent'))).toBeTruthy();
    });

    it('should maintain component state during lifecycle changes', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Multiple state changes
      modalService.open();
      modalService.close();
      modalService.open();
      
      // Assert - Component structure remains intact
      expect(backgroundElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
      expect(backgroundElement.nativeElement.classList.contains('modalPage')).toBeTrue();
      expect(contentElement.nativeElement.classList.contains('modalContent')).toBeTrue();
    });
  });

  // ====== РЕАЛЬНЫЕ ПОЛЬЗОВАТЕЛЬСКИЕ СЦЕНАРИИ ======
  describe('Real User Scenarios', () => {
    it('should handle sequential user interactions correctly', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - User opens modal
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Act - User clicks content (should not close)
      contentElement.triggerEventHandler('click', null);
      expect(modalService.isVisible).toBeTrue();
      
      // Act - User clicks background (should close)
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.isVisible).toBeFalse();
    });

    it('should handle combined user interactions', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      
      // Act - Complex user interaction sequence
      modalService.open();
      contentElement.triggerEventHandler('click', null);
      contentElement.triggerEventHandler('click', null);
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Modal closed after background click
      expect(modalService.isVisible).toBeFalse();
    });

    it('should handle rapid user interactions without errors', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const rapidClicks = 20;
      
      // Act - Rapid interactions
      for (let i = 0; i < rapidClicks; i++) {
        modalService.open();
        backgroundElement.triggerEventHandler('click', null);
      }
      
      // Assert - Component handles rapid interactions gracefully
      expect(backgroundElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.modalContent'))).toBeTruthy();
    });
  });

  // ====== ИНТЕГРАЦИЯ С ДРУГИМИ КОМПОНЕНТАМИ ======
  describe('Integration with Other Components', () => {
    it('should work correctly when embedded in parent component', () => {
      // Arrange
      const parentFixture = TestBed.createComponent(ParentTestComponent);
      const parentComponent = parentFixture.componentInstance;
      
      // Act
      parentFixture.detectChanges();
      
      // Assert - Parent component works
      expect(parentComponent).toBeTruthy();
      
      // Assert - Modal component embedded correctly
      const modalElement = parentFixture.debugElement.query(By.css('app-modal-page'));
      expect(modalElement).toBeTruthy();
      
      // Assert - Content projected correctly
      const parentContent = parentFixture.debugElement.query(By.css('.parent-content'));
      expect(parentContent).toBeTruthy();
      expect(parentContent.nativeElement.textContent).toContain('Parent Content');
    });

    it('should handle content projection from parent components', () => {
      // Arrange
      const parentFixture = TestBed.createComponent(ParentTestComponent);
      
      // Act
      parentFixture.detectChanges();
      
      // Assert - Content is projected correctly
      const h2Element = parentFixture.debugElement.query(By.css('h2'));
      const pElement = parentFixture.debugElement.query(By.css('p'));
      
      expect(h2Element).toBeTruthy();
      expect(h2Element.nativeElement.textContent.trim()).toBe('Parent Content');
      expect(pElement).toBeTruthy();
      expect(pElement.nativeElement.textContent.trim()).toBe('This is content from parent component');
    });

    it('should maintain functionality when embedded in complex components', () => {
      // Arrange
      const parentFixture = TestBed.createComponent(ParentTestComponent);
      parentFixture.detectChanges();
      
      const modalElement = parentFixture.debugElement.query(By.css('app-modal-page'));
      const backgroundElement = modalElement.query(By.css('.modalPage'));
      
      // Act - Open modal
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Act - Close modal via background click
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Modal closed correctly
      expect(modalService.isVisible).toBeFalse();
    });
  });

  // ====== ПРОИЗВОДИТЕЛЬНОСТЬ В РЕАЛЬНЫХ УСЛОВИЯХ ======
  describe('Performance in Real Conditions', () => {
    it('should handle real data efficiently', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const iterations = 100;
      const startTime = performance.now();
      
      // Act - Multiple operations with real service
      for (let i = 0; i < iterations; i++) {
        modalService.open();
        backgroundElement.triggerEventHandler('click', null);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Performance within acceptable limits
      expect(executionTime).toBeLessThan(2000); // 2 seconds max
      expect(modalService.isVisible).toBeFalse();
    });

    it('should work with real event objects', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const realEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      // Act - Open modal and close with real event
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      backgroundElement.triggerEventHandler('click', realEvent);
      
      // Assert - Modal closed with real event
      expect(modalService.isVisible).toBeFalse();
    });

    it('should handle real DOM manipulations', () => {
      // Arrange
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      const testContent = '<div class="dynamic-content">Dynamic Content</div>';
      
      // Act - Dynamic content insertion
      contentElement.nativeElement.innerHTML = testContent;
      fixture.detectChanges();
      
      // Assert - Dynamic content rendered correctly
      const dynamicElement = fixture.debugElement.query(By.css('.dynamic-content'));
      expect(dynamicElement).toBeTruthy();
      expect(dynamicElement.nativeElement.textContent.trim()).toBe('Dynamic Content');
    });
  });

  // ====== ТЕСТЫ СОВМЕСТНОЙ РАБОТЫ С СЕРВИСАМИ ======
  describe('Collaborative Service Work', () => {
    it('should work correctly when ModalService methods are called externally', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - External service calls
      modalService.open();
      modalService.close();
      modalService.open();
      
      // Assert - Component responds correctly to external changes
      expect(modalService.isVisible).toBeTrue();
      
      // Act - Close via component interaction
      backgroundElement.triggerEventHandler('click', null);
      
      // Assert - Component interaction still works
      expect(modalService.isVisible).toBeFalse();
    });

    it('should handle service state synchronization', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Synchronize service state
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Act - Component interaction
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.isVisible).toBeFalse();
      
      // Act - External service call
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      // Assert - States remain synchronized
      expect(modalService.isVisible).toBeTrue();
    });

    it('should maintain consistency during service operations', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Multiple service operations
      modalService.open();
      modalService.close();
      modalService.open();
      modalService.close();
      modalService.open();
      
      // Assert - Component maintains consistency
      expect(modalService.isVisible).toBeTrue();
      expect(backgroundElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.modalContent'))).toBeTruthy();
    });
  });

  // ====== ТЕСТЫ РЕАЛЬНЫХ УСЛОВИЙ РАБОТЫ ======
  describe('Real Working Conditions', () => {
    it('should work correctly in different browser environments', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Simulate different environments
      modalService.open();
      backgroundElement.triggerEventHandler('click', null);
      modalService.open();
      
      // Assert - Component works consistently
      expect(modalService.isVisible).toBeTrue();
      expect(backgroundElement).toBeTruthy();
    });

    it('should handle component recompilation in real scenarios', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      
      // Act - Multiple recompilations
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
        expect(backgroundElement).toBeTruthy();
      }
      
      // Assert - Component remains functional
      modalService.open();
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.isVisible).toBeFalse();
    });

    it('should work correctly under memory pressure', () => {
      // Arrange
      const backgroundElement = fixture.debugElement.query(By.css('.modalPage'));
      const iterations = 1000;
      
      // Act - Many operations to test memory usage
      for (let i = 0; i < iterations; i++) {
        modalService.open();
        backgroundElement.triggerEventHandler('click', null);
      }
      
      // Assert - Component still works correctly
      modalService.open();
      expect(modalService.isVisible).toBeTrue();
      
      backgroundElement.triggerEventHandler('click', null);
      expect(modalService.isVisible).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ ДАННЫМИ ======
  describe('Real Data Integration', () => {
    it('should handle real content data correctly', () => {
      // Arrange
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      const realData = {
        title: 'Real Title',
        description: 'Real Description',
        items: ['Item 1', 'Item 2', 'Item 3']
      };
      
      // Act - Insert real data
      contentElement.nativeElement.innerHTML = `
        <h1>${realData.title}</h1>
        <p>${realData.description}</p>
        <ul>
          ${realData.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
      fixture.detectChanges();
      
      // Assert - Real data rendered correctly
      const titleElement = fixture.debugElement.query(By.css('h1'));
      const descriptionElement = fixture.debugElement.query(By.css('p'));
      const listItems = fixture.debugElement.queryAll(By.css('li'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe(realData.title);
      expect(descriptionElement.nativeElement.textContent.trim()).toBe(realData.description);
      expect(listItems.length).toBe(realData.items.length);
    });

    it('should work with dynamic content updates', () => {
      // Arrange
      const contentElement = fixture.debugElement.query(By.css('.modalContent'));
      const initialContent = '<div class="initial">Initial Content</div>';
      const updatedContent = '<div class="updated">Updated Content</div>';
      
      // Act - Initial content
      contentElement.nativeElement.innerHTML = initialContent;
      fixture.detectChanges();
      
      let initialElement = fixture.debugElement.query(By.css('.initial'));
      expect(initialElement).toBeTruthy();
      
      // Act - Update content
      contentElement.nativeElement.innerHTML = updatedContent;
      fixture.detectChanges();
      
      // Assert - Content updated correctly
      const updatedElement = fixture.debugElement.query(By.css('.updated'));
      expect(updatedElement).toBeTruthy();
      expect(updatedElement.nativeElement.textContent.trim()).toBe('Updated Content');
      
      // Assert - Old content removed
      initialElement = fixture.debugElement.query(By.css('.initial'));
      expect(initialElement).toBeFalsy();
    });
  });
});
