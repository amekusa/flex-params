/**
 * Unit Tests
 *
 * To run the tests, mocha is required:
 * $ npm i -g mocha
 */

const // Modules
  assert = require('assert'),
  flexParams = require('./index.js');

describe('Specs:', () => {
  let patterns = [
    { flag:['boolean', false], name:['string', 'alfa'] },
    { str:'string', num:['number', 1], name:['string', 'bravo'] },
    { num:'number', flag:'boolean', name:['string', 'charlie'] }
  ];
  describe(`If the receiver is a object,`, () => {
    it(`returns the matched pattern`, () => {
      let r = flexParams(['abc', 8], patterns, {});
      assert.equal(r.name.def, 'bravo');
    });
  });
  describe(`If the receiver is a function,`, () => {
    it(`passes the resulting object to the function as the 1st arg`, () => {
      let r = flexParams(['abc', 8], patterns, result => {
        assert.deepEqual(result, {str:'abc', num:8, name:'bravo'});
      });
    });
    it(`passes the pattern index to the function as the 2nd arg`, () => {
      let r = flexParams(['abc', 8], patterns, (result, pattern) => {
        assert.equal(pattern, 1);
      });
    });
    it(`returns the function's return`, () => {
      let r = flexParams(['abc', 8], patterns, result => {
        return 'R';
      });
      assert.equal(r, 'R');
    });
  });
});

describe(`Examples:`, () => {
  it(`Example #1`, example);
  it(`Example #2`, example2);
});

function example() {
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

  let test1 = foo();        // No argument
  let test2 = foo('ABC');   // A string
  let test3 = foo(8, true); // A number, A boolean

  console.log('Test 1:', test1);
  console.log('Test 2:', test2);
  console.log('Test 3:', test3);

  assert.deepEqual(test1, { flag:false });
  assert.deepEqual(test2, { str:'ABC', num:1 });
  assert.deepEqual(test3, { num:8, flag:true });
}

function example2() {
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

  assert.deepEqual(thomas, { firstName:'Thomas', age:20 });
  assert.deepEqual(john,   { firstName:'John', lastName:'Doe', age:30 });
  assert.deepEqual(user1,  { id:1000 });
  assert.deepEqual(user2,  { login:'d4rk10rd', pass:{ key:'asdf' } });
}
