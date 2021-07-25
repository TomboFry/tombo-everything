import express from 'express';
import { countGameActivity, deleteGameActivity, getGameActivity, updateGameActivity } from '../../database/games.js';
import handlebarsPagination from '../../lib/handlebarsPagination.js';

const router = express.Router();

// FRONTEND

router.get('/', (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countGameActivity());

	const games = getGameActivity(undefined, page);

	res.render('internal/games', { games, pagination });
});

// CRUD

router.post('/:id', (req, res) => {
	const { id } = req.params;
	const { crudType, name, playtime_mins, created_at, updated_at } = req.body;

	switch (crudType) {
		case 'delete':
			deleteGameActivity(id);
			break;

		case 'update':
			updateGameActivity(id, name, playtime_mins, created_at, updated_at);
			break;

		default:
			// Do nothing
			break;
	}

	res.redirect('/games');
});

export default router;