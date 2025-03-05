const express = require('express');
const path = require('path');
const session = require('express-session');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/script', express.static(path.join(__dirname, 'script')));


// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use('/views/:page', function (req, res, next) {
    const page = req.params.page + '.html';
    console.log("line 35");
    res.render(page, {
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

module.exports = app;
