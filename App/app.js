/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();

var path = require('path');
var express = require('express');
var session = require('express-session');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var netsuite = require('./routes/backend/netsuite');
const { get_token } = require('./routes/libs/get_token');

// initialize express
var app = express();

/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */
 app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/script', express.static(path.join(__dirname, 'script')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/views/:page', function (req, res, next) {
    const page = req.params.page + '.html';
    res.sendFile(path.join(__dirname, 'views', page));
});

// Add a route to get item name by UPC
app.get('/item/:upc', async function (req, res) {
    const upc = req.params.upc;
    console.log("UPC: " + upc);
    try {
        // Replace this with your actual database or API query logic
        const itemName = await getItemNameByUPC(upc); // Assume this function fetches the item name
        if (itemName) {
            res.json({ success: true, name: itemName });
        } else {
            res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error fetching item name:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Mock function to simulate fetching item name by UPC
async function getItemNameByUPC(upc) {
    var inventory = netsuite.Inventory(); // Assume Inventory() returns an array of items
    //console.log(JSON.stringify(inventory));
    for (var i = 0; i < inventory.length; i++) {
        console.log(inventory[i].item_upc_code);
        if (inventory[i].item_upc_code == upc) {
            return inventory[i].item_name;
        }
    }
    console.log("Item not found");
    return null;
    //return inventory.find(item => item.item_upc_code === upc) || null;
}

// Serve images or list files in a directory
app.get('/images/:state', function (req, res) {
    const state = req.params.state;
    const dirPath = path.join(__dirname, 'images', state);

    fs.stat(dirPath, (err, stats) => {
        if (err) {
            console.error('Error accessing path:', err);
            return res.status(404).json({ success: false, message: 'Path not found' });
        }

        if (stats.isDirectory()) {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                const fileData = files.map(file => ({
                    imageUrl: `/images/${state}/${file}`,
                    id: path.parse(file).name,
                    price: (Math.random() * 100).toFixed(2) // Mock price for demonstration
                }));

                res.json(fileData);
            });
        } else {
            res.status(400).json({ success: false, message: 'Not a directory' });
        }
    });
});

// Run get_token every hour
setInterval(() => {
    try {
        get_token();
        console.log("Token refreshed successfully.");
    } catch (err) {
        console.error("Error refreshing token:", err);
    }
}, 3600000); // 3600000 milliseconds = 1 hour

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
