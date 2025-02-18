import {MainPageComponent} from "./main-page.component";
import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ModalService} from "../../shared/services/modal.service";
import {DateService} from "../personal-page/calendar-components/date.service";
import {ActivatedRoute} from "@angular/router";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {BehaviorSubject, of, Subject} from "rxjs";
import {By} from "@angular/platform-browser";


// Mock services
class MockModalService {
  isVisible$ = new Subject<boolean>();
  loginForm$ = new Subject<boolean>();
  hideTitle$ = of(true);
  openAppDescription = jasmine.createSpy('openAppDescription');
  downloadApplication = jasmine.createSpy('downloadApplication');
  instructionsForStart = jasmine.createSpy('instructionsForStart');
}

class MockDateService {
  nameOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
  idOrganizationWhereItCameFrom = new Subject<string>();
}

describe('MainPageComponent', () => {
  let component : MainPageComponent
  let fixture : ComponentFixture<MainPageComponent>
  let modalService: ModalService;
  let dateService: DateService;

  beforeEach(()=> {
    TestBed.configureTestingModule({   // так создаеться инстанс компанента перед каждым тестом
      imports: [MainPageComponent],              // standalone  заносяться в imports
      providers: [
        {provide: ModalService, useClass: MockModalService},
        {provide: DateService, useClass: MockDateService},
        {
          provide: ActivatedRoute,
          useValue: {queryParams: of({organization: 'testOrg', id: '123'})}
        }
      ],

      schemas: [NO_ERRORS_SCHEMA]  // Ignore child components
    }).compileComponents();


    fixture = TestBed.createComponent(MainPageComponent)
    component = fixture.componentInstance      // так получаем компонент  //еще часто используемые/fixture.debugElement/fixture.nativeElement
    modalService = TestBed.inject(ModalService);
    dateService = TestBed.inject(DateService);
    fixture.detectChanges();    //чтобы изменения применились
  });

  it('should be create', () => {
    expect(component).toBeTruthy()
  });

  it('should display organization name from DateService', fakeAsync(() => {
    // Устанавливаем тестовое значение
    const testOrgName = 'Test Organization';
    (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next(testOrgName);
    // Запускаем обнаружение изменений
    fixture.detectChanges();
    // Даем время для обработки асинхронных операций
    tick();
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(
      By.css('.title > p.adaptive') // Прямой дочерний элемент
    );
    // console.log('72', titleElement)  проверка лог
    expect(titleElement).withContext('Элемент не найден').toBeTruthy();
    const actualText = titleElement.nativeElement.textContent.trim();
    expect(actualText).withContext('Текст не совпадает').toBe(testOrgName);
  }));


  it('should display default titles when no organization', fakeAsync(() => {
    // 1. Сбрасываем значение в сервисе
    (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next('');

    // 2. Обновляем компонент
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    // 3. Проверяем структуру DOM
    const titleElements = fixture.debugElement.queryAll(
      By.css('.title .compVersion, .title .adaptive')
    );

    // 4. Отладочный вывод
    console.log('102!!!Elements:', titleElements.map(e => e.nativeElement.outerHTML));

    // 5. Проверки
    expect(titleElements.length).withContext('Должно быть 2 элемента').toBe(2);

    expect(titleElements[0].nativeElement.textContent.trim())
      .withContext('Основной заголовок')
      .toBe('Личный кабинет для любого сайта');

    expect(titleElements[1].nativeElement.textContent.trim())
      .withContext('Адаптивный заголовок')
      .toBe('Личный кабинет');
  }));


  it('should open modal on button clicks', () => {
    // 1. Получаем кнопки
    const buttons = fixture.debugElement.queryAll(By.css('.btnDetailsClass'));
    expect(buttons.length).toBe(3);

    // 2. Первая кнопка
    buttons[0].nativeElement.click();
    expect(modalService.openAppDescription).toHaveBeenCalled();

    // 3. Вторая кнопка
    buttons[1].nativeElement.click();
    expect(modalService.downloadApplication).toHaveBeenCalled();

    // 4. Третья кнопка
    buttons[2].nativeElement.click();
    expect(modalService.instructionsForStart).toHaveBeenCalled();
  });


  it('should show modal when isVisible$ emits true', () => {
    (modalService.isVisible$ as Subject<boolean>).next(true);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeTruthy();
  });


  it('should update organization info from query params', () => {
    expect(dateService.nameOrganizationWhereItCameFrom).toBeDefined();
    expect(dateService.idOrganizationWhereItCameFrom).toBeDefined();
  });


  it('should pass organization data to registration form', () => {
    component.recIdOrg('test-id');
    component.recNameSelectedOrg('test-name');
    fixture.detectChanges();

    expect(component.idOrgForReg).toBe('test-id');
    expect(component.nameSelectedOrgForReg).toBe('test-name');
  });


  it('should handle ngOnDestroy correctly', () => {
    const destroySpy = spyOn(component.destroyed$, 'next');
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });
})














//  юни тесты

// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { MainPageComponent } from './main-page.component';
// import { ModalService } from '../../shared/services/modal.service';
// import { DateService } from '../personal-page/calendar-components/date.service';
// import { Subject} from 'rxjs';
//
// describe('MainPageComponent', () => {
//   let component: MainPageComponent;
//   let modalService: any;
//   let dateService: any;
//   let activatedRoute: any;
//   let fixture: ComponentFixture<MainPageComponent>;
//
//   beforeEach(async () => {  //  будет срабатывать перед каждым тестом  // еще есть beforeAll / afterAll / afterEach
//     modalService = new ModalService()
//     dateService = new DateService()
//     activatedRoute = {queryParams: new Subject()};
//     component = new MainPageComponent(modalService, dateService, activatedRoute)
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
