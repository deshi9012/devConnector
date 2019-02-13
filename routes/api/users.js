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
router.post('/register', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
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

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
          if (err) throw err;

          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar: avatarUrl,
            password: hash
          });
          try {
            const response = await newUser.save();
            return res.json(response);
          } catch (error) {
            console.log(error);
          }
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
