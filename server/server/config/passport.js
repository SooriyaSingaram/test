/**
 * Passport Router
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('../models/users');

passport.use(new LocalStrategy({
  usernameField: 'userName',
  passwordField: 'password'
},
  function (emailId, password, done) {
    User.findOne({ emailId: emailId,isActive: true }, function (err, user) {
      if (err) { return done(err); }

      //Check if user name already exist in db
      if (!user) {
        return done(null, false, {
          message: 'Sorry, This user does not exist.'
        });
      }

      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Oops!..Incorrect Password. Try again.'
        });
      }
      // If credentials are correct, return the corresponding user object
      return done(null, user);
    });
  }
));