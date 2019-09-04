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
  newRoute.user = req.session.user;
  newRoute.date = req.body.date;
  newRoute.starttime = req.body.starttime;
  newRoute.endtime = req.body.endtime;
  newRoute.waypoints = req.body.waypoints;
  newRoute.shared = null;

  //adding the route for the current session
  req.session.routes.push(newRoute);
  console.log("route was submit or not  " + req.session.user);

  //save the route in the db for later uses for example after login or reload
  User.findOne({ name: req.session.user }, function (err, user) {
    user.routes.push(newRoute);
    console.log(user.routes.length);
    user.save(function(err){});
    req.session.routes = user.routes;
  });
  res.redirect("/routes/administrateroute");
};


var shareRoute = function(req, res, next){
  console.log("IMPIMPIMPIMPIMP21321 " + req.params.number);
  User.findOne({ name: req.session.user }, function (err, user) {
    let newRoute = new Route();
    newRoute.user = user.name;
    console.log("IMPIMPIMPIMPIMP " + user.routes[req.params.number].date);
    newRoute.date = user.routes[req.params.number].date;
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
  LeafletScript.createRoute("mapdiv", req.session.routes[req.params.number]);
};

router.get("/showroute/:number", showRoute)
router.get("/deleteroute/:number", deleteRoute);
router.get("/shareroute/:number", shareRoute);
router.post("/addroute", addRoute);

router.get('/administrateroute', administrateroute);


module.exports = router;
