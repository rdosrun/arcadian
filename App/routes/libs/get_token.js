const cryptojs = require('crypto-js'); // using crypto js for base64 encoding
const fs = require('fs');
const path = require('path');
const KJUR = require('jsrsasign'); // using jsrsasign lib for JWT creation

function get_token() {
    console.log("Getting token");

    // Read the Postman environment file and parse it into a JSON object
    const postmanEnvPath = path.join(__dirname, '../../Arcadian Outfitters LLC.postman_environment.json');
    const postmanEnv = JSON.parse(fs.readFileSync(postmanEnvPath, 'utf8'));
    console.log('Postman Environment:', postmanEnv);

    const CONSUMER_KEY = postmanEnv.values.find(v => v.key === 'CONSUMER_KEY').value;
    const CERTIFICATE_PRIVATE_KEY = postmanEnv.values.find(v => v.key === 'CERTIFICATE_PRIVATE_KEY').value;

    // Create JWT header
    var jwtHeader = {
        alg: 'PS256', // Using PS256, which is one of the algorithms NetSuite supports for client credentials
        typ: 'JWT',
        kid: 'uJl5bqUo1I0wH5LlbyUbXJ_DLK1quxhGVbjl2Oo0WOM' // Certificate Id on the client credentials mapping
    };

    let stringifiedJwtHeader = JSON.stringify(jwtHeader);

    // Create JWT payload
    let jwtPayload = {
        iss: CONSUMER_KEY, // consumer key of integration record
        scope: ['restlets', 'rest_webservices', 'suite_analytics'], // scopes specified on integration record
        iat: Math.floor(new Date().getTime() / 1000), // timestamp in seconds
        exp: Math.floor(new Date().getTime() / 1000) + 3600, // timestamp in seconds, 1 hour later
        aud: 'https://11374585.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token'
    };

    var stringifiedJwtPayload = JSON.stringify(jwtPayload);

    // Base64 encode the secret (private key)
    let encodedSecret = cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(CERTIFICATE_PRIVATE_KEY)); // we need to base64 encode the key

    // Sign the JWT with the PS256 algorithm (algorithm must match what is specified in JWT header)
    // The JWT is signed using the jsrsasign lib (KJUR)
    let signedJWT = KJUR.jws.JWS.sign('PS256', stringifiedJwtHeader, stringifiedJwtPayload, CERTIFICATE_PRIVATE_KEY);

    // Store the signed JWT for further use, can be saved to a variable or sent in an API request
    const clientAssertion = signedJWT;
    console.log("Client Assertion:", clientAssertion);
    return clientAssertion;
}

module.exports = { get_token };