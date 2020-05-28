const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
    email: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    username: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresOn: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: true
    },
})

const UserVerification = module.exports = mongoose.model('userVerification', UserVerificationSchema);

module.exports.FindUser = function (email, callback) {
    UserVerification.find({ email: email }, callback);
}

module.exports.FindUserVerificationCompleted = function (email, callback) {
    UserVerification.find({ email: email , verified:true }, callback);
}

module.exports.SaveUserData = function (params, _callback) {
    // const query = {username: username, otp: otp};
    // UserVerification.find(query, _callback);
    var inputfields = new UserVerification(params)
    inputfields.save({}, _callback);
}

module.exports.UpdateUserOtp = function (obj, callback) {
    UserVerification.findOneAndUpdate({ email: obj.email }, { $set: { otp: obj.otp, expiresOn: obj.expiresOn } }, callback);
}

module.exports.isValidOtp = function (email, otp, _callback) {
    const query = { email: email, otp: otp };
    UserVerification.find(query, _callback);
}

module.exports.mailVerified = function (email, callback) {
    UserVerification.findOneAndUpdate({ email: email }, { verified: true }, callback);
}