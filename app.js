// MODULES:
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var encrypt = require("mongoose-encryption");

const PORT = 3000;
 
const app = express();
 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

/////////////////////////////CONNECTION TO MONGODB///////////////////////
// connect to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
}

// a Schema for userDB
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// it important to create this plugin before creating a mongoose model!
const secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

// a Mongoose Model
const User = new mongoose.model("User", userSchema);

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

///////////////////////////////POST REQUESTS////////////////////////////
app.post("/register", function(req, res) {
  // reading from inputs:
  const username = req.body.username;
  const password = req.body.password;
  // creating a new data entry to our db when a user registering:
  const newUser = new User({
    email: username,
    password: password
  });
  // saving a new data entry to our db and dealing with err, if any:
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      // we are rendering the 'secrets' page unless the user is registered or logged in
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  // we are filtering through our db searching for the user using a username and a password
  User.findOne({email: username}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
 
// PORT is listening
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});