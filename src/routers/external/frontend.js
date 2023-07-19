import express from 'express';
import helmet from 'helmet';
import { NotFoundError } from '@tombofry/stdlib/src/errors/http.js';

// Database
import {
	countListens,
	getListenGraph,
	getListenPopularDashboard,
	getListens,
	getListensPopular,
} from '../../database/listens.js';
import {
	countGameActivity,
	getGameActivity,
	getGameActivityGroupedByDay,
	getGameStats,
} from '../../database/games.js';
import { countYouTubeLikes, getLikes } from '../../database/youtubelikes.js';
import { getSleepStats } from '../../database/sleep.js';
import { getStepsYesterday } from '../../database/steps.js';
import { getDevices } from '../../database/devices.js';
import { countEpisodes, getEpisodes } from '../../database/tv.js';
import { countFilms, getFilms } from '../../database/films.js';
import { countBooks, getBooks } from '../../database/books.js';
import { getLatestCity } from '../../database/locations.js';
import { countNotes, getNotes } from '../../database/notes.js';

// Lib
import { generateBarGraph } from '../../lib/graphs/bar.js';
import handlebarsPagination from '../../lib/handlebarsPagination.js';
import { getCanonicalUrl } from '../../lib/getCanonicalUrl.js';
import getCache from '../../lib/middleware/cachePage.js';
import addMissingDates from '../../lib/addMissingDates.js';
import { prettyDate, shortDate } from '../../lib/formatDate.js';

const router = express.Router();

// DASHBOARD

router.get('/', getCache(), (req, res) => {
	const listens = getListenPopularDashboard(7);
	const youtubeLikes = getLikes().slice(0, 2);
	const tvEpisodes = getEpisodes().slice(0, 2);
	const films = getFilms().slice(0, 2);
	const gameStats = getGameStats();
	const games = getGameActivity();
	const device = getDevices()[0];
	const location = getLatestCity();
	const steps = getStepsYesterday()[0]?.step_count_total;
	const sleepStats = getSleepStats();
	const books = getBooks().slice(0, 2);
	const notes = getNotes().slice(0, 5);

	res.render('external/dashboard', {
		sleepStats,
		listens,
		youtubeLikes,
		tvEpisodes,
		films,
		books,
		games,
		gameStats,
		notes,
		device,
		steps,
		location,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// LISTENS

router.get('/music', getCache(), (req, res) => {
	const { page = 0, days = '7' } = req.query;
	const pagination = handlebarsPagination(page, countListens());

	const daysInt = Number(days);
	const dayOptions = [
		{ value: 7, selected: daysInt === 7 },
		{ value: 14, selected: daysInt === 14 },
		{ value: 30, selected: daysInt === 30 },
		{ value: 60, selected: daysInt === 60 },
	];

	if (!Number.isSafeInteger(daysInt) || daysInt < 1 || daysInt > 60) {
		throw new Error('"days" query must be a number between 1 and 60');
	}

	const listens = getListens(undefined, page);
	const popular = getListensPopular(daysInt).slice(0, 30);
	const graphPoints = getListenGraph();
	const svg = generateBarGraph(addMissingDates(
		graphPoints,
		'day',
		(date) => ({ y: 0, label: shortDate(date) }),
	), 'scrobbles');

	const description = popular.length > 0
		? `My favourite artist in the last 7 days has been ${popular[0].artist}, with ${popular[0].count} listens`
		: 'I haven\'t listened to any music in the last 7 days!';

	res.render('external/listen-list', {
		listens,
		popular,
		pagination,
		svg,
		days,
		dayOptions,
		canonicalUrl: getCanonicalUrl(req),
		description,
	});
});

router.get('/music/:id', (req, res) => {
	const [ listen ] = getListens(req.params.id);

	if (!listen) {
		throw new NotFoundError('Listen not found');
	}

	const description = `I listened to '${listen.title}' by ${listen.artist} on ${prettyDate(new Date(listen.created_at))}`;

	res.render('external/listen-single', {
		listen,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// YOUTUBE LIKES

router.get('/youtube', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countYouTubeLikes());

	const youtubeLikes = getLikes(undefined, page);

	res.render('external/youtubelike-list', {
		youtubeLikes,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/youtube/:id', (req, res) => {
	const [ youtubeLike ] = getLikes(req.params.id);

	if (!youtubeLike) {
		throw new NotFoundError('Like not found');
	}

	const description = `I liked '${youtubeLike.title}' by ${youtubeLike.channel} on ${prettyDate(new Date(youtubeLike.created_at))}`;

	res.render('external/youtubelike-single', {
		youtubeLike,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// STEAM ACTIVITY

router.get('/games', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countGameActivity());

	const gameActivity = getGameActivity(undefined, page);
	const gamesByDay = getGameActivityGroupedByDay();
	const svg = generateBarGraph(addMissingDates(
		gamesByDay,
		'day',
		(date) => ({ y: 0, label: shortDate(date) }),
	), 'hours');

	res.render('external/game-list', {
		gameActivity,
		svg,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/game/:id', (req, res) => {
	const [ gameActivity ] = getGameActivity(req.params.id);

	if (!gameActivity) {
		throw new NotFoundError('Game not found');
	}

	const description = `I played ${gameActivity.name} for ${gameActivity.duration} on ${prettyDate(new Date(gameActivity.created_at))}`;

	res.render('external/game-single', {
		gameActivity,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// TV SHOWS

router.get('/tv', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countEpisodes());

	const episodes = getEpisodes(undefined, page);

	res.render('external/tv-list', {
		episodes,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/tv/:id', (req, res) => {
	const [ episode ] = getEpisodes(req.params.id);

	if (!episode) {
		throw new NotFoundError('Episode not found');
	}

	const description = `I watched '${episode.episode_title}' of ${episode.series_title} on ${prettyDate(new Date(episode.created_at))}`;

	res.render('external/tv-single', {
		episode,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// FILMS

router.get('/films', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countFilms());

	const films = getFilms(undefined, page);

	res.render('external/film-list', {
		films,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/film/:id', (req, res) => {
	const [ film ] = getFilms(req.params.id);

	if (!film) {
		throw new NotFoundError('Film not found');
	}

	const description = `I watched ${film.title} (${film.year}) on ${prettyDate(new Date(film.watched_at))}`;

	res.render('external/film-single', {
		film,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// BOOKS

router.get('/books', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countBooks());

	const books = getBooks(undefined, page);

	res.render('external/book-list', {
		books,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/book/:id', (req, res) => {
	const [ book ] = getBooks(req.params.id);

	if (!book) {
		throw new NotFoundError('Book not found');
	}

	const percentageComplete = book.pages_total
		? Math.round((book.pages_progress / book.pages_total) * 100)
		: 0;

	const prefix = percentageComplete === 100
		? 'I finished reading'
		: `I am ${percentageComplete}% through reading`;

	const suffix = percentageComplete === 100
		? ` on ${prettyDate(new Date(book.completed_at))}`
		: '';

	const description = `${prefix} '${book.title}' (${book.year}) by ${book.author}${suffix}`;

	res.render('external/book-single', {
		book,
		description,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// NOTES

// Disable media-src CSP for Notes, as we may want to embed <audio> and <video>
// sources from other domains. ⚠ As a result, you are responsible for posting
// reliable/trust-worthy sources (eg. from your own domains).
router.use(helmet({
	contentSecurityPolicy: {
		directives: {
			'media-src': 'https:',
			'img-src': 'https:',
		},
	},
}));

router.get('/notes', getCache(), (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countNotes());

	const notes = getNotes(undefined, page);

	res.render('external/note-list', {
		notes,
		pagination,
		canonicalUrl: getCanonicalUrl(req),
	});
});

router.get('/note/:id', (req, res) => {
	const [ note ] = getNotes(req.params.id);

	if (!note) {
		throw new NotFoundError('Note not found');
	}

	res.render('external/note-single', {
		note,
		description: note.summary,
		title: note.title || note.summary,
		canonicalUrl: getCanonicalUrl(req),
	});
});

// NOT FOUND

router.get('*', () => { throw new NotFoundError('Page Not Found'); });

export default router;
