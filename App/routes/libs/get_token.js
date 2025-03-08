var https = require('follow-redirects').https;
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
                console.log("line25", body.toString());
                try {
                    body = JSON.parse(body.toString());
                    console.log("line28", body);
                    resolve(body.access_token);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
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
            'client_assertion': 'eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InVKbDVicVVvMUkwd0g1TGxieVViWEpfRExLMXF1eGhHVmJqbDJPbzBXT00ifQ.eyJpc3MiOiJjZGIwNGY1MjUyNzM5MGUxMDMxZDhkMDVmNTdmODgxMzY1MzNkMzUzZDZhYjhhYjg3NTcwMDI0MTMxZmNiNzY3Iiwic2NvcGUiOlsicmVzdGxldHMiLCJyZXN0X3dlYnNlcnZpY2VzIiwic3VpdGVfYW5hbHl0aWNzIl0sImlhdCI6MTc0MTQ2MTMwNy4xNDIsImV4cCI6MTc0MTQ2NDkwNy4xNDIsImF1ZCI6Imh0dHBzOi8vMTEzNzQ1ODUuc3VpdGV0YWxrLmFwaS5uZXRzdWl0ZS5jb20vc2VydmljZXMvcmVzdC9hdXRoL29hdXRoMi92MS90b2tlbiJ9.AfUjFgJujFFPBdilugPhHN3wIAVv0LRYeV75hdZwsQYwZq539qN1kK9VuST12EzXSt_aARiE35B5eov3INKHU91xxyA7u8kKnyK69PWkr_E2hXdrlsrhfsAuQP_lFgfW5mrk9z3TTjAD5E8wkpKlL-FyQa-rwTFZp49EoweAOIGXWbqpLALYPobfA799pfGaRbQnT0uT_645MNAkm21pLVB_R2Nefdrr0Jbcr6MLX6iLxNevEZW1i6Ywy8thlLQyUBN_8WA7jo1QjvFLVt9cw9ZzpoNLKqDD9RPjL-k2_7dU6CG9uKce9bTuqFFgPCtysvzwULJSWLyggSWtfYwEHlxaI5aZ0UrYQTqe7Yl5a8XrTAxL7bVe6efoIrPCli0b4SSx4EHOSNTsI7etEIPBDyX52gpoumsRVTs0-LhMCH59ImosngYuvSDFHjN6NELkybf-s9H_HBYIh2sahP-wjg2S3QR_yF0XsEtRzO05P0zYWx63BFTSjmyepNCIftTe'
        });

        req.write(postData);
        req.end();
    });
}

module.exports = { get_token };