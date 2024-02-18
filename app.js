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
const nodemailer = require("nodemailer");
const studentinternship = require("./models/studentinternship");
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "student-hub@hotmail.com",
    pass: "Studenthub@2",
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

//create a temporary route to test the email functionality

// Define the route to send the email
app.get("/sendemail", (req, res) => {
  const mailOptions = {
    from: "student-hub@hotmail.com",
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

    // Send email to admin
    const mailOptions = {
      from: "student-hub@hotmail.com",
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

app.get("/applied-internships", async (req, res) => {
  if (userD === undefined) {
    res.redirect("/login-page");
  }

  // Retrieve internship IDs from the array
  const internshipIds = (await StudentInternship.getInternshipByStudentId(userid)).map(internship => internship.InternshipID);

  console.log('====================================');
  console.log(internshipIds);
  console.log('====================================');

  // Retrieve internships by their IDs
  const internships = await Promise.all(internshipIds.map(id => Internship.getInternshipById(id)));

  res.render("appliedInternships", {
    title: "Applied Internships",
    year: new Date().getFullYear(),
    internships: internships,
  });
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

    //store all the ids of students whose internship is being deleted with the help of the getStudentIdByInternshipId function
    const studentInternshipIDs =
      await StudentInternship.getStudentIdByInternshipId(internshipId);
    // delete all records in the studentinternship table
    await StudentInternship.destroy({ where: { InternshipID: internshipId } });
    // const deletedInternship = await Internship.findOne({ where: { id: internshipId } });

    const mailOptions = {
      from: "student-hub@hotmail.com",
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
        from: "student-hub@hotmail.com",
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
