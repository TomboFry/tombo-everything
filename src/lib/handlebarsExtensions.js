/**
 * @example <caption>Not Equal</caption>
 * {{#xif value1 '!=' value2}}
 *
 * @example <caption>Or</caption>
 * {{#xif url '||' description}}
 */
export function xif (v1, operator, v2, options) {
	switch (operator) {
		case '!=':
			return (v1 !== v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		case '==':
		default:
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
	}
}

export const helpers = {
	xif,
};