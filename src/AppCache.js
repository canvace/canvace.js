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
 * Gives access to the `window.applicationCache` object, if supported.
 *
 * @class Canvace.AppCache
 * @static
 */
Canvace.AppCache = new function () {
	var handlers = {
		cached: new Canvace.MultiSet(),
		checking: new Canvace.MultiSet(),
		downloading: new Canvace.MultiSet(),
		progress: new Canvace.MultiSet(),
		error: new Canvace.MultiSet(),
		updateready: new Canvace.MultiSet(),
		noupdate: new Canvace.MultiSet(),
		obsolete: new Canvace.MultiSet()
	};

	if (window.applicationCache) {
		for (var eventName in handlers) {
			if (handlers.hasOwnProperty(eventName)) {
				applicationCache.addEventListener(eventName, (function (handlers) {
					return function (e) {
						handlers.fastForEach(function (handler) {
							handler(e);
						});
					};
				})(handlers[eventName]), false);
			}
		}
	}

	/**
	 * Registers an handler for the specified event. If the event name is
	 * not known, this method throws an exception (see the supported event
	 * names in the description of the `eventName` parameter).
	 *
	 * @method on
	 * @static
	 * @param eventName {String} The name of the event for which to listen.
	 * Can be one of:
	 *
	 * - cached
	 * - checking
	 * - downloading
	 * - progress
	 * - error
	 * - updateready
	 * - noupdate
	 * - obsolete
	 *
	 * @param handler {Function} The handler function.
	 * @return {Function} A function which can be used to unregister the
	 *  event handler.
	 * @example
	 *	Canvace.AppCache.on('updateready', function () {
	 *		var prompt = 'An update is available. ' +
	 *			'Do you want to reload the page now?';
	 *		if (window.confirm(prompt)) {
	 *			window.location.reload();
	 *		}
	 *	});
	 */
	this.on = function (eventName, handler) {
		if (handlers.hasOwnProperty(eventName)) {
			return handlers[eventName].add(handler);
		}

		throw ('no such event "' + eventName + '"');
	};
};

/**
 * Returns the current cache status. This is `undefined`, if the browser has
 * no support for the application cache, or it can be one of the following
 * values:
 *
 * - `Canvace.AppCache.UNCACHED`
 * - `Canvace.AppCache.IDLE`
 * - `Canvace.AppCache.CHECKING`
 * - `Canvace.AppCache.DOWNLOADING`
 * - `Canvace.AppCache.UPDATEREADY`
 * - `Canvace.AppCache.OBSOLETE`
 *
 * See this class's properties for a deeper explanation of these values.
 *
 * @method getStatus
 * @static
 * @return {Mixed} The current cache status value, or `undefined`.
 */
Canvace.AppCache.getStatus = function () {
	if (window.applicationCache) {
		return applicationCache.status;
	}
};

/**
 * Invokes the application cache download process.
 * This method is a no-operation if the application cache is not supported.
 *
 * @method update
 * @static
 */
Canvace.AppCache.update = function () {
	if (window.applicationCache) {
		return applicationCache.update();
	}
};

/**
 * Cancels the application cache download process.
 * This method is a no-operation if the application cache is not supported.
 *
 * @method abort
 * @static
 */
Canvace.AppCache.abort = function () {
	if (window.applicationCache) {
		return applicationCache.abort();
	}
};

/**
 * Switches to the most recent application cache, if there is a newer one.
 * If there isn't, throws an `InvalidStateError` exception.
 * This method is a no-operation if the application cache is not supported.
 *
 * You can use this method only when the cache status is
 * `Canvace.AppCache.UPDATEREADY`: the adviced way of using this method is
 * thus by using it inside an `updateready` event handler.
 *
 * Since all the resources that have been fetched _before_ the invocation of
 * this method will not be refreshed, it's sometimes simpler to just reload
 * the entire page.
 *
 * @method swapCache
 * @static
 * @example
 *	Canvace.AppCache.on('updateready', function () {
 *		Canvace.AppCache.swapCache();
 *	});
 */
Canvace.AppCache.swapCache = function () {
	if (window.applicationCache) {
		return applicationCache.swapCache();
	}
};

/**
 * This status indicates that no application cache is present.
 *
 * @property UNCACHED
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.UNCACHED = 0;

/**
 * This status indicates that no update to the application cache is
 * available.
 *
 * @property IDLE
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.IDLE = 1;

/**
 * This status indicates that the browser is currently checking for a cache
 * update.
 *
 * @property CHECKING
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.CHECKING = 2;

/**
 * This status indicates that the browser is currently downloading an updated
 * version of the application cache.
 *
 * @property DOWNLOADING
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.DOWNLOADING = 3;

/**
 * This status indicates that the browser has downloaded a more recent version
 * of the application cache.
 *
 * @property UPDATEREADY
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.UPDATEREADY = 4;

/**
 * This status indicates that the application cache currently in use is
 * obsolete (and will be deleted). This typically happens when the cache
 * manifest cannot be correctly retrieved (HTTP 404 or 410).
 *
 * @property OBSOLETE
 * @type Number
 * @static
 * @final
 */
Canvace.AppCache.OBSOLETE = 5;
