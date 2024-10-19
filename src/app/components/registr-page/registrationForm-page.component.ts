import {Component, OnDestroy, OnInit,} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {ModalPageComponent} from "../modal-page/modal-page.component";
import {ApiService} from "../../shared/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalService} from "../../shared/services/modal.service";
import {ErrorResponseService} from "../../shared/services/error.response.service";
import {DateService} from "../personal-page/calendar-components/date.service";
import {SuccessService} from "../../shared/services/success.service";

@Component({
  selector: 'app-registrationForm-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    ModalPageComponent,
    AsyncPipe,
  ], templateUrl: './registrationForm-page.component.html',
  styleUrl: './registrationForm-page.component.css'
})
export class RegistrationFormPageComponent implements OnInit, OnDestroy {

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activateRouter: ActivatedRoute,
    public modalService: ModalService,
    private dateService: DateService,
    public errorResponseService: ErrorResponseService,
    public successService: SuccessService
  ) {
  }

  private destroyed$: Subject<void> = new Subject();
  title = 'Регистрация';
  inputPass: any;
  changeIcon = true;
  loginSub: any;
  permissionChB = false;
  loading = false;
  form = new FormGroup({
    email: new FormControl('',  [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(4)]),
    nameUser: new FormControl(null, Validators.required),
    surnameUser: new FormControl(null, Validators.required),
    phoneNumber: new FormControl(null, Validators.required),
    permission: new FormControl(),
    sectionOrOrganization: new FormControl(),
    idOrg: new FormControl(),
  })

  ngOnInit(): void {
    this.permissionChB = false;
    this.errorResponseService.disableLoginForm
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        res ? this.form.disable() : this.form.enable()
        this.loading = false;
      })
  }


  get email() {
    return this.form.controls.email as FormControl;
  }

  get password() {
    return this.form.controls.password as FormControl;
  }

  get nameUser() {
    return this.form.controls.nameUser as FormControl;
  }

  get surnameUser() {
    return this.form.controls.surnameUser as FormControl;
  }

  get phoneNumber() {
    return this.form.controls.phoneNumber as FormControl;
  }

  get permission() {
    return this.form.controls.permission as FormControl;
  }

  get sectionOrOrganization() {
    return this.form.controls.sectionOrOrganization as FormControl;
  }


  submit() {
    this.loading = true;
    // в зависимости от введеных данных присваиваеться роль и рисуеться интерфейс!!!
    this.form.disable()          //блокировка формы чтоб не отправлять много запросов подряд
    if (this.form.invalid) {
      return;
    }
    this.form.value.email = this.form.value.email!.slice(0, 1).toLowerCase() + this.form.value.email!.slice(1);
    //тут записываем данные орг с которой пришли или которую выбрали при регистрации
    this.form.value.sectionOrOrganization = this.dateService.nameOrganizationWhereItCameFrom.value?
    this.dateService.nameOrganizationWhereItCameFrom.value : this.dateService.selectOrgForReg.value[0].name;
    this.form.value.idOrg = this.dateService.nameOrganizationWhereItCameFrom.value?
    this.dateService.idOrganizationWhereItCameFrom.value : this.dateService.idSelectedOrg.value;
    this.loginSub = this.apiService.registration(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(userData => {
        this.loading = false;
        if (userData?.user.isActivated) {
          this.form.reset()
          this.permissionChB = false
          this.router.navigate(['personal-page'])
          this.modalService.close()
          this.dateService.setUser(userData)
        } else {
          this.modalService.close()
          this.successService.localHandler('Вы зарегистрированы! Осталось подтвердить почту!');
          this.router.navigate(['/'])
          this.apiService.logout()
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
    this.permissionChB = false;
    this.destroyed$.next();
    this.destroyed$.complete();
  }


  openLoginPage() {
    this.modalService.openLoginForm$();
  }


  openRegFormChoiceOrg() {
    //если перешли по ссылки из орг то тут пропускаем форму выбора организации
    if ( this.dateService.nameOrganizationWhereItCameFrom.value) {
     this.openLoginPage();
    } else {
      this.modalService.openRegFormChoiceOrganisation();
    }
  }

  permissionChange(e: any) {
    this.permissionChB = e.target.checked;
  }

  clearTrim(e: any) {
    e.target.value = e.target.value.replaceAll(' ', '');
  }

  registerAgain() {
    this.apiService.registerAgain(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.errorResponseService.clear();
        this.modalService.registrationError.next(false);
        this.successService.localHandler(res.message)
      })
  }





  //так можно проверить почту на ввод недопустимых и повторных значений с помощью регулярн выражен
  // removeFobbidenCharacters(e: any) {
    //символы не разрешенные при вводе email
  //   const emailEexcludeSymbols = [' ', '&', '?', '=', '+', '#', '%', '}', '{', '\\', '[', ']', '|', '^', '<', '>', '*', '$', '!', '~', '`', ',', ';', '(', ')', '\'', '"'];
  //   const str = [...e.target.value];
  //   const res = [];
  //   str.forEach((el) => {
  //     if (emailEexcludeSymbols.includes(el) ||
  //       (el === '.' && e.target.value.indexOf(el) === 0) ||
  //       /[А-Яа-яЁё]/.test(el)
  //     ) {
  //       e.target.value = e.target.value.replace(el, '');
  //     }
  //   });
  //   e.target.value = e.target.value.replace(/\.+$/, '.');
  //   e.target.value = e.target.value.replace(/\@+$/, '@');
  //   e.target.value = e.target.value.replace(/\-+$/, '-');
  //   e.target.value = e.target.value.replace(/\_+$/, '_');
  //   e.target.value = e.target.value.replace(/\/+$/, '/');
  // }

}
