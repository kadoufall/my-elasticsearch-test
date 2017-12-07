const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const path = require('path');
const controller = require('./controller');
const render = require('koa-art-template');

const app = new Koa();

app.use(bodyParser());

render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.art',
    debug: process.env.NODE_ENV !== 'production'
});

app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');




