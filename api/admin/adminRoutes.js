const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
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
module.exports = router;
