import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import moment from "moment";
import {DataCalendarService} from "./data-calendar.service";
import {DateService} from "../date.service";
import {Subject, takeUntil, throwError} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from "../../../../shared/services/api.service";
import {RecordingService} from "../recording.service";
import {FormsModule, ReactiveFormsModule,} from "@angular/forms";
import {FilterClientListPipe} from "../../../../shared/pipe/filter-client-list.pipe";
import {ModalService} from "../../../../shared/services/modal.service";
import {ErrorResponseService} from "../../../../shared/services/error.response.service";

@Component({
  selector: 'app-data-calendar-new',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FilterClientListPipe
  ],
  templateUrl: './data-calendar-new.component.html',
  styleUrl: './data-calendar-new.component.css'
})
export class DataCalendarNewComponent implements OnInit {
  constructor(
    public dataCalendarService:DataCalendarService,
    public dateService: DateService,
    public recordingService: RecordingService,
    public apiService: ApiService,
    public modalService: ModalService,
    private errorResponseService: ErrorResponseService
  ) {  }

  @ViewChild('inputElement') inputElementRef: ElementRef;
  private destroyed$: Subject<void> = new Subject();
  currentDate: any;
  clickCount = 0;
  dataOfWeek: any[] = [];
  clientList = '';
  selectedPersonId:any;
  newEntryHasBeenOpenedTime: any;
  newEntryHasBeenOpenedDate: any;
  blockIfRecorded = false;
  currentDayCheck: boolean = false;
  pastDateIsBlocked: boolean = false;
  recordComplete: boolean = false;
  currentHour: any = new Date().getHours();
  state = 'closed'

  // form = new FormGroup({
  //   newEntry: new FormControl(null, Validators.required),
  // })

  ngOnInit(): void {
    this.currentDate = moment().format('DD.MM.YYYY');
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();

    this.dateService.date
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getDataOrg();
    })
    this.dateService.changedSettingsOrg
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getDataOrg();
    })
    this.recordingService.showCurrentDay
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getDataOrg();
      })
    this.recordingService.showCurrentWeek
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getDataOrg();
      })
    this.recordingService.showCurrentMonth
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.getDataOrg();
      })
  }


  getDataOrg() {
    //как тока приходит все записи с бек... формируем массив для показа дня недели или месяца
    this.dataCalendarService.allEntryAllUsersInMonth
      .pipe(takeUntil(this.destroyed$))
      .subscribe(persons => {
        if (persons) {
          const currentWeek = this.formativeShowWeek(this.dateService.date.value)
          const currentMonth = this.formativeShowMonth(this.dateService.date.value)

          if (this.recordingService.showCurrentWeek.value) {
            this.getArrayOfDays(persons, currentWeek) //собираем массив дней недели и тех кто записан в эти дни и сохраняем в переменной.
            this.dataOfWeek = this.resultingArrayFormingTheWeek(currentWeek);
          }
          if (this.recordingService.showCurrentDay.value) {
            this.getArrayOfDays(persons, currentWeek) //собираем массив дней недели и тех кто записан в эти дни и сохраняем в переменной.
            const findSelectDay = this.resultingArrayFormingTheWeek(currentWeek)
              .find((el: any)=> el.date === this.dateService.date.value.format('DD.MM.YYYY'))
            this.dataOfWeek = [findSelectDay];
          }
          if (this.recordingService.showCurrentMonth.value) {
            this.getArrayOfDays(persons, currentMonth) //собираем массив дней недели и тех кто записан в эти дни и сохраняем в переменной.
            this.dataOfWeek = this.resultingArrayFormingTheWeek(currentMonth);
          }
        }
      })
  }



  //функция формирующая показ месяца
  formativeShowMonth(currentDate: any) {
    const m = moment(currentDate);
    const currentMonth: any[] = [];
    // let firstDay = m.clone().startOf('month').format('DD-MM-YYYY'); // Отмечаем начало месяца!
    let lastDay = m.clone().endOf('month').format('DD-MM-YYYY'); // Установим конец месяца!
    const quantityDays = lastDay.substring(0, 2);
    for (let i = 0; i < +quantityDays; i++) {
      currentMonth.push(m.clone().startOf('month').add(i, 'd').format('DD.MM.YYYY'))
    }
    return currentMonth;
  }


//функция формирующая показ недели
  formativeShowWeek(date: moment.Moment) {
    let currentWeek: any[] = []
                                                         // const currentTime = moment();   // текущая дата
    const m = moment(date);              // получаем, текущей датой ту, по которой кликнули
    const day = m.format('dd');            // 'dd' покажет название дня... а так -> 'DD' покажет число

    const daysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']  // для расчета индекса выбр дня... чтоб показать в 1ю или последнюю нед тока даты текущ месяцп
    const lastDayMonth = m.clone().endOf('month');
    const firstDayMonth = m.clone().startOf('month');
    const lastDayFirstWeekMonth =
      day === 'Su'?  m.clone().startOf('month').startOf("week")
      : m.clone().startOf('month').startOf("week").add(7,'day');
    const firstDayLastWeekMonth = m.clone().endOf('month').startOf("week").add(1,'day');
    const indexLastDay = daysName.indexOf(lastDayMonth.format('dd')) + 1;
    const indexFirstDay = daysName.indexOf(firstDayMonth.format('dd'));


    for (let i = 1; i <= 7; i++) {
      if (day === 'Su' ) {
        const newM = m.clone().subtract(1, 'd')       // то убираем 1 день чтоб неделя не перескакивала
        currentWeek.push(newM.clone().startOf('w').add(i, 'd').format('DD.MM.YYYY'))
      } else {
        currentWeek.push(m.clone().startOf('w').add(i, 'd').format('DD.MM.YYYY'))
      }
    }

    if (lastDayMonth.format('dd') !== "Su") {                  //последний день месяца не воскресение
      if (firstDayLastWeekMonth < this.dateService.date.value) {      // выбрана последняя неделя месяца
        if (this.recordingService.showCurrentWeek.value) {            // нажата кнопка показ недели
          currentWeek = currentWeek.splice(0, indexLastDay) ;   // показ тока дней текущ месяца   тк с бека приходят тока занные за текущ месяц
        }
      }
    }

    if (firstDayMonth.format('dd') !== "Mo") {             //если 1-й день месяца не понедельник
      // если выбранная дата (меньше< чем) последний день первой недели = значит выбрана первая неделя месяца
      if (this.dateService.date.value.format('DD.MM.YYYY') <  lastDayFirstWeekMonth.format("DD.MM.YYYY")) {
        if (this.recordingService.showCurrentWeek.value) {       //если нажата кнопка показ недели
          currentWeek = currentWeek.slice(indexFirstDay) ;       // показываем только дни текущ месяца
        }
      }
    }

    return currentWeek
  }



  getArrayOfDays (persons: any , currentWeek: any) {
    const result: any[] = [];
    const sortOnDate = persons.sort((a: any, b: any) => a.dateNum > b.dateNum ? 1 : -1);
    for(let i = 0; i < currentWeek.length; i++) {
      const usersArr: any[] = [];
      sortOnDate.forEach((el: any)=> {
        if (el.date === currentWeek[i]) {
          usersArr.push(el)
        }
      })
      result.push({date: currentWeek[i], users: usersArr})
    }
    this.dataCalendarService.arrayOfDays.next(result);
  }


  resultingArrayFormingTheWeek(currentWeek: any) {
    const res: any[] = [];
    for (let i = 0; i < currentWeek.length; i++) {
      let times = this.getAllRecOnThisWeek(currentWeek).filter((el:any)=> el.date === currentWeek[i])
      res.push({date: currentWeek[i], times })
    }
    return this.getArrayOfDaysFromTheRequiredHours(res);
  }


  getArrayOfDaysFromTheRequiredHours(week: any[]) {
    const addSetTime: any[] = []
    week.forEach((el:any)=> {
      if (el.times.length) {
        addSetTime.push(el)
      } else {
        let times: any[] = [];
        // times.push({date: el.date, time: '18', users: [] })    // было сделано чтоб хоть что то показывалось пользователю для записи
        addSetTime.push({date: el.date, times})
      }
    })
    return this.checkingTheSetTime(this.sortingByTime(addSetTime));
  }


  sortingByTime(sortTime: any[]) {
    sortTime.forEach((el:any)=> {
      el.times.sort((a: any, b: any) => a.time > b.time ? 1 : -1);
    })
    return sortTime
  }


  checkingTheSetTime(addSetTime: any) {
    addSetTime.forEach((el:any) => {
      const newRecTime: any[] = [];
      for (let i = this.dateService.timeStartRecord.value; i <= this.dateService.timeFinishRecord.value; i++) {
        newRecTime.push({date: el.date, time: JSON.stringify(+i), workStatus: 'open', users: []})
      }
      const result:any[] = []
      newRecTime.forEach((setTime: any)=> {
      const replaceEl = el.times.find((el: any)=> el.time === setTime.time);
        if (replaceEl) {
          result.push(replaceEl)
        } else {
          result.push(setTime)
        }
      })

      el.times.forEach((curTime: any)=>{
        if (curTime.time > this.dateService.timeFinishRecord.value) {
           result.push(curTime)
        }
        if (curTime.time < this.dateService.timeStartRecord.value) {
           result.unshift(curTime)
        }
      })

      result.sort((a: any, b: any) => +a.time > +b.time ? 1 : -1)
        el.times = result;
      })

    return addSetTime
  }





// получаем тока день когда есть запись и отсортированный список пользователей на каждый час
  getAllRecOnThisWeek(currentWeek: any[]) {
    let usOnThisDay: any[] = [];
    let workStatus = '';
    for (let i= 0; i < currentWeek.length; i++) {
      this.dataCalendarService.arrayOfDays.value.forEach((el:any)=> {
        if ( currentWeek[i] === el.date && el.users.length ) {
          let recordingTimeOnThisDay = [...new Set(this.dataCalendarService.arrayOfDays.value[i].users.map((el:any)=> el.time))];
          for (let ni = 0 ; ni < recordingTimeOnThisDay.length; ni++) {
            workStatus = this.dataCalendarService.arrayOfDays.value[i].users.find((status: any)=> status.time === recordingTimeOnThisDay[ni]).workStatus
            const usOnThisTime = this.dataCalendarService.arrayOfDays.value[i].users.filter((usOnThisTime: any)=> {
              return usOnThisTime.time === recordingTimeOnThisDay[ni]
            })
            usOnThisDay.push({date: currentWeek[i], time: recordingTimeOnThisDay[ni], workStatus, users: usOnThisTime})
          }
        }
      })
    }
    return usOnThisDay;
  }





  //определение кликнули один или два раза чтоб обычн пользователь не кликнул дважды
  currentUserRec(time: any, date:any,) {
    this.clickCount++;
    setTimeout(() => {
      if (this.clickCount === 1) {
        this.checkingTheNumberOfRecorded(date, time);
        const currentUser = this.dateService.allUsersSelectedOrg.value.find((el: any) => el.id == this.dateService.currentUserId.value)
        setTimeout(()=> {
          if(!this.recordComplete) {
            this.dateService.userSignedHimself.next(true);
            this.addEntry(currentUser, time, date);
          }
        },20)

      } else if (this.clickCount === 2) {
        return
      }
      this.clickCount = 0;
    }, 250)
  }

  //функция добавления новой записи
  addEntry(user: any, curHourTime: any, date: any) {
    const workStatus = this.dateService.maxPossibleEntries.value <= this.dateService.howMuchRecorded.value +1? 0 : 1; //0 = closed 1 = open
    const year = date.substring(date.length - 4);
    const month = date.substring(3,5);
    const dateNum = date.slice(0,2);
    this.dateService.dataSelectedUser.next(user);
    const newUserAccount = {
      userSignedHimself: this.dateService.userSignedHimself.value,
      date: date,
      dateYear: year,
      dateMonth: month,
      dateNum: dateNum,
      time: curHourTime,
      user: user.surnameUser + ' ' + user.nameUser,
      userId: user.id,
      remainingFunds: user.remainingFunds,
      sectionOrOrganization: user.sectionOrOrganization,
      idOrg: this.dateService.idSelectedOrg.value,
      workStatus: workStatus
    }
    this.apiService.addEntry(newUserAccount)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.refreshData();
      })
  }


  deletePerson(idRec: any, userId: any, orgId: any) {
    const workStatus = this.dateService.maxPossibleEntries.value >= this.dateService.howMuchRecorded.value +1? 0: 1; //0 = closed , 1 = open
    if (this.dateService.currentUserSimpleUser.value) {
      this.blockIfRecorded = false;
      this.dateService.userCancelHimselfRec.next(1);
    } else {
      this.dateService.userCancelHimselfRec.next(0);
    }
    this.apiService.deleteEntry(idRec, userId, orgId, this.dateService.userCancelHimselfRec.value, workStatus)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.refreshData();
      })
  }

  //обновление после добавления или удаление записи
  refreshData () {
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    this.dateService.recordingDaysChanged.next(true);
  }

  submit(data: any) {
    const id = this.selectedPersonId;
    const date = data.date;
    const time = data.time;
    const user = this.dateService.allUsersSelectedOrg.value.find((el: any) => el.id == id)

    this.addEntry(user, time, date);
    this.cancel();
  }

  cancel() {
    this.newEntryHasBeenOpenedTime = '';
    this.newEntryHasBeenOpenedDate = '';
  }


  //функция записывающая пользователя на выбранное время по нажатию enter
  savingByPressingEnter(e: any, val: any, data: any) {
    if (val && e.code === 'Enter') {
      this.submit(data);
    }
    if (e.code === 'Escape') {
      this.cancel()
    }
  }


  currentHourTime(time: any, date: any) {
    this.dateService.userSignedHimself.next(false);
    setTimeout(() => {
      this.inputElementRef.nativeElement.value = '';
      this.inputElementRef?.nativeElement?.focus();
      // this.disabledBtnRecord = !this.inputElementRef?.nativeElement?.value
    }, 100)
    this.newEntryHasBeenOpenedTime = time;
    this.newEntryHasBeenOpenedDate = date;
    this.checkingTheNumberOfRecorded(date, time);
  }


  checkingTheNumberOfRecorded(dateRec: any, timeRec: any) {
    const dateAndTimeRec = {
      timeRec: timeRec,
      dateRec: dateRec
    }
    this.getAllEntryInCurrentTimes(dateAndTimeRec);
  }


  //берем все записи из базы за текущую дату и выбранное время
  getAllEntryInCurrentTimes(dateAndTimeRec: any) {
    this.apiService.getAllEntryInCurrentTimes(dateAndTimeRec)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allEntryCurTime => {
        this.dateService.howMuchRecorded.next(allEntryCurTime.length);
        const filterOnSelectOrg = allEntryCurTime.filter((el: any) =>
           el.sectionOrOrganization === this.dateService.currentOrg.value)
        //ограничиваем запись если записано указанное кол-во человек  this.dateService.maxPossibleEntries.value
        if (filterOnSelectOrg.length >= this.dateService.maxPossibleEntries.value) {
          this.recordComplete = true;
          this.cancel();
          this.localErrHandler('На выбранное время запись завершена!' +
            ' Запишитесь пожалуйста на другое время или день!');
          return;
        } else {
          this.recordComplete = false;
        }
      });
  }

  public localErrHandler(err: string) {
    this.errorResponseService.localHandler(err)
    return throwError(() => err)
  }

  choosePerson(person: any, data: any) {
    this.clickCount++;
    this.selectedPersonId = person.id;
    setTimeout(() => {
      if (this.clickCount === 1) {
          this.inputElementRef.nativeElement.value = person.surnameUser + ' ' + person.nameUser;
      } else if (this.clickCount === 2) {
        this.submit(data);
      }
      this.clickCount = 0;
    }, 250)
  }


  lostFocus() {
    //сделать чтоб когда кликнули за пределами блока  закрывать запись
    // setTimeout(() => {
    //   this.cancel();
    // }, 300)
  }


  openDataPerson(person: any) {
    this.modalService.open();
    this.modalService.openClientListBlockWithData();
    this.dateService.dataSelectedUser.next(person);
  }

  closedRecords(time: any) {
    const howMuchRec = this.dataCalendarService.allEntryAllUsersInMonth.value
      .filter((el:any)=> el.date === time.date)
      .filter((el:any)=> el.time === time.time)
      .length

    const dataForChangeStatus = {
      date: time.date,
      time: time.time,
      state: time.workStatus,
      idOrg: this.dateService.idSelectedOrg.value
    }
    if (this.dateService.maxPossibleEntries.value > howMuchRec) {
      this.apiService.changeWorkStatusChoiceTime(dataForChangeStatus)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(()=> {
          this.refreshData();
        })
    }
  }
}
