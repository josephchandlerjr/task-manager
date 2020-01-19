const express 		= require('express'),
	  app			= express(),
	  mongoose		= require('mongoose'),
	  userRouter 	= require('./routers/user'),
	  taskRouter	= require('./routers/task'),
	  port			= process.env.PORT;

mongoose.connect(process.env.MONGODBURL, {
	useNewUrlParser: true, 
	useCreateIndex: true,
	useUnifiedTopology: true
});

//comfigure app
app.use(express.json()); //parse body as json and provide via req.body
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));	



