import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({providedIn: "root"})
export class ModalService {
  isVisible$ = new BehaviorSubject<boolean>(false)
  hideTitle$ = new BehaviorSubject<boolean>(true)
  registrationForm$ = new BehaviorSubject<boolean>(false)
  regFormChoiceOrg$ = new BehaviorSubject<boolean>(false)
  regFormAddNewOrg$ = new BehaviorSubject<boolean>(false)
  loginForm$ = new BehaviorSubject<boolean>(false)
  appDescription$ = new BehaviorSubject<boolean>(false)
  appContacts$ = new BehaviorSubject<boolean>(false)
  appSupport$ = new BehaviorSubject<boolean>(false)
  recordsBlock = new BehaviorSubject<boolean>(false)
  clientListBlock = new BehaviorSubject<boolean>(false)
  modalRenameUser = new BehaviorSubject<boolean>(false)
  currentDataAboutSelectedUser = new BehaviorSubject<any>({})
  registrationError = new BehaviorSubject<boolean>(false)

  open() {
    this.isVisible$.next(true)
  }

  close() {
    this.isVisible$.next(false)
    this.hideTitle$.next(true)
  }

  hideTitle() {
    this.hideTitle$.next(false)
  }

  showTitle() {
    this.hideTitle$.next(true)
  }


  openRegFormChoiceOrganisation() {
    this.open();
    this.regFormChoiceOrg$.next(true);
    this.registrationForm$.next(false);
    this.loginForm$.next(false);
    this.appDescription$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
  }

  openRegistrationForm$ () {
    this.registrationForm$.next(true);
    this.loginForm$.next(false);
    this.appDescription$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
  }

  openLoginForm$ () {
    this.registrationForm$.next(false);
    this.loginForm$.next(true);
    this.appDescription$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
  }

  openFormAddNewOrg$ () {
    this.regFormAddNewOrg$.next(true);
    this.registrationForm$.next(false);
    this.loginForm$.next(false);
    this.appDescription$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
  }


  openAppDescription$ () {
    this.open();
    this.appDescription$.next(true);
    this.registrationForm$.next(false);
    this.loginForm$.next(false);
    this.hideTitle$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
  }

  openAppContacts() {
    this.open();
    this.appDescription$.next(false);
    this.registrationForm$.next(false);
    this.loginForm$.next(false);
    this.hideTitle$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(true);
    this.appSupport$.next(false);
  }

  closeContacts() {
    this.appContacts$.next(false);
    this.close();
  }

  openAppSupport() {
    this.open();
    this.registrationForm$.next(false);
    this.appDescription$.next(false);
    this.loginForm$.next(false);
    this.hideTitle$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(true);
  }

  // closeAppDescription$() {
  //   this.appDescription$.next(false);
  // }

  openRecordsBlockWithData() {
    this.recordsBlock.next(true);
    this.clientListBlock.next(false);
  }

  openClientListBlockWithData() {
    this.recordsBlock.next(false);
    this.clientListBlock.next(true);
    this.modalRenameUser.next(false);
  }

  openModalRenameUser() {
    this.clientListBlock.next(false);
    this.modalRenameUser.next(true);
  }

  closeModalRenameUser() {
    this.clientListBlock.next(false);
    this.modalRenameUser.next(false);
  }

}
