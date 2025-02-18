import {of} from "rxjs";
import {inject} from "@angular/core";
import {ApiService} from "./services/api.service";
import {Router} from "@angular/router";
import {ModalService} from "./services/modal.service";


export const CanActivate = () => {
  const auth = inject(ApiService)
  const router = inject(Router)
  const modalService = inject(ModalService)

  if (auth.isAuthenticated()) {
    return of(true)
  } else {
    router.navigate(['/'], {
      queryParams: {
        notIsAuthorized: true
      }
    })
    modalService.open();
    modalService.openLoginForm();
    return of(false)
  }
}
