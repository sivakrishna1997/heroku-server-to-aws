const mongoose = require('mongoose');


const CourseSchema = mongoose.Schema({
    mentor: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    courseId: {
        type: Number,
        unique: true,
    },
    courseName: {
        type: String,
        trim: true,
        required: true
    },
    courseCategory: {
        type: String,
    },
    courseLevel: {
        type: String, // programming // nonprogramming
    },

    courseMode: {
        type: String, //  save(1) or published(0)
    },

    subtitle: {
        type: String,  // video subtitles
    },
    prerequisites: {
        type: String
    },
    cost: {
        type: Number,
    },
    description: {
        type: String,
    },
    courseType: {
        type: String, //online / offline
    },
    duration: {
        type: String,
    },
    skillLevel: {
        type: String,   //beginer , expert , 
    },

    baches: [
        {
            bachname: {
                type: String
            },
            numberOfPeople: {
                type: Number
            }
        }
    ],
    // topics: [
    //     {
    //         uniqueId: Number,
    //         title: String,

    //         subTopics: [{
    //             uniqueId: Number,
    //             title: String,
    //             url: String,
    //             provider: String,
    //             programming: Boolean
    //         }]
    //     }
    // ],
    // topicIdList: {
    //     type: [Number]
    // },

    // timings: {  // only online sessions
    //     start: {
    //         hour: Number,
    //         minute: Number,
    //         second: Number
    //     },
    //     end: {
    //         hour: Number,
    //         minute: Number,
    //         second: Number
    //     }
    // },

    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    tags: {
        type: String  //major keywords 
    },
    skills: {
        type: [String]  //
    },

});



const CourseTopics = mongoose.Schema({
    mentor: {
        type: String,
    },
    courseId: {
        type: Number
    },
    courseName: {
        type: String,
    },
    topicId: {
        type: Number,
        unique: true,
    },
    topicName: {
        type: String,
    }

})

const CourseSubTopics = mongoose.Schema({
    mentor: {
        type: String,
    },
    courseId: {
        type: Number
    },
    topicId: {
        type: Number
    },
    topicName: {
        type: String,
    },
    subTopicId: {
        type: Number,
        unique: true,
    },
    subTopicName: {
        type: String,
    },
    programming: {
        type: Boolean,
        default: false
    },
    s3key:{
        type: String,  
    },
    videoUrl: {
        type: String
    }

})


module.exports = mongoose.model('CourseTopics', CourseTopics);
module.exports = mongoose.model('CourseSubTopics', CourseSubTopics);

const Course = module.exports = mongoose.model('courses', CourseSchema);
module.exports = Course;





module.exports.getCourseByTags = function (tags, callback) {
    const query = { $in: { tags: tags } };
    return Course.find(query, callback);
}

module.exports.getCoursesByUser = function (queryData, callback) {
    let query = {};
    if (!!queryData.mentor) {
        query.mentor = queryData.mentor;
    }

    if (!!queryData.courseType) {
        query.courseType = queryData.courseType;
    }

    if (!!queryData.courseName) {
        query.courseName = queryData.courseName;
    }

    if (!!queryData.skillLevel) {
        query.skillLevel = queryData.skillLevel;
    }
    if (!!queryData._id) {
        query._id = queryData._id;
    }
    if (!!queryData.courseId) {
        query.courseId = queryData.courseId;
    }

    if (!!queryData.courseIds) {
        query.courseId = { "$in": queryData.courseIds };
    }

    return Course.find(query, callback);
}

module.exports.checkValidCourse = function (course, callback) {
    const query = { mentor: course.mentor, courseName: course.courseName, courseType: course.courseType, skillLevel: course.skillLevel };
    return Course.find(query, callback);
}

module.exports.updateCourse = function (queryData, callback) {
    let query = {};
    // if (!!queryData.mentor) {
    //     query.mentor = queryData.mentor;
    // }
    // if (!!queryData.courseType) {
    //     query.courseType = queryData.courseType;
    // }
    // if (!!queryData.courseName) {
    //     query.courseName = queryData.courseName;
    // }
    if (!!queryData.skillLevel) {
        query.skillLevel = queryData.skillLevel;
    }
    if (!!queryData.cost) {
        query.cost = queryData.cost;
    }
    if (!!queryData.description) {
        query.description = queryData.description;
    }
    if (!!queryData.duration) {
        query.duration = queryData.duration;
    }
    if (!!queryData.courseCategory) {
        query.courseCategory = queryData.courseCategory;
    }
    if (!!queryData.prerequisites) {
        query.prerequisites = queryData.prerequisites;
    }
    if (!!queryData.startDate) {
        query.startDate = queryData.startDate;
    }
    if (!!queryData.skills) {
        query.skills = queryData.skills;
    }

    if (!!queryData.courseMode) {
        query.courseMode = queryData.courseMode;
    }
    if (!!queryData.baches) {
        query.baches = queryData.baches;
    }
    if (!!queryData.courseLevel) {
        query.courseLevel = queryData.courseLevel;
    }

    // if (!!queryData.syllabus) {
    //     query.syllabus = queryData.syllabus;
    // }
    Course.findOneAndUpdate({ courseId: queryData.courseId }, query, callback);

}

module.exports.isMentorHavingCourse = function (mentorName, courseId, _callback) {
    const query = { _id: mongoose.Types.ObjectId(courseId), mentor: mentorName };
    return Course.find(query, _callback);
}


module.exports.getCourseInfoById = function (courseId, _callback) {
    const query = { _id: mongoose.Types.ObjectId(courseId) };
    return Course.findById(query, _callback);
}

module.exports.deleteCourseById = function (mentor, courseId, _callback) {
    const query = { mentor: mentor, _id: mongoose.Types.ObjectId(courseId) };
    Course.findOneAndDelete(query, _callback);
}