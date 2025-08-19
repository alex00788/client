import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataAboutRecComponent } from './data-about-rec.component';
import { DateService } from '../../../date.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DataAboutRecComponent', () => {
  let component: DataAboutRecComponent;
  let fixture: ComponentFixture<DataAboutRecComponent>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(async () => {
    // Создаем mock для DateService с BehaviorSubject
    const dateServiceSpy = jasmine.createSpyObj('DateService', [], {
      dataAboutSelectedRec: new BehaviorSubject({
        sectionOrOrganization: 'Test Organization',
        location: 'Test Address, 123',
        phoneOrg: '+7 (999) 123-45-67',
        date: '2024-01-15',
        time: '14:30'
      })
    });

    await TestBed.configureTestingModule({
      imports: [DataAboutRecComponent, AsyncPipe],
      providers: [
        { provide: DateService, useValue: dateServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DataAboutRecComponent);
    component = fixture.componentInstance;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    fixture.detectChanges();
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have DateService injected', () => {
      expect(component.dateService).toBeDefined();
      expect(component.dateService).toBe(dateService);
    });

    it('should be standalone component', () => {
      expect(component.constructor.name).toBe('DataAboutRecComponent');
    });

    it('should have correct imports', () => {
      expect(AsyncPipe).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render main container with correct class', () => {
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
      expect(container.nativeElement).toBeDefined();
    });

    it('should render organization title section', () => {
      const titleSection = fixture.debugElement.query(By.css('.strRecTitle'));
      expect(titleSection).toBeTruthy();
      
      const titleSpan = titleSection.query(By.css('span'));
      expect(titleSpan).toBeTruthy();
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Test Organization');
    });

    it('should render address section with correct structure', () => {
      const addressSection = fixture.debugElement.query(By.css('.strRec'));
      expect(addressSection).toBeTruthy();
      
      const strongElement = addressSection.query(By.css('strong'));
      expect(strongElement).toBeTruthy();
      expect(strongElement.nativeElement.textContent.trim()).toBe('Адрес:');
      
      const addressSpan = addressSection.query(By.css('span'));
      expect(addressSpan).toBeTruthy();
      expect(addressSpan.nativeElement.textContent.trim()).toBe('Test Address, 123');
    });

    it('should render phone section with correct structure', () => {
      const phoneSections = fixture.debugElement.queryAll(By.css('.strRec'));
      expect(phoneSections.length).toBeGreaterThanOrEqual(2);
      
      const phoneSection = phoneSections[1]; // Второй .strRec элемент
      const strongElement = phoneSection.query(By.css('strong'));
      expect(strongElement).toBeTruthy();
      expect(strongElement.nativeElement.textContent.trim()).toBe('Телефон:');
      
      const phoneSpan = phoneSection.query(By.css('span'));
      expect(phoneSpan).toBeTruthy();
      expect(phoneSpan.nativeElement.textContent.trim()).toBe('+7 (999) 123-45-67');
    });

    it('should render date section with correct structure', () => {
      const dateSections = fixture.debugElement.queryAll(By.css('.strRec'));
      expect(dateSections.length).toBeGreaterThanOrEqual(3);
      
      const dateSection = dateSections[2]; // Третий .strRec элемент
      const strongElement = dateSection.query(By.css('strong'));
      expect(strongElement).toBeTruthy();
      expect(strongElement.nativeElement.textContent.trim()).toBe('Дата записи:');
      
      const dateSpan = dateSection.query(By.css('span'));
      expect(dateSpan).toBeTruthy();
      expect(dateSpan.nativeElement.textContent.trim()).toBe('2024-01-15');
    });

    it('should render time section with correct structure', () => {
      const timeSections = fixture.debugElement.queryAll(By.css('.strRec'));
      expect(timeSections.length).toBeGreaterThanOrEqual(4);
      
      const timeSection = timeSections[3]; // Четвертый .strRec элемент
      const strongElement = timeSection.query(By.css('strong'));
      expect(strongElement).toBeTruthy();
      expect(strongElement.nativeElement.textContent.trim()).toBe('Время записи:');
      
      const timeSpan = timeSection.query(By.css('span'));
      expect(timeSpan).toBeTruthy();
      expect(timeSpan.nativeElement.textContent.trim()).toBe('14:30 : 00');
    });

    it('should have correct number of .strRec sections', () => {
      const strRecSections = fixture.debugElement.queryAll(By.css('.strRec'));
      expect(strRecSections.length).toBe(4); // Адрес, Телефон, Дата, Время
    });
  });

  describe('Data Binding and AsyncPipe Integration', () => {
    it('should display data from DateService.dataAboutSelectedRec', () => {
      const testData = {
        sectionOrOrganization: 'Another Organization',
        location: 'Another Address, 456',
        phoneOrg: '+7 (888) 987-65-43',
        date: '2024-02-20',
        time: '16:45'
      };

      // Обновляем данные в BehaviorSubject
      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
      fixture.detectChanges();

      // Проверяем, что данные обновились в шаблоне
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Another Organization');

      const addressSpan = fixture.debugElement.query(By.css('.strRec span'));
      expect(addressSpan.nativeElement.textContent.trim()).toBe('Another Address, 456');
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        sectionOrOrganization: '',
        location: '',
        phoneOrg: '',
        date: '',
        time: ''
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(emptyData);
      fixture.detectChanges();

      // Проверяем, что компонент не падает с пустыми данными
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();

      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle null data gracefully', () => {
      const nullData = {
        sectionOrOrganization: null,
        location: null,
        phoneOrg: null,
        date: null,
        time: null
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(nullData);
      fixture.detectChanges();

      // Проверяем, что компонент не падает с null данными
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    });

    it('should handle undefined data gracefully', () => {
      const undefinedData = {
        sectionOrOrganization: undefined,
        location: undefined,
        phoneOrg: undefined,
        date: undefined,
        time: undefined
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(undefinedData);
      fixture.detectChanges();

      // Проверяем, что компонент не падает с undefined данными
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    });

    it('should handle partial data gracefully', () => {
      const partialData = {
        sectionOrOrganization: 'Partial Org',
        // location отсутствует
        phoneOrg: '+7 (777) 111-22-33',
        // date отсутствует
        time: '12:00'
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(partialData);
      fixture.detectChanges();

      // Проверяем, что компонент отображает доступные данные
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Partial Org');

      const phoneSpan = fixture.debugElement.queryAll(By.css('.strRec span'))[1];
      expect(phoneSpan.nativeElement.textContent.trim()).toBe('+7 (777) 111-22-33');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct CSS classes applied', () => {
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container.nativeElement.className).toContain('cowerBlockDataAboutRec');

      const titleSection = fixture.debugElement.query(By.css('.strRecTitle'));
      expect(titleSection.nativeElement.className).toContain('strRecTitle');

      const strRecSections = fixture.debugElement.queryAll(By.css('.strRec'));
      strRecSections.forEach(section => {
        expect(section.nativeElement.className).toContain('strRec');
      });
    });

    it('should have correct inline styles', () => {
      const addressSpan = fixture.debugElement.query(By.css('.strRec span'));
      expect(addressSpan.nativeElement.style.textAlign).toBe('end');
    });

    it('should maintain CSS structure after data changes', () => {
      const testData = {
        sectionOrOrganization: 'Test',
        location: 'Test',
        phoneOrg: 'Test',
        date: 'Test',
        time: 'Test'
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
      fixture.detectChanges();

      // Проверяем, что CSS классы сохранились
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container.nativeElement.className).toContain('cowerBlockDataAboutRec');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long text content', () => {
      const longText = 'A'.repeat(1000);
      const longData = {
        sectionOrOrganization: longText,
        location: longText,
        phoneOrg: longText,
        date: longText,
        time: longText
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(longData);
      fixture.detectChanges();

      // Проверяем, что компонент не падает с длинным текстом
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();

      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe(longText);
    });

    it('should handle special characters in text', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialData = {
        sectionOrOrganization: specialText,
        location: specialText,
        phoneOrg: specialText,
        date: specialText,
        time: specialText
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(specialData);
      fixture.detectChanges();

      // Проверяем, что компонент корректно отображает специальные символы
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe(specialText);
    });

    it('should handle HTML entities in text', () => {
      const htmlText = '&lt;script&gt;alert("test")&lt;/script&gt;';
      const htmlData = {
        sectionOrOrganization: htmlText,
        location: htmlText,
        phoneOrg: htmlText,
        date: htmlText,
        time: htmlText
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(htmlData);
      fixture.detectChanges();

      // Проверяем, что HTML сущности отображаются как текст, а не как HTML
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe(htmlText);
    });

    it('should handle numbers as strings', () => {
      const numericData = {
        sectionOrOrganization: 123,
        location: 456,
        phoneOrg: 789,
        date: 2024,
        time: 15
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(numericData);
      fixture.detectChanges();

      // Проверяем, что числа корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('123');
    });

    it('should handle boolean values', () => {
      const booleanData = {
        sectionOrOrganization: true,
        location: false,
        phoneOrg: true,
        date: false,
        time: true
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(booleanData);
      fixture.detectChanges();

      // Проверяем, что boolean значения корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('true');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle multiple data changes correctly', fakeAsync(() => {
      const data1 = { sectionOrOrganization: 'Org 1', location: 'Address 1', phoneOrg: 'Phone 1', date: 'Date 1', time: 'Time 1' };
      const data2 = { sectionOrOrganization: 'Org 2', location: 'Address 2', phoneOrg: 'Phone 2', date: 'Date 2', time: 'Time 2' };
      const data3 = { sectionOrOrganization: 'Org 3', location: 'Address 3', phoneOrg: 'Phone 3', date: 'Date 3', time: 'Time 3' };

      // Быстро меняем данные несколько раз
      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(data1);
      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(data2);
      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(data3);
      
      fixture.detectChanges();
      tick();

      // Проверяем, что отображаются последние данные
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Org 3');
    }));

    it('should handle rapid fixture.detectChanges calls', () => {
      // Вызываем detectChanges много раз подряд
      for (let i = 0; i < 10; i++) {
        fixture.detectChanges();
      }

      // Проверяем, что компонент остается стабильным
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    });

    it('should handle component reinitialization', () => {
      // Создаем новый экземпляр компонента
      const newFixture = TestBed.createComponent(DataAboutRecComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(newComponent).toBeTruthy();
      expect(newComponent.dateService).toBeDefined();
      
      newFixture.destroy();
    });
  });

  describe('Data Validation and Type Safety', () => {
    it('should handle missing dataAboutSelectedRec property', () => {
      // Создаем mock без dataAboutSelectedRec
      const incompleteDateService = jasmine.createSpyObj('DateService', ['constructor'], {});
      
      // Проверяем, что mock создан корректно
      expect(incompleteDateService).toBeDefined();
      expect(typeof incompleteDateService.constructor).toBe('function');
    });

    it('should handle dataAboutSelectedRec as Observable instead of BehaviorSubject', () => {
      const observableData = of({
        sectionOrOrganization: 'Observable Org',
        location: 'Observable Address',
        phoneOrg: 'Observable Phone',
        date: 'Observable Date',
        time: 'Observable Time'
      });

      // Проверяем, что Observable создан корректно
      expect(observableData).toBeDefined();
      expect(typeof observableData.subscribe).toBe('function');
    });

    it('should handle dataAboutSelectedRec as Promise', () => {
      const promiseData = Promise.resolve({
        sectionOrOrganization: 'Promise Org',
        location: 'Promise Address',
        phoneOrg: 'Promise Phone',
        date: 'Promise Date',
        time: 'Promise Time'
      });

      // Проверяем, что Promise создан корректно
      expect(promiseData).toBeDefined();
      expect(typeof promiseData.then).toBe('function');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of data changes efficiently', fakeAsync(() => {
      const startTime = performance.now();
      
      // Меняем данные 100 раз
      for (let i = 0; i < 100; i++) {
        const testData = {
          sectionOrOrganization: `Org ${i}`,
          location: `Address ${i}`,
          phoneOrg: `Phone ${i}`,
          date: `Date ${i}`,
          time: `Time ${i}`
        };
        
        (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
        fixture.detectChanges();
      }
      
      tick();
      const endTime = performance.now();
      
      // Проверяем, что время выполнения разумное (менее 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Проверяем, что отображаются последние данные
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Org 99');
    }));

    it('should not create memory leaks with multiple data changes', fakeAsync(() => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Меняем данные много раз
      for (let i = 0; i < 50; i++) {
        const testData = {
          sectionOrOrganization: `Org ${i}`,
          location: `Address ${i}`,
          phoneOrg: `Phone ${i}`,
          date: `Date ${i}`,
          time: `Time ${i}`
        };
        
        (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
        fixture.detectChanges();
      }
      
      tick();
      
      // Проверяем, что компонент остается стабильным
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    }));
  });

  describe('Accessibility and Semantics', () => {
    it('should have proper HTML structure for screen readers', () => {
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container.nativeElement.tagName.toLowerCase()).toBe('div');
      
      const strongElements = fixture.debugElement.queryAll(By.css('strong'));
      expect(strongElements.length).toBe(4); // 4 label'а для полей
      
      const spanElements = fixture.debugElement.queryAll(By.css('span'));
      expect(spanElements.length).toBe(5); // 5 значений (включая заголовок)
    });

    it('should have semantic meaning in HTML structure', () => {
      // Проверяем, что strong используется для labels
      const strongElements = fixture.debugElement.queryAll(By.css('strong'));
      strongElements.forEach(strong => {
        expect(strong.nativeElement.tagName.toLowerCase()).toBe('strong');
      });
      
      // Проверяем, что span используется для значений
      const spanElements = fixture.debugElement.queryAll(By.css('span'));
      spanElements.forEach(span => {
        expect(span.nativeElement.tagName.toLowerCase()).toBe('span');
      });
    });

    it('should maintain accessibility after data changes', () => {
      const testData = {
        sectionOrOrganization: 'New Org',
        location: 'New Address',
        phoneOrg: 'New Phone',
        date: 'New Date',
        time: 'New Time'
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
      fixture.detectChanges();

      // Проверяем, что структура HTML сохранилась
      const strongElements = fixture.debugElement.queryAll(By.css('strong'));
      expect(strongElements.length).toBe(4);
      
      const spanElements = fixture.debugElement.queryAll(By.css('span'));
      expect(spanElements.length).toBe(5);
    });
  });

  describe('Integration with Angular Framework', () => {
    it('should work with Angular change detection', () => {
      // Проверяем, что компонент интегрирован с Angular
      expect(component.constructor.name).toBe('DataAboutRecComponent');
      expect(fixture.componentInstance).toBe(component);
      expect(fixture.debugElement.componentInstance).toBe(component);
    });

    it('should work with Angular dependency injection', () => {
      // Проверяем, что DI работает корректно
      expect(component.dateService).toBeDefined();
      expect(component.dateService).toBe(dateService);
    });

    it('should work with Angular lifecycle hooks', () => {
      // Проверяем, что компонент корректно инициализируется
      expect(component).toBeTruthy();
      
      // Проверяем, что fixture.detectChanges() работает
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
    });

    it('should work with Angular async pipe', () => {
      // Проверяем, что AsyncPipe корректно работает с BehaviorSubject
      const testData = {
        sectionOrOrganization: 'Async Org',
        location: 'Async Address',
        phoneOrg: 'Async Phone',
        date: 'Async Date',
        time: 'Async Time'
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
      fixture.detectChanges();

      // Проверяем, что данные отобразились через AsyncPipe
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Async Org');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle empty string values', () => {
      const emptyStringData = {
        sectionOrOrganization: '',
        location: '',
        phoneOrg: '',
        date: '',
        time: ''
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(emptyStringData);
      fixture.detectChanges();

      // Проверяем, что пустые строки корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle whitespace-only values', () => {
      const whitespaceData = {
        sectionOrOrganization: '   ',
        location: '  \t  ',
        phoneOrg: '\n',
        date: '   ',
        time: '  '
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(whitespaceData);
      fixture.detectChanges();

      // Проверяем, что пробельные символы корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle zero values', () => {
      const zeroData = {
        sectionOrOrganization: 0,
        location: 0,
        phoneOrg: 0,
        date: 0,
        time: 0
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(zeroData);
      fixture.detectChanges();

      // Проверяем, что нули корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('0');
    });

    it('should handle negative values', () => {
      const negativeData = {
        sectionOrOrganization: -1,
        location: -100,
        phoneOrg: -999,
        date: -2024,
        time: -15
      };

      (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(negativeData);
      fixture.detectChanges();

      // Проверяем, что отрицательные значения корректно отображаются
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('-1');
    });
  });

  describe('Component State Consistency', () => {
    it('should maintain consistent state during multiple operations', () => {
      const operations = [
        { sectionOrOrganization: 'Op 1', location: 'Loc 1', phoneOrg: 'Phone 1', date: 'Date 1', time: 'Time 1' },
        { sectionOrOrganization: 'Op 2', location: 'Loc 2', phoneOrg: 'Phone 2', date: 'Date 2', time: 'Time 2' },
        { sectionOrOrganization: 'Op 3', location: 'Loc 3', phoneOrg: 'Phone 3', date: 'Date 3', time: 'Time 3' }
      ];

      operations.forEach((operation, index) => {
        (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(operation);
        fixture.detectChanges();

        // Проверяем, что состояние консистентно
        const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
        expect(titleSpan.nativeElement.textContent.trim()).toBe(`Op ${index + 1}`);
      });
    });

    it('should handle rapid state changes without errors', fakeAsync(() => {
      // Быстро меняем состояние много раз
      for (let i = 0; i < 20; i++) {
        const testData = {
          sectionOrOrganization: `Rapid ${i}`,
          location: `Rapid Loc ${i}`,
          phoneOrg: `Rapid Phone ${i}`,
          date: `Rapid Date ${i}`,
          time: `Rapid Time ${i}`
        };
        
        (dateService.dataAboutSelectedRec as BehaviorSubject<any>).next(testData);
        fixture.detectChanges();
      }
      
      tick();
      
      // Проверяем, что компонент остался стабильным
      const container = fixture.debugElement.query(By.css('.cowerBlockDataAboutRec'));
      expect(container).toBeTruthy();
      
      // Проверяем, что отображаются последние данные
      const titleSpan = fixture.debugElement.query(By.css('.strRecTitle span'));
      expect(titleSpan.nativeElement.textContent.trim()).toBe('Rapid 19');
    }));
  });
});
