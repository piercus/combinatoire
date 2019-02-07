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

const incrementCombination = function (combinations, expandeds, key) {
	const nextCombinations = [];
	combinations.forEach(c => {
		expandeds.forEach((expanded) => {
			const res = Object.assign({}, c, expanded);
			nextCombinations.push(res);
		});
	});
	return nextCombinations;
};

const formatChoices = (choices, k, sync, init) => {//(k, v, indexV) => {
	if (typeof (choices) === 'string' || typeof (choices) === 'boolean' || typeof (choices) === 'number') {
		const expanded = {};
		expanded[k] = choices;
		const res = [Object.assign({}, init, expanded)];
		if(sync){
			return res;
		}
		return Promise.resolve(res)
	}
	const array = choices.map((v, indexV) => {
		if (typeof (v) === 'string' || typeof (v) === 'boolean' || typeof (v) === 'number') {
			const expanded = {};
			expanded[k] = v;
			const res = [Object.assign({}, init, expanded)];
			if(sync){
				return res;
			}
			return Promise.resolve(res)
		}

		if (typeof (v) === 'object' && Object.prototype.hasOwnProperty.call(v, 'value')) {
			if(Object.prototype.hasOwnProperty.call(v, 'props')){
				const expanded = Object.assign({}, init);
				expanded[k] = v.value;
				if(sync){
					const subCombinatoire = combinatoireGeneric(v.props, sync, expanded);
					return subCombinatoire
				} else {
					return combinatoireGeneric(v.props, sync, expanded).then(subCombinatoire => {
						return subCombinatoire
					})
				}

			}
			const expanded = {};
			expanded[k] = v.value;
			const res = [Object.assign({}, init, expanded)];
			if(sync){
				return res;
			}
			return Promise.resolve(res)
		}
		throw new Error(`value type ${typeof (v)} of ${v} (address [${k}][${indexV}]) is not a valid object choice, try using ${k} : [{value: ${v} }]`);
	})

	if(sync){
		return array.reduce((a,b) => a.concat(b), [])
	} else {
		return Promise.all(array).then(list => list.reduce((a,b) => a.concat(b), []));
	}
}

const getExplicitProperties = function (propertyConfigs, sync, init) {
	const keys = Object.keys(propertyConfigs);
	const fnKeys = [];
	if (keys.length === 0) {
		return sync ? [] : Promise.resolve([]);
	}

	const array = keys.map(k => {

		if (typeof (propertyConfigs[k]) === 'function') {
			const res = {fn: propertyConfigs[k], key: k};
			return sync ? res : Promise.resolve(res);
		}

		if (Array.isArray(propertyConfigs[k]) || typeof (propertyConfigs[k]) === 'string' || typeof (propertyConfigs[k]) === 'boolean' || typeof (propertyConfigs[k]) === 'number') {
			if(sync){
				const expandeds = formatChoices(propertyConfigs[k], k, sync, init);
				return {expandeds, key: k};
			} else {
				return formatChoices(propertyConfigs[k], k, sync, init).then(expandeds => {
					return {expandeds, key: k};
				})
			}
		}

		throw new Error(`type ${typeof (propertyConfigs[k])} of property ${k} is not a valid type for combinatoire, try using ${k} : [{value: ${propertyConfigs[k]} }]`);
	});

	return sync ? array : Promise.all(array);
};

/**
* @param {PropertyConfigs}
* @returns {Array.<Combination>}
*/
const combinatoireSync = function (propertyConfigs) {
	return combinatoireGeneric(propertyConfigs, true)
};
const combinatoireAsync = function (propertyConfigs) {
	return combinatoireGeneric(propertyConfigs, false)
};

const combinatoireGeneric = function(propertyConfigs, sync = true, init = {}){
	let combinations = [init];

	if(sync){
		const explicitProperties = getExplicitProperties(propertyConfigs, sync, init);

			explicitProperties.filter(({fn}) => !fn).forEach(({key, expandeds}) => {
				combinations = incrementCombination(combinations, expandeds, key);
			});
			explicitProperties.filter(({fn}) => fn).forEach(({key, fn}) => {
				combinations = combinations.map(c => {
					const expandeds = formatChoices(fn(c), key, sync, init);
					return incrementCombination([c], expandeds, key);
				}).reduce((a, b) => a.concat(b), []);
			});
			return combinations;
	} else {
		return getExplicitProperties(propertyConfigs, sync, init).then(explicitProperties => {
				explicitProperties.filter(({fn}) => !fn).forEach(({key, expandeds}) => {
					combinations = incrementCombination(combinations, expandeds, key);
				});
				let promise = Promise.resolve(combinations);
				const fnsProps = explicitProperties.filter(({fn}) => fn);
				fnsProps.forEach(({key, fn}) => {
					promise = promise.then(combinations => {
						return Promise.all(combinations.map(c => {
							return fn(c).then(chces => {
								return formatChoices(chces, key, sync, init).then(expandeds => {
									return incrementCombination([c], expandeds, key);
								})
							})
						})).then(res => res.reduce((a, b) => a.concat(b), []));
					});
				});
				return promise
		})
	}
}

const combinatoire = combinatoireSync;
combinatoire.async = combinatoireAsync;
module.exports = combinatoire;
