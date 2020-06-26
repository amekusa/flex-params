**flex-params** is a tiny but powerful utility for writing functions that have flexible parameters.
Because flex-params is just a single function and has no dependency, you can use it for any kind of projects with no problem.

- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Declaring a pattern](#declaring-a-pattern)
  - [Usage Examples](#usage-examples)
- [Appendix: Extra types supported](#appendix-extra-types-supported)

## Getting Started

Install it with NPM:
```sh
npm i flex-params --save
```

Import it with `require()` in your JS:
```js
const flexParams = require('flex-params');
```

## Usage
Call `flexParams()` inside your function to parse the flexible arguments according to the *patterns* (explained later) you desired.

```js
// Example code
function someFunction(...args) {
  let data = {};
  flexParams(args, data, [
    { /* pattern declaration */ },
    { /* another pattern declaration */ },
    { /* more pattern */ },
    // ...
  ]);
  return data;
}
```
In the code above, `args` is an array of arguments.  
`data` is a "receiver" object that the parsed arguments will be stored in as its properties.  
The 3rd parameter of `flexParams()` is an array of *patterns*.
`args` will be parsed according to one of these patterns that **its parameter types matched for `args` at first**.

### Declaring a pattern
Each pattern must be a plain object with the following format:
```js
{
  <1st-param>: '<type>',
  <2nd-param>: '<type>',
  ...
  <nth-param>: '<type>'
}
```

And here is an example pattern that actually works:
```js
{
  paramX: 'int',
  paramY: 'boolean',
  paramZ: 'array',
  paramN: { type:'string', def:'ABC' }
}
```
`paramN: { type:'string', def:'ABC' }` is the same as if you write `paramN: 'string'` but it has the default value `'ABC'`.

**Important:** The order **matters** because the each param corresponds to the each argument ordered as passed to your function.
That means, in this example, `flexParams()` checks if:
- `args[0]` matches for `paramX`
- `args[1]` matches for `paramY`
- `args[2]` matches for `paramZ`
- `args[3]` matches for `paramN`

### Usage Example
```js
const flexParams = require('flex-params');

class User {
  constructor(...args) {
    flexParams(args, this, [
      // patterns
      { firstName:'string', age:'int' },
      { firstName:'string', lastName:'string', age:'int' },
      { id:'int' },
      { login:'string', pass:Password }
    ]);
  }
}

class Password {
  constructor(key) {
    this.key = key;
  }
}

//// Test ////////////
let thomas = new User('Thomas', 20);
let john   = new User('John', 'Doe', 30);
let user1  = new User(1000);
let user2  = new User('d4rk10rd', new Password('asdf'));

console.log(thomas);
console.log(john);
console.log(user1);
console.log(user2);

```
Console outputs:
```js
User { firstName: 'Thomas', age: 20 }
User { firstName: 'John', lastName: 'Doe', age: 30 }
User { id: 1000 }
User { login: 'd4rk10rd', pass: Password { key: 'asdf' } }
```

## Appendix: Extra types supported
flex-params supports some special types in addition to [JavaScript's builtin datatypes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).

| type | description |
|:-----|:------------|
| bool | Alias of `boolean` |
| int, integer | Matches for integers |
| float, double | Matches for `number`s except for integers |
| array | Matches for arrays |
| A class constructor | Matches for the class instances |

---

&copy; 2020 [amekusa](https://amekusa.com)
