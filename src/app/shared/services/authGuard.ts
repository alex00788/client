import {
  ActivatedRouteSnapshot,
  CanActivate, CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import {Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {ApiService} from "./api.service";
import {ModalService} from "./modal.service";

@Injectable({providedIn: "root"})
//имплеминтируемся от
export class AuthGuard implements CanActivate , CanActivateChild {
  constructor(
    //инектим чтоб достать метод который принимает токен и возвращает флаг да или нет
    private auth: ApiService,
    private router: Router,
    private modalService: ModalService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
   //если авторизован то показываем   или редиректим  на страницу логина
    if (this.auth.isAuthenticated()) {
      return of(true)                         //ok
    } else {
      this.router.navigate(['/'], {
        queryParams: {                                        // queryParams   можно обработать и показать подсказку
          notIsAuthorized: true
        }
      })
      this.modalService.open();
      this.modalService.openLoginForm();
      return of(false)
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
    return this.canActivate(route, state)
}

}
