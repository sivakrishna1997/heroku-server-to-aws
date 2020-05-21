const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    users: {
        type: [String],
        required: true
    },
    status: {
        type: Number,
        required:true,
        default: 1
    },
    admin: {
        type: String,
        required: true,
        index: true
    },
    startedOn: {
        type: Date,
        required: true
    },
    endsOn: {
        type: Date
    },
    firebaseId: {
        type: String,
        required: true
    }
})

const Session = mongoose.model('sessions', SessionSchema);

module.exports = Session;

// Queries
module.exports.addUserToSession = function(courseId, user, _callback) {
    // let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
    // Session.findOneAndUpdate(query, {$push: {'users': user}}, _callback);
    return new Promise((resolve, reject) => {
        let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
        Session.findOneAndUpdate(query, {$addToSet: {'users': user}}, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: "not found any session", val}); 
        })
    })
}

module.exports.removeUserFromSession = function(sessionId, user, _callback) {
   // let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
    // Session.findOneAndUpdate(query, {$pull: {'users': user}}, _callback); 
    return new Promise((resolve, reject) => {
        let query = {_id: mongoose.Types.ObjectId(sessionId), status: 1};
        Session.findByIdAndUpdate(query, {$pull: {'users': user}}, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: "Not found any session", val}); 
        })
    })
}

module.exports.updateSession = function(courseId, sessionStatus, _callback) {
    // let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
    // Session.findOneAndUpdate(query, {$set: {status: sessionStatus}}, _callback);
    return new Promise((resolve, reject) => {
        let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
        Session.findOneAndUpdate(query, {$set: {status: sessionStatus}}, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: "not found any session", val}); 
        })
    })
}

module.exports.endSession = function(sessionId, date, _callback) {
    return new Promise((resolve, reject) => {
        let status = 2;
        let query = {_id: mongoose.Types.ObjectId(sessionId), status: 1};
        Session.findOneAndUpdate(query, {$set: {status: status, endsOn: date}}, (err, isUpdated) => {
            if(!!err) reject(err);
            if(!!isUpdated) resolve(isUpdated);
            reject({message: 'Not Found and session', data: isUpdated});
        })
    })
}

module.exports.activeUsers = function(courseId, _callback) {
    // let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
    // Session.find(query, {$project: {status: 0}}, _callback);
    return new Promise((resolve, reject) => {
        let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1};
        Session.findOne(query, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: "not found any session", val}); 
        })
    })
}

module.exports.isAdminForSession = function(sessionId, userId, _callback) {
    return new Promise((resolve, reject) => {
        let query = {_id: mongoose.Types.ObjectId(sessionId), admin: userId, status: 1};
        Session.findOne(query, {}, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: "Not found any session"+ err, val}); 
        })
    })
}

module.exports.validUser = function(sessionId, userId, _callback) {
    // return new Promise((resolve, reject) => {
    let query = {_id: mongoose.Types.ObjectId(sessionId), status: 1, $or: [{users: userId}, {admin: userId}]};
    Session.findOne(query, _callback); 
        // Session.findOne(query, (err, val) => {
        //     console.log("valid User:: ",err, val);
        //     if(err) reject(err);
        //     if(!!val) {
        //         console.log("not coming here");
        //         resolve(val);
        //     }else {
        //         console.log("Coming here");
        //         reject({msg: 'Not Valid user', val});
        //     }
        // })
    // })
}

// Check Course Status
module.exports.checkSessionStatus = function(courseId, _callback) {
    return new Promise((resolve, reject) => {
        let query = {courseId: mongoose.Types.ObjectId(courseId), status: 1}
        Session.findOne(query, (err, val) => {
            if(err) reject(err);
            if(!!val) resolve(val);
            reject({msg: 'No Session found for course', val});
        })
    })
}