import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalService} from "../../../shared/services/modal.service";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../../shared/services/api.service";
import {SuccessService} from "../../../shared/services/success.service";
import {DataCalendarService} from "../calendar-components/data-calendar-new/data-calendar.service";
import {DateService} from "../calendar-components/date.service";

@Component({
  selector: 'app-modal-rename',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './modal-rename.component.html',
  styleUrl: './modal-rename.component.css'
})
export class ModalRenameComponent implements OnInit, OnDestroy{
  constructor(
    public apiService: ApiService,
    public dateService: DateService,
    public successService: SuccessService,
    public dataCalendarService: DataCalendarService,
    public modalService: ModalService) {}

  private destroyed$: Subject<void> = new Subject();
  formRename = new FormGroup({
    newNameUser: new FormControl(this.modalService.currentDataAboutSelectedUser.value.nameUser, Validators.required),
    newSurnameUser: new FormControl(this.modalService.currentDataAboutSelectedUser.value.surnameUser, Validators.required),
  })


  ngOnInit(): void {
  }

  renameUser() {
    const userId = this.modalService.currentDataAboutSelectedUser.value.userId
    const newName = this.formRename.value.newNameUser
    const newSurname = this.formRename.value.newSurnameUser
    const dataForRename = {userId, newName, newSurname}
    this.apiService.renameUser(dataForRename)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.modalService.closeModalRenameUser();
        this.modalService.close();
        this.refreshData()
        this.successService.localHandler(res.message);
      })
  }

  refreshData () {
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    this.dateService.recordingDaysChanged.next(true);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


}
