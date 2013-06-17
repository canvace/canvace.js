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
 * Static class which wraps around the timing APIs offered by the browser.
 * Whenever possible, the methods provided by this class make use of a high
 * resolution, monotonic clock.
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = {
	/**
	 * This method returns a timestamp using `window.performance.now()`, if
	 * available, or `Date.now()` otherwise.
	 *
	 * @method now
	 * @return {Number} A number indicating a timestamp in milliseconds.
	 */
	now: (function () {
		if (!!window.performance) {
			var now = Canvace.Polyfill.getPrefixedProperty(window.performance, 'now');
			if (!!now) {
				return function () {
					return now.call(window.performance);
				};
			}
		}
		return function () {
			return Date.now();
		};
	}())
};
