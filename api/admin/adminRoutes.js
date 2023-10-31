const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
router.use(express.json());
const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
const Categories = require('../../models/categorySchema');
const sequelize = require('../../models/db');

router.post('/fetchstaff', async (req, res) => {
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

router.post('/fetchallcategories',async(req,res)=>{
	const user = req.body.userid;
	console.log(user)
	Categories.findAll().then((result)=>{
		res.send(result)
	})
	// sequelize.query("SELECT * FROM categories").then((result)=>{
	// 	console.log(result)
	// 	res.send(result)
	// })
	//res.send('hello')
})
router.post('/fetchallfoods',async(req,res)=>{
	res.send('hello')
})
module.exports = router;
