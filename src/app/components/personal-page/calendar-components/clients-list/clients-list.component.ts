import {Component, OnInit,} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {DateService} from "../date.service";
import {Subject, takeUntil} from "rxjs";
import {FormsModule,} from "@angular/forms";
import {FilterClientListPipe} from "../../../../shared/pipe/filter-client-list.pipe";
import {ModalService} from "../../../../shared/services/modal.service";
import {PersonalBlockService} from "../personal-block.service";
import {DataCalendarService} from "../data-calendar-new/data-calendar.service";

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgForOf,
    FormsModule,
    FilterClientListPipe
  ],
  templateUrl: './clients-list.component.html',
  styleUrl: './clients-list.component.css'
})
export class ClientsListComponent implements OnInit{
  constructor(
    public dateService: DateService,
    public dataCalendarService: DataCalendarService,
    public modalService: ModalService,
    public personalBlockService: PersonalBlockService,
    ) {
  }
  private destroyed$: Subject<void> = new Subject();
  clientList = ''

  ngOnInit(): void {
    this.sortingClients();
  }


  sortingClients() {
    this.dateService.allUsers
      .pipe(takeUntil(this.destroyed$))
      .subscribe(allUserList => {
        allUserList.sort((a: any, b: any) => a.surnameUser > b.surnameUser ? 1 : -1)
      })
  }



  openPerson(person: any) {
    person.userId = JSON.stringify(+person.id)
    this.modalService.open();
    this.modalService.openClientListBlockWithData();
    this.dataCalendarService.getPhoneSelectedUser(person.userId);
    this.dateService.dataSelectedUser.next(person);
  }
}
