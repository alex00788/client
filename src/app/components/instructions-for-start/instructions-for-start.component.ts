import { Component } from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-instructions-for-start',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './instructions-for-start.component.html',
  styleUrl: './instructions-for-start.component.css'
})
export class InstructionsForStartComponent {
  client = false;
  admin = false;

  switchInstruction(u: string) {
    console.log(u)
    if (u === 'client') {
      this.client = true;
      this.admin = false;
    } else {
      this.client = false;
      this.admin = true;
    }
  }
}
