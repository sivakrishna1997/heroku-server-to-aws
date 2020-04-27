const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');
// validate: [{ validator: value => value.indexOf('@') != -1, msg: 'Invalid email.' }]
const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    trim: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    index: true,
    trim: true,
    unique: true
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true
  },
  signInMethod: {
    type: String,
    // required: true
  },
  profileUpdated: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  personal: {
    gender: { type: String },
    mobile: { type: Number },
    about: { type: String },
    dob: { type: Date },
    location: { type: String },
    mail: { type: String },
    // name: { type: String }
  },
  education: {
    college: { type: String },
    degree: { type: String },
    graduationYear: { type: Number },
    skills: [String]
  },
  work: {
    experienceLevel: String,
    yearsOfExperience: String,
    experiences: [],
    context:{
      type: String
    }
    // experiences: [
    //   {
    //     company: {
    //       type: String
    //     },
    //     duration: {
    //       start: {
    //         type: String
    //       }, end: {
    //         type: String
    //       },
    //       current: {
    //         type: Boolean
    //       }
    //     },
    //     role: {
    //       type: String
    //     },
    //     description: {
    //       type: String
    //     }
    //   }
    // ]
  },
  analysis: {
    type: Object
  },
  training: {
    type: Object
  },
  mentor: {
    timings: {
      start: { type: String },
      end: { type: String }
    },
    languagesTeach: [
      {
        language: {
          type: String
        }
      }
    ],
    context: "",
    classification: [[String]],
    jobType: {
      type: String
    },
    avgCost: {
      type: Number
    },
    reputation: {
      type: Number
    }
  },
  learningAssets: {
    interestedAreas: [String],
    financialAid: {
      type: Boolean
    },
    isOpportunities: {
      type: Boolean
    },
    opportunityType: {
      type: String
    }
  }
  // mentor: {
  //   timings: {
  //     start:{type:String },
  //     end: { type:String  }
  //   },  
  //   languagesTeach: [String],
  //   context: [String],
  //   classification: [[String]],
  //   jobType: String,
  //   avgCost: Number,
  //   reputation: Number
  // },
  // learningAssets: {
  //   interestedAreas: [String],
  //   financialAid: Boolean,
  //   isOpportunities: Boolean,
  //   opportunityType: [String]
  // }
});

const User = module.exports = mongoose.model('users', UserSchema);
module.exports = User;

module.exports.addUser = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function (usrPassword, hash, callback) {
  bcrypt.compare(usrPassword, hash, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}

module.exports.changeUserRole = function (userId, newRole, callback) {
  var query = { _id: mongoose.Types.ObjectId(userId) };
  User.findOneAndUpdate(query, { $set: { role: newRole } }, callback);
}

module.exports.getUserById = function (userId, callback) {
  var query = { _id: userId };
  User.findById(query, callback);
}

module.exports.getUserByUsername = function (query, callback) {
  // const query = { username: username  };
  User.findOne(query, callback);
}

module.exports.updateProfileByUsername = function (username, profile, callback) {
  const query = { username: username };
  let update = {
    personal: profile.personal,
    education: profile.education,
    work: profile.work,
    profileUpdated: true
  }
  if (profile.learningAssets) {
    update.learningAssets = profile.learningAssets;
  }
  if (profile.analysis) {
    update.analysis = profile.analysis;
  }
  if (profile.training) {
    update.training = profile.training;
  }
  User.findOneAndUpdate(query, { $set: update }, callback);
}

module.exports.getUsersByRole = function (role, callback) {
  const query = { role: role, profileUpdated: true };
  User.find(query, callback);
}

module.exports.filterUsers = function (query, callback) {
  User.find(query, callback);
}

module.exports.mailVerified = function (username, callback) {
  User.findOneAndUpdate({ username: username }, { verified: true }, callback);
}

module.exports.getMailVerificationStatus = function (username, callback) {
  User.find({ username }, callback);
}
