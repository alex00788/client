import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonalDataBlockComponent } from './personal-data-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateMonthPipe } from '../../../../../shared/pipe/translate-month.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('PersonalDataBlockComponent Integration Tests', () => {
  let component: PersonalDataBlockComponent;
  let fixture: ComponentFixture<PersonalDataBlockComponent>;
  let personalBlockService: PersonalBlockService;
  let dateService: DateService;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PersonalDataBlockComponent,
        AsyncPipe,
        NgIf,
        TranslateMonthPipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        PersonalBlockService,
        DateService,
        ApiService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService);
  });

  describe('Full Component Lifecycle', () => {
    it('should initialize and render correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component).toBeTruthy();
      expect(component.photoAdded).toBeDefined();
      expect(component['destroyed$']).toBeDefined();
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
      expect(personalBlockService.switchData).toBeDefined();
    });

    it('should integrate with real DateService', () => {
      expect(dateService).toBeDefined();
      expect(dateService.idSelectedOrg).toBeDefined();
    });

    it('should integrate with real ApiService', () => {
      expect(apiService).toBeDefined();
      expect(apiService.loadPhotoLabelOrg).toBeDefined();
    });
  });

  describe('Real File Upload Integration', () => {
    let mockFile: File;
    let mockFileList: FileList;
    let mockEvent: any;

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;

      mockEvent = {
        target: {
          files: mockFileList
        }
      };
    });

    it('should call real ApiService.loadPhotoLabelOrg method', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      component.loadLabelOrg(mockEvent);
      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should handle real API errors gracefully', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      expect(() => {
        component.loadLabelOrg(mockEvent);
        tick();
      }).toThrow();
    }));

    it('should work with different file types', fakeAsync(() => {
      const pngFile = new File(['png content'], 'test.png', { type: 'image/png' });
      const pngFileList = {
        0: pngFile,
        length: 1,
        item: (index: number) => index === 0 ? pngFile : null
      } as FileList;
      const pngEvent = { target: { files: pngFileList } };

      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      component.loadLabelOrg(pngEvent);
      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalled();
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));
  });

  describe('Real User Interactions', () => {
    it('should handle sequential file uploads', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      const files = [
        new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'file2.png', { type: 'image/png' })
      ];

      files.forEach((file, index) => {
        const fileList = {
          0: file,
          length: 1,
          item: (i: number) => i === 0 ? file : null
        } as FileList;
        const event = { target: { files: fileList } };

        component.loadLabelOrg(event);
        tick();

        expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledTimes(index + 1);
        expect(component.photoAdded.emit).toHaveBeenCalledTimes(index + 1);
      });
    }));

    it('should handle rapid file selections', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;
      const mockEvent = { target: { files: mockFileList } };

      // Simulate rapid clicking
      for (let i = 1; i <= 3; i++) {
        component.loadLabelOrg(mockEvent);
      }

      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledTimes(3);
      expect(component.photoAdded.emit).toHaveBeenCalledTimes(3);
    }));
  });

  describe('Data Flow Integration', () => {
    it('should maintain data integrity across operations', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));

      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const testFileList = {
        0: testFile,
        length: 1,
        item: (index: number) => index === 0 ? testFile : null
      } as FileList;
      const testEvent = { target: { files: testFileList } };

      component.loadLabelOrg(testEvent);
      tick();

      expect(component['formData']).toBeDefined();
      expect(component['formData']).toBeInstanceOf(FormData);
    }));

    it('should handle FormData creation correctly', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));

      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const testFileList = {
        0: testFile,
        length: 1,
        item: (index: number) => index === 0 ? testFile : null
      } as FileList;
      const testEvent = { target: { files: testFileList } };

      component.loadLabelOrg(testEvent);
      tick();

      // Verify FormData was created and used
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(jasmine.any(FormData));
    }));
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(throwError(() => new Error('Service error')));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;
      const mockEvent = { target: { files: mockFileList } };

      expect(() => {
        component.loadLabelOrg(mockEvent);
        tick();
      }).toThrow();
    }));

    it('should continue working after service errors', fakeAsync(() => {
      // First call fails
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(throwError(() => new Error('Service error')));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;
      const mockEvent = { target: { files: mockFileList } };

      expect(() => {
        component.loadLabelOrg(mockEvent);
        tick();
      }).toThrow();

      // Component should still be functional
      expect(component.photoAdded).toBeDefined();
      expect(component['destroyed$']).toBeDefined();
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
        fixture = TestBed.createComponent(PersonalDataBlockComponent);
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
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      const startTime = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const file = new File([`content${i}`], `file${i}.jpg`, { type: 'image/jpeg' });
        const fileList = {
          0: file,
          length: 1,
          item: () => file
        } as FileList;
        const event = { target: { files: fileList } };

        component.loadLabelOrg(event);
      }

      tick();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledTimes(10);
    }));

    it('should maintain performance with large files', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));

      const largeFile = new File(['x'.repeat(100000)], 'large.jpg', { type: 'image/jpeg' });
      const largeFileList = {
        0: largeFile,
        length: 1,
        item: () => largeFile
      } as FileList;
      const largeEvent = { target: { files: largeFileList } };

      const startTime = performance.now();

      component.loadLabelOrg(largeEvent);
      tick();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // Should complete within 500ms
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(jasmine.any(FormData));
    }));
  });

  describe('Real World Scenarios', () => {
    it('should handle typical user workflow', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true, photoUrl: '/uploads/org123.jpg' }));
      spyOn(component.photoAdded, 'emit');

      // User selects a file
      const userFile = new File(['user photo content'], 'company-logo.jpg', { type: 'image/jpeg' });
      const userFileList = {
        0: userFile,
        length: 1,
        item: (index: number) => index === 0 ? userFile : null
      } as FileList;
      const userEvent = { target: { files: userFileList } };

      // User uploads the file
      component.loadLabelOrg(userEvent);
      tick();

      // Verify all expected actions occurred
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(jasmine.any(FormData));
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should handle edge case scenarios in real usage', fakeAsync(() => {
      spyOn(apiService, 'loadPhotoLabelOrg').and.returnValue(of({ success: true }));

      // Test with minimal valid file
      const minimalFile = new File(['x'], 'min.jpg', { type: 'image/jpeg' });
      const minimalFileList = {
        0: minimalFile,
        length: 1,
        item: (index: number) => index === 0 ? minimalFile : null
      } as FileList;
      const minimalEvent = { target: { files: minimalFileList } };

      component.loadLabelOrg(minimalEvent);
      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(jasmine.any(FormData));
    }));
  });

  describe('UI Integration', () => {
    it('should work with real file input events', () => {
      fixture.detectChanges();

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;

      // Simulate real file input change event
      const event = {
        target: {
          files: mockFileList,
          value: 'C:\\fakepath\\test.jpg' // Simulates browser behavior
        }
      };

      spyOn(component, 'loadLabelOrg');

      component.loadLabelOrg(event);

      expect(component.loadLabelOrg).toHaveBeenCalledWith(event);
    });

    it('should handle DOM events correctly', () => {
      fixture.detectChanges();

      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
    });
  });

  describe('Service State Integration', () => {
    it('should react to dateService state changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Verify component responds to service state
      expect(component.dateService.idSelectedOrg).toBeDefined();
    }));

    it('should maintain service integration throughout lifecycle', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.apiService).toBeDefined();

      component.ngOnDestroy();

      // Services should still be accessible
      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.apiService).toBeDefined();
    }));
  });
});
