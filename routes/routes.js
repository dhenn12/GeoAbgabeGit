var express = require("express");
var router = express.Router();





//import user class
var Route = require("../modelclasses/routes");
var User = require("../modelclasses/users");

/* GET users listing. */
router.get("/createroute", function(req, res, next) {
  res.render("leafletcreateroute");
});

var administrateroute = function(req, res, next){
  //console.log("REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" + res.locals.userroutes.length);
  res.render("leafletadministrateroute");
};




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
    res.redirect("/routes/administrateroute");
  } else {
    console.log("route not valid");
    //This client alert can use some polishing
    return res.status(401).end('route is not valid. please enter your route in the format: [[lon1,lat1],[lon2,lat2],...,[lonn, latn]]');
  }
};


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
