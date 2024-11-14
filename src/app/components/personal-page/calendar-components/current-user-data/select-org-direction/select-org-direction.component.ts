import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {DateService} from "../../date.service";
import {AsyncPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {DataCalendarService} from "../../data-calendar-new/data-calendar.service";

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
  @Output() clickedOnEmployee: EventEmitter<boolean> = new EventEmitter<boolean>();
  btnCloseEmployee: boolean = false;
  btnHomeMenu: boolean = false;
  employees: any;
  showEmployees: boolean = true;
  private destroyed$: Subject<void> = new Subject();

  constructor(public dateService: DateService,
              public dataCalendarService: DataCalendarService,
              ) {}

  ngOnInit(): void {
    this.showEmployeesCurrentOrg();
  }


  showEmployeesCurrentOrg() {
    this.dateService.allUsersSelectedOrg
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getEmployeesList(false, null);
      })
  }

  //Функция фильтрует и показывает сотрудников организации или одного сотрудника
  getEmployeesList(employeeSelected: boolean, employeeId: string | null): void {
    this.employees = employeeSelected && employeeId?
      [this.dateService.allUsersSelectedOrg.value.find((el: any)=> el.id === employeeId)] :
      this.dateService.allUsersSelectedOrg.value.filter((el: any)=> el.jobTitle.length > 1);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


  switchDirection() {
    this.showEmployees = !this.showEmployees;
  }

  choiceEmployee(employee: any) {
    this.btnCloseEmployee = true;
    this.btnHomeMenu = true;
    this.clickedOnEmployee.emit(true);
    this.getEmployeesList(true, employee.id);
    this.dateService.idSelectedOrg.next(employee.idRec);
    // this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization(true);
  }

  returnToOrg() {
    this.btnCloseEmployee = false;
    this.btnHomeMenu = false;
    this.clickedOnEmployee.emit(false);
    this.getEmployeesList(false, null);
    this.dataCalendarService.routerLinkMain(false);
  }

  returnToOrgAndCloseEmployees() {
    this.returnToOrg();  // делает тоже что и returnToOrg тока еще прячет сотрудников
    this.showEmployees = true;
  }
}
