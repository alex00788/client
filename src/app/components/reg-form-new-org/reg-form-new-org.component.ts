import {Component, OnDestroy} from '@angular/core';
import {ModalService} from "../../shared/services/modal.service";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subject, takeUntil} from "rxjs";
import {ApiService} from "../../shared/services/api.service";
import {Router} from "@angular/router";
import {SuccessService} from "../../shared/services/success.service";

@Component({
  selector: 'app-reg-form-new-org',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './reg-form-new-org.component.html',
  styleUrl: './reg-form-new-org.component.css'
})
export class RegFormNewOrgComponent implements OnDestroy{
  constructor(
    public successService: SuccessService,
    public modalService: ModalService,
    private apiService: ApiService,
    private router: Router,
  ) {}
  private destroyed$: Subject<void> = new Subject();
  form = new FormGroup({
    nameSupervisor: new FormControl(null, Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl(null, Validators.required),
    nameSectionOrOrganization: new FormControl(null, Validators.required),
  })



  submit() {
    this.form.disable()
    if (this.form.invalid) {
      return;
    }
    this.form.value.email = this.form.value.email!.slice(0, 1).toLowerCase() + this.form.value.email!.slice(1);
    this.apiService.addNewOrgSend(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
          this.successService.localHandler(res.message);
          this.form.reset();
          this.router.navigate(['/']);
          this.modalService.close();
      })
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
