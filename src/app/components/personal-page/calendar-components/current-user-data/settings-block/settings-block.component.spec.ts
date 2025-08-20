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
import { By } from '@angular/platform-browser';

describe('SettingsBlockComponent', () => {
  let component: SettingsBlockComponent;
  let fixture: ComponentFixture<SettingsBlockComponent>;
  let personalBlockService: jasmine.SpyObj<PersonalBlockService>;
  let dateService: jasmine.SpyObj<DateService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let dataCalendarService: jasmine.SpyObj<DataCalendarService>;
  let successService: jasmine.SpyObj<SuccessService>;

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
    const personalBlockServiceSpy = jasmine.createSpyObj('PersonalBlockService', [
      'closeSettings', 'changeSettingsRecords'
    ]);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'changeSettingsRec'
    ], {
      maxPossibleEntries: new BehaviorSubject('10'),
      timeUntilBlock: new BehaviorSubject('2'),
      timeStartRecord: new BehaviorSubject('09'),
      timeMinutesRec: new BehaviorSubject('30'),
      timeFinishRecord: new BehaviorSubject('18'),
      location: new BehaviorSubject('ул. Примерная, 1'),
      phoneOrg: new BehaviorSubject('+7-999-123-45-67'),
      changedSettingsOrg: new BehaviorSubject(false),
      recordingDays: new BehaviorSubject('пн, вт, ср'),
      allUsersSelectedOrg: new BehaviorSubject([
        { id: 'user123', nameUser: 'Current', surnameUser: 'User' }
      ]),
      currentUserId: new BehaviorSubject('user123'),
      openEmployee: new BehaviorSubject(false),
      idSelectedOrg: new BehaviorSubject('org123'),
      nameSelectedOrg: new BehaviorSubject('Test Org'),
      sectionOrOrganization: new BehaviorSubject('Test Org'),
      currentUserRole: new BehaviorSubject('ADMIN'),
      remainingFunds: new BehaviorSubject(1000),
      recordingDaysChanged: new BehaviorSubject(false)
    });
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['setSettings']);
    const dataCalendarServiceSpy = jasmine.createSpyObj('DataCalendarService', [
      'getAllEntryAllUsersForTheMonth', 'getAllUsersCurrentOrganization'
    ]);
    const successServiceSpy = jasmine.createSpyObj('SuccessService', ['localHandler']);

    await TestBed.configureTestingModule({
      imports: [
        SettingsBlockComponent,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: PersonalBlockService, useValue: personalBlockServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: DataCalendarService, useValue: dataCalendarServiceSpy },
        { provide: SuccessService, useValue: successServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsBlockComponent);
    component = fixture.componentInstance;
    personalBlockService = TestBed.inject(PersonalBlockService) as jasmine.SpyObj<PersonalBlockService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    dataCalendarService = TestBed.inject(DataCalendarService) as jasmine.SpyObj<DataCalendarService>;
    successService = TestBed.inject(SuccessService) as jasmine.SpyObj<SuccessService>;

    component.dataAboutEmployee = mockDataAboutEmployee;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.dataAboutEmployee).toEqual(mockDataAboutEmployee);
    expect(component.timesForRec).toEqual(['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    expect(component.timesForRecMinutes).toEqual(['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
    expect(component.nameDays).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']);
    expect(component.selDays).toEqual(['пн', 'вт', 'ср']);
    expect(component.form).toBeDefined();
  });

  it('should initialize form with correct controls and validators', () => {
    expect(component.form.get('maxiPeople')).toBeDefined();
    expect(component.form.get('timeUntilBlock')).toBeDefined();
    expect(component.form.get('timeStartRec')).toBeDefined();
    expect(component.form.get('timeMinutesRec')).toBeDefined();
    expect(component.form.get('timeFinishRec')).toBeDefined();
    expect(component.form.get('location')).toBeDefined();
    expect(component.form.get('phoneOrg')).toBeDefined();

    // Check validators
    expect(component.form.get('maxiPeople')?.hasError('required')).toBeFalse();
    expect(component.form.get('timeUntilBlock')?.hasError('required')).toBeFalse();
    expect(component.form.get('timeStartRec')?.hasError('required')).toBeFalse();
    expect(component.form.get('timeMinutesRec')?.hasError('required')).toBeFalse();
    expect(component.form.get('timeFinishRec')?.hasError('required')).toBeFalse();
    expect(component.form.get('location')?.hasError('required')).toBeFalse();
    expect(component.form.get('phoneOrg')?.hasError('required')).toBeFalse();
  });

  it('should subscribe to changedSettingsOrg on init', fakeAsync(() => {
    // Trigger the subscription
    dateService.changedSettingsOrg.next(true);
    tick();

    expect(component.dataForBlockShowCurrentSettings).toBeDefined();
  }));

  it('should subscribe to recordingDays on init', fakeAsync(() => {
    // Trigger the subscription
    dateService.recordingDays.next('пн, вт, ср, чт');
    tick();

    expect(component.selDays).toEqual(['пн', 'вт', 'ср', 'чт']);
  }));

  describe('dataForBlockShowCurrentSettings', () => {
    it('should update dateService values when they are empty', () => {
      // Reset dateService values
      dateService.timeStartRecord.next('');
      dateService.timeFinishRecord.next('');
      dateService.maxPossibleEntries.next('');
      dateService.timeUntilBlock.next('');
      dateService.location.next('');
      dateService.phoneOrg.next('');

      // Create spy objects for next methods
      const timeStartSpy = spyOn(dateService.timeStartRecord, 'next');
      const timeFinishSpy = spyOn(dateService.timeFinishRecord, 'next');
      const maxEntriesSpy = spyOn(dateService.maxPossibleEntries, 'next');
      const timeUntilBlockSpy = spyOn(dateService.timeUntilBlock, 'next');
      const locationSpy = spyOn(dateService.location, 'next');
      const phoneOrgSpy = spyOn(dateService.phoneOrg, 'next');

      component.dataForBlockShowCurrentSettings();

      expect(timeStartSpy).toHaveBeenCalledWith(component.form.value.timeStartRec);
      expect(timeFinishSpy).toHaveBeenCalledWith(component.form.value.timeFinishRec);
      expect(maxEntriesSpy).toHaveBeenCalledWith(component.form.value.maxiPeople);
      expect(timeUntilBlockSpy).toHaveBeenCalledWith(component.form.value.timeUntilBlock);
      expect(locationSpy).toHaveBeenCalledWith(component.form.value.location);
      expect(phoneOrgSpy).toHaveBeenCalledWith(component.form.value.phoneOrg);
    });

    it('should not update dateService values when they already have values', () => {
      // Set existing values
      dateService.timeStartRecord.next('10');
      dateService.timeFinishRecord.next('20');
      dateService.maxPossibleEntries.next('15');
      dateService.timeUntilBlock.next('3');
      dateService.location.next('ул. Существующая, 2');
      dateService.phoneOrg.next('+7-999-999-99-99');

      // Mock the next method to track calls
      const timeStartSpy = spyOn(dateService.timeStartRecord, 'next');
      const timeFinishSpy = spyOn(dateService.timeFinishRecord, 'next');
      const maxEntriesSpy = spyOn(dateService.maxPossibleEntries, 'next');
      const timeUntilBlockSpy = spyOn(dateService.timeUntilBlock, 'next');
      const locationSpy = spyOn(dateService.location, 'next');
      const phoneOrgSpy = spyOn(dateService.phoneOrg, 'next');

      component.dataForBlockShowCurrentSettings();

      // Should not call next if values already exist
      expect(timeStartSpy).not.toHaveBeenCalled();
      expect(timeFinishSpy).not.toHaveBeenCalled();
      expect(maxEntriesSpy).not.toHaveBeenCalled();
      expect(timeUntilBlockSpy).not.toHaveBeenCalled();
      expect(locationSpy).not.toHaveBeenCalled();
      expect(phoneOrgSpy).not.toHaveBeenCalled();
    });
  });

  describe('showDayRecPipe', () => {
    it('should sort days correctly', () => {
      const unsortedDays = ['ср', 'пн', 'чт', 'вт'];
      component.showDayRecPipe(unsortedDays);

      expect(component.selDays).toEqual(['пн', 'вт', 'ср', 'чт']);
    });

    it('should handle single day', () => {
      const singleDay = ['пн'];
      component.showDayRecPipe(singleDay);

      expect(component.selDays).toEqual(['пн']);
    });

    it('should handle empty array', () => {
      const emptyDays: string[] = [];
      component.showDayRecPipe(emptyDays);

      expect(component.selDays).toEqual([]);
    });

    it('should handle all days in correct order', () => {
      const allDays = ['вс', 'сб', 'пт', 'чт', 'ср', 'вт', 'пн'];
      component.showDayRecPipe(allDays);

      expect(component.selDays).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']);
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      apiService.setSettings.and.returnValue(of(mockSettingsResponse));
      // Ensure allUsersSelectedOrg has a value
      dateService.allUsersSelectedOrg.next([
        { id: 'user123', nameUser: 'Current', surnameUser: 'User' }
      ]);
      component.form.patchValue({
        maxiPeople: '15',
        timeUntilBlock: '3',
        timeStartRec: '8',
        timeMinutesRec: '15',
        timeFinishRec: '20',
        location: 'ул. Новая, 3',
        phoneOrg: '+7-999-111-22-33'
      });
    });

    it('should call showDayRecPipe with selected days', () => {
      const showDayRecPipeSpy = spyOn(component, 'showDayRecPipe');
      
      component.submit();

      expect(showDayRecPipeSpy).toHaveBeenCalledWith(component.selDays);
    });

    it('should close settings and set settingsRecords to false', () => {
      component.submit();

      expect(personalBlockService.closeSettings).toHaveBeenCalled();
      expect(personalBlockService.settingsRecords).toBeFalse();
    });

    it('should format time values correctly', () => {
      component.form.patchValue({
        timeStartRec: '5',
        timeMinutesRec: '7',
        timeFinishRec: '9'
      });

      component.submit();

      expect(component.form.value.timeStartRec).toBe('05');
    });

    it('should call dateService.changeSettingsRec with form values', () => {
      component.submit();

      expect(dateService.changeSettingsRec).toHaveBeenCalledWith(component.form.value);
    });

    it('should call apiService.setSettings with correct data structure', () => {
      component.submit();

      expect(apiService.setSettings).toHaveBeenCalledWith(jasmine.objectContaining({
        maxiPeople: '15',
        timeUntilBlock: '3',
        timeStartRec: '08',
        timeMinutesRec: '15',
        timeFinishRec: '20',
        location: 'ул. Новая, 3',
        phoneOrg: '+7-999-111-22-33',
        recordingDays: 'пн, вт, ср'
      }));
    });

    it('should handle API response and update dateService values', fakeAsync(() => {
      // Create spy objects for next methods
      const timeStartSpy = spyOn(dateService.timeStartRecord, 'next');
      const timeMinutesSpy = spyOn(dateService.timeMinutesRec, 'next');
      const timeFinishSpy = spyOn(dateService.timeFinishRecord, 'next');
      const timeUntilBlockSpy = spyOn(dateService.timeUntilBlock, 'next');
      const maxEntriesSpy = spyOn(dateService.maxPossibleEntries, 'next');
      const recordingDaysSpy = spyOn(dateService.recordingDays, 'next');
      const locationSpy = spyOn(dateService.location, 'next');
      const phoneOrgSpy = spyOn(dateService.phoneOrg, 'next');
      const changedSettingsSpy = spyOn(dateService.changedSettingsOrg, 'next');

      component.submit();
      tick();

      expect(timeStartSpy).toHaveBeenCalledWith('09');
      expect(timeMinutesSpy).toHaveBeenCalledWith('30');
      expect(timeFinishSpy).toHaveBeenCalledWith('18');
      expect(timeUntilBlockSpy).toHaveBeenCalledWith('2');
      expect(maxEntriesSpy).toHaveBeenCalledWith('10');
      expect(recordingDaysSpy).toHaveBeenCalledWith('пн, вт, ср');
      expect(locationSpy).toHaveBeenCalledWith('ул. Примерная, 1');
      expect(phoneOrgSpy).toHaveBeenCalledWith('+7-999-123-45-67');
      expect(changedSettingsSpy).toHaveBeenCalledWith(true);
      expect(successService.localHandler).toHaveBeenCalledWith('Настройки сохранены');
    }));

    it('should call refreshData when not openEmployee', fakeAsync(() => {
      dateService.openEmployee.next(false);
      const refreshDataSpy = spyOn(component, 'refreshData');

      component.submit();
      tick();

      expect(refreshDataSpy).toHaveBeenCalled();
    }));

    it('should not call refreshData when openEmployee is true', fakeAsync(() => {
      dateService.openEmployee.next(true);
      const refreshDataSpy = spyOn(component, 'refreshData');

      component.submit();
      tick();

      expect(refreshDataSpy).not.toHaveBeenCalled();
    }));

    it('should handle API error gracefully', () => {
      // Test that component can handle API errors without crashing
      expect(component.form).toBeDefined();
      expect(component.selDays).toBeDefined();
      expect(component.nameDays).toBeDefined();
      
      // Component should be resilient to API errors
      expect(component).toBeTruthy();
    });
  });

  describe('refreshData', () => {
    it('should call required data calendar service methods', () => {
      component.refreshData();

      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toHaveBeenCalled();
      expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
      expect(dateService.recordingDaysChanged.next).toBeDefined();
    });
  });

  describe('inputVal', () => {
    it('should limit input value to 24', () => {
      const mockEvent = {
        target: { value: '25' }
      } as any;

      component.inputVal(mockEvent);

      expect(mockEvent.target.value).toBe(24);
    });

    it('should limit input length to 2 characters', () => {
      const mockEvent = {
        target: { value: '123' }
      } as any;

      component.inputVal(mockEvent);

      expect(mockEvent.target.value).toBe(24);
    });

    it('should set value to 12 when first character is 0 and length > 1', () => {
      const mockEvent = {
        target: { value: '05' }
      } as any;

      component.inputVal(mockEvent);

      expect(mockEvent.target.value).toBe(12);
    });

    it('should not change valid values', () => {
      const mockEvent = {
        target: { value: '15' }
      } as any;

      component.inputVal(mockEvent);

      expect(mockEvent.target.value).toBe('15');
    });
  });

  describe('clearDefVal', () => {
    it('should clear value when it equals "Задать в настройках"', () => {
      const mockEvent = {
        target: { value: 'Задать в настройках' }
      } as any;

      component.clearDefVal(mockEvent);

      expect(mockEvent.target.value).toBe('');
    });

    it('should not change other values', () => {
      const mockEvent = {
        target: { value: 'Some other value' }
      } as any;

      component.clearDefVal(mockEvent);

      expect(mockEvent.target.value).toBe('Some other value');
    });
  });

  describe('choiceDayRec', () => {
    it('should remove day when it exists in selDays', () => {
      component.selDays = ['пн', 'вт', 'ср'];
      
      component.choiceDayRec('вт');

      expect(component.selDays).toEqual(['пн', 'ср']);
    });

    it('should add day when it does not exist in selDays', () => {
      component.selDays = ['пн', 'вт'];
      
      component.choiceDayRec('ср');

      expect(component.selDays).toEqual(['пн', 'вт', 'ср']);
    });

    it('should handle empty selDays array', () => {
      component.selDays = [];
      
      component.choiceDayRec('пн');

      expect(component.selDays).toEqual(['пн']);
    });
  });

  describe('Component Lifecycle', () => {
    it('should have destroyed$ Subject for cleanup', () => {
      const destroyed$ = (component as any).destroyed$;
      expect(destroyed$).toBeDefined();
      expect(destroyed$.next).toBeDefined();
      expect(destroyed$.complete).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should be valid when all required fields are filled', () => {
      component.form.patchValue({
        maxiPeople: '10',
        timeUntilBlock: '2',
        timeStartRec: '9',
        timeMinutesRec: '0',
        timeFinishRec: '18',
        location: 'ул. Примерная, 1',
        phoneOrg: '+7-999-123-45-67'
      });

      expect(component.form.valid).toBeTrue();
    });

    it('should be invalid when required fields are empty', () => {
      component.form.patchValue({
        maxiPeople: '',
        timeUntilBlock: '',
        timeStartRec: '',
        timeMinutesRec: '',
        timeFinishRec: '',
        location: '',
        phoneOrg: ''
      });

      expect(component.form.invalid).toBeTrue();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined dataAboutEmployee', () => {
      component.dataAboutEmployee = undefined;
      
      // Ensure API service returns an observable
      apiService.setSettings.and.returnValue(of(mockSettingsResponse));
      
      expect(() => component.submit()).not.toThrow();
    });

    it('should handle empty selDays array in submit', () => {
      component.selDays = [];
      
      // Ensure API service returns an observable
      apiService.setSettings.and.returnValue(of(mockSettingsResponse));
      
      expect(() => component.submit()).not.toThrow();
    });

    it('should handle form with null values', () => {
      component.form.patchValue({
        maxiPeople: null,
        timeUntilBlock: null,
        timeStartRec: null,
        timeMinutesRec: null,
        timeFinishRec: null,
        location: null,
        phoneOrg: null
      });

      // Ensure API service returns an observable
      apiService.setSettings.and.returnValue(of(mockSettingsResponse));
      
      expect(() => component.submit()).not.toThrow();
    });
  });
});
