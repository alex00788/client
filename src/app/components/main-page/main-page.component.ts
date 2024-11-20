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
import {DownloadAppComponent} from "../download-app/download-app.component";
import {InstructionsForStartComponent} from "../instructions-for-start/instructions-for-start.component";

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
    NgOptimizedImage,
    DownloadAppComponent,
    InstructionsForStartComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})

export class MainPageComponent implements OnInit, OnDestroy{
  mainTitle = 'Личный Кабинет для любого сайта'
  mainTitleComp = 'Личный Кабинет'
  modalTitle = 'ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ'
  idOrgForReg: string;
  nameSelectedOrgForReg: string;
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

  recIdOrg(idOrg: any) {
    this.idOrgForReg = idOrg
  }

  recNameSelectedOrg(nameSelectedOrg: any) {
    this.nameSelectedOrgForReg = nameSelectedOrg;
  }
}
