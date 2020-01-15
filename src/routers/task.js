const express 	= require('express'),
 	  Task 		= require('../models/task'),
 	  auth		= require('../middleware/auth');


const router = new express.Router();


//INDEX  
//GET tasks?completed=true
//GET tasks?skip=0
//GET tasks?limit=50
//GET tasks?sortBy=createdAt:desc 
router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};
	if(req.query.sortBy) {
		let [sortProp, sortOrder] = req.query.sortBy.split(':')
		sort[sortProp] = sortOrder === 'desc' ? -1 : 1;
	}

	if(req.query.completed){
		match.completed = req.query.completed === 'true'
	} 
	try {
		// const allTasks = await Task.find({owner: req.user._id});
		// res.status(200).send(allTasks);

		await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate();
		res.send(req.user.tasks);
	} catch (e) {
		res.status(500).send(e);
	}
});

//SHOW
router.get('/tasks/:id', auth, async (req, res) => {
	try {

		const task = await Task.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if(!task) return res.status(404).send(task);
		res.status(200).send(task)
	} catch (e) {
		res.status(500).send(e);
	}
	
});

//CREATE
router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

//UPDATE
router.patch('/tasks/:id', async (req, res) => {
	const allowedUpdates = ['description', 'completed'];
	const updates = Object.keys(req.body);
	const isValidOperation = updates.every( (prop) => allowedUpdates.includes(prop));
	if(!isValidOperation) return res.status(400).send('Invalid updates')
	try {
		const task = await Task.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!task) return res.status(404).send();
		for( let update of updates){
			task[update] = req.body[update];
		}
		const newTask = await task.save();
		
		res.send(newTask);
	} catch (e) {
		res.status(400).send(e);
	}
});

//DELETE
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!task) return res.status(404).send();
		res.send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
