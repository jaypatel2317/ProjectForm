const mongoose = require('mongoose');
const faker = require('@faker-js/faker').faker;
const connectDB = require('./db');
const { Student, Course, Subject, Teacher } = require('./models');

async function seedDatabase() {
    await connectDB(); // Connect to MongoDB

    // Clear previous data
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});

    console.log('📌 Old Data Cleared');

    // Define courses and store their ObjectIds
    const courses = [
        await Course.create({ course_name: "Computer Systems Technology" }),
        await Course.create({ course_name: "Project Management" })
    ];

    console.log('📚 Courses Created');

    // Generate Teachers (10 Entries)
    const teachers = [];
    for (let i = 1; i <= 10; i++) {
        const teacher = await Teacher.create({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            middle_name: faker.person.middleName(),
            email_id: faker.internet.email()
        });
        teachers.push(teacher); // ✅ Store ObjectId properly
    }

    console.log('👨‍🏫 Teachers Created');

    // Generate Subjects (15 per course, total 30)
    const subjects = [];
    for (let i = 1; i <= 15; i++) {
        subjects.push(await Subject.create({
            subject_code: `CST${i}`,
            subject_name: faker.word.noun() + " Subject",
            course_id: courses[0]._id, // ✅ Using ObjectId reference
            teacher_id: faker.helpers.arrayElement(teachers)._id // ✅ Using ObjectId reference
        }));

        subjects.push(await Subject.create({
            subject_code: `PM${i}`,
            subject_name: faker.word.noun() + " Subject",
            course_id: courses[1]._id, // ✅ Using ObjectId reference
            teacher_id: faker.helpers.arrayElement(teachers)._id // ✅ Using ObjectId reference
        }));
    }

    console.log('📖 Subjects Created');

    // Generate Students (10 Entries, 9-digit student_id)
    for (let i = 1; i <= 10; i++) {
        await Student.create({
            student_id: faker.number.int({ min: 100000000, max: 999999999 }), // 9-digit ID
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            middle_name: faker.person.middleName(),
            date_of_enrolment: faker.date.past(),
            expected_date_of_completion: faker.date.future(),
            course_id: i <= 5 ? courses[0]._id : courses[1]._id, // ✅ Using ObjectId reference
            campus: faker.location.city()
        });
    }

    console.log('🎓 Students Created');
    mongoose.connection.close(); // Close DB Connection
}

seedDatabase();
