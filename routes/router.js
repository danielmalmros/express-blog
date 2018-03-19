var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Posts = require('../models/posts');
var entries = require("../components/entries");
var app = express();

var entries = [];
app.locals.entries = entries;
var nextID = 0;

//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/blogs');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/blogs');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET blogs API
router.get('/blogs', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          Posts.Blog.find({}, function (err, posts) {
            if (err) {
              console.log(err);
              res.send(err);
            }

            console.log(posts.comments);

            res.render("blogs", {
              posts: posts
            });
          });
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get("/new-comment", function (req, res) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          var currentID = req.query.id;
          res.render("new-comment", { id: currentID });
        }
      }
    });
});

router.post("/new-comment", function (req, res) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          var id = req.query.containerID;

          Posts.Blog.findByIdAndUpdate(id, {
            $push: {
              comments: {
                author: user.username,
                body: req.body.body,
              }
            }
          }, {
              upsert: true
            },
            (err) => {
              if (err) {
                res.send('Error updating single wins!');
              } else {
                res.redirect('/blogs');
              }
            });
        }
      }
    });
});

router.get("/new-entry", function (req, res) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          var currentID = req.query.id;
          res.render("new-entry", { id: currentID });
        }
      }
    });
});

router.post("/new-entry", function (req, res) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {

          let instance = new Posts.Blog({
            title: req.body.title,
            author: user.username,
            body: req.body.body,
          });

          instance.save(function (err, Blog) {
            if (err) {
              return console.error(err);
            }
            console.log("Save success: ", Blog);
          });

          res.redirect('/blogs');
        }
      }
    });
});


module.exports = router;