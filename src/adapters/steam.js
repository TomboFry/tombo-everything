import fs from 'fs';
import path from 'path';
import phin from 'phin';
import { updateActivity } from '../database/games.js';
import Logger from '../lib/logger.js';

const log = new Logger('Steam');

let gameActivity = [];

const storagePath = () => path.resolve(process.env.TOMBOIS_STEAM_DATA_FILE);

const loadGamesFromDisk = () => {
	log.info('Loading activity cache from disk');
	if (fs.existsSync(storagePath()) === false) {
		log.debug('Cache file does not exist, providing defaults');
		gameActivity = [];
		return;
	}

	const contents = JSON.parse(fs.readFileSync(storagePath()).toString());

	gameActivity = contents.gameActivity || [];
};

const saveGamesToDisk = () => {
	log.info('Saving activity cache to disk');
	const str = JSON.stringify({ gameActivity }, null, 2);
	fs.writeFileSync(storagePath(), str);
};

export const pollForGameActivity = () => {
	loadGamesFromDisk();

	const intervalMins = Number(process.env.TOMBOIS_STEAM_POLL_INTERVAL) || 5;
	const intervalMs = intervalMins * 60 * 1000;

	const apiUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.TOMBOIS_STEAM_APIKEY}&steamid=${process.env.TOMBOIS_STEAM_USERID}&format=json`;

	// FIXME: Remove hard coded device ID
	const deviceId = '2a57071e-6aea-4ac1-8fb1-bda70ebf76f1';

	const fetchGames = async () => {
		log.info('Polling steam for new game activity');

		const { body } = await phin({
			url: apiUrl,
			parse: 'json',
		});

		const newActivity = [];
		body.response.games.forEach(game => {
			const activity = {
				...game,
				newPlaytime: 1,
			};

			const existing = gameActivity.find(cache => (
				game.appid === cache.appid
			));
			if (!existing) {
				newActivity.push(activity);
				return;
			}

			activity.newPlaytime = game.playtime_forever - existing.playtime_forever;
			if (activity.newPlaytime <= 0) {
				return;
			}

			newActivity.push(activity);
		});

		log.debug(`Found ${newActivity.length} instances of new activity`);

		// Update all new same-game activity
		for (let i = newActivity.length - 1; i >= 0; i--) {
			const game = newActivity[i];
			await updateActivity(
				game.name,
				game.newPlaytime,
				deviceId,
				intervalMs,
			);
		}

		gameActivity = body.response.games.map(game => ({
			appid: game.appid,
			playtime_forever: game.playtime_forever,
		}));

		saveGamesToDisk();
	};

	setInterval(fetchGames, intervalMs);
};
