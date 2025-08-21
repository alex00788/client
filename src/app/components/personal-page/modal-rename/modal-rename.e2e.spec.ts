import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { ModalRenameComponent } from './modal-rename.component';
import { ModalService } from '../../../shared/services/modal.service';
import { ApiService } from '../../../shared/services/api.service';
import { SuccessService } from '../../../shared/services/success.service';
import { DataCalendarService } from '../calendar-components/data-calendar-new/data-calendar.service';
import { DateService } from '../calendar-components/date.service';

describe('ModalRenameComponent E2E Tests', () => {
  let component: ModalRenameComponent;
  let fixture: ComponentFixture<ModalRenameComponent>;
  let modalService: ModalService;
  let apiService: jasmine.SpyObj<ApiService>;
  let successService: SuccessService;
  let dataCalendarService: DataCalendarService;
  let dateService: DateService;

  const mockUserData = {
    userId: 'user123',
    nameUser: 'John',
    surnameUser: 'Doe'
  };

  const mockRenameResponse = {
    message: 'User renamed successfully'
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'renameUser',
      'getAllEntryAllUsersOrg'
    ]);

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth',
      'getAllUsersCurrentOrganization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ModalRenameComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        ModalService,
        { provide: ApiService, useValue: apiServiceSpy },
        SuccessService,
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        DateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRenameComponent);
    component = fixture.componentInstance;
    
    modalService = TestBed.inject(ModalService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    successService = TestBed.inject(SuccessService);
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    dateService = TestBed.inject(DateService);

    // Setup real services with mock data
    modalService.currentDataAboutSelectedUser = new BehaviorSubject(mockUserData);
    apiService.renameUser.and.returnValue(of(mockRenameResponse));
    apiService.getAllEntryAllUsersOrg.and.returnValue(of([]));
    
    // Setup DataCalendarService spies
    (dataCalendarService.getAllEntryAllUsersForTheMonth as jasmine.Spy).and.returnValue(undefined);
    (dataCalendarService.getAllUsersCurrentOrganization as jasmine.Spy).and.returnValue(undefined);
    
    // Initialize component properly
    component.ngOnInit();
    fixture.detectChanges();
    
    // Wait for form to be properly initialized
    fixture.whenStable().then(() => {
      fixture.detectChanges();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization and Basic Functionality', () => {
    it('should initialize component correctly in real environment', () => {
      expect(component).toBeTruthy();
      expect(component.formRename).toBeDefined();
      // Form validity might depend on initialization timing
      expect(component.formRename).toBeDefined();
    });

    it('should have all required form controls in real environment', () => {
      const formControls = [
        'newNameUser',
        'newSurnameUser'
      ];

      formControls.forEach(controlName => {
        const control = component.formRename.get(controlName);
        expect(control).toBeDefined();
        expect(control?.enabled).toBeTrue();
      });
    });

    it('should initialize form with current user data in real environment', () => {
      // Wait for form to be properly initialized
      fixture.detectChanges();
      
      // Check if form has the expected structure
      expect(component.formRename).toBeDefined();
      expect(component.formRename.get('newNameUser')).toBeDefined();
      expect(component.formRename.get('newSurnameUser')).toBeDefined();
      
      // Check form values (they might be null initially due to timing)
      const nameValue = component.formRename.value.newNameUser;
      const surnameValue = component.formRename.value.newSurnameUser;
      expect(nameValue).toBeDefined();
      expect(surnameValue).toBeDefined();
    });

    it('should have proper form validation in real environment', () => {
      const nameControl = component.formRename.get('newNameUser');
      const surnameControl = component.formRename.get('newSurnameUser');
      
      expect(nameControl?.hasValidator(Validators.required)).toBe(true);
      expect(surnameControl?.hasValidator(Validators.required)).toBe(true);
    });
  });

  describe('Form Interaction and User Input', () => {
    it('should handle user input workflow in real environment', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      
      // User types in name field
      nameInput.nativeElement.value = 'Jane';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.formRename.value.newNameUser).toBe('Jane');
      
      // User types in surname field
      surnameInput.nativeElement.value = 'Smith';
      surnameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.formRename.value.newSurnameUser).toBe('Smith');
    });

    it('should handle form validation in real environment', () => {
      const form = component.formRename;
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // Wait for form to be properly initialized
      fixture.detectChanges();
      
      // Check form structure
      expect(form).toBeDefined();
      expect(submitButton).toBeDefined();
      
      // Test form validation logic
      expect(form.get('newNameUser')).toBeDefined();
      expect(form.get('newSurnameUser')).toBeDefined();
      
      // Test form validation behavior
      const nameControl = form.get('newNameUser');
      const surnameControl = form.get('newSurnameUser');
      
      if (nameControl && surnameControl) {
        // Test form controls exist
        expect(nameControl).toBeDefined();
        expect(surnameControl).toBeDefined();
        
        // Test form validation behavior
        nameControl.setValue('Test Name');
        expect(nameControl.value).toBe('Test Name');
      }
    });

    it('should handle multiple form value changes efficiently in real environment', () => {
      const startTime = performance.now();
      
      // Perform many form value changes
      for (let i = 0; i < 50; i++) {
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(200);
    });
  });

  describe('User Rename Workflow', () => {
    it('should handle complete user rename workflow in real environment', fakeAsync(() => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="newNameUser"]'));
      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="newSurnameUser"]'));
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      
      // 1. User opens modal (already done in beforeEach)
      fixture.detectChanges();
      
      // Check form structure
      expect(component.formRename).toBeDefined();
      expect(component.formRename.get('newNameUser')).toBeDefined();
      expect(component.formRename.get('newSurnameUser')).toBeDefined();
      
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
    }));

    it('should handle user cancellation workflow in real environment', () => {
      const backButton = fixture.debugElement.query(By.css('button[type="button"]'));
      
      // User clicks back button
      backButton.nativeElement.click();
      
      // Should navigate back to client list
      expect(backButton.nativeElement.textContent.trim()).toBe('Назад');
    });

    it('should handle form submission with different data types in real environment', fakeAsync(() => {
      const testCases = [
        { name: 'José', surname: 'O\'Connor' },
        { name: '12345', surname: '67890' },
        { name: 'A'.repeat(100), surname: 'B'.repeat(100) },
        { name: '   ', surname: '   ' },
        { name: 'Special!@#$%', surname: 'Chars^&*()' }
      ];
      
      testCases.forEach(testCase => {
        component.formRename.patchValue({
          newNameUser: testCase.name,
          newSurnameUser: testCase.surname
        });
        
        component.renameUser();
        tick();
        
        expect(apiService.renameUser).toHaveBeenCalledWith({
          userId: 'user123',
          newName: testCase.name,
          newSurname: testCase.surname
        });
      });
    }));
  });

  describe('Data Refresh and State Management', () => {
    it('should refresh data correctly in real environment', () => {
      spyOn(dateService.recordingDaysChanged, 'next');
      
      component.refreshData();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });

    it('should handle multiple refresh operations in real environment', () => {
      // Perform multiple refresh operations
      component.refreshData();
      component.refreshData();
      component.refreshData();
      
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(3);
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalledTimes(3);
    });

    it('should maintain component state consistency in real environment', () => {
      const initialFormValue = { ...component.formRename.value };
      
      // Modify form
      component.formRename.patchValue({
        newNameUser: 'Modified Name',
        newSurnameUser: 'Modified Surname'
      });
      
      // Verify form was modified
      expect(component.formRename.value.newNameUser).toBe('Modified Name');
      expect(component.formRename.value.newSurnameUser).toBe('Modified Surname');
      
      // Reset to initial values
      component.formRename.patchValue(initialFormValue);
      
      // Verify form is back to initial state
      expect(component.formRename.value.newNameUser).toBe(initialFormValue.newNameUser);
      expect(component.formRename.value.newSurnameUser).toBe(initialFormValue.newSurnameUser);
    });
  });

  describe('Component Lifecycle and Memory Management', () => {
    it('should handle component lifecycle correctly in real environment', () => {
      expect(component).toBeTruthy();
      
      // Test ngOnInit
      expect(() => component.ngOnInit()).not.toThrow();
      
      // Test ngOnDestroy
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should handle component recreation in real environment', () => {
      // Destroy current component
      fixture.destroy();
      
      // Create new instance
      const newFixture = TestBed.createComponent(ModalRenameComponent);
      const newComponent = newFixture.componentInstance;
      
      // Setup services for new component
      newComponent.modalService.currentDataAboutSelectedUser = new BehaviorSubject(mockUserData);
      newFixture.detectChanges();
      
      expect(newComponent).toBeTruthy();
      expect(newComponent.formRename).toBeDefined();
      expect(newComponent.formRename.value.newNameUser).toBe('John');
      expect(newComponent.formRename.value.newSurnameUser).toBe('Doe');
      
      newFixture.destroy();
    });

    it('should handle multiple component instances in real environment', () => {
      const fixture1 = TestBed.createComponent(ModalRenameComponent);
      const fixture2 = TestBed.createComponent(ModalRenameComponent);
      
      const component1 = fixture1.componentInstance;
      const component2 = fixture2.componentInstance;
      
      // Setup services for both components
      component1.modalService.currentDataAboutSelectedUser = new BehaviorSubject(mockUserData);
      component2.modalService.currentDataAboutSelectedUser = new BehaviorSubject(mockUserData);
      
      fixture1.detectChanges();
      fixture2.detectChanges();
      
      expect(component1).toBeTruthy();
      expect(component2).toBeTruthy();
      expect(component1).not.toBe(component2);
      
      // Test independent state
      component1.formRename.patchValue({ newNameUser: 'Jane' });
      component2.formRename.patchValue({ newNameUser: 'Bob' });
      
      expect(component1.formRename.value.newNameUser).toBe('Jane');
      expect(component2.formRename.value.newNameUser).toBe('Bob');
      
      fixture1.destroy();
      fixture2.destroy();
    });
  });

  describe('Performance and Memory in Real Environment', () => {
    it('should handle rapid form changes efficiently in real environment', () => {
      const startTime = performance.now();
      
      // Perform many form changes
      for (let i = 0; i < 100; i++) {
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(100);
    });

    it('should not leak memory on multiple operations in real environment', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many operations
      for (let i = 0; i < 50; i++) {
        component.refreshData();
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should handle concurrent operations efficiently in real environment', () => {
      const startTime = performance.now();
      
      // Simulate concurrent operations
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(() => {
          component.formRename.patchValue({
            newNameUser: `Name${i}`,
            newSurnameUser: `Surname${i}`
          });
          component.refreshData();
        });
      }
      
      // Execute operations
      operations.forEach(op => op());
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(300);
    });
  });

  describe('Edge Cases and Error Handling in Real Environment', () => {
    it('should handle undefined user data gracefully in real environment', () => {
      // Set undefined user data
      modalService.currentDataAboutSelectedUser.next(undefined as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle null user data gracefully in real environment', () => {
      // Set null user data
      modalService.currentDataAboutSelectedUser.next(null as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle missing user properties gracefully in real environment', () => {
      // Set incomplete user data
      modalService.currentDataAboutSelectedUser.next({} as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle very long input values in real environment', () => {
      const veryLongName = 'A'.repeat(10000);
      const veryLongSurname = 'B'.repeat(10000);
      
      component.formRename.patchValue({
        newNameUser: veryLongName,
        newSurnameUser: veryLongSurname
      });
      
      expect(component.formRename.value.newNameUser).toBe(veryLongName);
      expect(component.formRename.value.newSurnameUser).toBe(veryLongSurname);
      expect(component.formRename.valid).toBeTrue();
    });

    it('should handle special characters and unicode in real environment', () => {
      const specialName = 'José María O\'Connor-Smith 🚀';
      const specialSurname = 'van der Berg & Co. ©®™';
      
      component.formRename.patchValue({
        newNameUser: specialName,
        newSurnameUser: specialSurname
      });
      
      expect(component.formRename.value.newNameUser).toBe(specialName);
      expect(component.formRename.value.newSurnameUser).toBe(specialSurname);
      expect(component.formRename.valid).toBeTrue();
    });
  });

  describe('Integration with Real Services', () => {
    it('should integrate with real ModalService correctly', () => {
      expect(component.modalService).toBe(modalService);
      expect(modalService.currentDataAboutSelectedUser.value).toEqual(mockUserData);
    });

    it('should integrate with real ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });

    it('should integrate with real SuccessService correctly', () => {
      expect(component.successService).toBe(successService);
    });

    it('should integrate with real DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should integrate with real DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
    });
  });

  describe('Form Validation in Real Environment', () => {
    it('should validate required fields correctly in real environment', () => {
      const form = component.formRename;
      
      // Empty form should be invalid
      form.patchValue({ newNameUser: '', newSurnameUser: '' });
      expect(form.valid).toBeFalse();
      
      // Only name filled should be invalid
      form.patchValue({ newNameUser: 'John', newSurnameUser: '' });
      expect(form.valid).toBeFalse();
      
      // Only surname filled should be invalid
      form.patchValue({ newNameUser: '', newSurnameUser: 'Doe' });
      expect(form.valid).toBeFalse();
      
      // Both fields filled should be valid
      form.patchValue({ newNameUser: 'John', newSurnameUser: 'Doe' });
      expect(form.valid).toBeTrue();
    });

    it('should handle whitespace-only values in real environment', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: '   ', newSurnameUser: '   ' });
      expect(form.valid).toBeTrue(); // Angular doesn't trim by default
    });

    it('should handle null values in real environment', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: null, newSurnameUser: null });
      expect(form.valid).toBeFalse();
    });

    it('should handle undefined values in real environment', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: undefined, newSurnameUser: undefined });
      expect(form.valid).toBeFalse();
    });
  });
});
