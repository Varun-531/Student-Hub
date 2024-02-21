const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser");
const { User, Internship, StudentInternship } = require("./models");
const { log } = require("console");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("Some Secret Key"));
app.use(
  session({
    secret: "your_secret_key_here", // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  csrf(
    "123456789iamasecret987654321look", // secret -- must be 32 bits or chars in length
    ["POST"] // the request methods we want CSRF protection for
  )
);
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

const studentinternship = require("./models/studentinternship");
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "studenthub@outlook.in",
    pass: "Student@2",
  },
});

app.get("/", (req, res) => {
  res.render("index", {
    title: "Student Hub",
    slogan: "Your go-to place for educational resources",
    year: new Date().getFullYear(),
  });
});

app.get("/login-page", (req, res) => {
  res.render("login", {
    title: "Student-Hub",
    year: new Date().getFullYear(),
    csrfToken: req.csrfToken(),
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { Email: email },
    });
    if (user && user.validatePassword(password)) {
      req.session.userD = user;
      req.session.useremail = user.Email;
      req.session.userid = user.id;

      res.redirect("/home"); // Remove the object from here
    } else {
      res.send("Invalid credentials");
    }
  } catch (e) {
    console.log(e);
  }
});

//create a temporary route to test the email functionality

// Define the route to send the email
app.get("/sendemail", (req, res) => {
  const mailOptions = {
    from: "studenthub@outlook.in",
    to: ["chvarun2908@gmail.com", "gopivarun1234@gmail.com"],
    subject: "Test Email",
    text: "This is a test email",
  };

  // Use the transporter to send the email
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
      return res.status(500).send("Error sending email");
    }

    console.log("Sent: " + info.response);
    res.send("Email sent successfully!");
  });
});

app.get("/signup-page", (req, res) => {
  res.render("signup", {
    year: new Date().getFullYear(),
    title: "Students Hub",
    year: new Date().getFullYear(),
    csrfToken: req.csrfToken(),
  });
});

app.get("/home", async (req, res) => {
  // Retrieve user information from the session
  const userD = req.session.userD;
  const userid = req.session.userid;

  if (!userD) {
    res.redirect(302, "/login-page");
  }
  const internships = await Internship.getAllInternships();
  res.render("home", {
    title: "Student-Hub",
    year: new Date().getFullYear(),
    user: userD,
    userid: userid,
    internships: internships,
    csrfToken: req.csrfToken(),
  });
});

app.post("/createInternship", async (req, res) => {
  const user = req.session.userD;
  const { title, description, startDate, endDate, location } = req.body;
  try {
    await Internship.uploadInternship(
      title,
      description,
      startDate,
      endDate,
      location
    );
    if (!user) {
      res.render(302, "login-page", {
        title: "Student-Hub",
        year: new Date().getFullYear(),
        csrfToken: req.csrfToken(),
      });
    } else {
      res.render("home", {
        title: "Student-Hub",
        year: new Date().getFullYear(),
        user: user,
        internships: await Internship.getAllInternships(),
        csrfToken: req.csrfToken(),
      });
    }
    // Send email to admin
    const mailOptions = {
      from: "studenthub@outlook.in",
      to: "chvarun2908@gmail.com", // Replace with the admin's email address
      subject: "New Internship Created",
      text: `A new internship titled "${title}" has been created.`,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.get("/applied-internships", async (req, res) => {
  const userD = req.session.userD;
  if (!userD) {
    res.redirect(302, "/login-page");
  }

  // Retrieve internship IDs from the array

  const internshipIds = (
    await StudentInternship.getInternshipByStudentId(userD.id)
  ).map((internship) => internship.InternshipID);

  console.log("====================================");
  console.log(internshipIds);
  console.log("====================================");

  // Retrieve internships by their IDs
  const internships = await Promise.all(
    internshipIds.map((id) => Internship.getInternshipById(id))
  );

  res.render("appliedInternships", {
    title: "Student-Hub",
    year: new Date().getFullYear(),
    internships: internships,
  });
});

app.get("/Internship-Page", (req, res) => {
  res.render("createInternship", {
    title: "Student-Hub",
    year: new Date().getFullYear(),
    csrfToken: req.csrfToken(),
  });
});

//add a route to handle deleting an internship
app.get("/internshipDelete/:id", async (req, res) => {
  const internshipId = req.params.id;
  try {
    await Internship.destroy({ where: { id: internshipId } });

    //store all the ids of students whose internship is being deleted with the help of the getStudentIdByInternshipId function
    const studentInternshipIDs =
      await StudentInternship.getStudentIdByInternshipId(internshipId);
    // delete all records in the studentinternship table
    await StudentInternship.destroy({ where: { InternshipID: internshipId } });
    // const deletedInternship = await Internship.findOne({ where: { id: internshipId } });

    const mailOptions = {
      from: "studenthub@outlook.in",
      to: "chvarun2908@gmail.com", // Replace with the admin's email address
      subject: "Internship Deleted",
      text: `The following internship has been deleted: ${internshipId}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

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
        title: "Student-Hub",
        user: {
          FirstName: firstName,
          LastName: lastName,
          isAdmin: false,
        },
        year: new Date().getFullYear(),
        csrfToken: req.csrfToken(),
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
  const userid = req.session.userid;
  const internshipId = req.params.id;

  try {
    if (
      await StudentInternship.isStudentJoinedInternship(userid, internshipId)
    ) {
      res.send("You have already joined this internship");
    } else {
      await StudentInternship.studentJoinInternship(userid, internshipId);

      // Get the user by id
      const user = await User.getUserById(userid);
      const userEmail = user.dataValues.Email; // Extract the email address

      // Send email to the student
      const mailOptions = {
        from: "studenthub@outlook.in",
        to: userEmail, // Pass the email address
        subject: "Internship Confirmation",
        text: "Congratulations! You have successfully applied for the internship.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.redirect("/home");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error confirming internship");
  }
});

app.get("/internships/:studentId", async (req, res) => {
  const internships = await Internship.getInternshipByStudentId(
    req.params.studentId
  );
  res.json(internships);
});

app.post("/logout", (req, res) => {
  // Destroy the session when logging out
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Student Hub",
        slogan: "Your go-to place for educational resources",
        csrfToken: req.csrfToken(),
        year: new Date().getFullYear(),
      });
    }
  });
});

app.get("/confirmation/:id", async (req, res) => {
  const internshipId = req.params.id;
  const internship = await Internship.findByPk(internshipId);
  res.render("finalconfiramation", {
    title: "Student-Hub",
    year: new Date().getFullYear(),
    internship: internship,
    internshipId: internshipId,
    csrfToken: req.csrfToken(),
  });
});

module.exports = app;