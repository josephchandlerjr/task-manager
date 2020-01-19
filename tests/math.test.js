const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../src/math')

test('Should calculate total with tip', () => {
	const total = calculateTip(10, .3)
	// if (total !== 13) throw new Error('total with tip should be 13 but we got ' + total)

	expect(total).toBe(13)
})

test('Should calculate total with default tip', () => {
	const total = calculateTip(100)
	expect(total).toBe(125)
})

test('Should convert 32 F to 0 C', () => {
	const result = fahrenheitToCelsius(32)
	expect(result).toBe(0)
})
test('Should convert 0 C to 32 F', () => {
	const result = celsiusToFahrenheit(0)
	expect(result).toBe(32)
})

// test('Async test demo', (done) => {
// 	setTimeout( ()=>{
// 		expect(1).toBe(3)
// 		done()
// 	}, 2000)	
// })

test('promise based async function', (done) => {
	add(2,3).then( (sum) => {
		expect(sum).toBe(5)
		done();
	})
})

// more common to use asyn/await
test('should add two numbers async/await', async () => {
	const sum = await add(2,3)
	expect(sum).toBe(5)
})