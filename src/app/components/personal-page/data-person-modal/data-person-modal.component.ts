import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {DateService} from "../calendar-components/date.service";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../../shared/services/api.service";
import {ModalService} from "../../../shared/services/modal.service";
import {TranslateMonthPipe} from "../../../shared/pipe/translate-month.pipe";
import {RecordsBlockComponent} from "../calendar-components/current-user-data/records-block/records-block.component";
import {DataCalendarService} from "../calendar-components/data-calendar-new/data-calendar.service";
import moment from "moment";
import {FormControl, FormGroup, ReactiveFormsModule, Validators,} from "@angular/forms";
import {SuccessService} from "../../../shared/services/success.service";
import {WebSocketService} from "../../../shared/services/web-socket.service";

@Component({
  selector: 'app-data-person-modal',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateMonthPipe,
    RecordsBlockComponent,
    NgForOf,
    ReactiveFormsModule
  ],
  templateUrl: './data-person-modal.component.html',
  styleUrl: './data-person-modal.component.css'
})
export class DataPersonModalComponent implements OnInit, OnDestroy {
  constructor(
    public dateService: DateService,
    public dataCalendarService: DataCalendarService,
    public modalService: ModalService,
    public apiService: ApiService,
    public webSocketService: WebSocketService,
    public successService: SuccessService
  ) {
  }

  @Output() currentOrgHasEmployee : EventEmitter<boolean> = new EventEmitter<boolean>()
  form = new FormGroup({
    subscription: new FormControl(1),
  })
  formEmployees = new FormGroup({
    direction: new FormControl('', Validators.required),
    jobTitle: new FormControl('', Validators.required),
  })
  nameUser = 'Имя'
  roleUser = 'Роль'
  remainingFunds = 'Остаток средств'
  sectionOrOrganization = 'Секция || Организация'
  showBtnUser: boolean;
  showBtnAdmin: boolean;
  employeeCurrentOrganization: boolean;
  stateFormEmployees: boolean = false;
  showBtnAdminAndUser: boolean;
  hideBtnForCurrentAdmin: boolean;
  private destroyed$: Subject<void> = new Subject();
  currentDate = moment().format('DD.MM.YYYY');
  currentHour: any = new Date().getHours();
  blockRepeat: boolean = false;
  clickCount = 0;
  blockRecordsSelectedUser = true;
  selectedUser = this.dateService.dataSelectedUser.value;
  newUser = true;
  recAllowed = false;
  private formData: FormData;


  ngOnInit(): void {
    this.webSocketUpdateAllConnected();   //оповещение все открытые окна
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    this.selectedUser = this.dateService.allUsersSelectedOrg.value.find((us:any)=> us.id === this.dateService.dataSelectedUser.value.userId)
    this.hideBtnForCurrentAdmin = this.selectedUser.userId == this.dateService.currentUserId.value;
    this.employeeCurrentOrganization = this.selectedUser.jobTitle.length > 1
    this.recAllowed = this.selectedUser.recAllowed;
    this.roleUser = this.selectedUser.role;
    this.newUser = moment(this.selectedUser.created).add(7 ,'day') >= moment(); //если дата создания строки неделя то добавляем new в карточку клиента
    this.dataAboutSelectedUser();
    this.dataCalendarService.allEntryAllUsersInMonth
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getAllEntrySelectedUser();
      })
  }

  getAllEntrySelectedUser() {
    const allEntrySelectedUser = this.dataCalendarService.allEntryAllUsersInMonth.value
      .filter((entry: any)=>
           this.selectedUser.userId? entry.userId == this.selectedUser.userId : entry.userId == this.selectedUser.id);
    this.dateService.allEntrySelectedUserInSelectMonth.next(allEntrySelectedUser);
  }

  webSocketUpdateAllConnected() {
    this.webSocketService.socket.onmessage = (mes)=> {
      const dataParse= JSON.parse(JSON.parse(mes.data))
      //проверка нажимал ли админ на кнопку
      // if ( Object.keys(dataParse)[0] === 'recAllowed') {
        this.overwriteChangedData(dataParse)
      // }
    };
  }

  overwriteChangedData (recAllowed: any) {
    // 4 изменяем данные в исходном массиве
    const changeData: any[] = [];
    this.dateService.allUsersSelectedOrg.value.forEach((el:any)=> {
      if (el.id == this.selectedUser.id) {
        el.recAllowed = this.recAllowed = recAllowed.recAllowed
        changeData.push(el)
      } else {
        changeData.push(el)
      }
    })
    this.dateService.allUsersSelectedOrg.next(changeData)
  }

  dataAboutSelectedUser() {
    const selectedUser = this.selectedUser;
    this.selectedUser = this.dateService.allUsersSelectedOrg.value.find((el: any) =>
      selectedUser.userId? el.id == selectedUser.userId: el.id == selectedUser.id)
    this.roleUser = this.selectedUser.role === "USER"? 'Клиент' : this.selectedUser.role;
    // this.roleUser = dataSelectedUser.role === 'MAIN_ADMIN'? 'Boos' : dataSelectedUser.role;
    // this.showBtnAdminAndUser = dataSelectedUser.role === 'MAIN_ADMIN';
    if (this.showBtnAdminAndUser) {
      this.showBtnAdmin = this.showBtnUser = false;
    } else {
        this.showBtnAdmin = this.roleUser === 'Клиент';
        this.showBtnUser = this.roleUser !== 'Клиент';
    }
    this.nameUser = selectedUser.nameUser.split(' ').length === 2?
      selectedUser.nameUser : selectedUser.surnameUser + ' ' + selectedUser.nameUser;
    this.sectionOrOrganization = this.selectedUser.sectionOrOrganization;
    this.remainingFunds = this.selectedUser.remainingFunds;
    this.hideBtnForCurrentAdmin = this.selectedUser.id == this.dateService.currentUserId.value;
  }

  changeRole() {
    const selectedUser = this.selectedUser;
    this.apiService.changeRoleSelectedUser(selectedUser.id, selectedUser.idOrg)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(newRoleUser => {
        const newAllUser:any[] = [];
        this.dateService.allUsersSelectedOrg.value.forEach((el: any)=> {
          if (el.id === +selectedUser.userId) {
            el.role = newRoleUser;
          }
           newAllUser.push(el);
        })
        this.dateService.allUsersSelectedOrg.next(newAllUser)
        this.roleUser = newRoleUser
        this.showBtnAdmin = newRoleUser === 'USER';
        this.showBtnUser = newRoleUser !== 'USER';
      });
  }

  deleteSelectedRecSelectedUser(selectedRec: any) {
    this.clickCount++;
    this.blockRepeat = true;
    setTimeout(() => {
      if (this.clickCount === 1) {
        this.dateService.userCancelHimselfRec.next(0);
        this.dataCalendarService.deleteSelectedRecInAllRecBlock(selectedRec);
        setTimeout(()=>{this.dataAboutSelectedUser()}, 50)
        this.dataAboutSelectedUser();
      } else if (this.clickCount === 2) {
        return
      }
      this.clickCount = 0;
      this.blockRepeat = false;
    }, 250)
  }


  showOrHideDaysRec() {
    this.blockRecordsSelectedUser = !this.blockRecordsSelectedUser;
  }

  changeAllowed() {
    const data = {
      recAllowed: this.recAllowed,
      selectedUser: this.selectedUser
    }
    this.apiService.changeAllowed(data)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any)=>{
       this.recAllowed = data.recAllowed = data.selectedUser.recAllowed = res.allowed;
       this.refreshData();
       this.webSocketService.socket.send(JSON.stringify(data))
      })
  }

  refreshData () {
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    this.dateService.recordingDaysChanged.next(true);
  }

  submit() {
    const dataForChangeRemainingFunds = {
      idRec: this.selectedUser.idRec,
      remainingFunds: this.form.value.subscription
    }
    this.apiService.addSubscription(dataForChangeRemainingFunds)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res)=> {
        this.remainingFunds = res.changeRemain.remainingFunds
        this.refreshData();
        this.successService.localHandler(`Клиент сможет записаться ${this.form.value.subscription}  раз`);
      })
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  renameUser() {
    if (!this.selectedUser.userId) {
      this.selectedUser.userId = this.selectedUser.id;
    }
    this.modalService.currentDataAboutSelectedUser.next(this.selectedUser);
    this.modalService.openModalRenameUser();
  }

  submitAssign() {
    const dataSelectedUser = {
     userId: this.selectedUser.id,
     idOrg: this.selectedUser.idOrg,
     jobTitle: this.formEmployees.value.jobTitle,
     direction: this.formEmployees.value.direction,
    };
    this.apiService.changeJobTitleSelectedUser(dataSelectedUser)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(newJobTitleUser => {
        this.formEmployees.reset()
        this.stateFormEmployees = false;
        this.employeeCurrentOrganization = true;
        this.selectedUser.jobTitle = newJobTitleUser.jobTitle;
        this.updateData(newJobTitleUser.jobTitle, newJobTitleUser.direction );
        this.checkingOrgHasEmployees();
      });
  }


  // перезаписываем данные, при назначении или уволнение сотрудников
  updateData(newJobTitleUser: string, direction: string) {
    const newAllUser:any[] = [];
    this.dateService.allUsersSelectedOrg.value.forEach((el: any)=> {
      if (el.id === this.selectedUser.userId) {
        el.jobTitle = newJobTitleUser;
        el.direction = direction;
      }
      newAllUser.push(el);
    })
    this.dateService.allUsersSelectedOrg.next(newAllUser)
  }



  //Функция, проверит есть ли в этой организации сотрудники, чтоб показывать их или нет
  checkingOrgHasEmployees () {
      this.currentOrgHasEmployee.emit(this.dataCalendarService.checkingOrgHasEmployees());
  }

  switchFormEmployees() {
      this.stateFormEmployees = !this.stateFormEmployees;
  }

  fireFromOrg() {
    const dataId = {
      userId: this.selectedUser.id,
      orgId: this.selectedUser.idOrg
    }
    this.apiService.fireFromOrg(dataId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        this.selectedUser.jobTitle = "";
        this.employeeCurrentOrganization = false;
        this.updateData('', '')
        this.checkingOrgHasEmployees();
      })
  }

  loadFile(event: any) {
    this.createFormData(event.target.files);
  }

  private createFormData(files: FileList): void {
    this.formData = new FormData();
    this.formData.append('file', files[0], files[0].name);
    this.formData.append('userId', this.selectedUser.userId);
    this.formData.append('orgId', this.selectedUser.idOrg);
    this.postFiles();
  }

  private postFiles(): void {
    this.apiService
      .loadPhotoEmployee(this.formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res)=> {
        this.refreshData();
      })
  }
}
