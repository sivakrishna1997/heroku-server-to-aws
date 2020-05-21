'use strict'


//The typical utilities required for having things working
// const fs = require('fs');
// const https = require('https');
// const http = require('http');
// const path = require('path');
// const randomstring = require('randomstring');
// const express = require('express');
const config = require('../config/twilio')
const videoSession = require('../models/twilioSchema')
var response = require('../response/response');

//Load configuration from .env config file
// require('dotenv').load();

//Import Twilio client library
const Twilio = require('twilio');

var AccessToken = Twilio.jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var videoCtrl = {};



// prepareCleanTermination()

// //Load launch options from command line
// var protocol = process.argv[3];
// if (!protocol || (protocol != 'http' && protocol != 'https')) {
//   protocol = 'http';
// }

// // var port = parseInt(process.argv[4]);
// if (!port || port < 1 || port > 65535) {
//   port = protocol == 'https' ? 8443 : 8080;
// }

// //Set up our web server
// var app = express();
// var publicpath = path.join(__dirname, "./public");
// app.use("/", express.static(publicpath));

// var server;

// if (protocol == 'https') {
//   var httpsOptions = {
//     key: fs.readFileSync('keys/server.key'),
//     cert: fs.readFileSync('keys/server.crt')
//   };
//   server = https.createServer(httpsOptions, app);
// } else {
//   server = http.createServer(app);
// }

// server.listen(port, function() {
//   console.log("Express server listening for " + protocol + " on *:" + port);
// });

// var io = require('socket.io')(server);

/*********************************************************************
INTERESTING STUFF STARTS BELOW THIS LINE
**********************************************************************/

const ACCOUNT_SID = config.ACCOUNT_SID; //Get yours here: https://www.twilio.com/console
const API_KEY_SID = config.API_KEY_SID; //Get yours here: https://www.twilio.com/console/video/dev-tools/api-keys
const API_KEY_SECRET = config.API_KEY_SECRET; //Get yours here: https://www.twilio.com/console/video/dev-tools/api-keys

const client = new Twilio(API_KEY_SID, API_KEY_SECRET, {
    accountSid: ACCOUNT_SID
});


videoCtrl.CreateVideoSession = (req, res, next) => {

    var Params = req.body;
    var createRoomObj = {
        type: 'group',
        uniqueName: Params.roomName,
        recordParticipantsOnConnect: true
    }

    client.video.rooms.create(createRoomObj).then(room => {
        var roomSid = room.sid;
        console.log('Room ' + room.uniqueName + ' created successfully');
        console.log('RoomSid=' + room.sid);
        console.log('Room ' + Params.roomName + ' ready to receive client connections');


        var accessToken = new AccessToken(
            ACCOUNT_SID,
            API_KEY_SID,
            API_KEY_SECRET
        );
        accessToken.identity = Params.userName;

        var grant = new VideoGrant();
        grant.room = Params.roomName;
        accessToken.addGrant(grant);

        var answer = {
            jwtToken: accessToken.toJwt(),
            roomName: Params.roomName
        }

        let NewSessionObj = {
            courseId: Params.courseId,
            batchId: Params.batchId,
            topicId: Params.topicId,
            subtopicId: Params.subtopicId,
            users: [Params.userName],
            admin: Params.userName,
            firebaseId: Params.hash,
            startedOn: Date.now(),
            roomName: Params.roomName,
            roomSId: room.sid,
            sessionToken: answer.jwtToken,
            videoTrack: {}
        }

        let newSession = new videoSession(NewSessionObj)
        newSession.save().then(
            doc => {
                console.log(doc);
                var data = {
                    Data: doc,
                    Message: "New Session Created Successfully",
                }
                response(res, data, null);
            }, err => {
                response(res, null, err);
            }
        )

    }).catch(err => {
        console.log('Error creating room ' + err);
        response(res, null, err);
        process.exit(-1);


    });

}




videoCtrl.createSessionToken = async function (roomName, userId) {
    var accessToken = new AccessToken(
        ACCOUNT_SID,
        API_KEY_SID,
        API_KEY_SECRET
    );
    accessToken.identity = userId;

    var grant = new VideoGrant();
    grant.room = roomName;
    accessToken.addGrant(grant);
    let token = accessToken.toJwt();
    return token;
}



videoCtrl.joinToSession = async (req, res, next) => {
    var params = req.body;
    var query = {
        courseId: params.courseId,
        status: 1
    }

    // videoSession.find({ $query: query, $orderby: { $natural: -1 } }).limit(1).then(
    videoSession.find(query).sort({ _id: -1 }).limit(1).then(
        doc => {
            console.log("doc====>", doc);
            if (doc.length != 0) {
                videoSession.findOneAndUpdate({ _id: doc[0]._id }, { $addToSet: { 'users': params.username } }).then(
                    async  Updateddoc => {
                        var token = await videoCtrl.createSessionToken(Updateddoc.roomName, params.username);
                        console.log("doc====::>", token);
                        var responseObj = {
                            _id: Updateddoc._id,
                            courseId: Updateddoc.courseId,
                            batchId: Updateddoc.batchId,
                            topicId: Updateddoc.topicId,
                            subtopicId: Updateddoc.subtopicId,
                            users: Updateddoc.users,
                            admin: Updateddoc.admin,
                            roomName: Updateddoc.roomName,
                            roomSId: Updateddoc.roomSId,
                            sessionToken: token
                        }
                        console.log("doc====::>", responseObj);

                        var data = {
                            Data: responseObj,
                            Message: "Session Joined Successfully",
                            Other: {
                                Success: true
                            }
                        }
                        response(res, data, null);

                    }, err => {
                        console.log(err);
                        response(res, null, err);
                    }
                )
            } else {
                var data = {
                    Data: doc,
                    Message: "Session is not started.",
                    Other: {
                        Success: false
                    }
                }
                response(res, data, null);
            }

        }, err => {
            console.log(err);
            response(res, null, err);
        }
    )

    // videoSession.findOneAndUpdate(query, { $addToSet: { 'users': params.username } }).then(
    //     doc => {
    //         console.log("doc====>",doc);

    //         doc.sessionToken = await videoCtrl.createSessionToken(doc.roomName, params.username);

    //         var data = {
    //             Data: doc,
    //             Message: "Session Joined Successfully",
    //         }
    //         response(res, data, null);

    //     }, err => {
    //         console.log(err);
    //         response(res, null, err);
    //     }
    // )

}


videoCtrl.EndVideoSession = (req, res, next) => {
    var params = req.body;
    var basedOn = {
        roomSId: params.roomSId,
    }
    var query = {
        status: 2,
    }
    videoSession.update(basedOn, { $set: query }).then(
        doc => {
            if (doc.n == 0) {
                var data = {
                    Data: doc,
                    Message: "Session endeing failed !",
                    Other: {
                        Success: false
                    }
                }
            } else {
                var data = {
                    Data: doc,
                    Message: "Session ended Successfully !",
                    Other: {
                        Success: true
                    }
                }
            }
            response(res, data, null);
        }, err => {
            response(res, null, err);
        }
    )

}






// var roomSid;
// var roomName = process.argv[2];
// if (!roomName) {
//     roomName = randomstring.generate(10);
// }


// console.log('Trying to create room ' + roomName);
// client.video.rooms
//     .create({
//         type: 'group',
//         uniqueName: roomName,
//         recordParticipantsOnConnect: true
//     })
//     .then(room => {
//         roomSid = room.sid;
//         console.log('Room ' + room.uniqueName + ' created successfully');
//         console.log('RoomSid=' + room.sid);
//         console.log('Room ' + roomName + ' ready to receive client connections');
//     })
//     .catch(error => {
//         console.log('Error creating room ' + error);
//         process.exit(-1);
//     });


// client.video.rooms.join()


// //AccessToken management
// //Twilio's utilities for having AccessTokens working.
// var AccessToken = Twilio.jwt.AccessToken;
// var VideoGrant = AccessToken.VideoGrant;

// io.on('connection', function (socket) {

//     //Client ask for an AccessToken. Generate a random identity and provide it.
//     socket.on('getAccessToken', function (msg) {

//         console.log("getAccessToken request received");

//         var userName;
//         if (msg && msg.userName) {
//             userName = msg.userName;
//         } else {
//             userName = randomstring.generate(20);
//         }

//         var accessToken = new AccessToken(
//             ACCOUNT_SID,
//             API_KEY_SID,
//             API_KEY_SECRET
//         );

//         accessToken.identity = userName;

//         var grant = new VideoGrant();
//         grant.room = roomName;
//         accessToken.addGrant(grant);

//         var answer = {
//             jwtToken: accessToken.toJwt(),
//             roomName: roomName
//         }

//         // var answer = {
//         //   jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzI1NWY0YjEwYmY1OTI4NjcwMGNjZTBmZWM5MzE0YjQ4LTE1ODg0NDk4ODMiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJrcmlzaDQiLCJ2aWRlbyI6eyJyb29tIjoiQ3B6bmVRcXcyNyJ9fSwiaWF0IjoxNTg4NDQ5ODgzLCJleHAiOjE1ODg0NTM0ODMsImlzcyI6IlNLMjU1ZjRiMTBiZjU5Mjg2NzAwY2NlMGZlYzkzMTRiNDgiLCJzdWIiOiJBQzNkNDg2ZjEyZmFmMDRmODg4NWUxNDc5OWYwNzNmNTYxIn0.icNywHpM6puxxnBa7al263ahErcxVuy8IYgvpeQfmWw',
//         //   roomName: "DemoRoom"
//         // }

//         console.log("JWT accessToken generated: " + answer.jwtToken + "\n");

//         socket.emit("accessToken", answer);
//     });
// });

/*This function makes the cleanup upon program termination. This cleaup includes
completing the room if it's still active. Otherwise, the room will stay alive
for 5 minutes after all participants disconnect.*/


// function prepareCleanTermination() {
//     process.stdin.resume(); //so the program will not close instantly
//     //do something when app is closing
//     process.on('exit', exitHandler.bind(null, {
//         cleanup: true
//     }));
//     //catches ctrl+c event
//     process.on('SIGINT', exitHandler.bind(null, {
//         exit: true
//     }));
//     //catches uncaught exceptions
//     process.on('uncaughtException', exitHandler.bind(null, {
//         exit: true
//     }));

//     function exitHandler(options, err) {
//         if (roomSid) {
//             client.video.rooms(roomSid)
//                 .update({
//                     status: 'completed'
//                 })
//                 .then(room => {
//                     console.log('Room ' + roomSid + ' completed');
//                     if (options.exit) process.exit();
//                 })
//                 .catch(error => {
//                     if (options.exit) process.exit();
//                 })
//         }
//     }
// }





module.exports = videoCtrl;