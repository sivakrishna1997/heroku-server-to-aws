var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ForgotPassword = new Schema({

    UrlId: {
        type: String
    },
    Email: {
        type: String
    },
    DateAndTime: {
        type: Date
    }

});


module.exports = mongoose.model('ForgotPassword', ForgotPassword);




