const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const router = express.Router();

//Load User model

const User = require('../../models/User');

//@route GET api/users/test
//@desc Tests users route
//@access Public
router.get('/test', (req, res) => {
  return res.json({
    message: 'Users works'
  });
});

//@route POST api/users/register
//@desc Register user route
//@access Public
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({
        email: 'Email already exists!'
      });
    } else {
      const avatarUrl = gravatar.url(req.body.avatar, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm' //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatarUrl,
        password: req.body.password
      });
    }
  });
});

module.exports = router;
