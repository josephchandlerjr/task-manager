const mongoose 		= require('mongoose'),
	  validator 	= require('validator'),
	  bcrypt		= require('bcryptjs'),
	  jwt			= require('jsonwebtoken'),
	  Task 			= require('./task');


const userSchema = new mongoose.Schema(
	{
	name: {
		type: String,
		required: true,
		trim: true
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if(value < 0) throw new Error('Age must be a positive number');
		}
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) throw new Error('You must provide a valid email address');
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 7,
		validate(value){
			if (validator.contains(value.toLowerCase(), 'password')) throw new Error("'password'? really?!");
		},
		trim: true
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps: true
});

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
});

	//hash password before saving
userSchema.pre('save', async function(next){ //must be standard function because `this` binding is important
	const user = this;
	if(user.isModified('password')){
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

// Delete user tasks when user is removed

userSchema.pre('remove', async function(next){
	const user = this;
	await Task.deleteMany({ owner: user._id });

	next()
});

userSchema.methods.generateAuthToken = async function () { //standard function because we need 'this' binding
	const user = this;
	const token = jwt.sign({_id: user._id.toString()}, process.env.JWTSECRET);
	user.tokens = user.tokens.concat({token});
	await user.save();

	return token;
}

userSchema.methods.toJSON = function() {
	const user = this;
	const userObj = user.toObject();
	delete userObj.password;
	delete userObj.tokens;
	delete userObj.avatar;
	return userObj;
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if(!user) throw new Error('Unable to login');
	const isMatch = await bcrypt.compare(password, user.password);
	if(!isMatch) throw new Error('Unable to login');
	return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


