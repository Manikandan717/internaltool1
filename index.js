import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import User from './routes/user.js';
import Analyst from './routes/analyst.js';
import Attendance from './routes/attendance.js';
import Billing from './routes/billing.js';
import Team from './routes/team.js';
import Task from './routes/task.js';
import AllEmployee from './routes/allEmployees.js';

const app = express();
const port = process.env.PORT || 5000;
dotenv.config();

// MongoDB connection
try {
  await mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB Atlas !!!');
} catch (err) {
  console.error('Error connecting to MongoDB:', err);
}

// Define a router for your routes
const router = express.Router();

// Apply middleware
router.use(cors());
router.use(express.json({ limit: '5000mb' }));
router.use(cookieParser());
router.use(express.urlencoded({ limit: '5000mb', extended: false }));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());

// Mount routes on the base URL
router.use('/authentication/user', User);
router.use('/analyst', Analyst);
router.use('/emp-attendance', Attendance);
router.use('/billing', Billing);
router.use('/team', Team);
router.use('/create', Task);
router.use('/allemp', AllEmployee);

// const baseURL = `${req.protocol}://${req.get(`host`)}`
// Mount the router at the base URL
const baseURL = 'https://d4x7gfwwblv6rqtceqlva5zjlq0mkbqd.lambda-url.us-east-1.on.aws';
app.use(baseURL, router);

export const handler = async (event, context) => {
  try {
    // You can handle different types of events here
    const eventType = event['httpMethod']; // Assuming it's an HTTP event

    if (eventType === 'POST') {
      // Handle POST event
      // const requestBody = JSON.parse(event['body']);
      const requestBody = event['body'] ? JSON.parse(event['body']) : {};
      // ... process the request body
    } else if (eventType === 'GET') {
      // Handle GET event
      // ... process the query parameters
    }

    // You can return a response based on the event handling
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Lambda function executed successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  } finally {
    // Close the MongoDB connection when the function execution is finished
    mongoose.connection.close();
  }
};

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server Running On Port : ${port}`);
});
