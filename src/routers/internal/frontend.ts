import express from 'express';

const router = express.Router();

// DASHBOARD

router.get('/', (_req, res) => {
	res.render('internal/index');
});

export default router;