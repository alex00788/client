import {Component, OnDestroy, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, NgIf, NgOptimizedImage} from "@angular/common";
import {ModalPageComponent} from "../modal-page/modal-page.component";
import {ModalService} from "../../shared/services/modal.service";
import {ErrorModalComponent} from "../error-modal/error-modal.component";
import {LoginPageComponent} from "../login-page/login-page.component";
import {RegistrationFormPageComponent} from "../registr-page/registrationForm-page.component";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {DescriptionApplicationComponent} from "../description-application/description-application.component";
import {
    RegFormChoiceOrganizationComponent
} from "../reg-form-choice-organization/reg-form-choice-organization.component";
import {RegFormNewOrgComponent} from "../reg-form-new-org/reg-form-new-org.component";
import {SuccessModalComponent} from "../success-modal/success-modal.component";
import {ContactsComponent} from "../contacts/contacts.component";
import {SupportDevelopmentComponent} from "../support-development/support-development.component";
import {Subject, takeUntil} from "rxjs";
import {DateService} from "../personal-page/calendar-components/date.service";

@Component({
  selector: 'main-page',
  standalone: true,
  imports: [
    ModalPageComponent,
    NgIf,
    AsyncPipe,
    CommonModule,
    ErrorModalComponent,
    LoginPageComponent,
    RegistrationFormPageComponent,
    RouterLink,
    DescriptionApplicationComponent,
    RegFormChoiceOrganizationComponent,
    RegFormNewOrgComponent,
    SuccessModalComponent,
    ContactsComponent,
    SupportDevelopmentComponent,
    NgOptimizedImage
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})

export class MainPageComponent implements OnInit, OnDestroy{
  mainTitle = 'Online запись в любую организацию'
  mainTitleComp = 'Online запись к профи'
  modalTitle = 'ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ'
  private destroyed$: Subject<void> = new Subject();


  constructor(
    public modalService : ModalService,
    private activateRouter: ActivatedRoute,
    public dateService: DateService,
  ) {
  }

  ngOnInit(): void {
    this.activateRouter.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        console.log('60', params);
        if (params && Object.keys(params)[0] === 'organization') {
          //записываем данные орг из которой пришел человек
          this.dateService.nameOrganizationWhereItCameFrom.next(Object.values(params)[0])
          this.dateService.idOrganizationWhereItCameFrom.next(Object.values(params)[1])
        }
      })
  }

  openModal() {
    this.modalService.open()
    this.modalService.hideTitle()
    this.modalService.openLoginForm$()
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
