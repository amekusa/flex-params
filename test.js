/**
* Unit Tests
*
* To run the tests, mocha is required:
* $ npm i -g mocha
*/

const // Modules
	assert = require('assert'),
	flexParams = require('./bundle.js');

describe('Specs:', () => {
	let patterns = [
		{ flag:['boolean', false], name:['string', 'alfa'] },
		{ str:'string', num:['number', 1], name:['string', 'bravo'] },
		{ num:'number', flag:'boolean', name:['string', 'charlie'] }
	];
	describe(`If the receiver is an object,`, () => {
		it(`stores all the args into the object`, () => {
			let r = {};
			flexParams(['abc', 8], patterns, r);
			assert.deepEqual(r, {str:'abc', num:8, name:'bravo'});
		});
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
	describe(`If there is no pattern matched,`, () => {
		it(`returns false if the fallback is undefined (default)`, () => {
			let r = flexParams(['x', 'y', 'z'], patterns, {});
			assert.equal(r, false);
		});
		it(`runs fallback() if it's a function, and returns the function's return`, () => {
			let receiver = {};
			let r = flexParams(['x', 'y', 'z'], patterns, receiver, arg => {
				assert.deepEqual(arg.args, ['x', 'y', 'z']);
				assert.deepEqual(arg.patterns, patterns);
				assert.strictEqual(arg.receiver, receiver);
				assert.ok(arg.error instanceof flexParams.InvalidArgument);
				assert.deepEqual(arg.error.info.arguments, ['x', 'y', 'z']);
				assert.deepEqual(arg.error.info.expectedPatterns, patterns);
				return 'R';
			});
			assert.equal(r, 'R');
		});
		it(`throws fallback.throw`, () => {
			let r;
			let err = new Error('fallback');
			try {
				flexParams(['x', 'y', 'z'], patterns, {}, { throw: err });
			} catch(e) {
				r = e;
			}
			assert.deepEqual(r, err);
		});
		it(`returns the fallback if it's not undefined, a function, nor an object`, () => {
			let r = flexParams(['x', 'y', 'z'], patterns, {}, 'FALLBACK');
			assert.equal(r, 'FALLBACK');
		});
	});
});

describe(`Examples:`, () => {
	it(`Example #0`, example0);
	it(`Example #1`, example1);
	it(`Example #2`, example2);
	it(`Example #3`, example3);
	it(`Example #3-2`, example3_2);
});

function example0() {
	function foo(...args) {
		var result = {};

		flexParams(args, [
			{ X:'string', Y:'int' },           // pattern #0
			{ X:'string', Z:'bool', Y:'int' }, // pattern #1
			{ Z:'bool', Y:'int', X:'string' }  // pattern #2
		], result);

		return result;
	}

	var r1 = foo('blah', 42);          // { X:'blah',   Y:42 }
	var r2 = foo('blahh', true, 7);    // { X:'blahh',  Y:7,  Z:true }
	var r3 = foo(false, 11, 'blaahh'); // { X:'blaahh', Y:11, Z:false }

	console.log('r1:', r1);
	console.log('r2:', r2);
	console.log('r3:', r3);
}

function example1() {
	//# Example Code
	function foo(...args) {
		let result = {};

		flexParams(args, [
			{ flag:['boolean', false] },         // pattern #0
			{ str:'string', num:['number', 1] }, // pattern #1
			{ num:'number', flag:'boolean' }     // pattern #2
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

function example3() {
	function foo(...args) {
		flexParams(args, [
			{ flag:['boolean', false] },         // pattern #0
			{ str:'string', num:['number', 1] }, // pattern #1
			{ num:'number', flag:'boolean' }     // pattern #2

		], (result, pattern) => { // Receiver Callback
			console.log('result:',  result);
			console.log('pattern:', pattern);

			assert
		});
	}
	//// Test ////////
	foo('XYZ', 512);
}

function example3_2() {
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
}
