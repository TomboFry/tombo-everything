import { resolve } from 'node:path';
import { environment } from '@tombofry/stdlib';
import dotenv from 'dotenv';

dotenv.config();

environment.checkEnvironment({}, [
	'TOMBOIS_SERVER_PORT_EXTERNAL',
	'TOMBOIS_SERVER_PORT_INTERNAL',
	'TOMBOIS_SQLITE_LOCATION',
	'TOMBOIS_DEFAULT_DEVICE_ID',
	'TOMBOIS_SERVER_EXTERNAL_URI',
]);

export const config = {
	portExternal: process.env.TOMBOIS_SERVER_PORT_EXTERNAL as string,
	portInternal: process.env.TOMBOIS_SERVER_PORT_INTERNAL as string,
	sqliteLocation: process.env.TOMBOIS_SQLITE_LOCATION as string,
	defaultDeviceId: process.env.TOMBOIS_DEFAULT_DEVICE_ID as string,
	serverExternalUri: process.env.TOMBOIS_SERVER_EXTERNAL_URI as string,
	personName: process.env.TOMBOIS_PERSON_NAME,
	footerHtml: process.env.TOMBOIS_FOOTER_HTML,
	cacheDurationSecs: Number(process.env.TOMBOIS_SERVER_CACHE_DURATION_SECS || 600),
	cacheIntervalSecs: Number(process.env.TOMBOIS_SERVER_CACHE_INTERVAL_SECS || 1200),

	discord: {
		token: process.env.TOMBOIS_DISCORD_TOKEN,
		channelId: process.env.TOMBOIS_DISCORD_CHANNELID,
	},

	youtube: {
		tokenPath: resolve(process.env.TOMBOIS_GOOGLE_TOKENFILE ?? ''),
		clientId: process.env.TOMBOIS_GOOGLE_CLIENTID,
		clientSecret: process.env.TOMBOIS_GOOGLE_CLIENTSECRET,
		apiKey: process.env.TOMBOIS_GOOGLE_APIKEY,
		pollInterval: Number(process.env.TOMBOIS_GOOGLE_POLL_INTERVAL ?? 5),
	},

	letterboxd: {
		dataPath: resolve(process.env.TOMBOIS_LETTERBOXD_DATA_FILE ?? ''),
		username: process.env.TOMBOIS_LETTERBOXD_USERNAME,
		intervalSecs: Number(process.env.TOMBOIS_LETTERBOXD_POLL_INTERVAL_SECS ?? 86400),
	},

	steam: {
		dataPath: resolve(process.env.TOMBOIS_STEAM_DATA_FILE ?? ''),
		apiKey: process.env.TOMBOIS_STEAM_APIKEY,
		userId: process.env.TOMBOIS_STEAM_USERID,
		steamDeviceId: process.env.TOMBOIS_STEAM_DEVICE_ID,
		pollIntervalMinutes: Number(process.env.TOMBOIS_STEAM_POLL_INTERVAL ?? 20),
	},

	psn: {
		dataPath: resolve(process.env.TOMBOIS_PSN_DATA_FILE ?? ''),
		npsso: process.env.TOMBOIS_PSN_NPSSO,
		deviceId: process.env.TOMBOIS_PSN_DEVICE_ID,
		pollInterval: Number(process.env.TOMBOIS_PSN_POLL_INTERVAL ?? 5),
	},

	sonarr: {
		apiKey: process.env.TOMBOIS_SONARR_APIKEY,
		serverUrl: process.env.TOMBOIS_SONARR_URL,
	},

	subsonic: {
		url: process.env.TOMBOIS_SUBSONIC_URL,
		username: process.env.TOMBOIS_SUBSONIC_USERNAME,
		password: process.env.TOMBOIS_SUBSONIC_PASSWORD,
	},
} as const;
