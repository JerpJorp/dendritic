import { Faker } from './faker';

describe('Faker', () => {
  it('should create an instance', () => {
    expect(new Faker()).toBeTruthy();
  });
});
