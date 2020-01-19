const express 		= require('express'),
	  app			= express(),
	  mongoose		= require('mongoose'),
	  userRouter 	= require('./routers/user'),
	  taskRouter	= require('./routers/task');

mongoose.connect(process.env.MONGODBURL, {
	useNewUrlParser: true, 
	useCreateIndex: true,
	useUnifiedTopology: true
});

//comfigure app
app.use(express.json()); //parse body as json and provide via req.body
app.use(userRouter);
app.use(taskRouter);


module.exports = app;

