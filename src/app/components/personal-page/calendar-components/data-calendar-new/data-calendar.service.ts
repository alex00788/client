import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
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
  public filterByDate: BehaviorSubject<boolean> = new BehaviorSubject(true)
  public filterByOrg: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public showAll: BehaviorSubject<boolean> = new BehaviorSubject(false)
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allEntryAllUsersInMonth => {              //   все записи ORG !!!
        this.allEntryAllUsersInMonth.next(allEntryAllUsersInMonth);
      });
  }


  //получаем всех пользователей выбранной организации
  getAllUsersCurrentOrganization() {
    this.apiService.getAllUsersCurrentOrganization(this.dateService.idSelectedOrg.value, this.dateService.currentUserId.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allUsersOrganization => {
        this.dateService.allUsersSelectedOrg.next(allUsersOrganization);     // пользователи выбранной организации
        if (allUsersOrganization.length) {
          const currentUser = allUsersOrganization.find((user: any)=> +user.id == this.dateService.currentUserId.value)
          this.dateService.currentUserId.next(currentUser.id);
          this.dateService.currentUserRole.next(currentUser.role);
          this.dateService.remainingFunds.next(currentUser.remainingFunds);
          this.dateService.currentUserSimpleUser.next(currentUser.role === "USER");
          this.dateService.currentUserIsTheAdminOrg.next(currentUser.role === "ADMIN");
          this.dateService.currentUserNameAndSurname.next(currentUser.nameUser + ' ' + currentUser.surnameUser);
          this.getDataSetting(allUsersOrganization);
        }
      });
  }

// заполняет данные настроек из бд...
  getDataSetting(allUsersOrganization: any) {
    const dataSettings = allUsersOrganization.find((admin: any)=> admin.role === 'ADMIN')
    if (dataSettings) {
      this.dateService.timeStartRecord.next(dataSettings.timeStartRec);
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(dataAllEntryCurrentUsersThisMonth => {
        this.allEntryCurrentUserThisMonth.next(dataAllEntryCurrentUsersThisMonth);
        this.allUsersForShowAllFilter.next(dataAllEntryCurrentUsersThisMonth);
        if (this.filterByDate.value) {
          this.filterRecCurrentUserByDate();
        }
      });
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
    this.apiService.deleteEntry(selectedRec.idRec, selectedRec.userId, selectedRec.orgId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.getAllEntryAllUsersForTheMonth();
        this.getAllUsersCurrentOrganization();
        this.dateService.recordingDaysChanged.next(true);
      })
  }



}
