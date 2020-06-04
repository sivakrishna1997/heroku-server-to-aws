const Enrollments = require('../models/enrollments');
const Courses = require('../models/courses');

const service = {
    enrollForCourse: enrollForCourse,
    getAllCoursesEnrolledByStudent: getAllCoursesEnrolledByStudent,
    getCourseRequestStatus: getCourseRequestStatus,
    getAllStudentsEnrolledForCourse: getAllStudentsEnrolledForCourse,
    acceptCourse: acceptCourse,
    rejectCourse: rejectCourse,
    getFiveCoursesEnrolledByStudent: getFiveCoursesEnrolledByStudent,
    getCourseStats: getCourseStats
}

module.exports = service;

const EnrollmentStatus = {
    ACCEPT: 2,
    REJECT: 3,
    PENDING: 1
}

function getCourseStats(req, res, next) {
    let status = req.body.status;
    let username = req.body.username;
    Enrollments.getCourseStats( status, username, (err, data) => {
        if(err) {
            return res.status(500).send({success: false, msg: 'Something went wrong', err: err});
        }else {
            return res.status(200).send({success: true, msg: "Course Stats", data: data});
        }
    })
}

function getFiveCoursesEnrolledByStudent(req, res, next) {
    let studentId = req.body.studentId;
    Enrollments.getFiveCoursesEnrolledByStudent(req.body, (err, courses) => {
        if(err) {
            return res.status(500).send({success: false, err: err, msg: "Something went wrong"});
        }else {
            return res.status(200).send({success: true, msg: "Courses enrolled by student", data: courses});
        }
    })
}

function enrollForCourse(req, res, next) {
    let studentId = req.body.studentId;
    let courseId = req.body.courseId;

    const enrollment = new Enrollments({
        studentId: studentId,
        courseId: courseId,
        status: EnrollmentStatus.PENDING
    });

    Enrollments.getEnrollmentStatus(courseId, studentId, (err, enrollStatus) => {
        if(err) {
            return res.status(500).send({success:false, msg: "Something went wrong..please try again", err: err});
        }else if(!enrollStatus || enrollStatus.length <= 0) {
            console.log("enrollStatus:: ",enrollStatus);
            enrollment.save((err, isSaved) => {
                if(err) {
                    return res.status(500).send({success:false, msg: "Something went wrong..please try again", err: err});
                }else if(!!isSaved) {
                    return res.status(200).send({
                        success: true,
                        msg: "Successfully Enrolled for Course"
                    })
                }else {
                    return res.status(500).send({
                        success: false,
                        msg: "Failed to enroll for course..Please try again"
                    });
                }
            })
        }else {
            return res.status(500).send({
                success: false,
                msg: "Already enrolled for this course"
            });
        }
    })
}

function getCourseRequestStatus(req, res, next) {
    let courseId = req.body.courseId;
    let userId = req.body.userId;
    let role = req.body.type;
    let username = req.body.username;

    Enrollments.getEnrollmentStatus(courseId, userId, (err, enrollStatus) => {
        if(err) {
            return res.status(500).send({success:false, msg: "Something went wrong..please try again", err: err});
        }else if(!!enrollStatus && enrollStatus.length > 0) {
            return res.status(200).send({success:true, msg: "Enrollment status", data: enrollStatus});
        }else {
            if(role === 'mentor') {
                Courses.isMentorHavingCourse(username, courseId, (err, isHavingCourse) => {
                    if(err) {
                        return res.status(500).send({success:false, msg: "Something went wrong..please try again", err: err});
                    }else if(!!isHavingCourse) {
                        return res.status(200).send({success:true, msg: "Mentor Created course", data: isHavingCourse});
                    }else {
                        return res.status(500).send({
                            success: false,
                            msg: "Course not found"
                        });
                    }
                })
            }else {
                return res.status(500).send({
                    success: false,
                    msg: "Enrollment not found"
                });
            }
        }
    })
}

function getAllCoursesEnrolledByStudent(req, res, next) {
    let studentId = req.body.studentId;
    Enrollments.getAllCoursesEnrolledByStudent(req.body, (err, courses) => {
        if(err) {
            return res.status(500).send({success: false, err: err, msg: "Something went wrong"});
        }else {
            return res.status(200).send({success: true, msg: "Courses enrolled by student", data: courses});
        }
    })
}

function getAllStudentsEnrolledForCourse(req, res, next) {
    let courseId = req.body.courseId;
    Enrollments.getAllStudentsEnrolledForCourse(req.body, (err, courses) => {
        if(err) {
            return res.status(500).send({success: false, err: err, msg: "Something went wrong"});
        }else {
            return res.status(200).send({success: true, msg: "Courses enrolled by student", data: courses});
        }
    })
}

function acceptCourse(req, res, next) {
    Enrollments.changeStatusOfEnrollment(req.body.requestId, EnrollmentStatus.ACCEPT, (err, accepted) => {
        if(err) {
            return res.status(500).send({success: false, err: err, msg: "Something went wrong"});
        }else {
            return res.status(200).send({success: true, msg: "Accepted Course Request", data: accepted});
        }
    })
}

function rejectCourse(req, res, next) {
    Enrollments.changeStatusOfEnrollment(req.body.requestId, EnrollmentStatus.REJECT, (err, accepted) => {
        if(err) {
            return res.status(500).send({success: false, err: err, msg: "Something went wrong"});
        }else {
            return res.status(200).send({success: true, msg: "Rejected Course Request", data: accepted});
        }
    })
}