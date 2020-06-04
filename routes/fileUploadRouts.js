var express = require('express');
var router = express.Router();


const authService = require('../services/auth.service');


router.post('/UpdateProfilePic',  authService.UpdateProfile);
// router.post('/extractResume', authService.extractResume);

module.exports = router;
