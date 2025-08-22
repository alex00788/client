import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataCalendarNewComponent } from './data-calendar-new.component';
import { DataCalendarService } from './data-calendar.service';
import { DateService } from '../date.service';
import { RecordingService } from '../recording.service';
import { ApiService } from '../../../../shared/services/api.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WebSocketService } from '../../../../shared/services/web-socket.service';
import { ErrorResponseService } from '../../../../shared/services/error.response.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterClientListPipe } from '../../../../shared/pipe/filter-client-list.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import moment from 'moment';

describe('DataCalendarNewComponent Integration Tests', () => {
  let component: DataCalendarNewComponent;
  let fixture: ComponentFixture<DataCalendarNewComponent>;
  let dataCalendarService: DataCalendarService;
  let dateService: DateService;
  let recordingService: RecordingService;
  let apiService: ApiService;
  let modalService: ModalService;
  let webSocketService: WebSocketService;
  let errorResponseService: ErrorResponseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DataCalendarNewComponent,
        AsyncPipe,
        NgForOf,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        FilterClientListPipe,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DataCalendarService,
        DateService,
        RecordingService,
        ApiService,
        ModalService,
        WebSocketService,
        ErrorResponseService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataCalendarNewComponent);
    component = fixture.componentInstance;
    dataCalendarService = TestBed.inject(DataCalendarService);
    dateService = TestBed.inject(DateService);
    recordingService = TestBed.inject(RecordingService);
    apiService = TestBed.inject(ApiService);
    modalService = TestBed.inject(ModalService);
    webSocketService = TestBed.inject(WebSocketService);
    errorResponseService = TestBed.inject(ErrorResponseService);
  });

  describe('Full Component Lifecycle', () => {
    it('should initialize and render correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component).toBeTruthy();
      expect(component.dataOfWeek).toBeDefined();
      expect(component.currentDate).toBeDefined();
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
    it('should integrate with real DataCalendarService', () => {
      expect(dataCalendarService).toBeDefined();
      expect(dataCalendarService.getAllEntryAllUsersForTheMonth).toBeDefined();
    });

    it('should integrate with real DateService', () => {
      expect(dateService).toBeDefined();
      expect(dateService.date).toBeDefined();
    });

    it('should integrate with real RecordingService', () => {
      expect(recordingService).toBeDefined();
      expect(recordingService.showCurrentWeek).toBeDefined();
    });

    it('should integrate with real ApiService', () => {
      expect(apiService).toBeDefined();
      expect(apiService.addEntry).toBeDefined();
    });

    it('should integrate with real ModalService', () => {
      expect(modalService).toBeDefined();
      expect(modalService.open).toBeDefined();
    });

    it('should integrate with real WebSocketService', () => {
      expect(webSocketService).toBeDefined();
    });

    it('should integrate with real ErrorResponseService', () => {
      expect(errorResponseService).toBeDefined();
      expect(errorResponseService.localHandler).toBeDefined();
    });
  });

  describe('Real Calendar Data Integration', () => {
    it('should handle real calendar data flow', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Simulate data from service
      const mockData = [
        { date: '15.01.2024', time: '10:00', users: [{ nameUser: 'John' }] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(mockData);
      tick();

      expect(component.dataOfWeek).toBeDefined();
    }));

    it('should format month data correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const testDate = moment('2024-01-15');
      const monthData = component['formativeShowMonth'](testDate);
      
      expect(Array.isArray(monthData)).toBe(true);
      expect(monthData.length).toBeGreaterThan(0);
      expect(monthData.every(date => /^\d{2}\.\d{2}\.\d{4}$/.test(date))).toBe(true);
    }));

    it('should format week data correctly', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const testDate = moment('2024-01-15');
      const weekData = component['formativeShowWeek'](testDate);
      
      expect(Array.isArray(weekData)).toBe(true);
      expect(weekData.length).toBe(7);
      expect(weekData.every(date => /^\d{2}\.\d{2}\.\d{4}$/.test(date))).toBe(true);
    }));
  });

  describe('Real API Integration', () => {
    it('should call real ApiService.addEntry method', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';

      spyOn(apiService, 'addEntry').and.returnValue(of({ success: true }));
      spyOn(component, 'refreshData' as any);

      component.addEntry(user, time, date);
      tick();

      expect(apiService.addEntry).toHaveBeenCalled();
      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should call real ApiService.deleteEntry method', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const idRec = 'rec123';
      const userId = 'user123';
      const orgId = 'org123';

      spyOn(apiService, 'deleteEntry').and.returnValue(of({ success: true }));
      spyOn(component, 'refreshData' as any);

      component.deletePerson(idRec, userId, orgId);
      tick();

      expect(apiService.deleteEntry).toHaveBeenCalled();
      expect(component.refreshData).toHaveBeenCalled();
    }));

    it('should call real ApiService.getAllEntryInCurrentTimes method', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const dateAndTimeRec = { timeRec: '10:00', dateRec: '15.01.2024' };
      const mockEntries = [{ sectionOrOrganization: 'org1' }];

      spyOn(apiService, 'getAllEntryInCurrentTimes').and.returnValue(of(mockEntries));

      component.getAllEntryInCurrentTimes(dateAndTimeRec);
      tick();

      expect(apiService.getAllEntryInCurrentTimes).toHaveBeenCalledWith(dateAndTimeRec);
    }));

    it('should handle real API errors gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';

      spyOn(apiService, 'addEntry').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(component, 'refreshData' as any);

      expect(() => {
        component.addEntry(user, time, date);
        tick();
      }).toThrow();

      expect(component.refreshData).not.toHaveBeenCalled();
    }));
  });

  describe('Real User Interactions', () => {
    it('should handle real form submission flow', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const data = { date: '15.01.2024', time: '10:00' };
      const user = { id: '123', surnameUser: 'John', nameUser: 'Doe' };

      component.selectedPersonId = '123';
      dateService.allUsersSelectedOrg.next([user]);
      spyOn(component, 'addEntry' as any);
      spyOn(component, 'cancel' as any);

      component.submit(data);

      expect(component.addEntry).toHaveBeenCalledWith(user, '10:00', '15.01.2024');
      expect(component.cancel).toHaveBeenCalled();
    }));

    it('should handle real keyboard events', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const event = { code: 'Enter' };
      const value = 'John Doe';
      const data = { date: '15.01.2024', time: '10:00' };

      spyOn(component, 'submit' as any);

      component.savingByPressingEnter(event, value, data);

      expect(component.submit).toHaveBeenCalledWith(data);
    }));

    it('should handle real time slot opening', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const time = '10';
      const date = '15.01.2024';

      // Setup dataOfWeek to ensure DOM elements exist
      component.dataOfWeek = [
        {
          date: date,
          showThisDay: true,
          times: [{ time: time, tMin: '00', date: date, workStatus: 'open' }]
        }
      ];
      fixture.detectChanges();
      tick();

      spyOn(component, 'refreshData' as any);
      spyOn(component, 'checkingTheNumberOfRecorded' as any);

      component.currentHourTime(time, date);
      tick(200);

      expect(component.refreshData).toHaveBeenCalled();
      expect(component.checkingTheNumberOfRecorded).toHaveBeenCalledWith(date, '10');
      expect(component.newEntryHasBeenOpenedTime).toBe('10');
      expect(component.newEntryHasBeenOpenedDate).toBe(date);
    }));
  });

  describe('Real Data Flow Integration', () => {
    it('should maintain data integrity across operations', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Simulate data flow
      const mockData = [
        { date: '15.01.2024', time: '10:00', users: [{ nameUser: 'John' }] }
      ];
      
      dataCalendarService.allEntryAllUsersInMonth.next(mockData);
      tick();

      expect(component.dataOfWeek).toBeDefined();
      expect(dataCalendarService.arrayOfDays).toBeDefined();
    }));

    it('should handle real calendar view changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Test week view
      recordingService.showCurrentWeek.next(true);
      tick();

      // Test day view
      recordingService.showCurrentDay.next(true);
      tick();

      // Test month view
      recordingService.showCurrentMonth.next(true);
      tick();

      expect(recordingService.showCurrentWeek.value).toBe(true);
      expect(recordingService.showCurrentDay.value).toBe(true);
      expect(recordingService.showCurrentMonth.value).toBe(true);
    }));
  });

  describe('Real Error Handling Integration', () => {
    it('should handle real service errors gracefully', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const errorMessage = 'Test error message';
      spyOn(errorResponseService, 'localHandler');

      // The localErrHandler method should handle errors gracefully, not throw
      component.localErrHandler(errorMessage);

      expect(errorResponseService.localHandler).toHaveBeenCalledWith(errorMessage);
    }));

    it('should continue working after service errors', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const user = { id: '123', recAllowed: false, surnameUser: 'John', nameUser: 'Doe', remainingFunds: 100, sectionOrOrganization: 'Org1', created: '2024-01-01' };
      const time = '10:00';
      const date = '15.01.2024';

      // First call fails
      spyOn(apiService, 'addEntry').and.returnValue(throwError(() => new Error('Service error')));

      expect(() => {
        component.addEntry(user, time, date);
        tick();
      }).toThrow();

      // Component should still be functional
      expect(component.dataOfWeek).toBeDefined();
      expect(component.currentDate).toBeDefined();
    }));
  });

  describe('Real Memory Management Integration', () => {
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
        fixture = TestBed.createComponent(DataCalendarNewComponent);
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

  describe('Real Performance Integration', () => {
    it('should handle high frequency operations efficiently', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const startTime = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const testDate = moment('2024-01-15');
        component['formativeShowMonth'](testDate);
        component['formativeShowWeek'](testDate);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    }));

    it('should maintain performance with large datasets', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const startTime = performance.now();

      // Test with large month data
      const largeDate = moment('2024-12-15');
      const monthData = component['formativeShowMonth'](largeDate);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // Should complete within 500ms
      expect(monthData.length).toBe(31); // December has 31 days
    }));
  });

  describe('Real World Scenarios', () => {
    it('should handle typical calendar workflow', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Simulate typical user workflow
      const testDate = moment('2024-01-15');
      const monthData = component['formativeShowMonth'](testDate);
      const weekData = component['formativeShowWeek'](testDate);

      expect(monthData.length).toBeGreaterThan(0);
      expect(weekData.length).toBe(7);
      expect(component.currentDate).toBeDefined();
    }));

    it('should handle edge case scenarios in real usage', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Test with edge case dates
      const edgeDate = moment('2024-02-29'); // Leap year February
      const monthData = component['formativeShowMonth'](edgeDate);

      expect(monthData.length).toBe(29); // February 2024 has 29 days
      expect(monthData.every(date => /^\d{2}\.\d{2}\.\d{4}$/.test(date))).toBe(true);
    }));
  });

  describe('Real UI Integration', () => {
    it('should work with real DOM events', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const mockEvent = { code: 'Enter' };
      const mockValue = 'John Doe';
      const mockData = { date: '15.01.2024', time: '10:00' };

      spyOn(component, 'submit' as any);

      component.savingByPressingEnter(mockEvent, mockValue, mockData);

      expect(component.submit).toHaveBeenCalledWith(mockData);
    }));

    it('should handle real form state changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Test form state management
      component.newEntryHasBeenOpenedTime = '10:00';
      component.newEntryHasBeenOpenedDate = '15.01.2024';

      expect(component.newEntryHasBeenOpenedTime).toBe('10:00');
      expect(component.newEntryHasBeenOpenedDate).toBe('15.01.2024');

      component.cancel();

      expect(component.newEntryHasBeenOpenedTime).toBe('');
      expect(component.newEntryHasBeenOpenedDate).toBe('');
    }));
  });

  describe('Real Service State Integration', () => {
    it('should react to real service state changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Test service state reactivity
      const newDate = moment('2024-02-15');
      dateService.date.next(newDate);
      tick();

      expect(dateService.date.value).toBe(newDate);
    }));

    it('should maintain service integration throughout lifecycle', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.dataCalendarService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.recordingService).toBeDefined();
      expect(component.apiService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.webSocketService).toBeDefined();
      expect(component['errorResponseService']).toBeDefined();

      component.ngOnDestroy();

      // Services should still be accessible
      expect(component.dataCalendarService).toBeDefined();
      expect(component.dateService).toBeDefined();
      expect(component.recordingService).toBeDefined();
      expect(component.apiService).toBeDefined();
      expect(component.modalService).toBeDefined();
      expect(component.webSocketService).toBeDefined();
      expect(component['errorResponseService']).toBeDefined();
    }));
  });
});
