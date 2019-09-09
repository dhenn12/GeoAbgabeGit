'use strict';
/*
 * Packages in use:
 * _express
 * _mongoose --> https://mongoosejs.com
 * _bootstrap
 * _jquery
 * _leaflet
 * _popper
 * _express-session -->https://www.npmjs.com/package/express-session
 * _body-parser --> https://www.npmjs.com/package/body-parser
 * _request --> https://www.npmjs.com/package/request
 * _ pickerjs --> https://www.npmjs.com/package/pickerjs
 * _leaflet-routing-machine https://www.liedman.net/leaflet-routing-machine/
 * _@turf/line-intersect --> https://www.npmjs.com/package/@turf/line-intersect
 @ _@turf/turf --> https://www.npmjs.com/package/@turf/turf
 */

 // install mongodb; optionally install mongo client
 // see: http://mongodb.github.io/node-mongodb-native/3.1/quick-start/quick-start/
 //
 // change to the directory containing this file
 // $ cd PATH/database-mongodb


 // cd C:\Program Files\MongoDB\Server\4.0\bin\
 // mongo


// http require
//const processenv = require('processenv');

/*
*/
// alot of example scripts : https://github.com/bradtraversy/nodekb
const http = require('http');
const port =  3000;



//do the requirements, which are needed
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require("request");

//initialize mongoose connection
mongoose.connect('mongodb://mongo:27017/mydb', {useNewUrlParser: true}, function(err){
  console.log("no mongo-container, attempting to connect to localhost:27017");

  //try to connect to localhost if there is no mongo container
  mongoose.connect('mongodb://localhost:27017/mydb', {useNewUrlParser: true}, function(err1){
  });
});

let db = mongoose.connection;

// check for connections
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// check for DB errors
db.on('error', function(err){
  console.log(err);
});

// initialize app
const app = express();
var User = require("./modelclasses/users");
var Encounter = require("./modelclasses/encounter");
//const pug = require('pug');
//set vieww
app.set("view engine", "pug");


//






// for parsing application/json
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(express.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

// Use the session middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 6000000 }}));






//make packages available for client using statics:
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/pickerjs', express.static(__dirname + '/node_modules/pickerjs/dist'));
app.use('/leafletrouting', express.static(__dirname + '/node_modules/leaflet-routing-machine/dist'));
app.use('/turf', express.static(__dirname + '/node_modules/@turf/turf'));

//get the scripts
app.use("/routesLeafletjs", express.static(__dirname + '/scripts/routesLeaflet.js'));
app.use("/createroutesLeafletjs", express.static(__dirname + '/scripts/createrouteleaflet.js'));
app.use("/insidemap", express.static(__dirname + '/scripts/insidemap.js'));
app.use("/encleaflet", express.static(__dirname + '/scripts/encleaflet.js'));
app.use("/share", express.static(__dirname + '/scripts/share.js'));


// set the options for session user!
//important for the client side!
app.get('*', function(req, res, next){
  Encounter.find({}, function(err, encounts){
  req.session.encounters = encounts;
  res.locals.shared = req.session.shared || null;
  //get weahter of a point
  /*if(res.locals.shared != null){
    var lat = res.locals.shared.coords[0].geometry.coordinates[1];
    var long = res.locals.shared.coords[0].geometry.coordinates[0];
  //"http://api.openweathermap.org/data/2.5/weather?lat=52&lon=8&APPID=[key]"
  request("http://api.openweathermap.org/data/2.5/weather?lat=" + lat +"&lon=" +long+ "&APPID=[key]", function(error, response, body){

    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body);
    console.log('body1:', JSON.parse(body).weather[0].main); // Print the HTML for the Google homepage
    res.locals.weather = JSON.parse(body).weather[0].main;
  });
}*/
  res.locals.user = req.session.user || null;
  res.locals.userroutes = req.session.routes || [];
  res.locals.weather = null;
  //res.locals.userroutes = req.session.routes || null;

  if(res.locals.user != null){
        User.findOne({ name: res.locals.user }, function (err, user) {
        res.locals.userroutes = user.routes;

      });

  }
  next();
  });
});


//make tests available
app.use("/tests", express.static(__dirname + '/tests/functiontests.html'));
app.use("/functions.js", express.static(__dirname + '/tests/functions.js'));
app.use("/functionTests.js", express.static(__dirname + '/tests/functionTests.js'));


// import routes Routers for use
var usersRouter = require("./routes/users");
var routesRouter = require("./routes/routes");

// Routes controll
app.use('/users', usersRouter);
app.use('/routes', routesRouter);

//mainpage
app.get("/", function(req, res, next) {
  res.render("indexp");
});

// Routes controll
app.get("/routes", function(req, res, next) {
  res.render("leafletcreateroute");
});

//encounters
app.get("/encounters", function(req, res, next){
  res.locals.encounters = req.session.encounters
  res.render("leafletmeetings");
});



app.listen(port, () => console.log("Example app listening on port " + port + "!"));
