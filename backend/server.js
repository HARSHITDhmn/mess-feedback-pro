const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');   // ✅ For verifying reCAPTCHA with Google

const Admin = require('./models/Admin');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🛡️ Rate Limiting: Max 5 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,
    message: { error: "Too many requests. Please try again later." }
});
app.use(limiter);

// 🛡️ Middleware: reCAPTCHA verification
const verifyCaptcha = async (req, res, next) => {
    try {
        const token = req.body.token;   // ✅ Frontend must send { token: "..." }
        if (!token) {
            return res.status(400).json({ error: "Missing reCAPTCHA token" });
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
            { method: "POST" }
        );
        const data = await response.json();

        if (!data.success) {
            console.error("Captcha failed:", data);
            return res.status(400).json({ error: "Failed CAPTCHA verification" });
        }

        next(); // ✅ pass control if valid
    } catch (err) {
        console.error("CAPTCHA error:", err);
        res.status(500).json({ error: "Server error verifying CAPTCHA" });
    }
};

// 🛡️ Middleware to validate and sanitize complaint submissions
const validateComplaint = [
    body('complaint')
        .isLength({ min: 1, max: 200 })
        .withMessage('Complaint must be between 1 and 200 characters.')
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
app.use(
    '/api/complaints',
    (req, res, next) => {
        if (req.method === 'POST') {
            return verifyCaptcha(req, res, () =>
                validateComplaint[0](req, res, () =>
                    validateComplaint[1](req, res, next)
                )
            );
        }
        next();
    },
    require('./routes/complaints')   // ✅ Using CommonJS
);

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'mess-feedback-backend' }));

// DB + Server Setup
const { MONGO_URI = 'mongodb://127.0.0.1:27017/messFeedback', PORT = 5000 } = process.env;

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
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
