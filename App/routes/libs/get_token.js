var https = require('follow-redirects').https;
var fs = require('fs');

var qs = require('querystring');
function get_token() {
var options = {
  'method': 'POST',
  'hostname': '11374585.suitetalk.api.netsuite.com',
  'path': '/services/rest/auth/oauth2/v1/token',
  'headers': {
    'Content-Type': 'application/x-www-form-urlencoded'
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
    console.log("line25",body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = qs.stringify({
  'grant_type': 'client_credentials',
  'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  'client_assertion': 'eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InVKbDVicVVvMUkwd0g1TGxieVViWEpfRExLMXF1eGhHVmJqbDJPbzBXT00ifQ.eyJpc3MiOiJjZGIwNGY1MjUyNzM5MGUxMDMxZDhkMDVmNTdmODgxMzY1MzNkMzUzZDZhYjhhYjg3NTcwMDI0MTMxZmNiNzY3Iiwic2NvcGUiOlsicmVzdGxldHMiLCJyZXN0X3dlYnNlcnZpY2VzIiwic3VpdGVfYW5hbHl0aWNzIl0sImlhdCI6MTc0MTQ2MTMwNy4xNDIsImV4cCI6MTc0MTQ2NDkwNy4xNDIsImF1ZCI6Imh0dHBzOi8vMTEzNzQ1ODUuc3VpdGV0YWxrLmFwaS5uZXRzdWl0ZS5jb20vc2VydmljZXMvcmVzdC9hdXRoL29hdXRoMi92MS90b2tlbiJ9.AfUjFgJujFFPBdilugPhHN3wIAVv0LRYeV75hdZwsQYwZq539qN1kK9VuST12EzXSt_aARiE35B5eov3INKHU91xxyA7u8kKnyK69PWkr_E2hXdrlsrhfsAuQP_lFgfW5mrk9z3TTjAD5E8wkpKlL-FyQa-rwTFZp49EoweAOIGXWbqpLALYPobfA799pfGaRbQnT0uT_645MNAkm21pLVB_R2Nefdrr0Jbcr6MLX6iLxNevEZW1i6Ywy8thlLQyUBN_8WA7jo1QjvFLVt9cw9ZzpoNLKqDD9RPjL-k2_7dU6CG9uKce9bTuqFFgPCtysvzwULJSWLyggSWtfYwEHlxaI5aZ0UrYQTqe7Yl5a8XrTAxL7bVe6efoIrPCli0b4SSx4EHOSNTsI7etEIPBDyX52gpoumsRVTs0-LhMCH59ImosngYuvSDFHjN6NELkybf-s9H_HBYIh2sahP-wjg2S3QR_yF0XsEtRzO05P0zYWx63BFTSjmyepNCIftTe'
});

req.write(postData);

req.end();
    return ;
}
module.exports = { get_token };
/*const cryptojs = require('crypto-js'); // using crypto js for base64 encoding
const fs = require('fs');
const path = require('path');
const KJUR = require('jsrsasign'); // using jsrsasign lib for JWT creation

function get_token() {
    console.log("Getting token");

    // Read the Postman environment file and parse it into a JSON object
    const postmanEnvPath = path.join(__dirname, '../../Arcadian Outfitters LLC.postman_environment.json');
    const postmanEnv = JSON.parse(fs.readFileSync(postmanEnvPath, 'utf8'));
    //console.log('Postman Environment:', postmanEnv);

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
    //console.log("Client Assertion:", clientAssertion);

    // Write the clientAssertion to a file, overwriting any existing content
    const outputPath = path.join(__dirname, '../../clientAssertion.txt');
    fs.writeFileSync(outputPath, clientAssertion, 'utf8');
    console.log("Client Assertion written to file:", outputPath);

    return clientAssertion;
}

module.exports = { get_token };*/