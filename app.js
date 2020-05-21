var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
// const io = require('socket.io')(3001);
var bodyParser = require('body-parser');
var http = require('http');


var expressFileupload = require('express-fileupload');

// var s3 = require('./services/s3');
// var s3 = require('./config/s3/s3.config');

var mongoose = require('./config/mongoose');
var db = mongoose();

// Routes
var indexRouter = require('./routes/index');
var fileuploadrouts = require('./routes/fileUploadRouts')

var app = express();


// CORS INIT
app.use(cors());

app.use(logger('dev')); //for show console.logs 

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})





// Adding Passport to middleware.
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


// assign routers
app.use('/', indexRouter);



app.use(expressFileupload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use('/', fileuploadrouts);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});


app.listen(process.env.PORT || 5001);

// var server = http.createServer(app);
// const io = require('socket.io')(server);

// server.listen(process.env.PORT || 5001);
console.log("port connected 5001");



// io.on('connection', client => {
//   client.on('connect', () => {
//     io.emit('newUser', "connected");
//     console.log('socket backend connected')
//   })

//   client.on('disconnect', () => {
//     io.emit('userLeft', "disconnected");
//     console.log('socket backend disconnected')
//   })

//   client.on('message', (m) => {
//     // console.log('[server](message): %s', JSON.stringify(m));
//     io.emit('message', m);
//   })


//   client.on("NewClient", function () {
//     io.emit('CreatePeer');
//   });
//   client.on('Offer', (offer) => io.emit('BackOffer', offer));
//   client.on('Answer', (data) => io.emit('BackAnswer', data));
//   client.on('disconnect', () => io.emit('Disconnect'));
//   client.on('subtitleChanged', (data) => io.emit('subtitleChanged', data));

//   client.on('Drawing', (draw) => io.emit('Drawing', draw));
// })



module.exports = app;
