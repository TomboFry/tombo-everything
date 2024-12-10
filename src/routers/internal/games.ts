import express from 'express';
import {
	deleteGameAchievement,
	insertNewGameAchievement,
	updateGameAchievement,
} from '../../database/gameachievements.js';
import {
	countGameSessions,
	deleteGameSession,
	getGameSessions,
	insertGameSession,
	updateGameSessionInternal,
} from '../../database/games.js';
import { config } from '../../lib/config.js';
import handlebarsPagination from '../../lib/handlebarsPagination.js';
import type { RequestFrontend } from '../../types/express.js';

const router = express.Router();

// FRONTEND

router.get('/', (req: RequestFrontend, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countGameSessions());

	const games = getGameSessions({ page });

	res.render('internal/games', { games, pagination });
});

// CRUD

router.post('/', (req: RequestFrontend, res) => {
	const { name, playtime_mins, url, created_at } = req.body;

	insertGameSession({
		name,
		url,

		playtime_mins: Number(playtime_mins || 0),
		device_id: config.defaultDeviceId,
		created_at,
	});
	res.redirect('/games');
});

router.post('/:id', (req: RequestFrontend, res) => {
	const { id } = req.params;
	const { crudType, name, playtime_mins, url, created_at, updated_at } = req.body;

	switch (crudType) {
		case 'delete': {
			deleteGameSession(id);
			break;
		}

		case 'update': {
			updateGameSessionInternal({
				id,
				name,
				playtime_mins: Number(playtime_mins || 0),
				url,
				created_at,
				updated_at,
			});
			break;
		}

		default:
			// Do nothing
			break;
	}

	res.redirect('/games');
});

// Modify Achievements

router.get('/:id/achievements', (req, res) => {
	const { id } = req.params;

	const [game] = getGameSessions({ id });

	if (!game) {
		res.redirect('/games');
		return;
	}

	res.render('internal/game-achievements', { id, game, achievements: game.achievements.length });
});

router.post('/:unlocked_session_id/achievements', (req: RequestFrontend, res) => {
	const { unlocked_session_id } = req.params;
	const { id, crudType, name, description, created_at, updated_at } = req.body;

	const [game] = getGameSessions({ id: unlocked_session_id });

	if (!game) {
		res.redirect(`/games/${unlocked_session_id}/achievements`);
		return;
	}

	switch (crudType) {
		case 'new': {
			insertNewGameAchievement({
				name,
				description,
				game_id: game.game_id,
				unlocked_session_id,
				device_id: config.defaultDeviceId,
				created_at,
			});
			break;
		}

		case 'delete': {
			deleteGameAchievement(id);
			break;
		}

		case 'update': {
			updateGameAchievement({ id, name, description, created_at, updated_at });
			break;
		}

		default:
			// Do nothing
			break;
	}

	res.redirect(`/games/${unlocked_session_id}/achievements`);
});

export default router;
