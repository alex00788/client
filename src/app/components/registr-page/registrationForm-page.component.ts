import {Component, OnInit,} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ModalPageComponent} from "../modal-page/modal-page.component";
import {ApiService} from "../../shared/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalService} from "../../shared/services/modal.service";
import {ErrorResponseService} from "../../shared/services/error.response.service";

@Component({
  selector: 'app-registrationForm-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    ModalPageComponent,
  ], templateUrl: './registrationForm-page.component.html',
  styleUrl: './registrationForm-page.component.css'
})
export class RegistrationFormPageComponent implements OnInit {

  // @ViewChild('phoneNumbers') phoneInput: ElementRef;
  constructor(private apiService: ApiService,
              private router: Router,
              private activateRouter: ActivatedRoute,
              private modalService: ModalService,
              public errorResponseService: ErrorResponseService) {
  }

  private destroyed$: Subject<void> = new Subject();
  title = 'Регистрация';
  dataAr : any[] =[];
  inputPass: any;
  changeIcon = true;
  loginSub: any;
  form = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(4)]),
    nameUser: new FormControl(null, Validators.required),
    surnameUser: new FormControl(null, Validators.required),
    phoneNumber: new FormControl(null, Validators.required),
    sectionOrOrganization: new FormControl('', Validators.required),
  })

  ngOnInit(): void {
    this.errorResponseService.disableLoginForm
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res =>
        res ? this.form.disable() : this.form.enable()
      )

   this.dataAr = [
     {name: ''},
     {name: 'акробатика'},
     {name: 'lDance'},
     {name: 'Перевозки'}
   ]
    // this.activateRouter.queryParams
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe(params => {
    //     console.log('40 queryparams', params)
    //   })
  }


  get email() {
    return this.form.controls.email as FormControl
  }

  get password() {
    return this.form.controls.password as FormControl
  }

  get nameUser() {
    return this.form.controls.nameUser as FormControl
  }

  get surnameUser() {
    return this.form.controls.surnameUser as FormControl
  }

  get phoneNumber() {
    return this.form.controls.phoneNumber as FormControl
  }

  get sectionOrOrganization() {
    return this.form.controls.sectionOrOrganization as FormControl
  }


  submit() {
    // в зависимости от введеных данных присваиваеться роль и рисуеться интерфейс!!!
    this.form.disable()          //блокировка формы чтоб не отправлять много запросов подряд
    if (this.form.invalid) {
      return;
    }

    console.log('59', this.form.value)
    this.loginSub = this.apiService.registration(this.form.value).subscribe(userData => {
      console.log('93', userData)
      if (userData) {
        this.form.reset()
        this.router.navigate(['personal-page'])
      }
    })
  }


  showOrHidePassword() {
    this.inputPass = document.getElementById('password');
    if (this.inputPass?.getAttribute('type') === 'password') {
      this.changeIcon = false;
      this.inputPass.setAttribute('type', 'text');
    } else {
      this.inputPass.setAttribute('type', 'password');
      this.changeIcon = true;
    }
  }

  phoneValidation(event: any) {
    event.target.value = event.target.value.replace(/[^\+\0-9\.]/g, '');
    if (!event.target.value[1] || !event.target.value) {
      event.target.value = '+7'
    }
  }


  ngOnDestroy(): void {
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
  }


  openLoginPage() {
    this.modalService.openLoginForm$();
  }
}
