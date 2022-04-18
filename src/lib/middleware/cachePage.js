// In order to prevent the SQLite database from being thrashed under high load,
// this caching solution will store the entirety of common pages in memory using
// a very simple singleton object.

import { getCanonicalUrl } from '../getCanonicalUrl.js';

/**
 * @typedef {object} CacheObj
 * @property {number} lastUpdate
 * @property {string} contents
 */

/** @type {Record<string, CacheObj>} */
let cache = {};

/**
 * @export
 * @param {number} durationSecs
 */
export default function getCache (durationSecs) {
	/**
	 * @param {import('express').Request} req
	 * @param {import('express').Response} res
	 * @param {import('express').NextFunction} next
	 */
	return (req, res, next) => {
		const key = getCanonicalUrl(req);
		const cacheValue = cache[key];

		const durationMs = durationSecs * 1000;
		const lastUpdate = Date.now() - durationMs;

		if (cacheValue?.lastUpdate > lastUpdate) {
			res.send(cacheValue.contents);
			return;
		}

		console.log('Updating Cache for ' + key);

		res.sendResponse = res.send;
		res.send = body => {
			cache[key] = {
				contents: body,
				lastUpdate: Date.now(),
			};
			res.sendResponse(body);
		};
		next();
	};
}
