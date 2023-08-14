//const { myFunction } = require('./sample');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./api/UserRoutes');
const deliveryRoutes=require('./api/delivery/deliveryRoutes')
const path = require('path');

	
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api',userRoutes);
app.use('/api',deliveryRoutes)
app.use("/uploads",express.static("./uploads"));
const restaurantRoutes = require('./api/restaurant/restaurantRoutes');
const customerRoutes = require('./api/customer/customerRoutes');
const paymentRoutes = require('./api/PaymentRoutes');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', restaurantRoutes);
app.use('/api', customerRoutes);
app.use('/api', paymentRoutes);
app.use('/uploads', express.static('./uploads'));

app.listen(5001, () => {
	console.log('Server listening on port 5001');
});
