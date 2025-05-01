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

  it('should display meal name', () => {
  });

  it('should display short description of meal', () => {
  });

  it('should display ingredients list', () => {
  });

  it('should display simple prep instructions', () => {
  });

  it('should display estimated cook time', () => {
  });

  it('should display picky eater tip if this checkbox was selected in form', () => {
  });

  it('should not display picky eater tip if this checkbox was not selected in form', () => {
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
