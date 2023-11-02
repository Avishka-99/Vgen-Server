const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
router.use(express.json());
const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
const Restaurant = require('../../models/restaurant_managerSchema');
const order = require('../../models/ordersSchema');
const place_order = require('../../models/place_orderSchema');
const category = require('../../models/categorySchema');
const multer = require('multer');
const product = require('../../models/productSchema');

router.get('/fetchstaff', async (req, res) => {
	User.findAll({
		where: {
			status: 'verified',
			userRole: 'Staff',
			// userId: restaurant.resturantManagerId,
		},
	}).then((result) => {
		res.send(result);
	});
});
router.get('/getOrder_recent', async (req, res) => {
	try {
	  const orders = await order.findAll({
		order: [['orderId', 'DESC']],
		limit: 10,
	  });
  
	  const orderIds = orders.map(order => order.orderId);
  
	  const place_orders = await place_order.findAll({
		where: {
		  orderId: orderIds,
		},
	  });
  
	  const restaurantManagerIds = place_orders.map(place_order => place_order.resturantManagerId);
	  const userIds = place_orders.map(place_order => place_order.userId);
  
	  const restaurants = await Restaurant.findAll({
		where: {
		  resturantManagerId: restaurantManagerIds,
		},
	  });
  
	  const users = await User.findAll({
		where: {
		  userId: userIds,
		},
	  });
	  
  
	  // Merge all data into a single array
	  const joinedData = place_orders.map(place_order => {
		const orderData = orders.find(order => order.orderId === place_order.orderId);
		const restaurantData = restaurants.find(restaurant => restaurant.resturantManagerId === place_order.resturantManagerId);
		const userData = users.find(user => user.userId === place_order.userId);
		return {
		  PlaceOrder: place_order,
		  Order: orderData,
		  Restaurant: restaurantData,
		  User: userData,
		};
	  });
  
	  res.send(joinedData);
	  console.log(joinedData);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  });
  //get total count of orders	
  router.get('/getOrder_count', async (req, res) => {
	try {
	  const orders = await order.findAll({
		order: [['orderId', 'DESC']],

	  });
	  res.send(orders);
	  console.log(orders);
	} catch (error) {
			
console.error(error);
	res.status(500).send('Internal Server Error');
	}
	  }	);
 router.get('/completed_order', async (req, res) => {
  try{
	const orders = await order.findAll({
	  where: {
		orderState: 3,
	  },
  }
  );
  res.send(orders);
  console.log(orders);
} catch (error) {
	console.error(error);
	res.status(500).send('Internal Server Error');
  }
}
);
router.get('/get_deliveryperson', async (req, res) => {
	try {
	  const users = await User.findAll({
		where: {
		  userRole: 'deliveryPerson',
		},
	  });
	  res.send(users);
	  console.log(users);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  });
  router.get('/get_delivery', async (req, res) => {
	const userId = req.query.userId;
	try {
	  const users = await User.findAll({
		where: {
		  userId: userId,
		},
	  });
	  res.send(users);
	  console.log(users);
	}
	catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  });
  
router.get('/get_category', async (req, res) => {

	try {
	  const categorys = await category.findAll({
	  });
	  res.send(categorys);
	  console.log(categorys);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  
});
const storage1 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/thumbnails');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload1 = multer({storage: storage1});


router.post('/add_category',upload1.single('image'), async (req, res) => {
	const name = req.body.name;
	const image = req.file.filename;

	try {
	  const categorys = await category.create({
		name: name,
		image: image,
	  });
	  res.send(categorys);
	  console.log(categorys);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
});
const { Op } = require('sequelize'); // Import Sequelize's operators

router.get('/get_foods', async (req, res) => {
	const name = req.query.name;
	try {
	  const products = await product.findAll({
		where: {
		  row_category: name,
	  },
	  });
	  res.send(products);
	  console.log(products);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal Server Error');
	}
  }
  );	



 
  
  
  



module.exports = router;
