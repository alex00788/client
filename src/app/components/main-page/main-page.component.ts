import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, NgIf} from "@angular/common";
import {ModalPageComponent} from "../modal-page/modal-page.component";
import {ModalService} from "../../shared/services/modal.service";
import {ErrorModalComponent} from "../error-modal/error-modal.component";
import {LoginPageComponent} from "../login-page/login-page.component";
import {RegistrationFormPageComponent} from "../registr-page/registrationForm-page.component";
import {RouterLink} from "@angular/router";

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
    RouterLink
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})

export class MainPageComponent implements OnInit{
  mainTitle = 'Твой Личный Администратор'
  modalTitle = 'ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ'


  constructor(
    public modalService : ModalService,
  ) {
  }

  ngOnInit(): void {
  }

  openModal() {
    this.modalService.open()
    this.modalService.hideTitle()
    this.modalService.openLoginForm$()
  }
}