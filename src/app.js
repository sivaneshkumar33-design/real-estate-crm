const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// app.use(cors());.
app.use(cors({
    origin: ['https://real-estate-crm-frontend-1-1f36mtqda-siva-27db.vercel.app', 'http://localhost:4200'],
    credentials: true
}));

app.use(express.json());


// Health check
app.get('/', (req, res) => {

    res.json({
        message: 'Real Estate CRM API is running'
    });

});


// APIs
app.use('/api/auth', authRoutes);

app.use('/api/leads', leadRoutes);

app.use('/api/users', userRoutes);

app.use('/api/properties', propertyRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/dashboard', dashboardRoutes);


app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });

});


module.exports = app;