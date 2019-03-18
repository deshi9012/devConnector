const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profiel Model
const Profile = require('../../models/Profile');

//Load User model
const User = require('../../models/User');

const router = express.Router();

// Load input validation
const validateProfileInput = require('../../validation/profile');

// Load experience validation
const validateExperienceInput = require('../../validation/experience');

// Load education validation
const validateEducationInput = require('../../validation/education');

//@route GET api/profile
//@desc Get current user  profile
//@access Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      const profile = await Profile.findOne({ user: req.user._id }).populate(
        'user',
        ['name', 'avatar']
      );

      if (!profile) {
        errors.noProfile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      return res.json(profile);
    } catch (err) {
      return res.status(404).json(err);
    }
  }
);

//@route GET  api/profile/all
//@desc Get all profiles
//@access Public

router.get('/all', async (req, res) => {
  const errors = {};
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      errors.noProfile = 'There are no profiles';
      return res.status(404).json(errors);
    }

    return res.json(profiles);
  } catch (err) {
    return res.status(404).json({ profiles: 'There is no profiles' });
  }
});

//@route GET  api/profile/handle/:handle
//@desc Get profile by handle
//@access Public

router.get('/handle/:handle', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      handle: req.params.handle
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      errors.noProfile = 'There in no profile for this user';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (err) {
    return res.status(404).json(err);
  }
});

//@route GET  api/profile/user/:user_id
//@desc Get profile by user id
//@access Public

router.get('/user/:user_id', async (req, res) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      errors.noProfile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (err) {
    return res
      .status(404)
      .json({ profile: 'There is no profile for this user' });
  }
});

//@route POST  api/profile
//@desc Create or edit user profile
//@access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    console.log(errors);
    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const profileFields = {};

    profileFields.user = req.user._id;

    if (req.body.handle) {
      profileFields.handle = req.body.handle;
    }

    if (req.body.company) {
      profileFields.company = req.body.company;
    }
    if (req.body.website) {
      profileFields.website = req.body.website;
    }

    if (req.body.location) {
      profileFields.location = req.body.location;
    }

    if (req.body.status) {
      profileFields.status = req.body.status;
    }

    if (req.body.githubUsername) {
      profileFields.githubUsername = req.body.githubUsername;
    }

    //Skills - Split into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    //Social
    profileFields.social = {};
    if (req.body.youtube) {
      profileFields.social.youtube = req.body.youtube;
    }
    if (req.body.twitter) {
      profileFields.social.twitter = req.body.twitter;
    }
    if (req.body.facebook) {
      profileFields.social.facebook = req.body.facebook;
    }
    if (req.body.instagram) {
      profileFields.social.instagram = req.body.instagram;
    }
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      if (profile) {
        //Update if profile exist
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: req.user._id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(updatedProfile);
      } else {
        //Create if profile note exist

        console.log(profileFields);
        //Check if handle exists
        try {
          const result = await Profile.findOne({
            handle: profileFields.handle
          });

          if (result) {
            errors.handle = 'That handle already exist';
            return res.status(400).json(errors);
          }
          //Save profile
          try {
            const newProfile = await new Profile(profileFields).save();
            console.log(newProfile);
            return res.json(newProfile);
          } catch (err) {
            console.log(err);
          }
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
);

//@route POST api/profile/experience
//@desc Add experience to profile
//@access Private

router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    console.log(errors);
    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.experience.unshift(newExp);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

//@route POST api/profile/education
//@desc Add education to profile
//@access Private

router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    console.log(errors);
    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.education.unshift(newEdu);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);
//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private

router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user._id });

      //  Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //Splice out of array
      profile.experience.splice(removeIndex, 1);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

//@route DELETE api/profile/education/:edu_id
//@desc Delete education from profile
//@access Private

router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user._id });

      //  Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //Splice out of array
      profile.education.splice(removeIndex, 1);
      //Save
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

//@route DELETE api/profile/
//@desc Delete user and profile
//@access Private

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOneAndRemove({ user: req.user._id });

      const user = await User.findOneAndRemove({ _id: req.user._id });
      return res.json({ success: true });
    } catch (err) {
      console.log(err);
    }
  }
);
module.exports = router;
