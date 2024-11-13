import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject, take, takeUntil} from "rxjs";
import {ApiService} from "../../../../shared/services/api.service";
import {DateService} from "../date.service";

@Injectable({
  providedIn: 'root'
})
export class DataCalendarService {
  private destroyed$: Subject<void> = new Subject();

  constructor(
              public apiService: ApiService,
              public dateService: DateService,
  ) {}

  public allEntryAllUsersInMonth: BehaviorSubject<any> = new BehaviorSubject([])
  public allEntryCurrentUserThisMonth: BehaviorSubject<any> = new BehaviorSubject([])
  public arrayOfDays: BehaviorSubject<any> = new BehaviorSubject([])
  public filterByDate: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public filterByOrg: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public showAll: BehaviorSubject<boolean> = new BehaviorSubject(true)
  public allUsersForShowAllFilter: BehaviorSubject<any> = new BehaviorSubject([])



//функция должна 1 раз взять все записи конкретной организации за текущий месяц и вернуть клиенту
  getAllEntryAllUsersForTheMonth() {
    const dataForGetAllEntryAllUsersSelectedMonth = {
      org: this.dateService.currentOrg.value,
      orgId: this.dateService.idSelectedOrg.value,
      month: this.dateService.date.value.format('MM'),
      year: this.dateService.date.value.format('YYYY'),
      userId: this.dateService.currentUserId.value,
    }
    this.apiService.getAllEntryAllUsersOrg(dataForGetAllEntryAllUsersSelectedMonth)
      // .pipe(takeUntil(this.destroyed$))
      .pipe(take(1))
      .subscribe(allEntryAllUsersInMonth => {              //   все записи ORG !!!
        this.allEntryAllUsersInMonth.next(allEntryAllUsersInMonth);
      });
  }


  //получаем всех пользователей выбранной организации
  getAllUsersCurrentOrganization(openEmployee: boolean) {
    const clickedByAdmin = this.dateService.currentUserIsTheAdminOrg.value // чтоб понять кто кликнул по сотруднику
    this.apiService.getAllUsersCurrentOrganization(this.dateService.idSelectedOrg.value, this.dateService.currentUserId.value, openEmployee, clickedByAdmin)
      .pipe(take(1))
      .subscribe(allUsersOrganization => {
        console.log('5', allUsersOrganization)
        if (allUsersOrganization?.length) {
          const currentUser = allUsersOrganization.find((user: any)=> +user.id == this.dateService.currentUserId.value)
          if (currentUser.openEmployee) {
            console.log('56 open employee')
            this.dateService.remainingFunds.next(currentUser.remainingFunds);
            this.getDataSetting(allUsersOrganization, currentUser.openEmployee);
          } else {
            this.dateService.allUsersSelectedOrg.next(allUsersOrganization);     // пользователи выбранной организации
            console.log('61 open admin')
            this.dateService.currentUserId.next(currentUser.id);
            this.dateService.currentUserRole.next(currentUser.role);
            this.dateService.remainingFunds.next(currentUser.remainingFunds);
            this.dateService.currentUserSimpleUser.next(currentUser.role === "USER");
            this.dateService.currentUserIsTheAdminOrg.next(currentUser.role === "ADMIN");
            this.dateService.currentUserNameAndSurname.next(currentUser.nameUser + ' ' + currentUser.surnameUser);
            this.getDataSetting(allUsersOrganization, currentUser.openEmployee);
          }
        }
      });
  }

// заполняет данные настроек из бд...
  getDataSetting(allUsersOrganization: any, openEmployee: boolean) {
    const dataSettings = openEmployee?
      allUsersOrganization.find((admin: any)=> admin.role === 'EMPLOYEE'):
      allUsersOrganization.find((admin: any)=> admin.role === 'ADMIN')
    if (dataSettings) {
      console.log('79', dataSettings)
      this.dateService.timeStartRecord.next(dataSettings.timeStartRec);
      this.dateService.timeMinutesRec.next(dataSettings.timeMinutesRec);
      this.dateService.timeFinishRecord.next(dataSettings.timeLastRec);
      this.dateService.maxPossibleEntries.next(dataSettings.maxClients);
      this.dateService.location.next(dataSettings.location);
      this.dateService.phoneOrg.next(dataSettings.phoneOrg);
      this.dateService.changedSettingsOrg.next(true);
    }
  }


  // 1 раз берем все записи текущего пользователя во всех организациях!
  getAllEntryCurrentUsersThisMonth() {
    const dataForGetAllEntryCurrentUsersThisMonth = {
      year: this.dateService.date.value.format('YYYY'),
      month: this.dateService.date.value.format('MM'),
      userId: this.dateService.currentUserId.value,
    }
    this.apiService.getAllEntryCurrentUser(dataForGetAllEntryCurrentUsersThisMonth)
      // .pipe(takeUntil(this.destroyed$))
      .pipe(take(2))
      .subscribe(dataAllEntryCurrentUsersThisMonth => {
        this.allEntryCurrentUserThisMonth.next(dataAllEntryCurrentUsersThisMonth);
        this.allUsersForShowAllFilter.next(dataAllEntryCurrentUsersThisMonth);
        if (this.filterByDate.value) {
          this.filterRecCurrentUserByDate();
        }
      });
  }

  getPhoneSelectedUser(userId: any) {
    this.apiService.getPhoneClient(userId)
      // .pipe(takeUntil(this.destroyed$))
      .pipe(take(1))
      .subscribe((phoneAndMail:any)=> {
        this.dateService.clientPhone.next(phoneAndMail.phone);
        this.dateService.clientEmail.next(phoneAndMail.email);
      })
  }


  //функция фильтрующая все записи пользователя по организации
  filterRecCurrentUserByOrg() {
    this.filterByOrg.next(true);
    this.filterByDate.next(false);
    this.showAll.next(false);
    const filterOrgByOrg = this.allEntryCurrentUserThisMonth.value
      .filter((org:any)=>{
        return org.orgId == this.dateService.idSelectedOrg.value
  });
    this.allEntryCurrentUserThisMonth.next(filterOrgByOrg);
  }

  //функция фильтрующая все записи пользователя по дате
  filterRecCurrentUserByDate() {
    this.filterByOrg.next(false);
    this.filterByDate.next(true);
    this.showAll.next(false);
    const filterOrgByDate = this.allEntryCurrentUserThisMonth.value
      .filter((org:any)=> org.date === this.dateService.date.value.format('DD.MM.YYYY'));
    this.allEntryCurrentUserThisMonth.next(filterOrgByDate.sort((a: any, b: any) => a.time > b.time ? 1 : -1));
  }

  //функция покажет все записи за месяц
  showAllRec() {
    this.showAll.next(true);
    this.filterByOrg.next(false);
    this.filterByDate.next(false);
    this.allEntryCurrentUserThisMonth.next(this.allUsersForShowAllFilter.value.sort((a: any, b: any) => a.date > b.date ? 1 : -1));
  }



  //удаление записи ...в блоке всех записей ...
  deleteSelectedRecInAllRecBlock(selectedRec: any) {
    const workStatus = this.dateService.maxPossibleEntries.value >= this.dateService.howMuchRecorded.value +1? 0: 1; //0 = closed, 1 = open
    //один означает что пользователь клиент и нужно отправить писмо одмину что клиент отменил запись
    this.apiService.deleteEntry(selectedRec.idRec, selectedRec.userId, selectedRec.orgId, this.dateService.userCancelHimselfRec.value, workStatus)
      // .pipe(takeUntil(this.destroyed$))
      .pipe(take(1))
      .subscribe(() => {
        this.getAllEntryAllUsersForTheMonth();
        this.getAllUsersCurrentOrganization(false);
        this.dateService.recordingDaysChanged.next(true);
      })
  }



  //Функция, проверяет есть сотрудники у орг или нет!
  // которая смотрит всех сотрудников и если хоть у кого то есть jobTitle, возвращает true и показывается блок направления организации
  checkingOrgHasEmployees () {
    const employees = this.dateService.allUsersSelectedOrg.value?.filter((el: any) => el.jobTitle.length >= 1)
    return employees?.length >= 1 ;
  }

  // Функция редиректит на главную страницу профиля
  routerLinkMain(returnToYourPage: boolean) {
    //повторяю логику выбора организации тока подставляю данные указанные при регистрации которые беру из localStorage
    const data = JSON.parse(localStorage.getItem('userData') as string)
    if (returnToYourPage) {
      this.dateService.idOrgWhereSelectedEmployee.next(data.user.initialValueIdOrg);
      this.dateService.nameOrgWhereSelectedEmployee.next(this.dateService.sectionOrOrganization.value);
    }
    const nameOrg =
      returnToYourPage ||
      !returnToYourPage && !this.dateService.idOrgWhereSelectedEmployee.value?
      data.user.initialValueSectionOrOrganization :  this.dateService.nameOrgWhereSelectedEmployee.value;
    const idSelectedOrg =
      returnToYourPage ||
      !returnToYourPage && !this.dateService.idOrgWhereSelectedEmployee.value?
      data.user.initialValueIdOrg : this.dateService.idOrgWhereSelectedEmployee.value;

    this.dateService.idSelectedOrg.next(idSelectedOrg)
    this.dateService.currentOrg.next(nameOrg)
    this.getAllEntryAllUsersForTheMonth();
    this.getAllUsersCurrentOrganization(false);
  }
}
