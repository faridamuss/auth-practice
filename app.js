const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const port = 3000;
 
const app = express();
 
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// connect to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
}

const userSchema = {
  email: String,
  password: String
};

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});
 
app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  // reading from inputs:
  const userName = req.body.username;
  const password = req.body.password;
  // creating a new data entry to our db:
  const newUser = new User({
    email: userName,
    password: password
  });
  // saving a new data entry to our db and dealing with err, if any:
  newUser.save(function(err) {
    if (!err) {
      console.log("Successfully registered");
    } else {
      res.render("secrets");
    }
  });
});
 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});