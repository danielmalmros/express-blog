let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Posts = require('../models/posts');
let app = express();

let loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login')
  }
}

// GET index page
router.get('/', (req, res, next) => {
  res.render('index', {});
});

// GET login page - included on index to show login
router.get('/login', (req, res, next) => {
  res.render('login');
});

// GET signup page
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

// GET main blog page and find all blog posts on that page
router.get('/blogs', loggedIn, (req, res, next) => {
  Posts.Blog.find({}, (err, posts) => {
    if (err) {
      let err = new Error('Not authorized! Go back!', err);
      err.status = 400;
      return next(err);
    }
    res.render("blogs", {
      posts: posts
    });
  });
});

// GET logout - used to remove/destroy the user session so user have to login again
router.get('/logout', (req, res) => {
  req.session.destroy()
  req.logout()
  res.redirect('/');
});


// GET new comment page
router.get("/new-comment", loggedIn, (req, res) => {
  let currentID = req.query.id;
  res.render("new-comment", {
    id: currentID
  });
});

// POST a new comment on the submit
router.post("/new-comment", loggedIn, (req, res) => {
  // Find current blog id and use that to find and update the mongodb with the new comment
  let id = req.query.containerID;

  Posts.Blog.findByIdAndUpdate(id, {
      $push: {
        comments: {
          author: req.user.username,
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
});

// GET page for creating a new post
router.get("/new-entry", loggedIn, (req, res) => {
  let currentID = req.query.id;
  res.render("new-entry", {
    id: currentID
  });
});


// POST the new blog post to mongodb
router.post("/new-entry", loggedIn, (req, res) => {
  // Create the objects that needs to be saved in mongodb
  let instance = new Posts.Blog({
    title: req.body.title,
    author: req.user.username,
    body: req.body.body,
  });

  // Save the new created blog post
  instance.save((err, Blog) => {
    if (err) {
      return console.error(err);
    }
  });

  res.redirect('/blogs');
});

module.exports = router;