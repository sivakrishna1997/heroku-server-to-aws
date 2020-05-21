var database = require('./database')
var mongoose = require('mongoose')


module.exports = () => {
    mongoose.set('useFindAndModify', false);
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.connect(database.url,
        function (err, connection) {
            if (err) {
                console.log('DB connection error', err);
            } else {
                console.log('Connected to DB ' ,);
            }
        });

    var db = mongoose.connection;

    return db;

}
// mongodb://${host}:${port}/${databaseName}
//  mongodb+srv://aimentrdb:aimentrdb@cluster0-nu2s3.mongodb.net/test?retryWrites=true&w=majority

// "mongodb+srv://dbUser:dbUser@cluster0-cxtxg.mongodb.net/test?retryWrites=true&w=majority"

// aimentrtest