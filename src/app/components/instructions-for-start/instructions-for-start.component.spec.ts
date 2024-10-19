import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionsForStartComponent } from './instructions-for-start.component';

describe('InstructionsForStartComponent', () => {
  let component: InstructionsForStartComponent;
  let fixture: ComponentFixture<InstructionsForStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionsForStartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstructionsForStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
