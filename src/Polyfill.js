if (typeof Array.prototype.forEach !== 'function') {
	Array.prototype.forEach = function (fn, scope) {
		for (var i = 0, length = this.length; i < length; ++i) {
			fn.call(scope, this[i], i, this);
		}
	};
}

if (typeof Array.isArray !== 'function') {
	Array.isArray = function (arg) {
		return (Object.prototype.toString.call(arg) === '[object Array]');
	};
}

/**
 * Static class which provides utility methods to eliminate the differences
 * across browsers.
 *
 * @class Canvace.Polyfill
 * @static
 */
Canvace.Polyfill = (function () {
	var prefixes = ['webkit', 'moz', 'ms', 'o'];

	var getSinglePrefixedProperty = function (object, name) {
		var capitalName = name.charAt(0).toUpperCase() + name.substr(1);
		for (var i in prefixes) {
			var prefixedName = prefixes[i] + capitalName;
			if (prefixedName in object) {
				return object[prefixedName];
			}
		}
		return object[name];
	};

	return {
		vendorPrefixes: prefixes,

		/**
		 * Returns a reference to a possibly browser-prefixed property of a
		 * given object.
		 *
		 * @example
		 *	// Get a prefixed property from the `window` object.
		 *	var requestAnimationFrame = Canvace.Polyfill.getPrefixedProperty('requestAnimationFrame');
		 *
		 *	// Get a prefixed property from a DOM element.
		 *	var canvas = document.getElementById('canvas');
		 *	var requestFullscreen = Canvace.Polyfill.getPrefixedProperty(canvas, ['requestFullscreen', 'requestFullScreen']);
		 *
		 * @method getPrefixedProperty
		 * @param [object] {Object} An optional reference to the object holding
		 * the requested property. Defaults to the `window` object.
		 * @param property {mixed} The property name to retrieve. This can be a
		 * `String` (the property name) or an `Array` of `String`s (variants of
		 * the same property name to try in order).
		 * @return A reference to the requested property, or `undefined`.
		 */
		getPrefixedProperty: function (object, property) {
			if (arguments.length < 2) {
				property = object;
				object = window;
			}

			if (Array.isArray(property) && (property.length > 1)) {
				return getSinglePrefixedProperty(object, property.shift()) || Canvace.Polyfill.getPrefixedProperty(object, property);
			}

			return getSinglePrefixedProperty(object, property.toString());
		}
	};
})();
