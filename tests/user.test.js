const request 	= require('supertest')
const app 		= require('../src/app')
const User 		= require('../src/models/user')


beforeEach( async () => {
	await User.deleteMany() // delete all
})



test('Should sign up a new user', async () => {
	await request(app).post('/users').send({
		name: 'Darrow',
		email: 'darrow@rr.com',
		password: 'BreakTheChains123!!'
	}).expect(201)
})