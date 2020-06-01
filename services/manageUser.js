var response = require('../response/response');
var UserCompletedOfflineVideos = require('../models/manageUsers');
const UniqueIdGenerator = require('otp-generator');

var service = {}


//course sub topics

service.AddUserCompletedVideosOftheCourse = (req, res, next) => {
    var params = req.body;
    var findQuery = {
        email: params.email,
        courseId: params.courseId,
        topicId: params.topicId,
        subTopicId: params.subTopicId,
    }


    UserCompletedOfflineVideos.find(findQuery).then(
        doc => {
            if (doc.length == 0) {
                var query = {
                    email: params.email,
                    courseId: params.courseId,
                    topicId: params.topicId,
                    topicName: params.topicName,
                    subTopicId: params.subTopicId,
                    subTopicName: params.subTopicName
                }
                var inputFields = new UserCompletedOfflineVideos(query);
                inputFields.save().then(
                    subdoc => {
                        var data = {
                            Data: subdoc,
                            Message: "Video Completed successfully.",
                            Other:{
                                Success : true
                            }
                        }
                        response(res, data, null);
                    }, err => {
                        response(res, null, err);
                    }
                )
            } else {
                var data = {
                    Data: doc,
                    Message: "Video already completed!",
                    Other:{
                        Success : false
                    }
                }
                response(res, data, null);
            }
        }, err => {
            response(res, null, err);
        }
    )

}



service.getUserCompletedVideosOftheCourse = (req, res, next) => {
    var params = req.body;
    var query = {};
    if (params.email) {
        query.email = params.email;
    }
    if (params.courseId) {
        query.courseId = params.courseId;
    }
    if (params.topicId) {
        query.topicId = params.topicId;
    }

    UserCompletedOfflineVideos.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of completed videos",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}



// service.updateSubTopicNames = (req, res, next) => {
//     var params = req.body;
//     var basedOn = {
//         subTopicId: params.subTopicId,
//     }
//     var query = {
//         subTopicName: params.subTopicName,
//     }
//     UserCompletedOfflineVideos.update(basedOn, { $set: query }).then(
//         doc => {
//             if (doc.n == 0) {
//                 var data = {
//                     Data: doc,
//                     Message: "Subtopic update Failed !",
//                     Other: {
//                         Success: false
//                     }
//                 }
//             } else {
//                 var data = {
//                     Data: doc,
//                     Message: "Subtopic update Successfully !",
//                     Other: {
//                         Success: true
//                     }
//                 }
//             }
//             response(res, data, null);
//         }, err => {
//             response(res, null, err);
//         }
//     )

// }


// service.deleteSubTopicNames = (req, res, next) => {
//     var params = req.body;
//     var query = {
//         subTopicId: params.subTopicId
//     }
//     UserCompletedOfflineVideos.findOneAndDelete(query).then(
//         doc => {
//             if (doc.n == 0) {
//                 var data = {
//                     Data: doc,
//                     Message: "Subtopic Deleting Failed !",
//                     Other: {
//                         Success: false
//                     }
//                 }
//             } else {
//                 var data = {
//                     Data: doc,
//                     Message: "Subtopic Deleted Successfully !",
//                     Other: {
//                         Success: true
//                     }
//                 }
//             }
//             response(res, data, null);
//         }, err => {
//             response(res, null, err);
//         }
//     )

// }




module.exports = service;
