const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.type.ObjectId,
        required: true
    },
    syllabus: [
        {
            topic: String,
            description: String,
            subtopics: [String]
        }        
    ],
    videos: [String] // File Path where video was stored.
    // sessions: {
    //     type: 
    // }
})

const Syllabus = mongoose.model('syllabus', SyllabusSchema);

module.exports = Syllabus;


module.exports.getSyllabusForCourse = function(courseId, callback) {
    const query = {courseId: mongoose.Types.ObjectId(courseId)}
    Syllabus.find(query, callback);
}