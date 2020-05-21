const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSessions = new Schema({
    courseId: {
        type: String,
        required: true,
        index: true
    },
    batchId:{
        type: String,
    },
    topicId: {
        type: String,
    },
    subtopicId: {
        type: String,
    },
    users: {
        type: [String],
    },
    status: {
        type: Number,
        default: 1
    },
    admin: {
        type: String,
        index: true
    },
    startedOn: {
        type: Date,
    },
    endsOn: {
        type: Date
    },
    firebaseId: {
        type: String,
    },
    roomName: {
        type: String
    },
    roomSId: {
        type: String
    },
    sessionToken: {
        type: String,
    },
    videoTrack: {
        type: Object
    }
})

module.exports = mongoose.model('VideoSessions', VideoSessions);
