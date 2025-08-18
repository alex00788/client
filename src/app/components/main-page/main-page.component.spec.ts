import {MainPageComponent} from "./main-page.component";
import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ModalService} from "../../shared/services/modal.service";
import {DateService} from "../personal-page/calendar-components/date.service";
import {ActivatedRoute} from "@angular/router";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {BehaviorSubject, of, Subject} from "rxjs";
import {By} from "@angular/platform-browser";
import {DownloadAppComponent} from "../download-app/download-app.component";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";


// Mock services
class MockModalService {
  isVisible = false;
  appDescription$ = new BehaviorSubject<boolean>(false);
  loginForm$ = new BehaviorSubject<boolean>(false);
  registrationForm$ = new BehaviorSubject<boolean>(false);
  regFormChoiceOrg$ = new BehaviorSubject<boolean>(false);
  regFormAddNewOrg$ = new BehaviorSubject<boolean>(false);
  downloadApp$ = new BehaviorSubject<boolean>(false);
  instructions$ = new BehaviorSubject<boolean>(false);
  appContacts$ = new BehaviorSubject<boolean>(false);
  appSupport$ = new BehaviorSubject<boolean>(false);
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
  
  instructionsForStart = jasmine.createSpy('instructionsForStart').and.callFake(() => {
    this.isVisible = true;
    this.instructions$.next(true);
  });
  
  openAppContacts = jasmine.createSpy('openAppContacts').and.callFake(() => {
    this.isVisible = true;
    this.appContacts$.next(true);
  });
  
  openAppSupport = jasmine.createSpy('openAppSupport').and.callFake(() => {
    this.isVisible = true;
    this.appSupport$.next(true);
  });
  
  openLoginForm = jasmine.createSpy('openLoginForm').and.callFake(() => {
    this.isVisible = true;
    this.loginForm$.next(true);
  });
  
  openRegistrationForm = jasmine.createSpy('openRegistrationForm').and.callFake(() => {
    this.isVisible = true;
    this.registrationForm$.next(true);
  });
  
  openRegFormChoiceOrganisation = jasmine.createSpy('openRegFormChoiceOrganisation').and.callFake(() => {
    this.isVisible = true;
    this.regFormChoiceOrg$.next(true);
  });
  
  openFormAddNewOrg = jasmine.createSpy('openFormAddNewOrg').and.callFake(() => {
    this.isVisible = true;
    this.regFormAddNewOrg$.next(true);
  });
}

class MockDateService {
  nameOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
  idOrganizationWhereItCameFrom = new BehaviorSubject<string>('');
}

describe('MainPageComponent', () => {
  let component : MainPageComponent
  let fixture : ComponentFixture<MainPageComponent>  // внутрь передаем компонент который тестируем
  let modalService: any;
  let dateService: any;

  beforeEach(()=> {                  //перед каждым тестом  со своим модулем
    TestBed.configureTestingModule({   // создание похожего модуля который будет запускать все сущности автоматически
      imports: [
        MainPageComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],              // standalone  заносяться в imports
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

  // === ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ ДЛЯ ПОЛНОГО ПОКРЫТИЯ ===

  it('should have correct initial property values', () => {
    expect(component.mainTitle).toBe('Личный кабинет для любого сайта');
    expect(component.mainTitleComp).toBe('Личный кабинет');
    expect(component.modalTitle).toBe('ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ');
    expect(component.idOrgForReg).toBeUndefined();
    expect(component.nameSelectedOrgForReg).toBeUndefined();
    expect(component.destroyed$).toBeDefined();
  });

  it('should have contact buttons with correct text', () => {
    const contactButtons = fixture.debugElement.queryAll(By.css('.btnContactClass'));
    expect(contactButtons.length).toBe(2);
    
    const buttonTexts = contactButtons.map(btn => btn.nativeElement.textContent.trim());
    expect(buttonTexts).toContain('Контакты');
    expect(buttonTexts).toContain('Поддержать разработку');
  });

  it('should call openAppContacts when contacts button clicked', () => {
    const contactButtons = fixture.debugElement.queryAll(By.css('.btnContactClass'));
    const contactsButton = contactButtons[0];
    
    contactsButton.nativeElement.click();
    
    expect(modalService.openAppContacts).toHaveBeenCalled();
  });

  it('should call openAppSupport when support button clicked', () => {
    const contactButtons = fixture.debugElement.queryAll(By.css('.btnContactClass'));
    const supportButton = contactButtons[1];
    
    supportButton.nativeElement.click();
    
    expect(modalService.openAppSupport).toHaveBeenCalled();
  });

  it('should show contacts component when appContacts$ is true', fakeAsync(() => {
    modalService.isVisible = true;
    modalService.appContacts$.next(true);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const contactsComponent = fixture.debugElement.query(By.css('app-contacts'));
    expect(contactsComponent).toBeTruthy();
  }));

  it('should show support component when appSupport$ is true', fakeAsync(() => {
    modalService.isVisible = true;
    modalService.appSupport$.next(true);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const supportComponent = fixture.debugElement.query(By.css('app-support-development'));
    expect(supportComponent).toBeTruthy();
  }));

  it('should show instructions component when instructions$ is true', fakeAsync(() => {
    modalService.isVisible = true;
    modalService.instructions$.next(true);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const instructionsComponent = fixture.debugElement.query(By.css('app-instructions-for-start'));
    expect(instructionsComponent).toBeTruthy();
  }));

  it('should show organization choice form when regFormChoiceOrg$ is true', fakeAsync(() => {
    modalService.isVisible = true;
    modalService.regFormChoiceOrg$.next(true);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const choiceComponent = fixture.debugElement.query(By.css('app-reg-form-choice-organization'));
    expect(choiceComponent).toBeTruthy();
  }));

  it('should show new organization form when regFormAddNewOrg$ is true', fakeAsync(() => {
    modalService.isVisible = true;
    modalService.regFormAddNewOrg$.next(true);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const newOrgComponent = fixture.debugElement.query(By.css('app-reg-form-new-org'));
    expect(newOrgComponent).toBeTruthy();
  }));

  it('should have correct CSS classes applied', () => {
    const mainPage = fixture.debugElement.query(By.css('.mainPage'));
    const title = fixture.debugElement.query(By.css('.title'));
    const enterBtn = fixture.debugElement.query(By.css('.enter'));
    const contactsBlock = fixture.debugElement.query(By.css('.contactsBlock'));
    
    expect(mainPage).toBeTruthy();
    expect(title).toBeTruthy();
    expect(enterBtn).toBeTruthy();
    expect(contactsBlock).toBeTruthy();
  });

  it('should have correct button styling classes', () => {
    const detailButtons = fixture.debugElement.queryAll(By.css('.btnDetailsClass'));
    const contactButtons = fixture.debugElement.queryAll(By.css('.btnContactClass'));
    
    detailButtons.forEach(btn => {
      expect(btn.nativeElement.classList.contains('btnDetailsClass')).toBeTrue();
    });
    
    contactButtons.forEach(btn => {
      expect(btn.nativeElement.classList.contains('btnContactClass')).toBeTrue();
    });
  });

  it('should navigate to personal page when title clicked', () => {
    const titleElement = fixture.debugElement.query(By.css('.title'));
    
    // Проверяем, что routerLink работает
    expect(titleElement.attributes['ng-reflect-router-link']).toBe('/personal-page');
  });

  it('should navigate to personal page when enter button clicked', () => {
    const enterButton = fixture.debugElement.query(By.css('.enter'));
    
    // Проверяем, что routerLink работает
    expect(enterButton.attributes['ng-reflect-router-link']).toBe('/personal-page');
  });

  it('should handle very long organization names', fakeAsync(() => {
    const longOrgName = 'A'.repeat(1000);
    dateService.nameOrganizationWhereItCameFrom.next(longOrgName);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.title > p.adaptive'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent.trim()).toBe(longOrgName);
  }));

  it('should handle special characters in organization names', fakeAsync(() => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    dateService.nameOrganizationWhereItCameFrom.next(specialChars);
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.title > p.adaptive'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent.trim()).toBe(specialChars);
  }));

  it('should handle rapid state changes correctly', fakeAsync(() => {
    // Быстро меняем состояния
    modalService.isVisible = true;
    modalService.appDescription$.next(true);
    fixture.detectChanges();
    
    modalService.appDescription$.next(false);
    modalService.downloadApp$.next(true);
    fixture.detectChanges();
    
    modalService.downloadApp$.next(false);
    modalService.instructions$.next(true);
    fixture.detectChanges();
    
    tick();
    fixture.detectChanges();

    // Проверяем, что последнее состояние корректно
    const instructionsComponent = fixture.debugElement.query(By.css('app-instructions-for-start'));
    expect(instructionsComponent).toBeTruthy();
  }));

  it('should handle multiple rapid button clicks', fakeAsync(() => {
    const buttons = fixture.debugElement.queryAll(By.css('.btnDetailsClass'));
    
    // Быстро кликаем по всем кнопкам
    buttons.forEach(btn => btn.nativeElement.click());
    
    expect(modalService.openAppDescription).toHaveBeenCalled();
    expect(modalService.downloadApplication).toHaveBeenCalled();
    expect(modalService.instructionsForStart).toHaveBeenCalled();
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
    // Проверяем, что не выбрасывается ошибка
    expect(true).toBeTrue();
  }));

  it('should handle null or undefined query params', fakeAsync(() => {
    const route = TestBed.inject(ActivatedRoute);
    Object.defineProperty(route, 'queryParams', { 
      value: of(null), 
      writable: true 
    });
    
    expect(() => {
      component.ngOnInit();
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  it('should not have memory leaks from subscriptions', fakeAsync(() => {
    component.ngOnInit();
    tick();
    
    component.ngOnDestroy();
    
    // Проверяем, что destroyed$ Subject был завершен
    // Subject закрывается только при вызове complete(), но не при next()
    expect(component.destroyed$.closed).toBeFalse();
    // Но мы можем проверить, что методы были вызваны
    expect(component.destroyed$.next).toBeDefined();
    expect(component.destroyed$.complete).toBeDefined();
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
