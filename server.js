const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');  // ✅ Import Puppeteer
const { Student, Course, Subject, Teacher } = require('./models');

const app = express();
const PORT = 3000;

// ✅ Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/schoolDB', {})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Failed:', err));

app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'home.html'));
});

// ✅ Fetch and Fill Selected Form
app.post('/fetch-student', async (req, res) => {
    console.log("📌 Received request for /fetch-student");
    const { studentId, formType } = req.body;
    
    try {
        const student = await Student.findOne({ student_id: studentId }).populate('course_id');
        if (!student) return res.status(404).json({ error: '❌ Student ID Not Found!' });

        const course = await Course.findById(student.course_id);
        if (!course) return res.status(404).json({ error: '❌ Course not found!' });

        const subjects = await Subject.find({ course_id: course._id })
            .populate({ path: 'teacher_id', model: 'Teacher', options: { strictPopulate: false } });

        const formPaths = {
            "academic-status": "academic status form.html",
            "out-of-sequence": "out of sequence studies.html",
            "program-adjustment": "program adjustment form.html"
        };
        const formPath = formPaths[formType] ? path.join(__dirname, 'Public', formPaths[formType]) : null;

        if (!formPath) return res.status(400).json({ error: '❌ Invalid form selection.' });

        fs.readFile(formPath, 'utf8', (err, formHtml) => {
            if (err) return res.status(500).json({ error: '❌ Error loading the form.' });

            let filledForm = formHtml
                .replace(/{{FIRST_NAME}}/g, student.first_name)
                .replace(/{{LAST_NAME}}/g, student.last_name)
                .replace(/{{STUDENT_ID}}/g, student.student_id)
                .replace(/{{STUDENT_NAME}}/g, `${student.first_name} ${student.last_name}`)
                .replace(/{{COURSE_NAME}}/g, course.course_name)
                .replace(/{{CAMPUS}}/g, student.campus)
                .replace(/{{EXPECTED_COMPLETION}}/g, student.expected_date_of_completion.toISOString().split('T')[0])
                .replace(/{{TODAY_DATE}}/g, new Date().toISOString().split('T')[0]);

            let courseListHtml = subjects.map((subject, index) => `
                <tr>
                    <td><input type="text" name="course-code${index + 1}" value="${subject.subject_code}" readonly></td>
                    <td><input type="text" name="course-name${index + 1}" value="${subject.subject_name}" readonly></td>
                    <td><input type="text" name="semester${index + 1}" value="Semester ${index + 1}" readonly></td>
                    <td><input type="text" name="hours${index + 1}" value="3" readonly></td>
                </tr>
            `).join('');
            filledForm = filledForm.replace(/{{COURSE_LIST}}/g, courseListHtml);

            let subjectHtml = subjects.map((subject, index) => `
                <p><strong>Subject ${index + 1}:</strong> ${subject.subject_name} (${subject.subject_code})</p>
                <p><strong>Teacher:</strong> ${subject.teacher_id?.first_name || ''} ${subject.teacher_id?.last_name || ''}</p>
            `).join('');
            filledForm = filledForm.replace('{{SUBJECTS}}', subjectHtml);

            res.json({ filledForm });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ An error occurred while fetching data.' });
    }
});

// ✅ Generate PDF using Puppeteer
app.post('/generate-pdf', async (req, res) => {
    try {
        const { formHtml } = req.body;
        if (!formHtml) return res.status(400).json({ error: '❌ No form data provided.' });

        const browser = await puppeteer.launch({ headless: "new" });  // ✅ Use latest headless mode
        const page = await browser.newPage();

        await page.setContent(formHtml, { waitUntil: "networkidle0" });  // ✅ Ensure content loads fully

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true  // ✅ Ensures styles are applied
        });

        await browser.close();

        // ✅ Correct Headers for PDF Response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=Student_Form.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);

        res.end(pdfBuffer);
    } catch (error) {
        console.error("❌ PDF Generation Error:", error);
        res.status(500).json({ error: "Error generating PDF" });
    }
}); 
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
