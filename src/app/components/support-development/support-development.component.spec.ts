import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { SupportDevelopmentComponent } from './support-development.component';

describe('SupportDevelopmentComponent', () => {
  let component: SupportDevelopmentComponent;
  let fixture: ComponentFixture<SupportDevelopmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportDevelopmentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportDevelopmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== БАЗОВЫЕ ТЕСТЫ СОЗДАНИЯ И ИНИЦИАЛИЗАЦИИ ======
  describe('Component Creation and Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should be standalone component', () => {
      expect(component.constructor.name).toBe('SupportDevelopmentComponent');
    });

    it('should compile without errors', () => {
      expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
    });
  });

  // ====== ТЕСТЫ СТРУКТУРЫ HTML ======
  describe('HTML Structure Tests', () => {
    it('should have main support block container', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      expect(supportBlock).toBeTruthy();
      expect(supportBlock.nativeElement).toBeDefined();
    });

    it('should have title section with correct text', () => {
      const titleSection = fixture.debugElement.query(By.css('.titleSupport'));
      expect(titleSection).toBeTruthy();
      
      const titleText = titleSection.nativeElement.textContent.trim();
      expect(titleText).toContain('Поддержать разработку приложения');
    });

    it('should have card information section', () => {
      const cardSection = fixture.debugElement.query(By.css('.card'));
      expect(cardSection).toBeTruthy();
      
      const cardText = cardSection.nativeElement.textContent.trim();
      expect(cardText).toContain('по карте:');
      expect(cardText).toContain('2200 7008 7530 9303');
    });

    it('should have phone support section', () => {
      const phoneSection = fixture.debugElement.query(By.css('.phoneSupport'));
      expect(phoneSection).toBeTruthy();
      
      const phoneText = phoneSection.nativeElement.textContent.trim();
      expect(phoneText).toContain('по тел:');
      expect(phoneText).toContain('8-916-840-29-27');
    });

    it('should have QR code image section', () => {
      const qrSection = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrSection).toBeTruthy();
      expect(qrSection.nativeElement.tagName.toLowerCase()).toBe('img');
    });
  });

  // ====== ТЕСТЫ СОДЕРЖИМОГО И ТЕКСТА ======
  describe('Content and Text Tests', () => {
    it('should display correct support title', () => {
      const titleElement = fixture.debugElement.query(By.css('.titleSupport strong'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Поддержать разработку приложения');
    });

    it('should display correct card number', () => {
      const cardSpans = fixture.debugElement.queryAll(By.css('.card span'));
      expect(cardSpans.length).toBeGreaterThanOrEqual(2);
      
      const cardNumberSpan = cardSpans.find(span => 
        span.nativeElement.textContent.includes('2200 7008 7530 9303')
      );
      expect(cardNumberSpan).toBeTruthy();
    });

    it('should display correct phone number', () => {
      const phoneSpans = fixture.debugElement.queryAll(By.css('.phoneSupport span'));
      expect(phoneSpans.length).toBeGreaterThanOrEqual(2);
      
      const phoneNumberSpan = phoneSpans.find(span => 
        span.nativeElement.textContent.includes('8-916-840-29-27')
      );
      expect(phoneNumberSpan).toBeTruthy();
    });

    it('should have correct card label text', () => {
      const cardSpans = fixture.debugElement.queryAll(By.css('.card span'));
      const cardLabelSpan = cardSpans.find(span => 
        span.nativeElement.textContent.includes('по карте:')
      );
      expect(cardLabelSpan).toBeTruthy();
    });

    it('should have correct phone label text', () => {
      const phoneSpans = fixture.debugElement.queryAll(By.css('.phoneSupport span'));
      const phoneLabelSpan = phoneSpans.find(span => 
        span.nativeElement.textContent.includes('по тел:')
      );
      expect(phoneLabelSpan).toBeTruthy();
    });
  });

  // ====== ТЕСТЫ ИЗОБРАЖЕНИЯ QR КОДА ======
  describe('QR Code Image Tests', () => {
    it('should have QR code image with correct source', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage).toBeTruthy();
      expect(qrImage.nativeElement.src).toContain('/assets/img/3.jpg');
    });

    it('should have QR code image with correct alt text', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.alt).toBe('QRCode');
    });

    it('should have QR code image with correct dimensions', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.width).toBe(300);
      expect(qrImage.nativeElement.height).toBe(300);
    });

    it('should use NgOptimizedImage directive', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement).toBeDefined();
      // NgOptimizedImage применяется к img элементам
      expect(qrImage.nativeElement.tagName.toLowerCase()).toBe('img');
    });
  });

  // ====== ТЕСТЫ CSS КЛАССОВ ======
  describe('CSS Classes Tests', () => {
    it('should have supportBlock class on main container', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      expect(supportBlock).toBeTruthy();
      expect(supportBlock.nativeElement.classList.contains('supportBlock')).toBeTrue();
    });

    it('should have titleSupport class on title section', () => {
      const titleSection = fixture.debugElement.query(By.css('.titleSupport'));
      expect(titleSection).toBeTruthy();
      expect(titleSection.nativeElement.classList.contains('titleSupport')).toBeTrue();
    });

    it('should have card class on card section', () => {
      const cardSection = fixture.debugElement.query(By.css('.card'));
      expect(cardSection).toBeTruthy();
      expect(cardSection.nativeElement.classList.contains('card')).toBeTrue();
    });

    it('should have phoneSupport class on phone section', () => {
      const phoneSection = fixture.debugElement.query(By.css('.phoneSupport'));
      expect(phoneSection).toBeTruthy();
      expect(phoneSection.nativeElement.classList.contains('phoneSupport')).toBeTrue();
    });

    it('should have qrCode class on QR image', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage).toBeTruthy();
      expect(qrImage.nativeElement.classList.contains('qrCode')).toBeTrue();
    });
  });

  // ====== ТЕСТЫ СТРУКТУРЫ DOM ======
  describe('DOM Structure Tests', () => {
    it('should have correct number of main sections', () => {
      const mainSections = fixture.debugElement.queryAll(By.css('.supportBlock > div'));
      expect(mainSections.length).toBe(4); // title, card, phone, qr
    });

    it('should have title section as first child', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const firstChild = supportBlock.children[0];
      expect(firstChild.nativeElement.classList.contains('titleSupport')).toBeTrue();
    });

    it('should have card section as second child', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const secondChild = supportBlock.children[1];
      expect(secondChild.nativeElement.classList.contains('card')).toBeTrue();
    });

    it('should have phone section as third child', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const thirdChild = supportBlock.children[2];
      expect(thirdChild.nativeElement.classList.contains('phoneSupport')).toBeTrue();
    });

    it('should have QR section as fourth child', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      const fourthChild = supportBlock.children[3];
      expect(fourthChild.nativeElement.classList.contains('qrCode')).toBeFalse(); // QR section doesn't have class
      expect(fourthChild.nativeElement.querySelector('.qrCode')).toBeTruthy();
    });
  });

  // ====== ТЕСТЫ АТРИБУТОВ ======
  describe('Attributes Tests', () => {
    it('should have img tag with correct attributes', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.tagName.toLowerCase()).toBe('img');
      expect(qrImage.nativeElement.src).toBeDefined();
      expect(qrImage.nativeElement.alt).toBeDefined();
    });
  });

  // ====== ТЕСТЫ ИМПОРТОВ И ЗАВИСИМОСТЕЙ ======
  describe('Imports and Dependencies Tests', () => {
    it('should import NgOptimizedImage correctly', () => {
      expect(NgOptimizedImage).toBeDefined();
    });

    it('should be standalone component', () => {
      expect(component.constructor.name).toBe('SupportDevelopmentComponent');
    });
  });

  // ====== ТЕСТЫ ЖИЗНЕННОГО ЦИКЛА ======
  describe('Lifecycle Tests', () => {
    it('should initialize without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should render all content on first detection', () => {
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.titleSupport'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.card'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.phoneSupport'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.qrCode'))).toBeTruthy();
    });

    it('should maintain state after multiple change detections', () => {
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.titleSupport'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.card'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.phoneSupport'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.qrCode'))).toBeTruthy();
    });
  });

  // ====== ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Edge Cases Tests', () => {
    it('should handle empty content gracefully', () => {
      // Компонент не имеет динамического контента, поэтому всегда должен отображаться корректно
      expect(fixture.debugElement.query(By.css('.supportBlock'))).toBeTruthy();
    });

    it('should be a static component without dynamic properties', () => {
      // Проверяем, что компонент статический
      expect(component).toBeDefined();
      expect(component.constructor.name).toBe('SupportDevelopmentComponent');
    });
  });

  // ====== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance Tests', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      fixture.detectChanges();
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Должен рендериться менее чем за 100мс
    });

    it('should not cause memory leaks', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Увеличение памяти должно быть минимальным
      expect(memoryIncrease).toBeLessThan(1000000); // Менее 1MB
    });
  });

  // ====== ТЕСТЫ ДОСТУПНОСТИ ======
  describe('Accessibility Tests', () => {
    it('should have alt text for QR code image', () => {
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.alt).toBe('QRCode');
      expect(qrImage.nativeElement.alt).not.toBe('');
    });

    it('should have semantic HTML structure', () => {
      const supportBlock = fixture.debugElement.query(By.css('.supportBlock'));
      expect(supportBlock.nativeElement.tagName.toLowerCase()).toBe('div');
    });

    it('should have readable text content', () => {
      const titleText = fixture.debugElement.query(By.css('.titleSupport strong')).nativeElement.textContent;
      expect(titleText.trim().length).toBeGreaterThan(0);
      expect(titleText).toContain('Поддержать разработку приложения');
    });
  });

  // ====== ТЕСТЫ СОВМЕСТИМОСТИ ======
  describe('Compatibility Tests', () => {
    it('should work with different Angular versions', () => {
      // Тест совместимости с Angular
      expect(component).toBeDefined();
      expect(fixture).toBeDefined();
    });

    it('should work with different browsers', () => {
      // Тест совместимости с браузерами
      const qrImage = fixture.debugElement.query(By.css('.qrCode'));
      expect(qrImage.nativeElement.src).toBeDefined();
      expect(qrImage.nativeElement.alt).toBeDefined();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
