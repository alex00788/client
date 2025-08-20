import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SettingsBlockComponent } from './settings-block.component';
import { PersonalBlockService } from '../../personal-block.service';
import { DateService } from '../../date.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { DataCalendarService } from '../../data-calendar-new/data-calendar.service';
import { SuccessService } from '../../../../../shared/services/success.service';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SettingsBlockComponent E2E Tests', () => {
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
    
    // Ensure allUsersSelectedOrg has a value for E2E tests
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

  describe('Component Initialization and Basic Functionality', () => {
    it('should initialize component correctly', () => {
      expect(component).toBeTruthy();
      expect(component.form).toBeDefined();
      expect(component.selDays).toBeDefined();
      expect(component.nameDays).toBeDefined();
      expect(component.dataAboutEmployee).toBe(mockDataAboutEmployee);
    });

    it('should have all required form controls', () => {
      const formControls = [
        'maxiPeople',
        'timeUntilBlock',
        'timeStartRec',
        'timeMinutesRec',
        'timeFinishRec',
        'location',
        'phoneOrg'
      ];

      formControls.forEach(controlName => {
        const control = component.form.get(controlName);
        expect(control).toBeDefined();
        expect(control?.enabled).toBeTrue();
      });
    });

    it('should initialize time arrays correctly', () => {
      expect(component.timesForRec).toBeDefined();
      expect(component.timesForRecMinutes).toBeDefined();
      expect(component.timesForRec.length).toBeGreaterThan(0);
      expect(component.timesForRecMinutes.length).toBeGreaterThan(0);
    });
  });

  describe('Day Selection Functionality', () => {
    it('should handle day selection workflow', () => {
      // Initialize selDays
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

    it('should handle multiple day selections efficiently', () => {
      const startTime = performance.now();

      // Perform many day selections
      for (let i = 0; i < 100; i++) {
        component.choiceDayRec('пн');
        component.choiceDayRec('вт');
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(500);
    });
  });

  describe('Form Validation and Input Handling', () => {
    it('should validate form correctly', () => {
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

      // Valid form should be valid
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

    it('should handle user entering invalid time values', () => {
      // User enters invalid start time
      const mockEvent = { target: { value: '25' } } as any;
      component.inputVal(mockEvent);
      expect(mockEvent.target.value).toBe(24);

      // User enters invalid end time
      const mockEvent2 = { target: { value: '26' } } as any;
      component.inputVal(mockEvent2);
      expect(mockEvent2.target.value).toBe(24);

      // User enters time with leading zero
      const mockEvent3 = { target: { value: '05' } } as any;
      component.inputVal(mockEvent3);
      expect(mockEvent3.target.value).toBe(12);

      // User enters very long number
      const mockEvent4 = { target: { value: '12345' } } as any;
      component.inputVal(mockEvent4);
      expect(mockEvent4.target.value).toBe(24);
    });

    it('should handle user clearing default values', () => {
      // User clears default location value
      const mockEvent = { target: { value: 'Задать в настройках' } } as any;
      component.clearDefVal(mockEvent);
      expect(mockEvent.target.value).toBe('');

      // User clears default phone value
      const mockEvent2 = { target: { value: 'Задать в настройках' } } as any;
      component.clearDefVal(mockEvent2);
      expect(mockEvent2.target.value).toBe('');

      // User doesn't clear other values
      const mockEvent3 = { target: { value: 'ул. Обычная, 1' } } as any;
      component.clearDefVal(mockEvent3);
      expect(mockEvent3.target.value).toBe('ул. Обычная, 1');
    });
  });

  describe('Form Value Changes and Performance', () => {
    it('should handle multiple form value changes efficiently', () => {
      const startTime = performance.now();

      // Perform many form value changes
      for (let i = 0; i < 50; i++) {
        component.form.patchValue({
          maxiPeople: (i + 1).toString(),
          timeStartRec: (i % 24).toString(),
          timeFinishRec: ((i % 24) + 8).toString()
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(200);
    });

    it('should maintain form state consistency', () => {
      const initialFormValue = { ...component.form.value };
      
      // Modify form
      component.form.patchValue({
        maxiPeople: '100',
        location: 'Test Location'
      });
      
      // Verify form was modified
      expect(component.form.value.maxiPeople).toBe('100');
      expect(component.form.value.location).toBe('Test Location');
      
      // Verify other values remain unchanged
      expect(component.form.value.timeStartRec).toBe(initialFormValue.timeStartRec);
      expect(component.form.value.timeFinishRec).toBe(initialFormValue.timeFinishRec);
    });
  });

  describe('User Input Validation Methods', () => {
    it('should handle user input validation methods', () => {
      // Test input validation for time fields
      const timeInputs = ['25', '26', '27', '28', '29'];
      timeInputs.forEach(input => {
        const mockEvent = { target: { value: input } } as any;
        component.inputVal(mockEvent);
        expect(mockEvent.target.value).toBe(24);
      });

      // Test input validation for length
      const longInputs = ['123', '1234', '12345'];
      longInputs.forEach(input => {
        const mockEvent = { target: { value: input } } as any;
        component.inputVal(mockEvent);
        expect(mockEvent.target.value).toBeLessThanOrEqual(24);
      });
    });
  });
});
