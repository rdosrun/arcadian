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
        const accessToken = get_token();
        //"eyJraWQiOiJjLjExMzc0NTg1LjIwMjUtMDEtMjlfMDAtMDItMjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzOzMiLCJhdWQiOlsiREM1OEFERTctREQ5OS00NTZELUJCMDAtMkIwRTFBMkZGNURCOzExMzc0NTg1IiwiY2RiMDRmNTI1MjczOTBlMTAzMWQ4ZDA1ZjU3Zjg4MTM2NTMzZDM1M2Q2YWI4YWI4NzU3MDAyNDEzMWZjYjc2NyJdLCJzY29wZSI6WyJzdWl0ZV9hbmFseXRpY3MiLCJyZXN0bGV0cyIsInJlc3Rfd2Vic2VydmljZXMiXSwiaXNzIjoiaHR0cHM6Ly9zeXN0ZW0ubmV0c3VpdGUuY29tIiwib2l0IjoxNzQxNDYxMzA4LCJleHAiOjE3NDE0NjQ5MDgsImlhdCI6MTc0MTQ2MTMwOCwianRpIjoiMTEzNzQ1ODUuYS1jLm51bGwuMTc0MTQ2MTMwODYyNSJ9.OEVE0R6IBJS3yJKWToPSiUhCRU7M9Ad2PrfFnQmBC9wbYPsojn5YT2VhOXufEHm7Sw5iLj3pqzwlSW6XrbYnb0M9NGUicxmQL4mguUHDELAecSYZ_5mOuKS7GPHznQVVATFIEKDXKCfY50atAv8KOJCPtjmZK77asLusSaupvhNmwz1FOdqkEpVMNt_QUIGBOtIu23dIAZaBI6eib3Zf9SRQBeHTZaiXZsIAKw_3aZs5vbVZ3FZOsLjhwOGYKCoZ7efGJ-PgSH9NnA0NYPyNRzF6xM8_X70BfcgihcjWdv3dZGBAML3-wCwdABlxM6Rw4GuXUCDnhGAqLuG4U3z4vwALto6tXWq_MHvkBna6BZfZOknQEF3adWz0mkL7bTqVbiUUk-g_dfSfmY4nBRApUySe1dhWBANoqqLWZUqPt-flTAr71Tupp5vK3JLFGgVBLUCLZpktFt7rjAl1wqtuhXQuFgRHOqrYhGNiKHFwxHOACKOPuP3hRViXH-AZ9SzqSrvTR2oO4basRCv6lPQaqX_ome5SahgA86Lhz1Xvf3f52lfLWp3_7-zT1eFy6bBu1nfhOhaYj4j72oIGsem2SAUKPBqzQW4VM7Nl8l0ODCRRqJq8hqrbovhEqVLbP-VE_HPEItXPT_UDImOjSAfNDLZj0UfOsTbOraesZLqP8TY";
        var https = require('follow-redirects').https;
        var fs = require('fs');

        var options = {
        'method': 'POST',
        'hostname': '11374585.suitetalk.api.netsuite.com',
        'path': '/services/rest/query/v1/suiteql',
        'headers': {
            'Prefer': 'transient',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        'maxRedirects': 20
        };

        var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
        });
        });

        var postData = JSON.stringify({
        "q": "SELECT id, entityid, email FROM employee;"
        });

        req.write(postData);

        req.end();
        /*console.log('Access Token:', accessToken);

        // Query NetSuite using the access token
        const accountId = process.env.ACCOUNT_ID;
        const response = await axios.post(`https://11374585.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`, {
            q: "SELECT id, entityid, email FROM employee;"
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Accept': '**',
                'Prefer': 'transient',
                'Connection': 'keep-alive',
            }
        });

        console.log('NetSuite Query Response:', response.data.items);*/
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
