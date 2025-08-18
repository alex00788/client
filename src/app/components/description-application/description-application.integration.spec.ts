import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DescriptionApplicationComponent } from './description-application.component';
import { ModalService } from '../../shared/services/modal.service';

describe('DescriptionApplicationComponent Integration Tests', () => {
  let component: DescriptionApplicationComponent;
  let fixture: ComponentFixture<DescriptionApplicationComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionApplicationComponent],
      providers: [ModalService] // Используем реальный сервис
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionApplicationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  // ===== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Real ModalService Integration', () => {
    it('should work with real ModalService instance', () => {
      // Arrange
      expect(modalService).toBeTruthy();
      expect(modalService).toBeInstanceOf(ModalService);
      
      // Act & Assert
      expect(component.modalService).toBe(modalService);
    });

    it('should call real ModalService.closeContacts method', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act
      closeButton.triggerEventHandler('click', null);
      
      // Assert - Service method should be called
      expect(modalService.appContacts$.value).toBeFalse();
    });

    it('should maintain service state consistency', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Open contacts first
      modalService.openAppContacts();
      expect(modalService.appContacts$.value).toBeTrue();
      
      // Act - Close contacts
      closeButton.triggerEventHandler('click', null);
      
      // Assert
      expect(modalService.appContacts$.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА =====
  describe('Full Component Lifecycle', () => {
    it('should handle complete component lifecycle with real service', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Simulate full user interaction cycle
      // 1. Open description
      component.switchHowItWorkBlock();
      fixture.detectChanges();
      
      // 2. Open video
      component.switch();
      fixture.detectChanges();
      
      // 3. Close description
      component.switchHowItWorkBlock();
      fixture.detectChanges();
      
      // 4. Close modal
      closeButton.triggerEventHandler('click', null);
      
      // Assert - Final states
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      expect(modalService.appContacts$.value).toBeFalse();
    });

    it('should handle multiple open/close cycles', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Multiple cycles
      for (let i = 0; i < 3; i++) {
        // Open contacts
        modalService.openAppContacts();
        expect(modalService.appContacts$.value).toBeTrue();
        
        // Close contacts
        closeButton.triggerEventHandler('click', null);
        expect(modalService.appContacts$.value).toBeFalse();
      }
      
      // Assert - Final state should be closed
      expect(modalService.appContacts$.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Performance with Real Service', () => {
    it('should handle rapid interactions efficiently with real service', () => {
      // Arrange
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Rapid interactions
      for (let i = 0; i < iterations; i++) {
        component.switch();
        component.switchHowItWorkBlock();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(50);
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should handle rapid service calls efficiently', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      const startTime = performance.now();
      const iterations = 50;
      
      // Act - Rapid service calls
      for (let i = 0; i < iterations; i++) {
        modalService.openAppContacts();
        closeButton.triggerEventHandler('click', null);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(100);
      expect(modalService.appContacts$.value).toBeFalse();
    });
  });

  // ===== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ =====
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(DescriptionApplicationComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Act - Modify first component
      component.switchHowItWorkBlock();
      component.switch();
      
      // Act - Modify second component
      component2.switchHowItWorkBlock();
      
      // Assert - Components should be independent
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
      expect(component2.blockDescription).toBeTrue();
      expect(component2.showVideoAbout).toBeFalse();
      
      // Cleanup
      fixture2.destroy();
    });

    it('should share same ModalService instance across components', () => {
      // Arrange
      const fixture2 = TestBed.createComponent(DescriptionApplicationComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Assert - Both components should use same service instance
      expect(component.modalService).toBe(modalService);
      expect(component2.modalService).toBe(modalService);
      expect(component.modalService).toBe(component2.modalService);
      
      // Cleanup
      fixture2.destroy();
    });
  });

  // ===== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ =====
  describe('Asynchronous Behavior', () => {
    it('should handle async state changes correctly', async () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Simulate async operation
      setTimeout(() => {
        modalService.openAppContacts();
      }, 0);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Assert - State should be updated
      expect(modalService.appContacts$.value).toBeTrue();
      
      // Act - Close contacts
      closeButton.triggerEventHandler('click', null);
      
      // Assert - Should be closed
      expect(modalService.appContacts$.value).toBeFalse();
    });

    it('should maintain state consistency during async operations', async () => {
      // Arrange
      const promises = [];
      
      // Act - Multiple async operations
      for (let i = 0; i < 5; i++) {
        promises.push(new Promise<void>(resolve => {
          setTimeout(() => {
            component.switch();
            component.switchHowItWorkBlock();
            resolve();
          }, i * 10);
        }));
      }
      
      // Wait for all operations
      await Promise.all(promises);
      
      // Assert - Final state should be consistent
      // After 5 operations: switch() 5 times, switchHowItWorkBlock() 5 times
      // switch() toggles showVideoAbout: false -> true -> false -> true -> false -> true
      // switchHowItWorkBlock() toggles blockDescription and resets showVideoAbout
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
    });
  });

  // ===== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ =====
  describe('Additional Integration Scenarios', () => {
    it('should handle component state changes with service state changes', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Change component state
      component.switchHowItWorkBlock();
      expect(component.blockDescription).toBeTrue();
      
      // Act - Change service state
      modalService.openAppContacts();
      expect(modalService.appContacts$.value).toBeTrue();
      
      // Act - Close modal
      closeButton.triggerEventHandler('click', null);
      
      // Assert - Both states should be consistent
      expect(component.blockDescription).toBeTrue(); // Component state unchanged
      expect(modalService.appContacts$.value).toBeFalse(); // Service state changed
    });

    it('should handle rapid state changes in both component and service', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - Rapid changes
      for (let i = 0; i < 10; i++) {
        component.switch();
        modalService.openAppContacts();
        closeButton.triggerEventHandler('click', null);
      }
      
      // Assert - Final states should be predictable
      expect(component.showVideoAbout).toBeFalse();
      expect(modalService.appContacts$.value).toBeFalse();
    });
  });
});
