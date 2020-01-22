const request 	= require('supertest')
const jwt		= require('jsonwebtoken')
const mongoose	= require('mongoose')
const app 		= require('../src/app')
const User 		= require('../src/models/user')

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


beforeEach( async () => {
	await User.deleteMany() // delete all
	await new User(userOne).save() // seed db with one user account
})



test('Should sign up a new user', async () => {
	const response = await request(app).post('/users').send({
		name: 'Darrow',
		email: 'darrow@rr.com',
		password: 'BreakTheChains123!!'
	}).expect(201)

	//assert that the database was changed correcty

	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	// Assertions about the response
	expect(response.body).toMatchObject({
	 user: {
	 	name: 'Darrow'
	 },
	 token: user.tokens[0].token
	})
	console.log(user)

	expect(user.password).not.toBe('BreakTheChains123!!') // should be hash, not original
})

test('Should login existing user', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)

	//Assert second token in user in db is same as token in response body
	const user = await User.findById(userOneId)
	expect(user.tokens[1].token).toBe(response.body.token)
})

test('Logging in nonexistent user should fail', async () => {
	await request(app).post('/users/login').send({
		email: 'bademail@bademail.com',
		password: 'badpassword1223!'
	}).expect(400)
})

test('Should get profile info', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
})

test('Should not get profile info for unauthenticated user', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401)
})

test('Should delete account for user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	//Assert user no longer in db
	const user = await User.findById(userOneId)
	expect(user).toBeNull()
})
test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401)
})

test('Should upload an avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')	
		.expect(200)

	const user = await User.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Figment'
		})
		.expect(200)
})

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: 'philly'
		})
		.expect(400)
})
