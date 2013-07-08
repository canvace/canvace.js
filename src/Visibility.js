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
 * Gives access to the Page Visibility API, if supported by the browser.
 *
 * @class Canvace.Visibility
 * @static
 */
Canvace.Visibility = new function () {
	var hidden;
	var changeEvent;

	if ('hidden' in document) {
		hidden = 'hidden';
		changeEvent = 'visibilitychange';
	} else if ('webkitHidden' in document) {
		hidden = 'webkitHidden';
		changeEvent = 'webkitvisibilitychange';
	} else if ('mozHidden' in document) {
		hidden = 'mozHidden';
		changeEvent = 'mozvisibilitychange';
	} else if ('msHidden' in document) {
		hidden = 'msHidden';
		changeEvent = 'msvisibilitychange';
	}

	/**
	 * Tells if the browser supports the Page Visibility API.
	 *
	 * @method isSupported
	 * @return {Boolean} A value indicating whether such support is available.
	 */
	this.isSupported = function () {
		return (typeof hidden !== 'undefined');
	};

	/**
	 * Queries the visibility status of the document.
	 *
	 * @method isVisible
	 * @return {Boolean} A value indicating if the document is visible or not.
	 *   Defaults to the boolean `true` if the Page Visibility API is not
	 *   supported.
	 */
	this.isVisible = function () {
		if (!this.isSupported()) {
			return true;
		}

		return (!document[hidden]);
	};

	/**
	 * Registers an event listener for the `visibilitychange` event.
	 * This method defaults to a no-operation if the Page Visibility API is not
	 * supported.
	 *
	 * @method onChange
	 * @param callback {Function} The callback function to invoke when a
	 *   `visibilitychange` event is triggered.
	 * @return {Function} A remover method which unregisters the event listener.
	 */
	this.onChange = (function (isSupported) {
		if (!isSupported) {
			return function () {
				return function () {
				};
			};
		}

		return function (callback) {
			function eventListener() {
				callback(document[hidden]);
			}

			document.addEventListener(changeEvent, eventListener, false);
			return function () {
				document.removeEventListener(changeEvent, eventListener, false);
			};
		};
	})(this.isSupported());
};

/**
 * Adds an event listener for the "visibility change" event, if supported by the
 * browser.
 *
 * @method onVisibilityChange
 * @param callback {Function} The callback function to invoke when a
 *   `visibilitychange` event is triggered.
 * @return {Mixed} A function which removes the event listener if the Page
 *   Visibility API is supported, or the boolean `false` otherwise.
 * @for Canvace
 */
Canvace.onVisibilityChange = function (callback) {
	if (Canvace.Visibility.isSupported()) {
		return Canvace.Visibility.onChange(callback);
	}
	return false;
};

