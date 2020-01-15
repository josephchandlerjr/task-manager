const express 				= require('express'),
	  User 					= require('../models/user'),
	  auth 					= require('../middleware/auth'),
	  multer				= require('multer'),
	  sharp					= require('sharp'),
	  { sendWelcomeEmail, sendCancelEmail }	= require('../emails/account');

const router = new express.Router();

const upload = multer({
	limits: {
		fileSize: 1000000  //1 MB
	},
	fileFilter: (req, file, cb) => {
		// cb(new Error('Please upload an image')); // reject with error message
		// cb(undefined, true);  // accept upload
		// cb(undefined, false), //silently reject upload
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			cb(new Error('Please upload an image file'));
		}
		cb(undefined, true);
	}
});

//INDEX -- now just returns current user logged in

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

//SHOW
// router.get('/users/:id', auth, async (req, res) => {
// 	try {
// 		const user = await User.findById(req.params.id);
// 		if(!user) return res.status(404).send();
// 		res.status(200).send(user);
// 	} catch (e) {
// 		res.status(500).send(e);
// 	}
// });

//CREATE
router.post('/users', async (req, res) => {
	try {
		const user = new User(req.body);	
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({user, token});
	} catch (e){
		res.status(400).send(e);
	}
});

//LOGIN
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.send({user, token});
	} catch (e) {
		res.status(400).send();
	}
});

//LOGOUT
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter( (token) => token.token !== req.token); // remember tokens is an array of objects, each with a 'token' propery
		await req.user.save();
		res.send(); // default status is 200
	} catch (e) {
		res.status(500).send();
	}
})

//LOGOUT ALL
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []; // remember tokens is an array of objects, each with a 'token' propery
		await req.user.save();
		res.send(); // default status is 200
	} catch (e) {
		res.status(500).send();
	}
})

//UPDATE
router.patch('/users/me', auth, async (req, res) => {
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const updates = Object.keys(req.body);
	const isValidOperation = updates.every( (prop) => allowedUpdates.includes(prop));
	if(!isValidOperation) return res.status(400).send({ error: 'Invalid Updates'});
	try {
		for (update of updates) 
			req.user[update] = req.body[update];
		req.user.save();
		res.send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
});

//DELETE
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove();
		sendCancelEmail(req.user.email, req.user.name)
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

//UPLOAD avatar image file
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
	const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
	req.user.avatar = buffer;

	await req.user.save();
	res.send();
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message});
});

//DELETE avatar image file
router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send();
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message});
});

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if(!user || !user.avatar){
			throw new Error();
		} 
		res.set('Content-Type', 'image/png');
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;