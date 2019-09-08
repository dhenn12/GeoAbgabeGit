var express = require("express");
var router = express.Router();





//import user class
var Route = require("../modelclasses/routes");
var User = require("../modelclasses/users");
var Encounter = require("../modelclasses/encounter");
const Intersect = require('@turf/line-intersect');
//var Segment = require('../node_modules/@turf/line-segment');

/* GET users listing. */
router.get("/createroute", function(req, res, next) {
  res.render("leafletcreateroute");
});

var administrateroute = function(req, res, next){
  //console.log("REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" + res.locals.userroutes.length);
  res.render("leafletadministrateroute");
};

//https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
function onSegment(p, q, r){
  if (q[0]<= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
      q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1])){
        console.log("trueeeeeeee");
      return true;}

    return true;
}

//https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
function orientation(p, q, r){
   var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

    if (val == 0) return 0; // colinear

    return (val > 0)? 1: 2; // clock or counterclock wis
}

//find intersections between 2 routes
function intersections(array1, array2){
  var intersectionPoints = [];
  console.log("in intersections array1: " + array1  + "   array2: " + array2);
  for(var i = 0; i < (array1.length - 1); i++){

    console.log("in intersections for1");
    for(var j = 0; j < (array2.length - 1); j++){
    /*let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
    if(poi != 0){
      intersectionPoints.push(poi);
    }*/
    console.log("in intersections for2");
    var o1 = orientation(array1[i], array1[i + 1], array2[j]);
    var o2 = orientation(array1[i], array1[j], array2[j + 1]);
    var o3 = orientation(array1[i + 1], array2[j + 1], array1[i]);
    var o4 = orientation(array1[i + 1], array2[j +1], array2[j]);

    // General case
    if (o1 != o2 && o3 != o4){
      console.log("SUCESSS");
      let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
      if(poi != 0){
        intersectionPoints.push(poi);
                //console.log("in intersections for2");
        }
      } else if (o1 == 0 && onSegment(array1[i], array2[j], array1[i + 1])){
        console.log("SUCESSS");
      let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
      if(poi != 0){
        intersectionPoints.push(poi);
        }
      }else if (o2 == 0 && onSegment(array1[i], array2[j + 1], array1[i + 1])){
        console.log("SUCESSS");
      let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
      if(poi != 0){
        intersectionPoints.push(poi);
        }
      }else if (o3 == 0 && onSegment(array2[j], array1[i], array2[j + 1])){
        console.log("SUCESSS");
      let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
      if(poi != 0){
        intersectionPoints.push(poi);
        }
      }else if (o4 == 0 && onSegment(array2[j], array1[i + 1], array2[j + 1])){
        console.log("SUCESSS");
      let poi = findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]);
      if(poi != 0){
        intersectionPoints.push(poi);
        }
      }

    }
  }
  return intersectionPoints;
}


//find intersection between two Lines
// https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
function findIntersection(pointAx, pointAy, pointBx, pointBy){
    var a1 = pointAy[1] - pointAx[1];
    var b1 = pointAx[0] - pointAy[0];
    var c1 = a1*pointAx[0] + b1 * pointAx[1];

    var a2 = pointBy[1] - pointBx[1];
    var b2 = pointBx[0] - pointBy[0];
    var c2 = a2*pointBx[0] + b2 * pointBx[1];
    var z = 0;
    var det = a1*b2 - a2*b1;

    if(det != 0) {
      var x = (b2*c1 - b1*c2)/det;
      var y = (a1*c2 - a2*c1)/det;

      z = [x, y];
    }
    console.log("tzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz" + z);
    //console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz" + z);
    return z;
}


var addRoute = function(req, res, next){
  //create new RouteObj
  let newRoute = new Route();
  var inputRoute = false;

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

    //save the route in the db for later uses for example after login or reload
    User.findOne({ name: req.session.user }, function (err, user) {
      user.routes.push(newRoute);
      console.log(user.routes.length);
      user.save(function(err){});
      req.session.routes = user.routes;
    });
    
    //search routes and look if there is an encounter?
    Route.find({}, function (err, routes) {

      for(var z = 0; z < routes.length; z++){
        console.log("newRouteWaypoints" + routes[z].waypoints + " routesz waypoints :    " +   routes[z].waypoints.length);
        var encPoints = intersections(newRoute.waypoints,  routes[z].waypoints);
        console.log("Intersection Points :::  " + encPoints);
        if(encPoints.length > 0){
          for(var c= 0; c < encPoints.length; c++){
            let newEncounter = new Encounter();
            newEncounter.user1 = newRoute.user;
            newEncounter.user2 = routes[z].user;
            newEncounter.coords = encPoints[c];
            newEncounter.save(function(err){});
          }
        }
      }
    });

    res.redirect("/routes/administrateroute");
  } else {
    console.log("route not valid");
    //This client alert can use some polishing
    return res.status(401).end('route is not valid. please enter your route in the format: [[lon1,lat1],[lon2,lat2],...,[lonn, latn]]');
  }

};

/*
function intersec(array1, array2){
  var intersectionPoints = [];
  console.log("in intersections array1: " + array1  + "   array2: " + array2);
  for(var i = 0; i < (array1.length - 1); i++){
    console.log("in intersections for1");
    for(var j = 0; j < (array2.length - 1); j++){
      //var line1 = Intersect.lineString(array1[i]);
      //var line2 = Intersect.lineString(array2[j]);
      //var intersects = Intersect.lineIntersect(array1[i], array2[j]);
      var intersects = Intersect(array1[i], array2[j]);
      console.log("mkdmofdsmkofdmsofsm + " + intersects);
      if(intersects != 0){
        intersectionPoints.push(intersects);
        }
    }
  }
}*/
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

var deleteRoute = function(req, res, next) {
  //delete current session routes
  req.session.routes.splice(req.params.number, 1);


  //delete the route in the db
  User.findOne({ name: req.session.user }, function (err, user) {
    var routeId = user.routes[req.params.number]._id;
    Route.deleteOne({ _id: routeId }, function (err) {
      if (err) return handleError(err);
      //
    });
    console.log("DELETEDELDETEDELETLETLETÖLE" +  user.name + req.params.number);
    user.routes.splice(req.params.number, 1);
    user.save(function(err){});

    console.log("sdaaaaaaaaaaaaa" + user.routes.length);
    req.session.routes = user.routes;
  });
  res.redirect("/routes/administrateroute");
};


var showRoute = function(req, res, next){
  //LeafletScript.createRoute("mapdiv", req.session.routes[req.params.number]);
};

/**
* @function parseArrayString
* @desc parses a string and checks whether it contains a 2-dimensional array of coordinates.
* To be used to examine user input. throws an error if it doesn't contain an array of coordinates like specified.
* If the string contains several coordinate array it only returns the first one.
* @param inputString the string that represents a 2-dimensional array to be parsed. formatting: [[lon,lat], ... ,[lon,lat]]
* @returns array of coordinates if this is what the string represents. exception if otherwise
* @author fnieb02@gmail.com
*/
function parseArrayString(inputString){
  function CustomError( message ) {
    this.message = message;
  }
  //first, match only the text between the square brackets
  inputString = inputString.match(/\[\[.*?\]\]/);

  //the array of strings to look for that can't be included in the input, to prevent any possible injection.
  var cantInclude = [",","\"","\'",")","(","$","\\","/","!"];
  //foreign code,
  if(inputString == "" || inputString == null){
    throw new Error("input string contains no 2d array");
  }
  //check for illegal characters. function call based on https://stackoverflow.com/a/43615512 by user "dinigo"
  else if (cantInclude.some(function(el){inputString.includes(el);})){
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

router.get("/showroute/:number", showRoute);
router.get("/deleteroute/:number", deleteRoute);
router.get("/shareroute/:number", shareRoute);
router.post("/addroute", addRoute);

router.get('/administrateroute', administrateroute);


module.exports = router;
