const express = require('express');

const router = express.Router();

//@route GET api/posts/test
//@desc Tests post route
//@access Public
router.get('/test', (req, res) => {
  return res.json({
    message: 'posts works'
  });
});
module.exports = router;
