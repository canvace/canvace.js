/**
 * TODO
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
		 * TODO
		 *
		 * @method now
		 * @return {Number} TODO
		 */
		now: now,

		/**
		 * TODO
		 *
		 * @method startTime
		 * @return {Number} TODO
		 */
		startTime: (function () {
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
