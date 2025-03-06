/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();
var { get_token } = require('./libs/get_token');
const axios = require('axios');

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
        const accessToken = get_token().replace(/[\r\n]+/g, '');
        console.log('Access Token:', accessToken);

        // Query NetSuite using the access token
        const accountId = process.env.ACCOUNT_ID;
        const response = await axios.post(`https://11374585.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`, {
            query: '"SELECT id, entityid, email FROM employee;"'
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('NetSuite Query Response:', response.data.items);
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
