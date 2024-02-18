const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");
const { User, Internship, StudentInternship } = require("./models");
const { log } = require("console");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
const cheerio = require("cheerio");

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

let userid;
let useremail;
let userD;

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { Email: email },
    });
    if (user && user.validatePassword(password)) {
      userD = user;
      useremail = user.Email;
      userid = user.id;
      res.redirect("/home");
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

app.get("/home", async (req, res) => {
  if (userD === undefined) {
    res.redirect("/login-page");
  }
  const internships = await Internship.getAllInternships();
  res.render("home", {
    title: "Home",
    year: new Date().getFullYear(),
    user: userD,
    userid: userid,
    internships: internships,
  });
});

app.post("/createInternship", async (req, res) => {
  const { title, description, startDate, endDate, location } = req.body;
  try {
    await Internship.uploadInternship(
      title,
      description,
      startDate,
      endDate,
      location
    );
    if (!req.user) {
      res.render("login", {
        title: "Login",
        year: new Date().getFullYear(),
      });
    } else {
      res.render("home", {
        title: "Home",
        year: new Date().getFullYear(),
        user: req.user,
      });
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/Internship-Page", (req, res) => {
  res.render("createInternship", {
    title: "Create Internship",
    year: new Date().getFullYear(),
  });
});

//add a route to handle deleting an internship
app.get("/internshipDelete/:id", async (req, res) => {
  const internshipId = req.params.id;
  try {
    await Internship.destroy({ where: { id: internshipId } });

    // delete the all in the studentinternship table and return all emails of the students id which are dleted
    const studentInternships = await StudentInternship.findAll({
      where: { InternshipID: internshipId },
    });
    const studentEmails = [];
    for (let i = 0; i < studentInternships.length; i++) {
      const student = await User.findOne({
        where: { id: studentInternships[i].studentID },
      });
      studentEmails.push(student.Email);
    }
    // delete the all in the studentinternship table
    await StudentInternship.destroy({ where: { InternshipID: internshipId } });
    console.log('====================================');
    console.log(studentEmails);
    console.log('====================================');

    res.redirect("/home");
  } catch (e) {
    console.log(e);
  }
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
        user: {
          FirstName: firstName,
          LastName: lastName,
          isAdmin: false,
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

app.post("/confirm-internship/:id", async (req, res) => {
  const internshipId = req.params.id;
  // const { studentId} = req.body;
  console.log("====================================");
  console.log(req.body);
  console.log("====================================");
  console.log(userid, internshipId);
  console.log("====================================");
  try {
    if (
      await StudentInternship.isStudentJoinedInternship(userid, internshipId)
    ) {
      res.send("You have already joined this internship");
    } else {
      await StudentInternship.studentJoinInternship(userid, internshipId);
      res.redirect("/home");
    }
  } catch (e) {
    console.log(e);
  }
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

app.get("/confirmation/:id", async (req, res) => {
  const internshipId = req.params.id;
  const internship = await Internship.findByPk(internshipId);
  res.render("finalconfiramation", {
    title: "Confirmation",
    year: new Date().getFullYear(),
    internship: internship,
    internshipId: internshipId,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
