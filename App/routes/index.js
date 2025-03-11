/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();
var { get_token } = require('./libs/get_token');
const { get_employees } = require('./backend/netsuite');
const axios = require('axios');
const path = require('path');

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
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

router.post('/auth/callback', async function (req, res, next) {
    //1 get the token deal with long in 
    console.log('Client Info:', req.body.client_info);
    const decodedToken = JSON.parse(Buffer.from(req.body.client_info, 'base64').toString('utf8'));
    console.log('Decoded Token:', decodedToken);
    console.log('Username:', decodedToken.preferred_username);

    // Check if username exists and get access token
    try {
        // Get the list of employees from NetSuite
        const employees = await get_employees();
        const employeeList = JSON.parse(employees).items;
        console.log('Employee List:', employeeList);

        // Check if the username is in the list of employees
        const userExists = employeeList.some(employee => employee.email === decodedToken.preferred_username);
        if (userExists) {
            console.log('User exists in NetSuite.');
            req.session.isAuthenticated = true;
        } else {
            console.log('User does not exist in NetSuite.');
            req.session.isAuthenticated = false;
        }
    } catch (err) {
        console.log(err);
        req.session.isAuthenticated = false;
    }

    //2 redirect to default page (index.hbs)
    res.redirect('/');
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
});

router.get('/views/:page', function (req, res, next) {
    const page = req.params.page;
    res.render(page, {
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route to access pages in the retail folder
router.get('/retail/:page', isAuthenticated, function (req, res, next) {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../views/retail', page));
});

module.exports = router;
