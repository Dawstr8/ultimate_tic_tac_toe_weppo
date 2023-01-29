var session = require('express-session');
var crypto = require('crypto');

const sessionMiddleware = session({
    resave: true,
    saveUninitialized: true,
    secret: 'fegegergergergergergergwfewfg'
});

const createSessionMiddleware = (users) => {
    return (req, res, next) => {
        var uuid;
        if (!req.session.uuid) {
            uuid = crypto.randomUUID();
            req.session.uuid = uuid;
        } else {
            uuid = req.session.uuid;
        }
        if (!users.hasOwnProperty(uuid)) {
            users[uuid] = {
                username: null,
                room: null,
            }
        }
        next();
    }
}

const wrap = (expressMiddleware) => (socket, next) => expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, createSessionMiddleware, wrap }