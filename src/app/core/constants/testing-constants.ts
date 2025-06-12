/**
 * Testing constants
 *
 * This file contains constant values used in tests throughout the application.
 * Using constants instead of hardcoded values makes tests more maintainable
 * and ensures consistency between tests and application code.
 */

export const TestingConstants = {
  // Application general
  APP_TITLE: "What's for dinner?",
  APP_DESCRIPTION: 'A simple app to help you decide what to eat for dinner.',

  // Form labels
  FORM: {
    TIME_AVAILABLE_LABEL: 'Time Available',
    NUMBER_OF_PEOPLE_LABEL: 'Number of People',
    INGREDIENTS_LABEL: 'Ingredients',
    INGREDIENTS_PLACEHOLDER: 'List ingredients separated by commas',
    DIETARY_RESTRICTIONS_LABEL: 'Dietary Restrictions',
    PICKY_EATERS_LABEL: 'Picky Eaters',
    SUBMIT_BUTTON: 'Submit',
    OTHER_RESTRICTION_LABEL: 'Specify Restriction',
    OTHER_RESTRICTION_PLACEHOLDER: 'Please specify your dietary restriction',
  },

  // Dietary restrictions
  DIETARY_RESTRICTIONS: {
    GLUTEN_FREE: 'Gluten Free',
    DAIRY_FREE: 'Dairy Free',
    VEGETARIAN: 'Vegetarian',
    PEANUT_ALLERGY: 'Peanut Allergy',
    OTHER: 'Other',
  },

  // Time options
  TIME_OPTIONS: {
    FIVE_MIN: '5 minutes',
    FIFTEEN_MIN: '15 minutes',
    THIRTY_MIN: '30 minutes',
    FORTY_FIVE_MIN: '45 minutes',
    ONE_HOUR: '1 hour',
  },

  // Results page
  RESULTS: {
    TITLE_SUFFIX: ' - Results',
    SUGGESTION_INTRO: "Here's your meal suggestion based on your inputs.",
    BACK_BUTTON: 'Back to Form',
  },
};
