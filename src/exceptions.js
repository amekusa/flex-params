export class Exception extends Error {
	constructor(msg, info = null) {
		super(msg + (info ? `\n[${new.target.name}] info: ${JSON.stringify(info, null, 2)}` : ''));
		this.name = new.target.name;
		this._info = info;
	}
	get info() {
		return this._info;
	}
}

export class InvalidArgument extends Exception {
	constructor(info) {
		super(`the passed argument doesn't match for the expected pattern(s)`, info);
	}
}
