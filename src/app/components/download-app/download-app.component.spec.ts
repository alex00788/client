import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DownloadAppComponent } from './download-app.component';

describe('DownloadAppComponent', () => {
  let component: DownloadAppComponent;
  let fixture: ComponentFixture<DownloadAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadAppComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ====== БАЗОВЫЕ ТЕСТЫ ======
  describe('Creation & Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have initial flags set to false', () => {
      expect(component.iPhone).toBeFalse();
      expect(component.Android).toBeFalse();
    });
  });

  // ====== ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ======
  describe('switchPhone logic', () => {
    it('should enable iPhone and disable Android when "iPhone" is selected', () => {
      component.switchPhone('iPhone');
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
    });

    it('should enable Android and disable iPhone when "Android" is selected', () => {
      component.switchPhone('Android');
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });

    it('should treat unknown value as Android (fallback branch)', () => {
      component.switchPhone('Unknown');
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });

    it('should be idempotent for repeated selections', () => {
      component.switchPhone('iPhone');
      component.switchPhone('iPhone');
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();

      component.switchPhone('Android');
      component.switchPhone('Android');
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });
  });

  // ====== ШАБЛОН ======
  describe('Template rendering', () => {
    it('should render two platform buttons with correct labels', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));
      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('iPhone');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Android');
    });

    it('should not show any phone block initially', () => {
      const blocks = fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock'));
      expect(blocks.length).toBe(0);
    });

    it('should show iPhone instructions after clicking iPhone button', () => {
      const iPhoneBtn = fixture.debugElement.queryAll(By.css('.downloadAppBtn'))[0];
      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();

      const iPhoneBlock = fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock'));
      expect(iPhoneBlock.length).toBe(1);

      const iphoneText = fixture.debugElement.query(By.css('.downloadAppDescription'));
      expect(iphoneText.nativeElement.textContent).toContain('Откройте приложение в Safari');

      // Ensure Android-specific elements are not present
      const androidImages = fixture.debugElement.queryAll(By.css('.instDes'));
      expect(androidImages.length).toBe(0);
    });

    it('should show Android instructions with three images after clicking Android button', () => {
      const androidBtn = fixture.debugElement.queryAll(By.css('.downloadAppBtn'))[1];
      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();

      const androidBlock = fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock'));
      expect(androidBlock.length).toBe(1);

      const title = fixture.debugElement.query(By.css('.installDesPTitle'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Откройте приложение в Браузере');

      const steps = fixture.debugElement.queryAll(By.css('.installDesP'));
      expect(steps.length).toBe(3);

      const imgs = fixture.debugElement.queryAll(By.css('.instDes'));
      expect(imgs.length).toBe(3);
    });

    it('should toggle from iPhone to Android when clicking respective buttons', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));

      iPhoneBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.iPhone).toBeTrue();
      expect(component.Android).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeFalsy();

      androidBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.downloadAppPhoneBlock')).length).toBe(1);
      expect(fixture.debugElement.query(By.css('.installDesPTitle'))).toBeTruthy();
    });
  });

  // ====== СЦЕНАРИИ ВЗАИМОДЕЙСТВИЯ И ПРОИЗВОДИТЕЛЬНОСТЬ ======
  describe('Interaction scenarios & performance', () => {
    it('should handle rapid toggling without inconsistent state', () => {
      const [iPhoneBtn, androidBtn] = fixture.debugElement.queryAll(By.css('.downloadAppBtn'));

      for (let i = 0; i < 10; i++) {
        iPhoneBtn.triggerEventHandler('click', null);
        androidBtn.triggerEventHandler('click', null);
      }
      fixture.detectChanges();

      // After even number of toggles ending with Android click
      expect(component.Android).toBeTrue();
      expect(component.iPhone).toBeFalse();
    });

    it('should execute many state changes quickly', () => {
      const start = performance.now();
      for (let i = 0; i < 2000; i++) {
        component.switchPhone(i % 2 === 0 ? 'iPhone' : 'Android');
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });

  // ====== ДОСТУПНОСТЬ ======
  describe('Accessibility', () => {
    it('should use semantic button elements', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(2);
      buttons.forEach(b => expect(b.nativeElement.tagName.toLowerCase()).toBe('button'));
    });
  });
});
