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
    this.createFormData(event.target.files);
  }

  private createFormData(files: FileList): void {
    this.formData = new FormData();
    this.formData.append('file', files[0], files[0].name);
    this.formData.append('orgId', this.dateService.idSelectedOrg.value);
    this.loadPhotoLabelOrg();
  }

  private loadPhotoLabelOrg(): void {
    this.apiService
      .loadPhotoLabelOrg(this.formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(()=> {
        this.photoAdded.emit()
      })
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
}


}
