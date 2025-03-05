/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

router.post('/', function (req, res, next) {
    print(req.body);
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

router.post('/auth/callback', function (req, res, next) {
    //1 get the token deal with long in 
    print(req.body);
    //2 redirect to default page (index.hbs)

    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
    
    const token = req.query.token; // Assuming the token is passed as a query parameter
    res.render('callback', { token });
});

router.get('/views/:page', function (req, res, next) {
    const page = req.params.page;
    res.render(page, {
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

module.exports = router;
