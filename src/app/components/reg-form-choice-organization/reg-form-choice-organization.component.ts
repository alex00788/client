import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ModalService} from "../../shared/services/modal.service";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../shared/services/api.service";
import {FormsModule} from "@angular/forms";
import {FilterOrgPipe} from "../../shared/pipe/filter-org.pipe";
import {DateService} from "../personal-page/calendar-components/date.service";

@Component({
  selector: 'app-reg-form-choice-organization',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    FilterOrgPipe,
    AsyncPipe,
    NgIf,
    NgClass
  ],
  templateUrl: './reg-form-choice-organization.component.html',
  styleUrl: './reg-form-choice-organization.component.css'
})
export class RegFormChoiceOrganizationComponent implements OnInit, OnDestroy {
  @Output() idOrg: EventEmitter<any> = new EventEmitter<any>()
  @Output() nameSelectedOrg: EventEmitter<any> = new EventEmitter<any>()
  constructor(
              private apiService: ApiService,
              public modalService: ModalService,
              public dateService: DateService,
              ) {
  }
  private destroyed$: Subject<void> = new Subject();
  searchOrg = '';
  allOrgForReset: any[] = []


  ngOnInit(): void {
    this.getAllOrganizationFromTheDatabase();
  }

  getAllOrganizationFromTheDatabase() {
      this.apiService.getAllOrgFromDb()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(org=> {
          this.allOrgForReset = org.allOrg;
        })
  }

  choiceOrg(org: any) {
    this.idOrg.emit(org.id)
    this.nameSelectedOrg.emit(org.name)
    this.modalService.openRegistrationForm();
  }

  openLoginPage() {
    this.modalService.openLoginForm();
  }

  addNewOrg() {
    this.modalService.openFormAddNewOrg();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
