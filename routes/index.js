var express = require('express');
var router = express.Router();
const passport = require('passport');
const multer = require('multer');

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/upload')
//   },
//   filename: function (req, file, cb) {
//     var datetimestamp = Date.now();
//     cb(null, datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);

//     var filepath = "./public/upload/" + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]
//     var filetype = file.originalname.split('.')[file.originalname.split('.').length - 1];
//     req.body.filepath = filepath;
//     req.body.filetype = filetype;

//   }
// })
var storage = multer.memoryStorage();

const upload = multer({ storage: storage })


// Services
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const mailer = require('../_helpers/mailer');
const courseServie = require('../services/course.service');
const enrollmentsService = require('../services/enrollments.service');
const sessionService = require('../services/session.service');
const googleTranslateService = require('../services/google-translate.service');
const userCompletedVideos = require('../services/manageUser');
const PaymentCtrl = require('../services/PaymentCtrl')
const FollowAndMessageCtrl = require('../services/FollowRequestMessageCtrl')
const videoCtrl = require('../services/twilio')


// Authentication Routes
router.get('/auth/validUsername/:username', authService.validUsername);
router.post('/auth/register', authService.registerUser);
router.post('/auth/login', authService.authenticateUser);
router.post('/auth/resetPassword', passport.authenticate('jwt', { session: false }), authService.resetPassword);
router.post('/extractResume', upload.single('resume'), authService.extractResume);
// router.post('/extractResume', authService.extractResume);
router.post('/UpdatePassword', authService.UpdatePassword);
// router.post('/UpdateProfilePic', authService.upload.single('profilePic'), authService.UpdateProfile);
// router.post('/UpdateProfilePic',  authService.UpdateProfile);


router.get('/mailVerified/:username', authService.mailVerified);
router.get("/mailVerificationStatus/:username", authService.getMailVerificationStatus);
router.get('/resendConfirmation/:username', authService.resendConfirmation);
router.post('/sendOtp', authService.sendOtp);
router.post('/verifyOtp', authService.verifyOtp);
router.post('/studentRegistration', authService.studentRegistration);

// User Routes
router.post('/getUserInfo', userService.getUserInfoByUsername);
router.post('/updateProfile', userService.updateProfile);
router.post('/getUsersByRole', userService.getUsersByRole);
router.post('/queryUsers', userService.filterUsers);

router.post('/filterUsersAndCourses', userService.filterUsersAndCourses);
router.post('/getUserByEmail', userService.getUserByEmail);



// Course Routes
router.post('/addCourse', courseServie.addCourse);
router.post('/getAllCoursesOfMentor', courseServie.getAllCoursesOfMentor)
router.post('/updateCourse', courseServie.updateCourseInfo);
router.post('/getCourseInfo', courseServie.getCourseInfo);
router.post('/deleteCourse', courseServie.deleteCourse);


//Course topics and subtopics

router.post('/AddTopicOfCourse', courseServie.AddTopicOfCourse);
router.post('/getTopicsOfCourse', courseServie.getTopicsOfCourse);
router.post('/updateTopicNames', courseServie.updateTopicNames);
router.post('/deleteTopicNames', courseServie.deleteTopicNames);
router.post('/getTopicsBasedOnCourseIds', courseServie.getTopicsBasedOnCourseIds);

router.post('/AddSubTopicOfCourse', courseServie.AddSubTopicOfCourse);
router.post('/getSubtopicsOfCourse', courseServie.getSubtopicsOfCourse);
router.post('/updateSubTopicNames', courseServie.updateSubTopicNames);
router.post('/deleteSubTopicNames', courseServie.deleteSubTopicNames);
router.post('/getSubTopicsBasedOnCourseIds', courseServie.getSubTopicsBasedOnCourseIds);



router.post('/updateSubTopicProgrammingStatus', courseServie.updateSubTopicProgrammingStatus);
// router.post('/updateSubTopicVideoUrl', courseServie.upload.single('uploads'), courseServie.updateSubTopicVideoUrl);
router.post('/updateSubTopicVideoUrl', courseServie.upload.single('uploads'), courseServie.updateSubTopicVideoUrl);

router.post('/updateSubTopicOutsideVideoUrl', courseServie.updateSubTopicOutsideVideoUrl);


// User Completed Videos
router.post('/AddUserCompletedVideosOftheCourse', userCompletedVideos.AddUserCompletedVideosOftheCourse);
router.post('/getUserCompletedVideosOftheCourse', userCompletedVideos.getUserCompletedVideosOftheCourse);


//Payment 
router.post('/makePayment', PaymentCtrl.makePayment);
router.post('/getBeforePaidPaymentDetails', PaymentCtrl.getBeforePaidPaymentDetails);
router.post('/DeleteBeforePaidPaymentDetails', PaymentCtrl.DeleteBeforePaidPaymentDetails);
router.post('/InsertPaymentDetails', PaymentCtrl.InsertPaymentDetails);
router.post('/DeletePaymentDetails', PaymentCtrl.DeletePaymentDetails);
router.post('/getPaidCourses', PaymentCtrl.getPaidCourses);
router.post('/getPaidUsers', PaymentCtrl.getPaidUsers);

// Following and Messages
router.post('/startFollowing', FollowAndMessageCtrl.StartFollowing);
router.post('/getFollowers', FollowAndMessageCtrl.getFollowers);
router.post('/CheckFollowingOrNot', FollowAndMessageCtrl.CheckFollowingOrNot);
router.post('/unFollow', FollowAndMessageCtrl.unFollow);
router.post('/SendMessage/Notifications', FollowAndMessageCtrl.SendMessage);
router.post('/GetMessages/Notifications', FollowAndMessageCtrl.GetMessages);
router.post('/updateMessageStatus', FollowAndMessageCtrl.updateMessageStatus);
router.post('/DeleteMessage', FollowAndMessageCtrl.DeleteMessage);

router.post('/UpdateFollowRequestOrRejected', FollowAndMessageCtrl.UpdateFollowRequestOrRejected);


// Video Sessions twilio

router.post('/CreateVideoSession', videoCtrl.CreateVideoSession);
router.post('/joinSession', videoCtrl.joinToSession);
router.post('/endVideoSession', videoCtrl.EndVideoSession)





// Enrollment Routes
router.post('/enrollForCourse', enrollmentsService.enrollForCourse);
router.post('/getAllCoursesEnrolledByUser', enrollmentsService.getAllCoursesEnrolledByStudent);
router.post('/getCourseRequestStatus', enrollmentsService.getCourseRequestStatus);
router.post('/getAllStudentsEnrolledForCourse', enrollmentsService.getAllStudentsEnrolledForCourse);
router.post('/acceptCourse', enrollmentsService.acceptCourse);
router.post('/rejectCourse', enrollmentsService.rejectCourse);
router.post('/getFiveCoursesEnrolledByUser', enrollmentsService.getFiveCoursesEnrolledByStudent);
router.post('/getCourseStats', enrollmentsService.getCourseStats);

// Sessions Routes
router.post('/getCourseSessionStatus', sessionService.getSessionStatus)
router.post('/createSession', sessionService.createSession);
router.post('/endSession', sessionService.endSession);
// router.post('/joinSession', sessionService.joinToSession);
router.post('/validUserForSession', sessionService.validUserForSession);
router.post('/compileCode', sessionService.compileCode);
router.post('/exitSession', sessionService.exitFromSession);
router.post('/isAdminForSession', sessionService.isAdminForSession);
// router.post('/getOnlineUsersInSession');


// Google Translate API issues
router.post('/getAllSupportedLanguages', googleTranslateService.getAllSupportedLanguages);
router.post('/translateText', googleTranslateService.translateText);
router.post('/getSupportedLanguagesForLang', googleTranslateService.getSupportedLanguagesForLang);

// Testing Mail
// router.get('/sendMail', mailer.requestMail);

// Siva start========================
router.post('/getAudiotoText', upload.any(), googleTranslateService.getAudiotoText);

//siva End =========================

// Live
router.get('/live', function (req, res, next) {
  res.json({ status: 'live' });
})

module.exports = router;
