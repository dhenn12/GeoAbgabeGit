var express = require("express");
var router = express.Router();





//import user class
var User = require("../modelclasses/users");


/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource for users (e.g. overview list of users)");
});


/*
* for registration of users if user already exists
* sends it an error message to the registration page
*/
var registerUser = function(req, res) {
    User.findOne({ name: req.body.user_name }, 'name',  function (err, user) {
      console.log('findone()  ' +  user);
      if(user == null){
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


// login for users finding the username
// change db.currentUser to this user
var loginUser = function(req, res, next) {
  User.findOne({ name: req.body.user_name },  function (err, user) {
    console.log('findone()  ' +  user);
    if(user == null){
      res.render("loginERR", { error_message: " non existing username" });
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

var logoutUser = function(req, res, next){
  req.session.user = null;
  req.session.routes = null;
  req.session.routeslength = null;
  res.redirect("/");
};


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
