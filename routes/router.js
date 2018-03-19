let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Posts = require('../models/posts');
let entries = require("../components/entries");
let app = express();

// POST route for creating a user!
router.post('/', (req, res, next) => {

  // Confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    let err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
    
    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, (error, user) => {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/blogs');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {

    User.authenticate(req.body.logemail, req.body.logpassword, (error, user) => {
      if (error || !user) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/blogs');
      }
    });
  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET blogs API - To get all blogs from mongodb
router.get('/blogs', (req, res, next) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        Posts.Blog.find({}, (err, posts) => {
          if (err) {
            console.log(err);
            res.send(err);
          }
          res.render("blogs", {
            posts: posts
          });
        });
      }
    }
  });
});

// GET for logout 
router.get('/logout', (req, res, next) => {
  if (req.session) {
    // Delete session object - so user have to login again
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        // Redirect to index
        return res.redirect('/');
      }
    });
  }
});

// GET new comment page
router.get("/new-comment", (req, res) => {
  User.findById(req.session.userId).exec((error, user) => {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          let err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          let currentID = req.query.id;
          res.render("new-comment", {
            id: currentID
          });
        }
      }
    });
});

// POST a new comment on the submit
router.post("/new-comment", (req, res) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        // Find current blog id and use that to find and update the mongodb with the new comment
        let id = req.query.containerID;

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
              res.send('Error');
            } else {
              res.redirect('/blogs');
            }
          });
      }
    }
  });
});

// GET page for creating a new post
router.get("/new-entry", (req, res) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        let currentID = req.query.id;
        res.render("new-entry", {
          id: currentID
        });
      }
    }
  });
});


// POST the new blog post to mongodb
router.post("/new-entry", (req, res) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        // Create the objects that needs to be saved in mongodb
        let instance = new Posts.Blog({
          title: req.body.title,
          author: user.username,
          body: req.body.body,
        });

        // Save the new created blog post
        instance.save((err, Blog) => {
          if (err) {
            return console.error(err);
          }
        });

        res.redirect('/blogs');
      }
    }
  });
});

module.exports = router;