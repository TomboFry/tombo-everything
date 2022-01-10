import express from 'express';
import { getAllAlbums, getAlbumTracks, scrobbleTrack } from '../../adapters/subsonic.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		// Step 1: Get all artists / albums from subsonic
		const albumlistRaw = await getAllAlbums();

		albumlistRaw.sort((a, b) => {
			const al = `${a.artist}${a.name}`.toLowerCase();
			const bl = `${b.artist}${b.name}`.toLowerCase();
			if (al < bl) { return -1; }
			if (al > bl) { return 1; }
			return 0;
		});

		// Step 2: Add them to formatted list
		const albumlist = albumlistRaw.map(album => ({
			value: album.id,
			label: `${album.artist} - ${album.name} [${album.year}]`,
		}));

		// Step 3: Send to server
		res.render('internal/scrobble', { albumlist });
	} catch (err) {
		console.error(err);
		res.redirect('/');
	}
});

router.post('/', async (req, res) => {
	try {
		// Step 1: Get tracks from album
		const album = await getAlbumTracks(req.body.albumId);

		let now = Date.now();

		// Step 2: Scrobble each track using duration and current time
		for (let songIndex = album.song.length - 1; songIndex >= 0; songIndex--) {
			const song = album.song[songIndex];
			now -= song.duration * 1000;

			await scrobbleTrack(song.id, now);
		}
	} catch (err) {
		console.error(err);
	}

	// Step 3: Redirect to scrobble page
	res.redirect('/scrobble');
});

export default router;
