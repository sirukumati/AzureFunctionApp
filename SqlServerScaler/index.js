
const createHandler = require("azure-function-express").createHandler;
const restClient = require('./AzureRestClient.js')
const express = require("express");
const passport = require('passport');


const subscriptionId = process.env["SUBSCRIPTIONID"];
const resourceGroupName = process.env["RESOURCEGROUP"];
const serverName = process.env["SERVER"];
const databaseName = process.env["DATABASE"];
const apiVersion = process.env["APIVERSION"];
const restclient = new restClient(subscriptionId,resourceGroupName,serverName,databaseName,apiVersion,null);

var BearerStrategy = require("passport-azure-ad").BearerStrategy;

var tenantID = process.env["TENANTID"];
var clientID = process.env["CLIENTID"];
var appIdURI = process.env["appIdURI"];

var tenantName = "tenantName";
var clientSecret = process.env["CLIENTSECRET"] // This is okay only because it's a demo :)
//var clientSecret = "";
var resourceScope = "https://management.azure.com/user_impersonation"; // Scope for the next API (i.e. "<resource-api-appIdURI>/openid")
var resourceHost = "localhost"; // Hostname for next API (i.e. "localhost", "app-name.onmicrosoft.com", etc.) 
//var resourcePort = "7072"; // For localhost testing


var options = {
    identityMetadata: `https://login.microsoftonline.com/${tenantID}/v2.0/.well-known/openid-configuration`,
    clientID: clientID,
    issuer: `https://sts.windows.net/${tenantID}/`,
    audience: appIdURI,
    loggingLevel: "info",
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options, function (token, done) {
    done(null, {}, token);
});


const app = express();
const bodyParser = require('body-parser');
app.use(require('morgan')('combined'));
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(passport.initialize());
passport.use(bearerStrategy);

/* Below are the API methods in this function app */

//passport.authenticate("oauth-bearer", { session: false })
app.get(
    "/api/SqlServerScaler"
    ,passport.authenticate("oauth-bearer", { session: false })
    ,function (req, res) {
        console.log("Validated claims: ", JSON.stringify(req.authInfo));
       
        // the access token the user sent
        const userToken = req.get("authorization");
        const params = {"clientID" : clientID, "clientSecret" : clientSecret,"resourceScope": resourceScope,"tenantName": tenantName };
        // request new token and use it to call resource API on user's behalf
        restclient.getNewAccessToken(userToken,JSON.stringify(params), newTokenRes => {
            let tokenObj = JSON.parse(newTokenRes);
            restclient.callResourceAPI(tokenObj['access_token'], (apiResponse) => {
                res.status(200).json(JSON.parse(apiResponse));
            });
        });

    }
);


module.exports = createHandler(app);

