import dotenv from 'dotenv';
import Logger from './lib/logger.js';
import { getDatabase } from './database/database.js';

// Servers
import appExternal from './app-external.js';
import appInternal from './app-internal.js';

// Adapters
import { pollForLikedVideos } from './adapters/youtube.js';
import { pollForGameActivity } from './adapters/steam.js';
import { pollForCacheDeletion } from './lib/middleware/cachePage.js';

const log = new Logger('http');

// Load .env file
dotenv.config();

// Set up polling adapters
pollForLikedVideos();
pollForGameActivity();
pollForCacheDeletion();

// Start servers
appExternal();
appInternal();

process.on('exit', async () => {
	log.info('Exiting - closing database');

	getDatabase().close();
});
