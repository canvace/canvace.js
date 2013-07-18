/**
 * Represents a general purpose three-dimensional matrix use to store generic
 * data indexed by I, J and K coordinates. The data is stored efficiently since
 * the Matrix class greatly reduces memory footprint.
 *
 * This class is used by the engine to manage tile maps and other internal
 * three-dimensional data.
 *
 * @class Canvace.Matrix
 * @constructor
 */
Canvace.Matrix = function () {
	this.data = {};
	this.layers = {};
};

/**
 * Returns the value at the specified I, J and K coordinates.
 *
 * @method get
 * @param i {Number} The I coordinate.
 * @param j {Number} The J coordinate.
 * @param k {Number} The K coordinate.
 * @return {Any} The requested value, or `undefined` if no value is present at
 * the specified position.
 */
Canvace.Matrix.prototype.get = function (i, j, k) {
	return this.data[i + ' ' + j + ' ' + k];
};

/**
 * Sets a value at the specified I, J and K coordinates.
 *
 * @method put
 * @param i {Number} The I coordinate.
 * @param j {Number} The J coordinate.
 * @param k {Number} The K coordinate.
 * @param value {Any} The value to set.
 */
Canvace.Matrix.prototype.put = function (i, j, k, value) {
	this.data[i + ' ' + j + ' ' + k] = value;
	this.layers[k] = true;
};

/**
 * Indicates whether a value is present at the specified I, J and K coordinates.
 *
 * @method has
 * @param i {Number} The I coordinate.
 * @param j {Number} The J coordinate.
 * @param k {Number} The K coordinate.
 * @return {Boolean} `true` if a value is present at the specified coordinates,
 * `false` otherwise.
 */
Canvace.Matrix.prototype.has = function (i, j, k) {
	return this.data.hasOwnProperty(i + ' ' + j + ' ' + k);
};

Canvace.Matrix.prototype.hasLayer = function (k) {
	return this.layers.hasOwnProperty(k);
};

/**
 * Possibly deletes the value at the specified I, J and K coordinates.
 *
 * @method erase
 * @param i {Number} The I coordinate.
 * @param j {Number} The J coordinate.
 * @param k {Number} The K coordinate.
 * @return {Boolean} A boolean value indicating whether a value was present at
 * the specified position and successfully deleted.
 */
Canvace.Matrix.prototype.erase = function (i, j, k) {
	var key = i + ' ' + j + ' ' + k;
	if (this.data.hasOwnProperty(key)) {
		delete this.data[key];
		return true;
	} else {
		return false;
	}
};

/**
 * Enumerates all the elements in the matrix and calls the specified callback
 * function for each one.
 *
 * The enumeration can be interrupted by the callback function returning
 * `false`, in which case the `forEach` method returns `true`.
 *
 * @method forEach
 * @param callback {Function} A user-defined function that is invoked for each
 * element in the matrix.
 * @param [scope] {Object} An optional object that is used as `this` when
 * invoking the `callback` function.
 * @return {Boolean} `true` if the enumeration was interrupted by the callback
 * function return `false`; `false` if all the elements were enumerated.
 */
Canvace.Matrix.prototype.forEach = function (callback, scope) {
	for (var key in this.data) {
		if (this.data.hasOwnProperty(key)) {
			var coordinates = key.split(' ');
			if (callback.call(scope, coordinates[0], coordinates[1], coordinates[2], this.data[key]) === false) {
				return true;
			}
		}
	}
	return false;
};

/**
 * Enumerates the layers in the matrix. A _layer_ is a set of elements in the
 * matrix that have the same `k` coordinate.
 *
 * The enumeration can be interrupted by the callback function returning
 * `false`, in which case the `forEachLayer` method returns `true`.
 *
 * @method forEachLayer
 * @param callback {Function} A user-defined function that is invoked for each
 * layer in the matrix.
 * @param callback.k {Number} The current layer number, or `k` coordinate,
 * passed to the `callback` function at each iteration.
 * @param [scope] {Object} An optional object that is used as `this` when
 * invoking the `callback` function.
 * @return {Boolean} `true` if the enumeration was interrupted by the `callback`
 * function return `false`; `false` if all the layers were enumerated.
 */
Canvace.Matrix.prototype.forEachLayer = function (callback, scope) {
	for (var k in this.layers) {
		if (this.layers.hasOwnProperty(k)) {
			if (callback.call(scope, parseInt(k, 10)) === false) {
				return true;
			}
		}
	}
	return false;
};
