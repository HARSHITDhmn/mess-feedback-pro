const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'mess-feedback-backend' }));

const { MONGO_URI = 'mongodb://127.0.0.1:27017/messFeedback', PORT = 5000 } = process.env;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('MongoDB connected ✅');

    // create default admin if not exists
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'HARSHIT';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'MANJUd12345@@';

    const existing = await Admin.findOne({ username });
    if (!existing) {
        const hashed = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hashed });
        console.log('✅ Default admin created ->', username);
    } else {
        console.log('ℹ Default admin exists ->', username);
    }

    // Start server only after DB connected
    app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});
