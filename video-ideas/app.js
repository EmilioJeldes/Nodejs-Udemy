const express = require("express");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
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

// Method Override
app.use(methodOverride("_method"));

// Index Route
app.get("/", (req, res) => {
  const title = "Welcome";
  res.render("index", { title });
});

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

// Idea index page
app.get("/ideas", (req, res) => {
  // fetch ideas from db and pass them as an argument to the front end
  Idea.find()
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", { ideas });
    });
});

// Add idea
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

// Edit idea
app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", { idea });
  });
});

// Process Idea
app.post("/ideas", (req, res) => {
  let errors = [];

  // no title added
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  // no details added
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }
  // if there are errors
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

// Edit form process
app.put("/ideas/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save().then(idea => {
      res.redirect("/ideas");
    });
  });
});

// Delete ideas
app.delete("/ideas/:id", (req, res) => {
  Idea.remove({ _id: req.params.id }).then(() => res.redirect("/ideas"));
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
