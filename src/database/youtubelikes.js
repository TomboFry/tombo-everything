import { v4 as uuid } from 'uuid';
import timeago from '../adapters/timeago.js';
import { calculateGetParameters } from './constants.js';
import { getStatement } from './database.js';

/**
 * @param {string} url
 * @param {string} title
 * @param {string} channel
 * @param {string} device_id
 * @param {string} created_at
 * @return {import('better-sqlite3').RunResult}
 */
export function insertYouTubeLike(video_id, title, channel, device_id, created_at) {
	const statement = getStatement(
		'insertYouTubeLike',
		`INSERT INTO youtubelikes
		(id, video_id, title, channel, device_id, created_at)
		VALUES
		($id, $video_id, $title, $channel, $device_id, $created_at)`,
	);

	return statement.run({
		id: uuid(),
		video_id,
		title,
		channel,
		device_id,
		created_at: new Date(created_at || Date.now()).toISOString(),
	});
}

/**
 * Fetch all YouTube likes, or based on a specific ID
 *
 * @export
 * @param {object} parameters
 * @param {string} [parameters.id]
 * @param {number} [parameters.page]
 * @param {number} [parameters.limit]
 * @param {number} [parameters.days]
 */
export function getLikes(parameters) {
	const statement = getStatement(
		'getYouTubeLikes',
		`SELECT * FROM youtubelikes
		WHERE id LIKE $id AND created_at >= $created_at
		ORDER BY created_at DESC
		LIMIT $limit OFFSET $offset`,
	);

	return statement.all(calculateGetParameters(parameters)).map(row => ({
		...row,
		url: `https://www.youtube.com/watch?v=${row.video_id}`,
		timeago: timeago.format(new Date(row.created_at)),
	}));
}

/** @return {number} */
export function countYouTubeLikes() {
	const statement = getStatement('countYouTubeLikes', 'SELECT COUNT(*) as total FROM youtubelikes');

	return statement.get().total;
}

/**
 * @param {string} id
 * @return {import('better-sqlite3').RunResult}
 */
export function deleteYouTubeLike(id) {
	const statement = getStatement('deleteYouTubeLike', 'DELETE FROM youtubelikes WHERE id = $id');

	return statement.run({ id });
}

/**
 * @param {string} id
 * @param {string} video_id
 * @param {string} title
 * @param {string} channel
 * @param {string} created_at
 * @return {import('better-sqlite3').RunResult}
 */
export function updateYouTubeLike(id, video_id, title, channel, created_at) {
	const statement = getStatement(
		'updateYouTubeLike',
		`UPDATE youtubelikes
		SET video_id = $video_id,
		    title = $title,
		    channel = $channel,
		    created_at = $created_at
		WHERE id = $id`,
	);

	return statement.run({
		id,
		video_id,
		title,
		channel,
		created_at: new Date(created_at || Date.now()).toISOString(),
	});
}
