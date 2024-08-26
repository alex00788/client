import {Component, OnDestroy, OnInit} from '@angular/core';
import {Week} from "../../../../shared/interfaces";
import {DateService} from "../date.service";
import moment from "moment";
import {NgForOf} from "@angular/common";
import {MomentTransformDatePipe} from "../../../../shared/pipe/moment-transform-date.pipe";
import {Subject, takeUntil} from "rxjs";
import {RecordingService} from "../recording.service";
import {DataCalendarService} from "../data-calendar-new/data-calendar.service";

@Component({
  selector: 'app-body-calendar',
  standalone: true,
  imports: [
    NgForOf,
    MomentTransformDatePipe
  ],
  templateUrl: './body-calendar.component.html',
  styleUrl: './body-calendar.component.css'
})
export class BodyCalendarComponent implements OnInit, OnDestroy{
  constructor(
    public recordingService: RecordingService,
    public dataCalendarService: DataCalendarService,
    public dateService: DateService) {
  }
  private destroyed$: Subject<void> = new Subject();
  calendar: Week[] = []

  ngOnInit(): void {
    //подписываемся на нажатие в верхнем компоненте при переключении месяца
    this.dateService.date
      .pipe(takeUntil(this.destroyed$))
      .subscribe(this.generate.bind(this))
  }

  //функция создающая календарь
  private generate(now: moment.Moment) {
    // границы календаря
    const startDay = now.clone().startOf('month').startOf('week')
                              //  startOf чтобы момент переключился на старт месяца... тоже для недели
    const endDay = now.clone().endOf('month').endOf('week')

    // переменная чтоб трекать цикл
    const date = startDay.clone()  // .subtract(1, 'day')  - вычет 1 дня ... начнет неделю с воскресения


    const calendar = []   //  привяжем к переменной созданной вначале чтобы не перерисовывать компонент много раз

    while (date.isBefore(endDay, 'day')) {          // будет идти до последнего дня
      calendar.push({
        days: Array(7)                                     //  генерим пустой массив из 7 дней тк неделя
          .fill(0)                                              //  заполняем его 0
          .map(() => {                                                //  и далее приводим к нужному формату
            const value = date.add(1, 'day').clone()
            const active = moment().isSame(value, 'date')  //moment текущ дата ... isSame сравниваем занчение value  по date
            const disabled = !now.isSame(value, 'month')   // now- это текущий месяц, если он не совпадает со значением value  то его блокируем
            const selected = now.isSame(value, 'date')
            return {
              value, active, disabled, selected
            }
          })
      })
    }
    this.calendar = calendar;
  }

  //метод, который при клике по дате, будет ее выбирать
  select(day: moment.Moment) {
      this.dateService.changeDay(day)
      this.recordingService.openRecordsBlock()
      this.dateService.recordingDaysChanged.next(true);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
