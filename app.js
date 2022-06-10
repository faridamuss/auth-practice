require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-find-or-create");

const PORT = 3000;
 
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// 1. setting up session with initial configurations:
app.use(session({
  secret: "Our litte secret.",
  resave: false,
  saveUninitialized: false,
}))

// 2. Use passport to initialize passport package: 
app.use(passport.initialize());
// 3. Use passport to set up our session:
app.use(passport.session())

// connecting to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
}

// a Schema for userDB
const userSchema = new mongoose.Schema ({
  username: String,
  password: String
});

// 3. Setting up (enabling) passport-local-mongoose as a plugin to hash & salt, as well as to save our users into a db: 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// a Mongoose Model
const User = new mongoose.model("User", userSchema);

// 4. Use passport to create a local strategy:
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// This is a set up for OAuth after your require the package, place it right before the routes: 
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets", 
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile)
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

/////////////////////////////GET REQUESTS/////////////////////////////
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ['profile'] }));

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect("/secrets");
  });

app.get("/login", function(req, res) {
  res.render("login");
});
 
app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

// This is taken from passport.js documentation
// https://www.passportjs.org/tutorials/password/logout/
app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
///////////////////////////////POST REQUESTS////////////////////////////
app.post("/register", function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      })
    }
  })
});

app.post("/login", function(req, res) {
  const user = new User ({
    username: req.body.username, 
    password: req.body.password
  })
  // this method comes from passport:
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  })
 
});
 
// PORT is listening
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});