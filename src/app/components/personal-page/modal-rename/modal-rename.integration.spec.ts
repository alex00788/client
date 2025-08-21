import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError, Subject } from 'rxjs';

import { ModalRenameComponent } from './modal-rename.component';
import { ModalService } from '../../../shared/services/modal.service';
import { ApiService } from '../../../shared/services/api.service';
import { SuccessService } from '../../../shared/services/success.service';
import { DataCalendarService } from '../calendar-components/data-calendar-new/data-calendar.service';
import { DateService } from '../calendar-components/date.service';

// Mock services для интеграционных тестов
class MockModalService {
  currentDataAboutSelectedUser = new BehaviorSubject({
    userId: 'user123',
    nameUser: 'John',
    surnameUser: 'Doe'
  });
  
  closeModalRenameUser = jasmine.createSpy('closeModalRenameUser');
  close = jasmine.createSpy('close');
  openClientListBlockWithData = jasmine.createSpy('openClientListBlockWithData');
}

class MockApiService {
  renameUser = jasmine.createSpy('renameUser').and.returnValue(of({
    message: 'User renamed successfully'
  }));
}

class MockSuccessService {
  localHandler = jasmine.createSpy('localHandler');
}

class MockDataCalendarService {
  getAllEntryAllUsersForTheMonth = jasmine.createSpy('getAllEntryAllUsersForTheMonth');
  getAllUsersCurrentOrganization = jasmine.createSpy('getAllUsersCurrentOrganization');
}

class MockDateService {
  recordingDaysChanged = new Subject<boolean>();
}

describe('ModalRenameComponent Integration Tests', () => {
  let component: ModalRenameComponent;
  let fixture: ComponentFixture<ModalRenameComponent>;
  let modalService: MockModalService;
  let apiService: MockApiService;
  let successService: MockSuccessService;
  let dataCalendarService: MockDataCalendarService;
  let dateService: MockDateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalRenameComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ModalService, useClass: MockModalService },
        { provide: ApiService, useClass: MockApiService },
        { provide: SuccessService, useClass: MockSuccessService },
        { provide: DataCalendarService, useClass: MockDataCalendarService },
        { provide: DateService, useClass: MockDateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRenameComponent);
    component = fixture.componentInstance;
    
    modalService = TestBed.inject(ModalService) as any;
    apiService = TestBed.inject(ApiService) as any;
    successService = TestBed.inject(SuccessService) as any;
    dataCalendarService = TestBed.inject(DataCalendarService) as any;
    dateService = TestBed.inject(DateService) as any;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ====== БАЗОВЫЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ ======
  describe('Basic Integration Tests', () => {
    it('should maintain form state consistency across multiple operations', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state
      expect(component.formRename.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Change name only
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.formRename.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Change surname only
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.formRename.valid).toBeTrue();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear name
      nameInput.nativeElement.value = '';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.formRename.valid).toBeFalse();
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should handle form submission lifecycle correctly', fakeAsync(() => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      
      // Fill form with new values
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Submit form
      component.renameUser();
      tick();
      
      // Verify API call
      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: 'Jane',
        newSurname: 'Smith'
      });
      
      // Verify modal operations
      expect(modalService.closeModalRenameUser).toHaveBeenCalled();
      expect(modalService.close).toHaveBeenCalled();
      
      // Verify data refresh
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      
      // Verify success message
      expect(successService.localHandler).toHaveBeenCalledWith('User renamed successfully');
    }));

    it('should maintain UI consistency during form state changes', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state - button enabled
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Fill form
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Form should be valid and button enabled
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear name
      nameInput.nativeElement.value = '';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Form should be invalid and button disabled
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });

  // ====== ЖИЗНЕННЫЙ ЦИКЛ КОМПОНЕНТА ======
  describe('Component Lifecycle Integration', () => {
    it('should properly initialize and destroy with form state', () => {
      expect(component).toBeTruthy();
      expect(component.formRename).toBeDefined();
      expect(component.formRename.valid).toBeTrue();
      
      // Form controls should be properly initialized
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      expect(nameInput).toBeTruthy();
      expect(surnameInput).toBeTruthy();
      
      // Submit button should be enabled initially
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should handle component recreation with form state', () => {
      // Fill form in current component
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.formRename.value.newNameUser).toBe('Jane');
      expect(component.formRename.value.newSurnameUser).toBe('Smith');
      
      // Destroy current component
      fixture.destroy();
      
      // Create new instance
      const newFixture = TestBed.createComponent(ModalRenameComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      // New component should have initial state
      expect(newComponent.formRename.value.newNameUser).toBe('John');
      expect(newComponent.formRename.value.newSurnameUser).toBe('Doe');
      
      newFixture.destroy();
    });
  });

  // ====== МНОЖЕСТВЕННЫЕ ЭКЗЕМПЛЯРЫ ======
  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      const fixture1 = TestBed.createComponent(ModalRenameComponent);
      const fixture2 = TestBed.createComponent(ModalRenameComponent);
      
      const component1 = fixture1.componentInstance;
      const component2 = fixture2.componentInstance;
      
      // Initial states should be independent
      expect(component1.formRename.value.newNameUser).toBe('John');
      expect(component2.formRename.value.newNameUser).toBe('John');
      
      // Modify first component
      component1.formRename.patchValue({ newNameUser: 'Jane', newSurnameUser: 'Smith' });
      expect(component1.formRename.value.newNameUser).toBe('Jane');
      expect(component2.formRename.value.newNameUser).toBe('John');
      
      // Modify second component
      component2.formRename.patchValue({ newNameUser: 'Bob', newSurnameUser: 'Johnson' });
      expect(component1.formRename.value.newNameUser).toBe('Jane');
      expect(component2.formRename.value.newNameUser).toBe('Bob');
      
      // Cleanup
      fixture1.destroy();
      fixture2.destroy();
    });
  });

  // ====== ПРОВЕРКА UI КОНСИСТЕНТНОСТИ ======
  describe('UI Consistency Integration', () => {
    it('should provide clear visual feedback for all form states', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initial state - button enabled
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear name - button disabled
      nameInput.nativeElement.value = '';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // Fill name - button enabled
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Clear surname - button disabled
      surnameInput.nativeElement.value = '';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should maintain visual consistency during form interactions', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const backButton = fixture.debugElement.query(By.css('button[type="button"]'));
      
      // Initial state
      expect(nameInput.nativeElement.value).toBe('John');
      expect(surnameInput.nativeElement.value).toBe('Doe');
      expect(backButton.nativeElement.textContent.trim()).toBe('Назад');
      
      // Change values
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Values should be updated
      expect(nameInput.nativeElement.value).toBe('Jane');
      expect(surnameInput.nativeElement.value).toBe('Smith');
      
      // Back button should remain unchanged
      expect(backButton.nativeElement.textContent.trim()).toBe('Назад');
    });
  });

  // ====== ИНТЕГРАЦИЯ С СЕРВИСАМИ ======
  describe('Service Integration', () => {
    it('should integrate with modal service for navigation flow', () => {
      const backButton = fixture.debugElement.query(By.css('button[type="button"]'));
      
      // Click back button
      backButton.nativeElement.click();
      
      // Should open client list block
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    });

    it('should integrate with API service for data operations', fakeAsync(() => {
      // Test successful API call
      component.renameUser();
      tick();
      
      expect(apiService.renameUser).toHaveBeenCalled();
      expect(modalService.closeModalRenameUser).toHaveBeenCalled();
      expect(modalService.close).toHaveBeenCalled();
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalled();
    }));

    it('should integrate with data calendar service for refresh operations', () => {
      component.refreshData();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    });

    it('should integrate with date service for state management', () => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      component.refreshData();
      
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });
  });

  // ====== ОБРАБОТКА ОШИБОК И ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully without breaking UI', fakeAsync(() => {
      // Mock API error
      apiService.renameUser.and.returnValue(throwError(() => new Error('Network error')));
      
      // Try to rename user
      expect(() => {
        component.renameUser();
        tick();
      }).toThrow();
      
      // UI should remain intact
      expect(component).toBeTruthy();
      expect(fixture.debugElement.query(By.css('form'))).toBeTruthy();
      
      // Modal should not be closed on error
      expect(modalService.closeModalRenameUser).not.toHaveBeenCalled();
      expect(modalService.close).not.toHaveBeenCalled();
    }));

    it('should handle rapid user interactions without state corruption', fakeAsync(() => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      
      // Rapidly fill form
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Rapidly submit multiple times
      component.renameUser();
      component.renameUser();
      component.renameUser();
      tick();
      
      // Form should be in consistent state
      expect(component.formRename.value.newNameUser).toBe('Jane');
      expect(component.formRename.value.newSurnameUser).toBe('Smith');
      
      // API should be called multiple times
      expect(apiService.renameUser).toHaveBeenCalledTimes(3);
    }));

    it('should handle form validation edge cases', () => {
      const form = component.formRename;
      
      // Test with very long values
      const longName = 'A'.repeat(1000);
      const longSurname = 'B'.repeat(1000);
      
      form.patchValue({ newNameUser: longName, newSurnameUser: longSurname });
      expect(form.valid).toBeTrue();
      
      // Test with special characters
      const specialName = 'José María O\'Connor-Smith';
      const specialSurname = 'van der Berg & Co.';
      
      form.patchValue({ newNameUser: specialName, newSurnameUser: specialSurname });
      expect(form.valid).toBeTrue();
      
      // Test with numbers
      const numericName = '12345';
      const numericSurname = '67890';
      
      form.patchValue({ newNameUser: numericName, newSurnameUser: numericSurname });
      expect(form.valid).toBeTrue();
    });
  });

  // ====== ПРОВЕРКА ДОСТУПНОСТИ ======
  describe('Accessibility Integration', () => {
    it('should maintain proper form labels and associations', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      
      // Inputs should have proper formControlName attributes
      expect(nameInput.nativeElement.getAttribute('formControlName')).toBe('newNameUser');
      expect(surnameInput.nativeElement.getAttribute('formControlName')).toBe('newSurnameUser');
      
      // Placeholders should be present
      expect(nameInput.nativeElement.placeholder).toBe('Имя');
      expect(surnameInput.nativeElement.placeholder).toBe('Фамилия');
    });

    it('should provide proper button states and feedback', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const backButton = fixture.debugElement.query(By.css('button[type="button"]'));
      
      // Submit button should have proper type and initial state
      expect(submitButton.nativeElement.type).toBe('submit');
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // Back button should be clickable
      expect(backButton.nativeElement.type).toBe('button');
      expect(backButton.nativeElement.textContent.trim()).toBe('Назад');
    });

    it('should maintain form structure consistency', () => {
      const form = fixture.debugElement.query(By.css('form'));
      const titleBlock = fixture.debugElement.query(By.css('.titleRenameBlock'));
      const dataBlock = fixture.debugElement.query(By.css('.dataRenameBlock'));
      const buttonBlock = fixture.debugElement.query(By.css('.btnRenameBlock'));
      
      expect(form).toBeTruthy();
      expect(titleBlock).toBeTruthy();
      expect(dataBlock).toBeTruthy();
      expect(buttonBlock).toBeTruthy();
      
      expect(titleBlock.nativeElement.textContent.trim()).toBe('Введите новое имя и фамилию');
    });
  });

  // ====== ПРОИЗВОДИТЕЛЬНОСТЬ И ПАМЯТЬ ======
  describe('Performance and Memory Integration', () => {
    it('should handle multiple form operations efficiently', () => {
      const startTime = performance.now();
      
      // Perform many form operations
      for (let i = 0; i < 100; i++) {
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
        component.refreshData();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(500);
    });

    it('should maintain memory efficiency during multiple operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many operations
      for (let i = 0; i < 50; i++) {
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
        component.refreshData();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024); // Less than 2MB
    });
  });

  // ====== СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ ======
  describe('User Scenarios Integration', () => {
    it('should handle complete user rename workflow', fakeAsync(() => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // 1. User opens modal (already done in beforeEach)
      expect(component.formRename.value.newNameUser).toBe('John');
      expect(component.formRename.value.newSurnameUser).toBe('Doe');
      
      // 2. User modifies name
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // 3. User modifies surname
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // 4. User submits form
      expect(submitButton.nativeElement.disabled).toBeFalse();
      component.renameUser();
      tick();
      
      // 5. Verify all operations completed
      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: 'Jane',
        newSurname: 'Smith'
      });
      expect(modalService.closeModalRenameUser).toHaveBeenCalled();
      expect(modalService.close).toHaveBeenCalled();
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalledWith('User renamed successfully');
    }));

    it('should handle user cancellation workflow', () => {
      const backButton = fixture.debugElement.query(By.css('button[type="button"]'));
      
      // User clicks back button
      backButton.nativeElement.click();
      
      // Should navigate back to client list
      expect(modalService.openClientListBlockWithData).toHaveBeenCalled();
    });

    it('should handle user form validation workflow', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Initially form is valid
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // User clears name - form becomes invalid
      nameInput.nativeElement.value = '';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
      
      // User fills name - form becomes valid again
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeFalse();
      
      // User clears surname - form becomes invalid
      surnameInput.nativeElement.value = '';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });
});

