/*
 *	Canvace's JavaScript Game Engine, canvace.js
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

	function getUnboundProperty(object, name) {
		var capitalName = name.charAt(0).toUpperCase() + name.substr(1);

		for (var i in prefixes) {
			if (prefixes.hasOwnProperty(i)) {
				var prefixedName = prefixes[i] + capitalName;
				if (prefixedName in object) {
					return object[prefixedName];
				}
			}
		}

		return object[name];
	}

	function getBoundProperty(object, name) {
		var property = getUnboundProperty(object, name);

		if (typeof property === 'function') {
			return function () {
				return property.apply(object, arguments);
			};
		}

		return property;
	}

	function makePropertyGetter(getProperty) {
		return function (object, property) {
			if (arguments.length < 2) {
				property = object;
				object = window;
			}

			if (Array.isArray(property)) {
				while (property.length > 1) {
					var reference = getProperty(object, property.shift());

					if (typeof reference !== 'undefined') {
						return reference;
					}
				}
			}

			return getProperty(object, property.toString());
		};
	}

	return {
		vendorPrefixes: prefixes,

		/**
		 * Returns a reference to a possibly browser-prefixed property of a
		 * given object.
		 *
		 * In case the property is a function, this function will return a
		 * proxy function which transparently invokes such function with the
		 * given object as the `this` reference.
		 *
		 * @example
		 *	// Get a prefixed property from the `window` object.
		 *	var requestAnimationFrame = Canvace.Polyfill.getPrefixedProperty('requestAnimationFrame');
		 *
		 *	// Get a prefixed function from a DOM element.
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
		getPrefixedProperty: makePropertyGetter(getBoundProperty),

		/**
		 * Returns a reference to a possibly browser-prefixed constructor of a
		 * given object.
		 *
		 * In case the property is a function, this function will not be wrapped
		 * by a proxy function - contrarily to what happens with the
		 * `getPrefixedProperty` function - so that it can be used with the
		 * `new` operator.
		 *
		 * @example
		 *	// Get and use a prefixed constructor from the `window` object.
		 *	var context = new Canvace.Polyfill.getPrefixedProperty('AudioContext');
		 *
		 * @method getPrefixedConstructor
		 * @param [object] {Object} An optional reference to the object holding
		 * the requested property. Defaults to the `window` object.
		 * @param property {mixed} The constructor name to retrieve. This can be
		 * a `String` (the property name) or an `Array` of `String`s (variants
		 * of the same property name to try in order).
		 * @return A reference to the requested constructor, or `undefined`.
		 */
		getPrefixedConstructor: makePropertyGetter(getUnboundProperty)
	};
}());
