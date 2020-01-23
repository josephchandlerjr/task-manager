const jwt 		= require('jsonwebtoken')
const mongoose 	= require('mongoose')
const User 		= require('../../src/models/user')

const userOneId = new mongoose.Types.ObjectId() //generate our own token so we know what it is

const userOne = {
	_id: userOneId,
	name: 'Lyria',
	email: 'lyria@rr.com',
	password: 'Figment123!!',
	tokens: [{
		token: jwt.sign({ _id: userOneId }, process.env.JWTSECRET)
	}]
}

const seedDatase = async () => {
	await User.deleteMany() // delete all
	await new User(userOne).save() // seed db with one user account
}

module.exports = { seedDatase, userOne, userOneId }