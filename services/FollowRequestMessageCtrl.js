
var response = require('../response/response');
var MentorFollowers = require('../models/FollowRequestMessageSchema').model('MentorFollowers');
var StudentMessagesToMentor = require('../models/FollowRequestMessageSchema').model('StudentMessagesToMentor');
const UniqueIdGenerator = require('otp-generator');


var service = {}



//mentor follows

service.StartFollowing = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        studentEmail: params.studentEmail,
        studentName: params.studentName,
        startDate: Date.now()
    }

    var findQuery = {
        mentor: params.mentor,
        studentEmail: params.studentEmail,
    }

    // MentorFollowers.find(findQuery).then(
    //     doc => {
    //         if (doc.length == 0) {
    var inputFields = new MentorFollowers(query);
    inputFields.save().then(
        subdoc => {
            var data = {
                Data: subdoc,
                Message: "Request sent.",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )
    // } else {
    //     var data = {
    //         Data: doc,
    //         Message: "You are already sent a request.",
    //     }
    //     response(res, data, null);
    // }

    // }, err => {
    //     response(res, null, err);
    // })


}


service.getFollowers = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
    }
    if (params.requestAccepted) {
        query.requestAccepted = true;
    }
    if (params.requestRejected) {
        query.requestRejected = true;
    }

    if (params.unFollow) {
        query.unFollow = true;
    }

    if (params.requestAccepted == false) {
        query.requestAccepted = false;
    }
    if (params.requestRejected == false) {
        query.requestRejected = false;
    }

    MentorFollowers.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "List of Followers",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )
}


service.CheckFollowingOrNot = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        studentEmail: params.studentEmail,
        requestAccepted: params.requestAccepted
    }
    MentorFollowers.findOne(query).then(
        doc => {
            if (!doc) {
                var data = {
                    Data: doc,
                    Message: "Your Not Following!",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Your Already Following!",
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



service.UpdateFollowRequestOrRejected = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        mentor: params.mentor,
        studentEmail: params.studentEmail,
    }
    var query = {}
    if (params.requestAccepted) {
        query.requestAccepted = true;
    }
    if (params.requestRejected) {
        query.requestRejected = true;
    }

    if (params.unFollow) {
        query.unFollow = true;
    }

    MentorFollowers.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Failed!",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Success!",
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




service.unFollow = (req, res, next) => {
    var params = req.body;
    var query = {
        mentor: params.mentor,
        studentEmail: params.studentEmail,
    }
    MentorFollowers.findOneAndDelete(query).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "unfollow Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "unfollow Successfully !",
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



//message to mentor

service.SendMessage = (req, res, next) => {
    var params = req.body;
    var query = {
        messageId: Math.floor(100000000 + Math.random() * 900000000),
        senderMail: params.senderMail,
        senderName: params.senderName,
        receiverMail: params.receiverMail,
        receiverName: params.receiverName,
        message: params.message
    }
    var inputFields = new StudentMessagesToMentor(query);
    inputFields.save().then(
        doc => {
            var data = {
                Data: doc,
                Message: "Message send successfully",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}


service.GetMessages = (req, res, next) => {
    var params = req.body;
    var query = {}
    if (params.senderMail) {
        query.senderMail = params.senderMail;
    }
    if (params.receiverMail) {
        query.receiverMail = params.receiverMail;
    }
    if (params.read) {
        query.read = params.read;
    }
    StudentMessagesToMentor.find(query).then(
        doc => {
            var data = {
                Data: doc,
                Message: "Messages",
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}

service.updateMessageStatus = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        messageId: params.messageId,
    }
    var query = {
        read: true,
    }
    StudentMessagesToMentor.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Messages Read Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Messages Read Successfully !",
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


service.DeleteMessage = (req, res, next) => {
    var params = req.body;
    var query = {
        messageId: params.messageId,
    }
    StudentMessagesToMentor.findOneAndDelete(query).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Message Deleteing Failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Message Deleted Successfully !",
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