import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataAboutRecComponent } from './data-about-rec.component';
import { DateService } from '../../../date.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DataAboutRecComponent E2E Tests', () => {
  let component: DataAboutRecComponent;
  let fixture: ComponentFixture<DataAboutRecComponent>;
  let dateService: DateService;

  const mockRecordData = {
    sectionOrOrganization: 'Test Medical Center',
    location: 'ул. Примерная, 123, Москва',
    phoneOrg: '+7 (495) 123-45-67',
    date: '2024-01-15',
    time: '14:30'
  };

  const mockEmptyData = {
    sectionOrOrganization: '',
    location: '',
    phoneOrg: '',
    date: '',
    time: ''
  };

  const mockPartialData = {
    sectionOrOrganization: 'Partial Organization',
    location: 'Partial Address',
    phoneOrg: '+7 (999) 111-22-33',
    date: '',
    time: '09:00'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DataAboutRecComponent,
        AsyncPipe,
        HttpClientTestingModule
      ],
      providers: [
        DateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataAboutRecComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService);

    // Setup initial data
    dateService.dataAboutSelectedRec.next(mockRecordData);
    fixture.detectChanges();
  });

  describe('Component Initialization and Basic Rendering', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
      expect(component.dateService).toBeDefined();
    });

    it('should render main container with correct structure', () => {
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();
      expect(container.tagName.toLowerCase()).toBe('div');
    });

    it('should display organization title correctly', () => {
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent.trim()).toBe('Test Medical Center');
    });

    it('should have correct number of record sections', () => {
      const recordSections = fixture.nativeElement.querySelectorAll('.strRec');
      expect(recordSections.length).toBe(4); // Адрес, Телефон, Дата, Время
    });
  });

  describe('Record Information Display', () => {
    it('should display address information correctly', () => {
      const addressSection = fixture.nativeElement.querySelector('.strRec');
      expect(addressSection).toBeTruthy();

      const addressLabel = addressSection.querySelector('strong');
      expect(addressLabel.textContent.trim()).toBe('Адрес:');

      const addressValue = addressSection.querySelector('span');
      expect(addressValue.textContent.trim()).toBe('ул. Примерная, 123, Москва');
      expect(addressValue.style.textAlign).toBe('end');
    });

    it('should display phone information correctly', () => {
      const phoneSection = fixture.nativeElement.querySelectorAll('.strRec')[1];
      expect(phoneSection).toBeTruthy();

      const phoneLabel = phoneSection.querySelector('strong');
      expect(phoneLabel.textContent.trim()).toBe('Телефон:');

      const phoneValue = phoneSection.querySelector('span');
      expect(phoneValue.textContent.trim()).toBe('+7 (495) 123-45-67');
    });

    it('should display date information correctly', () => {
      const dateSection = fixture.nativeElement.querySelectorAll('.strRec')[2];
      expect(dateSection).toBeTruthy();

      const dateLabel = dateSection.querySelector('strong');
      expect(dateLabel.textContent.trim()).toBe('Дата записи:');

      const dateValue = dateSection.querySelector('span');
      expect(dateValue.textContent.trim()).toBe('2024-01-15');
    });

    it('should display time information correctly', () => {
      const timeSection = fixture.nativeElement.querySelectorAll('.strRec')[3];
      expect(timeSection).toBeTruthy();

      const timeLabel = timeSection.querySelector('strong');
      expect(timeLabel.textContent.trim()).toBe('Время записи:');

      const timeValue = timeSection.querySelector('span');
      expect(timeValue.textContent.trim()).toBe('14:30 : 00');
    });
  });

  describe('Dynamic Data Updates', () => {
    it('should update display when data changes', fakeAsync(() => {
      const newData = {
        sectionOrOrganization: 'New Medical Center',
        location: 'ул. Новая, 456, Санкт-Петербург',
        phoneOrg: '+7 (812) 987-65-43',
        date: '2024-02-20',
        time: '16:45'
      };

      dateService.dataAboutSelectedRec.next(newData);
      fixture.detectChanges();
      tick();

      // Check organization title
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('New Medical Center');

      // Check address
      const addressValue = fixture.nativeElement.querySelector('.strRec span');
      expect(addressValue.textContent.trim()).toBe('ул. Новая, 456, Санкт-Петербург');

      // Check phone
      const phoneValue = fixture.nativeElement.querySelectorAll('.strRec span')[1];
      expect(phoneValue.textContent.trim()).toBe('+7 (812) 987-65-43');

      // Check date
      const dateValue = fixture.nativeElement.querySelectorAll('.strRec span')[2];
      expect(dateValue.textContent.trim()).toBe('2024-02-20');

      // Check time
      const timeValue = fixture.nativeElement.querySelectorAll('.strRec span')[3];
      expect(timeValue.textContent.trim()).toBe('16:45 : 00');
    }));

    it('should handle multiple rapid data changes', fakeAsync(() => {
      const startTime = performance.now();

      // Perform multiple data changes
      for (let i = 0; i < 10; i++) {
        const testData = {
          sectionOrOrganization: `Organization ${i}`,
          location: `Address ${i}`,
          phoneOrg: `Phone ${i}`,
          date: `Date ${i}`,
          time: `Time ${i}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
      }

      tick();
      const endTime = performance.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);

      // Check final data
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Organization 9');
    }));

    it('should maintain component stability during data updates', fakeAsync(() => {
      // Verify initial state
      let titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Test Medical Center');

      // Update data multiple times
      for (let i = 0; i < 5; i++) {
        const testData = {
          sectionOrOrganization: `Stable Org ${i}`,
          location: `Stable Address ${i}`,
          phoneOrg: `Stable Phone ${i}`,
          date: `Stable Date ${i}`,
          time: `Stable Time ${i}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
        tick();

        // Verify component remains stable
        const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
        expect(container).toBeTruthy();

        titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
        expect(titleElement.textContent.trim()).toBe(`Stable Org ${i}`);
      }
    }));
  });

  describe('Data Edge Cases and Error Handling', () => {
    it('should handle empty data gracefully', fakeAsync(() => {
      dateService.dataAboutSelectedRec.next(mockEmptyData);
      fixture.detectChanges();
      tick();

      // Component should remain stable
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      // Empty values should be displayed
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('');

      const addressValue = fixture.nativeElement.querySelector('.strRec span');
      expect(addressValue.textContent.trim()).toBe('');
    }));

    it('should handle partial data gracefully', fakeAsync(() => {
      dateService.dataAboutSelectedRec.next(mockPartialData);
      fixture.detectChanges();
      tick();

      // Available data should be displayed
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Partial Organization');

      const addressValue = fixture.nativeElement.querySelector('.strRec span');
      expect(addressValue.textContent.trim()).toBe('Partial Address');

      const phoneValue = fixture.nativeElement.querySelectorAll('.strRec span')[1];
      expect(phoneValue.textContent.trim()).toBe('+7 (999) 111-22-33');

      // Missing data should show empty
      const dateValue = fixture.nativeElement.querySelectorAll('.strRec span')[2];
      expect(dateValue.textContent.trim()).toBe('');

      const timeValue = fixture.nativeElement.querySelectorAll('.strRec span')[3];
      expect(timeValue.textContent.trim()).toBe('09:00 : 00');
    }));

    it('should handle null and undefined values', fakeAsync(() => {
      const nullData = {
        sectionOrOrganization: null,
        location: undefined,
        phoneOrg: null,
        date: undefined,
        time: null
      };

      dateService.dataAboutSelectedRec.next(nullData);
      fixture.detectChanges();
      tick();

      // Component should remain stable
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      // Values should be displayed as empty or "null"
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('');
    }));

    it('should handle very long text content', fakeAsync(() => {
      const longText = 'A'.repeat(1000);
      const longData = {
        sectionOrOrganization: longText,
        location: longText,
        phoneOrg: longText,
        date: longText,
        time: longText
      };

      dateService.dataAboutSelectedRec.next(longData);
      fixture.detectChanges();
      tick();

      // Component should handle long text without crashing
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe(longText);
    }));

    it('should handle special characters and symbols', fakeAsync(() => {
      const specialData = {
        sectionOrOrganization: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        location: 'ул. Тестовая, 123, г. Москва',
        phoneOrg: '+7 (495) 123-45-67',
        date: '2024-01-15',
        time: '14:30'
      };

      dateService.dataAboutSelectedRec.next(specialData);
      fixture.detectChanges();
      tick();

      // Special characters should be displayed correctly
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('!@#$%^&*()_+-=[]{}|;:,.<>?');

      const addressValue = fixture.nativeElement.querySelector('.strRec span');
      expect(addressValue.textContent.trim()).toBe('ул. Тестовая, 123, г. Москва');
    }));

    it('should handle numeric values as strings', fakeAsync(() => {
      const numericData = {
        sectionOrOrganization: 123,
        location: 456,
        phoneOrg: 789,
        date: 2024,
        time: 15
      };

      dateService.dataAboutSelectedRec.next(numericData);
      fixture.detectChanges();
      tick();

      // Numeric values should be displayed as strings
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('123');

      const addressValue = fixture.nativeElement.querySelector('.strRec span');
      expect(addressValue.textContent.trim()).toBe('456');
    }));
  });

  describe('CSS Styling and Layout', () => {
    it('should maintain correct CSS classes after data changes', fakeAsync(() => {
      // Verify initial classes
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container.className).toContain('cowerBlockDataAboutRec');

      const titleSection = fixture.nativeElement.querySelector('.strRecTitle');
      expect(titleSection.className).toContain('strRecTitle');

      const recordSections = fixture.nativeElement.querySelectorAll('.strRec');
      recordSections.forEach((section: any) => {
        expect(section.className).toContain('strRec');
      });

      // Change data
      const newData = {
        sectionOrOrganization: 'New Org',
        location: 'New Address',
        phoneOrg: 'New Phone',
        date: 'New Date',
        time: 'New Time'
      };

      dateService.dataAboutSelectedRec.next(newData);
      fixture.detectChanges();
      tick();

      // Classes should remain unchanged
      expect(container.className).toContain('cowerBlockDataAboutRec');
      expect(titleSection.className).toContain('strRecTitle');
      
      recordSections.forEach((section: any) => {
        expect(section.className).toContain('strRec');
      });
    }));

    it('should maintain inline styles after data changes', fakeAsync(() => {
      // Verify initial inline styles
      const addressSpan = fixture.nativeElement.querySelector('.strRec span');
      expect(addressSpan.style.textAlign).toBe('end');

      // Change data
      const newData = {
        sectionOrOrganization: 'New Org',
        location: 'New Address',
        phoneOrg: 'New Phone',
        date: 'New Date',
        time: 'New Time'
      };

      dateService.dataAboutSelectedRec.next(newData);
      fixture.detectChanges();
      tick();

      // Inline styles should remain unchanged
      expect(addressSpan.style.textAlign).toBe('end');
    }));

    it('should have consistent layout structure', () => {
      // Verify HTML structure
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container.children.length).toBe(5); // 1 title + 4 record sections

      // Verify title section
      const titleSection = container.children[0];
      expect(titleSection.className).toContain('strRecTitle');
      expect(titleSection.children.length).toBe(1); // 1 span

      // Verify record sections
      const recordSections = container.querySelectorAll('.strRec');
      recordSections.forEach((section: any) => {
        expect(section.children.length).toBe(2); // 1 strong + 1 span
        expect(section.querySelector('strong')).toBeTruthy();
        expect(section.querySelector('span')).toBeTruthy();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle high-frequency data updates efficiently', fakeAsync(() => {
      const startTime = performance.now();

      // Perform many data updates
      for (let i = 0; i < 100; i++) {
        const testData = {
          sectionOrOrganization: `Perf Org ${i}`,
          location: `Perf Address ${i}`,
          phoneOrg: `Perf Phone ${i}`,
          date: `Perf Date ${i}`,
          time: `Perf Time ${i}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
      }

      tick();
      const endTime = performance.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);

      // Final state should be correct
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Perf Org 99');
    }));

    it('should not create memory leaks during intensive operations', fakeAsync(() => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform intensive operations
      for (let i = 0; i < 50; i++) {
        const testData = {
          sectionOrOrganization: `Memory Org ${i}`,
          location: `Memory Address ${i}`,
          phoneOrg: `Memory Phone ${i}`,
          date: `Memory Date ${i}`,
          time: `Memory Time ${i}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
      }

      tick();

      // Component should remain stable
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      // Memory usage should be reasonable
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }));

    it('should maintain responsiveness during data updates', fakeAsync(() => {
      const responsivenessTests = [];

      // Test responsiveness during updates
      for (let i = 0; i < 20; i++) {
        const updateStart = performance.now();
        
        const testData = {
          sectionOrOrganization: `Resp Org ${i}`,
          location: `Resp Address ${i}`,
          phoneOrg: `Resp Phone ${i}`,
          date: `Resp Date ${i}`,
          time: `Resp Time ${i}`
        };

        dateService.dataAboutSelectedRec.next(testData);
        fixture.detectChanges();
        
        const updateEnd = performance.now();
        responsivenessTests.push(updateEnd - updateStart);
      }

      tick();

      // Most updates should complete quickly
      const averageUpdateTime = responsivenessTests.reduce((a, b) => a + b, 0) / responsivenessTests.length;
      expect(averageUpdateTime).toBeLessThan(50); // Average update time should be less than 50ms

      // Component should remain functional
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Resp Org 19');
    }));
  });

  describe('Integration with DateService', () => {
    it('should properly integrate with DateService', () => {
      expect(component.dateService).toBe(dateService);
      expect(component.dateService.dataAboutSelectedRec).toBeDefined();
    });

    it('should react to DateService data changes', fakeAsync(() => {
      // Verify initial data
      let titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Test Medical Center');

      // Simulate external service update
      const externalData = {
        sectionOrOrganization: 'External Medical Center',
        location: 'External Address',
        phoneOrg: 'External Phone',
        date: 'External Date',
        time: 'External Time'
      };

      dateService.dataAboutSelectedRec.next(externalData);
      fixture.detectChanges();
      tick();

      // Component should reflect external changes
      const externalTitleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(externalTitleElement.textContent.trim()).toBe('External Medical Center');
    }));

    it('should handle DateService subscription lifecycle', fakeAsync(() => {
      // Verify subscription works
      const testData = {
        sectionOrOrganization: 'Subscription Test',
        location: 'Subscription Address',
        phoneOrg: 'Subscription Phone',
        date: 'Subscription Date',
        time: 'Subscription Time'
      };

      dateService.dataAboutSelectedRec.next(testData);
      fixture.detectChanges();
      tick();

      const subscriptionTestTitleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(subscriptionTestTitleElement.textContent.trim()).toBe('Subscription Test');

      // Verify subscription continues to work
      const anotherData = {
        sectionOrOrganization: 'Another Subscription Test',
        location: 'Another Address',
        phoneOrg: 'Another Phone',
        date: 'Another Date',
        time: 'Another Time'
      };

      dateService.dataAboutSelectedRec.next(anotherData);
      fixture.detectChanges();
      tick();

      const subscriptionTitleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(subscriptionTitleElement.textContent.trim()).toBe('Another Subscription Test');
    }));
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper semantic HTML structure', () => {
      // Verify proper HTML tags
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container.tagName.toLowerCase()).toBe('div');

      const strongElements = fixture.nativeElement.querySelectorAll('strong');
      expect(strongElements.length).toBe(4); // 4 labels

      const spanElements = fixture.nativeElement.querySelectorAll('span');
      expect(spanElements.length).toBe(5); // 5 values (including title)

      // Verify strong elements are used for labels
      strongElements.forEach((strong: any) => {
        expect(strong.tagName.toLowerCase()).toBe('strong');
      });

      // Verify span elements are used for values
      spanElements.forEach((span: any) => {
        expect(span.tagName.toLowerCase()).toBe('span');
      });
    });

    it('should maintain accessibility during data changes', fakeAsync(() => {
      // Verify initial accessibility
      let strongElements = fixture.nativeElement.querySelectorAll('strong');
      let spanElements = fixture.nativeElement.querySelectorAll('span');
      
      expect(strongElements.length).toBe(4);
      expect(spanElements.length).toBe(5);

      // Change data
      const newData = {
        sectionOrOrganization: 'Accessible Org',
        location: 'Accessible Address',
        phoneOrg: 'Accessible Phone',
        date: 'Accessible Date',
        time: 'Accessible Time'
      };

      dateService.dataAboutSelectedRec.next(newData);
      fixture.detectChanges();
      tick();

      // Accessibility structure should remain intact
      strongElements = fixture.nativeElement.querySelectorAll('strong');
      spanElements = fixture.nativeElement.querySelectorAll('span');
      
      expect(strongElements.length).toBe(4);
      expect(spanElements.length).toBe(5);
    }));

    it('should provide clear visual hierarchy', () => {
      // Verify visual hierarchy through CSS classes
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      const titleSection = fixture.nativeElement.querySelector('.strRecTitle');
      expect(titleSection).toBeTruthy();

      const recordSections = fixture.nativeElement.querySelectorAll('.strRec');
      expect(recordSections.length).toBe(4);

      // Each section should have consistent structure
      recordSections.forEach((section: any) => {
        const strong = section.querySelector('strong');
        const span = section.querySelector('span');
        
        expect(strong).toBeTruthy();
        expect(span).toBeTruthy();
      });
    });
  });

  describe('Component Lifecycle and Stability', () => {
    it('should handle component reinitialization', () => {
      // Create new component instance
      const newFixture = TestBed.createComponent(DataAboutRecComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(newComponent).toBeTruthy();
      expect(newComponent.dateService).toBeDefined();
      
      // Setup data for new component
      newComponent.dateService.dataAboutSelectedRec.next(mockRecordData);
      newFixture.detectChanges();
      
      // Verify new component works correctly
      const titleElement = newFixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Test Medical Center');
      
      newFixture.destroy();
    });

    it('should handle multiple fixture.detectChanges calls', () => {
      // Call detectChanges multiple times
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
      }

      // Component should remain stable
      const container = fixture.nativeElement.querySelector('.cowerBlockDataAboutRec');
      expect(container).toBeTruthy();

      // Data should still be displayed correctly
      const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
      expect(titleElement.textContent.trim()).toBe('Test Medical Center');
    });

    it('should maintain state consistency during operations', fakeAsync(() => {
      const operations = [
        { sectionOrOrganization: 'Op 1', location: 'Loc 1', phoneOrg: 'Phone 1', date: 'Date 1', time: 'Time 1' },
        { sectionOrOrganization: 'Op 2', location: 'Loc 2', phoneOrg: 'Phone 2', date: 'Date 2', time: 'Time 2' },
        { sectionOrOrganization: 'Op 3', location: 'Loc 3', phoneOrg: 'Phone 3', date: 'Date 3', time: 'Time 3' }
      ];

      operations.forEach((operation, index) => {
        dateService.dataAboutSelectedRec.next(operation);
        fixture.detectChanges();
        tick();

        // Verify state consistency
        const titleElement = fixture.nativeElement.querySelector('.strRecTitle span');
        expect(titleElement.textContent.trim()).toBe(`Op ${index + 1}`);

        const addressValue = fixture.nativeElement.querySelector('.strRec span');
        expect(addressValue.textContent.trim()).toBe(`Loc ${index + 1}`);
      });
    }));
  });
});
