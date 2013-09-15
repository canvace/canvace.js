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

/**
 * The main namespace object of Canvace's Javascript client library is named
 * `Canvace`. Every Canvace class must be accessed from that object.
 *
 * The `Canvace` name also represents function that can be used to retrieve
 * DOM elements from a CSS selector string.
 *
 * @example
 *	(function ($) {
 *		// Inside this anonymous function, "Canvace" is aliased as "$"
 *		$('#play-button').addEventListener('click', function () {
 *			window.alert('You clicked on the "Play" button!');
 *		}, false);
 *	})(Canvace);
 *
 * @module Canvace
 * @param [param] {Mixed} A `String` representing a valid CSS selector,
 * or a DOM element.
 * @return {Mixed} Returns `null` if `param` is a `String` which corresponds
 * to no element in the document, or returns the (first) corresponding element
 * otherwise. If `param` is already a DOM element, it's returned as is.
 * If `param` is completely missing, it returns `undefined`.
 */
function Canvace() {
	if (arguments.length !== 0) {
		var param = arguments[0];
		if (param.tagName) {
			return param;
		}
		return document.querySelector(param);
	}
}

/**
 * Performes a deep-copy of the properties owned by the source
 * object to the destination object.
 *
 * This method is a no-operation if the specified source parameter
 * is not an `Object` (i.e., returns the destination object as is).
 *
 * @method mixin
 * @for Canvace
 * @param dest {Object} The destination object.
 * @param source {Object} The source object.
 * @return {Object} The object `dest`.
 */
Canvace.mixin = function (dest, source) {
	if (typeof source === 'object') {
		for (var property in source) {
			if (source.hasOwnProperty(property)) {
				dest[property] = Canvace.clone(source[property]);
			}
		}
	}
	return dest;
};

/**
 * Clones the given source object along with all of its properties.
 * The properties are deep-copied.
 *
 * This method is a no-operation if the specified source parameter
 * is not an `Object` or an `Array` (i.e., returns the source
 * object as is).
 *
 * @method clone
 * @for Canvace
 * @param source {Object} The source object.
 * @return {Object} A clone of the source object.
 */
Canvace.clone = function (source) {
	var clone;
	if (typeof source === 'object') {
		if (Object.getPrototypeOf(source)) {
			clone = Object.create(Object.getPrototypeOf(source));
		} else {
			clone = {};
		}
		Canvace.mixin(clone, source);
		return clone;
	} else if (Array.isArray(source)) {
		clone = [];
		for (var i = 0; i < source.length; ++i) {
			clone[i] = Canvace.clone(source[i]);
		}
		return clone;
	}
	return source;
};

/**
 * Extends the given source object with the properties owned by
 * all the subsequently specified objects.
 *
 * The returned object is a new one: the given source object is
 * not modified.
 *
 * If no arguments are passed after the source object, this method
 * reduces to {{#crossLink "Canvace/clone"}}{{/crossLink}}.
 *
 * @method extend
 * @for Canvace
 * @param source {Object} The source object.
 * @param [args...] {Object} The extending objects.
 * @return {Object} A new object, containing all the properties
 * owned by `source` and by all of the specified `args`.
 */
Canvace.extend = function (source) {
	var clone = Canvace.clone(source);
	for (var i = 1; i < arguments.length; ++i) {
		Canvace.mixin(clone, arguments[i]);
	}
	return clone;
};

