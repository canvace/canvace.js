/**
 * TODO
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = (function () {
	return {
		now: (function () {
			if (typeof window.performance !== 'object' || typeof window.performance.now !== 'function') {
				return Date.now;
			} else {
				return window.performance.now;
			}
		})(),
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
