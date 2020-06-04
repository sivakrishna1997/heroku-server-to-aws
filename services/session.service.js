const express = require('express');
const Session = require('../models/session');
const Course = require('../models/courses');
const compilerun = require('compile-run');

const service = {
  createSession: createSession,
  getSessionStatus: getSessionStatus,
  endSession: endSession,
  exitFromSession: exitFromSession,
  joinToSession: joinToSession,
  validUserForSession: validUserForSession,
  isAdminForSession: isAdminForSession,
  compileCode: compileCode
  // getActiveUsersOfSession: getActiveUsersOfSession
}

module.exports = service;

function createSession(req, res, next) {
  let username = req.body.username;
  let courseId = req.body.courseId;
  let hash = req.body.hash;

  let date = new Date();
  let newSession = new Session({
    courseId: courseId,
    admin: username,
    users: username,
    status: 1,
    startedOn: date,
    firebaseId: hash
  })

  // Just check whether he can start session now or not..
  Course.getCourseInfoById(courseId, (err, courseInfo) => {
    if(err) {
      res.status(500).json({success: false, msg: "Failed to create session", err:err});
    }

    if(!!courseInfo) {
      // let startDateInfo = new Date(courseInfo.startDate.year, courseInfo.startDate.month - 1, courseInfo.startDate.day, courseInfo.timings.start.hour, courseInfo.timings.start.minute);
      // let endDateInfo = new Date(courseInfo.endDate.year, courseInfo.endDate.month - 1, courseInfo.endDate.day, courseInfo.timings.end.hour, courseInfo.timings.end.minute);

      // let currentDateInfo = [date.getFullYear(), (date.getMonth() + 1), date.getDate(), date.getHours(), date.getMinutes()]

      // let courseStartDate = courseInfo.startDate.day+'-'+courseInfo.startDate.month+'-'+courseInfo.startDate.year;
      // let courseEndDate = courseInfo.endDate.day+'-'+courseInfo.endDate.month+'-'+courseInfo.endDate.year;
      // let courseStartTime = courseInfo.timings.start.hour+'-'+courseInfo.timings.start.minute;
      // let courseEndTime =  courseInfo.timings.end.hour+'-'+courseInfo.timings.end.minute;
      // console.log(`Course Timings:: ${courseStartDate}::${courseStartTime} - ${courseEndDate}::${courseEndTime}`);
      // console.log(`Current Date:: ${date}`);

      // let currentDate = date.getDay()+'-'+(date.getMonth() + 1)+'-'+date.getFullYear();
      // let currentTime = date.getHours()+"-"+date.getMinutes();


      // let validTime = currentDateInfo.map((t, index) => t <= endDateInfo[index] && t >= startDateInfo[index]);
      // let validTime = date >= startDateInfo && date <= endDateInfo;

      // if(!!validTime) {
        newSession.save()
        .then(session => res.status(200).json({success: true, msg: "Session Created Successfully!", data: session}))
        .catch(err2 => res.status(500).json({success: false, msg: "Failed to create session", err:err2}));
      // }else {
      //   res.status(500).json({success: false, msg: "Failed to create session", err:err})
      // }

    }else {
      res.status(500).json({success: false, msg: "Failed to create session", err:err})
    }

  })

}

function getSessionStatus(req, res, next) {
  let courseId = req.body.courseId;
  Session.checkSessionStatus(courseId)
  .then(status => res.status(200).json({success: true, data: status}))
  .catch(err => res.status(500).json({success: false, msg: "Something went wrong..please try again", err: err}));
}

function joinToSession(req, res, next) {
  let userId = req.body.username;
  let courseId = req.body.courseId;
  Session.addUserToSession(courseId, userId)
  .then((data) => res.status(200).json({success: true, message: "User Added to session", data: data}))
  .catch(err => res.status(500).json({success: false, message: "Failed to add user to session", err: err}));
}

function validUserForSession(req, res, next) {
  let userId = req.body.userId;
  let sessionId = req.body.sessionId;
  Session.validUser(sessionId, userId, (err, val) => {
    if(err) {
      res.status(500).json({success: false, message: 'Not a Valid user for session', err: err})
    }else if(!!val) {
      res.status(200).json({success: true, message: 'Valid User', data: val})
    }else {
      res.status(500).json({success: false, message: 'Not a Valid user for session', data: val})
    }
  })
  // Session.validUser(sessionId, userId)
  // .then((res) => res.status(200).json({success: true, message: 'Valid User', data: res}))
  // .catch((err) => res.status(500).json({success: false, message: 'Not a Valid user for session', err: err}));
}

function isAdminForSession(req, res, next) {
  let username = req.body.username;
  let sessionId = req.body.sessionId;

  Session.isAdminForSession(sessionId, username)
  .then(admin => 
    res.status(200).json({success: true, message: 'Admin', data: admin}))
  .catch(err =>
     res.status(500).json({success: false, message: 'Not Admin', err: err}));
}

function compileCode(req, res, next) {
  const sourceCode = req.body.code;
  const language = req.body.language;
  const compileResultPromise = compilerun[language].runSource(sourceCode);
  compileResultPromise
  .then(result => res.status(200).json({success: true, data:result}))
  .catch(err => res.status(500).json({success: false, err: err}));
}

function exitFromSession(req, res, next) {
  let username = req.body.username;
  let sessionId = req.body.sessionId;
  Session.removeUserFromSession(sessionId, username)
  .then((data) => res.status(200).json({success: true, message: username+" left from session", data: data}))
  .catch(err => res.status(500).json({success: false, message: "Failed to left from session..Please try again", err: err}));
}

function endSession(req, res, next) {
  let username = req.body.username;
  let sessionId = req.body.sessionId;
  let date = new Date();
  Session.isAdminForSession(sessionId, username)
  .then(admin => {
    Session.endSession(sessionId, date)
    .then(updated => res.status(200).json({success: true, message: 'Successfully end session', data: updated}))
    .catch(err => res.status(500).json({success: false, message: "Failed to end session", err: err}))
  })
  .catch(err => res.status(500).json({success: false, message: "Failed to end session", err: err}));
}
