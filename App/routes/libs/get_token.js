function get_token() {
    var navigator = {}; // necessary as part of "eval" on jsrsasign lib
    var window = {}; // necessary as part of "eval" on jsrsasign lib
    //eval(pm.globals.get("jsrsasign-js")); // grabbing jsrsasign lib, loaded in separate GET 
    const token_js = require('./jsrsasign-js'); // using jsonwebtoken for JWT encoding
    const cryptojs = require('crypto-js'); // using crypto js for base64 encoding
    const fs = require('fs');
    const path = require('path');

    // Read the Postman environment file and parse it into a JSON object
    const postmanEnvPath = path.join(__dirname, '../Arcadian Outfitters LLC.postman_environment.json');
    const postmanEnv = JSON.parse(fs.readFileSync(postmanEnvPath, 'utf8'));
    console.log('Postman Environment:', postmanEnv);

    // Create JWT header
    var jwtHeader = {
        alg: 'PS256', // Using PS256, which is one of the algorithms NetSuite supports for client credentials
        typ: 'JWT',
        kid: 'uJl5bqUo1I0wH5LlbyUbXJ_DLK1quxhGVbjl2Oo0WOM' // Certificate Id on the client credentials mapping
    };

    let stringifiedJwtHeader = JSON.stringify(jwtHeader);

    // Create JWT payload
    let jwtPayload = {
        iss: postmanEnv.values.find(v => v.key === 'CONSUMER_KEY').value, // consumer key of integration record
        scope: ['restlets','rest_webservices', 'suite_analytics'], // scopes specified on integration record
        iat: (new Date() / 1000),               // timestamp in seconds
        exp: (new Date() / 1000) + 3600,        // timestamp in seconds, 1 hour later, which is max for expiration
        aud: 'https://11374585.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token'
    };

    var stringifiedJwtPayload = JSON.stringify(jwtPayload);

    // The secret is the private key of the certificate loaded into the client credentials mapping in NetSuite
    let secret = postmanEnv.values.find(v => v.key === 'CERTIFICATE_PRIVATE_KEY').value;
    let encodedSecret = cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(secret)); // we need to base64 encode the key

    // Sign the JWT with the PS256 algorithm (algorithm must match what is specified in JWT header).
    // The JWT is signed using the jsrsasign lib (KJUR)
    let signedJWT = KJUR.jws.JWS.sign('PS256',stringifiedJwtHeader,stringifiedJwtPayload,secret);

    // The signed JWT is the client assertion (encoded JWT) that is used to retrieve an access token
    //pm.collectionVariables.set('clientAssertion', signedJWT);
    console.log('Client Assertion:', signedJWT);

    return signedJWT;
}

module.exports = { get_token };