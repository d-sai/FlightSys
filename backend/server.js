const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const courseRoutes = require('./routes/courseRoutes');
const taskRoutes = require('./routes/taskRoutes');

const studentRoutes = require('./routes/studentRoutes');

const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

app.use('/api/users', authRoutes);

app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/student', studentRoutes);

app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
