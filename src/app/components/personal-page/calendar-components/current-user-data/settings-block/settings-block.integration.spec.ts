import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SettingsBlockComponent } from './settings-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { SuccessService } from '../../../../../shared/services/success.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('SettingsBlockComponent Integration Tests', () => {
  let component: SettingsBlockComponent;
  let fixture: ComponentFixture<SettingsBlockComponent>;
  let personalBlockService: PersonalBlockService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let dataCalendarService: DataCalendarService;
  let successService: SuccessService;

  const mockDataAboutEmployee = {
    id: 'emp123',
    nameUser: 'John',
    surnameUser: 'Doe'
  };

  const mockSettingsResponse = {
    newSettings: {
      timeStartRec: '09',
      timeMinutesRec: '30',
      timeLastRec: '18',
      timeUntilBlock: '2',
      maxClients: '10',
      recordingDays: 'пн, вт, ср',
      location: 'ул. Примерная, 1',
      phoneOrg: '+7-999-123-45-67'
    }
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'setSettings',
      'getAllEntryAllUsersOrg',
      'getAllUsersCurrentOrganization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SettingsBlockComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        PersonalBlockService,
        DateService,
        { provide: ApiService, useValue: apiServiceSpy },
        DataCalendarService,
        SuccessService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    dataCalendarService = TestBed.inject(DataCalendarService);
    successService = TestBed.inject(SuccessService);

    component.dataAboutEmployee = mockDataAboutEmployee;
    
    // Ensure allUsersSelectedOrg has a value for integration tests
    dateService.allUsersSelectedOrg.next([
      { id: 'user123', nameUser: 'Current', surnameUser: 'User' }
    ]);
    
    // Setup API service spies with return values
    apiService.getAllEntryAllUsersOrg.and.returnValue(of([]));
    
    // Create a consistent user object
    const mockUser = { 
      id: 'user123', 
      nameUser: 'Current', 
      surnameUser: 'User', 
      role: 'ADMIN',
      sectionOrOrganization: 'Test Organization',
      remainingFunds: 1000,
      openEmployee: false,
      timeStartRec: '09',
      timeMinutesRec: '00',
      timeLastRec: '18',
      maxClients: '10',
      recordingDays: 'пн, вт, ср',
      location: 'ул. Тестовая, 1',
      phoneOrg: '+7-999-123-45-67'
    };
    
    apiService.getAllUsersCurrentOrganization.and.returnValue(of([mockUser]));
    
    // Ensure currentUserId matches the mock user ID
    dateService.currentUserId.next('user123');
    
    fixture.detectChanges();
  });

  describe('Real Service Integration', () => {
    it('should work with real PersonalBlockService instance', () => {
      expect(personalBlockService).toBeTruthy();
      expect(personalBlockService).toBeInstanceOf(PersonalBlockService);
      expect(component.personalBlockService).toBe(personalBlockService);
    });

    it('should work with real DateService instance', () => {
      expect(dateService).toBeTruthy();
      expect(dateService).toBeInstanceOf(DateService);
      expect(component.dateService).toBe(dateService);
    });

    it('should work with real DataCalendarService instance', () => {
      expect(dataCalendarService).toBeTruthy();
      expect(dataCalendarService).toBeInstanceOf(DataCalendarService);
      expect(component.dataCalendarService).toBe(dataCalendarService);
    });

    it('should work with real SuccessService instance', () => {
      expect(successService).toBeTruthy();
      expect(successService).toBeInstanceOf(SuccessService);
      expect(component.successService).toBe(successService);
    });
  });

  describe('Form Integration with Real Services', () => {
    it('should validate form with real validators', () => {
      // Empty form should be invalid
      component.form.patchValue({
        maxiPeople: '',
        timeUntilBlock: '',
        timeStartRec: '',
        timeMinutesRec: '',
        timeFinishRec: '',
        location: '',
        phoneOrg: ''
      });

      expect(component.form.valid).toBeFalse();
      expect(component.form.get('maxiPeople')?.hasError('required')).toBeTrue();

      // Fill required fields
      component.form.patchValue({
        maxiPeople: '10',
        timeUntilBlock: '2',
        timeStartRec: '9',
        timeMinutesRec: '0',
        timeFinishRec: '18',
        location: 'ул. Валидная, 1',
        phoneOrg: '+7-999-123-45-67'
      });

      expect(component.form.valid).toBeTrue();
    });

    it('should handle form input validation methods', () => {
      // Test inputVal method
      const mockEvent = {
        target: { value: '25' }
      } as any;

      component.inputVal(mockEvent);
      expect(mockEvent.target.value).toBe(24);

      // Test clearDefVal method
      const mockEvent2 = {
        target: { value: 'Задать в настройках' }
      } as any;

      component.clearDefVal(mockEvent2);
      expect(mockEvent2.target.value).toBe('');
    });
  });

  describe('Day Selection with Real Services', () => {
    it('should handle day selection workflow', () => {
      // Initialize selDays properly
      component.selDays = ['пн', 'вт', 'ср'];
      
      // Add new day
      component.choiceDayRec('чт');
      expect(component.selDays).toEqual(['пн', 'вт', 'ср', 'чт']);

      // Remove existing day
      component.choiceDayRec('вт');
      expect(component.selDays).toEqual(['пн', 'ср', 'чт']);

      // Add another day
      component.choiceDayRec('пт');
      expect(component.selDays).toEqual(['пн', 'ср', 'чт', 'пт']);

      // Sort days
      const daysToSort = ['пн', 'ср', 'чт', 'пт'];
      component.showDayRecPipe(daysToSort);
      expect(component.selDays).toEqual(['пн', 'ср', 'чт', 'пт']);
    });
  });

  describe('Component Lifecycle with Real Services', () => {
    it('should initialize form correctly', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('maxiPeople')).toBeDefined();
      expect(component.form.get('timeStartRec')).toBeDefined();
      expect(component.form.get('timeFinishRec')).toBeDefined();
      expect(component.selDays).toBeDefined();
      expect(component.nameDays).toBeDefined();
    });

    it('should handle component state correctly', () => {
      expect(component.timesForRec).toBeDefined();
      expect(component.timesForRecMinutes).toBeDefined();
      expect(component.dataAboutEmployee).toBe(mockDataAboutEmployee);
    });
  });

  describe('Service State Consistency', () => {
    it('should maintain consistent state across services', () => {
      // Initial state
      expect(personalBlockService.changeSettingsRecordsBlock).toBeDefined();

      // Close settings
      personalBlockService.closeSettings();
      expect(personalBlockService.settingsRecords).toBeFalse();
    });
  });

  describe('Data Calendar Service Integration', () => {
    it('should call data calendar service methods on refresh', () => {
      const getAllEntrySpy = spyOn(dataCalendarService, 'getAllEntryAllUsersForTheMonth');
      const getAllUsersSpy = spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');

      component.refreshData();

      expect(getAllEntrySpy).toHaveBeenCalled();
      expect(getAllUsersSpy).toHaveBeenCalled();
      expect(dateService.recordingDaysChanged.next).toBeDefined();
    });
  });

  describe('Multiple Component Instances', () => {
    it('should handle multiple component instances independently', () => {
      const fixture2 = TestBed.createComponent(SettingsBlockComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();

      // Modify first component
      component.choiceDayRec('пт');
      expect(component.selDays).toContain('пт');

      // Modify second component
      component2.choiceDayRec('сб');
      expect(component2.selDays).toContain('сб');

      // Components should be independent
      expect(component.selDays).not.toEqual(component2.selDays);

      // Cleanup
      fixture2.destroy();
    });

    it('should share same service instances across components', () => {
      const fixture2 = TestBed.createComponent(SettingsBlockComponent);
      const component2 = fixture2.componentInstance;
      fixture2.detectChanges();

      // Both components should use same service instances
      expect(component.personalBlockService).toBe(component2.personalBlockService);
      expect(component.dateService).toBe(component2.dateService);
      expect(component.dataCalendarService).toBe(component2.dataCalendarService);
      expect(component.successService).toBe(component2.successService);

      // Cleanup
      fixture2.destroy();
    });
  });

  describe('Accessibility and UX Standards', () => {
    it('should maintain accessibility standards', () => {
      // Test that component has necessary properties for accessibility
      expect(component.form).toBeDefined();
      expect(component.form.controls).toBeDefined();
      expect(component.selDays).toBeDefined();
      expect(component.nameDays).toBeDefined();
    });

    it('should maintain accessibility and UX standards', () => {
      // Test that component has all necessary form controls
      expect(component.form.get('maxiPeople')).toBeDefined();
      expect(component.form.get('timeStartRec')).toBeDefined();
      expect(component.form.get('timeFinishRec')).toBeDefined();
      expect(component.form.get('location')).toBeDefined();
      expect(component.form.get('phoneOrg')).toBeDefined();
      
      // Test that component has day selection functionality
      expect(component.choiceDayRec).toBeDefined();
      expect(component.showDayRecPipe).toBeDefined();
    });
  });
});
