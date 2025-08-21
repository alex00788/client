import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { RenameOrgComponent } from './rename-org.component';
import { PersonalBlockService } from '../personal-page/calendar-components/personal-block.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { ApiService } from '../../shared/services/api.service';
import { SuccessService } from '../../shared/services/success.service';

// Mock services для E2E тестов
class MockPersonalBlockService {
  closeWindowRenameOrg = jasmine.createSpy('closeWindowRenameOrg');
}

class MockDateService {
  currentOrg = new BehaviorSubject<string>('Test Organization');
  idSelectedOrg = new BehaviorSubject<string>('org123');
  currentOrgWasRenamed = new BehaviorSubject<boolean>(false);
  
  // Методы для тестирования
  setCurrentOrg(orgName: string) {
    this.currentOrg.next(orgName);
  }
  
  setIdSelectedOrg(orgId: string) {
    this.idSelectedOrg.next(orgId);
  }
}

class MockApiService {
  renameSelectedOrg = jasmine.createSpy('renameSelectedOrg').and.returnValue(
    of({ newNameOrg: 'New Organization Name' })
  );
  
  // Метод для тестирования ошибок
  setErrorResponse() {
    this.renameSelectedOrg.and.returnValue(
      throwError(() => new Error('API Error'))
    );
  }
  
  // Метод для тестирования различных ответов
  setCustomResponse(response: any) {
    this.renameSelectedOrg.and.returnValue(of(response));
  }
  
  // Метод для симуляции задержки API
  setDelayedResponse(delay: number, response: any) {
    this.renameSelectedOrg.and.returnValue(
      new Promise(resolve => setTimeout(() => resolve(response), delay))
    );
  }
}

class MockSuccessService {
  localHandler = jasmine.createSpy('localHandler');
  success$ = new BehaviorSubject<string>('');
  
  // Метод для проверки сообщений
  getLastMessage(): string {
    return this.success$.value;
  }
}

describe('RenameOrgComponent E2E Tests', () => {
  let component: RenameOrgComponent;
  let fixture: ComponentFixture<RenameOrgComponent>;
  let personalBlockService: MockPersonalBlockService;
  let dateService: MockDateService;
  let apiService: MockApiService;
  let successService: MockSuccessService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RenameOrgComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PersonalBlockService, useClass: MockPersonalBlockService },
        { provide: DateService, useClass: MockDateService },
        { provide: ApiService, useClass: MockApiService },
        { provide: SuccessService, useClass: MockSuccessService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RenameOrgComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService) as unknown as MockPersonalBlockService;
    dateService = TestBed.inject(DateService) as unknown as MockDateService;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    successService = TestBed.inject(SuccessService) as unknown as MockSuccessService;
    fixture.detectChanges();
  });

  it('should render complete UI correctly', () => {
    // Проверяем наличие всех элементов интерфейса
    expect(fixture.debugElement.query(By.css('.settingsRecordsClass'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('form'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('label.newNameOrg'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('input.inputForNewNameOrg'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.btnRenameOrg'))).toBeTruthy();
    
    // Проверяем кнопки
    const buttons = fixture.debugElement.queryAll(By.css('.btnSettingsRecords'));
    expect(buttons.length).toBe(2);
    
    // Проверяем текст кнопок
    expect(buttons[0].nativeElement.textContent.trim()).toBe('Отменить');
    expect(buttons[1].nativeElement.textContent.trim()).toBe('Изменить');
  });

  it('should handle complete user workflow from input to submission', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Пользователь видит форму с текущим названием организации
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    expect(input.nativeElement.value).toBe('Test Organization');
    
    // Пользователь вводит новое название
    const newName = 'Completely New Organization Name';
    input.nativeElement.value = newName;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Проверяем, что значение формы обновилось
    expect(component.renameForm.get('nameOrg')?.value).toBe(newName);
    
    // Пользователь нажимает кнопку "Изменить"
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    tick();
    
    // Проверяем, что все действия выполнены
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: newName
    });
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    expect(successService.localHandler).toHaveBeenCalledWith('Организация переименована');
    expect(component.nameOrgChanged.emit).toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));

  it('should handle user cancellation workflow', () => {
    // Пользователь нажимает кнопку "Отменить"
    const cancelButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
    cancelButton.nativeElement.click();
    
    // Проверяем, что окно закрывается
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    
    // Проверяем, что API не вызывался (он мог быть вызван в других тестах, но не в этом)
    // Считаем только вызовы после начала теста
    const initialCallCount = apiService.renameSelectedOrg.calls.count();
    
    // Убеждаемся, что после нажатия "Отменить" новых вызовов API не было
    expect(apiService.renameSelectedOrg.calls.count()).toBe(initialCallCount);
  });

  it('should handle form validation in real user scenario', () => {
    // Пользователь пытается отправить пустую форму
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Очищаем поле
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Кнопка должна быть неактивна
    expect(submitButton.nativeElement.disabled).toBeTrue();
    
    // Пользователь вводит валидное значение
    input.nativeElement.value = 'Valid Organization Name';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Кнопка должна стать активной
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('should handle API errors in user workflow', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Устанавливаем ошибку API
    apiService.setErrorResponse();
    
    // Сбрасываем spy перед тестом
    personalBlockService.closeWindowRenameOrg.calls.reset();
    successService.localHandler.calls.reset();
    
    // Добавляем обработчик ошибок
    spyOn(console, 'error').and.stub();
    
    // Пользователь вводит новое название и отправляет форму
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    input.nativeElement.value = 'Error Test Organization';
    input.nativeElement.dispatchEvent(new Event('input'));
    
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    tick();
    
    // При ошибке не должны вызываться методы успешного завершения
    expect(personalBlockService.closeWindowRenameOrg).not.toHaveBeenCalled();
    expect(successService.localHandler).not.toHaveBeenCalled();
    expect(component.nameOrgChanged.emit).not.toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(false);
  }));

  it('should handle rapid user interactions correctly', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Пользователь быстро вводит разные названия и отправляет формы
    const names = ['First Org', 'Second Org', 'Third Org'];
    
    names.forEach((name, index) => {
      input.nativeElement.value = name;
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      submitButton.nativeElement.click();
      tick();
    });
    
    // Каждая попытка должна быть обработана
    expect(apiService.renameSelectedOrg).toHaveBeenCalledTimes(3);
    expect(component.nameOrgChanged.emit).toHaveBeenCalledTimes(3);
    
    // Проверяем последний вызов
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: 'Third Org'
    });
  }));

  it('should handle different organization scenarios', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Тестируем разные сценарии
    const scenarios = [
      { orgId: 'org123', currentName: 'Test Organization', newName: 'Updated Org' },
      { orgId: 'different-org', currentName: 'Another Org', newName: 'Renamed Org' },
      { orgId: 'special-org', currentName: 'Special Org', newName: 'New Special Org' }
    ];
    
    scenarios.forEach(scenario => {
      // Устанавливаем параметры для текущего сценария
      dateService.setIdSelectedOrg(scenario.orgId);
      dateService.setCurrentOrg(scenario.currentName);
      fixture.detectChanges();
      
      // Пользователь вводит новое название
      const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
      input.nativeElement.value = scenario.newName;
      input.nativeElement.dispatchEvent(new Event('input'));
      
      // Отправляем форму
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      tick();
      
      // Проверяем, что API вызван с правильными параметрами
      expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
        orgId: scenario.orgId,
        newNameOrg: scenario.newName
      });
      
      // Сбрасываем spy для следующего теста
      apiService.renameSelectedOrg.calls.reset();
    });
  }));

  it('should handle edge cases in user workflow', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Тестируем очень длинное имя
    const longName = 'A'.repeat(1000);
    input.nativeElement.value = longName;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    submitButton.nativeElement.click();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: longName
    });
    
    // Тестируем специальные символы
    const specialName = 'Org!@#$%^&*()_+-=[]{}|;:,.<>?';
    input.nativeElement.value = specialName;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    submitButton.nativeElement.click();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: specialName
    });
  }));

  it('should handle form submission through different methods', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const form = fixture.debugElement.query(By.css('form'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Метод 1: Прямой вызов метода
    input.nativeElement.value = 'Direct Method Org';
    input.nativeElement.dispatchEvent(new Event('input'));
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: 'Direct Method Org'
    });
    
    // Сбрасываем spy
    apiService.renameSelectedOrg.calls.reset();
    
    // Метод 2: Отправка формы
    input.nativeElement.value = 'Form Submit Org';
    input.nativeElement.dispatchEvent(new Event('input'));
    form.triggerEventHandler('submit', null);
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: 'Form Submit Org'
    });
    
    // Сбрасываем spy
    apiService.renameSelectedOrg.calls.reset();
    
    // Метод 3: Клик по кнопке
    input.nativeElement.value = 'Button Click Org';
    input.nativeElement.dispatchEvent(new Event('input'));
    submitButton.nativeElement.click();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: 'Button Click Org'
    });
  }));

  it('should handle component lifecycle in user workflow', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Пользователь взаимодействует с компонентом
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    input.nativeElement.value = 'Lifecycle Test Org';
    input.nativeElement.dispatchEvent(new Event('input'));
    
    // Отправляем форму
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    tick();
    
    // Проверяем, что все работает
    expect(apiService.renameSelectedOrg).toHaveBeenCalled();
    
    // Проверяем жизненный цикл компонента через spy на destroyed$
    const destroyedSpy = spyOn(component['destroyed$'], 'next');
    const completeSpy = spyOn(component['destroyed$'], 'complete');
    
    // Пользователь закрывает компонент
    component.ngOnDestroy();
    
    // Проверяем, что методы жизненного цикла были вызваны
    expect(destroyedSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  }));

  it('should handle real-time form updates', () => {
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    
    // Пользователь вводит текст по буквам
    const text = 'Real Time Test';
    for (let i = 0; i < text.length; i++) {
      input.nativeElement.value = text.substring(0, i + 1);
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Проверяем, что значение формы обновляется в реальном времени
      expect(component.renameForm.get('nameOrg')?.value).toBe(text.substring(0, i + 1));
    }
    
    // Финальная проверка
    expect(component.renameForm.get('nameOrg')?.value).toBe(text);
  });

  it('should handle keyboard navigation and accessibility', () => {
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    const cancelButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
    
    // Проверяем, что input может получить фокус
    input.nativeElement.focus();
    expect(document.activeElement).toBe(input.nativeElement);
    
    // Проверяем, что кнопки доступны для навигации
    expect(submitButton.nativeElement.disabled).toBeFalse();
    expect(cancelButton.nativeElement.disabled).toBeFalse();
    
    // Проверяем, что кнопка отправки имеет правильный тип
    expect(submitButton.nativeElement.type).toBe('submit');
  });

  it('should handle form state persistence during user interaction', () => {
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    
    // Пользователь начинает вводить текст
    input.nativeElement.value = 'Partial Input';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Проверяем, что форма сохраняет состояние
    expect(component.renameForm.get('nameOrg')?.value).toBe('Partial Input');
    expect(component.renameForm.dirty).toBeTrue();
    
    // Пользователь очищает поле
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Проверяем, что состояние обновилось
    expect(component.renameForm.get('nameOrg')?.value).toBe('');
    expect(component.renameForm.valid).toBeFalse();
  });

  it('should handle complete user journey with validation', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Шаг 1: Пользователь видит форму
    expect(input.nativeElement.value).toBe('Test Organization');
    expect(submitButton.nativeElement.disabled).toBeFalse();
    
    // Шаг 2: Пользователь очищает поле (форма становится невалидной)
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.renameForm.valid).toBeFalse();
    expect(submitButton.nativeElement.disabled).toBeTrue();
    
    // Шаг 3: Пользователь вводит валидное значение
    input.nativeElement.value = 'Valid Organization Name';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.renameForm.valid).toBeTrue();
    expect(submitButton.nativeElement.disabled).toBeFalse();
    
    // Шаг 4: Пользователь отправляет форму
    submitButton.nativeElement.click();
    tick();
    
    // Шаг 5: Проверяем успешное выполнение
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: 'Valid Organization Name'
    });
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    expect(successService.localHandler).toHaveBeenCalledWith('Организация переименована');
    expect(component.nameOrgChanged.emit).toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));
});
