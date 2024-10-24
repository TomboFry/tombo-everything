import { v4 as uuid } from 'uuid';
import { timeago } from '../adapters/timeago.js';
import { dateDefault, dayMs, hourMs, shortDate } from '../lib/formatDate.js';
import type { Insert, Optional, Select, Update } from '../types/database.js';
import { type Parameters, calculateGetParameters } from './constants.js';
import { getStatement } from './database.js';

export interface Listen {
	id: string;
	artist: string;
	album: string;
	title: string;
	tracknumber: Optional<number>;
	release_year: Optional<number>;
	genre: Optional<string>;
	created_at: string;
	device_id: string;
}

interface ListenGroup {
	artist: string;
	album: string;
	created_at: string;
	ended_at: string;
	timeago: string;
	tracks: { title: string; id: string }[];
	count: number;
	countText: 'song' | 'songs';
}

export function insertScrobble(listen: Insert<Listen>) {
	const statement = getStatement(
		'insertListen',
		`INSERT INTO listens
		(id, artist, album, title, tracknumber, release_year, genre, created_at, device_id)
		VALUES
		($id, $artist, $album, $title, $tracknumber, $release_year, $genre, $created_at, $device_id)`,
	);

	return statement.run({
		...listen,
		id: uuid(),
		created_at: dateDefault(listen.created_at),
	});
}

export function getListens(parameters: Partial<Parameters> = {}) {
	const statement = getStatement<Listen>(
		'getListens',
		`SELECT * FROM listens
		WHERE id LIKE $id AND created_at >= $created_at
		ORDER BY created_at DESC
		LIMIT $limit OFFSET $offset`,
	);

	return statement.all(calculateGetParameters(parameters)).map(row => ({
		...row,
		timeago: timeago.format(new Date(row.created_at)),
	}));
}

export function groupListens(listens: Select<Listen>[]) {
	return listens.reduce((albums, listen) => {
		if (
			albums.length === 0 ||
			// Different album/artist
			albums[albums.length - 1].album !== listen.album ||
			albums[albums.length - 1].artist !== listen.artist ||
			// Same album/artist, but longer than one hour since last listen
			Math.abs(
				new Date(albums[albums.length - 1].created_at).getTime() -
					new Date(listen.created_at).getTime(),
			) > hourMs
		) {
			albums.push({
				artist: listen.artist,
				album: listen.album,
				created_at: listen.created_at,
				ended_at: listen.created_at,
				timeago: listen.timeago,
				tracks: [{ title: listen.title, id: listen.id }],
				count: 1,
				countText: 'song',
			});
			return albums;
		}

		albums[albums.length - 1].tracks.push({ title: listen.title, id: listen.id });
		albums[albums.length - 1].count += 1;
		albums[albums.length - 1].countText = 'songs';
		albums[albums.length - 1].created_at = listen.created_at;
		return albums;
	}, [] as ListenGroup[]);
}

export function deleteListen(id: string) {
	const statement = getStatement('deleteListen', 'DELETE FROM listens WHERE id = $id');
	return statement.run({ id });
}

export function updateListen(listen: Update<Listen>) {
	const statement = getStatement(
		'updateListen',
		`UPDATE listens
		SET artist = $artist,
		    album = $album,
		    title = $title,
		    tracknumber = $tracknumber,
		    release_year = $release_year,
		    genre = $genre,
		    created_at = $created_at
		WHERE id = $id`,
	);

	return statement.run({
		...listen,
		created_at: dateDefault(listen.created_at),
	});
}

export function countListens() {
	const statement = getStatement<{ total: number }>('countListens', 'SELECT COUNT(*) as total FROM listens');

	return statement.get()?.total || 0;
}

export function getListensPopular(days: number) {
	const statement = getStatement<{ artist: string; count: number }>(
		'getListensPopular',
		`SELECT artist, count(*) as count
		FROM listens
		WHERE created_at >= $created_at
		GROUP BY artist
		ORDER BY count DESC, artist ASC
		LIMIT 30`,
	);

	const created_at = new Date(Date.now() - days * dayMs).toISOString();
	const rows = statement.all({ created_at });

	return rows.map(row => ({
		...row,
		popularityPercentage: (row.count / rows[0].count) * 100,
	}));
}

export function getListenPopularDashboard(days: number) {
	const generateStatement = (column: keyof Listen) =>
		getStatement<{ title: string; count: number }>(
			`getListenPopularDashboard_${column}`,
			`SELECT ${column} as title, count(*) as count
			FROM listens
			WHERE created_at >= $created_at
			GROUP BY ${column}
			ORDER BY count DESC
			LIMIT 1;`,
		);

	const created_at = new Date(Date.now() - days * dayMs).toISOString();

	const artist = generateStatement('artist').get({ created_at });
	const album = generateStatement('album').get({ created_at });
	const song = generateStatement('title').get({ created_at });

	if (!(artist?.count && album?.count && song?.count)) return null;

	return {
		artist,
		album,
		song,
	};
}

export function getListenGraph() {
	const statement = getStatement<{ day: string; y: number }>(
		'getListenGraph',
		`SELECT DATE(created_at) as day, COUNT(*) as y
		FROM listens
		GROUP BY day
		ORDER BY day DESC
		LIMIT 14;`,
	);

	return statement.all().map(row => ({
		...row,
		day: new Date(row.day),
		label: shortDate(new Date(row.day)),
	}));
}

export function getListenDashboardGraph() {
	const statement = getStatement<{ day: string; max: number }>(
		'getListenDashboardGraph',
		`SELECT DATE(created_at) as day, COUNT(*) as max
		FROM listens
		GROUP BY day
		ORDER BY day DESC
		LIMIT 14;`,
	);

	return statement.all().map(row => ({
		day: new Date(row.day),
		min: 0,
		max: row.max,
	}));
}

export function getPopularAlbumWithArtist(days = 14) {
	const statement = getStatement<{ album: string; artist: string; count: number }>(
		'getPopularAlbumWithArtist',
		`SELECT album, artist, count(*) as count
		FROM listens
		WHERE created_at >= $created_at
		GROUP BY album, artist
		ORDER BY count DESC
		LIMIT 1;`,
	);

	const created_at = new Date(Date.now() - days * dayMs).toISOString();

	return statement.get({ created_at });
}
