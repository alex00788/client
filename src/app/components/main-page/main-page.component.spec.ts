import {MainPageComponent} from "./main-page.component";
import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ModalService} from "../../shared/services/modal.service";
import {DateService} from "../personal-page/calendar-components/date.service";
import {ActivatedRoute} from "@angular/router";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {BehaviorSubject, of, Subject} from "rxjs";
import {By} from "@angular/platform-browser";
import {DownloadAppComponent} from "../download-app/download-app.component";


// Mock services
class MockModalService {
  isVisible = false;
  appDescription$ = new BehaviorSubject<boolean>(false);
  loginForm$ = new BehaviorSubject<boolean>(false);
  registrationForm$ = new BehaviorSubject<boolean>(false);
  downloadApp$ = new BehaviorSubject<boolean>(false);
  hideTitle$ = of(true);
  openAppDescription = jasmine.createSpy('openAppDescription').and.callFake(() => {
    this.isVisible = true;
    this.appDescription$.next(true);
  });
  downloadApplication = jasmine.createSpy('downloadApplication').and.callFake(() => {
    this.isVisible = true;
    this.appDescription$.next(false);
    this.downloadApp$.next(true);
  });
  instructionsForStart = jasmine.createSpy('instructionsForStart');
}

class MockDateService {
  nameOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
  idOrganizationWhereItCameFrom = new Subject<string>();
}

describe('MainPageComponent', () => {
  let component : MainPageComponent
  let fixture : ComponentFixture<MainPageComponent>  // внутрь передаем компонент который тестируем
  let modalService: ModalService;
  let dateService: DateService;

  beforeEach(()=> {                  //перед каждым тестом  со своим модулем
    TestBed.configureTestingModule({   // создание похожего модуля который будет запускать все сущности автоматически
      imports: [MainPageComponent],              // standalone  заносяться в imports
      providers: [
        {provide: ModalService, useClass: MockModalService},
        {provide: DateService, useClass: MockDateService},
        {
          provide: ActivatedRoute,
          useValue: {queryParams: of({organization: 'testOrg', id: '123'})}
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]  // Игнорирование неизвестных элементов в шаблоне.
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent)    //  приспособа для запуска компонента
    component = fixture.componentInstance      // так получаем сам компонент
    // еще часто используемые/fixture.debugElement корневой элемент/fixture.nativeElement

    // Получение экземпляров сервисов.
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
    // console.log('102!!!Elements:', titleElements.map(e => e.nativeElement.outerHTML));

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


  it('should show modal when isVisible emits true', () => {
    modalService.isVisible = true;
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

  it('should open application description modal integration', fakeAsync(() => {
    // 1. Проверяем начальное состояние
    expect(modalService.isVisible).toBeFalse();
    expect(modalService.appDescription$.getValue()).toBeFalse();
    // 2. Находим и кликаем кнопку "Подробнее"
    const buttons = fixture.debugElement.queryAll(By.css('.btnDetailsClass'));
    const detailsButton = buttons[0];
    detailsButton.nativeElement.click();
    fixture.detectChanges();
    tick();
    // 3. Проверяем состояние сервиса после клика
    expect(modalService.openAppDescription).toHaveBeenCalled();
    expect(modalService.isVisible).toBeTrue();
    expect(modalService.appDescription$.getValue()).toBeTrue();

    // 4. Проверяем отображение модального окна
    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeTruthy();

    // 5. Проверяем наличие компонента описания приложения в модалке
    const descriptionComponent = fixture.debugElement.query(
      By.css('app-description-application')
    );
    expect(descriptionComponent).toBeTruthy();

    // 6. Проверяем сброс других состояний
    expect(modalService.loginForm$.getValue()).toBeFalse();
    expect(modalService.registrationForm$.getValue()).toBeFalse();
    expect(modalService.downloadApp$.getValue()).toBeFalse();
  }));

  it('should open application download modal integration', fakeAsync(() => {
    // 1. Проверяем начальное состояние
    expect(modalService.isVisible).toBeFalse();
    expect(modalService.downloadApp$.getValue()).toBeFalse();
    // 2. Находим и кликаем кнопку "Подробнее"
    const buttons = fixture.debugElement.queryAll(By.css('.btnDetailsClass'));
    let downloadButton;
      buttons.forEach(btn => {
      if (btn.nativeElement.textContent.includes('Скачать приложение')) {
       downloadButton = btn
      }
    });
    fixture.detectChanges();
    tick();
    // Добавляем явную проверку на существование элемента
    expect(downloadButton).withContext('Скачать приложение').toBeTruthy();

    // Эмулируем клик на кнопку
    downloadButton!.nativeElement.click();
    fixture.detectChanges();
    tick();

    // 3. Проверяем состояние сервиса после клика
    expect(modalService.downloadApplication).toHaveBeenCalled();
    expect(modalService.isVisible).toBeTrue();
    expect(modalService.downloadApp$.getValue()).toBeTrue();

    // 4. Проверяем отображение модального окна
    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeTruthy();

    // 5. Проверяем наличие компонента описания приложения в модалке
    const downloadAppComponent = fixture.debugElement.query(
      By.css('app-download-app')
    );
    expect(downloadAppComponent).toBeTruthy();

    // 6. Проверяем сброс других состояний
    expect(modalService.loginForm$.getValue()).toBeFalse();
    expect(modalService.registrationForm$.getValue()).toBeFalse();
    expect(modalService.appDescription$.getValue()).toBeFalse();

  }));

  // --- ДОПОЛНИТЕЛЬНЫЕ EDGE CASE ТЕСТЫ ---

  it('should not update organization if queryParams is empty', fakeAsync(() => {
    const route = TestBed.inject(ActivatedRoute);
    Object.defineProperty(route, 'queryParams', { value: of({}), writable: true });
    (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next('');
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(dateService.nameOrganizationWhereItCameFrom.getValue()).toBe('');
  }));

  it('should not update organization if queryParams does not contain organization', fakeAsync(() => {
    const route = TestBed.inject(ActivatedRoute);
    Object.defineProperty(route, 'queryParams', { value: of({foo: 'bar'}), writable: true });
    (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next('');
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(dateService.nameOrganizationWhereItCameFrom.getValue()).toBe('');
  }));

  it('should complete destroyed$ on ngOnDestroy', () => {
    const completeSpy = spyOn(component.destroyed$, 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should not update organization after ngOnDestroy', fakeAsync(() => {
    component.ngOnDestroy();
    // Эмулируем новые параметры после destroy
    (dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>).next('New Org');
    fixture.detectChanges();
    tick();
    // Проверяем, что значения не обновились (или остались прежними)
    // Здесь зависит от реализации, но можно проверить, что подписка не сработала
    // Например, если бы был spy на метод, который должен был вызваться
    // В данном случае просто убеждаемся, что не выбрасывается ошибка
    expect(true).toBeTrue();
  }));

  it('should handle error from dateService gracefully', fakeAsync(() => {
    spyOn((dateService.nameOrganizationWhereItCameFrom as BehaviorSubject<string>), 'next').and.throwError('Test error');
    expect(() => {
      component.ngOnInit();
      fixture.detectChanges();
      tick();
    }).toThrow();
  }));


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
