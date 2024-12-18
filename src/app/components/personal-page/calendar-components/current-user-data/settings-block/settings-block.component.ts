import {Component, Input, OnInit} from '@angular/core';
import {PersonalBlockService} from "../../personal-block.service";
import {DateService} from "../../date.service";
import {ApiService} from "../../../../../shared/services/api.service";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DataCalendarService} from "../../data-calendar-new/data-calendar.service";
import {Subject, takeUntil} from "rxjs";
import {SuccessService} from "../../../../../shared/services/success.service";

@Component({
  selector: 'app-settings-block',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './settings-block.component.html',
  styleUrl: './settings-block.component.css'
})
export class SettingsBlockComponent implements OnInit{
  constructor(
    public personalBlockService: PersonalBlockService,
    public dateService: DateService,
    public dataCalendarService: DataCalendarService,
    public apiService: ApiService,
    public successService: SuccessService
  ) {  }
  @Input() dataAboutEmployee: any;
  private destroyed$: Subject<void> = new Subject();
  // dataSettings:  any;
  timesForRec : any = [''];
  showDayRec : string;
  timesForRecMinutes : any = [''];
  nameDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
  selDays: string[] = [];
  form = new FormGroup({
    maxiPeople: new FormControl(this.dateService.maxPossibleEntries.value, Validators.required),
    timeUntilBlock: new FormControl(this.dateService.timeUntilBlock.value, Validators.required),
    timeStartRec: new FormControl(this.dateService.timeStartRecord.value, Validators.required),
    timeMinutesRec: new FormControl(this.dateService.timeMinutesRec.value, Validators.required),
    timeFinishRec: new FormControl(this.dateService.timeFinishRecord.value, Validators.required),
    location: new FormControl(this.dateService.location.value, Validators.required),
    phoneOrg: new FormControl(this.dateService.phoneOrg.value, Validators.required),
  })

  ngOnInit(): void {
    this.dateService.changedSettingsOrg
    .pipe(takeUntil(this.destroyed$))
    .subscribe(settingsCurrentOrgHaveBeenChanged => {
      if (settingsCurrentOrgHaveBeenChanged) {
        this.dataForBlockShowCurrentSettings();
      }
    })
    //  для настройки интервала времени в которое можно записаться
    for (let i = 0 ; i <= 23; i++) {
      this.timesForRec.push(i)
    }
    for (let i = 0 ; i <= 59; i++) {
      this.timesForRecMinutes.push(i)
    }

    this.dateService.recordingDays
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.selDays = this.dateService.recordingDays.value.replaceAll(', ', ',').split(',')
      })
  }


  dataForBlockShowCurrentSettings() {
    if (!this.dateService.timeStartRecord.value) {
      this.dateService.timeStartRecord.next(this.form.value.timeStartRec)
    }
    if (!this.dateService.timeFinishRecord.value) {
      this.dateService.timeFinishRecord.next(this.form.value.timeFinishRec)
    }
    if (!this.dateService.maxPossibleEntries.value) {
      this.dateService.maxPossibleEntries.next(this.form.value.maxiPeople)
    }
    if (!this.dateService.timeUntilBlock.value) {
      this.dateService.timeUntilBlock.next(this.form.value.timeUntilBlock)
    }
    if (!this.dateService.location.value) {
      this.dateService.location.next(this.form.value.location)
    }
    if (!this.dateService.phoneOrg.value) {
      this.dateService.phoneOrg.next(this.form.value.phoneOrg)
    }
  }

  showDayRecPipe(arrDays: any) { // функция сортирует дни недели по порядку если user нажал их в произвольном порядке
    const res: any[] = [];
    arrDays.forEach((el: any)=> res.push({name: el, id: this.nameDays.indexOf(el)}))
    res.sort((a:any, b: any)=> a.id > b.id? 1 : -1)
    this.selDays = res.map((el: any) => el.name);
  }

  submit() {
    this.showDayRecPipe(this.selDays) // вернет сортированный массив
    const currentUser = this.dateService.allUsersSelectedOrg.value.find((us: any) => us.id == this.dateService.currentUserId.value)
    this.personalBlockService.closeSettings();
    this.personalBlockService.settingsRecords = false;
    // this.dateService.changeSettingsRec(this.form.value) // дублирует 117
    const timeMinutes = +this.form.value.timeMinutesRec <= 9 && +this.form.value.timeMinutesRec >=0 && this.form.value.timeMinutesRec !== '00'?
      '0' + +this.form.value.timeMinutesRec : this.form.value.timeMinutesRec;
    const timeSt = +this.form.value.timeStartRec <= 9 && +this.form.value.timeStartRec >=0 && this.form.value.timeStartRec !== '00'?
      '0' + +this.form.value.timeStartRec : this.form.value.timeStartRec;
    const timeFn = +this.form.value.timeFinishRec <= 9 &&
                    +this.form.value.timeFinishRec >=0 &&
                    this.form.value.timeFinishRec !== '00' ?
      '0' + +this.form.value.timeFinishRec : this.form.value.timeFinishRec;
    this.form.value.timeStartRec = timeSt
    this.dateService.changeSettingsRec(this.form.value)
    const openEmployee = this.dateService.openEmployee.value
    const dataSettings = {
      openEmployee,
      nameUser: openEmployee? this.dataAboutEmployee.nameUser : currentUser.nameUser,
      surnameUser: openEmployee? this.dataAboutEmployee.surnameUser : currentUser.surnameUser,
      userId:  openEmployee? this.dataAboutEmployee.id : this.dateService.currentUserId.value,
      orgId: this.dateService.idSelectedOrg.value,
      nameOrg: openEmployee? this.dateService.nameSelectedOrg.value : this.dateService.sectionOrOrganization.value,
      roleSelectedOrg: this.dateService.currentUserRole.value,
      remainingFunds: this.dateService.remainingFunds.value,
      maxiPeople: this.form.value.maxiPeople,
      timeUntilBlock: this.form.value.timeUntilBlock,
      timeStartRec: timeSt,
      timeMinutesRec: timeMinutes,
      timeFinishRec: timeFn,
      recordingDays: this.selDays.join(', '),
      location: this.form.value.location,
      phoneOrg: this.form.value.phoneOrg,
    }
    this.apiService.setSettings(dataSettings)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((set: any) => {
        this.dateService.timeStartRecord.next(set.newSettings.timeStartRec);
        this.dateService.timeMinutesRec.next(set.newSettings.timeMinutesRec);
        this.dateService.timeFinishRecord.next(set.newSettings.timeLastRec);
        this.dateService.timeUntilBlock.next(set.newSettings.timeUntilBlock);
        this.dateService.maxPossibleEntries.next(set.newSettings.maxClients);
        this.dateService.recordingDays.next(set.newSettings.recordingDays);
        this.dateService.location.next(set.newSettings.location);
        this.dateService.phoneOrg.next(set.newSettings.phoneOrg);
        this.dateService.changedSettingsOrg.next(true);
        this.successService.localHandler('Настройки сохранены');
        if (!openEmployee) {
          this.refreshData()
        }
      });

    // this.dataCalendarService.getAllEntryAllUsersForTheMonth();
  }

  refreshData () {
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    this.dateService.recordingDaysChanged.next(true);
  }


  inputVal(inpVal: any) {
    if (inpVal.target.value > 24) {
      inpVal.target.value = 24
    }
    if (inpVal.target.value.length > 2 || inpVal.target.value > 24) {
      inpVal.target.value = inpVal.target.value.slice(0, -1)
    }
    if (inpVal.target.value[0] == 0 && inpVal.target.value.length > 1) {
      inpVal.target.value = 12
    }
  }

  clearDefVal(val: any) {
    if (val.target.value === 'Задать в настройках') {
        val.target.value = '';
    }
  }

  choiceDayRec(day: string) {
    if (this.selDays.includes(day)) {
      this.selDays = this.selDays.filter((e:string) => e !== day);
    } else {
      this.selDays.push(day);
    }
  }

}
