let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Posts = require('../models/posts');
let app = express();

// Simple auth routes for passport local strategy
module.exports = (passport) => {
    router.post('/signup', (req, res) => {
        let body = req.body;
            email = body.email,
            username = body.username,
            password = body.password;
        User.findOne({username: username}, (err, doc) => {
            if(err) {
                res.status(500).send('error occured')
            } else {
                if (doc) {
                    res.status(500).send('username already exists')
                } else {
                    let record = new User()
                    record.email = email;
                    record.username = username;
                    record.password = record.hashPassword(password)
                    record.save((err, user) => {
                        if(err) {
                            res.status(500).send('db error')
                        } else {
                            req.session.userId = user._id;
                            return res.redirect('/');
                        }
                    })
                }
            }
        })
    });

    router.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/blogs'
    }));
    return router;
};