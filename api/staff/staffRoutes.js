const path = require('path');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
router.use(express.json());
router.post('/test', async (req, res) => {
	User.findAll().then((result)=>{
        res.send(result)
    })
	//res.send('dsfdsfnd');


});

module.exports = router;
