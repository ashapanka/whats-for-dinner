import { SharedDataService } from './shared-data.service';

describe('SharedDataService', () => {
  let service: SharedDataService;

  beforeEach(() => {
    service = new SharedDataService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Default Values', () => {
    it('should have a title', () => {
      expect(service.title).toEqual("What's for dinner?");
    });

    it('should have a description', () => {
      expect(service.description).toEqual(
        'A simple app to help you decide what to eat for dinner.',
      );
    });

    it('should have mealFormData as null by default', () => {
      expect(service.mealFormData).toBeNull();
    });

    it('should have mealPrompt as an empty string by default', () => {
      expect(service.mealPrompt).toEqual('');
    });
  });

  describe('mealFormData', () => {
    it('should allow setting mealFormData with complete form data', () => {
      // Arrange
      const formData = {
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        cuisinePreferences: ['Italian', 'Mexican'],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: true,
          peanutAllergy: false,
          other: false,
          otherRestriction: '',
        },
        pickyEaters: false,
      };

      // Act
      service.mealFormData = formData;

      // Assert
      expect(service.mealFormData).toEqual(formData);
    });

    it('should allow setting mealFormData with minimal data', () => {
      // Arrange
      const formData = {
        timeAvailable: '5',
        numberOfPeople: 2,
        ingredients: 'pasta',
        cuisinePreferences: [],
        dietaryRestrictions: {},
      };

      // Act
      service.mealFormData = formData;

      // Assert
      expect(service.mealFormData).toEqual(formData);
    });

    it('should allow updating mealFormData', () => {
      // Arrange
      const initialData = {
        timeAvailable: '30',
        numberOfPeople: 2,
        ingredients: 'pasta',
      };
      const updatedData = {
        timeAvailable: '60',
        numberOfPeople: 4,
        ingredients: 'chicken, rice',
      };

      // Act
      service.mealFormData = initialData;
      expect(service.mealFormData).toEqual(initialData);

      service.mealFormData = updatedData;

      // Assert
      expect(service.mealFormData).toEqual(updatedData);
      expect(service.mealFormData).not.toEqual(initialData);
    });

    it('should allow resetting mealFormData to null', () => {
      // Arrange
      service.mealFormData = {
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken',
      };

      // Act
      service.mealFormData = null;

      // Assert
      expect(service.mealFormData).toBeNull();
    });

    it('should preserve cuisine preferences when set', () => {
      // Arrange
      const formData = {
        timeAvailable: '45',
        numberOfPeople: 2,
        ingredients: 'pasta',
        cuisinePreferences: ['Italian', 'Mediterranean', 'French'],
        dietaryRestrictions: {},
      };

      // Act
      service.mealFormData = formData;

      // Assert
      expect(service.mealFormData.cuisinePreferences).toEqual([
        'Italian',
        'Mediterranean',
        'French',
      ]);
    });

    it('should preserve dietary restrictions when set', () => {
      // Arrange
      const formData = {
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken',
        dietaryRestrictions: {
          glutenFree: true,
          dairyFree: true,
          vegetarian: false,
          peanutAllergy: false,
          other: true,
          otherRestriction: 'shellfish',
        },
      };

      // Act
      service.mealFormData = formData;

      // Assert
      expect(service.mealFormData.dietaryRestrictions.glutenFree).toBeTrue();
      expect(service.mealFormData.dietaryRestrictions.dairyFree).toBeTrue();
      expect(service.mealFormData.dietaryRestrictions.other).toBeTrue();
      expect(service.mealFormData.dietaryRestrictions.otherRestriction).toBe('shellfish');
    });
  });

  describe('mealPrompt', () => {
    it('should allow setting mealPrompt', () => {
      // Arrange
      const prompt = 'Suggest a dinner recipe for 4 people with chicken and rice';

      // Act
      service.mealPrompt = prompt;

      // Assert
      expect(service.mealPrompt).toEqual(prompt);
    });

    it('should allow updating mealPrompt', () => {
      // Arrange
      const initialPrompt = 'Initial prompt';
      const updatedPrompt = 'Updated prompt with more details';

      // Act
      service.mealPrompt = initialPrompt;
      expect(service.mealPrompt).toEqual(initialPrompt);

      service.mealPrompt = updatedPrompt;

      // Assert
      expect(service.mealPrompt).toEqual(updatedPrompt);
      expect(service.mealPrompt).not.toEqual(initialPrompt);
    });

    it('should allow resetting mealPrompt to empty string', () => {
      // Arrange
      service.mealPrompt = 'Some prompt';

      // Act
      service.mealPrompt = '';

      // Assert
      expect(service.mealPrompt).toEqual('');
    });

    it('should handle long prompts', () => {
      // Arrange
      const longPrompt = `Suggest a dinner recipe that:
- Takes about 30 minutes to prepare
- Serves 4 people
- Uses some of these ingredients: chicken, rice, broccoli
- Focuses on these cuisines: Italian, Mexican
- Accommodates these dietary restrictions: vegetarian, gluten-free
- Include tips for picky eaters`;

      // Act
      service.mealPrompt = longPrompt;

      // Assert
      expect(service.mealPrompt).toEqual(longPrompt);
      expect(service.mealPrompt.length).toBeGreaterThan(100);
    });
  });

  describe('Data Persistence', () => {
    it('should maintain both mealFormData and mealPrompt independently', () => {
      // Arrange
      const formData = {
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken',
      };
      const prompt = 'Test prompt';

      // Act
      service.mealFormData = formData;
      service.mealPrompt = prompt;

      // Assert
      expect(service.mealFormData).toEqual(formData);
      expect(service.mealPrompt).toEqual(prompt);
    });

    it('should not affect mealPrompt when mealFormData is updated', () => {
      // Arrange
      const prompt = 'Original prompt';
      service.mealPrompt = prompt;

      // Act
      service.mealFormData = { timeAvailable: '30', numberOfPeople: 2, ingredients: 'pasta' };

      // Assert
      expect(service.mealPrompt).toEqual(prompt);
    });

    it('should not affect mealFormData when mealPrompt is updated', () => {
      // Arrange
      const formData = { timeAvailable: '30', numberOfPeople: 2, ingredients: 'pasta' };
      service.mealFormData = formData;

      // Act
      service.mealPrompt = 'New prompt';

      // Assert
      expect(service.mealFormData).toEqual(formData);
    });
  });

  describe('Readonly Properties', () => {
    it('should not allow modifying title', () => {
      // The title property is readonly, so TypeScript will prevent modification at compile time
      // This test verifies the value remains constant
      const originalTitle = service.title;
      expect(originalTitle).toEqual("What's for dinner?");
      // Attempting to modify would cause a TypeScript error:
      // service.title = 'New Title'; // This would fail at compile time
    });

    it('should not allow modifying description', () => {
      // The description property is readonly, so TypeScript will prevent modification at compile time
      // This test verifies the value remains constant
      const originalDescription = service.description;
      expect(originalDescription).toEqual(
        'A simple app to help you decide what to eat for dinner.',
      );
      // Attempting to modify would cause a TypeScript error:
      // service.description = 'New Description'; // This would fail at compile time
    });
  });
});
