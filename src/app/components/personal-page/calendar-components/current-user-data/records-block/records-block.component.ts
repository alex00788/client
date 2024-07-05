import {Component, OnInit} from '@angular/core';
import {PersonalBlockService} from "../../personal-block.service";
import {DateService} from "../../date.service";
import {TranslateMonthPipe} from "../../../../../shared/pipe/translate-month.pipe";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../../../../shared/services/api.service";
import {DataCalendarService} from "../../data-calendar-new/data-calendar.service";
import moment from "moment/moment";
import {InfoBlockComponent} from "../../info-block/info-block.component";
import {ReductionPipe} from "../../../../../shared/pipe/reduction.pipe";
import {ReductionAddressPipe} from "../../../../../shared/pipe/reduction-address.pipe";
import {ModalService} from "../../../../../shared/services/modal.service";

@Component({
  selector: 'app-records-block',
  standalone: true,
  imports: [
    TranslateMonthPipe,
    NgForOf,
    NgIf,
    AsyncPipe,
    InfoBlockComponent,
    ReductionPipe,
    ReductionAddressPipe
  ],
  templateUrl: './records-block.component.html',
  styleUrl: './records-block.component.css'
})
export class RecordsBlockComponent implements OnInit{
  constructor(
    public personalBlockService: PersonalBlockService,
    public dateService: DateService,
    public modalService: ModalService,
    public dataCalendarService: DataCalendarService,
    public apiService: ApiService,
  ) {}
  private destroyed$: Subject<void> = new Subject();
  clickCount = 0;
  blockRepeat: boolean = false;
  showBtnFilter: boolean = true;
  currentDate: any;
  currentHour: any = new Date().getHours();
  currentTime = '';



  ngOnInit(): void {
    const d = new Date();   // показывает сегодняшнюю дату
    this.currentTime = ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear()

    this.currentDate = moment().format('DD.MM.YYYY');
    this.recordingDaysChanged();

    this.dateService.date
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=>{
        this.dataCalendarService.showAllRec();
        this.dataCalendarService.filterRecCurrentUserByDate();
      })
  }

  // функция обновляет блок показывающий когда записан пользователь...как только пользователь запишется или отпишется
  recordingDaysChanged() {
    this.dateService.recordingDaysChanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=>{
        this.dataCalendarService.getAllEntryCurrentUsersThisMonth();
      })
  }



  //удаление записи ...в блоке всех записей ...
  deleteSelectedRec(selectedRec: any) {
    this.blockRepeat = true;
    this.clickCount++;
    setTimeout(() => {
      if (this.clickCount === 1) {
        this.dataCalendarService.deleteSelectedRecInAllRecBlock(selectedRec);
        this.dateService.userCancelHimselfRec.next(1);
      } else if (this.clickCount === 2) {
        return
      }
      this.clickCount = 0;
      this.blockRepeat = false;
    }, 250)
  }


  dataAboutRec(entry: any) {
    this.dateService.dataAboutSelectedRec.next(entry)
    this.modalService.open();
    this.modalService.openRecordsBlockWithData()
  }

  openFilterBtn() {
    this.showBtnFilter = !this.showBtnFilter;
  }

  changeDay(num: number) {
      this.dateService.changeOneDay(num)
      this.dataCalendarService.getAllEntryAllUsersForTheMonth()
  }
}
