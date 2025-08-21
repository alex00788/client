import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DownloadAppComponent } from './download-app.component';

describe('DownloadAppComponent Integration Tests', () => {
  let component: DownloadAppComponent;
  let fixture: ComponentFixture<DownloadAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadAppComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМ КОМПОНЕНТОМ ======
  describe('Real Component Integration', () => {
    it('should work with real component instance', () => {
      expect(component).toBeTruthy();
      expect(component).toBeInstanceOf(DownloadAppComponent);
    });

    it('should maintain state consistency across multiple operations', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Multiple operations
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();

      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();

      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА ======
  describe('Full Component Lifecycle', () => {
    it('should handle complete user interaction cycle', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Complete cycle: iPhone -> Android -> iPhone
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - iPhone instructions visible
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      
      // Switch to Android
      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - Android instructions visible
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeTruthy();
      
      // Switch back to iPhone
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - Back to iPhone
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();
    });

    it('should handle multiple rapid open/close cycles', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Multiple cycles
      for (let i = 0; i < 5; i++) {
        iPhoneBtn.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.iPhone).toBeTrue();
        
        androidBtn.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.Android).toBeTrue();
      }
      
      // Assert - Final state should be Android
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });
  });

  // ====== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМ КОМПОНЕНТОМ ======
  describe('Performance with Real Component', () => {
    it('should handle rapid interactions efficiently with real component', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      const startTime = performance.now();
      const iterations = 100;
      
      // Act - Rapid interactions
      for (let i = 0; i < iterations; i++) {
        if (i % 2 === 0) {
          iPhoneBtn.triggerEventHandler('click', null);
        } else {
          androidBtn.triggerEventHandler('click', null);
        }
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
    });

    it('should handle rapid method calls efficiently', () => {
      const startTime = performance.now();
      const iterations = 1000;
      
      // Act - Rapid method calls
      for (let i = 0; i < iterations; i++) {
        component.switchPhone(i % 2 === 0 ? 'iPhone' : 'Android');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(100);
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
    });
  });

  // ====== ТЕСТЫ МНОЖЕСТВЕННЫХ ЭКЗЕМПЛЯРОВ ======
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      const fixture2 = TestBed.createComponent(DownloadAppComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Act - Modify first component
      component.switchPhone('iPhone');
      fixture.detectChanges();
      
      // Act - Modify second component
      component2.switchPhone('Android');
      fixture2.detectChanges();
      
      // Assert - Components should be independent
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      expect(component2.iPhone).toBeFalse();
      expect(component2.Android).toBeTrue();
      
      // Cleanup
      fixture2.destroy();
    });

    it('should maintain separate state for each instance', () => {
      const fixture2 = TestBed.createComponent(DownloadAppComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();
      
      // Act - Set different states
      component.switchPhone('iPhone');
      component2.switchPhone('Android');
      
      // Assert - States are independent
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      expect(component2.iPhone).toBeFalse();
      expect(component2.Android).toBeTrue();
      
      // Act - Change states
      component.switchPhone('Android');
      component2.switchPhone('iPhone');
      
      // Assert - States changed independently
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
      expect(component2.iPhone).toBeTrue();
      expect(component2.Android).toBeFalse();
      
      // Cleanup
      fixture2.destroy();
    });
  });

  // ====== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ ======
  describe('Asynchronous Behavior', () => {
    it('should handle async state changes correctly', async () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Simulate async operation
      setTimeout(() => {
        iPhoneBtn.triggerEventHandler('click', null);
      }, 0);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
      
      // Assert - State should be updated
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      
      // Act - Switch to Android
      setTimeout(() => {
        androidBtn.triggerEventHandler('click', null);
      }, 0);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
      
      // Assert - Should be Android
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });

    it('should maintain state consistency during async operations', async () => {
      const promises = [];
      
      // Act - Multiple async operations
      for (let i = 0; i < 5; i++) {
        promises.push(new Promise<void>(resolve => {
          setTimeout(() => {
            component.switchPhone(i % 2 === 0 ? 'iPhone' : 'Android');
            resolve();
          }, i * 10);
        }));
      }
      
      // Wait for all operations
      await Promise.all(promises);
      fixture.detectChanges();
      
      // Assert - Final state should be consistent
      // After 5 operations: iPhone -> Android -> iPhone -> Android -> iPhone
      // Final state should be iPhone
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });
  });

  // ====== ДОПОЛНИТЕЛЬНЫЕ ИНТЕГРАЦИОННЫЕ СЦЕНАРИИ ======
  describe('Additional Integration Scenarios', () => {
    it('should handle complex interaction patterns', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Complex pattern: iPhone -> Android -> iPhone -> Android -> iPhone
      const pattern = ['iPhone', 'Android', 'iPhone', 'Android', 'iPhone'];
      
      pattern.forEach(platform => {
        if (platform === 'iPhone') {
          iPhoneBtn.triggerEventHandler('click', null);
        } else {
          androidBtn.triggerEventHandler('click', null);
        }
        fixture.detectChanges();
      });
      
      // Assert - Final state should be iPhone
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });

    it('should handle rapid state changes in both directions', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Rapid changes
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          iPhoneBtn.triggerEventHandler('click', null);
        } else {
          androidBtn.triggerEventHandler('click', null);
        }
        fixture.detectChanges();
      }
      
      // Assert - Final states should be predictable
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
    });

    it('should maintain UI consistency during state changes', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Switch to iPhone
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - iPhone UI elements
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.instDes')).length).toBe(0);
      
      // Act - Switch to Android
      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - Android UI elements
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.instDes')).length).toBe(3);
    });
  });

  // ====== ТЕСТЫ УСТОЙЧИВОСТИ ======
  describe('Stability Tests', () => {
    it('should handle extreme number of state changes', () => {
      const iterations = 10000;
      
      // Act - Extreme number of changes
      for (let i = 0; i < iterations; i++) {
        component.switchPhone(i % 2 === 0 ? 'iPhone' : 'Android');
      }
      
      // Assert - Component should still work correctly
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
      
      // Act - One more change to verify functionality
      component.switchPhone('iPhone');
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });

    it('should maintain performance under load', () => {
      const startTime = performance.now();
      
      // Act - Load test
      for (let i = 0; i < 5000; i++) {
        component.switchPhone('iPhone');
        component.switchPhone('Android');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time
      expect(executionTime).toBeLessThan(500);
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();
    });
  });

  // ====== ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and UX', () => {
    it('should have proper button semantics and accessibility', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Assert - Proper button semantics
      buttons.forEach(button => {
        expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
        expect(button.nativeElement.getAttribute('type')).toBeFalsy(); // Default button type
      });
    });

    it('should provide clear visual feedback for state changes', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      
      // Act - Switch to iPhone
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - iPhone instructions are visible
      const iPhoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(iPhoneBlock).toBeTruthy();
      
      // Act - Switch to Android
      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Assert - Android instructions are visible
      const androidBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(androidBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeTruthy();
    });
  });
});
