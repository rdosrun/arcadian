var https = require('follow-redirects').https;
var fs = require('fs');

var qs = require('querystring');
function get_token() {
    return new Promise((resolve, reject) => {
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

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log("response", body.toString());
                try {
                    const parsedBody = JSON.parse(body.toString());
                    resolve(parsedBody.access_token);
                    return parsedBody.access_token;
                } catch (error) {
                    reject(error);
                }
            });

            res.on("error", function (error) {
                console.error(error);
                reject(error);
            });
        });

        var postData = qs.stringify({
            'grant_type': 'client_credentials',
            'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            'client_assertion': 'eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InVKbDVicVVvMUkwd0g1TGxieVViWEpfRExLMXF1eGhHVmJqbDJPbzBXT00ifQ.eyJpc3MiOiJjZGIwNGY1MjUyNzM5MGUxMDMxZDhkMDVmNTdmODgxMzY1MzNkMzUzZDZhYjhhYjg3NTcwMDI0MTMxZmNiNzY3Iiwic2NvcGUiOlsicmVzdGxldHMiLCJyZXN0X3dlYnNlcnZpY2VzIiwic3VpdGVfYW5hbHl0aWNzIl0sImlhdCI6MTc0MTQ3Mjk1MC4zOTUsImV4cCI6MTc0MTQ3NjU1MC4zOTUsImF1ZCI6Imh0dHBzOi8vMTEzNzQ1ODUuc3VpdGV0YWxrLmFwaS5uZXRzdWl0ZS5jb20vc2VydmljZXMvcmVzdC9hdXRoL29hdXRoMi92MS90b2tlbiJ9.DmLN44AUOr40Z3ZwcyldGWrAh-JbDm_zMLO4sQ-QX2dGc2pYNbOsmsbhZEv-VsbuDMLoGO7mfAtitwbjjCWiyMatW0clJQ7D26EAieFx0SJNZfDN9mdcNcPo08IMOlmPbSXaZYkNiGDmi94pz5rMzMdX_jA7ksjpqDFjBVeqHuh1eWQNB69SYkyVzmbgFttie0uNaR5FN7zlQcLnEkjYRwbvo9ijbSW8KVx-BEc8ts1CxF_fo54eiTQ3XNn54YbCQsDU-X6iOl_9gg5yVzkcB6KWaBDU1tTJ_g3dDLoH2GLmBivwz_F73DpK-qSOy-Ks-dRtcktYR3w7_Z7ZK-qe1F9g6SieNuQxYlQ3toTQ6oJ-vpGbdydq45mJNsaLTDyMrJF9cWD_QQavRNzbr4tyhY3qE0GVNflkIOv9WFYkj8qdJKW0ejkdd3BGXPktvPfRxCdAElN5wja9nk5TvXKzigaX-uJMi-S5ACpLhT_2iWtpl5P94kjOoDcoO2UDI2Wm'
        });

        req.write(postData);
        req.end();
    });
}

module.exports = { get_token };