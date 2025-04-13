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
            res.json({ success: true, results: itemName });
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
    var j =0;
    while(true){
        var temp = await netsuite.Inventory(j*1000,(j+1)*1000); // Assume Inventory() returns an array of items
        console.log (temp);
        inventory = JSON.parse(temp).items;
        console.log(inventory);

        for (var i = 0; i < inventory.length; i++) {
            if (inventory[i].item_upc_code == upc) {
                return inventory[i];
            }
        }
        if (inventory.length < 1000) break;
        j++;
    }

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
            fs.readdir(dirPath, (err, subDirs) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                const fileData = [];
                let pending = subDirs.length;

                if (!pending) {
                    return res.json(fileData); // No subdirectories
                }

                subDirs.forEach(subDir => {
                    const subDirPath = path.join(dirPath, subDir);

                    fs.stat(subDirPath, (err, subDirStats) => {
                        if (err || !subDirStats.isDirectory()) {
                            if (!--pending) {
                                res.json(fileData);
                            }
                            return;
                        }

                        fs.readdir(subDirPath, (err, files) => {
                            if (!err) {
                                files.forEach(file => {
                                    fileData.push({
                                        imageUrl: `/images/${state}/${subDir}/${file}`,
                                        id: path.parse(file).name,
                                        price: 10 // Mock price for demonstration
                                    });
                                });
                            }

                            if (!--pending) {
                                res.json(fileData);
                            }
                        });
                    });
                });
            });
        } else {
            res.status(400).json({ success: false, message: 'Not a directory' });
        }
    });
});

app.post('/submit-order', async (req, res) => {
    const { cart, customer } = req.body;

    if (!cart || !customer) {
        return res.status(400).json({ success: false, message: 'Cart and customer details are required' });
    }

    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    console.log()
    const payload = {
        customerId: customer.customer_internal_id,
        customerName: customer.customer_company_name,
        orderDate: formattedDate,
        shipDate: formattedDate,
        fulfillmentLocation: 1,
        poNumber: "PO12345",
        memo: "This is a new sales order",
        billToSelected: null,
        shipToSelected: null,
        items: cart.map(item => ({
            //itemName: item.name,
            itemUPC: item.ID,
            quantity: 8, // Adjust quantity as needed
            priceLevel: null, //grab price level from netsuite for each customer
            rate: null, 
            location: null // grab location from netsuite for each customer
        }))
    };
    console.log(payload);

    try {
        const newToken = await get_token();
        const response = await fetch(`https://11374585.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=905&deploy=1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}` // Replace with your access token
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            res.json({ success: true, message: 'Order placed successfully', data });
        } else {
            res.status(response.status).json({ success: false, message: 'Failed to place order', data });
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
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
