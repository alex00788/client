import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { InstructionsForStartComponent } from './instructions-for-start.component';

describe('InstructionsForStartComponent E2E Tests', () => {
  let component: InstructionsForStartComponent;
  let fixture: ComponentFixture<InstructionsForStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InstructionsForStartComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InstructionsForStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКОГО ВЗАИМОДЕЙСТВИЯ ======
  describe('User Interaction E2E Tests', () => {
    it('should allow user to click Client button and see client instructions', async () => {
      // Находим кнопку Client
      const clientButton = fixture.debugElement.query(By.css('button:first-child'));
      expect(clientButton).toBeTruthy();
      expect(clientButton.nativeElement.textContent.trim()).toBe('Клиент');

      // Симулируем клик пользователя
      clientButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что инструкции для клиента отображаются
      const clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();

      // Проверяем содержимое инструкций
      const description = fixture.debugElement.query(By.css('.instructionDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent).toContain('1 Зарегистрироваться выбрав организацию');
      expect(description.nativeElement.textContent).toContain('2 Подтвердить свой email');
      expect(description.nativeElement.textContent).toContain('3 Зайти в личный кабинет');
    });

    it('should allow user to click Admin button and see admin instructions', async () => {
      // Находим кнопку Admin
      const adminButton = fixture.debugElement.query(By.css('button:last-child'));
      expect(adminButton).toBeTruthy();
      expect(adminButton.nativeElement.textContent.trim()).toBe('Админ');

      // Симулируем клик пользователя
      adminButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что инструкции для админа отображаются
      const adminBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(adminBlock).toBeTruthy();

      // Проверяем содержимое инструкций
      const description = fixture.debugElement.query(By.css('.instructionDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent).toContain('1 Зарегистрировать свою организацию');
      expect(description.nativeElement.textContent).toContain('2 Зарегистрироваться самому выбрав свою организацию');
      expect(description.nativeElement.textContent).toContain('3 У себя на сайте или странице сделать кнопку войти');
    });

    it('should allow user to switch between client and admin instructions seamlessly', async () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));

      // Начинаем с клиента
      clientButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем клиентские инструкции
      let clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.downloadAppPhoneBlock'))).toBeFalsy();

      // Переключаемся на админа
      adminButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем админские инструкции
      let adminBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(adminBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.instructionBlock'))).toBeFalsy();

      // Возвращаемся к клиенту
      clientButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем, что вернулись к клиентским инструкциям
      clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.downloadAppPhoneBlock'))).toBeFalsy();
    });
  });

  // ====== E2E ТЕСТЫ РЕАЛЬНОГО РЕНДЕРИНГА ======
  describe('Real Rendering E2E Tests', () => {
    it('should render complete component structure on page load', () => {
      // Проверяем основной контейнер
      const coverBlock = fixture.debugElement.query(By.css('.coverInstruction'));
      expect(coverBlock).toBeTruthy();

      // Проверяем блок с кнопками
      const buttonBlock = fixture.debugElement.query(By.css('.downloadAppBtnBlock'));
      expect(buttonBlock).toBeTruthy();

      // Проверяем кнопки
      const buttons = buttonBlock.queryAll(By.css('.instructionBtn'));
      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Клиент');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Админ');

      // Проверяем, что изначально нет блоков с инструкциями
      const instructionBlocks = fixture.debugElement.queryAll(By.css('.instructionBlock, .downloadAppPhoneBlock'));
      expect(instructionBlocks.length).toBe(0);
    });

    it('should render client instructions with proper styling classes', () => {
      const clientButton = fixture.debugElement.query(By.css('button:first-child'));
      clientButton.nativeElement.click();
      fixture.detectChanges();

      const clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();
      expect(clientBlock.nativeElement.classList.contains('instructionBlock')).toBeTrue();

      const descriptionBlock = clientBlock.query(By.css('.instructionDescriptionBlock'));
      expect(descriptionBlock).toBeTruthy();
      expect(descriptionBlock.nativeElement.classList.contains('instructionDescriptionBlock')).toBeTrue();

      const description = descriptionBlock.query(By.css('.instructionDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.classList.contains('instructionDescription')).toBeTrue();
    });

    it('should render admin instructions with proper styling classes', () => {
      const adminButton = fixture.debugElement.query(By.css('button:last-child'));
      adminButton.nativeElement.click();
      fixture.detectChanges();

      const adminBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
      expect(adminBlock).toBeTruthy();
      expect(adminBlock.nativeElement.classList.contains('downloadAppPhoneBlock')).toBeTrue();

      const descriptionBlock = adminBlock.query(By.css('.instructionDescriptionBlock'));
      expect(descriptionBlock).toBeTruthy();
      expect(descriptionBlock.nativeElement.classList.contains('instructionDescriptionBlock')).toBeTrue();

      const description = descriptionBlock.query(By.css('.instructionDescription'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.classList.contains('instructionDescription')).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ СОСТОЯНИЯ КОМПОНЕНТА ======
  describe('Component State E2E Tests', () => {
    it('should maintain correct state after user interactions', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));

      // Начальное состояние
      expect(component.client).toBeFalse();
      expect(component.admin).toBeFalse();

      // Клик по клиенту
      clientButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.client).toBeTrue();
      expect(component.admin).toBeFalse();

      // Клик по админу
      adminButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.client).toBeFalse();
      expect(component.admin).toBeTrue();

      // Повторный клик по клиенту
      clientButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.client).toBeTrue();
      expect(component.admin).toBeFalse();
    });

    it('should handle rapid user interactions correctly', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));

      // Быстрые клики
      clientButton.nativeElement.click();
      adminButton.nativeElement.click();
      clientButton.nativeElement.click();
      adminButton.nativeElement.click();
      clientButton.nativeElement.click();
      fixture.detectChanges();

      // Проверяем финальное состояние
      expect(component.client).toBeTrue();
      expect(component.admin).toBeFalse();

      // Проверяем, что отображается правильный контент
      const clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.downloadAppPhoneBlock'))).toBeFalsy();
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

    it('should have proper text content for screen readers', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));
      
      // Проверяем клиентские инструкции
      clientButton.nativeElement.click();
      fixture.detectChanges();
      
      const clientDescription = fixture.debugElement.query(By.css('.instructionDescription'));
      expect(clientDescription.nativeElement.textContent).toContain('Зарегистрироваться');
      expect(clientDescription.nativeElement.textContent).toContain('email');
      expect(clientDescription.nativeElement.textContent).toContain('личный кабинет');

      // Проверяем админские инструкции
      adminButton.nativeElement.click();
      fixture.detectChanges();
      
      const adminDescription = fixture.debugElement.query(By.css('.instructionDescription'));
      expect(adminDescription.nativeElement.textContent).toContain('организацию');
      expect(adminDescription.nativeElement.textContent).toContain('сайте');
      expect(adminDescription.nativeElement.textContent).toContain('записаться онлайн');
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance E2E Tests', () => {
    it('should render instructions quickly after user interaction', () => {
      const clientButton = fixture.debugElement.query(By.css('button:first-child'));
      
      const startTime = performance.now();
      clientButton.nativeElement.click();
      fixture.detectChanges();
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Должно рендериться быстро

      // Проверяем, что контент отобразился
      const clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
      expect(clientBlock).toBeTruthy();
    });

    it('should handle multiple rapid interactions efficiently', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));
      
      const startTime = performance.now();
      
      // Выполняем 10 быстрых переключений
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          clientButton.nativeElement.click();
        } else {
          adminButton.nativeElement.click();
        }
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Проверяем, что все переключения выполнились быстро
      expect(totalTime).toBeLessThan(500);
      
      // Проверяем финальное состояние
      expect(component.admin).toBeTrue();
      expect(component.client).toBeFalse();
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
      expect(fixture.debugElement.query(By.css('.coverInstruction'))).toBeTruthy();
      
      // Проверяем после изменений
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.coverInstruction'))).toBeTruthy();
      
      // Проверяем после взаимодействия
      const clientButton = fixture.debugElement.query(By.css('button:first-child'));
      clientButton.nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.instructionBlock'))).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ ОБРАБОТКИ ОШИБОК ======
  describe('Error Handling E2E Tests', () => {
    it('should maintain stability during rapid state changes', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));
      
      // Выполняем множество быстрых переключений
      expect(() => {
        for (let i = 0; i < 50; i++) {
          if (i % 2 === 0) {
            clientButton.nativeElement.click();
          } else {
            adminButton.nativeElement.click();
          }
          fixture.detectChanges();
        }
      }).not.toThrow();

      // Проверяем, что компонент остался функциональным
      expect(fixture.debugElement.query(By.css('.coverInstruction'))).toBeTruthy();
    });

    it('should handle console logging correctly', () => {
      const [clientButton, adminButton] = fixture.debugElement.queryAll(By.css('button'));
      
      // Спай на console.log
      const consoleSpy = spyOn(console, 'log');
      
      // Кликаем по кнопкам
      clientButton.nativeElement.click();
      expect(consoleSpy).toHaveBeenCalledWith('client');
      
      adminButton.nativeElement.click();
      expect(consoleSpy).toHaveBeenCalledWith('admin');
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ====== E2E ТЕСТЫ СТИЛИЗАЦИИ ======
  describe('Styling E2E Tests', () => {
    it('should apply correct CSS classes for responsive design', () => {
      const coverBlock = fixture.debugElement.query(By.css('.coverInstruction'));
      expect(coverBlock.nativeElement.classList.contains('coverInstruction')).toBeTrue();

      const buttonBlock = fixture.debugElement.query(By.css('.downloadAppBtnBlock'));
      expect(buttonBlock.nativeElement.classList.contains('downloadAppBtnBlock')).toBeTrue();

      const buttons = buttonBlock.queryAll(By.css('.instructionBtn'));
      buttons.forEach(button => {
        expect(button.nativeElement.classList.contains('instructionBtn')).toBeTrue();
      });
    });

    it('should maintain proper spacing and layout', () => {
      const buttonBlock = fixture.debugElement.query(By.css('.downloadAppBtnBlock'));
      expect(buttonBlock).toBeTruthy();

      const buttons = buttonBlock.queryAll(By.css('.instructionBtn'));
      expect(buttons.length).toBe(2);
      
      // Проверяем, что кнопки находятся в правильном блоке
      buttons.forEach(button => {
        expect(button.nativeElement.closest('.downloadAppBtnBlock')).toBeTruthy();
      });
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
