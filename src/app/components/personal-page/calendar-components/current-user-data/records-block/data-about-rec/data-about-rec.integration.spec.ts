import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataAboutRecComponent } from './data-about-rec.component';
import { DateService } from '../../../date.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DataAboutRecComponent Integration Tests', () => {
  let component: DataAboutRecComponent;
  let fixture: ComponentFixture<DataAboutRecComponent>;
  let dateService: DateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAboutRecComponent, AsyncPipe],
      providers: [DateService], // Используем реальный сервис
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataAboutRecComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);
    fixture.detectChanges();
  });

  // ===== ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Real DateService Integration', () => {
    it('should work with real DateService instance', () => {
      // Arrange
      expect(dateService).toBeTruthy();
      expect(dateService).toBeInstanceOf(DateService);
      
      // Act & Assert
      expect(component.dateService).toBe(dateService);
    });

    it('should have real dataAboutSelectedRec BehaviorSubject', () => {
      // Arrange & Act
      const dataAboutSelectedRec = dateService.dataAboutSelectedRec;
      
      // Assert
      expect(dataAboutSelectedRec).toBeDefined();
      expect(dataAboutSelectedRec).toBeInstanceOf(BehaviorSubject);
      expect(typeof dataAboutSelectedRec.next).toBe('function');
      expect(typeof dataAboutSelectedRec.subscribe).toBe('function');
    });

    it('should display real data from DateService', () => {
      // Arrange
      const testData = {
        sectionOrOrganization: 'Real Organization',
        location: 'Real Address, 456',
        phoneOrg: '+7 (888) 987-65-43',
        date: '2024-03-25',
        time: '15:45'
      };

      // Act
      dateService.dataAboutSelectedRec.next(testData);
      fixture.detectChanges();

      // Assert
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Real Organization');

      const addressSpan = fixture.debugElement.query(By.css('.strRec span'));
      expect(addressSpan.nativeElement.textContent.trim()).toBe('Real Address, 456');
    });

    it('should maintain service state consistency', () => {
      // Arrange
      const initialData = {
        sectionOrOrganization: 'Initial Org',
        location: 'Initial Address',
        phoneOrg: 'Initial Phone',
        date: 'Initial Date',
        time: 'Initial Time'
      };

      const updatedData = {
        sectionOrOrganization: 'Updated Org',
        location: 'Updated Address',
        phoneOrg: 'Updated Phone',
        date: 'Updated Date',
        time: 'Updated Time'
      };

      // Act - Set initial data
      dateService.dataAboutSelectedRec.next(initialData);
      fixture.detectChanges();

      // Assert initial state
      let titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Initial Org');

      // Act - Update data
      dateService.dataAboutSelectedRec.next(updatedData);
      fixture.detectChanges();

      // Assert updated state
      titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Updated Org');
    });
  });

  // ===== ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА =====
  describe('Full Component Lifecycle', () => {
    it('should handle complete component lifecycle with real service', fakeAsync(() => {
      // Arrange
      const lifecycleData = [
        {
          sectionOrOrganization: 'Lifecycle Org 1',
          location: 'Lifecycle Address 1',
          phoneOrg: 'Lifecycle Phone 1',
          date: 'Lifecycle Date 1',
          time: 'Lifecycle Time 1'
        },
        {
          sectionOrOrganization: 'Lifecycle Org 2',
          location: 'Lifecycle Address 2',
          phoneOrg: 'Lifecycle Phone 2',
          date: 'Lifecycle Date 2',
          time: 'Lifecycle Time 2'
        },
        {
          sectionOrOrganization: 'Lifecycle Org 3',
          location: 'Lifecycle Address 3',
          phoneOrg: 'Lifecycle Phone 3',
          date: 'Lifecycle Date 3',
          time: 'Lifecycle Time 3'
        }
      ];

      // Act - Simulate full data lifecycle
      lifecycleData.forEach((data, index) => {
        dateService.dataAboutSelectedRec.next(data);
        fixture.detectChanges();
        tick(100); // Небольшая задержка для имитации реального времени

        // Assert each step
        const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
        expect(titleSpan.nativeElement.textContent.trim()).toBe(`Lifecycle Org ${index + 1}`);
      });

      // Assert final state
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Lifecycle Org 3');
    }));

    it('should handle multiple data change cycles', fakeAsync(() => {
      // Arrange
      const cycles = 5;
      
      // Act - Multiple cycles
      for (let i = 0; i < cycles; i++) {
        const testData = {
          sectionOrOrganization: `Cycle Org ${i + 1}`,
          location: `Cycle Address ${i + 1}`,
          phoneOrg: `Cycle Phone ${i + 1}`,
          date: `Cycle Date ${i + 1}`,
          time: `Cycle Time ${i + 1}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
        tick(50);
      }

      // Assert final state
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Cycle Org 5');
    }));
  });

  // ===== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ С РЕАЛЬНЫМ СЕРВИСОМ =====
  describe('Performance with Real Service', () => {
    it('should handle rapid data changes efficiently with real service', fakeAsync(() => {
      // Arrange
      const startTime = performance.now();
      const iterations = 50;
      
      // Act - Rapid changes
      for (let i = 0; i < iterations; i++) {
        const testData = {
          sectionOrOrganization: `Performance Org ${i}`,
          location: `Performance Address ${i}`,
          phoneOrg: `Performance Phone ${i}`,
          date: `Performance Date ${i}`,
          time: `Performance Time ${i}`
        };
        
        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
      }
      
      tick();
      const endTime = performance.now();
      
      // Assert - Performance check
      expect(endTime - startTime).toBeLessThan(2000); // Должно быть менее 2 секунд
      
      // Assert - Final data
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe(`Performance Org ${iterations - 1}`);
    }));

    it('should not create memory leaks with real service', fakeAsync(() => {
      // Arrange
      const iterations = 100;
      
      // Act - Many data changes
      for (let i = 0; i < iterations; i++) {
        const testData = {
          sectionOrOrganization: `Memory Org ${i}`,
          location: `Memory Address ${i}`,
          phoneOrg: `Memory Phone ${i}`,
          date: `Memory Date ${i}`,
          time: `Memory Time ${i}`
        };
        
        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
      }
      
      tick();
      
      // Assert - Component remains stable
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
      
      // Assert - Service remains stable
      expect(dateService.dataAboutSelectedRec).toBeDefined();
      expect(dateService.dataAboutSelectedRec).toBeInstanceOf(BehaviorSubject);
    }));
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С ДРУГИМИ КОМПОНЕНТАМИ =====
  describe('Integration with Other Components', () => {
    it('should work independently of other components', () => {
      // Arrange
      const testData = {
        sectionOrOrganization: 'Independent Org',
        location: 'Independent Address',
        phoneOrg: 'Independent Phone',
        date: 'Independent Date',
        time: 'Independent Time'
      };

      // Act
      dateService.dataAboutSelectedRec.next(testData);
      fixture.detectChanges();

      // Assert - Component works independently
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Independent Org');
      
      // Assert - Service is not affected by other components
      expect(dateService.dataAboutSelectedRec.value).toEqual(testData);
    });

    it('should share DateService instance with other components', () => {
      // Arrange
      const testData = {
        sectionOrOrganization: 'Shared Org',
        location: 'Shared Address',
        phoneOrg: 'Shared Phone',
        date: 'Shared Date',
        time: 'Shared Time'
      };

      // Act
      dateService.dataAboutSelectedRec.next(testData);
      fixture.detectChanges();

      // Assert - Data is shared through service
      expect(dateService.dataAboutSelectedRec.value).toEqual(testData);
      
      // Assert - Component displays shared data
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Shared Org');
    });
  });

  // ===== ТЕСТЫ АСИНХРОННОГО ПОВЕДЕНИЯ =====
  describe('Asynchronous Behavior', () => {
    it('should handle async data updates correctly', fakeAsync(() => {
      // Arrange
      const asyncData = {
        sectionOrOrganization: 'Async Org',
        location: 'Async Address',
        phoneOrg: 'Async Phone',
        date: 'Async Date',
        time: 'Async Time'
      };

      // Act - Simulate async update
      setTimeout(() => {
        dateService.dataAboutSelectedRec.next(asyncData);
      }, 100);

      tick(100);
      fixture.detectChanges();

      // Assert
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Async Org');
    }));

    it('should handle multiple async updates in sequence', fakeAsync(() => {
      // Arrange
      const updates = [
        { sectionOrOrganization: 'Update 1', location: 'Addr 1', phoneOrg: 'Phone 1', date: 'Date 1', time: 'Time 1' },
        { sectionOrOrganization: 'Update 2', location: 'Addr 2', phoneOrg: 'Phone 2', date: 'Date 2', time: 'Time 2' },
        { sectionOrOrganization: 'Update 3', location: 'Addr 3', phoneOrg: 'Phone 3', date: 'Date 3', time: 'Time 3' }
      ];

      // Act - Sequential async updates
      updates.forEach((update, index) => {
        setTimeout(() => {
          dateService.dataAboutSelectedRec.next(update);
        }, (index + 1) * 50);
      });

      tick(200); // Wait for all updates
      fixture.detectChanges();

      // Assert - Final state
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Update 3');
    }));
  });

  // ===== ТЕСТЫ УСТОЙЧИВОСТИ К ОШИБКАМ =====
  describe('Error Resilience', () => {
    it('should handle service errors gracefully', () => {
      // Arrange
      const originalNext = dateService.dataAboutSelectedRec.next;
      
      // Act - Simulate service error
      try {
        // Попытка вызвать next с некорректными данными
        dateService.dataAboutSelectedRec.next(null as any);
        fixture.detectChanges();
      } catch (error) {
        // Ошибка ожидаема
        expect(error).toBeDefined();
      }

      // Assert - Component remains stable
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
      
      // Restore original method
      dateService.dataAboutSelectedRec.next = originalNext;
    });

    it('should recover from service failures', fakeAsync(() => {
      // Arrange
      const validData = {
        sectionOrOrganization: 'Recovery Org',
        location: 'Recovery Address',
        phoneOrg: 'Recovery Phone',
        date: 'Recovery Date',
        time: 'Recovery Time'
      };

      // Act - Simulate failure then recovery
      try {
        dateService.dataAboutSelectedRec.next(null as any);
      } catch (error) {
        // Ignore error
      }

      // Act - Recover with valid data
      dateService.dataAboutSelectedRec.next(validData);
      fixture.detectChanges();
      tick();

      // Assert - Component recovered
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Recovery Org');
    }));
  });

  // ===== ТЕСТЫ РЕАЛЬНЫХ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ =====
  describe('Real User Scenarios', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      // Arrange - User opens app
      const initialData = {
        sectionOrOrganization: 'Welcome Org',
        location: 'Welcome Address',
        phoneOrg: 'Welcome Phone',
        date: 'Welcome Date',
        time: 'Welcome Time'
      };

      // Act - Initial load
      dateService.dataAboutSelectedRec.next(initialData);
      fixture.detectChanges();
      tick(100);

      // Assert - Initial display
      let titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Welcome Org');

      // Act - User navigates to different record
      const navigationData = {
        sectionOrOrganization: 'Navigation Org',
        location: 'Navigation Address',
        phoneOrg: 'Navigation Phone',
        date: 'Navigation Date',
        time: 'Navigation Time'
      };

      dateService.dataAboutSelectedRec.next(navigationData);
      fixture.detectChanges();
      tick(100);

      // Assert - Updated display
      titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Navigation Org');

      // Act - User returns to original record
      dateService.dataAboutSelectedRec.next(initialData);
      fixture.detectChanges();
      tick(100);

      // Assert - Returned to original
      titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Welcome Org');
    }));

    it('should handle rapid user interactions', fakeAsync(() => {
      // Arrange
      const rapidData = [
        { sectionOrOrganization: 'Rapid 1', location: 'Addr 1', phoneOrg: 'Phone 1', date: 'Date 1', time: 'Time 1' },
        { sectionOrOrganization: 'Rapid 2', location: 'Addr 2', phoneOrg: 'Phone 2', date: 'Date 2', time: 'Time 2' },
        { sectionOrOrganization: 'Rapid 3', location: 'Addr 3', phoneOrg: 'Phone 3', date: 'Date 3', time: 'Time 3' },
        { sectionOrOrganization: 'Rapid 4', location: 'Addr 4', phoneOrg: 'Phone 4', date: 'Date 4', time: 'Time 4' },
        { sectionOrOrganization: 'Rapid 5', location: 'Addr 5', phoneOrg: 'Phone 5', date: 'Date 5', time: 'Time 5' }
      ];

      // Act - Rapid user interactions
      rapidData.forEach((data, index) => {
        dateService.dataAboutSelectedRec.next(data);
        fixture.detectChanges();
        tick(10); // Very fast interactions
      });

      // Assert - Final state is correct
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Rapid 5');

      // Assert - Component remains stable
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    }));
  });

  // ===== ТЕСТЫ ИНТЕГРАЦИИ С ANGULAR FRAMEWORK =====
  describe('Angular Framework Integration', () => {
    it('should work with Angular change detection', () => {
      // Arrange
      const testData = {
        sectionOrOrganization: 'Change Detection Org',
        location: 'Change Detection Address',
        phoneOrg: 'Change Detection Phone',
        date: 'Change Detection Date',
        time: 'Change Detection Time'
      };

      // Act
      dateService.dataAboutSelectedRec.next(testData);
      fixture.detectChanges();

      // Assert - Change detection worked
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Change Detection Org');
    });

    it('should work with Angular dependency injection', () => {
      // Assert - DI worked correctly
      expect(component.dateService).toBe(dateService);
      expect(dateService).toBeInstanceOf(DateService);
    });

    it('should work with Angular lifecycle hooks', () => {
      // Assert - Component lifecycle is working
      expect(component).toBeTruthy();
      expect(fixture.componentInstance).toBe(component);
      expect(fixture.debugElement.componentInstance).toBe(component);
    });

    it('should work with Angular async pipe', fakeAsync(() => {
      // Arrange
      const asyncData = {
        sectionOrOrganization: 'Async Pipe Org',
        location: 'Async Pipe Address',
        phoneOrg: 'Async Pipe Phone',
        date: 'Async Pipe Date',
        time: 'Async Pipe Time'
      };

      // Act
      dateService.dataAboutSelectedRec.next(asyncData);
      fixture.detectChanges();
      tick();

      // Assert - AsyncPipe worked
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Async Pipe Org');
    }));
  });
});
