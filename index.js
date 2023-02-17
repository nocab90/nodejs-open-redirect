const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

//Establish connection to MySQL database
//Using credentials {nodelogin, nodelogin} for database 'nodelogin'
const connection = mysql.createConnection({
  host: "localhost",
  user: "nodelogin",
  password: "nodelogin",
  database: "nodelogin",
});

const allowedListForRedirection = [
  "/login",
  "/logout",
  "/account",
  "/info",
  "/update",
];

// Inititalize the app and add middleware
app.set("view engine", "pug"); // Setup the pug
app.use(bodyParser.urlencoded({ extended: true })); // Setup the body parser to handle form submits
app.use(session({ secret: "super-secret" })); // Session setup

//For login page
app.get("/login", (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect("/");
  }
  res.render("login", { error: false });
});

//Login Authentication with MySQL
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  //Check if user did NOT enter blank fields for username and password
  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;

        // If query returns result
        if (results.length > 0) {
          req.session.isLoggedIn = true;
          req.session.username = username;
          req.session.showPass = false;

          //Check if redirection is active
          if (req.query.redirect_url) {
            //Only redirect if redirect_url is in included list, else go back to home
            if (
              allowedListForRedirection.indexOf(req.query.redirect_url) > -1
            ) {
              res.redirect(req.query.redirect_url);
            } else {
              res.redirect("/");
            }
          } else {
            res.redirect("/");
          }
        } else {
          res.render("login", { error: "Username or password is incorrect" });
        }
      }
    );
  } else {
    res.render("login", { error: "Username or password is incorrect" });
  }
});

//For logout
app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect("/");
});

//For home page
app.get("/", (req, res) => {
  res.render("index", { isLoggedIn: req.session.isLoggedIn });
});

//Load info page, query user info
app.get("/info", (req, res) => {
  if (req.session.isLoggedIn === true) {
    const username = req.session.username;
    connection.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username],
      function (error, results) {
        if (error) throw error;

        //Save user info to session
        //If showPass, show password, else mask password
        if (req.session.showPass) {
          req.session.password = results[0].password;
          showPassword = "showPass";
        } else {
          let maskedPass = "*";
          req.session.password = maskedPass.repeat(6);
          showPassword = null;
        }
        req.session.email = results[0].email;
        res.render("info", { session: req.session, showPass: showPassword });
      }
    );
  } else {
    res.redirect("/login?redirect_url=/info");
  }
});

//Toggle for showing/masking password
app.post("/info", (req, res) => {
  if (req.session.isLoggedIn === true) {
    if (!req.session.showPass) {
      req.session.showPass = true;
    } else {
      req.session.showPass = false;
    }
    res.redirect("/info");
  } else {
    res.redirect("/login?redirect_url=/info");
  }
});

//Render update form to change email
app.get("/update", (req, res) => {
  if (req.session.isLoggedIn === true) {
    const username = req.session.username;
    connection.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username],
      function (error, results) {
        if (error) throw error;
        req.session.password = results[0].password;
        req.session.email = results[0].email;
        res.render("update", { session: req.session });
      }
    );
  } else {
    res.redirect("/login?redirect_url=/info");
  }
});

//Post Request to MySQL db to change user's email
app.post("/update", (req, res) => {
  if (req.session.isLoggedIn === true) {
    const username = req.session.username;
    const newEmail = req.body.email;
    connection.query(
      "UPDATE accounts SET email = ? WHERE username = ?",
      [newEmail, username],
      function (error) {
        if (error) throw error;
      }
    );
    res.redirect("/info");
  } else {
    res.redirect("/login?redirect_url=/info");
  }
});

//For viewing Account number/balance
app.get("/account", (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.render("account");
  } else {
    res.redirect("/login?redirect_url=/account");
  }
});

//Contact page
app.get("/contact", (req, res) => {
  res.render("contact");
});

//App listening on port 3000
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});
