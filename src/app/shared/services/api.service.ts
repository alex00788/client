import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {ErrorResponseService} from "./error.response.service";
import {ModalService} from "./modal.service";

@Injectable({providedIn: "root",})

export class ApiService {

  // token:UserData;
  constructor(
    private http: HttpClient,
    public modalService: ModalService,
    private errorResponseService: ErrorResponseService
  ) {}

  //перехват и показ ошибки
  public errHandler(err: HttpErrorResponse) {
    if (err.error?.message === 'Пользователь с таким email уже существует') {
      this.modalService.registrationError.next(true); //показываем кнопку для сброса регистрации
    }
    if (err.error?.message === 'Указан неверный пароль') {
      this.modalService.rememberPas.next(true); //показываем кнопку для напоминания
    }
    if (!err.error?.message) {
      this.errorResponseService.localHandler('ошибка при запросе на серв')
      return throwError(() => err)
    } else {
      this.errorResponseService.handler(err.error?.message)
      return throwError(() => err.error?.message)
    }
  }



  //хранение токена в локал стораж
  //достаем токен из ответа сервера и сохраняем в локалстораж + время жизни токена
  private setToken(response: any) {
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000).getTime()
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('tokenExp', expDate.toString())
      localStorage.setItem('userData', JSON.stringify(response.user))
    } else {
      localStorage.clear();
    }
  }

  // проверка что время жизни токена не истекло
  get token(): any {
    const expDate = localStorage.getItem('tokenExp')
    if (expDate) {
      if (new Date().getTime() > +expDate) {
        this.logout();                                          //если время истекло, выходим из системы, чистим localStorage
        return null;
      }
    }
    return localStorage.getItem('accessToken');           // если все ок, возвращаем токен
  }

  registration(user: any): Observable<any> {
    return this.http.post<any>('/api/user/registration', user)
      .pipe(
        tap(this.setToken),                                              // устанавливает токен в localStorage
        catchError(this.errHandler.bind(this)),
      )
  }


  registerAgain(data: any) {
    return this.http.put<any>('/api/user/registerAgain', data )
      .pipe(catchError(this.errHandler.bind(this)))
  }


  login(user: any): Observable<any> {
    return this.http.post<any>('/api/user/login', user)
      .pipe(
        tap(this.setToken),
        catchError(this.errHandler.bind(this)),
      )
  }

  logout() {
    this.setToken(null)
  }

  isAuthenticated() {
    // если есть токен то return true
    return !!this.token
  }


  //отправка мне запросов на доработку
  sendInSupport(text: any): Observable<any> {
    return this.http.post<any>('/api/user/sendInSupport', text)
      .pipe(
        catchError(this.errHandler.bind(this)),
      )
  }

  //отправка pas на почту пользователя
  rememberPas(email: any): Observable<any> {
    return this.http.post<any>('/api/user/rememberPas', {email})
      .pipe(catchError(this.errHandler.bind(this)))
  }


  getAllEntryAllUsersOrg(dataForGetAllEntryAllUs: any): Observable<any> {
    return this.http.get<any>('/api/user/getAllEntryAllUsers', {
      params: new HttpParams()
        .append('month', dataForGetAllEntryAllUs.month)
        .append('year', dataForGetAllEntryAllUs.year)
        .append('org', dataForGetAllEntryAllUs.org)
        .append('orgId', dataForGetAllEntryAllUs.orgId)
        .append('userId', dataForGetAllEntryAllUs.userId)
    })
      .pipe(catchError(this.errHandler.bind(this)))
  }

//эндпоинт для отправки фоток на сервер
  loadPhotoEmployee(formData: any): Observable<any> {
    return this.http.post<any>('/api/user/loadPhotoEmployee', formData)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  //эндпоинт для отправки logo-фоток-org на сервер
  loadPhotoLabelOrg(formData: any): Observable<any> {
    return this.http.post<any>('/api/user/loadPhotoLabelOrg', formData)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  getAllEntryCurrentUser(dataForGetAllEntryCurrentUsersThisMonth: any): Observable<any> {
    return this.http.get<any>('/api/user/getAllEntryCurrentUser', {
      params: new HttpParams()
        .append('month', dataForGetAllEntryCurrentUsersThisMonth.month)
        .append('year', dataForGetAllEntryCurrentUsersThisMonth.year)
        .append('userId', dataForGetAllEntryCurrentUsersThisMonth.userId)
    })
      .pipe(catchError(this.errHandler.bind(this)))
  }


  getAllOrgFromDb(): Observable<any> {
    return this.http.get<any>('/api/user/getAllOrg')
      .pipe(catchError(this.errHandler.bind(this)))
  }


  getAllEntryInCurrentTimes(dateAndTimeRec: any): Observable<any> {
    return this.http.get<any>('/api/user/getAllEntryInCurrentTimes', {
      params: new HttpParams().append('dateRec', dateAndTimeRec.dateRec).append('timeRec', dateAndTimeRec.timeRec)
    })
      .pipe(catchError(this.errHandler.bind(this)))
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>('/api/user/getAllUsers')
      .pipe(catchError(this.errHandler.bind(this)))
  }

  getAllUsersCurrentOrganization (idOrg: any, userId:any, employee: boolean, clickedByAdmin: boolean): Observable<any> {
    return this.http.get<any>('/api/user/getAllUsersCurrentOrganization', {
      params: new HttpParams()
        .append('idOrg', idOrg)
        .append('userId', userId)
        .append('employee', employee)
        .append('clickedByAdmin', clickedByAdmin)
    })
      .pipe(catchError(this.errHandler.bind(this)))
  }


  getPhoneClient(userId: any): Observable<any> {
    return this.http.get<any>('/api/user/getPhoneClient', {
      params: new HttpParams()
        .append('userId', userId)
    })
      .pipe(catchError(this.errHandler.bind(this)))
  }


  addEntry(newUserAccount: any): Observable<any> {
    return this.http.post<any>('/api/user/addEntry', newUserAccount)
    .pipe(catchError(this.errHandler.bind(this)))
  }


  changeWorkStatusChoiceTime(data: any): Observable<any> {
    return this.http.post<any>('/api/user/changeWorkStatus', data)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  setSettings(newSettings: any): Observable<any> {
    return this.http.post<any>('/api/user/setSettings', newSettings)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  addNewOrganization(newOrgData: any): Observable<any> {
    return this.http.post<any>('/api/user/addOrg', newOrgData)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  addNewOrgSend(newOrgData: any): Observable<any> {
    return this.http.post<any>('/api/user/addNewOrg', newOrgData)
      .pipe(catchError(this.errHandler.bind(this)))
  }



  deleteEntry(idRec: any, userId: any, orgId: any, userCancelHimselfRec: any, workStatus: any): Observable<any> {
    return this.http.delete<any>('/api/user/deleteEntry/' + idRec + '/' + userId + '/' + orgId + '/' + userCancelHimselfRec + '/' + workStatus)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  deleteTestData(email: any): Observable<any> {
    return this.http.delete<any>('/api/user/deleteTestData/' + email)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  changeRoleSelectedUser(userId: any, idOrg: any) : Observable<any> {
    const dataId = {userId, idOrg}
    return this.http.post<any>('/api/user/changeRole' , dataId)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  changeJobTitleSelectedUser(data: any) : Observable<any> {
    return this.http.post<any>('/api/user/changeJobTitle' , data)
      .pipe(catchError(this.errHandler.bind(this)))
  }

  fireFromOrg(dataId: any) {
    return this.http.put<any>('/api/user/fireFromOrg', dataId )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  resendLink(email: any) : Observable<any> {
    return this.http.post<any>('/api/user/resendLink', email )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  clearTableRec(date: any): Observable<any> {
    return this.http.post<any>('/api/user/clearTableRec', date )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  changeAllowed(data: any) {
    return this.http.post<any>('/api/user/changeAllowed', data )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  addSubscription(data: { idRec: any; remainingFunds: number | null | undefined }) {
    return this.http.post<any>('/api/user/addSubscription', data )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  renameUser(data: any) {
    return this.http.put<any>('/api/user/renameUser', data )
      .pipe(catchError(this.errHandler.bind(this)))
  }

  renameSelectedOrg(data: any) {
    return this.http.put<any>('/api/user/renameOrg', data )
      .pipe(catchError(this.errHandler.bind(this)))
  }
}
