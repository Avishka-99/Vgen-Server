const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const community = require('../../models/communitySchema');
const communityResponse = require('../../models/community_responseSchema');
router.post('/registercommunity', async (req, res) => {
	const image_name = req.body.name;
	const community_name = req.body.communityName;
	const description = req.body.communityDescription;
	const user_id = req.body.user_id;
	const visibility = req.body.visibility;
	fs.writeFile('./uploads/community/' + image_name, req.body.image, 'base64', (err) => {
		if (err) throw err;
	}).then((result) => {
		community
			.create({
				name: community_name,
				date: new Date().toISOString().slice(0, 10),
				time: new Date().toLocaleString().split(',')[1].substr(0, 9),
				description: description,
				eventOrganizerId: user_id,
				visibility: visibility,
				image: image_name,
			})
			.then((response) => {
				const communityId = response.dataValues.communityId;
				const path = './data/users/' + user_id + '.json';
				const fileData = fs.readFileSync(path);
				console.log(JSON.parse(fileData));
				const config = {foods: JSON.parse(fileData).foods, stores: data, communities: JSON.parse(fileData).communities};
				//console.log(config)
				// const config = {stores: [], foods: []};
				try {
					fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
					console.log('Data successfully saved to disk');
				} catch (error) {
					console.log('An error has occurred ', error);
				}
				const userId = user_id;
				console.log(typeof community_id);
				communityResponse
					.create({
						userId: userId,
						communityId: communityId,
					})
					.then((response_2) => {
						console.log(response);
						res.send('success');
					});
			});
	});
	//console.log(req.body.data);
});
module.exports = router;
