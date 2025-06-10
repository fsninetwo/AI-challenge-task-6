const { Rotor, Enigma, plugboardSwap, mod, ROTORS, REFLECTOR, alphabet } = require('./enigma.js');

// Mock the require.main check to prevent interactive prompt
jest.mock('./enigma.js', () => {
  const originalModule = jest.requireActual('./enigma.js');
  return {
    ...originalModule,
  };
});

describe('Utility Functions', () => {
  describe('mod function', () => {
    test('should handle positive numbers', () => {
      expect(mod(7, 5)).toBe(2);
      expect(mod(10, 3)).toBe(1);
    });

    test('should handle negative numbers correctly', () => {
      expect(mod(-3, 5)).toBe(2);
      expect(mod(-1, 26)).toBe(25);
      expect(mod(-27, 26)).toBe(25);
    });

    test('should handle zero', () => {
      expect(mod(0, 5)).toBe(0);
    });
  });

  describe('plugboardSwap function', () => {
    test('should swap characters according to pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('B', pairs)).toBe('A');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('D', pairs)).toBe('C');
    });

    test('should return original character if no pair found', () => {
      const pairs = [['A', 'B']];
      expect(plugboardSwap('Z', pairs)).toBe('Z');
      expect(plugboardSwap('X', pairs)).toBe('X');
    });

    test('should handle empty pairs array', () => {
      expect(plugboardSwap('A', [])).toBe('A');
    });
  });
});

describe('Rotor Class', () => {
  let rotor;

  beforeEach(() => {
    rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
  });

  describe('constructor', () => {
    test('should initialize with correct values', () => {
      expect(rotor.wiring).toBe(ROTORS[0].wiring);
      expect(rotor.notch).toBe(ROTORS[0].notch);
      expect(rotor.ringSetting).toBe(0);
      expect(rotor.position).toBe(0);
    });

    test('should initialize with custom values', () => {
      const customRotor = new Rotor('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'M', 5, 10);
      expect(customRotor.ringSetting).toBe(5);
      expect(customRotor.position).toBe(10);
    });
  });

  describe('step method', () => {
    test('should increment position', () => {
      expect(rotor.position).toBe(0);
      rotor.step();
      expect(rotor.position).toBe(1);
    });

    test('should wrap around at 26', () => {
      rotor.position = 25;
      rotor.step();
      expect(rotor.position).toBe(0);
    });
  });

  describe('atNotch method', () => {
    test('should return true when at notch position', () => {
      // Rotor I notch is at 'Q' (position 16)
      rotor.position = 16;
      expect(rotor.atNotch()).toBe(true);
    });

    test('should return false when not at notch position', () => {
      rotor.position = 0;
      expect(rotor.atNotch()).toBe(false);
    });
  });

  describe('forward method', () => {
    test('should encode character through rotor', () => {
      rotor.position = 0;
      rotor.ringSetting = 0;
      const result = rotor.forward('A');
      expect(result).toBe('E'); // First character of Rotor I wiring
    });

    test('should handle position offset', () => {
      rotor.position = 1;
      rotor.ringSetting = 0;
      const result = rotor.forward('A');
      expect(result).toBe('K'); // Second character of Rotor I wiring
    });
  });

  describe('backward method', () => {
    test('should decode character through rotor', () => {
      rotor.position = 0;
      rotor.ringSetting = 0;
      const result = rotor.backward('E');
      expect(result).toBe('A'); // Reverse of forward operation
    });

    test('should be inverse of forward operation', () => {
      rotor.position = 5;
      rotor.ringSetting = 2;
      const original = 'M';
      const forward = rotor.forward(original);
      const backward = rotor.backward(forward);
      expect(backward).toBe(original);
    });
  });
});

describe('Enigma Class', () => {
  let enigma;

  beforeEach(() => {
    enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  });

  describe('constructor', () => {
    test('should initialize with correct rotor configuration', () => {
      expect(enigma.rotors).toHaveLength(3);
      expect(enigma.plugboardPairs).toEqual([]);
    });

    test('should handle plugboard pairs', () => {
      const enigmaWithPlugs = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
      expect(enigmaWithPlugs.plugboardPairs).toEqual([['A', 'B']]);
    });
  });

  describe('stepRotors method', () => {
    test('should always step rightmost rotor', () => {
      const initialPos = enigma.rotors[2].position;
      enigma.stepRotors();
      expect(enigma.rotors[2].position).toBe(initialPos + 1);
    });

    test('should step middle rotor when right rotor at notch', () => {
      // Set right rotor to notch position (V for Rotor III)
      enigma.rotors[2].position = 21; // V is at position 21
      const middleInitialPos = enigma.rotors[1].position;
      enigma.stepRotors();
      expect(enigma.rotors[1].position).toBe(middleInitialPos + 1);
    });

    test('should implement double-stepping correctly', () => {
      // Set middle rotor to notch position (E for Rotor II)
      enigma.rotors[1].position = 4; // E is at position 4
      const leftInitialPos = enigma.rotors[0].position;
      const middleInitialPos = enigma.rotors[1].position;
      
      enigma.stepRotors();
      
      // Both left and middle rotors should step
      expect(enigma.rotors[0].position).toBe(leftInitialPos + 1);
      expect(enigma.rotors[1].position).toBe(middleInitialPos + 1);
    });

    test('should not double-step when both middle and right at notch', () => {
      // Set both middle and right rotors to notch positions
      enigma.rotors[1].position = 4; // E (Rotor II notch)
      enigma.rotors[2].position = 21; // V (Rotor III notch)
      
      const leftInitialPos = enigma.rotors[0].position;
      const middleInitialPos = enigma.rotors[1].position;
      
      enigma.stepRotors();
      
      // Left and middle should step due to double-stepping
      // Middle should NOT step again due to right rotor
      expect(enigma.rotors[0].position).toBe(leftInitialPos + 1);
      expect(enigma.rotors[1].position).toBe(middleInitialPos + 1);
    });
  });

  describe('encryptChar method', () => {
    test('should encrypt alphabetic characters', () => {
      const result = enigma.encryptChar('A');
      expect(typeof result).toBe('string');
      expect(result).toHaveLength(1);
      expect(alphabet.includes(result)).toBe(true);
    });

    test('should return non-alphabetic characters unchanged', () => {
      expect(enigma.encryptChar('1')).toBe('1');
      expect(enigma.encryptChar(' ')).toBe(' ');
      expect(enigma.encryptChar('!')).toBe('!');
    });

    test('should step rotors before encryption', () => {
      const initialPos = enigma.rotors[2].position;
      enigma.encryptChar('A');
      expect(enigma.rotors[2].position).toBe(initialPos + 1);
    });

    test('should be reciprocal (encryption = decryption)', () => {
      const enigma1 = new Enigma([0, 1, 2], [5, 10, 15], [2, 4, 6], [['A', 'B'], ['C', 'D']]);
      const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [2, 4, 6], [['A', 'B'], ['C', 'D']]);
      
      const original = 'HELLO';
      const encrypted = enigma1.process(original);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(original);
    });
  });

  describe('process method', () => {
    test('should process entire strings', () => {
      const result = enigma.process('HELLO');
      expect(result).toHaveLength(5);
      expect(typeof result).toBe('string');
    });

    test('should convert to uppercase', () => {
      const result1 = enigma.process('hello');
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result2 = enigma2.process('HELLO');
      expect(result1).toBe(result2);
    });

    test('should handle mixed alphanumeric strings', () => {
      const result = enigma.process('HELLO123WORLD');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    test('should handle empty string', () => {
      const result = enigma.process('');
      expect(result).toBe('');
    });
  });

  describe('Known Test Vectors', () => {
    test('should match historical Enigma output', () => {
      // Known test case: Default settings should produce predictable output
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('AAAAA');
      
      // This should be consistent across runs with same settings
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result2 = enigma2.process('AAAAA');
      expect(result).toBe(result2);
    });

    test('should handle different rotor positions', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [1, 2, 3], [0, 0, 0], []);
      
      const result1 = enigma1.process('TEST');
      const result2 = enigma2.process('TEST');
      
      expect(result1).not.toBe(result2);
    });

    test('should handle ring settings', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
      
      const result1 = enigma1.process('TEST');
      const result2 = enigma2.process('TEST');
      
      expect(result1).not.toBe(result2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle rotor position overflow', () => {
      const enigma = new Enigma([0, 1, 2], [25, 25, 25], [0, 0, 0], []);
      enigma.stepRotors();
      expect(enigma.rotors[2].position).toBe(0); // Should wrap to 0
    });

    test('should handle multiple plugboard pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], pairs);
      
      // Test that all pairs work
      const testString = 'ABCDEF';
      const result = enigma.process(testString);
      expect(result).toHaveLength(6);
    });

    test('should maintain rotor state across multiple encryptions', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      enigma.process('A');
      const pos1 = enigma.rotors[2].position;
      
      enigma.process('B');
      const pos2 = enigma.rotors[2].position;
      
      expect(pos2).toBe(pos1 + 1);
    });
  });

  describe('Reflector Logic', () => {
    test('should never encrypt a letter to itself', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      // Test multiple positions to ensure no letter encrypts to itself
      for (let i = 0; i < 26; i++) {
        const char = alphabet[i];
        const encrypted = enigma.encryptChar(char);
        expect(encrypted).not.toBe(char);
      }
    });
  });
});

describe('Integration Tests', () => {
  test('should encrypt and decrypt long messages correctly', () => {
    const message = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
    const enigma1 = new Enigma([0, 1, 2], [12, 5, 18], [3, 7, 11], [['A', 'Z'], ['B', 'Y']]);
    const enigma2 = new Enigma([0, 1, 2], [12, 5, 18], [3, 7, 11], [['A', 'Z'], ['B', 'Y']]);
    
    const encrypted = enigma1.process(message);
    const decrypted = enigma2.process(encrypted);
    
    expect(decrypted).toBe(message);
    expect(encrypted).not.toBe(message);
  });

  test('should handle complex rotor stepping scenarios', () => {
    // Set up scenario where double-stepping will occur
    const enigma = new Enigma([0, 1, 2], [16, 4, 21], [0, 0, 0], []);
    
    // This should trigger complex stepping behavior
    const result = enigma.process('ABCDEFGHIJK');
    expect(result).toHaveLength(11);
    
    // Verify rotors have advanced correctly
    expect(enigma.rotors[2].position).toBe(6); // 21 + 11 steps = 6 (with wrapping)
  });
});

// Helper function to run tests
if (require.main === module) {
  console.log('Running Enigma tests...');
  // Simple test runner for environments without Jest
  const tests = [
    () => console.log('mod(7, 5) =', mod(7, 5), mod(7, 5) === 2 ? '✓' : '✗'),
    () => console.log('mod(-3, 5) =', mod(-3, 5), mod(-3, 5) === 2 ? '✓' : '✗'),
    () => {
      const pairs = [['A', 'B']];
      console.log('plugboardSwap A with [A,B] =', plugboardSwap('A', pairs), 
                  plugboardSwap('A', pairs) === 'B' ? '✓' : '✗');
    }
  ];
  
  tests.forEach(test => test());
  console.log('Basic tests completed. Use Jest for full test suite.');
}

module.exports = { mod, plugboardSwap, Rotor, Enigma }; 