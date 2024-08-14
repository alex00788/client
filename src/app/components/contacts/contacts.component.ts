import {Component, OnDestroy} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ApiService} from "../../shared/services/api.service";
import {Subject, takeUntil} from "rxjs";
import {ModalService} from "../../shared/services/modal.service";
import {SuccessService} from "../../shared/services/success.service";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnDestroy {
  constructor(
    private apiService:ApiService,
    public modalService: ModalService,
    public successService: SuccessService
    ) {
  }
  private destroyed$: Subject<void> = new Subject();
  openSupport = false;
  form = new FormGroup({
    description: new FormControl(null, [Validators.required, Validators.minLength(15)]),
    email: new FormControl(),
  })

  get description() {
    return this.form.controls.description as FormControl
  }


  cancelSubmit() {
    this.form.enable();
    this.openSupport = !this.openSupport;
  }

  openSupportBlock() {
    this.openSupport = !this.openSupport;
  }

  submit() {
    this.form.disable();
    this.apiService.sendInSupport(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any)=> {
        this.form.reset();
        this.modalService.close();
        this.successService.localHandler(res.message);
      })
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
