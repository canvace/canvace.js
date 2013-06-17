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
 * Adds an event listener for the "visibility change" event, if supported by the
 * browser.
 *
 * @method onVisibilityChange
 * @param callback {Function} TODO
 * @return {Boolean} A boolean value indicating whether the browser supports the
 *	event or not.
 * @for Canvace
 */
Canvace.onVisibilityChange = function (callback) {
	if ('hidden' in document) {
		document.addEventListener('visibilitychange', function () {
			callback(document.hidden);
		}, false);
	} else if ('webkitHidden' in document) {
		document.addEventListener('webkitvisibilitychange', function () {
			callback(document.webkitHidden);
		}, false);
	} else if ('mozHidden' in document) {
		document.addEventListener('mozvisibilitychange', function () {
			callback(document.mozHidden);
		}, false);
	} else if ('msHidden' in document) {
		document.addEventListener('msvisibilitychange', function () {
			callback(document.msHidden);
		}, false);
	} else {
		return false;
	}
	return true;
};
