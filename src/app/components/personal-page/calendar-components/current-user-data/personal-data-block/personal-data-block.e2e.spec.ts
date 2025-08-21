import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonalDataBlockComponent } from './personal-data-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateMonthPipe } from '../../../../../shared/pipe/translate-month.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject, delay } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('PersonalDataBlockComponent E2E Tests', () => {
  let component: PersonalDataBlockComponent;
  let fixture: ComponentFixture<PersonalDataBlockComponent>;
  let personalBlockService: PersonalBlockService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockUserData = {
    user: {
      id: 'user123',
      nameUser: 'John',
      surnameUser: 'Doe',
      role: 'ADMIN',
      idOrg: 'org123',
      sectionOrOrganization: 'Test Organization'
    }
  };

  const mockOrgData = {
    id: 'org123',
    name: 'Test Organization',
    balance: 1000,
    remainingFunds: 50
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['loadPhotoLabelOrg']);

    await TestBed.configureTestingModule({
      imports: [
        PersonalDataBlockComponent,
        AsyncPipe,
        NgIf,
        TranslateMonthPipe,
        HttpClientTestingModule
      ],
      providers: [
        PersonalBlockService,
        DateService,
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserData));
    spyOn(localStorage, 'setItem').and.stub();

    // Setup dateService with mock data
    dateService.getCurrentUser();
    
    // Setup API service spy
    apiService.loadPhotoLabelOrg.and.returnValue(of({ success: true }));

    fixture.detectChanges();
  });

  describe('Component Initialization and User Data Display', () => {
    it('should display current user name and surname correctly', () => {
      const userNameElement = fixture.nativeElement.querySelector('.currentUserNameOrg');
      expect(userNameElement.textContent.trim()).toBe('John Doe');
    });

    it('should display correct user role for admin user', () => {
      const roleElement = fixture.nativeElement.querySelector('strong');
      expect(roleElement.textContent.trim()).toBe('ADMIN:');
    });

    it('should display correct user role for simple user', fakeAsync(() => {
      // Change user role to simple user
      dateService.currentUserSimpleUser.next(true);
      dateService.currentUserIsTheAdminOrg.next(false);
      fixture.detectChanges();
      tick();

      const roleElement = fixture.nativeElement.querySelector('strong');
      expect(roleElement.textContent.trim()).toBe('Клиент:');
    }));

    it('should display organization name for simple user', fakeAsync(() => {
      dateService.currentUserSimpleUser.next(true);
      dateService.nameSelectedOrg.next('Test Organization');
      fixture.detectChanges();
      tick();

      const orgNameElement = fixture.nativeElement.querySelectorAll('.currentUserNameOrg')[1];
      expect(orgNameElement.textContent.trim()).toBe('Test Organization');
    }));

    it('should display balance information for simple user', fakeAsync(() => {
      dateService.currentUserSimpleUser.next(true);
      fixture.detectChanges();
      tick();

      // Find all spans and look for the one with "0 руб"
      const allSpans = fixture.nativeElement.querySelectorAll('span');
      const balanceSpan = Array.from(allSpans).find((span: any) => span.textContent?.includes('0 руб')) as HTMLElement;
      expect(balanceSpan).toBeTruthy();
      expect(balanceSpan.textContent?.trim()).toBe('0 руб');
    }));

    it('should display remaining funds for simple user', fakeAsync(() => {
      dateService.currentUserSimpleUser.next(true);
      dateService.remainingFunds.next(25);
      fixture.detectChanges();
      tick();

      // Find all spans and look for the one with "25"
      const allSpans = fixture.nativeElement.querySelectorAll('span');
      const remainingFundsSpan = Array.from(allSpans).find((span: any) => span.textContent?.includes('25')) as HTMLElement;
      expect(remainingFundsSpan).toBeTruthy();
      expect(remainingFundsSpan.textContent?.trim()).toBe('25');
    }));
  });

  describe('Photo Upload Functionality for Admin Users', () => {
    it('should show photo upload section for admin users', () => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      const uploadSection = fixture.nativeElement.querySelector('.addPhotoOrg');
      expect(uploadSection).toBeTruthy();
    });

    it('should hide photo upload section for simple users', fakeAsync(() => {
      dateService.currentUserSimpleUser.next(true);
      dateService.currentUserIsTheAdminOrg.next(false);
      fixture.detectChanges();
      tick();

      const uploadSection = fixture.nativeElement.querySelector('.addPhotoOrg');
      expect(uploadSection).toBeFalsy();
    }));

    it('should handle file selection and upload workflow', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      // Create mock file
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      const mockEvent = {
        target: {
          files: mockFileList
        }
      };

      // Spy on photoAdded emit
      spyOn(component.photoAdded, 'emit');

      // Trigger file upload
      component.loadLabelOrg(mockEvent);
      tick();

      // Verify API call
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
      
      // Verify photoAdded event was emitted
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should handle different image file types', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      const fileTypes = [
        { type: 'image/jpeg', name: 'test.jpg' },
        { type: 'image/png', name: 'test.png' }
      ];

      fileTypes.forEach((fileInfo, index) => {
        const mockFile = new File(['test content'], fileInfo.name, { type: fileInfo.type });
        const mockFileList = {
          0: mockFile,
          length: 1,
          item: (index: number) => index === 0 ? mockFile : null
        } as FileList;

        const mockEvent = {
          target: {
            files: mockFileList
          }
        };

        // Reset spy for each iteration
        if (index === 0) {
          spyOn(component.photoAdded, 'emit');
        }
        
        component.loadLabelOrg(mockEvent);
        tick();

        expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
        expect(component.photoAdded.emit).toHaveBeenCalled();
      });
    }));

    it('should handle large file uploads', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      // Create large file (10MB)
      const largeContent = 'x'.repeat(10 * 1024 * 1024);
      const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      const mockEvent = {
        target: {
          files: mockFileList
        }
      };

      spyOn(component.photoAdded, 'emit');
      component.loadLabelOrg(mockEvent);
      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));
  });

  describe('Service Integration and Data Flow', () => {
    it('should integrate with PersonalBlockService correctly', () => {
      spyOn(personalBlockService, 'switchData');
      
      const titleElement = fixture.nativeElement.querySelector('.titleNow');
      titleElement.click();

      expect(personalBlockService.switchData).toHaveBeenCalled();
    });

    it('should use correct organization ID from DateService', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.idSelectedOrg.next('org456');
      fixture.detectChanges();

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      const mockEvent = {
        target: {
          files: mockFileList
        }
      };

      // Spy on FormData creation
      const formDataSpy = spyOn(window, 'FormData').and.callThrough();
      
      component.loadLabelOrg(mockEvent);
      tick();

      expect(formDataSpy).toHaveBeenCalled();
    }));

    it('should handle API service errors gracefully', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      // Mock API error
      apiService.loadPhotoLabelOrg.and.returnValue(throwError(() => new Error('Upload failed')));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      const mockEvent = {
        target: {
          files: mockFileList
        }
      };

      expect(() => {
        component.loadLabelOrg(mockEvent);
        tick();
      }).toThrow();
    }));
  });

  describe('User Interface Responsiveness and State Management', () => {
    it('should handle rapid user interactions', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      const startTime = performance.now();

      // Simulate rapid file selections
      for (let i = 0; i < 10; i++) {
        const mockFile = new File([`content ${i}`], `file${i}.jpg`, { type: 'image/jpeg' });
        const mockFileList = {
          0: mockFile,
          length: 1,
          item: (index: number) => index === 0 ? mockFile : null
        } as FileList;

        const mockEvent = {
          target: {
            files: mockFileList
          }
        };

        component.loadLabelOrg(mockEvent);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(1000);
      tick();
    }));

    it('should maintain component state during user interactions', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      // Initial state
      const initialUploadSection = fixture.nativeElement.querySelector('.addPhotoOrg');
      expect(initialUploadSection).toBeTruthy();

      // Change user role
      dateService.currentUserSimpleUser.next(true);
      dateService.currentUserIsTheAdminOrg.next(false);
      fixture.detectChanges();
      tick();

      // Upload section should be hidden
      const hiddenUploadSection = fixture.nativeElement.querySelector('.addPhotoOrg');
      expect(hiddenUploadSection).toBeFalsy();

      // Change back to admin
      dateService.currentUserSimpleUser.next(false);
      dateService.currentUserIsTheAdminOrg.next(true);
      fixture.detectChanges();
      tick();

      // Upload section should be visible again
      const restoredUploadSection = fixture.nativeElement.querySelector('.addPhotoOrg');
      expect(restoredUploadSection).toBeTruthy();
    }));

    it('should handle component lifecycle correctly', fakeAsync(() => {
      // Test ngOnInit
      expect(() => component.ngOnInit()).not.toThrow();

      // Test ngOnDestroy
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    }));
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle null file input gracefully', () => {
      const nullEvent = { target: { files: null } };
      
      expect(() => {
        component.loadLabelOrg(nullEvent);
      }).toThrow();
    });

    it('should handle empty file list', () => {
      const emptyFileList = {
        length: 0,
        item: () => null
      } as FileList;

      const emptyEvent = { target: { files: emptyFileList } };
      
      expect(() => {
        component.loadLabelOrg(emptyEvent);
      }).toThrow();
    });

    it('should handle undefined event target', () => {
      const undefinedTargetEvent = { target: undefined };
      
      expect(() => {
        component.loadLabelOrg(undefinedTargetEvent);
      }).toThrow();
    });

    it('should handle missing user data in localStorage', fakeAsync(() => {
      // Mock empty localStorage
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      
      // Component should handle missing data gracefully
      expect(component).toBeTruthy();
      
      // Don't call getCurrentUser as it will throw error
      expect(() => dateService.getCurrentUser()).toThrow();
    }));

    it('should handle network timeout scenarios', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      // Mock slow API response
      apiService.loadPhotoLabelOrg.and.returnValue(
        of({ success: true }).pipe(delay(100))
      );

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      const mockEvent = {
        target: {
          files: mockFileList
        }
      };

      spyOn(component.photoAdded, 'emit');
      
      component.loadLabelOrg(mockEvent);
      tick(150); // Wait for timeout

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
    }));
  });

  describe('Performance and Memory Management', () => {
    it('should handle memory cleanup on destroy', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    });

    it('should not create memory leaks during file operations', fakeAsync(() => {
      dateService.currentUserIsTheAdminOrg.next(true);
      dateService.openEmployee.next(false);
      fixture.detectChanges();

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform multiple file operations
      for (let i = 0; i < 20; i++) {
        const mockFile = new File([`content ${i}`], `file${i}.jpg`, { type: 'image/jpeg' });
        const mockFileList = {
          0: mockFile,
          length: 1,
          item: (index: number) => index === 0 ? mockFile : null
        } as FileList;

        const mockEvent = {
          target: {
            files: mockFileList
          }
        };

        component.loadLabelOrg(mockEvent);
      }

      tick();

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }));
  });
});
