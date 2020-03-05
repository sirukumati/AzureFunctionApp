# AzureFunctionApp
Description:
This is a project demonstrating Azure Function App calling Azure resource management REST API on behalf of the logged in user to update Azure Sql Server resource. For example, scaling the Azure Sql Server from 2 VCores to 4 VCores in business critical tier.
Below are the steps required to run the sample project:

Register an application under Azure App Registrations, under API permissions select Azure management Service API with delegated permissions. After the addition you should see "https://management.azure.com/user_impersonation" under API permissions list in the app.

Under Certificates and Secrets, generated a client Secret and copy the value.

Copy the clientID, tenantID and application ID URI from the app registration account.

Authentication:
OAuth 2.0 OPENID Connect is used for authenticating and fetching the access token to call the Function App.
Open browser in incognito mode and run below url:
https://login.microsoftonline.com/<tenantName>.onmicrosoft.com/oauth2/v2.0/authorize?response_type=code&client_id=<clientID from App Registration>&redirect_uri=<redirect uri from app registration>&scope=openid
User will be asked to authenticate by providing credentials in interactive mode and once authenticated the server will send the auth code to the redirect uri
  
Run the below curl command with code returned from the above step:
curl -X POST \
  https://login.microsoftonline.com/citrix.onmicrosoft.com/oauth2/v2.0/token \
  -H 'Accept: */*' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Host: login.microsoftonline.com' \
  -H 'accept-encoding: gzip, deflate' \
  -H 'cache-control: no-cache' \
  -d 'redirect_uri=http%3A%2F%2Flocalhost:7071/&client_id=<clientID from App Registration>&grant_type=authorization_code&code=O&client_secret=<client secret from app regisration>&scope=<application 
 ID URI>/user_impersonation'
  
  After the auth code and client secret are authenticated and user is also authorized for mentioned scope, the command will return a response containing access token.
  
  Copy the bearer Token from above step and provide it as header value to function app url : http://localhost:7071/api/SqlServerScaler, the REST Call will update the configuration for the provided database to 2 VCores in business critical tier.
 
  
  
