let localStrategy = require('passport-local').Strategy;
let User = require('../models/user');

// Using the local passport strategy for user auth
module.exports = (passport) => {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new localStrategy((username, password, done) => {
        User.findOne({
            username: username
        }, (err, doc) => {
            if (err) {
                done(err)
            } else {
                if (doc) {
                    let valid = doc.comparePassword(password, doc.password)
                    if (valid) {
                        done(null, {
                            username: doc.username,
                            password: doc.password
                        })
                    } else {
                        done(null, false)
                    }
                } else {
                    done(null, false)
                }
            }
        })
    }))
}