import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BxbtComponent } from './bxbt.component';


describe('AzuroPicksComponent', () => {
  let component: BxbtComponent;
  let fixture: ComponentFixture<BxbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BxbtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BxbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
