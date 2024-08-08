import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, NgIf, NgOptimizedImage} from "@angular/common";
import {ModalPageComponent} from "../modal-page/modal-page.component";
import {ModalService} from "../../shared/services/modal.service";
import {ErrorModalComponent} from "../error-modal/error-modal.component";
import {LoginPageComponent} from "../login-page/login-page.component";
import {RegistrationFormPageComponent} from "../registr-page/registrationForm-page.component";
import {RouterLink} from "@angular/router";
import {DescriptionApplicationComponent} from "../description-application/description-application.component";
import {
    RegFormChoiceOrganizationComponent
} from "../reg-form-choice-organization/reg-form-choice-organization.component";
import {RegFormNewOrgComponent} from "../reg-form-new-org/reg-form-new-org.component";
import {SuccessModalComponent} from "../success-modal/success-modal.component";
import {ContactsComponent} from "../contacts/contacts.component";
import {SupportDevelopmentComponent} from "../support-development/support-development.component";

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

export class MainPageComponent implements OnInit{
  mainTitle = 'Online запись в любую организацию'
  mainTitleComp = 'Online запись к профи'
  modalTitle = 'ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ'


  constructor(
    public modalService : ModalService,
  ) {
  }

  ngOnInit(): void {
    console.log('запрос на статистику ')

  }

  openModal() {
    this.modalService.open()
    this.modalService.hideTitle()
    this.modalService.openLoginForm$()
  }
}
