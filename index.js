/*!
 * parse-args <https://github.com/amekusa/parse-args>
 *
 * (c) 2020, Satoshi Soma (amekusa.com)
 * Released under the ISC License
 */

function error(code = 'UNKNOWN') {
	return new Error({
		TYPE_MISSING: "You MUST specify the type of every parameter",
		UNKNOWN: "Unknown Error"
	}[code]);
}

function isTypeOf(value, type) {
	var actualType = typeof value;
	if (actualType == type) return true;

	switch (actualType) {
	case 'boolean':
		return (type == 'bool');
	case 'number':
		switch (type) {
		case 'int':
		case 'integer':
			return (isFinite(value) && Math.floor(value) === value);
		case 'float':
		case 'double':
			return true;
		}
		break;
	case 'object':
		if (type == 'array') return Array.isArray(value);
		return (typeof type == 'function' && value instanceof type);
	}
	return false;
}

function getType(param) {
	if (typeof param == 'object') {
		if ('type' in param) return param.type;
		throw error('TYPE_MISSING');
	}
	return param;
}

function defaultValue(param) {
	if (typeof param == 'object') {
		if ('def' in param) return param.def;
		if ('default' in param) return param.default;
	}
	switch (getType(param)) {
	case 'bool':
	case 'boolean':
		return false;
	case 'number':
	case 'int':
	case 'integer':
	case 'float':
	case 'double':
		return 0;
	case 'string':
		return '';
	case 'array':
		return [];
	}
	return null;
}

/**
 * Parses args according to the specified patterns
 * @param   {array} args
 * @param  {object} receiver
 * @param   {array} patterns
 * @return {object|boolean} Matched pattern, or False if no matched pattern
 */
module.exports = function(args, receiver, patterns) {
	for (var i = 0; i < patterns.length; i++) {
		var pat = patterns[i];
		var props = Object.keys(pat);

		var found = true;
		for (var j = 0; j < props.length; j++) {
			if ((args.length-1) < j) break;
			var param = pat[props[j]];
			var type = getType(param);
			if (!isTypeOf(args[j], type)) {
				found = false;
				break;
			}
		}
		if (!found) continue;

		for (var j = 0; j < props.length; j++) {
			var prop = props[j];
			var param = pat[prop];

			if ((args.length-1) < j) {
				receiver[prop] = defaultValue(param);
				continue;
			}
			receiver[prop] = args[j];
		}
		return pat;
	}
	return false;
}
