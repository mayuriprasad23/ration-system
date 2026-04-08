require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const shopkeeperRoutes = require('./routes/shopkeeperRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shopkeeper', shopkeeperRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
  res.send('Backend Running ✅');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});