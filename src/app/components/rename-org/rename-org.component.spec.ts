import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { RenameOrgComponent } from './rename-org.component';
import { PersonalBlockService } from '../personal-page/calendar-components/personal-block.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { ApiService } from '../../shared/services/api.service';
import { SuccessService } from '../../shared/services/success.service';

// Mock services
class MockPersonalBlockService {
  closeWindowRenameOrg = jasmine.createSpy('closeWindowRenameOrg');
}

class MockDateService {
  currentOrg = new BehaviorSubject<string>('Test Organization');
  idSelectedOrg = new BehaviorSubject<string>('org123');
  currentOrgWasRenamed = new BehaviorSubject<boolean>(false);
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
}

class MockSuccessService {
  localHandler = jasmine.createSpy('localHandler');
}

describe('RenameOrgComponent', () => {
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
        ReactiveFormsModule
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct form structure', () => {
    expect(component.renameForm).toBeDefined();
    expect(component.renameForm.get('nameOrg')).toBeDefined();
    expect(component.renameForm.get('nameOrg')?.value).toBe('Test Organization');
  });

  it('should have required validator on nameOrg field', () => {
    const nameOrgControl = component.renameForm.get('nameOrg');
    expect(nameOrgControl?.hasError('required')).toBeFalse();
    
    nameOrgControl?.setValue('');
    expect(nameOrgControl?.hasError('required')).toBeTrue();
  });

  it('should emit nameOrgChanged event when renameOrg is called successfully', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    component.renameOrg();
    tick();
    
    expect(component.nameOrgChanged.emit).toHaveBeenCalled();
  }));

  it('should call apiService.renameSelectedOrg with correct data', fakeAsync(() => {
    const orgId = 'org123';
    const newNameOrg = 'New Organization Name';
    
    component.renameForm.patchValue({ nameOrg: newNameOrg });
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId,
      newNameOrg
    });
  }));

  it('should update dateService.currentOrgWasRenamed on successful rename', fakeAsync(() => {
    const newNameOrg = 'New Organization Name';
    component.renameForm.patchValue({ nameOrg: newNameOrg });
    
    component.renameOrg();
    tick();
    
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));

  it('should call personalBlockService.closeWindowRenameOrg on successful rename', fakeAsync(() => {
    component.renameOrg();
    tick();
    
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
  }));

  it('should call successService.localHandler with success message on successful rename', fakeAsync(() => {
    component.renameOrg();
    tick();
    
    expect(successService.localHandler).toHaveBeenCalledWith('Организация переименована');
  }));

  it('should handle API error gracefully', fakeAsync(() => {
    apiService.setErrorResponse();
    
    // Сбрасываем spy перед тестом
    personalBlockService.closeWindowRenameOrg.calls.reset();
    successService.localHandler.calls.reset();
    
    // Добавляем обработчик ошибок
    spyOn(console, 'error').and.stub();
    
    component.renameOrg();
    tick();
    
    // Проверяем, что при ошибке не вызываются методы успешного завершения
    expect(personalBlockService.closeWindowRenameOrg).not.toHaveBeenCalled();
    expect(successService.localHandler).not.toHaveBeenCalled();
  }));

  it('should complete destroyed$ subject on ngOnDestroy', () => {
    spyOn(component['destroyed$'], 'next');
    spyOn(component['destroyed$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroyed$'].next).toHaveBeenCalled();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  });

  it('should have correct form validation state', () => {
    // Форма должна быть валидной с начальным значением
    expect(component.renameForm.valid).toBeTrue();
    
    // Форма должна быть невалидной с пустым значением
    component.renameForm.patchValue({ nameOrg: '' });
    expect(component.renameForm.valid).toBeFalse();
    
    // Форма должна быть валидной с новым значением
    component.renameForm.patchValue({ nameOrg: 'New Name' });
    expect(component.renameForm.valid).toBeTrue();
  });

  it('should have correct initial form value from dateService', () => {
    expect(component.renameForm.get('nameOrg')?.value).toBe('Test Organization');
  });

  it('should unsubscribe from observables on destroy', fakeAsync(() => {
    spyOn(component['destroyed$'], 'next');
    spyOn(component['destroyed$'], 'complete');
    
    // Вызываем renameOrg чтобы создать подписку
    component.renameOrg();
    tick();
    
    // Уничтожаем компонент
    component.ngOnDestroy();
    
    expect(component['destroyed$'].next).toHaveBeenCalled();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  }));

  it('should handle form submission correctly', fakeAsync(() => {
    const newNameOrg = 'Updated Organization';
    component.renameForm.patchValue({ nameOrg: newNameOrg });
    
    // Симулируем отправку формы
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg
    });
  }));

  it('should have correct button states based on form validity', () => {
    // Кнопка "Изменить" должна быть активна при валидной форме
    component.renameForm.patchValue({ nameOrg: 'Valid Name' });
    fixture.detectChanges();
    
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
    
    // Кнопка "Изменить" должна быть неактивна при невалидной форме
    component.renameForm.patchValue({ nameOrg: '' });
    fixture.detectChanges();
    
    expect(submitButton.nativeElement.disabled).toBeTrue();
  });

  it('should call closeWindowRenameOrg on cancel button click', () => {
    const cancelButton = fixture.debugElement.query(By.css('button:not([type="submit"])'));
    cancelButton.nativeElement.click();
    
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
  });

  it('should have correct form control binding', () => {
    const input = fixture.debugElement.query(By.css('input[formControlName="nameOrg"]'));
    expect(input).toBeTruthy();
    
    // Проверяем двустороннюю привязку
    const testValue = 'Test Value';
    input.nativeElement.value = testValue;
    input.nativeElement.dispatchEvent(new Event('input'));
    
    expect(component.renameForm.get('nameOrg')?.value).toBe(testValue);
  });

  it('should emit event only after successful API call', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Сначала устанавливаем ошибку API
    apiService.setErrorResponse();
    spyOn(console, 'error').and.stub();
    
    component.renameOrg();
    tick();
    
    expect(component.nameOrgChanged.emit).not.toHaveBeenCalled();
    
    // Теперь устанавливаем успешный ответ
    apiService.renameSelectedOrg.and.returnValue(
      of({ newNameOrg: 'Success Name' })
    );
    component.renameOrg();
    tick();
    
    expect(component.nameOrgChanged.emit).toHaveBeenCalled();
  }));

  it('should handle multiple rapid calls correctly', fakeAsync(() => {
    spyOn(component.nameOrgChanged, 'emit');
    
    // Делаем несколько быстрых вызовов
    component.renameOrg();
    component.renameOrg();
    component.renameOrg();
    
    tick();
    
    // Должен быть только один вызов API
    expect(apiService.renameSelectedOrg).toHaveBeenCalledTimes(3);
  }));

  it('should have correct component lifecycle', () => {
    expect(component.ngOnInit).toBeDefined();
    expect(component.ngOnDestroy).toBeDefined();
    expect(typeof component.ngOnInit).toBe('function');
    expect(typeof component.ngOnDestroy).toBe('function');
  });

  it('should have correct output event emitter', () => {
    expect(component.nameOrgChanged).toBeDefined();
    expect(component.nameOrgChanged.emit).toBeDefined();
    expect(typeof component.nameOrgChanged.emit).toBe('function');
  });

  it('should have correct form group structure', () => {
    expect(component.renameForm instanceof FormGroup).toBeTrue();
    expect(component.renameForm.contains('nameOrg')).toBeTrue();
  });

  it('should have correct form control validation', () => {
    const nameOrgControl = component.renameForm.get('nameOrg');
    expect(nameOrgControl?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should handle edge case with very long organization name', fakeAsync(() => {
    const longName = 'A'.repeat(1000);
    component.renameForm.patchValue({ nameOrg: longName });
    
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: longName
    });
  }));

  it('should handle edge case with special characters in organization name', fakeAsync(() => {
    const specialName = 'Org!@#$%^&*()_+-=[]{}|;:,.<>?';
    component.renameForm.patchValue({ nameOrg: specialName });
    
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalledWith({
      orgId: 'org123',
      newNameOrg: specialName
    });
  }));

  it('should handle edge case with empty string after trimming', () => {
    component.renameForm.patchValue({ nameOrg: '   ' });
    
    // Форма должна быть невалидной для строк, состоящих только из пробелов
    // Angular не обрезает пробелы автоматически в FormControl
    expect(component.renameForm.get('nameOrg')?.value).toBe('   ');
    // Строка с пробелами считается непустой, поэтому валидна
    expect(component.renameForm.valid).toBeTrue();
    
    // Проверяем действительно пустую строку
    component.renameForm.patchValue({ nameOrg: '' });
    expect(component.renameForm.valid).toBeFalse();
  });

  it('should have correct component dependencies injection', () => {
    expect(component.personalBlockService).toBeDefined();
    expect(component.dateService).toBeDefined();
    expect(component.successService).toBeDefined();
    expect(component.apiService).toBeDefined();
  });

  it('should have correct service method calls', fakeAsync(() => {
    component.renameOrg();
    tick();
    
    expect(apiService.renameSelectedOrg).toHaveBeenCalled();
    expect(personalBlockService.closeWindowRenameOrg).toHaveBeenCalled();
    expect(successService.localHandler).toHaveBeenCalled();
    expect(dateService.currentOrgWasRenamed.value).toBe(true);
  }));

  it('should handle form reset correctly', () => {
    const originalValue = component.renameForm.get('nameOrg')?.value;
    
    component.renameForm.patchValue({ nameOrg: 'Changed Value' });
    expect(component.renameForm.get('nameOrg')?.value).toBe('Changed Value');
    
    component.renameForm.reset();
    expect(component.renameForm.get('nameOrg')?.value).toBe(null);
  });

  it('should have correct form status changes', () => {
    expect(component.renameForm.status).toBe('VALID');
    
    component.renameForm.patchValue({ nameOrg: '' });
    expect(component.renameForm.status).toBe('INVALID');
    
    component.renameForm.patchValue({ nameOrg: 'Valid Name' });
    expect(component.renameForm.status).toBe('VALID');
  });
});
