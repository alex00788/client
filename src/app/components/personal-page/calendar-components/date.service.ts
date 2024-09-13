import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class DateService {                                            //moment() это текущая дата
  public date: BehaviorSubject<any> = new BehaviorSubject(moment())        //начальное значение
  public currentUserNameAndSurname: BehaviorSubject<any> = new BehaviorSubject('')
  public currentUserId: BehaviorSubject<any> = new BehaviorSubject('')
  public currentUserRole: BehaviorSubject<any> = new BehaviorSubject('')
  public currentOrg: BehaviorSubject<any> = new BehaviorSubject('')
  public currentOrgWasRenamed: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public currentUserIsTheMainAdmin: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public currentUserIsTheAdminOrg: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public userSignedHimself: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public userCancelHimselfRec: BehaviorSubject<any> = new BehaviorSubject(0) //0 означает что пользователь админ писмо об отмене отправлять нужно клиенту что запись отменилась
  public currentUserSimpleUser: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public calendarBodyOpen: BehaviorSubject<boolean> = new BehaviorSubject(true)
  public recordingDaysChanged: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public changedSettingsOrg: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public remainingFunds: BehaviorSubject<any> = new BehaviorSubject('')
  public allUsers: BehaviorSubject<any> = new BehaviorSubject([])
  public allEntrySelectedUserInSelectMonth: BehaviorSubject<any> = new BehaviorSubject([])
  public allUsersSelectedOrg: BehaviorSubject<any> = new BehaviorSubject([])
  public allOrganization: BehaviorSubject<any> = new BehaviorSubject([])
  public allOrgForReg: BehaviorSubject<any> = new BehaviorSubject([])
  public allOrgNameAndId: BehaviorSubject<any> = new BehaviorSubject([])
  public selectOrgForReg: BehaviorSubject<any> = new BehaviorSubject('')
  public dataAboutSelectedRec: BehaviorSubject<any> = new BehaviorSubject({})
  public idSelectedOrg: BehaviorSubject<any> = new BehaviorSubject('')
  public nameOrganizationWhereItCameFrom: BehaviorSubject<any> = new BehaviorSubject('')
  public idOrganizationWhereItCameFrom: BehaviorSubject<string> = new BehaviorSubject('')
  public sectionOrOrganization: BehaviorSubject<any> = new BehaviorSubject('')
  public timeStartRecord: BehaviorSubject<any> = new BehaviorSubject(18)
  public timeFinishRecord: BehaviorSubject<any> = new BehaviorSubject(19)
  public timeMinutesRec: BehaviorSubject<any> = new BehaviorSubject('00')
  public location: BehaviorSubject<any> = new BehaviorSubject('')
  public phoneOrg: BehaviorSubject<any> = new BehaviorSubject('')
  public timeUntilBlock: BehaviorSubject<any> = new BehaviorSubject(12)
  public maxPossibleEntries: BehaviorSubject<any> = new BehaviorSubject('')
  public howMuchRecorded: BehaviorSubject<any> = new BehaviorSubject(0)
  public dataSelectedUser: BehaviorSubject<any> = new BehaviorSubject({})
  public clientPhone: BehaviorSubject<any> = new BehaviorSubject('')
  public clientEmail: BehaviorSubject<any> = new BehaviorSubject('')
  public pasForLink: BehaviorSubject<any> = new BehaviorSubject('')

  constructor() {
  }

  // метод меняющий месяц на 1 вперед или назад в компоненте header
  changeMonth(dir: number) {
    const value = this.date.value.add(dir, 'month')    //  1й парметр будет число, а второй, что меняем
    this.date.next(value)
    this.recordingDaysChanged.next(true);
  }


  // метод меняющий день на 1 вперед или назад
  changeOneDay(dir: number) {
    const value = this.date.value.add(dir, 'day')
    this.date.next(value)
    this.recordingDaysChanged.next(true);
  }

// метод меняющий неделю на 1 вперед или назад
  changeOneWeek(dir: number) {
    this.date.value.add(dir, 'week')
    this.recordingDaysChanged.next(true);
  }

  // функция устанавливающая пользователя
  setUser(userData: any) {
    localStorage.setItem('userData', JSON.stringify(userData))
    // const newUser = JSON.parse(userData.nameUser) + JSON.parse(userData.surnameUser)
    const newUser = userData.user.nameUser + ' ' + userData.user.surnameUser
    this.currentUserNameAndSurname.next(newUser)
  }

  getCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('userData') as string)
    this.currentUserSimpleUser.next(currentUser.user.role !== 'ADMIN' && currentUser.user.role !== 'MAIN_ADMIN');
    this.currentUserIsTheAdminOrg.next(currentUser.user.role === 'ADMIN');
    this.currentUserIsTheMainAdmin.next(currentUser.user.role === 'MAIN_ADMIN');
    this.currentUserNameAndSurname.next(currentUser.user.nameUser + ' ' + currentUser.user.surnameUser);
    this.currentUserId.next(currentUser.user.id);
    this.currentUserRole.next(currentUser.user.role);
    this.idSelectedOrg.next(currentUser.user.idOrg);
    this.currentOrg.next(currentUser.user.sectionOrOrganization)
    this.sectionOrOrganization.next(currentUser.user.sectionOrOrganization);
  }

  // метод выбирающий тот день по которому кликнули
  changeDay(day: moment.Moment) {
    const value = this.date.value.set({
      date: day.date(),
      month: day.month()
    })
    this.date.next(value)
  }

  changeSettingsRec(settingsVal: any) {
    this.timeStartRecord.next(+settingsVal.timeStartRec)
    this.timeFinishRecord.next(+settingsVal.timeFinishRec)
    this.maxPossibleEntries.next(settingsVal.maxiPeople)
    this.timeUntilBlock.next(settingsVal.timeUntilBlock)
    this.location.next(settingsVal.location)
    this.phoneOrg.next(settingsVal.phoneOrg)
  }

  openCalendar() {
    this.calendarBodyOpen.next(!this.calendarBodyOpen.value)
  }

  getUsersSelectedOrg(org: any) {
    this.allUsersSelectedOrg
      .next(this.allUsers.value.filter((el:any) => el.sectionOrOrganization === org))
  }



}
