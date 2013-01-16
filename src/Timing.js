/**
 * TODO
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = (function () {
	return {
		/**
		 * TODO
		 *
		 * @method now
		 * @return {Number} TODO
		 */
		now: (function () {
			if (typeof window.performance !== 'object' || typeof window.performance.now !== 'function') {
				return function () {
					return Date.now();
				};
			} else {
				return function () {
					return window.performance.now();
				};
			}
		})(),

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
				return Canvace.Timing.now;
			}
		})()
	};
})();
