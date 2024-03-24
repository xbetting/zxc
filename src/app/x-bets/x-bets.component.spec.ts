import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XBetsComponent } from './x-bets.component';

describe('XBetsComponent', () => {
  let component: XBetsComponent;
  let fixture: ComponentFixture<XBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XBetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(XBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
