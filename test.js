const flexParams = require('./index.js');

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
