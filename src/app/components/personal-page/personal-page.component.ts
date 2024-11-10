import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {ApiService} from "../../shared/services/api.service";
import {BodyCalendarComponent} from "./calendar-components/body-calendar/body-calendar.component";
import {HeaderCalendarComponent} from "./calendar-components/header-calendar/header-calendar.component";
import {ErrorModalComponent} from "../error-modal/error-modal.component";
import {DateService} from "./calendar-components/date.service";
import {CommonModule, NgForOf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {DataPersonModalComponent} from "./data-person-modal/data-person-modal.component";
import {ModalService} from "../../shared/services/modal.service";
import {ModalWindowForPersonPageComponent} from "./modal-window-for-person-page/modal-window-for-person-page.component";
import {InfoBlockComponent} from "./calendar-components/info-block/info-block.component";
import {ClientsListComponent} from "./calendar-components/clients-list/clients-list.component";
import {DataCalendarNewComponent} from "./calendar-components/data-calendar-new/data-calendar-new.component";
import {DayWeekMonthComponent} from "./calendar-components/day-week-month/day-week-month.component";
import {
  SelectOrgToDisplayComponent
} from "./calendar-components/current-user-data/select-org-to-display/select-org-to-display.component";
import {DataCalendarService} from "./calendar-components/data-calendar-new/data-calendar.service";
import {TranslateMonthPipe} from "../../shared/pipe/translate-month.pipe";
import {PersonalBlockService} from "./calendar-components/personal-block.service";
import {RecordingService} from "./calendar-components/recording.service";
import {RecordsBlockComponent} from "./calendar-components/current-user-data/records-block/records-block.component";
import {AddNewOrgComponent} from "./calendar-components/current-user-data/add-new-org/add-new-org.component";
import {
  PersonalDataBlockComponent
} from "./calendar-components/current-user-data/personal-data-block/personal-data-block.component";
import {SettingsBlockComponent} from "./calendar-components/current-user-data/settings-block/settings-block.component";
import {
  DataAboutRecComponent
} from "./calendar-components/current-user-data/records-block/data-about-rec/data-about-rec.component";
import {SwitchOfTheWeekComponent} from "./calendar-components/switch-of-the-week/switch-of-the-week.component";
import {SuccessModalComponent} from "../success-modal/success-modal.component";
import moment from "moment";
import {ModalRenameComponent} from "./modal-rename/modal-rename.component";
import {RenameOrgComponent} from "../rename-org/rename-org.component";
import {SuccessService} from "../../shared/services/success.service";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {WebSocketService} from "../../shared/services/web-socket.service";
import {
  SelectOrgDirectionComponent
} from "./calendar-components/current-user-data/select-org-direction/select-org-direction.component";


@Component({
  selector: 'app-personal-page',
  standalone: true,
  imports: [
    BodyCalendarComponent,
    HeaderCalendarComponent,
    ErrorModalComponent,
    CommonModule,
    NgForOf,
    DataPersonModalComponent,
    ModalWindowForPersonPageComponent,
    InfoBlockComponent,
    ClientsListComponent,
    DataCalendarNewComponent,
    DayWeekMonthComponent,
    SelectOrgToDisplayComponent,
    TranslateMonthPipe,
    RecordsBlockComponent,
    AddNewOrgComponent,
    PersonalDataBlockComponent,
    SettingsBlockComponent,
    DataAboutRecComponent,
    SwitchOfTheWeekComponent,
    SuccessModalComponent,
    ModalRenameComponent,
    RouterLink,
    RenameOrgComponent,
    FormsModule,
    ReactiveFormsModule,
    SelectOrgDirectionComponent,
  ],
  templateUrl: './personal-page.component.html',
  styleUrl: './personal-page.component.css'
})
export class PersonalPageComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private apiService: ApiService,
    public dateService: DateService,
    public successService: SuccessService,
    public modalService: ModalService,
    public recordingService: RecordingService,
    public dataCalendarService: DataCalendarService,
    public webSocketService: WebSocketService,
    public personalBlockService: PersonalBlockService,
  ) {
  }
  formDeleteData = new FormGroup({
    dataEmail: new FormControl('', [Validators.required, Validators.email]),
  })
  private destroyed$: Subject<void> = new Subject();
  inputValue = '';
  photoCurrentOrg = '';
  deleteData = false;
  hidePhotoCurrentOrg = false;
  currentOrgHasEmployees = false;
  settingsOrg = false;
  hideBtn = true;

  ngOnInit(): void {
    this.webSocketService.socket.onopen;     //соединился с webSocket servera
    this.dateService.getCurrentUser(); // заполняет блок мои данные
    this.getAllOrg();
    this.clearTableRec();    //вызывается 1 раз при входе 2 раза в месяц
    this.dataCalendarService.getAllUsersCurrentOrganization(false);
    this.whenLoggingCheckOrgHasEmployees()
  }

  //при логине проверка есть ли сотрудники
  whenLoggingCheckOrgHasEmployees () {
    this.dateService.allUsersSelectedOrg  //когда пройдет запрос данные меняются, подписываюсь на это событие, чтоб перерисовать сотрудников текущей организации
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.currentOrgHasEmployees = this.dataCalendarService.checkingOrgHasEmployees();
      })
  }


  //удаление и перенос в архив всех записей из таблицы записи старше 3 месяцев каждого 1го числа месяца
  clearTableRec() {        //не перенес на бек тк ошибка даты проблемма с моментом в node.js
    const m = moment();
    if (m.format('D') == '1' && this.dateService.youCanSendRequestToClearDatabase.value
      // ||
      //   m.format('DD') == '15' && this.dateService.youCanSendRequestToClearDatabase.value
    ) {
      //отсчитываем 2 месяца назад вычесляем 1 число полученого месяца
      const threeMonthsAgo = m.clone().subtract(2, 'months').startOf('month').format('YYYY.MM.DD');
      this.dateService.youCanSendRequestToClearDatabase.next(false);
      this.apiService.clearTableRec({threeMonthsAgo})
        .pipe(takeUntil(this.destroyed$))
        .subscribe()
    }
    if (m.format('D') !== '1') {
    // if (m.format('D') !== '1' && m.format('DD') !== '15') {
      this.dateService.youCanSendRequestToClearDatabase.next(true);
    }
  }

//принудительная очистка бд по нажатию кнопки main-админом
  forcedCleaning () {
    const m = moment();
    const threeMonthsAgo = m.clone().subtract(2, 'months').startOf('month').format('YYYY.MM.DD');
    this.dateService.youCanSendRequestToClearDatabase.next(false)
    this.apiService.clearTableRec({threeMonthsAgo})
      .pipe(takeUntil(this.destroyed$))
      .subscribe((e: any) => {
        this.successService.localHandler(e.message);
        this.getAllOrg();
      })
  }


  //Получаем все зарегистрированные организации из бд для переключения данных
  getAllOrg() {
    this.apiService.getAllOrgFromDb()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(org=> {
        this.dateService.allOrganization.next(org.allOrg);
        this.getPhotoForOrg();
      })
  }


  public getPhotoForOrg() {
      const currentOrg = this.dateService.allOrganization.value
        .find((org:any)=> +org.id ===  +this.dateService.idSelectedOrg.value)
        ?.photoOrg
      if (currentOrg) {
        this.hidePhotoCurrentOrg = currentOrg.length >=1;
        this.photoCurrentOrg = currentOrg;
      } else {
        this.hidePhotoCurrentOrg = false;
        this.photoCurrentOrg = '';
      }
  }

  mainePage() {
    this.router.navigate(['/'])
  }


  logoutSystems() {
    this.modalService.showTitle();
    this.router.navigate(['/'])
    this.apiService.logout()
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  routerLinkMain() {
    this.dataCalendarService.routerLinkMain(true);
    this.getAllOrg();
//ниже две строки для того чтобы перекидывать на страницу входа без разлогинивания
    // this.router.navigate(['/']);
    // this.modalService.showTitle();
  }

  switchCalendar() {
    this.dateService.openCalendar();
    this.recordingService.closeRecordsBlock()
  }

  deleteTestDataSwitch() {
    this.deleteData = !this.deleteData;
  }

  clearTrim(e: any) {
    e.target.value = e.target.value.replaceAll(' ', '');
  }

  removeTestData() {
    this.apiService.deleteTestData(this.formDeleteData.value.dataEmail)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.formDeleteData.reset()
        this.deleteData = false;
        this.successService.localHandler(res.message);
        this.getAllOrg();
      })
  }

  openSettingsOrg() {
    this.settingsOrg = !this.settingsOrg;
  }

  clickedOnEmployee(event: boolean) {
    this.hideBtn = !event;
    this.hidePhotoCurrentOrg = !event;
    this.getPhotoForOrg();
    if (event) {
      this.successService.localHandler('Вы выбрали одно из направлений. \n' +
        'Чтобы его изменить нажмите x \n Чтоб закрыть направления нажмите на домик');
    }
  }

  switchOrg() {
    this.getAllOrg()
    this.hideBtn = true;
  }
}
