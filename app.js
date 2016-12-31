'use strict';
const routes = require('./controllers/routes');
const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const koa = require('koa');
const path = require('path');
const app = module.exports = koa();
const startWsServer = require('./controllers/wserver');
const startBot = require('./controllers/bot_telegram').startBot;

// Logger
app.use(logger());

app.use(route.get('/', routes.home));
app.use(route.get('/log/:room/:date', routes.chatLogHandler));
app.use(route.get('/dogchamber/:room/:date', routes.chatHandler));
app.use(route.post('/upload/file', routes.uploadHandler));

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

startWsServer();
// Compress
app.use(compress());

if (!module.parent) {
	app.listen(3000);
	console.log('listening on port 3000');
}

// vim: ts=4 st=4 sw=4
