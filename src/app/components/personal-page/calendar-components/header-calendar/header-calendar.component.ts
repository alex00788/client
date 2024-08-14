import {Component, OnDestroy, OnInit} from '@angular/core';
import {DateService} from "../date.service";
import {AsyncPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {MomentTransformDatePipe} from "../../../../shared/pipe/moment-transform-date.pipe";
import {ReactiveFormsModule,} from "@angular/forms";
import {DataCalendarService} from "../data-calendar-new/data-calendar.service";

@Component({
  selector: 'app-header-calendar',
  standalone: true,
  imports: [
    AsyncPipe,
    MomentTransformDatePipe,
    DatePipe,
    NgIf,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './header-calendar.component.html',
  styleUrl: './header-calendar.component.css'
})
export class HeaderCalendarComponent implements OnInit, OnDestroy {

  constructor(
    public dateService: DateService,
    public dataCalendarService: DataCalendarService,
  ) {
  }

  subInterval: any;
  hours: any = new Date().getHours();
  min: any = new Date().getMinutes();
  sec: any = new Date().getSeconds();
  currentTime = '';
  dataSettings: any;

  ngOnInit(): void {
    // this.watchOnPage();   //показ и запуск часов
  }

  go(direction: number) {
    this.dateService.changeMonth(direction)
    this.dataCalendarService.getAllEntryAllUsersForTheMonth()
  }


  //часы показывающие текущее время
  watchOnPage() {
    this.subInterval = setInterval(() => {
      this.hours = new Date().getHours();
      this.min = new Date().getMinutes();
      this.sec = new Date().getSeconds();
      this.hours = this.hours > 9 ? this.hours : "0" + this.hours;
      this.min = this.min > 9 ? this.min : "0" + this.min;
      this.sec = this.sec > 9 ? this.sec : "0" + this.sec;
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.subInterval);
  }
}
