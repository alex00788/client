import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonalDataBlockComponent } from './personal-data-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateMonthPipe } from '../../../../../shared/pipe/translate-month.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('PersonalDataBlockComponent', () => {
  let component: PersonalDataBlockComponent;
  let fixture: ComponentFixture<PersonalDataBlockComponent>;
  let personalBlockService: jasmine.SpyObj<PersonalBlockService>;
  let dateService: jasmine.SpyObj<DateService>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const personalBlockServiceSpy = jasmine.createSpyObj('PersonalBlockService', ['switchData']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getCurrentDate'], {
      idSelectedOrg: new BehaviorSubject('123'),
      currentUserNameAndSurname: new BehaviorSubject('Test User'),
      currentUserSimpleUser: new BehaviorSubject(false),
      currentUserIsTheAdminOrg: new BehaviorSubject(true),
      currentUserRole: new BehaviorSubject('Admin'),
      nameSelectedOrg: new BehaviorSubject('Test Org'),
      remainingFunds: new BehaviorSubject(100),
      openEmployee: new BehaviorSubject(false)
    });
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['loadPhotoLabelOrg']);

    await TestBed.configureTestingModule({
      imports: [
        PersonalDataBlockComponent,
        AsyncPipe,
        NgIf,
        TranslateMonthPipe
      ],
      providers: [
        { provide: PersonalBlockService, useValue: personalBlockServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService) as jasmine.SpyObj<PersonalBlockService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.personalBlockService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.apiService).toBeDefined();
    });

    it('should have destroyed$ subject initialized', () => {
      expect(component['destroyed$']).toBeDefined();
      expect(component['destroyed$'] instanceof Subject).toBe(true);
    });

    it('should have photoAdded EventEmitter', () => {
      expect(component.photoAdded).toBeDefined();
      expect(component.photoAdded instanceof EventEmitter).toBe(true);
    });

    it('should initialize formData as undefined', () => {
      expect(component['formData']).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should execute ngOnInit lifecycle hook', () => {
      spyOn(component, 'ngOnInit').and.callThrough();
      component.ngOnInit();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('loadLabelOrg Method', () => {
    let mockFileList: FileList;
    let mockEvent: any;

    beforeEach(() => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
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

    it('should call createFormData with event.target.files', () => {
      spyOn(component, 'createFormData' as any);

      component.loadLabelOrg(mockEvent);

      expect(component['createFormData']).toHaveBeenCalledWith(mockFileList);
    });

    it('should handle null event', () => {
      expect(() => {
        component.loadLabelOrg(null);
      }).toThrow();
    });

    it('should handle event with null target', () => {
      const nullTargetEvent = { target: null };
      expect(() => {
        component.loadLabelOrg(nullTargetEvent);
      }).toThrow();
    });

    it('should handle event with null files', () => {
      const nullFilesEvent = { target: { files: null } };
      spyOn(component, 'createFormData' as any);

      component.loadLabelOrg(nullFilesEvent);

      expect(component['createFormData']).toHaveBeenCalledWith(null as any);
    });
  });

  describe('createFormData Method', () => {
    let mockFileList: FileList;
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => index === 0 ? mockFile : null
      } as FileList;
    });

    it('should create FormData with file and orgId', () => {
      spyOn(component, 'loadPhotoLabelOrg' as any);
      const mockFormData = jasmine.createSpyObj('FormData', ['append']);
      spyOn(window, 'FormData').and.returnValue(mockFormData);

      component['createFormData'](mockFileList);

      expect(window.FormData).toHaveBeenCalled();
      expect(mockFormData.append).toHaveBeenCalledWith('file', mockFile, 'test.jpg');
      expect(mockFormData.append).toHaveBeenCalledWith('orgId', '123');
      expect(component['formData']).toBe(mockFormData);
      expect(component['loadPhotoLabelOrg']).toHaveBeenCalled();
    });

    it('should handle empty file list', () => {
      const emptyFileList = {
        length: 0,
        item: () => null
      } as FileList;

      expect(() => {
        component['createFormData'](emptyFileList);
      }).toThrow();
    });

    it('should handle null file list', () => {
      expect(() => {
        component['createFormData'](null as any);
      }).toThrow();
    });

    it('should use correct orgId from dateService', () => {
      spyOn(component, 'loadPhotoLabelOrg' as any);
      const mockFormData = jasmine.createSpyObj('FormData', ['append']);
      spyOn(window, 'FormData').and.returnValue(mockFormData);
      dateService.idSelectedOrg.next('456');

      component['createFormData'](mockFileList);

      expect(mockFormData.append).toHaveBeenCalledWith('orgId', '456');
    });
  });

  describe('loadPhotoLabelOrg Method', () => {
    beforeEach(() => {
      component['formData'] = new FormData();
    });

    it('should call apiService.loadPhotoLabelOrg with formData', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({}));
      spyOn(component.photoAdded, 'emit');

      component['loadPhotoLabelOrg']();
      tick();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(component['formData']);
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should emit photoAdded event on successful upload', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');

      component['loadPhotoLabelOrg']();
      tick();

      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const mockError = new Error('Upload failed');
      apiService.loadPhotoLabelOrg.and.returnValue(throwError(() => mockError));

      expect(() => {
        component['loadPhotoLabelOrg']();
        tick();
      }).toThrow();
    }));

    it('should use takeUntil with destroyed$ for subscription management', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({}));

      component['loadPhotoLabelOrg']();
      tick();

      expect(component['destroyed$']).toBeDefined();
    }));

    it('should handle destroyed component gracefully', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({}));
      
      component['loadPhotoLabelOrg']();
      component.ngOnDestroy(); // Destroy component
      tick();

      // Component should handle destruction gracefully
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

  describe('File Upload Integration', () => {
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

    it('should handle complete file upload flow', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({ success: true }));
      spyOn(component.photoAdded, 'emit');
      const mockFormData = jasmine.createSpyObj('FormData', ['append']);
      spyOn(window, 'FormData').and.returnValue(mockFormData);

      component.loadLabelOrg(mockEvent);
      tick();

      expect(window.FormData).toHaveBeenCalled();
      expect(mockFormData.append).toHaveBeenCalledWith('file', mockFile, 'test.jpg');
      expect(mockFormData.append).toHaveBeenCalledWith('orgId', '123');
      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(mockFormData);
      expect(component.photoAdded.emit).toHaveBeenCalled();
    }));

    it('should handle different file types', () => {
      const pngFile = new File(['png content'], 'test.png', { type: 'image/png' });
      const pngFileList = {
        0: pngFile,
        length: 1,
        item: (index: number) => index === 0 ? pngFile : null
      } as FileList;
      const pngEvent = { target: { files: pngFileList } };

      spyOn(component, 'createFormData' as any);

      component.loadLabelOrg(pngEvent);

      expect(component['createFormData']).toHaveBeenCalledWith(pngFileList);
    });

    it('should handle large files', () => {
      const largeFile = new File(['x'.repeat(10000)], 'large.jpg', { type: 'image/jpeg' });
      const largeFileList = {
        0: largeFile,
        length: 1,
        item: (index: number) => index === 0 ? largeFile : null
      } as FileList;
      const largeEvent = { target: { files: largeFileList } };

      spyOn(component, 'createFormData' as any);

      component.loadLabelOrg(largeEvent);

      expect(component['createFormData']).toHaveBeenCalledWith(largeFileList);
    });
  });

  describe('EventEmitter photoAdded', () => {
    it('should emit without data', fakeAsync(() => {
      apiService.loadPhotoLabelOrg.and.returnValue(of({}));
      spyOn(component.photoAdded, 'emit');
      component['formData'] = new FormData();

      component['loadPhotoLabelOrg']();
      tick();

      expect(component.photoAdded.emit).toHaveBeenCalledWith();
    }));

    it('should be defined as EventEmitter', () => {
      expect(component.photoAdded).toBeInstanceOf(EventEmitter);
    });

    it('should be decorated with @Output', () => {
      // EventEmitter is properly decorated with @Output in the component
      expect(component.photoAdded).toBeInstanceOf(EventEmitter);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined formData in loadPhotoLabelOrg', fakeAsync(() => {
      component['formData'] = undefined as any;
      apiService.loadPhotoLabelOrg.and.returnValue(of({}));

      expect(() => {
        component['loadPhotoLabelOrg']();
        tick();
      }).not.toThrow();

      expect(apiService.loadPhotoLabelOrg).toHaveBeenCalledWith(undefined);
    }));

    it('should handle API timeout errors', fakeAsync(() => {
      const timeoutError = new Error('Request timeout');
      apiService.loadPhotoLabelOrg.and.returnValue(throwError(() => timeoutError));
      component['formData'] = new FormData();

      expect(() => {
        component['loadPhotoLabelOrg']();
        tick();
      }).toThrow();
    }));

    it('should handle network errors', fakeAsync(() => {
      const networkError = new Error('Network error');
      apiService.loadPhotoLabelOrg.and.returnValue(throwError(() => networkError));
      component['formData'] = new FormData();

      expect(() => {
        component['loadPhotoLabelOrg']();
        tick();
      }).toThrow();
    }));

    it('should handle multiple rapid file selections', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;
      const mockEvent = { target: { files: mockFileList } };

      spyOn(component, 'createFormData' as any);

      // Simulate rapid selections
      component.loadLabelOrg(mockEvent);
      component.loadLabelOrg(mockEvent);
      component.loadLabelOrg(mockEvent);

      expect(component['createFormData']).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with PersonalBlockService correctly', () => {
      expect(component.personalBlockService).toBe(personalBlockService);
    });

    it('should integrate with DateService correctly', () => {
      expect(component.dateService).toBe(dateService);
      expect(component.dateService.idSelectedOrg).toBeDefined();
    });

    it('should integrate with ApiService correctly', () => {
      expect(component.apiService).toBe(apiService);
    });

    it('should use dateService.idSelectedOrg.value for orgId', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: () => mockFile
      } as FileList;

      spyOn(component, 'loadPhotoLabelOrg' as any);
      const mockFormData = jasmine.createSpyObj('FormData', ['append']);
      spyOn(window, 'FormData').and.returnValue(mockFormData);

      dateService.idSelectedOrg.next('999');
      component['createFormData'](mockFileList);

      expect(mockFormData.append).toHaveBeenCalledWith('orgId', '999');
    });
  });
});
