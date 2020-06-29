**flex-params** is a tiny, but powerful utility for writing a function that has flexible parameters.

As you know, JavaScript doesn't allow **function overloading** like this:
```js
function foo(X)    { /* ... */ }
function foo(X, Y) { /* ... */ } // This makes the 1st foo() not callable
```

Yes, still you can do the same thing with default parameters most of the time. But if you want more flexibility or scalability, flex-params allows you to define **multiple combinations of parameters** for a single function.

Because flex-params itself is just a single function and has no dependency, you can use it for any kind of projects with no problem.

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
In your function, pass the array of arguments to `flexParams()` with any number of **patterns of parameters** (explained later) you desired.

```js
//# Example Code
function foo(...args) {
  let result = {};

  flexParams(args, [
    { /*     pattern definition     */ },
    { /* another pattern definition */ },
    { /*  more pattern if you want  */ },
    // ...
  ], result);

  return result;
}
foo('A', 'B', 'C');
```
In the code above, `args` is the array of arguments.

The 2nd parameter of `flexParams()` is an array of the *patterns*.  
`flexParams()` tries to find **the suitable pattern at the first** in the array by comparing each pattern with `args`.  
Once it is found, each item of `args` is stored into `result` (the 3rd parameter) as its properties.

### Defining a pattern of parameters
Each pattern must be a plain object that has one of some specific formats.  
The most basic format is like this:
```js
//# Pattern Definition
{
  <1st-param>: '<type>',
  <2nd-param>: '<type>',
  ...
  <nth-param>: '<type>'
}
```

`'<type>'` is the name of the *datatype* kinda like `'boolean'`, `'string'`, or `'object'`, etc. for each param.  
So you can write like this for instance:
```js
{ foo:'string', bar:'boolean' }
```

This pattern means:
- The 1st param is `foo`, and it must be a string
- The 2nd param is `bar`, and it must be a boolean

#### Setting default values
Now let's say you want to set the default value of `bar`, the last parameter.  
In the alternative format, instead of `'<type>'`, you can use an array such as:
```js
[ '<type>', <defaultValue> ]
```

So if you want to assign `false` as the default value to `bar`,  
it would be like this:
```js
{ foo:'string', bar:['boolean', false] }
```

**Important:** Assigning any value other than `undefined` as the default value makes the parameter **optional**.  
The pattern that contains optional parameters can be considered suitable even if **a fewer number of arguments** supplied. And the missing arguments will be filled with the default values of respective params.

### Let's see how it works
```js
//# Example Code
function foo(...args) {
  let result = {};

  flexParams(args, [
    { flag:['boolean', false] },         // pattern #1
    { str:'string', num:['number', 1] }, // pattern #2
    { num:'number', flag:'boolean' }     // pattern #3
  ], result);

  return result;
}
```

Now the example code has 3 actual patterns of parameters.  
Test it by passing various combinations of arguments:
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

And you can see:
- The test1 arguments matched with pattern #1
- The test2 arguments matched with pattern #2
- The test3 arguments matched with pattern #3

### Another Example
```js
const flexParams = require('flex-params');

class User {
  constructor(...args) {
    flexParams(args, [
      // patterns
      { firstName:'string', age:'int' },
      { firstName:'string', lastName:'string', age:'int' },
      { id:'int' },
      { login:'string', pass:Password }

    ], this);
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

As you can see this example, you can pass `this` as the receiver object to `flexParams()`. This way is useful for **initializing the instance** in the class constructor.

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
