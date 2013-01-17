/**
 * Static class which wraps around the timing APIs offered by the browser.
 * Whenever possible, the methods provided by this class make use of a high
 * resolution, monotonic clock.
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = (function () {
	var now = (function () {
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
	})();

	return {
		/**
		 * This method returns a timestamp using `window.performance.now()`, if
		 * available, or `Date.now()` otherwise.
		 *
		 * @method now
		 * @return {Number} A number indicating a timestamp.
		 */
		now: now
	};
})();
