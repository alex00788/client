import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOrgDirectionComponent } from './select-org-direction.component';

describe('SelectOrgDirectionComponent', () => {
  let component: SelectOrgDirectionComponent;
  let fixture: ComponentFixture<SelectOrgDirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectOrgDirectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectOrgDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
