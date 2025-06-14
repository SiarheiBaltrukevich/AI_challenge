class Validator {
  constructor() {
    this.rules = [];
    this.errorMessage = null;
  }

  withMessage(message) {
    this.errorMessage = message;
    return this;
  }

  validate(value) {
    for (const rule of this.rules) {
      const result = rule(value);
      if (result !== true) {
        return {
          valid: false,
          error: this.errorMessage || result
        };
      }
    }
    return { valid: true };
  }
}

class StringValidator extends Validator {
  constructor() {
    super();
    this.rules.push((value) => {
      if (typeof value !== 'string') {
        return 'Value must be a string';
      }
      return true;
    });
  }

  minLength(length) {
    this.rules.push((value) => {
      if (value.length < length) {
        return `String must be at least ${length} characters long`;
      }
      return true;
    });
    return this;
  }

  maxLength(length) {
    this.rules.push((value) => {
      if (value.length > length) {
        return `String must not exceed ${length} characters`;
      }
      return true;
    });
    return this;
  }

  pattern(regex) {
    this.rules.push((value) => {
      if (!regex.test(value)) {
        return 'String does not match required pattern';
      }
      return true;
    });
    return this;
  }
}

class NumberValidator extends Validator {
  constructor() {
    super();
    this.rules.push((value) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Value must be a number';
      }
      return true;
    });
  }

  min(minValue) {
    this.rules.push((value) => {
      if (value < minValue) {
        return `Number must be greater than or equal to ${minValue}`;
      }
      return true;
    });
    return this;
  }

  max(maxValue) {
    this.rules.push((value) => {
      if (value > maxValue) {
        return `Number must be less than or equal to ${maxValue}`;
      }
      return true;
    });
    return this;
  }
}

class BooleanValidator extends Validator {
  constructor() {
    super();
    this.rules.push((value) => {
      if (typeof value !== 'boolean') {
        return 'Value must be a boolean';
      }
      return true;
    });
  }
}

class DateValidator extends Validator {
  constructor() {
    super();
    this.rules.push((value) => {
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        return 'Value must be a valid date';
      }
      return true;
    });
  }

  min(minDate) {
    this.rules.push((value) => {
      if (value < minDate) {
        return `Date must be after ${minDate.toISOString()}`;
      }
      return true;
    });
    return this;
  }

  max(maxDate) {
    this.rules.push((value) => {
      if (value > maxDate) {
        return `Date must be before ${maxDate.toISOString()}`;
      }
      return true;
    });
    return this;
  }
}

class ObjectValidator extends Validator {
    constructor(schema) {
      super();
      this.schema = schema;
      this.rules.push((value) => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return 'Value must be an object';
        }
        return true;
      });
    }
  
    validate(value) {
      const baseValidation = super.validate(value);
      if (!baseValidation.valid) {
        return baseValidation;
      }
  
      const errors = {};
      let hasErrors = false;
  
      for (const [key, validator] of Object.entries(this.schema)) {
        if (value[key] === undefined) {
          if (!(validator && validator.isOptional)) {
            errors[key] = 'Field is required';
            hasErrors = true;
          }
          continue;
        }
  
        const result = validator.validate(value[key]);
        if (!result.valid) {
          if (result.errors) {
            errors[key] = result.errors;
          } else {
            errors[key] = result.error;
          }
          hasErrors = true;
        }
      }
  
      if (hasErrors) {
        return {
          valid: false,
          errors
        };
      }
  
      return { valid: true };
    }
  }
  
  class ArrayValidator extends Validator {
    constructor(itemValidator) {
      super();
      this.itemValidator = itemValidator;
      this.rules.push((value) => {
        if (!Array.isArray(value)) {
          return 'Value must be an array';
        }
        return true;
      });
    }
  
    minLength(length) {
      this.rules.push((value) => {
        if (value.length < length) {
          return `Array must have at least ${length} items`;
        }
        return true;
      });
      return this;
    }
  
    maxLength(length) {
      this.rules.push((value) => {
        if (value.length > length) {
          return `Array must not exceed ${length} items`;
        }
        return true;
      });
      return this;
    }
  
    unique() {
      this.rules.push((value) => {
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
          return 'Array must contain unique values';
        }
        return true;
      });
      return this;
    }
  
    validate(value) {
      const baseValidation = super.validate(value);
      if (!baseValidation.valid) {
        return baseValidation;
      }
  
      const errors = {};
      let hasErrors = false;
  
      for (let i = 0; i < value.length; i++) {
        const result = this.itemValidator.validate(value[i]);
        if (!result.valid) {
          errors[i] = result.error;
          hasErrors = true;
        }
      }
  
      if (hasErrors) {
        return {
          valid: false,
          errors,
          message: 'Array contains invalid items'
        };
      }
  
      return { valid: true };
    }
  }
  
  module.exports = {
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ObjectValidator,
    ArrayValidator
  }; 