import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {DateService} from "../../date.service";
import {AsyncPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-select-org-direction',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './select-org-direction.component.html',
  styleUrl: './select-org-direction.component.css'
})
export class SelectOrgDirectionComponent implements OnInit, OnDestroy{
  @Output() adminClickedOnEmployee: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() hidePhotoOrg: EventEmitter<boolean> = new EventEmitter<boolean>()
  hideForAdmins: boolean = false;
  hideForUsers: boolean = false;
  showBtnForReturnToOrg: boolean = false;
  employees: any;
  showEmployees: boolean = true;
  private destroyed$: Subject<void> = new Subject();

  constructor(public dateService: DateService,) {}

  ngOnInit(): void {
    this.showEmployeesCurrentOrg();
    this.resetBtnToInitialState();
  }


  showEmployeesCurrentOrg() {
    this.dateService.allUsersSelectedOrg
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.showEmployees = true;
        this.showBtnForReturnToOrg = false;
        this.employees = this.dateService.allUsersSelectedOrg.value.filter((el: any)=> el.jobTitle.length > 1)
      })
  }


  showAgainEmployeesCurrentOrg() {
    this.hidePhotoOrg.emit(true);
    this.adminClickedOnEmployee.emit(true);
    this.hideForAdmins = false;
    this.hideForUsers = false;
    this.showBtnForReturnToOrg = false;
    this.employees = this.dateService.allUsersSelectedOrg.value.filter((el: any)=> el.jobTitle.length > 1)
  }


  //если выбрано направление и пользователь нажал переключение организации сначала включаются кнопки потом переход
  resetBtnToInitialState() {
    this.dateService.switchOrg
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.returnToOrg();
      })
  }


  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


  switchDirection() {
    this.showEmployees = !this.showEmployees;
  }

  choiceEmployee(employee: any) {
    console.log('77', employee)
    this.hidePhotoOrg.emit(false)
    this.hideForUsers = true;
    this.hideForAdmins = true;
    this.employees = [this.dateService.allUsersSelectedOrg.value.find((el: any)=> el.id === employee.id)]
    if (this.dateService.currentUserIsTheAdminOrg.value) {
      this.adminClickedOnEmployee.emit(false);
      this.showBtnForReturnToOrg = true;
    }
  }


  returnToOrg() {
    this.hidePhotoOrg.emit(true);
    if (this.dateService.currentUserIsTheAdminOrg.value) {
      this.adminClickedOnEmployee.emit(true);
      this.hideForAdmins = false;
      this.showBtnForReturnToOrg = false;
      this.showEmployees = true;
      this.employees = this.dateService.allUsersSelectedOrg.value.filter((el: any)=> el.jobTitle.length > 1)
    }
  }
}
