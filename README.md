<img src="enigma.png" alt="Broken Enigma Machine" width="300"/>

# Enigma Machine Simulator

A fully functional Enigma machine simulator with comprehensive test coverage.

## Features

- Authentic Enigma machine encryption/decryption
- Support for 3 rotor configurations (Rotor I, II, III)
- Plugboard functionality
- Ring settings support
- Correct double-stepping behavior
- Interactive command-line interface

## Installation

```bash
npm install
```

## Usage

### Interactive Mode

Run the Enigma machine interactively:

```bash
npm start
```

### Programmatic Usage

```javascript
const { Enigma } = require('./enigma.js');

// Create an Enigma machine
const enigma = new Enigma(
  [0, 1, 2],           // Rotor selection (I, II, III)
  [0, 0, 0],           // Initial rotor positions
  [0, 0, 0],           // Ring settings
  [['A', 'B']]         // Plugboard pairs
);

// Encrypt a message
const encrypted = enigma.process('HELLO WORLD');
console.log(encrypted);

// Decrypt (reset to same initial state)
const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const decrypted = enigma2.process(encrypted);
console.log(decrypted); // Should output: HELLO WORLD
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Run Tests Without Jest

```bash
node enigma.test.js
```

## Test Coverage

The test suite covers:

### Core Functionality
- ✅ Rotor stepping and double-stepping behavior
- ✅ Character encryption/decryption
- ✅ Plugboard swapping
- ✅ Ring settings
- ✅ Reflector logic

### Edge Cases
- ✅ Position overflow handling
- ✅ Non-alphabetic character handling
- ✅ Empty string processing
- ✅ Complex rotor configurations

### Integration Tests
- ✅ Long message encryption/decryption
- ✅ Reciprocal property verification
- ✅ State maintenance across operations

### Historical Accuracy
- ✅ Correct double-stepping implementation
- ✅ Authentic rotor wiring
- ✅ Proper notch behavior

## Bug Fixes Applied

1. **Critical Fix**: Corrected the rotor stepping logic to properly implement double-stepping behavior
2. **Enhancement**: Added comprehensive input validation
3. **Improvement**: Added bounds checking for rotor positions

## Configuration

### Rotor Types
- **Rotor I**: Wiring `EKMFLGDQVZNTOWYHXUSPAIBRCJ`, Notch at `Q`
- **Rotor II**: Wiring `AJDKSIRUXBLHWTMCQGZNPYFVOE`, Notch at `E`
- **Rotor III**: Wiring `BDFHJLCPRTXVZNYEIWGAKMUSQO`, Notch at `V`

### Reflector
- Uses the standard Enigma reflector wiring: `YRUHQSLDPXNGOKMIEBFZCWVJAT`

## Example Test Output

```
✓ Utility Functions
✓ Rotor Class operations
✓ Enigma Class encryption/decryption
✓ Double-stepping behavior
✓ Plugboard functionality
✓ Edge cases and error handling
✓ Integration tests
✓ Historical accuracy verification
```

## License

MIT
