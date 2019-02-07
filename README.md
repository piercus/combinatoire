## Installation

```
npm install number-generator
```

## Simple Usage

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	props : {
		color1 : ['white', 'yellow'],
		color2 : ['black', 'grey']
	}
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
* When you need to use array or function values as props
* When you need to give a specific id to your parameter (different from value)

It is useful to expicit the values like

```javascript
const combinatoire = require('combinatoire');

console.log(combinatoire({
	props : {
		color1 : [{
			value: ['white1', 'white2']
		}, {
			value: ['yellow1', 'yellow2']
		}],
		color2 : ['black', 'grey']
	}
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
	props : {
		color1 : ['white', 'yellow'],
		filename : function({color1}){
			return [color1+'.png', color1+'.jpg']
		}
	}
}))
```

NB: props of type 'function' are resolved after other props, so they can takes non-function props as input but not other 'function' props

Will print
```
[
  {color1: 'white', filename: 'white.png'},
  {color1: 'white', filename: 'white.jpg'},
  {color1: 'yellow', filename: 'red'},
  {color1: 'yellow', filename: 'pink'}
]
```

## Promise Usage



```javascript
const combinatoireAsync = require('combinatoire').async;

combinatoireAsync({
	props : {
		color1 : ['white', 'yellow'],
		filename : function({color1}){
			return Promise.resolve([color1+'.png', color1+'.jpg']);
		}
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
	props : {
		color1 : [{
			value: 'white',
			props: { color2: ['black', 'blue']}
		}, {
			value: 'yellow',
			props: { color2: ['red', 'pink']}
		}]
	}
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
