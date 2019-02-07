const {test} = require('ava');

const combinatoire = require('../index.js')
const combinatoireAsync = combinatoire.async;
test('simple usage', t => {
	t.deepEqual(combinatoire({
		props : {
			color1 : ['white', 'yellow'],
			color2 : ['black', 'grey']
		}
	}),[
		{color1: 'white', color2: 'black'},
		{color1: 'white', color2: 'grey'},
		{color1: 'yellow', color2: 'black'},
		{color1: 'yellow', color2: 'grey'}
	])
})
test('explicit form usage', t => {
	t.deepEqual(combinatoire({
		props : {
			color1 : [{
				value: ['white1', 'white2']
			}, {
				value: ['yellow1', 'yellow2']
			}],
			color2 : ['black', 'grey']
		}
	}),[
		{color1: 'white', color2: 'black'},
		{color1: 'white', color2: 'grey'},
		{color1: 'yellow', color2: 'black'},
		{color1: 'yellow', color2: 'grey'}
	])

})
test('function prop', t => {
	t.deepEqual(combinatoire({
		props : {
			color1 : ['white', 'yellow'],
			filename : function({color1}){
				return [color1+'.png', color1+'.jpg']
			}
		}
	}),[
		{color1: 'white', filename: 'white.png'},
	  {color1: 'white', filename: 'white.jpg'},
	  {color1: 'yellow', filename: 'yellow.png'},
	  {color1: 'yellow', filename: 'yellow.jpg'}
	])
})
test('promise prop', t => {
	return combinatoireAsync({
		props : {
			color1 : ['white', 'yellow'],
			filename : function({color1}){
				return [color1+'.png', color1+'.jpg']
			}
		}
	}).then(res => {
		t.deepEqual(res,[
			{color1: 'white', filename: 'white.png'},
		  {color1: 'white', filename: 'white.jpg'},
		  {color1: 'yellow', filename: 'yellow.png'},
		  {color1: 'yellow', filename: 'yellow.jpg'}
		]);
	})
})
test('tree prop', t => {
	t.deepEqual(combinatoire({
		props : {
			color1 : [{
				value: 'white',
				props: { color2: ['black', 'blue']}
			}, {
				value: 'yellow',
				props: { color2: ['red', 'pink']}
			}]
		}
	}),[{color1: 'white', color2: 'black'},
  {color1: 'white', color2: 'blue'},
  {color1: 'yellow', color2: 'red'},
  {color1: 'yellow', color2: 'pink'}]);
})
