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
