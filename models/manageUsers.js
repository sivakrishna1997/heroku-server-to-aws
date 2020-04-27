const mongoose = require('mongoose');

const UserCompletedOfflineVideos = mongoose.Schema({

    email: {
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
        type: Number
    },
    subTopicName: {
        type: String,
    },

})


module.exports = mongoose.model('UserCompletedOfflineVideos', UserCompletedOfflineVideos);
