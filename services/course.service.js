const Course = require('../models/courses');
var response = require('../response/response');
var CourseTopics = require('../models/courses').model('CourseTopics');
var CourseSubTopics = require('../models/courses').model('CourseSubTopics');
const multer = require('multer');
const UniqueIdGenerator = require('otp-generator');


//aws
const env = require('../config/s3/s3.env.js');

var stream = require('stream');
const fs = require('fs');
const AWS = require('aws-sdk');

// const ID = 'AKIAICCO356V6UKKT3QQ';
// const SECRET = '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';
// // The name of the bucket that you have created
// const BUCKET_NAME = 'mentor-video-aimentr';
// const s3 = new AWS.S3({
//     accessKeyId: env.AWS_ACCESS_KEY,
//     secretAccessKey: env.AWS_SECRET_ACCESS_KEY
// });

// { params: { Bucket: 'mentor-video-aimentr' } }

// var s3 = new AWS.S3({ params: { Bucket: 'mentor-video-aimentr' } });
const s3 = require('../config/s3/s3.config.js');
//aws


// const service = {
//     addCourse: addCourse,
//     getAllCoursesOfMentor: getAllCoursesOfMentor,
//     updateCourseInfo: updateCourseInfo,
//     getCourseInfo: getCourseInfo,
//     deleteCourse: deleteCourse,
//     //topics
//     addCourseTopics : addCourseTopics
//     //subtopics
// }

var service = {}



// var storage = multer.diskStorage({ //multers disk storage settings
//     destination: function (req, file, cb) {
//         cb(null, './public/assets/uploadedVideos/')
//     },
//     filename: function (req, file, cb) {
//         var datetimestamp = Date.now();
//         cb(null, datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);

//         req.body.videoUrl = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];

//     }
// });


var storage = multer.memoryStorage();

service.upload = multer({
    storage: storage
});




service.getCourseInfo = (req, res, next) => {
    let courseId = req.body.courseId;
    Course.findById(courseId, (err, course) => {
        if (err) return res.status(500).send({ success: false, err: err, msg: "Something went wrong" });
        else return res.status(200).send({ success: true, msg: "Course Info", data: course });
    })
}

service.getAllCoursesOfMentor = async (req, res, next) => {
    let queryData = req.body;
    Course.getCoursesByUser(queryData).then(
        doc => {
            var data = {
                Data: doc,
                Message: "all courses",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    );
}


service.getAllCoursesForFilters = async (req, res, next) => {
    let params = req.body;
    var query = {};

    if (params.searchByCourse) {
        var courseKeys = params.searchByCourse.split(/[ ,]+/);
        var RegexKeyWordsMatch = courseKeys.map(function (val) {
            return new RegExp(val, 'i');
        })

        console.log(RegexKeyWordsMatch, courseKeys)

        query.$or = [{ courseName: { "$in": RegexKeyWordsMatch } },
        { courseCategory: { "$in": RegexKeyWordsMatch } },
        { prerequisites: { "$in": RegexKeyWordsMatch } },
        { tags: { "$in": RegexKeyWordsMatch } }
        ]
    }

    Course.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "all Filtered courses",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    );
}



service.addCourse = (req, res, next) => {

    let course = {
        mentor: req.body.mentor,
        courseId: Math.floor(100000000 + Math.random() * 900000000),
        courseName: req.body.courseName,
        courseCategory: req.body.courseCategory,
        courseLevel: req.body.courseLevel,
        courseMode: req.body.courseMode,
        // subtitle: req.body.subtitle
        prerequisites: req.body.prerequisites,
        cost: req.body.cost,
        description: req.body.description,
        courseType: req.body.courseType,
        duration: req.body.duration,
        skillLevel: req.body.skillLevel,
        baches: req.body.baches,
        // topics: req.body.topics,
        // syllabus: req.body.syllabus,
        // timings: req.body.timings,
        // tags: req.body.tags,
        // skills: req.body.skills,

        // topicIdList: req.body.topicIdList,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    }

    let newCourse = new Course(course)

    Course.checkValidCourse(course, async (err, courseExists) => {
        if (err) {
            response(res, null, err);
        } else if (!!courseExists && courseExists.length > 0) {

            var data = {
                Data: courseExists,
                Message: "Course Already exist!.",
            }
            response(res, data, null);

        } else {
            await newCourse.save().then(
                doc => {
                    var data = {
                        Data: doc,
                        Message: "Course added successfully",
                    }
                    response(res, data, null);
                }, err => {
                    response(res, null, err);
                }
            )

        }
    });
}




service.updateCourseInfo = (req, res, next) => {
    Course.updateCourse(req.body, (err, isUpdated) => {
        if (err) {
            response(res, null, err);
        } else {
            var data = {
                Data: isUpdated,
                Message: "Course Updated Successfully",
            }
            response(res, data, null);
        }
    });
}

service.deleteCourse = (req, res, next) => {
    let username = req.body.username;
    let courseId = req.body.courseId;
    Course.deleteCourseById(username, courseId, (err, isDeleted) => {
        if (err) {
            response(res, null, err);
        } else {
            var data = {
                Data: isDeleted,
                Message: "Course  Deleted Successfully",
            }
            response(res, data, null);
        }
    })
}






//course topics

service.AddTopicOfCourse = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        courseId: params.courseId,
        courseName: params.courseName,
        topicId: Math.floor(100000000 + Math.random() * 900000000),
        topicName: params.topicName,
    }
    var inputFields = new CourseTopics(query);
    inputFields.save().then(
        doc => {
            var data = {
                Data: doc,
                Message: "Course topic added successfully",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.getTopicsOfCourse = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        courseId: params.courseId,
    }
    CourseTopics.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of course topics",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )
}

service.getTopicsBasedOnCourseIds = (req, res, next) => {
    var params = req.body;
    var query = {
        courseId: { $in: params.courseIds },
    }
    CourseTopics.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of course topics",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}



service.updateTopicNames = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        topicId: params.topicId,
    }
    var query = {
        topicName: params.topicName,
    }
    CourseTopics.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Topic update Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Topic update Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.deleteTopicNames = (req, res, next) => {
    var params = req.body;
    var query = {
        topicId: params.topicId,
    }
    CourseTopics.findOneAndDelete(query).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Topic Deleting Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Topic Deleted Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}



//course sub topics

service.AddSubTopicOfCourse = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        courseId: params.courseId,
        topicId: params.topicId,
        topicName: params.topicName,
        subTopicId: Math.floor(100000000 + Math.random() * 900000000),
        subTopicName: params.subTopicName
    }
    var inputFields = new CourseSubTopics(query);
    inputFields.save().then(
        doc => {
            var data = {
                Data: doc,
                Message: "Course aubtopic added successfully",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.getSubtopicsOfCourse = (req, res, next) => {
    var params = req.body;
    var query = {};
    if (params.mentor) {
        query.mentor = params.mentor;
    }
    if (params.courseId) {
        query.courseId = params.courseId;
    }
    if (params.topicId) {
        query.topicId = params.topicId;
    }

    CourseSubTopics.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of subtopics",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}

service.getSubTopicsBasedOnCourseIds = (req, res, next) => {
    var params = req.body;
    var query = {
        courseId: { $in: params.courseIds },
    }
    CourseSubTopics.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of course subtopics",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}



service.updateSubTopicNames = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        subTopicId: params.subTopicId,
    }
    var query = {
        subTopicName: params.subTopicName,
    }
    CourseSubTopics.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.deleteSubTopicNames = (req, res, next) => {
    var params = req.body;
    var query = {
        subTopicId: params.subTopicId
    }
    CourseSubTopics.findOneAndDelete(query).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Subtopic Deleting Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Subtopic Deleted Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.updateSubTopicProgrammingStatus = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        subTopicId: params.subTopicId,
    }
    var query = {
        programming: params.programming,
    }
    CourseSubTopics.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}





service.updateSubTopicVideoUrl = (req, res, next) => {

    var params = {
        Bucket: 'mentor-video-aimentr',
        Key: req.file.originalname,
        Body: req.file.buffer,
    }

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ error: "Error -> " + err });

        } else {
            console.log(data)
            // res.json({ message: 'File uploaded successfully! -> keyname = ' + req.file.originalname });

            var basedOn = {
                subTopicId: parseInt(req.body.subTopicId),
            }
            var query = {
                s3key: data.key,
                videoUrl: data.Location,
            }
            CourseSubTopics.update(basedOn, { $set: query }).then(
                doc => {
                    if (doc.n == 0) {
                        var data = {
                            Data: doc,
                            Message: "Subtopic update Failed !",
                            Other: {
                                Success: false
                            }
                        }
                    } else {
                        var data = {
                            Data: doc,
                            Message: "Subtopic update Successfully !",
                            Other: {
                                Success: true
                            }
                        }
                    }
                    response(res, data, null);
                }, err => {
                    response(res, null, err);
                }
            )


        }
    });






    // var params = req.body;
    // var basedOn = {
    //     subTopicId: parseInt(params.subTopicId),
    // }
    // var query = {
    //     videoUrl: "./assets/uploadedVideos/" + params.videoUrl,
    // }
    // CourseSubTopics.update(basedOn, { $set: query }).then(
    //     doc => {
    //         if (doc.n == 0) {
    //             var data = {
    //                 Data: doc,
    //                 Message: "Subtopic update Failed !",
    //                 Other: {
    //                     Success: false
    //                 }
    //             }
    //         } else {
    //             var data = {
    //                 Data: doc,
    //                 Message: "Subtopic update Successfully !",
    //                 Other: {
    //                     Success: true
    //                 }
    //             }
    //         }
    //         response(res, data, null);
    //     }, err => {
    //         response(res, null, err);
    //     }
    // )

}

service.updateSubTopicOutsideVideoUrl = (req, res, next) => {

    var params = req.body;
    var basedOn = {
        subTopicId: params.subTopicId,
    }
    var query = {
        videoUrl: params.videoUrl,
    }
    CourseSubTopics.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Subtopic update Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}




module.exports = service;
