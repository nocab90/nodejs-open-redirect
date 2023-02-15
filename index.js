const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

//Establish connection to MySQL database
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
  "/balance",
  "/info",
  "/update",
];

// Inititalize the app and add middleware
app.set("view engine", "pug"); // Setup the pug
app.use(bodyParser.urlencoded({ extended: true })); // Setup the body parser to handle form submits
app.use(session({ secret: "super-secret" })); // Session setup

/** Handle login display and form submit */
app.get("/login", (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect("/");
  }
  res.render("login", { error: false });
});

//Login Authentication with MySQL
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;

        // If the account exists
        if (results.length > 0) {
          req.session.isLoggedIn = true;
          req.session.username = username;
          req.session.showPass = false;

          if (req.query.redirect_url) {
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

          //res.redirect(req.query.redirect_url ? req.query.redirect_url : "/");
        } else {
          res.render("login", { error: "Username or password is incorrect" });
        }
      }
    );
  } else {
    res.render("login", { error: "Username or password is incorrect" });
  }
});

/** Handle logout function */
app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect("/");
});

/** Simulated bank functionality */
app.get("/", (req, res) => {
  res.render("index", { isLoggedIn: req.session.isLoggedIn });
});

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

//For Show Password button
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

app.post("/update", (req, res) => {
  if (req.session.isLoggedIn === true) {
    const username = req.session.username;
    const newEmail = req.body.email;
    connection.query(
      "UPDATE accounts SET email = ? WHERE username = ?",
      [newEmail, username],
      function (error) {
        if (error) throw error;
        console.log("Update executed.");
      }
    );
    res.redirect("/info");
  } else {
    res.redirect("/login?redirect_url=/info");
  }
});

app.get("/balance", (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send("Your account balance is $1234.52");
  } else {
    res.redirect("/login?redirect_url=/balance");
  }
});

app.get("/account", (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send("Your account number is ACL9D42294");
  } else {
    res.redirect("/login?redirect_url=/account");
  }
});

app.get("/contact", (req, res) => {
  res.send("Our address : 321 Main Street, Beverly Hills.");
});

/** App listening on port */
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});
