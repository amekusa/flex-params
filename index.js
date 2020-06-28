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
 * @param {string} type
 * @return {mixed} Default value for the type
 */
function defaultValue(type) {
	switch (type) {
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
 * @param {string|array|object|function} param
 * @return {object} Normalized param object
 */
function normalizeParam(param) {
	var r = {};
	var x = typeof param;
	if (x == 'string') {
		r.type = param;
		r.def = defaultValue(param);

	} else if (x == 'object') {
		if (Array.isArray(param)) {
			if (!param[0]) throw error('ParamTypeMissing');
			r.type = param[0];
			r.def = param[1] || defaultValue(r.type);

		} else {
			r.type = param.type || param.t;
			if (!r.type) throw error('ParamTypeMissing');
			r.def = param.def || param.d || defaultValue(r.type);
		}

	} else if (x == 'function') {
		r.type = param;
		r.def = null;

	} else throw error('InvalidParamFormat');

	r._n = true; // Mark as normalized
	return r;
}

/**
 * Parses args according to the specified patterns
 * @param  {array} args
 * @param {object} receiver
 * @param  {array} patterns
 * @return {object|boolean} Matched pattern, or False if no matched pattern
 */
module.exports = function(args, receiver, patterns) {
	for (var i = 0; i < patterns.length; i++) {
		var pat = patterns[i];
		if (typeof pat != 'object') throw error('InvalidPatternFormat');
		var props = Object.keys(pat);

		var found = true;
		for (var j = 0; j < props.length; j++) {
			if ((args.length-1) < j) { // Fewer arguments
				// Normalize all the rest of the params
				for (; j < props.length; j++) {
					var param = normalizeParam(pat[props[j]]);
					pat[props[j]] = param;
					// TODO: Check if param is optional or required
				}
				break;
			}
			var param = normalizeParam(pat[props[j]]);
			pat[props[j]] = param;

			if (!isTypeOf(args[j], param.type)) { // Type mismatch
				found = false;
				break;
			}
		}
		if (!found) continue;

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
		console.debug(':: MATCHED PATTERN:', pat);
		console.debug(':: RESULTING OBJ:', receiver);
		//////// DEBUG */

		return pat;
	}
	return false;
}
