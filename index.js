/*!
 * flex-params <https://github.com/amekusa/flex-params>
 *
 * (c) 2020, Satoshi Soma (amekusa.com)
 * Released under the ISC License
 */

function error(name) {
	var r = new Error({
		InvalidPatternFormat: "The parameters pattern should be an object",
		InvalidParamFormat: "The parameter format should be a string, an array, or an object",
		ParamTypeMissing: "You must specify the type of the parameter"
	}[name]);
	r.name = name;
	return r;
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

/**
 * @param {string|array|object} param
 * @return {object} Normalized param object
 */
function normalizeParam(param) {
	var r = {};
	var x = typeof param;
	if (x == 'string') {
		r.type = param;
		r.def = undefined; // This line is unnecessary for sure

	} else if (x == 'object') {
		if (Array.isArray(param)) {
			if (!param[0]) throw error('ParamTypeMissing');
			r.type = param[0];
			r.def = param[1];

		} else {
			r.type = param.type || param.t;
			if (!r.type) throw error('ParamTypeMissing');
			r.def = param.def || param.d || undefined;
		}

	} else throw error('InvalidParamFormat');

	r._n = true; // Mark as normalized
	return r;
}

/**
 * @param {object} param Normalized param object
 * @return {boolean} Whether the param is required or not
 */
function isRequired(param) {
	return (param.def === undefined);
}

/**
 * Parses args according to the specified patterns
 * @param  {array} args
 * @param {object} receiver
 * @param  {array} patterns
 * @return {object|boolean} Matched pattern, or False if no matched pattern
 */
module.exports = function(args, receiver, patterns) {
	mainLoop:
	for (var i = 0; i < patterns.length; i++) {
		var pat = patterns[i];
		if (typeof pat != 'object') throw error('InvalidPatternFormat');
		var props = Object.keys(pat);

		for (var j = 0; j < props.length; j++) {
			if ((args.length-1) < j) { // Fewer arguments
				// Check the rest of the params
				for (; j < props.length; j++) {
					var param = normalizeParam(pat[props[j]]);
					pat[props[j]] = param;

					// A non-optional param found. Skip to the next pattern
					if (isRequired(param)) continue mainLoop;
				}
				break;
			}
			var param = normalizeParam(pat[props[j]]);
			pat[props[j]] = param;

			// Type mismatch. Skip to the next pattern
			if (!isTypeOf(args[j], param.type)) continue mainLoop;
		}
		for (var j = 0; j < props.length; j++) {
			var prop = props[j];
			var param = pat[prop];
			if ((args.length-1) < j) { // Fewer arguments
				receiver[prop] = param.def;
				continue;
			}
			receiver[prop] = args[j];
		}

		/* DEBUG ////////
		console.debug('ARGUMENTS:', args);
		console.debug(':: MATCHED PATTERN:', `#${i+1}/${patterns.length}`, pat);
		console.debug(':: RESULTING OBJ:', receiver);
		//////// DEBUG */

		return pat;
	}
	return false;
}
