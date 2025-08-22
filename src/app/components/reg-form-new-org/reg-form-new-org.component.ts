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
    nameSupervisor: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl<string | null>(null, Validators.required),
    nameSectionOrOrganization: new FormControl<string | null>(null, Validators.required),
  })



  submit() {
    this.form.disable()
    if (this.form.invalid) {
      return;
    }
    const email = this.form.value.email!;
    const modifiedEmail = email.slice(0, 1).toLowerCase() + email.slice(1);
    this.form.patchValue({ email: modifiedEmail });
    
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
