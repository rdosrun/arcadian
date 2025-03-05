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
    console.log(req.client_info);
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

router.get('/auth/callback', function (req, res, next) {
    // Handle the authentication callback
    // You can add your logic here to process the callback and set session variables
    
    const token = req.query.token; // Assuming the token is passed as a query parameter
    res.render('callback', { token });
});

module.exports = router;
