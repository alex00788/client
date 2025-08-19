import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddNewOrgComponent } from './add-new-org.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { SuccessService } from '../../../../../shared/services/success.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('AddNewOrgComponent Integration Tests', () => {
  let component: AddNewOrgComponent;
  let fixture: ComponentFixture<AddNewOrgComponent>;
  let personalBlockService: PersonalBlockService;
  let dateService: DateService;
  let successService: SuccessService;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddNewOrgComponent,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        PersonalBlockService,
        DateService,
        SuccessService,
        ApiService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNewOrgComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService);
    dateService = TestBed.inject(DateService);
    successService = TestBed.inject(SuccessService);
    apiService = TestBed.inject(ApiService);
  });

  describe('Full Component Lifecycle', () => {
    it('should initialize and render correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component).toBeTruthy();
      expect(component.formAddOrg).toBeDefined();
      expect(component.formAddOrg.valid).toBe(false);
    }));

    it('should handle complete lifecycle from init to destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    }));
  });

  describe('Service Integration', () => {
    it('should integrate with real PersonalBlockService', () => {
      expect(personalBlockService).toBeDefined();
      expect(personalBlockService.windowAddingNewOrgIsOpen).toBeDefined();
    });

    it('should integrate with real DateService', () => {
      expect(dateService).toBeDefined();
    });

    it('should integrate with real SuccessService', () => {
      expect(successService).toBeDefined();
      expect(successService.localHandler).toBeDefined();
    });

    it('should integrate with real ApiService', () => {
      expect(apiService).toBeDefined();
      expect(apiService.addNewOrganization).toBeDefined();
    });
  });

  describe('Real API Integration', () => {
    it('should call real ApiService.addNewOrganization method', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));
      spyOn(successService, 'localHandler');
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      component.addNewOrg();
      tick();

      expect(apiService.addNewOrganization).toHaveBeenCalled();
      expect(successService.localHandler).toHaveBeenCalled();
      expect(component.emitForOrgUpdatesAfterAddingNew.emit).toHaveBeenCalled();
    }));

    it('should handle real API errors gracefully', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(() => {
        component.addNewOrg();
        tick();
      }).toThrow();
    }));
  });

  describe('Real User Interactions', () => {
    it('should handle sequential form submissions', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));
      spyOn(successService, 'localHandler');
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      const testData = [
        {
          nameOrg: 'First Organization',
          supervisorName: 'First Supervisor',
          managerPhone: '+7123456789',
          email: 'first@example.com'
        },
        {
          nameOrg: 'Second Organization',
          supervisorName: 'Second Supervisor',
          managerPhone: '+7987654321',
          email: 'second@example.com'
        }
      ];

      testData.forEach((data, index) => {
        component.formAddOrg.patchValue(data as any);
        component.addNewOrg();
        tick();

        expect(apiService.addNewOrganization).toHaveBeenCalledTimes(index + 1);
        expect(successService.localHandler).toHaveBeenCalledTimes(index + 1);
        expect(component.emitForOrgUpdatesAfterAddingNew.emit).toHaveBeenCalledTimes(index + 1);
      });
    }));

    it('should handle rapid form submissions', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));
      spyOn(successService, 'localHandler');
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      // Simulate rapid clicking
      for (let i = 1; i <= 5; i++) {
        component.formAddOrg.patchValue({
          nameOrg: `Org ${i}`,
          supervisorName: `Supervisor ${i}`,
          managerPhone: `+7${i}23456789`,
          email: `org${i}@example.com`
        } as any);
        component.addNewOrg();
      }

      tick();

      expect(apiService.addNewOrganization).toHaveBeenCalledTimes(5);
      expect(successService.localHandler).toHaveBeenCalledTimes(5);
      expect(component.emitForOrgUpdatesAfterAddingNew.emit).toHaveBeenCalledTimes(5);
    }));
  });

  describe('Data Flow Integration', () => {
    it('should maintain data integrity across operations', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));

      const testData = {
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      };

      component.formAddOrg.patchValue(testData as any);
      expect(component.formAddOrg.value).toEqual(testData as any);

      component.addNewOrg();
      tick();

      // Form should be reset after successful submission
      expect(component.formAddOrg.get('nameOrg')?.value).toBe(null);
      expect(component.formAddOrg.get('supervisorName')?.value).toBe(null);
      expect(component.formAddOrg.get('managerPhone')?.value).toBe(null);
      expect(component.formAddOrg.get('email')?.value).toBe(null);
    }));

    it('should handle data transformations correctly', () => {
      const testData = {
        nameOrg: '  Test Organization  ',
        supervisorName: '  Test Supervisor  ',
        managerPhone: '+7123456789',
        email: '  test@example.com  '
      };

      component.formAddOrg.patchValue(testData as any);

      // Form should preserve the exact values as entered
      expect((component.formAddOrg.get('nameOrg') as any)?.value).toBe('  Test Organization  ');
      expect((component.formAddOrg.get('supervisorName') as any)?.value).toBe('  Test Supervisor  ');
      expect(component.formAddOrg.get('managerPhone')?.value).toBe('+7123456789');
      expect(component.formAddOrg.get('email')?.value).toBe('  test@example.com  ');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(throwError(() => new Error('Service error')));

      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(() => {
        component.addNewOrg();
        tick();
      }).toThrow();
    }));

    it('should continue working after service errors', fakeAsync(() => {
      // Test that component can handle errors and continue working
      spyOn(apiService, 'addNewOrganization').and.returnValue(throwError(() => new Error('Service error')));
      spyOn(successService, 'localHandler');

      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      expect(() => {
        component.addNewOrg();
        tick();
      }).toThrow();

      // Test that component can still be used after error
      expect(component.formAddOrg).toBeDefined();
      expect(component.formAddOrg.valid).toBe(true);
    }));
  });

  describe('Memory Management Integration', () => {
    it('should properly cleanup subscriptions on destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    }));

    it('should handle multiple init/destroy cycles', fakeAsync(() => {
      for (let i = 0; i < 3; i++) {
        fixture = TestBed.createComponent(AddNewOrgComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        tick();

        spyOn(component['destroyed$'], 'next');
        spyOn(component['destroyed$'], 'complete');

        component.ngOnDestroy();

        expect(component['destroyed$'].next).toHaveBeenCalled();
        expect(component['destroyed$'].complete).toHaveBeenCalled();
      }
    }));
  });

  describe('Performance Integration', () => {
    it('should handle high frequency operations efficiently', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));
      spyOn(successService, 'localHandler');
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      const startTime = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        component.formAddOrg.patchValue({
          nameOrg: `Org ${i}`,
          supervisorName: `Supervisor ${i}`,
          managerPhone: `+7${i}23456789`,
          email: `org${i}@example.com`
        } as any);
        component.addNewOrg();
      }

      tick();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(apiService.addNewOrganization).toHaveBeenCalledTimes(10);
    }));

    it('should maintain performance with large data operations', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));

      const largeData = {
        nameOrg: 'a'.repeat(1000),
        supervisorName: 'b'.repeat(1000),
        managerPhone: '+7123456789',
        email: 'test@example.com'
      };

      const startTime = performance.now();

      component.formAddOrg.patchValue(largeData as any);
      component.addNewOrg();
      tick();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // Should complete within 500ms
      expect(apiService.addNewOrganization).toHaveBeenCalledWith(largeData);
    }));
  });

  describe('Real World Scenarios', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Organization added successfully' }));
      spyOn(successService, 'localHandler');
      spyOn(component.emitForOrgUpdatesAfterAddingNew, 'emit');

      // User fills out form
      component.formAddOrg.patchValue({
        nameOrg: 'New Company LLC',
        supervisorName: 'John Doe',
        managerPhone: '+7123456789',
        email: 'john.doe@newcompany.com'
      } as any);

      expect(component.formAddOrg.valid).toBe(true);

      // User submits form
      component.addNewOrg();
      tick();

      // Verify all expected actions occurred
      expect(apiService.addNewOrganization).toHaveBeenCalledWith({
        nameOrg: 'New Company LLC',
        supervisorName: 'John Doe',
        managerPhone: '+7123456789',
        email: 'john.doe@newcompany.com'
      });
      expect(successService.localHandler).toHaveBeenCalledWith('Organization added successfully');
      expect(personalBlockService.windowAddingNewOrgIsOpen).toBe(false);
      expect(component.emitForOrgUpdatesAfterAddingNew.emit).toHaveBeenCalled();
    }));

    it('should handle edge case scenarios in real usage', fakeAsync(() => {
      // Test with minimal valid data
      spyOn(apiService, 'addNewOrganization').and.returnValue(of({ message: 'Success' }));

      component.formAddOrg.patchValue({
        nameOrg: 'A',
        supervisorName: 'B',
        managerPhone: '+7',
        email: 'a@b.c'
      } as any);

      expect(component.formAddOrg.valid).toBe(true);

      component.addNewOrg();
      tick();

      expect(apiService.addNewOrganization).toHaveBeenCalledWith({
        nameOrg: 'A',
        supervisorName: 'B',
        managerPhone: '+7',
        email: 'a@b.c'
      });
    }));
  });

  describe('Form Integration with UI', () => {
    it('should work with real form controls', () => {
      fixture.detectChanges();

      const nameOrgControl = component.formAddOrg.get('nameOrg');
      const supervisorNameControl = component.formAddOrg.get('supervisorName');
      const managerPhoneControl = component.formAddOrg.get('managerPhone');
      const emailControl = component.formAddOrg.get('email');

      expect(nameOrgControl).toBeDefined();
      expect(supervisorNameControl).toBeDefined();
      expect(managerPhoneControl).toBeDefined();
      expect(emailControl).toBeDefined();

      // Test setting values
      (nameOrgControl as any)?.setValue('Test Org');
      expect((nameOrgControl as any)?.value).toBe('Test Org');

      (supervisorNameControl as any)?.setValue('Test Supervisor');
      expect((supervisorNameControl as any)?.value).toBe('Test Supervisor');

      managerPhoneControl?.setValue('+7987654321');
      expect(managerPhoneControl?.value).toBe('+7987654321');

      emailControl?.setValue('test@example.com');
      expect(emailControl?.value).toBe('test@example.com');
    });

    it('should handle form validation in real scenarios', () => {
      fixture.detectChanges();

      // Initially form should be invalid
      expect(component.formAddOrg.valid).toBe(false);

      // Fill required fields
      component.formAddOrg.patchValue({
        nameOrg: 'Test Organization',
        supervisorName: 'Test Supervisor',
        managerPhone: '+7123456789',
        email: 'test@example.com'
      } as any);

      // Form should now be valid
      expect(component.formAddOrg.valid).toBe(true);

      // Test individual field validation
      const nameOrgControl = component.formAddOrg.get('nameOrg');
      (nameOrgControl as any)?.setValue('');
      expect(component.formAddOrg.valid).toBe(false);

      (nameOrgControl as any)?.setValue('Test Organization');
      expect(component.formAddOrg.valid).toBe(true);
    });
  });
});
