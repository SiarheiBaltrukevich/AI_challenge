const {
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ObjectValidator,
  ArrayValidator
} = require('./library');

describe('StringValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new StringValidator();
  });

  test('validates string type', () => {
    expect(validator.validate('test')).toEqual({ valid: true });
    expect(validator.validate(123)).toEqual({ valid: false, error: 'Value must be a string' });
  });

  test('validates minLength', () => {
    validator.minLength(3);
    expect(validator.validate('ab')).toEqual({ valid: false, error: 'String must be at least 3 characters long' });
    expect(validator.validate('abc')).toEqual({ valid: true });
  });

  test('validates maxLength', () => {
    validator.maxLength(5);
    expect(validator.validate('abcdef')).toEqual({ valid: false, error: 'String must not exceed 5 characters' });
    expect(validator.validate('abcde')).toEqual({ valid: true });
  });

  test('validates pattern', () => {
    validator.pattern(/^[a-z]+$/);
    expect(validator.validate('abc123')).toEqual({ valid: false, error: 'String does not match required pattern' });
    expect(validator.validate('abc')).toEqual({ valid: true });
  });

  test('supports custom error messages', () => {
    validator.withMessage('Custom error');
    expect(validator.validate(123)).toEqual({ valid: false, error: 'Custom error' });
  });
});

describe('NumberValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new NumberValidator();
  });

  test('validates number type', () => {
    expect(validator.validate(123)).toEqual({ valid: true });
    expect(validator.validate('123')).toEqual({ valid: false, error: 'Value must be a number' });
    expect(validator.validate(NaN)).toEqual({ valid: false, error: 'Value must be a number' });
  });

  test('validates min value', () => {
    validator.min(5);
    expect(validator.validate(3)).toEqual({ valid: false, error: 'Number must be greater than or equal to 5' });
    expect(validator.validate(5)).toEqual({ valid: true });
  });

  test('validates max value', () => {
    validator.max(10);
    expect(validator.validate(15)).toEqual({ valid: false, error: 'Number must be less than or equal to 10' });
    expect(validator.validate(10)).toEqual({ valid: true });
  });
});

describe('BooleanValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new BooleanValidator();
  });

  test('validates boolean type', () => {
    expect(validator.validate(true)).toEqual({ valid: true });
    expect(validator.validate(false)).toEqual({ valid: true });
    expect(validator.validate('true')).toEqual({ valid: false, error: 'Value must be a boolean' });
  });
});

describe('DateValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DateValidator();
  });

  test('validates date type', () => {
    expect(validator.validate(new Date())).toEqual({ valid: true });
    expect(validator.validate('2023-01-01')).toEqual({ valid: false, error: 'Value must be a valid date' });
    expect(validator.validate(new Date('invalid'))).toEqual({ valid: false, error: 'Value must be a valid date' });
  });

  test('validates min date', () => {
    const minDate = new Date('2023-01-01');
    validator.min(minDate);
    expect(validator.validate(new Date('2022-12-31'))).toEqual({ valid: false, error: `Date must be after ${minDate.toISOString()}` });
    expect(validator.validate(minDate)).toEqual({ valid: true });
  });

  test('validates max date', () => {
    const maxDate = new Date('2023-12-31');
    validator.max(maxDate);
    expect(validator.validate(new Date('2024-01-01'))).toEqual({ valid: false, error: `Date must be before ${maxDate.toISOString()}` });
    expect(validator.validate(maxDate)).toEqual({ valid: true });
  });
});

describe('ObjectValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new ObjectValidator({
      name: new StringValidator(),
      age: new NumberValidator(),
      isActive: new BooleanValidator()
    });
  });

  test('validates object type', () => {
    expect(validator.validate([])).toEqual({ valid: false, error: 'Value must be an object' });
    expect(validator.validate(null)).toEqual({ valid: false, error: 'Value must be an object' });
    expect(validator.validate({})).toEqual({
      valid: false,
      errors: {
        name: 'Field is required',
        age: 'Field is required',
        isActive: 'Field is required'
      }
    });
  });

  test('validates required fields', () => {
    expect(validator.validate({})).toEqual({
      valid: false,
      errors: {
        name: 'Field is required',
        age: 'Field is required',
        isActive: 'Field is required'
      }
    });
  });

  test('validates field types', () => {
    expect(validator.validate({
      name: 123,
      age: 'invalid',
      isActive: 'true'
    })).toEqual({
      valid: false,
      errors: {
        name: 'Value must be a string',
        age: 'Value must be a number',
        isActive: 'Value must be a boolean'
      }
    });
  });

  test('validates nested objects', () => {
    const nestedValidator = new ObjectValidator({
      user: new ObjectValidator({
        name: new StringValidator()
      })
    });

    expect(nestedValidator.validate({
      user: { name: 123 }
    })).toEqual({
      valid: false,
      errors: {
        user: {
          name: 'Value must be a string'
        }
      }
    });
  });
});

describe('ArrayValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new ArrayValidator(new StringValidator());
  });

  test('validates array type', () => {
    expect(validator.validate([])).toEqual({ valid: true });
    expect(validator.validate({})).toEqual({ valid: false, error: 'Value must be an array' });
  });

  test('validates array items', () => {
    expect(validator.validate(['valid', 123, 'valid'])).toEqual({
      valid: false,
      errors: {
        1: 'Value must be a string'
      },
      message: 'Array contains invalid items'
    });
  });

  test('validates minLength', () => {
    validator.minLength(2);
    expect(validator.validate(['one'])).toEqual({ valid: false, error: 'Array must have at least 2 items' });
    expect(validator.validate(['one', 'two'])).toEqual({ valid: true });
  });

  test('validates maxLength', () => {
    validator.maxLength(2);
    expect(validator.validate(['one', 'two', 'three'])).toEqual({ valid: false, error: 'Array must not exceed 2 items' });
    expect(validator.validate(['one', 'two'])).toEqual({ valid: true });
  });

  test('validates unique values', () => {
    validator.unique();
    expect(validator.validate(['one', 'one', 'two'])).toEqual({ valid: false, error: 'Array must contain unique values' });
    expect(validator.validate(['one', 'two', 'three'])).toEqual({ valid: true });
  });
}); 