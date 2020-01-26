const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const tasksRoutes = require('./routes/tasksRoutes');
const usersRoutes = require('./routes/usersRoutes');

const application = express();

application.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', request.header('origin'));
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
application.use(session({
    name: 'sid',
    secret: 'some',
    saveUninitialized: true,
    resave: true,
    cookie: {
        path: '/',
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 60,
        secure: false,
        httpOnly: false
    }
}));
application.use((request, response, next) => {
    if (!request.session.user) {
        request.session.user = 'unauthorized';
    }
    next();
});
application.use(bodyParser());
application.use('/taskManager/users', usersRoutes);
application.use('/taskManager/tasks', tasksRoutes);

application.listen(8090, () => {
    console.log('[SERVER STARTED]');
});