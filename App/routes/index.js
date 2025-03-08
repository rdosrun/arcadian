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
        const accessToken = "eyJraWQiOiJjLjExMzc0NTg1LjIwMjUtMDEtMjlfMDAtMDItMjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzOzMiLCJhdWQiOlsiREM1OEFERTctREQ5OS00NTZELUJCMDAtMkIwRTFBMkZGNURCOzExMzc0NTg1IiwiY2RiMDRmNTI1MjczOTBlMTAzMWQ4ZDA1ZjU3Zjg4MTM2NTMzZDM1M2Q2YWI4YWI4NzU3MDAyNDEzMWZjYjc2NyJdLCJzY29wZSI6WyJzdWl0ZV9hbmFseXRpY3MiLCJyZXN0bGV0cyIsInJlc3Rfd2Vic2VydmljZXMiXSwiaXNzIjoiaHR0cHM6Ly9zeXN0ZW0ubmV0c3VpdGUuY29tIiwib2l0IjoxNzQxNDU4MjY2LCJleHAiOjE3NDE0NjE4NjYsImlhdCI6MTc0MTQ1ODI2NiwianRpIjoiMTEzNzQ1ODUuYS1jLm51bGwuMTc0MTQ1ODI2NjEyNSJ9.PSPeIMxCMR7zOH9d4bF7gZ5Mt9X-w-y_2ArXxTeWific-bO3FWeB196M-o1y1VS62c2jPSsjt75jSsAmfHdUQ93OkDwakiVv6jp8-ysgxsmiw247pgkzpQdCoqCPGnbgx3h27TP8R9K-875CiilS-Hxrzgw50FljIzQASA21KKzmJXYM1_c3s4H9diYHPyNniHy4Dx7QMHFCZDVnVGozxCFHyBoRSEBOgB9wwOatBhviD9I9jPGBqo4w38vp1IQVpiD4K0tcrDOMCuGXCldI-F10X8fovvaYkYC1Hl_OMCdcL1dU7-wSLh3BffXMdC4m7-g9s3MrudFJ64Fz525XKzmc1APPB3dp_jKe5dycLjzW3Sm-TCN2npQ1FwJVuNLF_E1Z3Tlw36Ju2oHENau_a574eSWHP1SultxxI4Sn9uq3BmUGrD9wgswDAyiSom5BH9lpoMCfX4iP_fCK7hyoRrOaMS4uHkgKYevOoH-Bff8r0b0IRg8IJ2U7FadGrPzs76M5p_hy-zyI7sM_rXNPoeGUeWs_RoDUhighLf65Oxrwmiaj8ZdBqj2KuuGNSG5Eijh7XN2eTSmlJS_ulH1yjjKBSEZL_q9WyzCbr3_KLXAc60K4rKxQ48irCFwqDhx4kS-BdXrxIYY8g4N2N-2iKTNUGsEwW-qy-IOb6MaYhQs";
        console.log('Access Token:', accessToken);

        // Query NetSuite using the access token
        const accountId = process.env.ACCOUNT_ID;
        const response = await axios.post(`https://11374585.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`, {
            q: "SELECT id, entityid, email FROM employee;"
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Prefer': 'transient',
                'Connection': 'keep-alive',
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
