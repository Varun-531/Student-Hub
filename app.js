const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");
const { User, Internship, StudentInternship } = require("./models");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index", {
    title: "Student Hub",
    slogan: "Your go-to place for educational resources",
    year: new Date().getFullYear(),
  });
});

app.get("/login-page", (req, res) => {
  res.render("login", {
    title: "Login",
    year: new Date().getFullYear(),
  });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { Email: email, Password: password } });
        if (user) {
            res.render("home", {
                title: "Home",
                year: new Date().getFullYear(),
                user: user
            });
        } else {
            res.send("Invalid credentials");
        }
    } catch (e) {
        console.log(e);
    }
});

app.get("/signup-page", (req, res) => {
  res.render("signup", {
    title: "Signup",
    year: new Date().getFullYear(),
  });
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  // check before creating a user already exists
  try {
    const existuser = await User.findOne({ where: { Email: email } });
    if (existuser) {
      res.send("User already exists");
    } else {
      await User.createUser(firstName, lastName, email, password);
      res.render("login", {
        title: "Login",
        user : {
          FirstName: firstName,
          LastName: lastName,
          isAdmin: false
        },
        year: new Date().getFullYear(),
      });
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/internships", async (req, res) => {
  const internships = await Internship.getAllInternships();
  res.json(internships);
});

app.get("/internships/:studentId", async (req, res) => {
  const internships = await Internship.getInternshipByStudentId(
    req.params.studentId
  );
  res.json(internships);
});

app.post("/logout", (req, res) => {
    res.render("index", {
        title: "Student Hub",
        slogan: "Your go-to place for educational resources",
        year: new Date().getFullYear(),
    });
    });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
