function get_token() {
    console.log("Getting token");
const cryptojs = require('crypto-js'); // using crypto js for base64 encoding
const KJUR = require('jsrsasign'); // Make sure to include jsrsasign

// You can use environment variables for keys and other secrets
const CONSUMER_KEY = process.env.CONSUMER_KEY; // Assuming you set this as an environment variable
const CERTIFICATE_PRIVATE_KEY = process.env.CERTIFICATE_PRIVATE_KEY; // Similarly, set private key as an env variable

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
exports.get_token = get_token;