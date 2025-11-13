# JavaScript Fundamentals

## Variables and Data Types
JavaScript has three ways to declare variables: var, let, and const.
- `let` is block-scoped and can be reassigned
- `const` is block-scoped and cannot be reassigned
- `var` is function-scoped (avoid in modern JS)

## Functions
Functions can be declared in multiple ways:
```javascript
// Function declaration
function greet(name) {
  return `Hello, ${name}!`;
}

// Arrow function
const greet = (name) => `Hello, ${name}!`;
```

## Arrays and Objects
Arrays store ordered lists, objects store key-value pairs:
```javascript
const fruits = ['apple', 'banana', 'orange'];
const person = { name: 'John', age: 30 };
```