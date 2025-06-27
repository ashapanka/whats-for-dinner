import { SharedDataService } from './shared-data.service';

describe('SharedDataService', () => {
  let service: SharedDataService;

  beforeEach(() => {
    service = new SharedDataService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a title', () => {
    expect(service.title).toEqual("What's for dinner?");
  });

  it('should have a description', () => {
    expect(service.description).toEqual('A simple app to help you decide what to eat for dinner.');
  });

  it('should have mealFormData as null by default', () => {
    expect(service.mealFormData).toBeNull();
  });

  it('should have mealPrompt as an empty string by default', () => {
    expect(service.mealPrompt).toEqual('');
  });
});
