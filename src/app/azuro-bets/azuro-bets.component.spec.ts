import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzuroBetsComponent } from './azuro-bets.component';

describe('AzuroPicksComponent', () => {
  let component: AzuroBetsComponent;
  let fixture: ComponentFixture<AzuroBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzuroBetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AzuroBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
