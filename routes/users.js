var express = require("express");
var router = express.Router();





//import user class
var User = require("../modelclasses/users");


/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource for users (e.g. overview list of users)");
});


/**
* @function registerUser
* @desc username required for registrating
*       new user will be created and commited, if the given username is not in user
* @redirect to main page
*/
var registerUser = function(req, res) {
  //find possible userswho already have the username
    User.findOne({ name: req.body.user_name }, 'name',  function (err, user) {
      console.log('findone()  ' +  user);
      if(user == null){
        // create new user
        let newuser = new User();
        newuser.name = req.body.user_name;
        newuser.routes = [];
        newuser.save(function(err){
          if(err){
            console.log('Failure registerUser:' + err);
          } else{
            res.redirect("/");
          }
        });
      } else {
        res.render("registerERR", { error_message: "Username is already in use" });
      }
    });

};


/**
* @function loginUser
* @desc user will getting logged in if the given username exists
* @redirect to main page
*/
var loginUser = function(req, res, next) {
  User.findOne({ name: req.body.user_name },  function (err, user) {
    console.log('findone()  ' +  user);
    if(user == null){
      res.render("loginErr", { error_message: " non existing username" });
    } else{
      req.session.user = user.name;
      if(user.routes != null){

        req.session.routes = user.routes;
      } else {
        req.session.routes = [];
      }
      req.session.routeslength = req.session.routes.length;
      console.log("req.session.user in loginUser: " + req.session.routeslength);
      res.redirect("/");
      //next();
    }
  });
};

/**
* @function logoutUser
* @desc logging out the user b setting session options back to null
* @redirect to main page
*/
var logoutUser = function(req, res, next){
  req.session.user = null;
  req.session.routes = null;
  req.session.routeslength = null;
  res.redirect("/");
};


// express routing controll
router.post("/loginuser", loginUser);
router.get("/logoutuser", logoutUser);
router.post("/registerUser", registerUser);
//router.get('/login', userLogin);
router.get('/register', function(req, res){
  res.render('register');
});
router.get('/login', function(req, res){
  res.render('login');
});


module.exports = router;
