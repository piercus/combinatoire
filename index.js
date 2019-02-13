
/**
* @typedef {Object} Range
*/

class Range {
	constructor({range, weight, rng, int = false}) {
		this.weight = weight;
		this.rng = rng;
		this.range = range;
		this.int = int;
	}

	generate() {
		const r = (this.rng() * (this.range[1] - this.range[0])) + this.range[0];
		if (this.int) {
			return Math.floor(r);
		}

		return r;
	}

	setKey(key) {
		this.key = key;
	}

	static isRange(obj) {
		return Boolean(obj.range) && typeof (obj.generate) === 'function';
	}
}

/**
* @param {Array.<number>} range [start, end[ to be used
* @param {Number} [weight=1] the weight of the range, if this is 2, it will be equivalent to have 2 luminosity values and the total number of combination will be multiply by 2
* @param {Object} opts
* @param {Object} opts.rng, random number generator (for instance mersenne twister generator) to be used
*/
const createRange = function (range, weight = 1, {rng = Math.random} = {}) {
	return new Range({
		range,
		weight,
		rng
	});
};

/**
* @param {Array.<number>} range [start, end[ to be used
* @param {Number} [weight=1] the weight of the range, if this is 2, it will be equivalent to have 2 luminosity values and the total number of combination will be multiply by 2
* @param {Object} opts
* @param {Object} opts.rng, random number generator (for instance mersenne twister generator) to be used
*/
const createRangeint = function (range, weight = 1, {rng = Math.random} = {}) {
	return new Range({
		range,
		weight,
		rng,
		int: true
	});
};

/**
* @typedef {String} PropertyKey
*/

/**
* @typedef {String|Number|Boolean} PropertyResolvedSimple
*/
/**
* @typedef {PropertyResolvedSimple|Object\Function} PropertyResolvedGeneric
*/
/**
* @typedef {Object} PropertyChoiceConfigObject
* @property {PropertyResolvedGeneric} value the value of the property
* @property {Array.<PropertyChoiceConfig>} [props=[]] the other props to use in a tree organised props object
*/
/**
* @callback PropertyConfigFunction
* @param {Combination}
* @returns {Array.<PropertyChoiceConfig>|Promise.<Array.<PropertyChoiceConfig>>}
*/
/**
* @typedef {PropertyResolvedSimple\PropertyChoiceConfigObject} PropertyChoiceConfig
* @param
*/
/**
* @typedef {PropertyConfigFunction\Array.<PropertyChoiceConfig>} PropertyChoices
* @param
*/
/**
* @typedef {Object.<PropertyKey, PropertyChoices>} PropertyConfigs
*/
/**
* @typedef {Object.<PropertyKey, PropertyResolved>} Combination
*/

const incrementCombination = function (combinations, expandeds) {
	const nextCombinations = [];
	combinations.forEach(c => {
		expandeds.forEach(expanded => {
			const res = Object.assign({}, c, expanded);
			nextCombinations.push(res);
		});
	});
	return nextCombinations;
};

const formatChoices = (choices, k, sync, init) => {// (k, v, indexV) => {
	if (typeof (choices) === 'string' || typeof (choices) === 'boolean' || typeof (choices) === 'number') {
		const expanded = {};
		expanded[k] = choices;
		const res = [Object.assign({}, init, expanded)];
		if (sync) {
			return res;
		}

		return Promise.resolve(res);
	}

	const array = choices.map((v, indexV) => {
		if (typeof (v) === 'string' || typeof (v) === 'boolean' || typeof (v) === 'number') {
			const expanded = {};
			expanded[k] = v;
			const res = [Object.assign({}, init, expanded)];
			if (sync) {
				return res;
			}

			return Promise.resolve(res);
		}

		if (typeof (v) === 'object' && Object.prototype.hasOwnProperty.call(v, 'value')) {
			if (Object.prototype.hasOwnProperty.call(v, 'props')) {
				const expanded = Object.assign({}, init);
				expanded[k] = v.value;
				if (sync) {
					const subCombinatoire = combinatoireGeneric(v.props, sync, expanded);
					return subCombinatoire;
				}

				return combinatoireGeneric(v.props, sync, expanded).then(subCombinatoire => {
					return subCombinatoire;
				});
			}

			const expanded = {};
			expanded[k] = v.value;
			const res = [Object.assign({}, init, expanded)];
			if (sync) {
				return res;
			}

			return Promise.resolve(res);
		}

		throw new Error(`value type ${typeof (v)} of ${v} (address [${k}][${indexV}]) is not a valid object choice, try using ${k} : [{value: ${v} }]`);
	});

	if (sync) {
		return array.reduce((a, b) => a.concat(b), []);
	}

	return Promise.all(array).then(list => list.reduce((a, b) => a.concat(b), []));
};

const getExplicitProperties = function (propertyConfigs, sync, init) {
	const keys = Object.keys(propertyConfigs);
	if (keys.length === 0) {
		return sync ? [] : Promise.resolve([]);
	}

	const array = keys.map(k => {
		if (typeof (propertyConfigs[k]) === 'function') {
			const res = {fn: propertyConfigs[k], key: k};
			return sync ? res : Promise.resolve(res);
		}

		if (Array.isArray(propertyConfigs[k]) || typeof (propertyConfigs[k]) === 'string' || typeof (propertyConfigs[k]) === 'boolean' || typeof (propertyConfigs[k]) === 'number') {
			if (sync) {
				const expandeds = formatChoices(propertyConfigs[k], k, sync, init);
				return {expandeds, key: k};
			}

			return formatChoices(propertyConfigs[k], k, sync, init).then(expandeds => {
				return {expandeds, key: k};
			});
		}

		if (Range.isRange(propertyConfigs[k])) {
			propertyConfigs[k].setKey(k);
			if (sync) {
				return propertyConfigs[k];
			}

			return Promise.resolve(propertyConfigs[k]);
		}

		throw new Error(`type ${typeof (propertyConfigs[k])} of property ${k} is not a valid type for combinatoire, try using ${k} : [{value: ${propertyConfigs[k]} }]`);
	});

	return sync ? array : Promise.all(array);
};

/**
* @param {PropertyConfigs} propertyConfigs see examples, the dictionnary of values to combinate
* @returns {Array.<Combination>} the list of all possible combination
*/
const combinatoireSync = function (propertyConfigs) {
	return combinatoireGeneric(propertyConfigs, true);
};

const combinatoireAsync = function (propertyConfigs) {
	return combinatoireGeneric(propertyConfigs, false);
};

const addRangeCombinations = function ({explicitProperties, combinations}) {
	const rangeProperties = explicitProperties.filter(p => Range.isRange(p));

	const multiplier = Math.floor(rangeProperties.map(range => {
		return range.weight;
	}).reduce((a, b) => a * b, 1));

	let newCombinations = [];
	for (let i = 0; i < multiplier; i++) {
		const newCombi = combinations.map(c => {
			const add = {};
			rangeProperties.forEach(range => {
				add[range.key] = range.generate();
			});
			return Object.assign({}, c, add);
		});

		newCombinations = newCombinations.concat(newCombi);
	}

	return newCombinations;
};

const combinatoireGeneric = function (propertyConfigs, sync = true, init = {}) {
	let combinations = [init];

	if (sync) {
		const explicitProperties = getExplicitProperties(propertyConfigs, sync, init);

		explicitProperties.filter(({fn, range}) => !fn && !range).forEach(({expandeds}) => {
			combinations = incrementCombination(combinations, expandeds);
		});
		explicitProperties.filter(({fn, range}) => fn && !range).forEach(({key, fn}) => {
			combinations = combinations.map(c => {
				const expandeds = formatChoices(fn(c), key, sync, init);
				return incrementCombination([c], expandeds);
			}).reduce((a, b) => a.concat(b), []);
		});

		return addRangeCombinations({explicitProperties, combinations});
	}

	return getExplicitProperties(propertyConfigs, sync, init).then(explicitProperties => {
		explicitProperties.filter(({fn, range}) => !fn && !range).forEach(({expandeds}) => {
			combinations = incrementCombination(combinations, expandeds);
		});
		let promise = Promise.resolve(combinations);
		const fnsProps = explicitProperties.filter(({fn, range}) => fn && !range);

		const asyncIncrement = (fn, key, combins) => {
			return Promise.all(combins.map(c => {
				return fn(c).then(chces => {
					return formatChoices(chces, key, sync, init);
				})
					.then(expandeds => {
						return incrementCombination([c], expandeds);
					});
			})).then(res => res.reduce((a, b) => a.concat(b), []));
		};

		fnsProps.forEach(({key, fn}) => {
			promise = promise.then(asyncIncrement.bind(this, fn, key));
		});
		return promise.then(combinations => {
			return addRangeCombinations({explicitProperties, combinations});
		});
	});
};

const combinatoire = combinatoireSync;
combinatoire.async = combinatoireAsync;
combinatoire.range = createRange;
combinatoire.rangeint = createRangeint;
module.exports = combinatoire;
