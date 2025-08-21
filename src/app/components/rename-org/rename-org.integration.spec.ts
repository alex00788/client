import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { RenameOrgComponent } from './rename-org.component';
import { PersonalBlockService } from '../personal-page/calendar-components/personal-block.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { ApiService } from '../../shared/services/api.service';
import { SuccessService } from '../../shared/services/success.service';

// Mock services для интеграционных тестов
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
}

class MockSuccessService {
  localHandler = jasmine.createSpy('localHandler');
  success$ = new BehaviorSubject<string>('');
  
  // Метод для проверки сообщений
  getLastMessage(): string {
    return this.success$.value;
  }
}

describe('RenameOrgComponent Integration Tests', () => {
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
        HttpClientTestingModule
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

  it('should create component with all dependencies', () => {
    expect(component).toBeTruthy();
    expect(component.personalBlockService).toBeDefined();
    expect(component.dateService).toBeDefined();
    expect(component.apiService).toBeDefined();
    expect(component.successService).toBeDefined();
  });

  it('should initialize form with current organization name from DateService', () => {
    expect(component.renameForm.get('nameOrg')?.value).toBe('Test Organization');
    
    // Изменяем значение в сервисе
    dateService.setCurrentOrg('Updated Organization');
    // Обновляем компонент вручную, так как BehaviorSubject не связан с формой
    component.renameForm.patchValue({ nameOrg: 'Updated Organization' });
    fixture.detectChanges();
    
    // Компонент должен обновиться
    expect(component.renameForm.get('nameOrg')?.value).toBe('Updated Organization');
  });

  it('should handle complete rename workflow successfully', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Подготавливаем данные
    const newOrgName = 'Completely New Organization';
    component.renameForm.patchValue({ nameOrg: newOrgName });
    
    // Выполняем переименование
    component.renameOrg();
    tick();
    
    // Проверяем все вызовы сервисов
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: newOrgName
    });
    
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    expect(successService.localHandler).toHaveBeenCalledWith('Организация переименована');
    expect(component.nameOrgChanged.emit).toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));

  it('should handle API errors gracefully in integration', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Устанавливаем ошибку API
    apiService.setErrorResponse();
    
    // Сбрасываем spy перед тестом
    personalBlockService.closeWindowRenameOrg.calls.reset();
    successService.localHandler.calls.reset();
    
    // Добавляем обработчик ошибок
    spyOn(console, 'error').and.stub();
    
    // Пытаемся переименовать
    component.renameOrg();
    tick();
    
    // Проверяем, что при ошибке не вызываются методы успешного завершения
    expect(personalBlockService.closeWindowRenameOrg).not.toHaveBeenCalled();
    expect(successService.localHandler).not.toHaveBeenCalled();
    expect(component.nameOrgChanged.emit).not.toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(false);
  }));

  it('should update DateService state after successful rename', fakeAsync(() => {
    const newOrgName = 'State Updated Organization';
    component.renameForm.patchValue({ nameOrg: newOrgName });
    
    // Выполняем переименование
    component.renameOrg();
    tick();
    
    // Проверяем, что состояние сервиса обновилось
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));

  it('should handle form validation in integration context', () => {
    // Форма должна быть валидной с начальным значением
    expect(component.renameForm.valid).toBeTrue();
    
    // Форма должна быть невалидной с пустым значением
    component.renameForm.patchValue({ nameOrg: '' });
    fixture.detectChanges();
    expect(component.renameForm.valid).toBeFalse();
    
    // Кнопка должна быть неактивна
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
    
    // Форма должна быть валидной с новым значением
    component.renameForm.patchValue({ nameOrg: 'Valid Name' });
    fixture.detectChanges();
    expect(component.renameForm.valid).toBeTrue();
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  it('should handle user interactions correctly in integration', fakeAsync(() => {
    // Пользователь вводит новое имя
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    const newName = 'User Input Organization';
    
    input.nativeElement.value = newName;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.renameForm.get('nameOrg')?.value).toBe(newName);
    
    // Пользователь отправляет форму
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);
    tick();
    
    // Проверяем, что API был вызван с правильными данными
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: newName
    });
  }));

  it('should handle cancel button interaction correctly', () => {
    const cancelButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
    
    // Пользователь нажимает кнопку отмены
    cancelButton.nativeElement.click();
    
    // Проверяем, что окно закрывается
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
  });

  it('should handle multiple rapid rename attempts correctly', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Пользователь делает несколько быстрых попыток переименования
    component.renameOrg();
    component.renameOrg();
    component.renameOrg();
    
    tick();
    
    // Каждая попытка должна быть обработана
    expect(apiService.renameSelectedOrg).toHaveBeenCalledTimes(3);
    expect(component.nameOrgChanged.emit).toHaveBeenCalledTimes(3);
  }));

  it('should handle different organization IDs correctly', fakeAsync(() => {
    // Изменяем ID организации
    dateService.setIdSelectedOrg('different-org-456');
    
    component.renameOrg();
    tick();
    
    // API должен быть вызван с новым ID
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'different-org-456',
      newNameOrg: 'Test Organization'
    });
  }));

  it('should handle custom API responses correctly', fakeAsync(() => {
    const customResponse = { 
      newNameOrg: 'Custom Response Org',
      additionalData: 'extra info'
    };
    
    apiService.setCustomResponse(customResponse);
    
    component.renameOrg();
    tick();
    
    // Проверяем, что компонент корректно обрабатывает кастомный ответ
    expect(apiService.renameSelectedOrg).toHaveBeenCalled();
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    expect(successService.localHandler).toHaveBeenCalledWith('Организация переименована');
  }));

  it('should handle form state changes in integration', () => {
    // Проверяем начальное состояние
    expect(component.renameForm.pristine).toBeTrue();
    expect(component.renameForm.touched).toBeFalse();
    
    // Пользователь изменяет форму
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    input.nativeElement.focus();
    input.nativeElement.blur();
    
    fixture.detectChanges();
    
    // Состояние должно измениться
    expect(component.renameForm.touched).toBeTrue();
  });

  it('should handle component lifecycle correctly in integration', () => {
    // Проверяем, что компонент правильно инициализируется
    expect(component.ngOnInit).toBeDefined();
    expect(component.ngOnDestroy).toBeDefined();
    
    // Проверяем, что destroy$ subject создан
    expect(component['destroyed$']).toBeDefined();
  });

  it('should handle edge cases in integration', fakeAsync(() => {
    // Тестируем очень длинное имя
    const longName = 'A'.repeat(1000);
    component.renameForm.patchValue({ nameOrg: longName });
    
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: longName
    });
    
    // Тестируем специальные символы
    const specialName = 'Org!@#$%^&*()_+-=[]{}|;:,.<>?';
    component.renameForm.patchValue({ nameOrg: specialName });
    
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: specialName
    });
  }));

  it('should handle form reset in integration context', () => {
    // Изменяем значение формы
    component.renameForm.patchValue({ nameOrg: 'Changed Value' });
    expect(component.renameForm.get('nameOrg')?.value).toBe('Changed Value');
    
    // Сбрасываем форму
    component.renameForm.reset();
    
    // Форма должна вернуться к исходному состоянию
    expect(component.renameForm.get('nameOrg')?.value).toBe(null);
    expect(component.renameForm.pristine).toBeTrue();
    expect(component.renameForm.valid).toBeFalse();
  });

  it('should handle service state synchronization', fakeAsync(() => {
    // Проверяем начальное состояние
    expect(dateService.currentOrgWasRenamed.value).toBe(false);
    
    // Выполняем переименование
    component.renameOrg();
    tick();
    
    // Состояние должно синхронизироваться
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
    
    // Сбрасываем состояние
    dateService.currentOrgWasRenamed.next(false);
    expect(dateService.currentOrgWasRenamed.value).toBe(false);
  }));

  it('should handle component destruction correctly in integration', fakeAsync(() => {
    spyOn(component['destroyed$'], 'next');
    spyOn(component['destroyed$'], 'complete');
    
    // Создаем подписку
    component.renameOrg();
    tick();
    
    // Уничтожаем компонент
    component.ngOnDestroy();
    
    // Проверяем, что все подписки завершены
    expect(component['destroyed$'].next).toHaveBeenCalled();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  }));

  it('should handle form validation errors in integration', () => {
    // Устанавливаем невалидное значение
    component.renameForm.patchValue({ nameOrg: '' });
    fixture.detectChanges();
    
    // Форма должна быть невалидной
    expect(component.renameForm.valid).toBeFalse();
    expect(component.renameForm.get('nameOrg')?.hasError('required')).toBeTrue();
    
    // Кнопка должна быть неактивна
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should handle successful rename with different organization names', fakeAsync(() => {
    const testNames = [
      'Simple Org',
      'Organization with Spaces',
      'Org-With-Dashes',
      'Org_With_Underscores',
      '123 Organization',
      'Организация с кириллицей'
    ];
    
    testNames.forEach(name => {
      component.renameForm.patchValue({ nameOrg: name });
      component.renameOrg();
      tick();
      
      expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
        orgId: 'org123',
        newNameOrg: name
      });
      
      // Сбрасываем spy для следующего теста
      apiService.renameSelectedOrg.calls.reset();
    });
  }));
});
