import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonalPageComponent } from './personal-page.component';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { DateService } from './calendar-components/date.service';
import { SuccessService } from '../../shared/services/success.service';
import { ModalService } from '../../shared/services/modal.service';
import { RecordingService } from './calendar-components/recording.service';
import { DataCalendarService } from './calendar-components/data-calendar-new/data-calendar.service';
import { WebSocketService } from '../../shared/services/web-socket.service';
import { PersonalBlockService } from './calendar-components/personal-block.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import moment from 'moment';

describe('PersonalPageComponent Integration Tests', () => {
  let component: PersonalPageComponent;
  let fixture: ComponentFixture<PersonalPageComponent>;
  let router: Router;
  let apiService: ApiService;
  let dateService: DateService;
  let successService: SuccessService;
  let modalService: ModalService;
  let recordingService: RecordingService;
  let dataCalendarService: DataCalendarService;
  let webSocketService: WebSocketService;
  let personalBlockService: PersonalBlockService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PersonalPageComponent,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        ApiService,
        DateService,
        SuccessService,
        ModalService,
        RecordingService,
        DataCalendarService,
        WebSocketService,
        PersonalBlockService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalPageComponent);
    component = fixture.componentInstance;
    
    router = TestBed.inject(Router);
    apiService = TestBed.inject(ApiService);
    dateService = TestBed.inject(DateService);
    successService = TestBed.inject(SuccessService);
    modalService = TestBed.inject(ModalService);
    recordingService = TestBed.inject(RecordingService);
    dataCalendarService = TestBed.inject(DataCalendarService);
    webSocketService = TestBed.inject(WebSocketService);
    personalBlockService = TestBed.inject(PersonalBlockService);
    
    // Setup spies for real services
    spyOn(router, 'navigate');
    spyOn(apiService, 'clearTableRec').and.returnValue(of({ message: 'Database cleared successfully' }));
    spyOn(apiService, 'getAllOrgFromDb').and.returnValue(of({ allOrg: [{ id: '1', photoOrg: 'test.jpg' }] }));
    spyOn(apiService, 'deleteTestData').and.returnValue(of({ message: 'Test data deleted successfully' }));
    spyOn(apiService, 'logout');
    spyOn(dateService, 'getCurrentUser');
    spyOn(dateService, 'openCalendar');
    spyOn(dataCalendarService, 'getAllUsersCurrentOrganization');
    spyOn(dataCalendarService, 'checkingOrgHasEmployees').and.returnValue(true);
    spyOn(dataCalendarService, 'routerLinkMain');
    spyOn(recordingService, 'closeRecordsBlock');
    spyOn(successService, 'localHandler');
    spyOn(modalService, 'close');
    spyOn(personalBlockService, 'switchData');
    spyOn(personalBlockService, 'openClientList');
    spyOn(personalBlockService, 'openRecordsBlock');
    spyOn(personalBlockService, 'switchSettingsData');
    spyOn(personalBlockService, 'addNewOrgSettings');
    spyOn(personalBlockService, 'renameCurrentOrg');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // === ИНТЕГРАЦИОННЫЕ ТЕСТЫ С РЕАЛЬНЫМИ СЕРВИСАМИ ===
  
  it('should integrate with real DateService for user data', () => {
    expect(dateService.getCurrentUser).toHaveBeenCalled();
  });

  it('should integrate with real ApiService for organization data', () => {
    expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
  });

  it('should integrate with real DataCalendarService for user organization data', () => {
    expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
  });

  it('should integrate with real PersonalBlockService for UI state management', () => {
    personalBlockService.personalData = true;
    fixture.detectChanges();
    
    const personalDataBlock = fixture.debugElement.query(By.css('app-personal-data-block'));
    expect(personalDataBlock).toBeTruthy();
  });

  it('should integrate with real RecordingService for records display', () => {
    recordingService.recordsBlock.next(true);
    fixture.detectChanges();
    
    const recordsBlock = fixture.debugElement.query(By.css('app-records-block'));
    expect(recordsBlock).toBeTruthy();
  });

  // === ТЕСТЫ ПОЛНОГО ЖИЗНЕННОГО ЦИКЛА ===
  
  it('should handle complete user interaction flow', fakeAsync(() => {
    // 1. User opens settings
    component.openSettingsOrg();
    expect(component.settingsOrg).toBeTrue();
    
    // 2. User toggles delete data form
    component.deleteTestDataSwitch();
    expect(component.deleteData).toBeTrue();
    
    // 3. User fills and submits form
    component.formDeleteData.patchValue({ dataEmail: 'test@test.com' });
    component.removeTestData();
    tick();
    
    // 4. Verify all services were called
    expect(apiService.deleteTestData).toHaveBeenCalledWith('test@test.com');
    expect(successService.localHandler).toHaveBeenCalledWith('Test data deleted successfully');
    expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
    
    // 5. Form should be reset and hidden
    expect(component.formDeleteData.value.dataEmail).toBe('');
    expect(component.deleteData).toBeFalse();
  }));

  it('should handle complete calendar interaction flow', () => {
    // 1. User opens calendar
    component.switchCalendar();
    
    // 2. Verify services were called
    expect(dateService.openCalendar).toHaveBeenCalled();
    expect(recordingService.closeRecordsBlock).toHaveBeenCalled();
  });

  it('should handle complete logout flow', () => {
    // 1. User logs out
    component.logoutSystems();
    
    // 2. Verify all services were called
    expect(modalService.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(apiService.logout).toHaveBeenCalled();
  });

  it('should handle complete navigation flow', () => {
    // 1. User navigates to main
    component.routerLinkMain();
    
    // 2. Verify state was reset and services called
    expect(component.currentOrgHasEmployees).toBeFalse();
    expect(dateService.openEmployee.value).toBeFalse();
    expect(dataCalendarService.routerLinkMain).toHaveBeenCalledWith(true);
    expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ КОМПОНЕНТАМИ ===
  
  it('should display personal data block when PersonalBlockService allows', () => {
    personalBlockService.personalData = true;
    fixture.detectChanges();
    
    const personalDataBlock = fixture.debugElement.query(By.css('app-personal-data-block'));
    expect(personalDataBlock).toBeTruthy();
  });

  it('should display clients list when PersonalBlockService allows', () => {
    personalBlockService.clientListBlock = true;
    dateService.currentUserIsTheAdminOrg.next(true);
    fixture.detectChanges();
    
    const clientsList = fixture.debugElement.query(By.css('app-clients-list'));
    expect(clientsList).toBeTruthy();
  });

  it('should display records block when PersonalBlockService allows', () => {
    personalBlockService.recordsBlock = true;
    fixture.detectChanges();
    
    const recordsBlock = fixture.debugElement.query(By.css('app-records-block'));
    expect(recordsBlock).toBeTruthy();
  });

  it('should display settings block for admin users', () => {
    dateService.currentUserIsTheAdminOrg.next(true);
    fixture.detectChanges();
    
    const settingsBlock = fixture.debugElement.query(By.css('app-settings-block'));
    expect(settingsBlock).toBeTruthy();
  });

  it('should display calendar components when calendar is open', () => {
    dateService.calendarBodyOpen.next(true);
    fixture.detectChanges();
    
    const headerCalendar = fixture.debugElement.query(By.css('app-header-calendar'));
    const bodyCalendar = fixture.debugElement.query(By.css('app-body-calendar'));
    
    expect(headerCalendar).toBeTruthy();
    expect(bodyCalendar).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ ФОРМАМИ ===
  
  it('should integrate form validation with real ReactiveFormsModule', () => {
    component.deleteData = true;
    fixture.detectChanges();
    
    const emailControl = component.formDeleteData.get('dataEmail');
    
    // Test invalid email
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();
    
    // Test valid email
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTrue();
    
    // Test required validation
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalse();
  });

  it('should integrate form submission with real form controls', fakeAsync(() => {
    component.deleteData = true;
    component.formDeleteData.patchValue({ dataEmail: 'test@test.com' });
    fixture.detectChanges();
    
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalse();
    
    component.removeTestData();
    tick();
    
    expect(apiService.deleteTestData).toHaveBeenCalledWith('test@test.com');
    expect(component.formDeleteData.value.dataEmail).toBe('');
  }));

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ И СОСТОЯНИЕМ ===
  
  it('should integrate with real BehaviorSubject state management', fakeAsync(() => {
    // Test organization photo display
    dateService.allOrganization.next([{ id: '1', photoOrg: 'test.jpg' }]);
    dateService.idSelectedOrg.next('1');
    
    component.getPhotoForOrg();
    
    expect(component.hidePhotoCurrentOrg).toBeTrue();
    expect(component.photoCurrentOrg).toBe('test.jpg');
    
    // Test photo hiding
    dateService.idSelectedOrg.next('2');
    
    component.getPhotoForOrg();
    
    expect(component.hidePhotoCurrentOrg).toBeFalse();
    expect(component.photoCurrentOrg).toBe('');
  }));

  it('should integrate with real moment.js date handling', fakeAsync(() => {
    const mockMoment = moment('2024-01-01');
    spyOn(moment, 'now').and.returnValue(mockMoment.valueOf());
    
    component.clearTableRec();
    tick();
    
    expect(apiService.clearTableRec).toHaveBeenCalledWith({ threeMonthsAgo: '2023.11.01' });
    expect(dateService.youCanSendRequestToClearDatabase.value).toBeFalse();
  }));

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ ОШИБКАМИ ===
  
  it('should handle real API errors gracefully', fakeAsync(() => {
    const errorMessage = 'API Error';
    spyOn(apiService, 'deleteTestData').and.returnValue(throwError(() => new Error(errorMessage)));
    
    component.formDeleteData.patchValue({ dataEmail: 'test@test.com' });
    
    expect(() => {
      component.removeTestData();
      tick();
    }).not.toThrow();
  }));

  it('should handle real null API responses', fakeAsync(() => {
    spyOn(apiService, 'deleteTestData').and.returnValue(of(null));
    
    component.formDeleteData.patchValue({ dataEmail: 'test@test.com' });
    
    expect(() => {
      component.removeTestData();
      tick();
    }).not.toThrow();
  }));

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ ПОДПИСКАМИ ===
  
  it('should handle real subscription lifecycle with destroyed$', fakeAsync(() => {
    // Test subscription during component lifecycle
    dateService.allUsersSelectedOrg.next({ users: ['user1'] });
    tick();
    
    expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalled();
    
    // Test cleanup on destroy
    component.ngOnDestroy();
    
    // Verify no more calls after destroy
    dateService.allUsersSelectedOrg.next({ users: ['user2'] });
    tick();
    
    // Should not call again after destroy
    expect(dataCalendarService.checkingOrgHasEmployees).toHaveBeenCalledTimes(1);
  }));

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ КОМПОНЕНТАМИ ДОЧЕРНИХ ЭЛЕМЕНТОВ ===
  
  it('should integrate with real child components for organization selection', () => {
    const selectOrgComponent = fixture.debugElement.query(By.css('app-select-org-to-display'));
    expect(selectOrgComponent).toBeTruthy();
  });

  it('should integrate with real child components for error handling', () => {
    const errorModalComponent = fixture.debugElement.query(By.css('app-error-modal'));
    expect(errorModalComponent).toBeTruthy();
  });

  it('should integrate with real child components for success messages', () => {
    const successModalComponent = fixture.debugElement.query(By.css('app-success-modal'));
    expect(successModalComponent).toBeTruthy();
  });

  it('should integrate with real child components for organization direction', () => {
    component.currentOrgHasEmployees = true;
    fixture.detectChanges();
    
    const selectOrgDirectionComponent = fixture.debugElement.query(By.css('app-select-org-direction'));
    expect(selectOrgDirectionComponent).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ АДМИНИСТРАТОРОВ ===
  
  it('should show admin-only features for admin users', () => {
    dateService.currentUserIsTheAdminOrg.next(true);
    fixture.detectChanges();
    
    const clientsButton = fixture.debugElement.query(By.css('button:contains("Мои клиенты")'));
    expect(clientsButton).toBeTruthy();
  });

  it('should show main admin features for main admin users', () => {
    dateService.currentUserIsTheMainAdmin.next(true);
    fixture.detectChanges();
    
    const orgSettingsButton = fixture.debugElement.query(By.css('button:contains("ORG settings")'));
    expect(orgSettingsButton).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ КАЛЕНДАРЯ ===
  
  it('should integrate with real calendar services', () => {
    dateService.calendarBodyOpen.next(true);
    fixture.detectChanges();
    
    const calendarContainer = fixture.debugElement.query(By.css('.calendarNum'));
    expect(calendarContainer).toBeTruthy();
    
    const closeButton = fixture.debugElement.query(By.css('.btnCloseInfoBlock'));
    expect(closeButton).toBeTruthy();
  });

  it('should integrate with real recording services', () => {
    recordingService.recordsBlock.next(true);
    fixture.detectChanges();
    
    const dayWeekMonthComponent = fixture.debugElement.query(By.css('app-day-week-month'));
    expect(dayWeekMonthComponent).toBeTruthy();
    
    recordingService.showCurrentDay.next(true);
    fixture.detectChanges();
    
    const infoBlockComponent = fixture.debugElement.query(By.css('app-info-block'));
    expect(infoBlockComponent).toBeTruthy();
    
    recordingService.showCurrentWeek.next(true);
    fixture.detectChanges();
    
    const switchOfTheWeekComponent = fixture.debugElement.query(By.css('app-switch-of-the-week'));
    expect(switchOfTheWeekComponent).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ МОДАЛЬНЫМИ ОКНАМИ ===
  
  it('should integrate with real modal service for visibility', () => {
    modalService.isVisible = true;
    fixture.detectChanges();
    
    const modalWindow = fixture.debugElement.query(By.css('app-modal-window-for-person-page'));
    expect(modalWindow).toBeTruthy();
  });

  it('should integrate with real modal components for different states', () => {
    modalService.isVisible = true;
    fixture.detectChanges();
    
    // Test different modal states
    const dataPersonModal = fixture.debugElement.query(By.css('app-data-person-modal'));
    const modalRename = fixture.debugElement.query(By.css('app-modal-rename'));
    const dataAboutRec = fixture.debugElement.query(By.css('app-data-about-rec'));
    
    expect(dataPersonModal).toBeTruthy();
    expect(modalRename).toBeTruthy();
    expect(dataAboutRec).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ ДОБАВЛЕНИЯ ОРГАНИЗАЦИЙ ===
  
  it('should integrate with real organization management services', () => {
    dateService.currentUserIsTheMainAdmin.next(true);
    component.settingsOrg = true;
    fixture.detectChanges();
    
    const addNewOrgButton = fixture.debugElement.query(By.css('button:contains("Добавить ORG")'));
    expect(addNewOrgButton).toBeTruthy();
    
    const renameOrgButton = fixture.debugElement.query(By.css('button:contains("Переименовать ORG")'));
    expect(renameOrgButton).toBeTruthy();
    
    const forceCleanButton = fixture.debugElement.query(By.css('button:contains("Принудительная чистка БД")'));
    expect(forceCleanButton).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ УДАЛЕНИЯ ТЕСТОВЫХ ДАННЫХ ===
  
  it('should integrate with real test data deletion services', () => {
    dateService.currentUserIsTheMainAdmin.next(true);
    component.settingsOrg = true;
    fixture.detectChanges();
    
    const deleteTestDataButton = fixture.debugElement.query(By.css('button:contains("Удалить все связанное с email")'));
    expect(deleteTestDataButton).toBeTruthy();
    
    // Test form display
    component.deleteData = true;
    fixture.detectChanges();
    
    const deleteForm = fixture.debugElement.query(By.css('form.deleteTestData'));
    expect(deleteForm).toBeTruthy();
    
    const emailInput = fixture.debugElement.query(By.css('input[formControlName="dataEmail"]'));
    expect(emailInput).toBeTruthy();
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ НАВИГАЦИИ ===
  
  it('should integrate with real router service for navigation', () => {
    component.mainePage();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    
    component.logoutSystems();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // === ТЕСТЫ ИНТЕГРАЦИИ С РЕАЛЬНЫМИ СЕРВИСАМИ ДЛЯ СОСТОЯНИЯ ===
  
  it('should maintain real component state during complex interactions', () => {
    // Initial state
    expect(component.settingsOrg).toBeFalse();
    expect(component.deleteData).toBeFalse();
    expect(component.hideBtn).toBeTrue();
    
    // Open settings
    component.openSettingsOrg();
    expect(component.settingsOrg).toBeTrue();
    
    // Open delete data form
    component.deleteTestDataSwitch();
    expect(component.deleteData).toBeTrue();
    
    // Close settings
    component.openSettingsOrg();
    expect(component.settingsOrg).toBeFalse();
    
    // Close delete data form
    component.deleteTestDataSwitch();
    expect(component.deleteData).toBeFalse();
    
    // Verify final state
    expect(component.settingsOrg).toBeFalse();
    expect(component.deleteData).toBeFalse();
    expect(component.hideBtn).toBeTrue();
  });

  // === ФИНАЛЬНЫЕ ИНТЕГРАЦИОННЫЕ ПРОВЕРКИ ===
  
  it('should integrate all services correctly in complete workflow', fakeAsync(() => {
    // Complete workflow test
    // 1. Initialize component
    expect(component).toBeTruthy();
    
    // 2. Test organization loading
    expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
    
    // 3. Test user data loading
    expect(dateService.getCurrentUser).toHaveBeenCalled();
    
    // 4. Test calendar integration
    component.switchCalendar();
    expect(dateService.openCalendar).toHaveBeenCalled();
    expect(recordingService.closeRecordsBlock).toHaveBeenCalled();
    
    // 5. Test settings integration
    component.openSettingsOrg();
    expect(component.settingsOrg).toBeTrue();
    
    // 6. Test form integration
    component.deleteTestDataSwitch();
    component.formDeleteData.patchValue({ dataEmail: 'test@test.com' });
    component.removeTestData();
    tick();
    
    expect(apiService.deleteTestData).toHaveBeenCalledWith('test@test.com');
    expect(successService.localHandler).toHaveBeenCalledWith('Test data deleted successfully');
    
    // 7. Test logout integration
    component.logoutSystems();
    expect(modalService.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(apiService.logout).toHaveBeenCalled();
  }));

  it('should handle all real service interactions correctly', () => {
    // Test all service method calls
    expect(dateService.getCurrentUser).toHaveBeenCalled();
    expect(apiService.getAllOrgFromDb).toHaveBeenCalled();
    expect(dataCalendarService.getAllUsersCurrentOrganization).toHaveBeenCalled();
    
    // Test service state changes
    dateService.currentUserIsTheAdminOrg.next(true);
    dateService.currentUserIsTheMainAdmin.next(true);
    
    fixture.detectChanges();
    
    // Verify UI reflects service state
    const adminFeatures = fixture.debugElement.queryAll(By.css('button[class*="btnSettingsRecords"]'));
    expect(adminFeatures.length).toBeGreaterThan(0);
  });
});
