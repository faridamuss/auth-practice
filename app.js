require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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
  email: String,
  password: String
});

// 3. Setting up (enabling) passport-local-mongoose as a plugin to hash & salt, as well as to save our users into a db: 
userSchema.plugin(passportLocalMongoose);

// a Mongoose Model
const User = new mongoose.model("User", userSchema);

// 4. Use passport to create a local strategy:
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/////////////////////////////GET REQUESTS/////////////////////////////
app.get("/", function(req, res) {
  res.render("home");
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
 
});
 
// PORT is listening
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});