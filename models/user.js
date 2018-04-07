let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

// Schema for users 
let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
})

// Using the bcrypt to hash password here
UserSchema.methods.hashPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

// Using bcrypt to compare password when user try to login
UserSchema.methods.comparePassword = function (password, hash) {
  return bcrypt.compareSync(password, hash)
}

module.exports = mongoose.model('users', UserSchema, 'users')