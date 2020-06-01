const mongoose = require('mongoose');

const EnrollmentsSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    status: {
        type: Number,
        default: 1
    }
});

const Enrollments = module.exports = mongoose.model('enrollments',EnrollmentsSchema);

module.exports = Enrollments;

module.exports.getEnrollmentStatus = function(courseId, studentId, callback) {
    const query = {courseId: mongoose.Types.ObjectId(courseId), studentId: mongoose.Types.ObjectId(studentId)};
    console.log("Enrollment Status:: ",query);
    Enrollments.find(query, callback);
}

module.exports.filterEnrollments = function(queryData, callback) {
    let query = {};
    if(queryData.studentId) {
        query.studentId = queryData.studentId;
    }
    if(queryData.status) {
        query.status = queryData.status;
    }
    if(queryData.courseId) {
        query.courseId = queryData.courseId;
    }

    // Enrollments.find(query, callback);
    Enrollments.aggregate([
        {$match: query},
        {$lookup: {from: 'courses', localField: 'courseId', foreignField: '_id', as: 'courseInfo'}},
        {$lookup: {from: 'users', localField: 'studentId', foreignField: '_id', as: 'studentInfo'}}
    ]).exec(callback);
}

module.exports.getAllCoursesEnrolledByStudent = function(queryData, callback) {
    let query = {};
    query.studentId = mongoose.Types.ObjectId(queryData.studentId);
    if(queryData.status) {
        query.status = queryData.status;
    }
    // Enrollments.find(query, callback);
    Enrollments.aggregate([
        {$match: query},
        {$lookup: {from: 'courses', localField: 'courseId', foreignField: '_id', as: 'courseInfo'}},
        {$lookup: {from: 'users', localField: 'studentId', foreignField: '_id', as: 'studentInfo'}}
    ]).exec(callback);
}

module.exports.getFiveCoursesEnrolledByStudent = function(queryData, callback) {
    let query = {};
    query.studentId = mongoose.Types.ObjectId(queryData.studentId);
    if(queryData.status) {
        query.status = queryData.status;
    }
    // Enrollments.find(query, callback);
    Enrollments.aggregate([
        {$match: query},
        {$lookup: {from: 'courses', localField: 'courseId', foreignField: '_id', as: 'courseInfo'}},
        {$lookup: {from: 'users', localField: 'studentId', foreignField: '_id', as: 'studentInfo'}}
    ]).limit(5).exec(callback);
}

module.exports.getAllStudentsEnrolledForCourse = function(queryData, callback) {
    let query = {};
    query.courseId = mongoose.Types.ObjectId(queryData.courseId);
    if(queryData.status) {
        query.status = queryData.status;
    }

    Enrollments.aggregate([
        {$match: query},
        {$lookup: {from: 'courses', localField: 'courseId', foreignField: '_id', as: 'courseInfo'}},
        {$lookup: {from: 'users', localField: 'studentId', foreignField: '_id', as: 'studentInfo'}}
    ]).exec(callback);

    // Enrollments.find(query, callback);
}

module.exports.changeStatusOfEnrollment = function(enrollmentId, status, callback) {
    Enrollments.findOneAndUpdate({_id: mongoose.Types.ObjectId(enrollmentId)}, {$set: {status: status}}, callback);
}

module.exports.getCourseStats = function(status, username, callback) {
    Enrollments.aggregate([
        {
            $match: {status: status}
        },  
        {
            $group: {
                _id: "$courseId",
                count: {$sum: 1}
            }
        },
        {$lookup: {from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo'}},
        { $project: {_id: 1, count: 1, courseInfo: {$arrayElemAt: ["$courseInfo", 0]}} },
        { $match: {"courseInfo.mentor": username}},
        { $project: {_id: 1, count: 1, "courseInfo.mentor": 1, "courseInfo.title": 1, "courseInfo._id": 1} }
        // { $addFields: {
        //     "courseInfo": {
        //         $arrayElemAt: [
        //             {
        //                 $filter: {
        //                     input: "$courseInfo",
        //                     "as": "couseDetails",
        //                     "cond": {
        //                         "$eq": ["$$couseDetails.username", "final-test-mentor"]
        //                     }
        //                 }
        //             },
        //             0
        //         ]
        //     }
        // }}
    ]).exec(callback)
}