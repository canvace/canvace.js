/**
 * TODO
 *
 * @class Canvace.Timing
 * @static
 */
Canvace.Timing = (function () {
	var thisObject = {};

	thisObject.now = (function () {
		if (typeof window.performance.now !== 'function') {
			return Date.now;
		}

		return function () {
			return window.performance.now();
		};
	}());

	thisObject.startTime = function () {
		return window.mozAnimationStartTime || Canvace.Timing.now();
	};

	return thisObject;
}());
