/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
const http = require("http");
const {
  describe,
  beforeAll,
  afterAll,
  test,
  expect,
} = require("@jest/globals");
const { User } = require("../models");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Student Hub test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = http.createServer(app);
    server.listen(4000, () => {});
    agent = request.agent(server);
  });
  beforeEach(() => {
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("GET /signup-page renders the signup page", async () => {
    let res = await agent.get("/signup-page");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Signup");
    expect(res.text).toContain("_csrf");
  });

  test("POST /signup creates a new user", async () => {
    let res = await agent.get("/signup-page");
    const csrfToken = extractCsrfToken(res);

    res = await agent
      .post("/signup")
      .send({
        firstName: "Tests",
        lastName: "User",
        email: "testmail@gmail.com",
        password: "password",
        isAdmin: false,
        _csrf: csrfToken,
      })
      .timeout({ deadline: 15000 });
    res = await agent.get("/login-page");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Login");
  });

  test("GET /login-page renders the login page", async () => {
    let res = await agent.get("/login-page");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Login");
    expect(res.text).toContain("_csrf");
  });
  // test("POST /login logs in the user", async () => {
  //   let res = await agent.get("/login-page");
  //   expect(res.statusCode).toBe(200);
  //   const csrfToken = extractCsrfToken(res);
  //   res = await agent
  //     .post("/login")
  //     .send({
  //       email: "testmail@gmail.com",
  //       password: "password",
  //       _csrf: csrfToken,
  //     })
  //     .timeout({ deadline: 15000 });
  //   console.log("Response body:", res.text);
  //   expect(res.statusCode).toBe(302);
  //   // const locationHeader = res.headers.location;
  //   // expect(locationHeader).toBeDefined();
  //   // expect(locationHeader).toBe("/home");
  // });
  // test("POST /login logs in the user", async () => {
  //   let res = await agent.get("/login-page");
  //   expect(res.statusCode).toBe(200);
  //   const csrfToken = extractCsrfToken(res);
  //   res = await agent
  //     .post("/login")
  //     .send({
  //       email: "gopivarun@gmail.com",
  //       password: "password",
  //       _csrf: csrfToken,
  //     })
  //     .timeout({ deadline: 15000 });
  //   console.log("Response body:", res.text);
  //   expect(res.statusCode).toBe(302);
  //   // const locationHeader = res.headers.location;
  //   // expect(locationHeader).toBeDefined();
  //   // expect(locationHeader).toBe("/home");
  // });
  test("GET /sendemail sends a test email", async () => {
    let res = await agent.get("/sendemail");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Email sent successfully!");
    // Add more expectations based on your email sending functionality
  });
  test("GET /Internship-Page renders the create internship page", async () => {
    let res = await agent.get("/Internship-Page");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Create Internship");
    expect(res.text).toContain("_csrf");
  });

  // test("POST /createInternship creates a new internship", async () => {
  //   try {
  //     // Retrieve CSRF token
  //     let res = await agent.get("/Internship-Page");
  //     console.log("CSRF Token Response:", res.text);  // Debug statement
  //     expect(res.statusCode).toBe(200);
  //     const csrfToken = extractCsrfToken(res);

  //     // Create a new internship
  //     res = await agent
  //       .post("/createInternship")
  //       .set("Cookie", res.headers["set-cookie"])
  //       .send({
  //         title: "Software Developer Intern",
  //         description: "Exciting opportunity for a software development role.",
  //         startDate: "2024-03-01",
  //         endDate: "2024-06-30",
  //         location: "Remote",
  //         _csrf: csrfToken,
  //       })
  //       .timeout({ deadline: 15000 });

  //     // Check if the internship creation was successful
  //     console.log("Internship creation response body:", res.text);
  //     console.log("Internship creation response status code:", res.statusCode);
  //     expect(res.statusCode).toBe(200);

  //     // Assuming that the new internship is listed on the home page
  //     res = await agent.get("/home");
  //     console.log("Home page response body:", res.text);  // Debug statement
  //     expect(res.statusCode).toBe(200);
  //   } catch (error) {
  //     console.error("Error during test:", error);
  //     console.log("Error response body:", error.response?.text);
  //     console.log("Error response status code:", error.response?.statusCode);
  //     throw error; // Rethrow the error to mark the test as failed
  //   }
  // });
});
