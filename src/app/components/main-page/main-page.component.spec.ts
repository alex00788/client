import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MainPageComponent } from './main-page.component';
import { ModalService } from '../../shared/services/modal.service';
import { DateService } from '../personal-page/calendar-components/date.service';
import { Subject} from 'rxjs';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let modalService: any;
  let dateService: any;
  let activatedRoute: any;
  let fixture: ComponentFixture<MainPageComponent>;


  beforeEach(async () => {
    modalService = new ModalService()
    dateService = new DateService()
    activatedRoute = {queryParams: new Subject()};
    component = new MainPageComponent(modalService, dateService, activatedRoute)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
