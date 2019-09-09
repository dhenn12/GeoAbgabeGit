var express = require("express");
var router = express.Router();





//import user class
var Route = require("../modelclasses/routes");
var User = require("../modelclasses/users");
var Encounter = require("../modelclasses/encounter");
// requirements for turf
const Intersect = require('@turf/line-intersect');
const turf = require('@turf/turf');
//var Segment = require('../node_modules/@turf/line-segment');

//geoJSON template to be used when there is a geoJSON to create
const geoJSONtemplate = '{ "type": "FeatureCollection", "features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": []}}]}';

// calls leafletcreateroute
router.get("/createroute", function(req, res, next) {
  res.render("leafletcreateroute");
});

// calls leafletadministroute
var administrateroute = function(req, res, next){
  //console.log("REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" + res.locals.userroutes.length);
  res.render("leafletadministrateroute");
};

/**
* @function addRoute
* @desc adding route to the database and the current session user
+       furthermore it will check in the dbs for possible encounters resulting from adding the route to the database
* @redirect to administrate Routes
*/
var addRoute = function(req, res, next){
  //create new RouteObj
  let newRoute = new Route();
  var inputRoute = false;
  if(req.session.user == null){
    res.render("leafletcreaterouteERR", { error_message: "Please login before adding routes" });
  }
  //check user input
  try{
    inputRoute = parseArrayString(req.body.waypoints);
  } catch(err) {
    //the error that is thrown by the function that is looking at the input. can be useful for logs
    console.log(err);
  }


  if(inputRoute != false){
    newRoute.user = req.session.user;

    newRoute.starttime = req.body.starttime;
    newRoute.endtime = req.body.endtime;
    //stringify the route becuase mongoose doesn't support 2d-arrays
    newRoute.waypoints = JSON.stringify(inputRoute);
    newRoute.shared = null;
    console.log(req.session.routes);
    //adding the route for the current session
    req.session.routes.push(newRoute);
    newRoute.save(function(err){});
    //save the route in the db for later uses for example after login or reload

    // find the right user to add the route and updating the
    User.findOne({ name: req.session.user }, function (err, user) {
      user.routes.push(newRoute);
      console.log(user.routes.length);
      user.save(function(err){});
      req.session.routes = user.routes;
    });

    //search routes and look if there is an encounter?
    User.find({},'routes', function (err, users) {
      //extract routes from users
      var routes = []
      for(let i = 0; i < users.length;i++){
        let user = users[i];
        for(let j = 0; j<user.routes.length;j++){
          routes.push(user.routes[j])
        } //freezes after this point..
      }

      //prepare newRoute data to be used with findEncounter
      let newrouteGeoJSON = JSON.parse(geoJSONtemplate);
      newrouteGeoJSON.features[0].geometry.coordinates = JSON.parse(newRoute.waypoints[0]);

      for(var z = 0; z < routes.length; z++){

        //var encPoints = intersections(newRoute.waypoints,  routes[z].waypoints);

        //prepare routeZ data to be used with findEncounter
        let routeZGeoJSON = JSON.parse(geoJSONtemplate);
        routeZGeoJSON.features[0].geometry.coordinates = JSON.parse(routes[z].waypoints[0]);
        console.log(JSON.parse(routes[z].waypoints[0]))


        var encounter = findEncounter(newrouteGeoJSON, routeZGeoJSON, 500);
        var encPoints = encounter.intersects.features;

        //adding new Encounter
        if(encPoints.length > 0){
          for(var c= 0; c < encPoints.length; c++){
            let newEncounter = new Encounter();
            newEncounter.user1 = newRoute.user;
            newEncounter.user2 = routes[z].user;
            newEncounter.coords = encPoints[c];
            newEncounter.route1ID = newRoute._id;
            newEncounter.route1ID = routes[z]._id;
            newEncounter.save(function(err){});
          }
        }
      }
    });

    res.redirect("/routes/administrateroute");
  } else {
    res.render("leafletcreaterouteERR", { error_message: "invalid input" });
  }

};

/*
var shareRoute = function(req, res, next){
  console.log("IMPIMPIMPIMPIMP21321 " + req.params.number);
  User.findOne({ name: req.session.user }, function (err, user) {
    let newRoute = new Route();
    newRoute.user = user.name;
    console.log("IMPIMPIMPIMPIMP " + user.routes[req.params.number].starttime);
    newRoute.starttime = user.routes[req.params.number].starttime;
    newRoute.endtime = user.routes[req.params.number].endtime;
    newRoute.waypoints = user.routes[req.params.number].waypoints;
    newRoute.shared = user.routes[req.params.number]._id;
    user.routes[req.params.number].shared = "/routes" +user.routes[req.params.number]._id;
    user.save();
    newRoute.save(function(err){});
    console.log("sdaaaaaaaaaaaaa" + user.routes.length);
    req.session.routes = user.routes;
  });
  res.redirect("/routes/administrateroute");
};
*/

/**
* @function deleteRoute
* @desc deletes the chosen Route, deletes the user from db routes and userroutes
*       furthermore deletes route from user and associated encounters of the route  will be deleted
* @redirect to administrate Routes
*/
var deleteRoute = function(req, res, next) {

  //delete the route in the db
  User.findOne({ name: req.session.user }, function (err, user) {
    var routeId = user.routes[req.params.number]._id;
    console.log("123456789123456789123456789123456789123456789 ::        " + routeId );

    Route.deleteOne({ _id: routeId }, function (err) {
      if (err) return handleError(err);
      //
    });
    //all encounters associated to this route getting deleted
    Encounter.deleteMany({ route1ID: routeId}, function (err) {
    if (err) return handleError(err);
    // deleted at most one tank document
    });

    Encounter.deleteMany({ route2ID: routeId}, function (err) {
    if (err) return handleError(err);
    // deleted at most one tank document
    });
    //
    user.routes.splice(req.params.number, 1);
    user.save(function(err){});

    req.session.routes = user.routes;


  });
  //delete current session route
  req.session.routes.splice(req.params.number, 1);
  res.redirect("/routes/administrateroute");
};



/**
* @function parseArrayString
* @desc parses a string and checks whether it contains a 2-dimensional array of coordinates.
* To be used to examine user input. throws an error if it doesn't contain an array of coordinates like specified.
* If the string contains several coordinate array it only returns the first one.
* @param inputString the string that represents a 2-dimensional array to be parsed. formatting: [[lon,lat], ... ,[lon,lat]]
* @returns array of coordinates if this is what the string represents. exception if otherwise
*/
/**
* @function checkIllegalChars
* @desc helping function, takes string and compares it against list of chars
* @returns true if an illegal character is found in the string
*/
function parseArrayString(inputString){

  function checkIllegalChars(string){
    cantInclude.forEach(function(e){
      if(string.includes()){
        return true;
      }
    });
  }
  //first, match only the text between the square brackets
  inputString = inputString.match(/\[\[.*?\]\]/);

  //the array of strings to look for that can't be included in the input, to prevent any possible injection.
  var cantInclude = [",","\"","\'",")","(","$","\\","/","!"];
  //foreign code,
  if(inputString == "" || inputString == null){

    throw new Error("input string contains no 2d array");

  }
  //check for illegal characters.
  else if (checkIllegalChars(inputString)){
    throw new Error("input string contains illegal characters");
  }
  //everything is okay. use JSON.parse
  else {
    var outputArray = JSON.parse(inputString);
    //now check if every sub-array is 2 elements and numbers
    if(function(){
      return outputArray.forEach(
        //for every sub-array...
        function(subArray){
          //check length of each string
          if(subArray.length != 2) return false;
          //check if they all contain numbers
          if(subArray.some(isNAN)) return false;
        }
      );
      //return true if none of the cases above are the case.
      return true;}) {
      //return the array. it is clean
    return(outputArray);
    } else {throw new Error("input String does not contain 2d-array containing numbers");}
  }
}

/**
* @function findEncounter
* @desc function to find the encounter between two routes
* routes should both contain metadata regarding the user/animal as well as start- and end-time for each route
* @param route1 GeoJSON FEATURE, representing route1.
* @param route2 GeoJSON FEATURE, representing route2.
* @param tolerance maximum distance in meters that can still count as an encounter
* @returns an objec that contains the two points closest to each other as well as their distance
*/
function findEncounter(route1, route2, tolerance){
  route1 = route1.features[0];
  route2 = route2.features[0];
  var closestEncounter = {};

  //initialise the object
  closestEncounter.intersects = null;
  closestEncounter.dist = null;
  closestEncounter.point1 = null;
  closestEncounter.point2 = null;
  closestEncounter.dist = Number.MAX_SAFE_INTEGER;
  //var dist;

  //find intersections
  closestEncounter.intersects = turf.lineIntersect(route1,route2);

  //check distance of every point of line1 to line2
  for(let i = 0; i < route1.geometry.coordinates.length; i++){
    let route1Point = turf.point(route1.geometry.coordinates[i]);
    let distance = turf.pointToLineDistance(route1Point, route2, {units: 'meters'});

    if(distance < closestEncounter.dist){
      closestEncounter.point1 = route1Point;
      closestEncounter.point2 = turf.nearestPointOnLine(route2, route1Point, {units: 'meters'});
      closestEncounter.dist = distance;
      console.log(distance)
    }
  }
  //to be sure we got the closest one, do the same for every point in line 2
  for(let i = 0; i < route2.geometry.coordinates.length; i++){
    let route2Point = turf.point(route2.geometry.coordinates[i]);
    let distance = turf.pointToLineDistance(route2Point, route1, {units: 'meters'});

    if(distance < closestEncounter.dist){
      closestEncounter.point1 = route2Point;
      closestEncounter.point2 = turf.nearestPointOnLine(route1, route2Point, {units: 'meters'});
      closestEncounter.dist = distance;
      console.log(distance);
    }
  }

  //if there are no points close enought to each other, there is no closest encounter
  if(closestEncounter.dist > tolerance){
    closestEncounter.dist = null;
  }
  //if there is an intersection, the distance is obviously 0 (elevation not counting)
  if(closestEncounter.intersects.features.length > 0){
    closestEncounter.dist = 0;
  }
  //if there is no closestEncounter, no points are there either
  if(closestEncounter.dist == null){
    closestEncounter.point1 = null;
    closestEncounter.point2 = null;
  }

  return closestEncounter;
}

//express route control
router.get("/showroute/:number", showRoute);
router.get("/deleteroute/:number", deleteRoute);
router.get("/shareroute/:number", shareRoute);
router.post("/addroute", addRoute);

router.get('/administrateroute', administrateroute);


module.exports = router;
