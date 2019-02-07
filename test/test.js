const test = require('ava');

const combinatoire = require('..');

const combinatoireAsync = combinatoire.async;
test('simple usage', t => {
	t.deepEqual(combinatoire({
		color1: ['white', 'yellow'],
		color2: ['black', 'grey']
	}), [
		{color1: 'white', color2: 'black'},
		{color1: 'white', color2: 'grey'},
		{color1: 'yellow', color2: 'black'},
		{color1: 'yellow', color2: 'grey'}
	]);
});
test('simple usage 2', t => {
	t.deepEqual(combinatoire({
		color1: ['white', 'yellow'],
		color2: 'black'
	}), [
		{color1: 'white', color2: 'black'},
		{color1: 'yellow', color2: 'black'}
	]);
});
test('explicit form usage', t => {
	t.deepEqual(combinatoire({
		color1: [{
			value: ['white1', 'white2']
		}, {
			value: ['yellow1', 'yellow2']
		}],
		color2: ['black', 'grey']
	}), [
		{color1: ['white1', 'white2'], color2: 'black'},
		{color1: ['white1', 'white2'], color2: 'grey'},
		{color1: ['yellow1', 'yellow2'], color2: 'black'},
		{color1: ['yellow1', 'yellow2'], color2: 'grey'}
	]);
});
test('function prop', t => {
	t.deepEqual(combinatoire({
		color1: ['white', 'yellow'],
		filename({color1}) {
			return [color1 + '.png', color1 + '.jpg'];
		}
	}), [
		{color1: 'white', filename: 'white.png'},
		{color1: 'white', filename: 'white.jpg'},
		{color1: 'yellow', filename: 'yellow.png'},
		{color1: 'yellow', filename: 'yellow.jpg'}
	]);
});
test('promise prop', t => {
	return combinatoireAsync({
		color1: ['white', 'yellow'],
		filename({color1}) {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve([color1 + '.png', color1 + '.jpg']);
				}, 1000);
			});
		}
	}).then(res => {
		t.deepEqual(res, [
			{color1: 'white', filename: 'white.png'},
			{color1: 'white', filename: 'white.jpg'},
			{color1: 'yellow', filename: 'yellow.png'},
			{color1: 'yellow', filename: 'yellow.jpg'}
		]);
	});
});
test('tree prop', t => {
	t.deepEqual(combinatoire({
		color1: [{
			value: 'white',
			props: {color2: ['black', 'blue']}
		}, {
			value: 'yellow',
			props: {color2: ['red', 'pink']}
		}]
	}), [{color1: 'white', color2: 'black'},
		{color1: 'white', color2: 'blue'},
		{color1: 'yellow', color2: 'red'},
		{color1: 'yellow', color2: 'pink'}]);
});

test('tree props and promises together', t => {
	return combinatoireAsync({
		color1: [{
			value: 'white',
			props: {
				color2: ['black', 'blue'],
				filename({color1, color2}) {
					return new Promise(resolve => {
						setTimeout(() => {
							resolve([color1 + '_' + color2 + '.png', color1 + '_' + color2 + '.jpg']);
						}, 1000);
					});
				}
			}
		}, {
			value: 'yellow',
			props: {color2: ['red', 'pink']}
		}]
	}).then(res => {
		t.deepEqual(res,
			[{
				color1: 'white', color2: 'black', filename: 'white_black.png'
			},
			{
				color1: 'white', color2: 'black', filename: 'white_black.jpg'
			},
			{
				color1: 'white', color2: 'blue', filename: 'white_blue.png'
			},
			{
				color1: 'white', color2: 'blue', filename: 'white_blue.jpg'
			},
			{
				color1: 'yellow', color2: 'red'
			},
			{
				color1: 'yellow', color2: 'pink'
			}]);
	});
});
