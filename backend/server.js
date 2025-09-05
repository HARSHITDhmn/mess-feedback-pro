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

// Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'mess-feedback-backend' }));

// DB + Server Setup
const { PORT = 5000 } = process.env;

// ⚠️ Fixed Mongo URI (Atlas)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://tyagishanu2016_db_user:4GyqVdzgc6pthWjd@cluster0.54uw5gr.mongodb.net/messFeedback?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Create default admin if not exists
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'HARSHIT1120';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'MANJUd12345';

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
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
