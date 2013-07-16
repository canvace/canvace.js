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
