import {
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {FilterOrgPipe} from "../../../../../shared/pipe/filter-org.pipe";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DateService} from "../../date.service";
import {DataCalendarService} from "../../data-calendar-new/data-calendar.service";

@Component({
  selector: 'app-select-org-to-display',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    FilterOrgPipe,
    NgIf
  ],
  templateUrl: './select-org-to-display.component.html',
  styleUrl: './select-org-to-display.component.css'
})
export class SelectOrgToDisplayComponent {
  constructor(    public dateService: DateService,
                  public dataCalendarService: DataCalendarService,
                  private el: ElementRef
  ) {}

  searchOrgForRec = '';
  showSelectedOrg = false;

  @ViewChild('inputSearchOrg') inputSearchOrgRef: ElementRef;
  //оределяем, что кликнули за пределом блока div закрыть при потери фокуса
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    // элемент в котором находимся есть в том по которому кликнули?
    if (!this.el.nativeElement.contains(event.target)) {
      this.showSelectedOrg = false;
      //this.el.nativeElement,... тот элемент, в котором находимся
      //event.target... тот по которому кликаем
      // в методе changeOrg() ставим timout чтоб сначала отработал клик что кликнули вне окна и закрые его и потом уже отработал метод открытия этого окна
    }
  }





  choiceOrgForRec(org: any) {
    this.showSelectedOrg = false;
    this.dateService.idSelectedOrg.next(org.id)
    this.dateService.currentOrg.next(org.name)
    this.dataCalendarService.getAllEntryAllUsersForTheMonth();
    this.dataCalendarService.getAllUsersCurrentOrganization();
    setTimeout(() => {
      this.refreshDataAboutOrg();
    }, 50)
  }

//При обновлении оставаться на выбранной организации//  чтоб изменить при логине нужно придумать метод который будет перезаписывать в таблице юзер организации и ее id
  refreshDataAboutOrg() {
    const data = JSON.parse(localStorage.getItem('userData') as string)
    data.user.sectionOrOrganization = this.dateService.currentOrg.value;
    data.user.idOrg = this.dateService.idSelectedOrg.value;
    data.user.role = this.dateService.currentUserRole.value;
    data.user.remainingFunds = this.dateService.remainingFunds.value;
    localStorage.setItem('userData', JSON.stringify(data));
  }


  changeOrg() {
    setTimeout(() => {
      this.showSelectedOrg = true;
    }, 250)
  }
}
