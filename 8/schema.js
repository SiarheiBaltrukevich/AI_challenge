const { 
  StringValidator, 
  NumberValidator, 
  BooleanValidator, 
  DateValidator, 
  ObjectValidator, 
  ArrayValidator 
} = require('./library');

// Schema Builder
class Schema {
    static string() {
      return new StringValidator();
    }
    
    static number() {
      return new NumberValidator();
    }
    
    static boolean() {
      return new BooleanValidator();
    }
    
    static date() {
      return new DateValidator();
    }
    
    static object(schema) {
      return new ObjectValidator(schema);
    }
    
    static array(itemValidator) {
      return new ArrayValidator(itemValidator);
    }

    static optional(validator) {
      return {
        validate(value) {
          if (value === undefined) return { valid: true };
          return validator.validate(value);
        },
        isOptional: true
      };
    }
  }
  
  console.log('Schema.number() prototype:', Object.getPrototypeOf(Schema.number()));
  
  // Define a complex schema
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
    country: Schema.string()
  });
  
  const userSchema = Schema.object({
    id: Schema.string().withMessage('ID must be a string'),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.optional(Schema.number()),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: Schema.optional(addressSchema),
    metadata: Schema.optional(Schema.object({}))
  });
  
  // Validate data
  const userData = {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    tags: ["developer", "designer"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    }
  };
  
  const result = userSchema.validate(userData);
  console.log(result);
  