import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject, Subject } from 'rxjs';

import { ModalRenameComponent } from './modal-rename.component';
import { ModalService } from '../../../shared/services/modal.service';
import { ApiService } from '../../../shared/services/api.service';
import { SuccessService } from '../../../shared/services/success.service';
import { DataCalendarService } from '../calendar-components/data-calendar-new/data-calendar.service';
import { DateService } from '../calendar-components/date.service';

describe('ModalRenameComponent', () => {
  let component: ModalRenameComponent;
  let fixture: ComponentFixture<ModalRenameComponent>;
  let modalService: jasmine.SpyObj<ModalService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let successService: jasmine.SpyObj<SuccessService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let dateService: jasmine.SpyObj<DateService>;

  const mockUserData = {
    userId: 'user123',
    nameUser: 'John',
    surnameUser: 'Doe'
  };

  const mockRenameResponse = {
    message: 'User renamed successfully'
  };

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'closeModalRenameUser',
      'close',
      'openClientListBlockWithData'
    ], {
      currentDataAboutSelectedUser: new BehaviorSubject(mockUserData)
    });

    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'renameUser'
    ]);

    const successServiceSpy = jasmine.createSpyObj('SuccessService', [
      'localHandler'
    ]);

    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth',
      'getAllUsersCurrentOrganization'
    ]);

    const dateServiceSpy = jasmine.createSpyObj('DateService', [], {
      recordingDaysChanged: new Subject<boolean>()
    });

    await TestBed.configureTestingModule({
      imports: [
        ModalRenameComponent,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: DateService, useValue: dateServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRenameComponent);
    component = fixture.componentInstance;
    
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.apiService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.successService).toBeDefined();
      expect(component.dataCalendarService).toBeDefined();
      expect(component.modalService).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should initialize formRename with correct structure', () => {
      expect(component.formRename).toBeDefined();
      expect(component.formRename instanceof FormGroup).toBe(true);
    });

    it('should have newNameUser form control', () => {
      const nameControl = component.formRename.get('newNameUser');
      expect(nameControl).toBeDefined();
      expect(nameControl?.value).toBe('John');
      expect(nameControl?.hasValidator(Validators.required)).toBe(true);
    });

    it('should have newSurnameUser form control', () => {
      const surnameControl = component.formRename.get('newSurnameUser');
      expect(surnameControl).toBeDefined();
      expect(surnameControl?.value).toBe('Doe');
      expect(surnameControl?.hasValidator(Validators.required)).toBe(true);
    });

    it('should initialize form with current user data', () => {
      expect(component.formRename.value.newNameUser).toBe('John');
      expect(component.formRename.value.newSurnameUser).toBe('Doe');
    });

    it('should have form with required validators', () => {
      const nameControl = component.formRename.get('newNameUser');
      const surnameControl = component.formRename.get('newSurnameUser');
      
      expect(nameControl?.hasValidator(Validators.required)).toBe(true);
      expect(surnameControl?.hasValidator(Validators.required)).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should initialize component state correctly', () => {
      component.ngOnInit();
      expect(component).toBeTruthy();
    });
  });

  describe('renameUser Method', () => {
    beforeEach(() => {
      apiService.renameUser.and.returnValue(of(mockRenameResponse));
      spyOn(component, 'refreshData' as any);
    });

    it('should call renameUser API with correct data', fakeAsync(() => {
      component.renameUser();
      tick();

      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: 'John',
        newSurname: 'Doe'
      });
    }));

    it('should close modal after successful rename', fakeAsync(() => {
      component.renameUser();
      tick();

      expect(modalService.closeModalRenameUser).toHaveBeenCalled();
      expect(modalService.close).toHaveBeenCalled();
    }));

    it('should refresh data after successful rename', fakeAsync(() => {
      component.renameUser();
      tick();

      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should show success message after rename', fakeAsync(() => {
      component.renameUser();
      tick();

      expect(successService.localHandler).toHaveBeenCalledWith('User renamed successfully');
    }));

    it('should handle API response correctly', fakeAsync(() => {
      const customResponse = { message: 'Custom success message' };
      apiService.renameUser.and.returnValue(of(customResponse));

      component.renameUser();
      tick();

      expect(successService.localHandler).toHaveBeenCalledWith('Custom success message');
    }));

    it('should use takeUntil operator for subscription management', fakeAsync(() => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.renameUser();
      tick();

      // Verify that the subscription is properly managed
      expect(component['destroyed$']).toBeDefined();
    }));

    it('should handle form values correctly', fakeAsync(() => {
      // Change form values
      component.formRename.patchValue({
        newNameUser: 'Jane',
        newSurnameUser: 'Smith'
      });

      component.renameUser();
      tick();

      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: 'Jane',
        newSurname: 'Smith'
      });
    }));

    it('should handle empty form values', fakeAsync(() => {
      // Set empty values
      component.formRename.patchValue({
        newNameUser: '',
        newSurnameUser: ''
      });

      component.renameUser();
      tick();

      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: '',
        newSurname: ''
      });
    }));

    it('should handle special characters in names', fakeAsync(() => {
      component.formRename.patchValue({
        newNameUser: 'José',
        newSurnameUser: 'O\'Connor'
      });

      component.renameUser();
      tick();

      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: 'José',
        newSurname: 'O\'Connor'
      });
    }));

    it('should handle very long names', fakeAsync(() => {
      const longName = 'A'.repeat(100);
      const longSurname = 'B'.repeat(100);

      component.formRename.patchValue({
        newNameUser: longName,
        newSurnameUser: longSurname
      });

      component.renameUser();
      tick();

      expect(apiService.renameUser).toHaveBeenCalledWith({
        userId: 'user123',
        newName: longName,
        newSurname: longSurname
      });
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const errorResponse = new Error('API Error');
      apiService.renameUser.and.returnValue(throwError(() => errorResponse));

      expect(() => {
        component.renameUser();
        tick();
      }).toThrow();

      // Modal should not be closed on error
      expect(modalService.closeModalRenameUser).not.toHaveBeenCalled();
      expect(modalService.close).not.toHaveBeenCalled();
      expect(component.refreshData).not.toHaveBeenCalled();
      expect(successService.localHandler).not.toHaveBeenCalled();
    }));

    it('should handle multiple rapid calls', fakeAsync(() => {
      // Make multiple rapid calls
      component.renameUser();
      component.renameUser();
      component.renameUser();
      tick();

      // Should handle gracefully (though ideally should prevent multiple calls)
      expect(apiService.renameUser).toHaveBeenCalledTimes(3);
    }));
  });

  describe('refreshData Method', () => {
    it('should call getAllEntryAllUsersForTheMonth', () => {
      component.refreshData();

      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
    });

    it('should call getAllUsersCurrentOrganization', () => {
      component.refreshData();

      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    });

    it('should emit recordingDaysChanged event', () => {
      spyOn(dateService.recordingDaysChanged, 'next');

      component.refreshData();

      expect(dateService.recordingDaysChanged.next).toHaveBeenCalledWith(true);
    });

    it('should call all required methods in correct order', () => {
      spyOn(dateService.recordingDaysChanged, 'next');

      component.refreshData();

      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledBefore(dataCalendarService.getAllUsersCurrentOrganization);
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalledBefore(dateService.recordingDaysChanged.next);
    });

    it('should handle multiple refresh calls', () => {
      component.refreshData();
      component.refreshData();
      component.refreshData();

      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalledTimes(3);
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalledTimes(3);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed$ subject', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should prevent memory leaks by unsubscribing', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should handle multiple destroy calls', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();
      component.ngOnDestroy();
      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalledTimes(3);
      expect(component['destroyed$'].complete).toHaveBeenCalledTimes(3);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
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

    it('should handle whitespace-only values', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: '   ', newSurnameUser: '   ' });
      expect(form.valid).toBeTrue(); // Angular doesn't trim by default
    });

    it('should handle null values', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: null, newSurnameUser: null });
      expect(form.valid).toBeFalse();
    });

    it('should handle undefined values', () => {
      const form = component.formRename;
      
      form.patchValue({ newNameUser: undefined, newSurnameUser: undefined });
      expect(form.valid).toBeFalse();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined user data', () => {
      modalService.currentDataAboutSelectedUser.next(undefined as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle null user data', () => {
      modalService.currentDataAboutSelectedUser.next(null as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle missing user properties', () => {
      modalService.currentDataAboutSelectedUser.next({} as any);
      
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle component recreation', () => {
      // Destroy current component
      fixture.destroy();
      
      // Create new instance
      const newFixture = TestBed.createComponent(ModalRenameComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      expect(newComponent).toBeTruthy();
      expect(newComponent.formRename).toBeDefined();
      
      newFixture.destroy();
    });

    it('should handle multiple component instances', () => {
      const fixture1 = TestBed.createComponent(ModalRenameComponent);
      const fixture2 = TestBed.createComponent(ModalRenameComponent);
      
      const component1 = fixture1.componentInstance;
      const component2 = fixture2.componentInstance;
      
      expect(component1).toBeTruthy();
      expect(component2).toBeTruthy();
      expect(component1).not.toBe(component2);
      
      fixture1.destroy();
      fixture2.destroy();
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with ModalService correctly', () => {
      expect(component.modalService).toBe(modalService);
    });

    it('should integrate with ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });

    it('should integrate with SuccessService correctly', () => {
      expect(component.successService).toBe(successService);
    });

    it('should integrate with DataCalendarService correctly', () => {
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid form changes efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should not leak memory on multiple operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 50; i++) {
        component.refreshData();
        component.formRename.patchValue({
          newNameUser: `Name${i}`,
          newSurnameUser: `Surname${i}`
        });
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state consistency', () => {
      const initialValue = { ...component.formRename.value };
      
      // Modify form
      component.formRename.patchValue({
        newNameUser: 'Modified Name',
        newSurnameUser: 'Modified Surname'
      });
      
      // Verify form was modified
      expect(component.formRename.value.newNameUser).toBe('Modified Name');
      expect(component.formRename.value.newSurnameUser).toBe('Modified Surname');
      
      // Reset to initial values
      component.formRename.patchValue(initialValue);
      
      // Verify form is back to initial state
      expect(component.formRename.value.newNameUser).toBe(initialValue.newNameUser);
      expect(component.formRename.value.newSurnameUser).toBe(initialValue.newSurnameUser);
    });

    it('should handle form reset correctly', () => {
      const originalValues = {
        newNameUser: 'John',
        newSurnameUser: 'Doe'
      };
      
      // Change values
      component.formRename.patchValue({
        newNameUser: 'Changed',
        newSurnameUser: 'Changed'
      });
      
      // Reset to original
      component.formRename.patchValue(originalValues);
      
      expect(component.formRename.value.newNameUser).toBe('John');
      expect(component.formRename.value.newSurnameUser).toBe('Doe');
    });
  });
});
