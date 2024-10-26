import {Component, OnDestroy, OnInit} from '@angular/core';
import {DateService} from "../../date.service";
import {AsyncPipe, NgForOf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-select-org-direction',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './select-org-direction.component.html',
  styleUrl: './select-org-direction.component.css'
})
export class SelectOrgDirectionComponent implements OnInit, OnDestroy{
  employees: any;
  private destroyed$: Subject<void> = new Subject();

  constructor(public dateService: DateService,) {}

  ngOnInit(): void {
    this.showEmployeesCurrentOrg();
  }


  showEmployeesCurrentOrg() {
    this.dateService.allUsersSelectedOrg
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.employees = this.dateService.allUsersSelectedOrg.value.filter((el: any)=> el.jobTitle.length > 1)
      })
  }


  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


}
