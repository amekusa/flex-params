- **ver.3.0.1** [Fix] Broken ES module loading since 3.0.0 has been fixed.
- **ver.3.0.0** The error handling API changed.

---

**flex-params** is a tiny, but powerful utility for writing a function that has flexible parameters.

As you know, JavaScript doesn't support **function overloading** like this:
```js
function foo(X)    { /* ... */ }
function foo(X, Y) { /* ... */ } // This makes the 1st foo() not callable
```

Yes, still you can do the same kind of thing with default parameters most of the time. But if you want more flexibility or scalability, flex-params allows you to define **multiple combinations of parameters** for a single function.

- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Defining a pattern of parameters](#defining-a-pattern-of-parameters)
    - [Default Values](#default-values)
  - [Let's see how it works](#lets-see-how-it-works)
  - [More Example](#more-example)
  - [Advanced Usage](#advanced-usage)
  - [Error Handling](#error-handling)
- [Appendix: Extra Types](#appendix-extra-types)

## Getting Started
Install it with NPM:
```sh
npm i flex-params
```

And `require()` it:

```js
const flexParams = require('flex-params');
```

or `import` it as an ES module:

```js
import flexParams from 'flex-params';
```

## Usage

In your function, pass an array of the arguments to `flexParams()` with any number of **patterns of parameters** <small>( explained later )</small> you desired.

```js
// Example Code
function foo(...args) {
  var result = {};

  flexParams(args, [
    { X:'string', Y:'int' },           // pattern #0
    { X:'string', Z:'bool', Y:'int' }, // pattern #1
    { Z:'bool', Y:'int', X:'string' }, // pattern #2
    ...                                // more patterns
  ], result);

  return result;
}

var r = foo('blah', 42);          // { X:'blah',   Y:42 }
var r = foo('blahh', true, 7);    // { X:'blahh',  Y:7,  Z:true }
var r = foo(false, 11, 'blaahh'); // { X:'blaahh', Y:11, Z:false }
```
In the code above, `args` is the array of arguments.

The 2nd parameter of `flexParams()` is an array of the *patterns*.  
`flexParams()` tries to find **the most suitable pattern** in the array for `args` by comparing the type strings defined in each pattern with actual types of `args`.

Once it is found, each value of `args` is stored into `result` <small>( the 3rd parameter )</small> as its properties.

### Defining a pattern of parameters
Each pattern must be a plain object that has one of some specific formats.  
The most basic format is like this:

```js
// Pattern Definition
{
  param_1st: '<type>',
  param_2nd: '<type>',
  ...
  param_nth: '<type>'
}
```

`'<type>'` is a string representation of *datatype* (ex. `'bool'`, `'string'`, `'array'`, `'object'`, etc. ) for each param, like this:

```js
{ foo:'string', bar:'boolean' }
```

This pattern means:
- The 1st param is `foo`, and it must be a string
- The 2nd param is `bar`, and it must be a boolean

#### Default Values
Instead of just a type string, you can also use an **array** to define the default value:

```js
{ foo:'string', bar:['boolean', false] }
```

Now the 2nd param `bar` turned to **optional**. The default value is `false`.

The pattern that contains optional parameters can be considered suitable even if **a fewer number of arguments** supplied. And the missing arguments will be filled with the default values of respective params.

### Let's see how it works
```js
// Example Code #1
function foo(...args) {
  let result = {};

  flexParams(args, [
    { flag:['boolean', false] },         // pattern #0
    { str:'string', num:['number', 1] }, // pattern #1
    { num:'number', flag:'boolean' }     // pattern #2
  ], result);

  return result;
}
```

You can see 3 patterns in the above example.  
Let's test it by passing various combinations of arguments:
```js
let test1 = foo();        // No argument
let test2 = foo('ABC');   // A string
let test3 = foo(8, true); // A number, A boolean

console.log('Test 1:', test1);
console.log('Test 2:', test2);
console.log('Test 3:', test3);
```

And these are the resulting objects:
```js
Test 1: { flag: false }
Test 2: { str: 'ABC', num: 1 }
Test 3: { num: 8, flag: true }
```

Now you can see:
- The test1 matched with pattern #0
- The test2 matched with pattern #1
- The test3 matched with pattern #2

### More Example
```js
// Example Code #2
const flexParams = require('flex-params');

class User {
  constructor(...args) {
    flexParams(args, [
      // patterns
      { firstName:'string', age:'int' },
      { firstName:'string', lastName:'string', age:'int' },
      { id:'int' },
      { login:'string', pass:Password }

    ], this); // Stores the args into 'this'
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

As you can see this example, you can pass `this` to the 3rd parameter of `flexParams()`. This way is useful for **initializing the instance** in the class constructor.

### Advanced Usage
About the 3rd parameter of `flexParams()`, it accepts not only an object but also a **function**.  
Look at this code:

```js
function foo(...args) {
  flexParams(args, [
    { flag:['boolean', false] },         // pattern #0
    { str:'string', num:['number', 1] }, // pattern #1
    { num:'number', flag:'boolean' }     // pattern #2

  ], (result, pattern) => { // Receiver Callback
    console.log('result:',  result);
    console.log('pattern:', pattern);
  });
  // Test ////////
  foo('XYZ', 512);
}
```

Console outputs:

```js
result: { str: 'XYZ', num: 512 }
pattern: 1
```

Let's call this function a **receiver callback**. Receiver callback runs immediately after `flexParams()` finished processing `args`.

Receiver callback takes 2 parameters: `result` and `pattern`.  
 `result` is an object that contains all the `args` as its properties. `pattern` is **the index number of the matched pattern**, which is `1` <small>( means pattern #1 )</small> at this time.  
This index is useful if you want to do some different things for each pattern with `switch-case` or `if-else-if`, like this:

```js
function foo(...args) {
  return flexParams(args, [
    { flag:['boolean', false] },         // pattern #0
    { str:'string', num:['number', 1] }, // pattern #1
    { num:'number', flag:'boolean' }     // pattern #2

  ], (result, pattern) => { // Receiver Callback
    switch (pattern) { // Do stuff for each pattern
      case 0: return 'The first pattern matched.';
      case 1: return 'The second pattern matched.';
      case 2: return 'The last pattern matched.';
    }
  });
}
//// Test ////////
console.log( foo('XYZ', 512)   ); // 'The second pattern matched.'
console.log( foo(65535, false) ); // 'The last pattern matched.'
console.log( foo()             ); // 'The first pattern matched.'
```

### Error Handling

If all the given patterns didn't match for the arguments, `flexParams()` returns `false`. But there is also another way to handle this situation. **The 4th parameter: `fallback`**.

`fallback` can be:

- a) **a callback**,  
- b) **an object**, or  
- c) **any other type of value** <small>( except for `undefined` )</small>.

a) If you passed a callback, it is called when all the given patterns mismatched.  
Tha callback receives **an object** as its parameter with these properties:
- **args**: The original array of arguments
- **patterns**: The array of all the patterns
- **receiver**: The receiver object or function passed to the 3rd parameter
- **error**: An Exception object ( `flexParams.InvalidArgument` )

b) You can pass an plain object as the `fallback` with these optional properties:
- **log**: A string to be sent to `console.log()`
- **warn**: A string to be sent to `console.warn()`
- **error**: A string to be sent to `console.error()`
- **throw**: Any type of value to be thrown as an exception
  - If you set `true` , an Exception object is thrown ( `flexParams.InvalidArgument` )

c) Any other type of value as the `fallback` , is returned straightly by `flexParams()` if all the given patterns mismatched.

## Appendix: Extra Types

flex-params supports some special types in addition to [JavaScript's builtin datatypes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).

| type | description |
|-----:|:------------|
| `bool` | Alias of `boolean` |
| `int` `integer` | Matches for integers |
| `float` `double` | Matches for `number`s except for integers |
| `array` | Matches for arrays |
| A class constructor | Matches for the class instances |

---

&copy; 2020 [amekusa](https://amekusa.com)
