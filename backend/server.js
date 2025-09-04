const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const Admin = require('./models/Admin');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🛡️ Rate Limiting: Max 5 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,              // limit each IP to 5 requests per windowMs
    message: { error: "Too many requests. Please try again later." }
});
app.use(limiter);

// 🛡️ Middleware to validate and sanitize complaint submissions
const validateComplaint = [
    body('message')
        .isLength({ min: 1, max: 200 })
        .withMessage('Message must be between 1 and 200 characters.')
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Routes
// Attach validation to complaints POST route
app.use('/api/complaints', (req, res, next) => {
    if (req.method === 'POST') {
        return validateComplaint[0](req, res, () => validateComplaint[1](req, res, next));
    }
    next();
}, require('./routes/complaints'));

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'mess-feedback-backend' }));

const { MONGO_URI = 'mongodb://127.0.0.1:27017/messFeedback', PORT = 5000 } = process.env;

// Database & Server Setup
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB connected');

        // Create default admin if not exists
        const username = process.env.DEFAULT_ADMIN_USERNAME || 'HARSHIT';
        const password = process.env.DEFAULT_ADMIN_PASSWORD || 'MANJUd12345@@';

        const existing = await Admin.findOne({ username });
        if (!existing) {
            const hashed = await bcrypt.hash(password, 10);
            await Admin.create({ username, password: hashed });
            console.log('Default admin created ->', username);
        } else {
            console.log('Default admin exists ->', username);
        }

        // Start server
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
