/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();
var { get_token } = require('./libs/get_token');

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'MSAL Node & Express Web App',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});


router.post('/auth/callback', function (req, res, next) {
    //1 get the token deal with long in 
    console.log('Client Info:', req.body.client_info);
    const decodedToken = JSON.parse(Buffer.from(req.body.client_info, 'base64').toString('utf8'));
    console.log('Decoded Token:', decodedToken);
    console.log('Username:', decodedToken.preferred_username);

    // Check if username exists and get access token
    try {
        const accessToken = get_token();
        console.log('Access Token:', accessToken);
    } catch (err) {
        console.log(err);
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

module.exports = router;
