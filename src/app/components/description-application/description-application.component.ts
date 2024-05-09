import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {ModalService} from "../../shared/services/modal.service";

@Component({
  selector: 'app-description-application',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './description-application.component.html',
  styleUrl: './description-application.component.css'
})
export class DescriptionApplicationComponent {
  constructor(public modalService: ModalService) {
  }

  blockDescription =  false;

  switchHowItWorkBlock() {
    this.blockDescription = !this.blockDescription;
  }

}
