import express from 'express';
import { type ListenBrainzPayload, convertScrobbleIntoListen, setNowPlaying } from '../../adapters/listenbrainz.js';
import { validateDevice } from '../../database/devices.js';
import { insertScrobble } from '../../database/listens.js';
import Logger from '../../lib/logger.js';
import type { RequestFrontend } from '../../types/express.js';

const log = new Logger('ListenBrainz');
const router = express.Router();

router.get('/1/validate-token', (req: RequestFrontend, res) => {
	try {
		const { token } = req.query;

		const { description } = validateDevice(token);

		res.send({
			code: 200,
			message: 'Token valid.',
			valid: true,
			user: description,
		});
	} catch (err) {
		res.send({
			code: 200,
			message: 'Token invalid.',
			valid: false,
		});
	}
});

router.post('/1/submit-listens', async (req: RequestFrontend<object, ListenBrainzPayload>, res) => {
	try {
		// Validate Device API Key
		const authToken = req.headers.authorization?.toLowerCase();
		if (!authToken || authToken.startsWith('token ') === false) {
			throw new Error('Provided token is invalid');
		}
		const { id: device_id } = validateDevice(authToken.substring(6));

		// Set now playing notification
		if (req.body.listen_type === 'playing_now') {
			setNowPlaying(req.body.payload);
			res.send({ status: 'ok' });
			return;
		}

		for (const scrobble of req.body.payload) {
			const listen = await convertScrobbleIntoListen(scrobble);
			log.debug(`Saving "${listen.title}" by ${listen.artist}`);
			insertScrobble({ ...listen, device_id });
		}

		res.send({ status: 'ok' });
	} catch (err) {
		const error = err as Error;
		log.error(err);
		res.status(500).send({
			status: 'error',
			code: 500,
			error: error.message,
		});
	}
});

export default router;
