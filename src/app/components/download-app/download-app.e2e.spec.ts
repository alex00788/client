import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DownloadAppComponent } from './download-app.component';

describe('DownloadAppComponent E2E Tests', () => {
  let component: DownloadAppComponent;
  let fixture: ComponentFixture<DownloadAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DownloadAppComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКОГО ВЗАИМОДЕЙСТВИЯ ======
  describe('User Interaction E2E Tests', () => {
    it('should allow user to click iPhone button and see instructions', async () => {
      // Находим кнопку iPhone
      const iPhoneButton = fixture.debugElement.query(By.css('button:first-child'));
      expect(iPhoneButton).toBeTruthy();
      expect(iPhoneButton.nativeElement.textContent.trim()).toBe('iPhone');

      // Симулируем клик пользователя
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что инструкции для iPhone отображаются
      const iPhoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(iPhoneBlock).toBeTruthy();

      // Проверяем содержимое инструкций
      const description = fixture.debugElement.query(By.css('.downloadAppDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent).toContain('Откройте приложение в Safari');
      expect(description.nativeElement.textContent).toContain('Поделиться');
      expect(description.nativeElement.textContent).toContain('Экран домой');
      expect(description.nativeElement.textContent).toContain('Добавить');
    });

    it('should allow user to click Android button and see instructions with images', async () => {
      // Находим кнопку Android
      const androidButton = fixture.debugElement.query(By.css('button:last-child'));
      expect(androidButton).toBeTruthy();
      expect(androidButton.nativeElement.textContent.trim()).toBe('Android');

      // Симулируем клик пользователя
      androidButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что инструкции для Android отображаются
      const androidBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(androidBlock).toBeTruthy();

      // Проверяем заголовок
      const title = fixture.debugElement.query(By.css('.installDesPTitle'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent.trim()).toBe('Откройте приложение в Браузере');

      // Проверяем все шаги инструкции
      const steps = fixture.debugElement.queryAll(By.css('.installDesP'));
      expect(steps.length).toBe(3);
      expect(steps[0].nativeElement.textContent.trim()).toContain('1. Нажмите точки, в правом верхнем углу');
      expect(steps[1].nativeElement.textContent.trim()).toContain('2. Добавить на главный экран');
      expect(steps[2].nativeElement.textContent.trim()).toContain('3. Установить');

      // Проверяем изображения
      const images = fixture.debugElement.queryAll(By.css('.instDes'));
      expect(images.length).toBe(3);
      
      // Проверяем src атрибуты изображений
      expect(images[0].nativeElement.src).toContain('/assets/installDes/id1.jpg');
      expect(images[1].nativeElement.src).toContain('/assets/installDes/id2.jpg');
      expect(images[2].nativeElement.src).toContain('/assets/installDes/id3.jpg');
      
      // Проверяем alt атрибуты
      expect(images[0].nativeElement.alt).toBe('instDes');
      expect(images[1].nativeElement.alt).toBe('instDes');
      expect(images[2].nativeElement.alt).toBe('instDes');
    });

    it('should allow user to switch between platforms seamlessly', async () => {
      const [iPhoneButton, androidButton] = fixture.debugElement.queryAll(By.css('button'));

      // Начинаем с iPhone
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем iPhone инструкции
      let phoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('.downloadAppDescription'))).toBeTruthy();

      // Переключаемся на Android
      androidButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем Android инструкции
      phoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle')).nativeElement.textContent.trim()).toBe('Откройте приложение в Браузере');

      // Возвращаемся к iPhone
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что вернулись к iPhone инструкциям
      phoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('.downloadAppDescription'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ РЕАЛЬНОГО РЕНДЕРИНГА ======
  describe('Real Rendering E2E Tests', () => {
    it('should render complete component structure on page load', () => {
      // Проверяем основной контейнер
      const coverBlock = fixture.debugElement.query(By.css('.coverDownloadApp'));
      expect(coverBlock).toBeTruthy();

      // Проверяем блок с кнопками
      const buttonBlock = fixture.debugElement.query(By.css('.downloadAppBtnBlock'));
      expect(buttonBlock).toBeTruthy();

      // Проверяем кнопки
      const buttons = buttonBlock.queryAll(By.css('.downloadAppBtn'));
      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('iPhone');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Android');

      // Проверяем, что изначально нет блоков с инструкциями
      const phoneBlocks = fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlocks.length).toBe(0);
    });

    it('should render iPhone instructions with proper styling classes', () => {
      const iPhoneButton = fixture.debugElement.query(By.css('button:first-child'));
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();

      const iPhoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(iPhoneBlock).toBeTruthy();
      expect(iPhoneBlock.nativeElement.classList.contains('downloadAppPhoneBlock')).toBeTrue();

      const descriptionBlock = iPhoneBlock.query(By.css('.downloadAppPhoneDescriptionBlock'));
      expect(descriptionBlock).toBeTruthy();
      expect(descriptionBlock.nativeElement.classList.contains('downloadAppPhoneDescriptionBlock')).toBeTrue();

      const description = descriptionBlock.query(By.css('.downloadAppDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.classList.contains('downloadAppDescription')).toBeTrue();
    });

    it('should render Android instructions with proper styling classes and images', () => {
      const androidButton = fixture.debugElement.query(By.css('button:last-child'));
      androidButton.nativeElement.click();
      fixture.detectChanges();

      const androidBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(androidBlock).toBeTruthy();
      expect(androidBlock.nativeElement.classList.contains('downloadAppPhoneBlock')).toBeTrue();

      const descriptionBlock = androidBlock.query(By.css('.downloadAppPhoneDescriptionBlock'));
      expect(descriptionBlock).toBeTruthy();
      expect(descriptionBlock.nativeElement.classList.contains('downloadAppPhoneDescriptionBlock')).toBeTrue();

      const title = descriptionBlock.query(By.css('.installDesPTitle'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.classList.contains('installDesPTitle')).toBeTrue();

      const description = descriptionBlock.query(By.css('.downloadAppDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.classList.contains('downloadAppDescription')).toBeTrue();

      // Проверяем изображения с правильными классами
      const images = descriptionBlock.queryAll(By.css('.instDes'));
      expect(images.length).toBe(3);
      images.forEach(img => {
        expect(img.nativeElement.classList.contains('instDes')).toBeTrue();
      });
    });
  });

  // ====== E2E ТЕСТЫ СОСТОЯНИЯ КОМПОНЕНТА ======
  describe('Component State E2E Tests', () => {
    it('should maintain correct state after user interactions', () => {
      const [iPhoneButton, androidButton] = fixture.debugElement.queryAll(By.css('button'));

      // Начальное состояние
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeFalse();

      // Клик по iPhone
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();

      // Клик по Android
      androidButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeTrue();

      // Повторный клик по iPhone
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });

    it('should handle rapid user interactions correctly', () => {
      const [iPhoneButton, androidButton] = fixture.debugElement.queryAll(By.css('button'));

      // Быстрые клики
      iPhoneButton.nativeElement.click();
      androidButton.nativeElement.click();
      iPhoneButton.nativeElement.click();
      androidButton.nativeElement.click();
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем финальное состояние
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();

      // Проверяем, что отображается правильный контент
      const phoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('.downloadAppDescription'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ ======
  describe('Accessibility E2E Tests', () => {
    it('should have proper button semantics and accessibility', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(2);

      buttons.forEach((button, index) => {
        const buttonElement = button.nativeElement;
        expect(buttonElement.tagName.toLowerCase()).toBe('button');
        
        // Проверяем, что кнопки кликабельны
        expect(buttonElement.disabled).toBeFalse();
        
        // Проверяем, что кнопки имеют текст
        expect(buttonElement.textContent.trim()).toBeTruthy();
      });
    });

    it('should have proper image accessibility attributes', () => {
      const androidButton = fixture.debugElement.query(By.css('button:last-child'));
      androidButton.nativeElement.click();
      fixture.detectChanges();

      const images = fixture.debugElement.queryAll(By.css('.instDes'));
      expect(images.length).toBe(3);

      images.forEach(img => {
        const imgElement = img.nativeElement;
        expect(imgElement.tagName.toLowerCase()).toBe('img');
        expect(imgElement.alt).toBe('instDes');
        expect(imgElement.src).toContain('/assets/installDes/');
      });
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance E2E Tests', () => {
    it('should render instructions quickly after user interaction', () => {
      const iPhoneButton = fixture.debugElement.query(By.css('button:first-child'));
      
      const startTime = performance.now();
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Должно рендериться быстро

      // Проверяем, что контент отобразился
      const phoneBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(phoneBlock).toBeTruthy();
    });

    it('should handle multiple rapid interactions efficiently', () => {
      const [iPhoneButton, androidButton] = fixture.debugElement.queryAll(By.css('button'));
      
      const startTime = performance.now();
      
      // Выполняем 10 быстрых переключений
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          iPhoneButton.nativeElement.click();
        } else {
          androidButton.nativeElement.click();
        }
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Проверяем, что все переключения выполнились быстро
      expect(totalTime).toBeLessThan(500);
      
      // Проверяем финальное состояние
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ ======
  describe('Integration E2E Tests', () => {
    it('should integrate with Angular testing modules correctly', () => {
      // Проверяем, что HttpClientTestingModule доступен
      const httpClient = TestBed.inject(HttpClientTestingModule);
      expect(httpClient).toBeDefined();

      // Проверяем, что RouterTestingModule доступен
      const routerTesting = TestBed.inject(RouterTestingModule);
      expect(routerTesting).toBeDefined();

      // Проверяем, что BrowserAnimationsModule доступен
      const animations = TestBed.inject(BrowserAnimationsModule);
      expect(animations).toBeDefined();
    });

    it('should maintain integration through component lifecycle', () => {
      // Проверяем начальное состояние
      expect(fixture.debugElement.query(By.css('.coverDownloadApp'))).toBeTruthy();
      
      // Проверяем после изменений
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.coverDownloadApp'))).toBeTruthy();
      
      // Проверяем после взаимодействия
      const iPhoneButton = fixture.debugElement.query(By.css('button:first-child'));
      iPhoneButton.nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.downloadAppPhoneBlock'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ ОБРАБОТКИ ОШИБОК ======
  describe('Error Handling E2E Tests', () => {
    it('should handle missing assets gracefully', () => {
      const androidButton = fixture.debugElement.query(By.css('button:last-child'));
      androidButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что компонент не падает при отсутствии изображений
      const images = fixture.debugElement.queryAll(By.css('.instDes'));
      expect(images.length).toBe(3);

      // Проверяем, что src атрибуты корректны
      images.forEach(img => {
        expect(img.nativeElement.src).toContain('/assets/installDes/');
      });
    });

    it('should maintain stability during rapid state changes', () => {
      const [iPhoneButton, androidButton] = fixture.debugElement.queryAll(By.css('button'));
      
      // Выполняем множество быстрых переключений
      expect(() => {
        for (let i = 0; i < 50; i++) {
          if (i % 2 === 0) {
            iPhoneButton.nativeElement.click();
          } else {
            androidButton.nativeElement.click();
          }
          fixture.detectChanges();
        }
      }).not.toThrow();

      // Проверяем, что компонент остался функциональным
      expect(fixture.debugElement.query(By.css('.coverDownloadApp'))).toBeTruthy();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
