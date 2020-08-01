/*!
 * flex-params <https://github.com/amekusa/flex-params>
 *
 * (c) 2020, Satoshi Soma (amekusa.com)
 * Released under the ISC License
 */

import { Exception, InvalidArgument } from './exceptions.js';

function isTypeOf(value, type) {
	var actualType = typeof value;
	if (actualType == 'object') {
		if (Array.isArray(value)) return type == 'array';
		if (type == 'object') return true;
		return (typeof type == 'function' && value instanceof type);
	}
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
	}
	return false;
}

/**
 * @param {string|array|object|function} param
 * @return {object} Normalized param object
 */
function normalizeParam(param) {
	var r = {};
	switch (typeof param) {
	case 'string': // 'type'
		r.type = param;
		break;
	case 'object':
		if (Array.isArray(param)) { // ['type', <default-value>]
			if (!param[0]) {
				console.warn(`[flex-params] Param Type Missing`);
				return false;
			};
			r.type = param[0];
			r.def = param[1];

		} else { // { type: 'type', def: <default-value> }
			if (!param.type) {
				console.warn(`[flex-params] Param Type Missing`);
				return false;
			};
			r.type = param.type;
			r.def = param.def || param.default || undefined;
		}
		break;
	case 'function': // A class(constructor) as the type
		r.type = param;
		break;
	default:
		console.warn(`[flex-params] Invalid Param Format:`, param);
		return false;
	}
	// r._n = true; // Mark as normalized // XXX: NOT USED
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
 * @param           {array} args
 * @param           {array} patterns
 * @param {object|function} receiver
 * @param             {any} fallback=undefined
 * @return {object|boolean} Matched pattern, or False if no matched pattern
 */
function flexParams(args, patterns, receiver, fallback = undefined) {
	mainLoop:
	for (var i = 0; i < patterns.length; i++) {
		var pat = patterns[i];
		if (typeof pat != 'object') {
			console.warn(`[flex-params] Invalid Pattern Format:`, pat);
			continue;
		}
		var props = Object.keys(pat);

		for (var j = 0; j < props.length; j++) {
			if ((args.length-1) < j) { // Fewer arguments
				// Check the rest of the params
				for (; j < props.length; j++) {
					var param = normalizeParam(pat[props[j]]);
					if (!param) continue mainLoop; // Invalid param
					pat[props[j]] = param;
					// A non-optional param found. Go to the next pattern
					if (isRequired(param)) continue mainLoop;
				}
				break;
			}
			var param = normalizeParam(pat[props[j]]);
			if (!param) continue mainLoop; // Invalid param
			pat[props[j]] = param;
			// Type mismatch. Go to the next pattern
			if (!isTypeOf(args[j], param.type)) continue mainLoop;
		}
		var isFunction = typeof receiver == 'function';
		var r = isFunction ? {} : receiver;
		for (var j = 0; j < props.length; j++) {
			var prop = props[j];
			var param = pat[prop];
			if ((args.length-1) < j) { // Fewer arguments
				r[prop] = param.def;
				continue;
			}
			r[prop] = args[j];
		}
		/* DEBUG ////////
		console.debug('ARGUMENTS:', args);
		console.debug(':: MATCHED PATTERN:', `#${i+1}/${patterns.length}`, pat);
		console.debug(':: RESULTING OBJ:', receiver);
		//////// DEBUG */
		return (isFunction ? receiver(r, i) : pat);
	}
	if (fallback === undefined) return false;

	switch (typeof fallback) {
	case 'function':
		return fallback({
			args,
			patterns,
			receiver,
			error: new InvalidArgument({ arguments: args, expectedPatterns: patterns })
		});
	case 'object':
		if (fallback.log) console.log(fallback.log);
		if (fallback.warn) console.warn(fallback.warn);
		if (fallback.error) console.error(fallback.error);
		if (fallback.throw) {
			throw (typeof fallback.throw == 'boolean') ?
				new InvalidArgument({ arguments: args, expectedPatterns: patterns }) :
				fallback.throw;

		} else return false;
	}
	return fallback;
}

// Expose exceptions
flexParams.Exception = Exception;
flexParams.InvalidArgument = InvalidArgument;

export default flexParams;
