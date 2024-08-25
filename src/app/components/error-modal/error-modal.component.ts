import { Component } from '@angular/core';
import {ErrorResponseService} from "../../shared/services/error.response.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {ModalService} from "../../shared/services/modal.service";

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf
  ],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  errMessage = 'Ошибка!'

constructor(
  public errorResponseService: ErrorResponseService,
  public modalService: ModalService,
) {
}

  closeErr() {
    this.errorResponseService.clear();
    this.modalService.registrationError.next(false);
  }
}
