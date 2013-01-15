/**
 * TODO
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = (function () {
	if (typeof window.performance.now === 'function') {
		return {
			now: function () {
				return window.performance.now();
			}
		};
	} else {
		return {
			now: Date.now
		};
	}
}());