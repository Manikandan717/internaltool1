import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import moment from 'moment';

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
const URI = process.env.ATLAS_URI;
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB Atlas !!!');
});

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

// Mount the router at the base URL
const baseURL = 'https://d4x7gfwwblv6rqtceqlva5zjlq0mkbqd.lambda-url.us-east-1.on.aws';
app.use(baseURL, router);

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server Running On Port : ${port}`);
});
