const User = require('../models/users');

var service = {
    formatUser: formatUser
}

module.exports = service;

function getUserInfoByUsername(username) {
    User.getUserByUsername(username, (err, user) => {
        if(err) {

        }else {

        }
    })
}

function formatUser(user){
    let obj = {
        userId: user._id,
        ...user._doc
    }
    delete obj.password;

    if(!obj.personal) {
        obj.personal = {};
    }

    if(!obj.education) {
        obj.education = {}
    }

    if(!obj.work) {
        obj.work = {};
    }
    if(!obj.mentor) {
        obj.mentor = {};
    }

    if(!obj.learningAssets) {
        obj.learningAssets = {};
    }

    if(!obj.analysis) {
      obj.analysis = {}
    }

    if(!obj.training) {
      obj.training = {};
    }

    obj.steps = {
        personal: obj.personal,
        education: obj.education,
        work: obj.work,
    }
    if(user.role == 3) {
        obj.steps.learningAssets = obj.learningAssets;
    } else {
        // obj.steps.mentor = obj.mentor;
        obj.steps.analysis = obj.analysis;
        obj.steps.training = obj.training;
    }

    delete obj.mentor;
    delete obj.steps.mentor;
    delete obj.learningAssets;
    delete obj.personal;
    delete obj.work;
    delete obj.education;
    delete obj.analysis;
    delete obj.training;

    return obj;
}
