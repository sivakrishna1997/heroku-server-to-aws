var mongoose = require('mongoose');
var schema = mongoose.Schema;


var PaymentUserDetails = new schema({
    email: {
        type: String
    },
    username: {
        type: String
    },
    mobile: {
        type: Number
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },

    courseId: {
        type: Number
    },
    courseName: {
        type: String,
    },
    amount: {
        type: Number
    },
    TransactionId: {
        type: Number,
        required: true,
        unique: true
    }

});


// var GSTcollection = new schema({
//     GSTrate: {
//         type: Number
//     }
// })


var BeforeGotoPayment_UserDetails = new schema({
    email: {
        type: String
    },
    username: {
        type: String
    },
    mobile: {
        type: Number
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },

    courseId: {
        type: Number
    },
    courseName: {
        type: String,
    },
    amount: {
        type: Number
    },
    TransactionId: {
        type: Number,
        required: true,
        unique: true
    }
});



module.exports = mongoose.model('PaymentUserDetails', PaymentUserDetails);
// module.exports = mongoose.model('GSTcollection', GSTcollection);
module.exports = mongoose.model('BeforeGotoPayment_UserDetails', BeforeGotoPayment_UserDetails);