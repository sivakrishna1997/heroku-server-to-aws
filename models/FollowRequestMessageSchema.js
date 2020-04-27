const mongoose = require('mongoose');

const MentorFollowers = mongoose.Schema({
    mentor: {
        type: String,
    },
    studentEmail: {
        type: String,
    },
    studentName: {
        type: String
    },
    requestAccepted: {
        type: Boolean,
        default: false
    },
    requestRejected: {
        type: Boolean,
        default: false
    },
    unFollow: {
        type: Boolean,
        default: false
    },
    startDate :{
        type:String
    }
})

const StudentMessagesToMentor = mongoose.Schema({
    messageId: {
        type: Number,
        unique: true,
    },
    senderMail: {
        type: String,
    },
    senderName: {
        type: String,
    },
    receiverMail: {
        type: String,
    },
    receiverName: {
        type: String,
    },
    message: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false
    },

})






module.exports = mongoose.model('MentorFollowers', MentorFollowers);
module.exports = mongoose.model('StudentMessagesToMentor', StudentMessagesToMentor);

