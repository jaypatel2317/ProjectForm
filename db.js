const mongoose = require('mongoose');

// MongoDB Connection URI (Local or Cloud)
const MONGO_URI = 'mongodb://127.0.0.1:27017/schoolDB'; // Local MongoDB
// const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/schoolDB'; // MongoDB Atlas

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error);
        process.exit(1); // Stop the app if connection fails
    }
};

module.exports = connectDB;
