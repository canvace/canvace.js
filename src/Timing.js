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
		if (typeof window.performance !== 'object' || typeof window.performance.now !== 'function') {
			return function () {
				return Date.now();
			};
		} else {
			return function () {
				return window.performance.now();
			};
		}
	})();

	return {
		/**
		 * This method returns a timestamp using `window.performance.now()`, if
		 * available, or `Date.now()` otherwise.
		 *
		 * @method now
		 * @return {Number} A number indicating a timestamp.
		 */
		now: now,

		/**
		 * This method returns a timestamp that is suitable for being recorded
		 * as the starting time of an animation. All subsequent
		 * `Canvace.Timing.now()` calls should be considered relative to the
		 * value returned by this method.
		 *
		 * @example
		 *	var start = Canvace.Timing.animationStartTime();
		 *	requestAnimationFrame(function callback(now) {
		 *		var elapsed = (now - start);
		 *
		 *		// ...
		 *
		 *		requestAnimationFrame(callback);
		 *	});
		 *
		 * @method animationStartTime
		 * @return {Number} A number indicating a timestamp.
		 */
		animationStartTime: (function () {
			if ('mozAnimationStartTime' in window) {
				return function () {
					return window.mozAnimationStartTime;
				};
			} else {
				return now;
			}
		})()
	};
})();
