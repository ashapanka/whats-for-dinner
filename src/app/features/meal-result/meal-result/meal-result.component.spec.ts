import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealResultComponent } from './meal-result.component';

describe('MealResultComponent', () => {
  let component: MealResultComponent;
  let fixture: ComponentFixture<MealResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
