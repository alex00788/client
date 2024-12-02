import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {PersonalBlockService} from "../../personal-block.service";
import {DateService} from "../../date.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {TranslateMonthPipe} from "../../../../../shared/pipe/translate-month.pipe";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../../../../shared/services/api.service";

@Component({
  selector: 'app-personal-data-block',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    TranslateMonthPipe
  ],
  templateUrl: './personal-data-block.component.html',
  styleUrl: './personal-data-block.component.css'
})
export class PersonalDataBlockComponent implements OnInit, OnDestroy{
  @Output() photoAdded: EventEmitter<any> = new EventEmitter<any>()
  private destroyed$: Subject<void> = new Subject();
  private formData: FormData;
  constructor(
               public personalBlockService: PersonalBlockService,
               public dateService: DateService,
               public apiService: ApiService,
  ) {  }

  ngOnInit(): void {
  }


  loadLabelOrg(event: any) {
    console.log('1 нажали загруз')
    this.createFormData(event.target.files);
  }

  private createFormData(files: FileList): void {
    this.formData = new FormData();
    this.formData.append('file', files[0], files[0].name);
    this.formData.append('orgId', this.dateService.idSelectedOrg.value);
    console.log('2 дошли до запроса')
    this.loadPhotoLabelOrg();
  }

  private loadPhotoLabelOrg(): void {
    console.log('3 запрос')
    this.apiService
      .loadPhotoLabelOrg(this.formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        console.log('4 ответ сервера')
        this.photoAdded.emit()
      })
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
}


}
