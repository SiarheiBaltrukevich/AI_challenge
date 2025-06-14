const { Enigma, Rotor } = require('./enigma');

describe('Enigma Machine', () => {
  // Test rotor stepping
  test('Rotor stepping works correctly', () => {
    const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
    expect(rotor.position).toBe(0);
    rotor.step();
    expect(rotor.position).toBe(1);
    rotor.step();
    expect(rotor.position).toBe(2);
  });

  // Test rotor at notch detection
  test('Rotor at notch detection works', () => {
    const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 16); // Q is at position 16
    expect(rotor.atNotch()).toBe(true);
    rotor.step();
    expect(rotor.atNotch()).toBe(false);
  });

  // Test plugboard swapping
  test('Plugboard swapping works correctly', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
    expect(enigma.plugboardSwap('A')).toBe('B');
    expect(enigma.plugboardSwap('B')).toBe('A');
    expect(enigma.plugboardSwap('C')).toBe('C');
  });

  // Test basic encryption/decryption
  test('Basic encryption and decryption', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const message = 'HELLO';
    const encrypted = enigma.process(message);
    // Reset the Enigma instance for decryption
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test with different rotor positions
  test('Encryption works with different rotor positions', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [1, 1, 1], [0, 0, 0], []);
    const message = 'HELLO';
    expect(enigma1.process(message)).not.toBe(enigma2.process(message));
  });

  // Test with plugboard pairs
  test('Encryption works with plugboard pairs', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
    const message = 'HELLO';
    expect(enigma1.process(message)).not.toBe(enigma2.process(message));
  });

  // Test with different ring settings
  test('Encryption works with different ring settings', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 1, 1], []);
    const message = 'HELLO';
    expect(enigma1.process(message)).not.toBe(enigma2.process(message));
  });

  // Test with different rotor orders
  test('Encryption works with different rotor orders', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([1, 0, 2], [0, 0, 0], [0, 0, 0], []);
    const message = 'HELLO';
    expect(enigma1.process(message)).not.toBe(enigma2.process(message));
  });

  // Test with special characters
  test('Special characters are preserved', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const message = 'HELLO WORLD!';
    const encrypted = enigma.process(message);
    expect(encrypted).toMatch(/^[A-Z! ]+$/);
  });

  // Test with empty message
  test('Empty message returns empty string', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    expect(enigma.process('')).toBe('');
  });

  // Test with long message
  test('Long message encryption works', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const message = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
    const encrypted = enigma.process(message);
    expect(encrypted.length).toBe(message.length);
  });
}); 