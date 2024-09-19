Steps for running this application
----------------------------------------------------------------------------------------
1. open project folder in vs code

you need to create two files 
**2 /.env **

PORT=8000
MONGODB_URI = "your mongdodb url "
STORAGE_BUCKET_ID = "see at 2nd point"
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET= "some random secret key" 
ACCESS_TOKEN_EXPIRY="1d"
REFRESH_TOKEN_SECRET= some random secret key
REFRESH_TOKEN_EXPIRY= 5d
-----------------------------------------------------------------------------------------

**3./serviceAccount.json**
create a serviceAccount.json( from firebase you need to create a new generate key) file
firebase url :  https://console.firebase.google.com/u/0/ 

Reference:you can follow these steps for getting the serviceAccount.json file and STORAGE_BUCKET_ID
https://medium.com/@ujumaduowen/how-to-upload-an-image-in-firebase-using-node-js-and-get-the-download-url-9536681c3d92   

**-----------------------------------------------------------------------------------------------

4. open command line
5. -> npm install
6. -> npm start

7. for testing using this collections
8. https://web.postman.co/workspace/d36d4528-66b8-4b8e-b6df-72912a0d8555/folder/28594724-c580873b-d70e-4d20-962a-28f8e65c92a7
