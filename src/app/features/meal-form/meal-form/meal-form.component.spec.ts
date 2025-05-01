import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealFormComponent } from './meal-form.component';

describe('MealFormComponent', () => {
  let component: MealFormComponent;
  let fixture: ComponentFixture<MealFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display form', () => {
  });

  it('should display time available dropdown', () => {
  });

  it('should display # of people input', () => {
  });

  it('should display ingredients textarea', () => {
  });

  it('should display dietary restrictions checkboxes', () => {
  });

  it('should display picky eaters checkbox', () => {
  });

  it('should display submit button', () => {
  });

  it('should not submit if form is invalid (i.e. required fields are empty)', () => {
  });

  it('should submit if form is valid', () => {
  });

  it('should display meal-result component after submission', () => {
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
