import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {PersonalBlockService} from "../personal-page/calendar-components/personal-block.service";
import {DateService} from "../personal-page/calendar-components/date.service";
import {Subject, takeUntil} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {ApiService} from "../../shared/services/api.service";
import {SuccessService} from "../../shared/services/success.service";

@Component({
  selector: 'app-rename-org',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe
  ],
  templateUrl: './rename-org.component.html',
  styleUrl: './rename-org.component.css'
})
export class RenameOrgComponent implements OnInit, OnDestroy{
  constructor(
              public personalBlockService: PersonalBlockService,
              public dateService: DateService,
              public successService: SuccessService,
              public apiService: ApiService,
              ) {}
  private destroyed$: Subject<void> = new Subject();
  @Output() nameOrgChanged = new EventEmitter();
  renameForm = new FormGroup({
    nameOrg: new FormControl(this.dateService.currentOrg.value, Validators.required),
  })



  ngOnInit(): void {
  }


  renameOrg() {
    const orgId = this.dateService.idSelectedOrg.value
    const newNameOrg = this.renameForm.value.nameOrg
    const dataForRenameOrg = {orgId, newNameOrg}
    this.apiService.renameSelectedOrg(dataForRenameOrg)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.personalBlockService.closeWindowRenameOrg();
        this.nameOrgChanged.emit();
        this.successService.localHandler('Организация переименована');
      })
  }


  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


}
