import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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

  it('should have initial state with both flags set to false', () => {
    expect(component.client).toBeFalse();
    expect(component.admin).toBeFalse();
  });

  it('should switch to client mode when switchInstruction is called with "client"', () => {
    component.switchInstruction('client');
    expect(component.client).toBeTrue();
    expect(component.admin).toBeFalse();
  });

  it('should switch to admin mode when switchInstruction is called with "admin"', () => {
    component.switchInstruction('admin');
    expect(component.client).toBeFalse();
    expect(component.admin).toBeTrue();
  });

  it('should switch to admin mode when switchInstruction is called with any other value', () => {
    component.switchInstruction('other');
    expect(component.client).toBeFalse();
    expect(component.admin).toBeTrue();
  });

  it('should render two buttons initially', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent.trim()).toBe('Клиент');
    expect(buttons[1].nativeElement.textContent.trim()).toBe('Админ');
  });

  it('should show client instructions when client button is clicked', () => {
    const clientButton = fixture.debugElement.query(By.css('button:first-child'));
    clientButton.nativeElement.click();
    fixture.detectChanges();

    const clientBlock = fixture.debugElement.query(By.css('.instructionBlock'));
    expect(clientBlock).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.downloadAppPhoneBlock'))).toBeFalsy();
  });

  it('should show admin instructions when admin button is clicked', () => {
    const adminButton = fixture.debugElement.query(By.css('button:last-child'));
    adminButton.nativeElement.click();
    fixture.detectChanges();

    const adminBlock = fixture.debugElement.query(By.css('.downloadAppPhoneBlock'));
    expect(adminBlock).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.instructionBlock'))).toBeFalsy();
  });

  it('should not show any instructions initially', () => {
    const instructionBlocks = fixture.debugElement.queryAll(By.css('.instructionBlock, .downloadAppPhoneBlock'));
    expect(instructionBlocks.length).toBe(0);
  });
});
