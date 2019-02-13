## Installation

```
npm install combinatoire
```

## Description and original purpose

I have made this library to be able to easily generate data combination, simple or complex, to generate data sample for machine learning.

## Simple Usage

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	color1 : ['white', 'yellow'],
	color2 : ['black', 'grey']
}));
```
Will print
```
[
  {color1: 'white', color2: 'black'},
  {color1: 'white', color2: 'grey'},
  {color1: 'yellow', color2: 'black'},
  {color1: 'yellow', color2: 'grey'}
]
```


## Explicit-form Usage

In some specific case :
* When you need to use Object/Array or function values
* When you want to use tree-organised properties

It is useful to expicit the values like

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	color1 : [{
		value: ['white1', 'white2']
	}, {
		value: ['yellow1', 'yellow2']
	}],
	color2 : ['black', 'grey']
}))
```
Will print
```
[
  {color1: ['white1', 'white2'], color2: 'black'},
  {color1: ['yellow1', 'yellow2'], color2: 'grey'},
  {color1: ['white1', 'white2'], color2: 'black'},
  {color1: ['yellow1', 'yellow2'], color2: 'grey'}
]
```

## Usage with function prop

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	color1 : ['white', 'yellow'],
	filename : function({color1}){
		return [color1+'.png', color1+'.jpg']
	}
}))
```

NB: properties of type 'function' are resolved after other properties, so they can takes non-function properties as input but not other 'function' properties

Will print
```
[
  {color1: 'white', filename: 'white.png'},
  {color1: 'white', filename: 'white.jpg'},
  {color1: 'yellow', filename: 'red'},
  {color1: 'yellow', filename: 'pink'}
]
```

## Usage with range values

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	color1 : ['white', 'yellow'],
	luminosity: combinatoire.range([0,1],3),
	filename : function({color1, luminosity}){
		return [color1+'.png', color1+'.jpg']
	}
}))
```

NB1: The second arguments of `combinatoire.range` is the 'weight' of this range, and will tell the lib how many different version should be generated, `1` is the default value

NB2: range properties cannot be used in functions prop


Will print
```
[
  {color1: 'white', filename: 'white.png', luminosity: <random value between 0 and 1>},
  {color1: 'white', filename: 'white.jpg', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'red', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'pink', luminosity: <random value between 0 and 1>},
  {color1: 'white', filename: 'white.png', luminosity: <random value between 0 and 1>},
  {color1: 'white', filename: 'white.jpg', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'red', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'pink', luminosity: <random value between 0 and 1>},
  {color1: 'white', filename: 'white.png', luminosity: <random value between 0 and 1>},
  {color1: 'white', filename: 'white.jpg', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'red', luminosity: <random value between 0 and 1>},
  {color1: 'yellow', filename: 'pink', luminosity: <random value between 0 and 1>}
]
```

## Promise Usage

```javascript
const combinatoireAsync = require('combinatoire').async;

combinatoireAsync({
	color1 : ['white', 'yellow'],
	filename : function({color1}){
		return Promise.resolve([color1+'.png', color1+'.jpg']);
	}
}).then(res => {
	console.log(res);
})
```
Will print
```
[
  {color1: 'white', filename: 'white.png'},
  {color1: 'white', filename: 'white.jpg'},
  {color1: 'yellow', filename: 'red'},
  {color1: 'yellow', filename: 'pink'}
]
```

## Usage with tree-props

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	color1 : [{
		value: 'white',
		props: { color2: ['black', 'blue']}
	}, {
		value: 'yellow',
		props: { color2: ['red', 'pink']}
	}]
}))
```

Will print
```
[
  {color1: 'white', color2: 'black'},
  {color1: 'white', color2: 'blue'},
  {color1: 'yellow', color2: 'red'},
  {color1: 'yellow', color2: 'pink'}
]
```
