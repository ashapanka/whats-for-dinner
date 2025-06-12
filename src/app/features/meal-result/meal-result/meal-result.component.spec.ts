import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealResultComponent } from './meal-result.component';

fdescribe('MealResultComponent', () => {
  let component: MealResultComponent;
  let fixture: ComponentFixture<MealResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MealResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display meal name', () => {
    const mealName = fixture.nativeElement.querySelector('p.name');
    expect(mealName).toBeTruthy();
  });

  it('should display short description of meal', () => {
    const mealDescription = fixture.nativeElement.querySelector('p.description');
    expect(mealDescription).toBeTruthy();
  });

  it('should display ingredients list', () => {
    const ingredientsList = fixture.nativeElement.querySelector('p.ingredients');
    expect(ingredientsList).toBeTruthy();
  });

  it('should display simple prep instructions', () => {
    const preparationTime = fixture.nativeElement.querySelector('p.preparationTime');
    expect(preparationTime).toBeTruthy();
  });

  it('should display estimated cook time', () => {
    const cookTime = fixture.nativeElement.querySelector('p.cookingTime');
    expect(cookTime).toBeTruthy();
  });

  it('should display picky eater tip if this checkbox was selected in form', () => {
    const pickyEaterTip = fixture.nativeElement.querySelector('p.pickyEaterTip');
    expect(pickyEaterTip).toBeTruthy();
  });

  xit('should not display picky eater tip if this checkbox was not selected in form', () => {
    const pickyEaterTip = fixture.nativeElement.querySelector('p.pickyEaterTip');
    expect(pickyEaterTip).toBeFalsy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
