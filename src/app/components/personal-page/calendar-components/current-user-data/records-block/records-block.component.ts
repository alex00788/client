import {Component, OnInit} from '@angular/core';
import {PersonalBlockService} from "../../personal-block.service";
import {DateService} from "../../date.service";
import {TranslateMonthPipe} from "../../../../../shared/pipe/translate-month.pipe";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../../../../shared/services/api.service";
import {DataCalendarService} from "../../data-calendar-new/data-calendar.service";
import moment from "moment/moment";

@Component({
  selector: 'app-records-block',
  standalone: true,
  imports: [
    TranslateMonthPipe,
    NgForOf,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './records-block.component.html',
  styleUrl: './records-block.component.css'
})
export class RecordsBlockComponent implements OnInit{
  constructor(
    public personalBlockService: PersonalBlockService,
    public dateService: DateService,
    public dataCalendarService: DataCalendarService,
    public apiService: ApiService,
  ) {}
  private destroyed$: Subject<void> = new Subject();
  clickCount = 0;
  blockRepeat: boolean = false;
  currentDate: any;
  currentHour: any = new Date().getHours();



  ngOnInit(): void {
    this.currentDate = moment().format('DD.MM.YYYY');
    this.recordingDaysChanged();
  }

  // функция обновляет блок показывающий когда записан пользователь
  recordingDaysChanged() {
    this.dateService.recordingDaysChanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=>{
        this.openRecordsBlock();         // как только пользователь запишется или отпишется
      })                                 // обновим блок в котором видны все записи за месяц
  }

  openRecordsBlock() {
    const dataForGetAllEntrySelectedMonth = {
      org: this.dateService.sectionOrOrganization.value,
      month: this.dateService.date.value.format('MM'),
      year: this.dateService.date.value.format('YYYY'),
      userId: this.dateService.currentUserId.value
    }
    this.getAllEntryCurrentUserInSelectedMonth(dataForGetAllEntrySelectedMonth);
  }

  //Возмет с бека все записи текущей пользователя за выбранный месяц
  getAllEntryCurrentUserInSelectedMonth(dataForGetAllEntry:any) {
    this.apiService.getAllEntryCurrentUserInMonth(dataForGetAllEntry)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allEntryInMonth => {
        this.dateService.allEntryCurUserInSelectMonth.next(allEntryInMonth)
      });
  }




  //удаление записи ...в блоке всех записей ...
  deleteSelectedRec(selectedRec: any) {
    this.blockRepeat = true;
    this.clickCount++;
    setTimeout(() => {
      if (this.clickCount === 1) {
        this.apiService.deleteEntry(selectedRec.id, selectedRec.userId)
          .pipe(takeUntil(this.destroyed$))
          .subscribe(() => {
            this.dateService.remainingFunds.next(JSON.stringify(+this.dateService.remainingFunds.value + 1))
            this.dateService.recordingDaysChanged.next(true);
            const newAllUsers: any[] = []
            this.dateService.allUsersSelectedOrg.value.forEach((el: any) => {
              if ((el: any) => el.id === this.dateService.currentUserId.value) {
                el.remainingFunds = this.dateService.remainingFunds.value
              }
              newAllUsers.push(el)
            })
            this.dateService.allUsersSelectedOrg.next(newAllUsers)
            this.dateService.blockRecIfRecorded.next(false);
            this.dataCalendarService.getAllEntryAllUsersForTheMonth();
          })
      } else if (this.clickCount === 2) {
        return
      }
      this.clickCount = 0;
      this.blockRepeat = false;
    }, 250)
  }



}
