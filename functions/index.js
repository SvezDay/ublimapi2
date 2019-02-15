"use strict";
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const neo4j = require('neo4j-driver').v1;
const parser = require('parse-neo4j');

var firebase = require('firebase');
var admin = require('firebase-admin');
// const fauth = require('firebase-auth');
// var fireapp = require('firebase/app');
// var fdb = require('firebase/database');
const functions = require('firebase-functions');


const router = express.Router();

// var serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://users.firebaseio.com'
// });

// var refreshToken; // Get refresh token from OAuth2 flow
// admin.initializeApp({
//   credential: admin.credential.refreshToken(refreshToken),
//   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
// });
const graphene = {
    host: "127.0.0.1",
    post: 7474,
    bolt: "bolt://hobby-medlkpiohhjegbkeamhgmkcl.dbs.graphenedb.com:24786",
    username:"ublimapi",
    password:"b.JUXogQfK1CIF.yInMyeG47dyjrebW"
    //neopwd:"UblimDev78"
};
var driver = neo4j.driver(graphene.bolt, neo4j.auth.basic(graphene.username, graphene.password));

const app = express();
//
// const config = {
//   apiKey: "AIzaSyDtkq7ZaVdbf6ELPiIPrz-eI63z1MWOucg",
//   authDomain: "ublimpwa.firebaseapp.com",

//   databaseURL: "https://ublimpwa.firebaseio.com",
//   projectId: "ublimpwa",
//   storageBucket: "ublimpwa.appspot.com",
//   messagingSenderId: "578697682462"
// };

var config = {
    apiKey: "AIzaSyCbTEqrmDfAQNjT9WUPJYWKprJIpNQSxho",
    authDomain: "firetest-2e3d7.firebaseapp.com",
    databaseURL: "https://firetest-2e3d7.firebaseio.com",
    projectId: "firetest-2e3d7",
    storageBucket: "firetest-2e3d7.appspot.com",
    messagingSenderId: "1003024489068"
};

// var fire = firebase.initializeApp(config);
// var adminApp = firebase.initializeApp(config);
let adm = admin.initializeApp(functions.config().firebase);
// admin.initializeApp(config);
// functions.initializeApp(config);

app.get('/timestamp', (req, res)=>{
    res.send(`${Date.now()}`);
})

app.get('/timestamp-cached', (req, res)=>{
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.send(`${Date.now()}`);
})
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

app.get('/getCurrentUser', (req, res)=>{
    console.log("getCurrentUser =========================================")
    console.log('headers', req.headers.authorization);
    let headers = req.headers;
    // res.send("all good");
    // res.status(200).json({mess: "all good"});
    let session = driver.session();
    let tx = session.beginTransaction();
    return tx.run("match (n) return n").then(parser.parse)
    .then( data => {
        console.log("DATA from Graphene =========================================")
        console.log(data)
    })
    .then(() => {
        return admin.auth().verifyIdToken(req.headers.authorization)
        .then(function(decodedToken) {
            console.log("confirm verifyIdToken =========================================")
            console.log("decodedToken", decodedToken);
            var uid = decodedToken.uid;
            // ...
        }).catch(function(error) {
            // Handle error
            console.log("error verifyIdToken =========================================");
            console.log("error", error);
        });
    })
    .then(() => {
        tx.commit();
        session.close();
        res.status(200).json({data:{hello:"hello"}});
    })
    .catch(e => {
        console.log("ERROR on getCurrentUser from Graphene =========================================", e)
        tx.rollback();
        session.close();
        res.status(500).json({error:e});
    })
})

app.get('/graphene', (req, res)=>{
    let session = driver.session();
    let tx = session.beginTransaction();
    return tx.run("match (n) return n")
    .then( data => {
        console.log("DATA from Graphene =========================================")
        console.log(data)
        tx.commit();
        session.close();
        res.send("all good");
    })
    .catch(e => {
        tx.rollback();
        session.close();
        res.send("FAILED !");
    })
})

// test firebase
app.get('/firebase', (req, res)=>{
    // Create new user in FirebaseAuthDatabase
    // admin.auth().createUser({
    firebase.auth().createUserWithEmailAndPassword("bruce@wayne8.com", "wayne66")
    .then(function(data) {
        console.log("data.user.uid");
        console.log("Successfully created new user:", data.user.uid);
        console.log("data.user.refreshToken");
        console.log("Successfully created new user:", data.user.refreshToken);
    })
    .then(()=>{
        res.send("done !")
    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
        res.send("FAILED !");
    });
})

// firebase validate
app.get('/validate', (req, res)=>{
    let idToken = "AGK09APgjiJO0k6KzoqudgN7CgukEQCo_31_3g09tkmASUuVw9Wp8aoZWMz91ejKpdlSPYELPCDirAnAT7ydhDftfmaXvWKuD39R52Ot23-3fwZVK0PXbhQHHPndB2GB1kC72zaZzcLuJRMCciKT7JSE2-4wSZQ8oNrud-ExObX74aTta0llNzdPo915XylgjSaEe_HIDk8P"
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
        var uid = decodedToken.uid;
        console.log("Successfully validate token:", uid);
        res.send("done !")
    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
        res.send("failed !")
    });
})

// registration
app.post('/registration', (req, res)=>{
    // Create new user in FirebaseAuthDatabase
    // admin.auth().createUser({
    fauth().createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        disabled: false
    })
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);
        // Create new user in GrapheneDb using firebaseAuthDatabase uid
        let session = driver.session();
        let tx = session.beginTransaction();
        return tx.run("match (n) return n")
        .then( data => {
            console.log("DATA from Graphene =========================================")
            console.log(data)
            tx.commit();
            session.close();
        })
        .catch(e => {
            tx.rollback();
            session.close();
        })
    })
    .then(()=>{
        res.send("done !")
    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
    });
})

let allowCrossDomain = (req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000", "https://ublimpwa.firebaseapp.com");
    // res.setHeader("Access-Control-Allow-Origin", "**")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, x-access-token");
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    next();
};
const whitelist = ["http://localhost:8000", "https://ublimpwa.firebaseapp.com"];
let corsOptions = {
    origin: (origin, callback)=>{
        console.log("check origin")
        if(origin == undefined){
            callback(null, true) ;
        } else if(whitelist.indexOf(origin) !== -1){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
// return error message for unauthorized requests
let handleError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({message:'Missing or invalid token'});
    }
};

// app.use('/rest', /*router.use(require('./tokenValidation').valid),*/ require('./_routes').routes())
app.get('/rest/box/getPage', (req, res)=>{
    console.log("check rest/box/getPage =====================================");
    console.log(req.headers);
    res.status(200).json({data:'hello'});
})
app.get('/rest/getProfile', (req, res)=>{
    console.log("check rest/getProfile =====================================");
    // console.log(req.headers);
    let auth = JSON.parse(req.headers.authorization);
    console.log("typeof authorization", auth)
    verifyToken(auth).then(data=>{
        console.log("message from verifytoken", data);
        res.status(200).json({data:'world'});
    })
    // res.status(200).json({data:'world'});
})
let verifyToken = (token)=>{
    return new Promise((resolve, reject)=>{
        admin.auth().verifyIdToken(token)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            console.log("Successfully validate token:", uid);
            resolve("done !")
        })
        .catch(function(error) {
            console.log("Error creating new user:", error);
            resolve("failed !")
        });
    })
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowCrossDomain);
app.options('*', cors()) // Allow pre-flight
app.use(handleError);
app.use(cors(corsOptions));
exports.app = functions.https.onRequest(app);
// exports.app = firebase.https.onRequest(app);
