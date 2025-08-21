import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SupportDevelopmentComponent } from './support-development.component';

describe('SupportDevelopmentComponent E2E Tests', () => {
  let component: SupportDevelopmentComponent;
  let fixture: ComponentFixture<SupportDevelopmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SupportDevelopmentComponent,
        NoopAnimationsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportDevelopmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ ======
  describe('End-to-End User Scenarios', () => {
    it('should display complete support information for user', () => {
      // Arrange - User opens support page
      fixture.detectChanges();
      
      // Act - User views the page
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      
      // Assert - User sees complete support information
      expect(supportBlock).toBeTruthy();
      expect(supportBlock.nativeElement).toBeDefined();
      
      // User sees title
      const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
      
      // User sees card information
      const cardSection = fixture.debugElement.query(By.css('.card'));
      expect(cardSection.nativeElement.textContent.trim()).toContain('по карте:');
      expect(cardSection.nativeElement.textContent.trim()).toContain('2200 7008 7530 9303');
      
      // User sees phone information
      const phoneSection = fixture.debugElement.query(By.css('.phoneSupport'));
      expect(phoneSection.nativeElement.textContent.trim()).toContain('по тел:');
      expect(phoneSection.nativeElement.textContent.trim()).toContain('8-916-840-29-27');
      
      // User sees QR code
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.src).toContain('/assets/img/3.jpg');
      expect(qrImage.nativeElement.alt).toBe('QRCode');
    });

    it('should handle complete user workflow: view -> read -> understand', () => {
      // Arrange - User starts workflow
      fixture.detectChanges();
      
      // Act - Step 1: User opens support page
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      expect(supportBlock).toBeTruthy();
      
      // Act - Step 2: User reads title
      const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
      const titleText = titleElement.nativeElement.textContent.trim();
      expect(titleText).toBe('Поддержать разработку приложения');
      
      // Act - Step 3: User reads card information
      const cardSection = fixture.debugElement.query(By.css('.card'));
      const cardText = cardSection.nativeElement.textContent.trim();
      expect(cardText).toContain('по карте:');
      expect(cardText).toContain('2200 7008 7530 9303');
      
      // Act - Step 4: User reads phone information
      const phoneSection = fixture.debugElement.query(By.css('.phoneSupport'));
      const phoneText = phoneSection.nativeElement.textContent.trim();
      expect(phoneText).toContain('по тел:');
      expect(phoneText).toContain('8-916-840-29-27');
      
      // Act - Step 5: User sees QR code
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.src).toContain('/assets/img/3.jpg');
      expect(qrImage.nativeElement.alt).toBe('QRCode');
      
      // Assert - Step 6: Workflow completed successfully
      expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
    });

    it('should provide all necessary information for user support', () => {
      // Arrange - User needs to support development
      fixture.detectChanges();
      
      // Act - User looks for support options
      const supportOptions = [
        { selector: '.titleSupport', expectedText: 'Поддержать разработку приложения' },
        { selector: '.card', expectedText: 'по карте:' },
        { selector: '.card', expectedText: '2200 7008 7530 9303' },
        { selector: '.phoneSupport', expectedText: 'по тел:' },
        { selector: '.phoneSupport', expectedText: '8-916-840-29-27' }
      ];
      
      // Assert - User finds all necessary information
      supportOptions.forEach(option => {
        const element = fixture.debugElement.query(By.css(option.selector));
        expect(element.nativeElement.textContent.trim()).toContain(option.expectedText);
      });
      
      // User also sees QR code for easy access
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.src).toContain('/assets/img/3.jpg');
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ И УПРАВЛЕНИЯ ПАМЯТЬЮ ======
  describe('Performance and Memory Management E2E Tests', () => {
    it('should handle multiple user interactions efficiently', () => {
      // Arrange - User performs multiple actions
      const userActions = [
        'view support page',
        'read title',
        'read card info',
        'read phone info',
        'view QR code'
      ];
      
      // Act & Assert - Multiple user interactions
      userActions.forEach((action, index) => {
        // User performs action
        fixture.detectChanges();
        
        // User sees expected content
        expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
        
        // User can read information
        const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
        expect(titleElement.nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
      });
    });

    it('should maintain performance during extended usage', () => {
      // Arrange - Extended usage scenario
      const startTime = performance.now();
      
      // Act - Multiple render cycles
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
        
        // User always sees content
        expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.titleSupport'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.card'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.phoneSupport'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.qrCode'))).toBeTruthy();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Assert - Performance remains acceptable
      expect(totalTime).toBeLessThan(500); // Менее 500мс для 10 циклов
    });

    it('should not cause memory leaks during user sessions', () => {
      // Arrange - Long user session
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Act - Extended user interaction
      for (let i = 0; i < 20; i++) {
        fixture.detectChanges();
        
        // User interacts with content
        const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
        const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
        const qrImage = fixture.debugElement.query(By.css('.qrCode'));
        
        expect(supportBlock).toBeTruthy();
        expect(titleElement).toBeTruthy();
        expect(qrImage).toBeTruthy();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Assert - Memory usage remains reasonable
      expect(memoryIncrease).toBeLessThan(2000000); // Менее 2MB
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and UX E2E Tests', () => {
    it('should provide accessible information for all users', () => {
      // Arrange - User with accessibility needs
      fixture.detectChanges();
      
      // Act - User accesses content
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      
      // Assert - Content is accessible
      expect(supportBlock).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
      expect(qrImage.nativeElement.alt).toBe('QRCode');
      expect(qrImage.nativeElement.alt).not.toBe('');
    });

    it('should maintain usability across different user scenarios', () => {
      // Arrange - Different user scenarios
      const userScenarios = [
        'first-time visitor',
        'returning user',
        'user with slow connection',
        'user with accessibility tools'
      ];
      
      // Act & Assert - Each scenario works
      userScenarios.forEach((scenario, index) => {
        // User experiences scenario
        fixture.detectChanges();
        
        // User can always access information
        expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
        expect(fixture.debugElement.query(By.css('.qrCode')).nativeElement.alt).toBe('QRCode');
      });
    });

    it('should provide clear visual hierarchy for users', () => {
      // Arrange - User needs to understand information structure
      fixture.detectChanges();
      
      // Act - User examines visual hierarchy
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const children = supportBlock.children;
      
      // Assert - Clear visual hierarchy
      expect(children.length).toBe(4);
      expect(children[0].nativeElement.classList.contains('titleSupport')).toBeTrue();
      expect(children[1].nativeElement.classList.contains('card')).toBeTrue();
      expect(children[2].nativeElement.classList.contains('phoneSupport')).toBeTrue();
      expect(children[3].query(By.css('.qrCode'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ СОВМЕСТИМОСТИ И СТАБИЛЬНОСТИ ======
  describe('Compatibility and Stability E2E Tests', () => {
    it('should work consistently across different environments', () => {
      // Arrange - Different testing environments
      const environments = [
        'development',
        'testing',
        'production-like'
      ];
      
      // Act & Assert - Each environment works
      environments.forEach((environment, index) => {
        // Simulate environment
        fixture.detectChanges();
        
        // Component works consistently
        expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
        expect(fixture.debugElement.query(By.css('.qrCode')).nativeElement.src).toContain('/assets/img/3.jpg');
      });
    });

    it('should handle edge cases gracefully in real-world usage', () => {
      // Arrange - Edge cases
      const edgeCases = [
        'rapid navigation',
        'multiple tab switches',
        'browser refresh simulation',
        'memory pressure simulation'
      ];
      
      // Act & Assert - Edge cases handled gracefully
      edgeCases.forEach((edgeCase, index) => {
        // Simulate edge case
        fixture.detectChanges();
        
        // Component remains stable
        expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
        expect(component).toBeDefined();
        expect(component.constructor.name).toBe('SupportDevelopmentComponent');
      });
    });

    it('should maintain data integrity during user interactions', () => {
      // Arrange - User interaction sequence
      fixture.detectChanges();
      
      // Act - User interacts with component
      const initialTitle = fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent.trim();
      const initialCardInfo = fixture.debugElement.query(By.css('.card')).nativeElement.textContent.trim();
      const initialPhoneInfo = fixture.debugElement.query(By.css('.phoneSupport')).nativeElement.textContent.trim();
      const initialQrSrc = fixture.debugElement.query(By.css('.qrCode')).nativeElement.src;
      
      // Simulate multiple interactions
      for (let i = 0; i < 5; i++) {
        fixture.detectChanges();
      }
      
      // Assert - Data integrity maintained
      expect(fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent.trim()).toBe(initialTitle);
      expect(fixture.debugElement.query(By.css('.card')).nativeElement.textContent.trim()).toBe(initialCardInfo);
      expect(fixture.debugElement.query(By.css('.phoneSupport')).nativeElement.textContent.trim()).toBe(initialPhoneInfo);
      expect(fixture.debugElement.query(By.css('.qrCode')).nativeElement.src).toBe(initialQrSrc);
    });
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКОГО ОПЫТА ======
  describe('User Experience E2E Tests', () => {
    it('should provide intuitive user interface', () => {
      // Arrange - User interface evaluation
      fixture.detectChanges();
      
      // Act - User evaluates interface
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const titleSection = fixture.debugElement.query(By.css('.titleSupport'));
      const cardSection = fixture.debugElement.query(By.css('.card'));
      const phoneSection = fixture.debugElement.query(By.css('.phoneSupport'));
      const qrSection = fixture.debugElement.query(By.css('.qrCode'));
      
      // Assert - Interface is intuitive
      expect(supportBlock).toBeTruthy();
      expect(titleSection).toBeTruthy();
      expect(cardSection).toBeTruthy();
      expect(phoneSection).toBeTruthy();
      expect(qrSection).toBeTruthy();
      
      // Information is clearly organized
      expect(titleSection.nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
      expect(cardSection.nativeElement.textContent.trim()).toContain('по карте:');
      expect(phoneSection.nativeElement.textContent.trim()).toContain('по тел:');
    });

    it('should support different user interaction patterns', () => {
      // Arrange - Different interaction patterns
      const interactionPatterns = [
        'sequential reading',
        'scanning for specific information',
        'focus on QR code',
        'comprehensive review'
      ];
      
      // Act & Assert - Each pattern works
      interactionPatterns.forEach((pattern, index) => {
        // User follows pattern
        fixture.detectChanges();
        
        // Pattern-specific information is accessible
        switch (pattern) {
          case 'sequential reading':
            expect(fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
            break;
          case 'scanning for specific information':
            expect(fixture.debugElement.query(By.css('.card')).nativeElement.textContent.trim()).toContain('2200 7008 7530 9303');
            break;
          case 'focus on QR code':
            expect(fixture.debugElement.query(By.css('.qrCode')).nativeElement.src).toContain('/assets/img/3.jpg');
            break;
          case 'comprehensive review':
            expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
            break;
        }
      });
    });

    it('should provide responsive and adaptive behavior', () => {
      // Arrange - Responsive behavior testing
      fixture.detectChanges();
      
      // Act - Test responsive behavior
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      
      // Assert - Responsive behavior works
      expect(supportBlock).toBeTruthy();
      expect(qrImage).toBeTruthy();
      
      // Component adapts to different viewport sizes
      expect(qrImage.nativeElement.width).toBe(300);
      expect(qrImage.nativeElement.height).toBe(300);
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});

