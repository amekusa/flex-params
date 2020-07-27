class Exception extends Error {
	constructor(msg, info = {}) {
		super(msg);
		this._info = info;
		this.name = this.constructor.name;
	}
	get info() {
		return this._info;
	}
}

const E = {
	Exception,
	InvalidArgument: class extends Exception {
		constructor(info = {}) {
			super(`The passed argument doesn't match for the expected pattern(s)`, info);
		}
	},
	InvalidPatternFormat: class extends Exception {
		constructor(info = {}) {
			super(`The parameter pattern should be an object`, info);
		}
	},
	InvalidParamFormat: class extends Exception {
		constructor(info = {}) {
			super(`The parameter format should be a string, an array, or an object`, info);
		}
	},
	ParamTypeMissing: class extends Exception {
		constructor(info = {}) {
			super(`You must specify the type of the parameter`, info);
		}
	}
};

export default E;
