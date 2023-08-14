const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./api/UserRoutes');
const deliveryRoutes = require('./api/delivery/deliveryRoutes');
const restaurantRoutes = require('./api/restaurant/restaurantRoutes');
const customerRoutes = require('./api/customer/customerRoutes');

const farmerRoutes = require('./api/farmer/farmerRoutes');

const paymentRoutes = require('./api/PaymentRoutes');
const adminRoutes = require('./api/admin/adminRoutes');

const path = require('path');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', userRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', restaurantRoutes);

app.use('/api', farmerRoutes);

app.use('/api', customerRoutes);
app.use('/api', paymentRoutes);
app.use('/api', adminRoutes);

app.use('/uploads', express.static('./uploads'));

app.listen(5001, () => {
	console.log('Server listening on port 5001');
});
