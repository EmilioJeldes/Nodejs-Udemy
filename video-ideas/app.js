const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

// MongoDB connect
mongoose
  .connect(
    "mongodb://localhost:27017/videoideas-dev",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => {
    console.log(err);
  });

// Load Model
require("./models/Idea");
const Idea = mongoose.model("ideas");

// Handlebars middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Index Route
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("index", { title });
});

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

// Add idea
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

// Process Idea
app.post("/ideas", (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }
  if (errors.length > 0) {
    res.render("ideas/add", {
      errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser).save().then(idea => {
      res.redirect("/ideas");
    });
  }
});

app.get("/name", (req, res) => {
  res.json({
    name: "Emilio Jeldes",
    age: 28,
    career: "Software Engineer"
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
