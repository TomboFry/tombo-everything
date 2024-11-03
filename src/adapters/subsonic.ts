import { createHash, randomBytes } from 'node:crypto';
import phin from 'phin';

import dotenv from 'dotenv';
import { config } from '../lib/config.js';

dotenv.config();

const getPassword = () => {
	const salt = randomBytes(5).toString('base64url');
	const password = createHash('md5').update(`${config.subsonic.password}${salt}`).digest('hex');

	return {
		password,
		salt,
	};
};

const getBaseParams = () => {
	const { password, salt } = getPassword();
	return {
		u: config.subsonic.username || '',
		v: '1.15.0',
		c: 'tombo-everything',
		t: password,
		s: salt,
		f: 'json',
	};
};

const checkEnvironment = () => {
	return !(config.subsonic.url && config.subsonic.username);
};

interface AlbumList {
	id: number;
	name: string;
	songCount: number;
	created: string;
	duration: number;
	artist: string;
	artistId: number;
	year: number;
}

interface AlbumList2Response {
	'subsonic-response': {
		albumList2: {
			album: AlbumList[];
		};
	};
}

interface Song {
	id: number;
	parent: number;
	title: string;
	artist: string;
	album: string;
	year: number;
	track: number;
	isDir: boolean;
	coverArt: number;
	created: string;
	duration: number;
	bitRate: number;
	size: number;
	suffix: string;
	contentType: string;
	isVideo: boolean;
	path: string;
	albumId: number;
	artistId: number;
	type: string;
	genre: string;
}

interface AlbumResponse {
	'subsonic-response': {
		album: {
			song: Song[];
		};
	};
}

interface Search3Response {
	'subsonic-response': {
		searchResult3: {
			album: AlbumList[];
			song?: Song[];
		};
	};
}

export const getAlbumList = async (page = 0) => {
	if (checkEnvironment()) return [];

	const params = new URLSearchParams({
		...getBaseParams(),
		type: 'newest',
		size: '500',
		offset: `${Math.floor(page) * 500}`,
	}).toString();

	const url = new URL(`/rest/getAlbumList2?${params}`, config.subsonic.url);

	const response = await phin<AlbumList2Response>({ url, parse: 'json' });

	return response.body['subsonic-response']?.albumList2.album;
};

export const getAllAlbums = async () => {
	if (checkEnvironment()) return [];

	let albums: AlbumList[] = [];
	let lastResponseLength = 1;
	let page = 0;

	while (lastResponseLength > 0 || page < 10) {
		const albumResponse = await getAlbumList(page);
		lastResponseLength = albumResponse.length;
		albums = albums.concat(albumResponse);
		page += 1;
	}

	return albums;
};

export const getAlbumTracks = async (albumId: string) => {
	if (checkEnvironment()) return null;

	const params = new URLSearchParams({
		...getBaseParams(),
		id: albumId,
	});

	const url = new URL(`/rest/getAlbum?${params}`, config.subsonic.url);

	const response = await phin<AlbumResponse>({ url, parse: 'json' });

	return response.body['subsonic-response']?.album;
};

export const scrobbleTrack = async (trackId: number, timestamp: number) => {
	if (checkEnvironment()) return null;

	const params = new URLSearchParams({
		...getBaseParams(),
		id: `${trackId}`,
		time: `${timestamp}`,
	});

	const url = new URL(`/rest/scrobble?${params}`, config.subsonic.url);

	const response = await phin({ url, parse: 'json' });

	return response.body;
};

export const searchTrack = async (title: string, album: string, artist: string) => {
	if (checkEnvironment()) return null;

	const params = new URLSearchParams({
		...getBaseParams(),
		query: `${title}`,
	});

	const url = new URL(`/rest/search3?${params}`, config.subsonic.url);

	const response = await phin<Search3Response>({ url, parse: 'json' });
	const results = response.body['subsonic-response'].searchResult3;

	return results.song?.find(song => song.artist === artist && song.album === album) ?? null;
};
