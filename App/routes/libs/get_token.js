var https = require('follow-redirects').https;
var fs = require('fs');
var qs = require('querystring');
var path = require('path');
var jsrsasign = require('jsrsasign');

// Load environment variables from the Postman environment file
const envFilePath = path.join(__dirname, '../../Arcadian Outfitters LLC.postman_environment.json');
const envData = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
const CONSUMER_KEY = envData.values.find(v => v.key === 'CONSUMER_KEY').value;
const CERTIFICATE_PRIVATE_KEY = envData.values.find(v => v.key === 'CERTIFICATE_PRIVATE_KEY').value;

function get_token() {
    return new Promise((resolve, reject) => {
        var navigator = {}; // necessary as part of "eval" on jsrsasign lib
        var window = {}; // necessary as part of "eval" on jsrsasign lib
        //eval(pm.globals.get("jsrsasign-js")); // grabbing jsrsasign lib, loaded in separate GET 

        const cryptojs = require('crypto-js'); // using crypto js for base64 encoding

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
            scope: ['restlets','rest_webservices', 'suite_analytics'], // scopes specified on integration record
            iat: (new Date() / 1000),               // timestamp in seconds
            exp: (new Date() / 1000) + 3600,        // timestamp in seconds, 1 hour later, which is max for expiration
            aud: 'https://11374585.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token'
        };
        console.log('JWT Payload:');
        var stringifiedJwtPayload = JSON.stringify(jwtPayload);

        // The secret is the private key of the certificate loaded into the client credentials mapping in NetSuite
        let secret = CERTIFICATE_PRIVATE_KEY;
        let encodedSecret = cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(secret)); // we need to base64 encode the key

        // Sign the JWT with the PS256 algorithm (algorithm must match what is specified in JWT header).
        // The JWT is signed using the jsrsasign lib (KJUR)
        let signedJWT = jsrsasign.jws.JWS.sign('PS256',stringifiedJwtHeader,stringifiedJwtPayload,secret);
        console.log('Signed JWT:', signedJWT);
        // The signed JWT is the client assertion (encoded JWT) that is used to retrieve an access token
        //.collectionVariables.set('clientAssertion', signedJWT);
        return signedJWT;
        
    });
}

module.exports = { get_token };