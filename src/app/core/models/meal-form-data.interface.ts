/**
 * Interface for meal form data submitted by the user
 */
export interface MealFormData {
  timeAvailable: string;
  numberOfPeople: number;
  ingredients: string[];
  dietaryRestrictions?: {
    glutenFree: boolean;
    dairyFree: boolean;
    vegetarian: boolean;
    peanutAllergy: boolean;
    other: boolean;
    otherDescription: string;
  };
  pickyEaters?: boolean;
}
