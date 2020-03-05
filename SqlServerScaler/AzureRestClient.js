const https = require("https");
const qs = require("querystring");

class AzureRestClient {

    constructor(subscriptionId, resourceGroupName, serverName, databaseName, apiVersion, adminKey){
        this.subscriptionId = subscriptionId;
        this.resourceGroupName = resourceGroupName;
        this.serverName = serverName;
        this.databaseName = databaseName;
        this.apiVersion = apiVersion;
        this.adminKey = adminKey;
    }
    getAzureUrl() {
       return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Sql/servers/${this.serverName}/databases/${this.databaseName}?api-version=${this.apiVersion}`;

    }
    
    getNewAccessToken(userToken,params,callback) {
        // is in form "Bearer XYZ..."
        const [bearer, tokenValue] = userToken.split(" ");
        const jsonData = JSON.parse(params);
        let payload = qs.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            client_id: jsonData.clientID,
            client_secret: jsonData.clientSecret,
            scope: jsonData.resourceScope,
            assertion: tokenValue,
            requested_token_use: 'on_behalf_of'
        });
    
        let options = {
            method: "POST",
            host: "login.microsoftonline.com",
            path: `/${jsonData.tenantName}.onmicrosoft.com/oauth2/v2.0/token`,
            port: "443",
            headers: {
                "Accept": "*/*",
                "Cache-control": "no-cache",
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(payload)
            }
        };
    
        let req = https.request(options, res => {
            let data = '';
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                callback(data);
            });
            res.on("error", err => {
                console.log(`ERROR ${res.statusCode}: ${err}`);
            })
           
        });
    
        req.write(payload);
        req.end();
    }
    callResourceAPI(newTokenValue,callback) {
        console.log('calling azure sql server resource api');
            
          
             let payload = {
                    'sku': {
                    'name': 'BC_Gen5_2',
                    'tier': 'BusinessCritical'
                   }
                };
            var jsonBody = JSON.stringify(payload);   
          //  let payload =  {"properties": {"requestedServiceObjectiveName" : "GP_S_Gen5_8"}};
            let options = {
                host: 'management.azure.com',
                port:443,
                path: this.getAzureUrl(),
                method:'PATCH',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${newTokenValue}`,
                    "Content-Length" : Buffer.byteLength(jsonBody,'utf8')
                }
            };
            
            let req = https.request(options, res => {
                let data = '';
                res.on("data", chunk => {
                    data += chunk;
                });
                res.on("end", () => {
                    callback(data);
                })
                res.on("error", err => {
                    console.log(`ERROR ${res.statusCode}: ${err}`);
                })
            });
          req.write(jsonBody);
           req.end();
        }
}
module.exports = AzureRestClient;