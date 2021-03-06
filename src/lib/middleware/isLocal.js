const allowedIps = [
	'127.0.0.1',
	'192.168.1.',
];

export default (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const matches = allowedIps.find(allow => ip.includes(allow));
	if (matches === undefined) {
		res.redirect('/');
		return;
	}
	next();
};
