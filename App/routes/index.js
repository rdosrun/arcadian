/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
var { get_token } = require('./libs/get_token');
const { get_employees, Inventory, Query_Customers } = require('./backend/netsuite');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Custom middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        console.log('User is not authenticated');
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }
    console.log('User is authenticated.');
    next();
}

router.get('/', function (req, res, next) {
    console.log("base:"+req.session.isAuthenticated)
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account,
        base_url: ""
    });
});

router.get('/', isAuthenticated, function (req, res, next) {
    console.log("authed:"+req.session.isAuthenticated)
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account,
        base_url: ""
    });
}
);

router.get('/auth/callback', async function (req, res, next) {

    //make jwt_route page

    //make it run a function that send the jwt token to the server
    //make that function do a res.redirect and preform auth above
    res.redirect('views/jwt');
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
});
router.get('/auth/callback/views/jwt', function (req, res) {
    res.sendFile(path.join(__dirname, '../views/jwt.html'));
});
router.get('/auth/callback/views/script.js', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/script/script.js'));
});

router.get('/auth/jwt_route', async function (req,res,next){
    console.log("JWT Route Loaded", req.body);
    token = req.body.idToken;
    console.log("JWT Route Loaded", token);

    try {
        console.log('Client Info:', token.client_info);
        const decodedToken = jwt.decode(token);
        console.log('Decoded Token:', decodedToken);
        console.log('Username:', decodedToken.preferred_username);
        // Get the list of employees from NetSuite
        const employees = await get_employees();
        const employeeList = JSON.parse(employees).items;
        //console.log('Employee List:', employeeList);
        console.log('Decoded Token:', decodedToken);
        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username);
        if (userExists) {
            const matchedEmployee = employeeList.find(employee => employee.email === decodedToken.preferred_username);
            console.log('User exists in NetSuite. Matched email:', matchedEmployee.email);
            req.session.isAuthenticated = true;
            req.session.account = matchedEmployee.email;
        } else {
            console.log('User'+ decodedToken.preferred_username +'does not exist in NetSuite.');
            req.session.isAuthenticated = false;
        }
        res.redirect('/');
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
        req.session.account = null;

    }



});


router.post('/auth/callback', async function (req, res, next) {

    //1 get the token deal with long in
    console.log('Client Info:', req.body.client_info);

    //this is where the breaking is happening it's not an nginx issue
    const decodedToken = JSON.parse(Buffer.from(req.body.client_info, 'base64').toString('utf8'));
    console.log('Decoded Token:', decodedToken);
    console.log('Username:', decodedToken.preferred_username);
    // Check if username exists and get access token
    try {
        // Get the list of employees from NetSuite
        const employees = await get_employees();
        const employeeList = JSON.parse(employees).items;
        //console.log('Employee List:', employeeList);
        console.log('Decoded Token:', decodedToken);
        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username);
        if (userExists) {
            const matchedEmployee = employeeList.find(employee => employee.email === decodedToken.preferred_username);
            console.log('User exists in NetSuite. Matched email:', matchedEmployee.email);
            req.session.isAuthenticated = true;
            req.session.account = Buffer.from(req.body.client_info, 'base64').toString('utf8');
        } else {
            console.log('User'+ decodedToken.preferred_username +'does not exist in NetSuite.');
            req.session.isAuthenticated = false;
        }
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
        req.session.account = null;
    }

    //2 redirect to default page (index.hbs)
    res.redirect('/');
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
});

router.get('/get_account', function (req, res) {
    res.json({
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
        account: req.session.account
    });
});

// Route to access pages in the retail folder
router.get('/retail/:page', isAuthenticated, function (req, res, next) {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../views/retail', page));
});

// Route to serve product images
router.get('/product_images/:image', function (req, res, next) {
    const image = req.params.image;
    res.sendFile(path.join(__dirname, '~/images/', image));
});

// Route to get the total number of hat images in a state's images folder
router.get('/hats/:state', isAuthenticated, function (req, res, next) {
    const state = req.params.state;
    const hatsFolderPath = path.join(__dirname, `~/images/${state}/*`);

    fs.readdir(hatsFolderPath, (err, files) => {
        if (err) {
            return next(err);
        }
        const hatImages = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        res.json({ totalHats: hatImages.length/4 });
    });
});

// Route to get inventory
router.get('/inventory', isAuthenticated, async function (req, res, next) {
    try {
        console.log('Querying inventory...', req.query);
        const offset = req.query.offset || 0;
        const inventory = await Inventory(offset);
        res.json(JSON.parse(inventory));
    } catch (error) {
        next(error);
    }
});

// Route to query customers
router.get('/customers', isAuthenticated, async function (req, res, next) {
    try {
        let allCustomers = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const customersPage = await Query_Customers(offset);
            const parsed = JSON.parse(customersPage);
            hasMore = parsed.hasMore;
            console.log('Customers Page:', parsed.hasMore);
            console.log('Customers Offset:', offset);
            if (parsed.items && parsed.items.length > 0) {
                allCustomers = allCustomers.concat(parsed.items);
                offset += 1000;
                // If less than 1000 returned, no more pages
            }
        }
        res.json({ items : allCustomers });
    } catch (error) {
        //next(error);
    }
});

module.exports = router;
