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
  downloadApp$ = new BehaviorSubject<boolean>(false)
  instructions$ = new BehaviorSubject<boolean>(false)
  appContacts$ = new BehaviorSubject<boolean>(false)
  appSupport$ = new BehaviorSubject<boolean>(false)
  recordsBlock = new BehaviorSubject<boolean>(false)
  clientListBlock = new BehaviorSubject<boolean>(false)
  modalRenameUser = new BehaviorSubject<boolean>(false)
  currentDataAboutSelectedUser = new BehaviorSubject<any>({})
  registrationError = new BehaviorSubject<boolean>(false)
  rememberPas = new BehaviorSubject<boolean>(false)

  open() {
    this.isVisible$.next(true)
  }

  close() {
    this.isVisible$.next(false)
    this.hideTitle$.next(true)
  }

  hideTitle() {
    this.hideTitle$.next(false)
    this.downloadApp$.next(false)
    this.instructions$.next(false);
  }

  showTitle() {
    this.hideTitle$.next(true)
  }


  private resetAllStates() {
    this.registrationForm$.next(false);
    this.loginForm$.next(false);
    this.appDescription$.next(false);
    this.regFormChoiceOrg$.next(false);
    this.regFormAddNewOrg$.next(false);
    this.appContacts$.next(false);
    this.appSupport$.next(false);
    this.downloadApp$.next(false);
    this.instructions$.next(false);
    this.hideTitle$.next(false);
  }

  private openState(stateSubject: BehaviorSubject<boolean>, needOpen: boolean = true) {
    if (needOpen) this.open();
    this.resetAllStates();
    stateSubject.next(true);
  }

  openRegFormChoiceOrganisation() {
    this.openState(this.regFormChoiceOrg$);
  }

  openRegistrationForm() {
    this.openState(this.registrationForm$, false);
  }

  openLoginForm() {
    this.openState(this.loginForm$, false);
  }

  openFormAddNewOrg() {
    this.openState(this.regFormAddNewOrg$, false);
  }

  openAppDescription() {
    this.openState(this.appDescription$);
  }

  downloadApplication() {
    this.openState(this.downloadApp$);
  }

  instructionsForStart() {
    this.openState(this.instructions$);
  }

  openAppContacts() {
    this.openState(this.appContacts$);
  }

  closeContacts() {
    this.appContacts$.next(false);
    this.close();
  }

  openAppSupport() {
    this.openState(this.appSupport$);
  }

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
