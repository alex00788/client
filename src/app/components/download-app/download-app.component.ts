import { Component } from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-download-app',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './download-app.component.html',
  styleUrl: './download-app.component.css'
})
export class DownloadAppComponent {
  iPhone = false;
  Android = false;

  switchPhone(s: string) {
    console.log(s)
    if (s === 'iPhone') {
      this.iPhone = true;
      this.Android = false;
    } else {
      this.iPhone = false;
      this.Android = true;
    }
  }
}
