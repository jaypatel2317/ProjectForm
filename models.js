const mongoose = require('mongoose');

// Student Schema
const studentSchema = new mongoose.Schema({
    student_id: { type: Number, unique: true },
    first_name: String,
    last_name: String,
    middle_name: String,
    date_of_enrolment: Date,
    expected_date_of_completion: Date,
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    campus: String
});

// Course Schema
const courseSchema = new mongoose.Schema({
    course_name: { type: String, required: true }
});


// Subject Schema
const subjectSchema = new mongoose.Schema({
    subject_code: { type: String, unique: true },
    subject_name: String,
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    middle_name: String,
    email_id: String
});

// Models
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = { Student, Course, Subject, Teacher };
