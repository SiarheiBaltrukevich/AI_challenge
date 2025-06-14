# Type-Safe Schema Validation System

A flexible and type-safe validation system for JavaScript objects, arrays, and primitive types. This system allows you to define schemas and validate data against them with detailed error reporting.

## Features

- Type-safe validation for strings, numbers, booleans, dates, objects, and arrays
- Chainable validation rules
- Custom error messages
- Optional fields support
- Nested object validation
- Array validation with item type checking
- Detailed error reporting

## Installation

```bash
npm install
```

## Usage

### Basic Types

```javascript
const { Schema } = require('./schema');

// String validation
const stringSchema = Schema.string()
  .minLength(2)
  .maxLength(50)
  .pattern(/^[a-zA-Z]+$/);

// Number validation
const numberSchema = Schema.number()
  .min(0)
  .max(100);

// Boolean validation
const booleanSchema = Schema.boolean();

// Date validation
const dateSchema = Schema.date()
  .min(new Date('2020-01-01'))
  .max(new Date('2025-12-31'));
```

### Object Validation

```javascript
const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  address: Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/),
    country: Schema.string()
  }).optional()
});

// Validate data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  isActive: true,
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);
```

### Array Validation

```javascript
const tagsSchema = Schema.array(Schema.string())
  .minLength(1)
  .maxLength(5)
  .unique();

const numbersSchema = Schema.array(Schema.number())
  .minLength(2)
  .maxLength(10);

// Validate arrays
const tags = ["developer", "designer", "developer"]; // Will fail due to duplicate
const numbers = [1, 2, 3, 4, 5];

const tagsResult = tagsSchema.validate(tags);
const numbersResult = numbersSchema.validate(numbers);
```

## Validation Methods

### String Validator
- `minLength(length)`: Minimum string length
- `maxLength(length)`: Maximum string length
- `pattern(regex)`: Regex pattern matching
- `withMessage(message)`: Custom error message

### Number Validator
- `min(value)`: Minimum value
- `max(value)`: Maximum value
- `withMessage(message)`: Custom error message

### Date Validator
- `min(date)`: Minimum date
- `max(date)`: Maximum date
- `withMessage(message)`: Custom error message

### Array Validator
- `minLength(length)`: Minimum array length
- `maxLength(length)`: Maximum array length
- `unique()`: Ensure unique values
- `withMessage(message)`: Custom error message

### Object Validator
- Nested object validation
- Optional fields support
- Detailed error reporting for nested objects

## Error Format

Validation errors are returned in the following format:

```javascript
// For simple validators
{
  valid: false,
  error: "Error message"
}

// For object validators
{
  valid: false,
  errors: {
    field1: "Error message",
    field2: "Error message"
  }
}

// For array validators
{
  valid: false,
  errors: [
    "Error message for index 0",
    "Error message for index 1"
  ],
  message: "Array contains invalid items"
}
```

## Example: Complex Schema

```javascript
const productSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(3).maxLength(100),
  price: Schema.number().min(0),
  categories: Schema.array(Schema.string()).minLength(1),
  metadata: Schema.object({
    sku: Schema.string(),
    weight: Schema.number().optional(),
    dimensions: Schema.object({
      width: Schema.number(),
      height: Schema.number(),
      depth: Schema.number()
    }).optional()
  }).optional(),
  tags: Schema.array(Schema.string()).unique(),
  createdAt: Schema.date(),
  isActive: Schema.boolean()
});
```

## Contributing

Feel free to submit issues and enhancement requests! 