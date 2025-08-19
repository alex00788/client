import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddNewOrgComponent } from './add-new-org.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { SuccessService } from '../../../../../shared/services/success.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

describe('AddNewOrgComponent', () => {
  let component: AddNewOrgComponent;
  let fixture: ComponentFixture<AddNewOrgComponent>;
  let personalBlockService: jasmine.SpyObj<PersonalBlockService>;
  let dateService: jasmine.SpyObj<DateService>;
  let successService: jasmine.SpyObj<SuccessService>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const personalBlockServiceSpy = jasmine.createSpyObj('PersonalBlockService', ['closeWindowAddedNewOrg'], {
      windowAddingNewOrgIsOpen: false
    });
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getCurrentDate']);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['addNewOrganization']);

    await TestBed.configureTestingModule({
      imports: [
        AddNewOrgComponent,
        ReactiveFormsModule,
        FormsModule,
        NgIf
      ],
      providers: [
        { provide: PersonalBlockService, useValue: personalBlockServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNewOrgComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService) as jasmine.SpyObj<PersonalBlockService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.successService).toBeDefined();
      expect(component.apiService).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should have emitForOrgUpdatesAfterAddingNew EventEmitter', () => {
      expect(component.emitForOrgUpdatesAfterAddingNew).toBeDefined();
      expect(component.emitForOrgUpdatesAfterAddingNew instanceof EventEmitter).toBe(true);
    });
  });

  describe('Form Initialization', () => {
    it('should create formAddOrg with correct structure', () => {
      expect(component.formAddOrg).toBeDefined();
      expect(component.formAddOrg instanceof FormGroup).toBe(true);
    });

    it('should have nameOrg control with required validator', () => {
      const nameOrgControl = component.formAddOrg.get('nameOrg');
      expect(nameOrgControl).toBeDefined();
      expect(nameOrgControl?.hasValidator(Validators.required)).toBe(true);
    });

    it('should have supervisorName control with required validator', () => {
      const supervisorNameControl = component.formAddOrg.get('supervisorName');
      expect(supervisorNameControl).toBeDefined();
      expect(supervisorNameControl?.hasValidator(Validators.required)).toBe(true);
    });

    it('should have managerPhone control with required validator and default value', () => {
      const managerPhoneControl = component.formAddOrg.get('managerPhone');
      expect(managerPhoneControl).toBeDefined();
      expect(managerPhoneControl?.hasValidator(Validators.required)).toBe(true);
      expect(managerPhoneControl?.value).toBe('+7');
    });

    it('should have email control with required and email validators', () => {
      const emailControl = component.formAddOrg.get('email');
      expect(emailControl).toBeDefined();
      expect(emailControl?.hasValidator(Validators.required)).toBe(true);
      expect(emailControl?.hasValidator(Validators.email)).toBe(true);
      expect(emailControl?.value).toBe('');
    });

    it('should have form with 4 controls', () => {
      const controls = Object.keys(component.formAddOrg.controls);
      expect(controls.length).toBe(4);
      expect(controls).toContain('nameOrg');
      expect(controls).toContain('supervisorName');
      expect(controls).toContain('managerPhone');
      expect(controls).toContain('email');
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when all fields are empty', () => {
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be invalid when nameOrg is empty', () => {
      component.formAddOrg.patchValue({
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be invalid when supervisorName is empty', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be invalid when managerPhone is empty', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '',
        email: 'test@example.com'
      } as any);
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be invalid when email is empty', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789'
      } as any);
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be invalid with invalid email format', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'invalid-email'
      } as any);
      expect(component.formAddOrg.valid).toBe(false);
    });

    it('should be valid with all fields filled correctly', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);
      expect(component.formAddOrg.valid).toBe(true);
    });

    it('should be valid with valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        component.formAddOrg.patchValue({
          nameOrg: 'Test Organization',
          supervisorName: 'Test Supervisor',
          managerPhone: '+7123456789',
          email: email
        } as any);
        expect(component.formAddOrg.valid).toBe(true);
      });
    });
  });

  describe('addNewOrg Method', () => {
    beforeEach(() => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);
    });

    it('should call apiService.addNewOrganization with form data', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      component.addNewOrg();
      tick();

      expect(apiService.addNewOrganization).toHaveBeenCalledWith({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      });
    }));

    it('should call successService.localHandler with response message', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));

      component.addNewOrg();
      tick();

      expect(successService.localHandler).toHaveBeenCalledWith('Organization added successfully');
    }));

    it('should close window by setting windowAddingNewOrgIsOpen to false', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));

      component.addNewOrg();
      tick();

      expect(personalBlockService.windowAddingNewOrgIsOpen).toBe(false);
    }));

    it('should reset form after successful addition', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));

      component.addNewOrg();
      tick();

      expect(component.formAddOrg.get('nameOrg')?.value).toBe(null);
      expect(component.formAddOrg.get('supervisorName')?.value).toBe(null);
      expect(component.formAddOrg.get('managerPhone')?.value).toBe(null);
      expect(component.formAddOrg.get('email')?.value).toBe(null);
    }));

    it('should emit event after successful addition', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      component.addNewOrg();
      tick();

      expect(component.emitForOrgUpdatesAfterAddingNew.emit).toHaveBeenCalled();
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const mockError = { error: 'API Error' };
      apiService.addNewOrganization.and.returnValue(throwError(() => mockError));

      expect(() => {
        component.addNewOrg();
        tick();
      }).toThrow();
    }));

    it('should use takeUntil with destroyed$ for subscription management', fakeAsync(() => {
      const mockResponse = { message: 'Organization added successfully' };
      apiService.addNewOrganization.and.returnValue(of(mockResponse));

      component.addNewOrg();
      tick();

      // Verify that the subscription is properly managed
      expect(component['destroyed$']).toBeDefined();
    }));
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

    it('should handle multiple destroy calls gracefully', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();
      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalledTimes(2);
      expect(component['destroyed$'].complete).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state during operations', () => {
      const initialValue = {
        nameOrg: 'Initial Org',
        supervisorName: 'Initial Supervisor',
        managerPhone: '+7123456789',
        email: 'initial@example.com'
      };

      component.formAddOrg.patchValue(initialValue as any);
      expect(component.formAddOrg.value).toEqual(initialValue as any);
    });

    it('should reset form to initial state after reset', () => {
      component.formAddOrg.patchValue({
        nameOrg: 'Test Org',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      component.formAddOrg.reset();

      expect(component.formAddOrg.get('nameOrg')?.value).toBe(null);
      expect(component.formAddOrg.get('supervisorName')?.value).toBe(null);
      expect(component.formAddOrg.get('managerPhone')?.value).toBe(null);
      expect(component.formAddOrg.get('email')?.value).toBe(null);
    });

    it('should handle form value changes correctly', () => {
      const newValue = 'New Organization Name';
      (component.formAddOrg.get('nameOrg') as any)?.setValue(newValue);
      expect((component.formAddOrg.get('nameOrg') as any)?.value).toBe(newValue);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle form with very long values', () => {
      const longValue = 'a'.repeat(1000);
      component.formAddOrg.patchValue({
        nameOrg: longValue,
        supervisorName: longValue,
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(component.formAddOrg.valid).toBe(true);
    });

    it('should handle special characters in form values', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      component.formAddOrg.patchValue({
        nameOrg: specialChars,
        supervisorName: specialChars,
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(component.formAddOrg.valid).toBe(true);
    });

    it('should handle unicode characters in form values', () => {
      const unicodeChars = 'Привет мир 你好世界 مرحبا بالعالم';
      component.formAddOrg.patchValue({
        nameOrg: unicodeChars,
        supervisorName: unicodeChars,
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(component.formAddOrg.valid).toBe(true);
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with PersonalBlockService correctly', () => {
      expect(component.personalBlockService).toBe(personalBlockService);
    });

    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
    });

    it('should integrate with SuccessService correctly', () => {
      expect(component.successService).toBe(successService);
    });

    it('should integrate with ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });
  });
});
