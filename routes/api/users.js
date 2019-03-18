const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');
const router = express.Router();

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load User model

const User = require('../../models/User');

//@route POST api/users/register
//@desc Register user route
//@access Public
router.post('/register', async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation

  console.log(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors);
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

// @route GET api/users/login
// @desc Login User / Returning JWT Token
// @access Public
router.post('/login', async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  try {
    const user = await User.findOne({ email });
    // Check user

    if (!user) {
      errors.email = 'Email is invalid! ';
      return res.status(404).json(errors);
    }

    // Check Password
    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        //User Matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; //Create JWT payload

        //Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            return res.json({ success: true, token: 'Bearer ' + token });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(400).json(errors);
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

//@route GET api/users/current
//@desc Return current user
//@access Private

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ id: req.user._id, name: req.user.name, email: req.user.email });
  }
);
module.exports = router;
