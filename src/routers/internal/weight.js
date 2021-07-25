import express from 'express';
import { countWeight, deleteWeight, getWeight, updateWeight } from '../../database/weight.js';
import handlebarsPagination from '../../lib/handlebarsPagination.js';

const router = express.Router();

// FRONTEND

router.get('/', (req, res) => {
	const { page = 0 } = req.query;
	const pagination = handlebarsPagination(page, countWeight());

	const weight = getWeight(undefined, page);

	res.render('internal/weight', { weight, pagination });
});

// CRUD

router.post('/:id', (req, res) => {
	const { id } = req.params;
	const { crudType, weight_kgs, created_at } = req.body;

	switch (crudType) {
		case 'delete':
			deleteWeight(id);
			break;

		case 'update':
			updateWeight(id, weight_kgs, created_at);
			break;

		default:
			// Do nothing
			break;
	}

	res.redirect('/weight');
});

export default router;