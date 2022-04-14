// Date constants
export const minuteSecs = 60;
export const hourSecs = 60 * minuteSecs;
export const daySecs = 24 * hourSecs;
export const weekSecs = 7 * daySecs;

// Date constants in milliseconds
export const minuteMs = minuteSecs * 1000;
export const hourMs = hourSecs * 1000;
export const dayMs = daySecs * 1000;
export const weekMs = weekSecs * 1000;

/**
 * @param {string} str
 * @param {number} length
 * @param {string} pad
 */
function padString (str, length, pad = '0') {
	let newStr = str.toString();
	while (newStr.length < length) {
		newStr = `${pad}${newStr}`;
	}
	return newStr;
}

/** @param {Date} date */
export function formatTime (date, includeSeconds = true) {
	const hour = padString(date.getHours(), 2);
	const mins = padString(date.getMinutes(), 2);
	const secs = padString(date.getSeconds(), 2);

	let formatted = `${hour}:${mins}`;

	if (includeSeconds) {
		formatted += `:${secs}`;
	}

	return formatted;
}

/** @param {Date} date */
export function formatDate (date) {
	const year = padString(date.getFullYear(), 4);
	const mon = padString(date.getMonth() + 1, 2);
	const day = padString(date.getDate(), 2);

	return `${year}-${mon}-${day}`;
}

/** @param {Date} date */
export function formatDateTime (date) {
	return `${formatDate(date)} ${formatTime(date)}`;
}

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

/** @param {Date} date */
export function prettyDate (date) {
	const year = padString(date.getFullYear(), 4);
	const month = months[date.getMonth()];
	const day = date.getDate();
	let th = 'th';
	if (day % 10 === 1) th = 'st';
	if (day % 10 === 2) th = 'nd';
	if (day % 10 === 3) th = 'rd';

	return `${day}${th} ${month}, ${year}`;
}

/** @param {Date} date */
export function shortDate (date) {
	const day = padString(date.getDate(), 2);
	const month = padString(date.getMonth() + 1, 2);

	return `${day}/${month}`;
}

/**
 * @param {number} durationMs
 * @returns {string}
 */
export function prettyDuration (durationMs) {
	// 60 mins * 60 secs * 1000 ms
	const hoursTotal = durationMs / 3600000;

	// Calculate minutes based on decimal from hours
	const hoursRounded = Math.floor(hoursTotal);
	const minutes = Math.round((hoursTotal - hoursRounded) * 60);

	// const hourUnit = hoursRounded === 1
	// 	? 'hour'
	// 	: 'hours';

	// const minuteUnit = minutes === 1
	// 	? 'minute'
	// 	: 'minutes';

	const hourUnit = 'h';
	const minuteUnit = 'm';

	// Convert into string
	const duration = hoursRounded > 0
		? `${hoursRounded}${hourUnit} ${minutes}${minuteUnit}`
		: `${minutes}${minuteUnit}`;

	return duration;
}
