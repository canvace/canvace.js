/**
 * This class provides a simple interface to perform AJAX requests.
 *
 * @class Canvace.Ajax
 * @static
 */
Canvace.Ajax = new (function () {
	/**
	 * Represents an open AJAX request.
	 *
	 * You cannot instantiate this class directly: you can obtain a new
	 * instance by using the `get`, `post` and `getJSON` methods of
	 * {{#crossLink "Canvace.Ajax"}}{{/crossLink}}.
	 *
	 * @class Canvace.Ajax.Request
	 * @constructor
	 * @param options {Object} A dictionary containing the options to use for
	 * the request.
	 * @param options.method {String} Indicates the HTTP method to use.
	 * @param options.url {String} Indicates the URL of the requested resource.
	 * @param [options.type=''] {String} Indicates the way the browser should
	 * interpret the resource contents like. This can be an empty string,
	 * `'text'`, `'json'`, `'document'`, `'blob'` or `'arraybuffer'`.
	 * Defaults to an empty string, which means the same as `'text'`.
	 * @param [options.async=true] {Boolean} Indicates whether the request is
	 * asynchronous (`true`) or blocking (`false`). Defaults to `true`.
	 * @param [options.user=''] {String} The user name to use when an
	 * authentication is required. Defaults to an empty string.
	 * @param [options.password=''] {String} The user password to use when an
	 * authentication is required. Defaults to an empty string.
	 * @param [options.load] {Function} The callback function to invoke when
	 * the loading is complete. See the `onLoad` method for details.
	 * @param [options.error] {Function} The callback function to invoke when
	 * the loading aborts with an error. See the `onError` method for details.
	 */
	function Request(options) {
		var thisObject = this;

		if (typeof options.async === 'undefined') {
			options.async = true;
		}
		if (typeof options.type === 'undefined') {
			options.type = '';
		}
		if (typeof options.user === 'undefined') {
			options.user = '';
		}
		if (typeof options.password === 'undefined') {
			options.password = '';
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load', function () {
			if (typeof options.load === 'function') {
				options.load.call(thisObject, (function () {
					switch (options.type) {
					case '':
					case 'text':
						return xhr.responseText;
					case 'json':
						return JSON.parse(xhr.responseText);
					case 'document':
						return xhr.responseXML;
					default:
						return xhr.response;
					}
				}()));
			}
		}, false);
		xhr.addEventListener('error', function () {
			if (typeof options.error === 'function') {
				options.error.call(thisObject, xhr.status, xhr.statusText);
			}
		}, false);

		xhr.open(
			options.method,
			options.url,
			options.async,
			options.user,
			options.password
			);

		// Currently 'json' is not equally supported across browsers
		xhr.responseType = (options.type === 'json') ? 'text' : options.type;

		xhr.send();

		/**
		 * Registers a callback function to be invoked when the loading is
		 * complete. This function gets passed the response
		 * object, as interpreted according to the response type specified in
		 * the constructor.
		 *
		 * @method onLoad
		 * @param [callback] {Function} The callback function to invoke when
		 * the loading is complete.
		 * @chainable
		 */
		this.onLoad = function (callback) {
			options.load = callback;
			return thisObject;
		};

		/**
		 * Registers a callback function to be invoked in case of load errors.
		 * This function gets passed the HTTP status code and the HTTP status
		 * text.
		 *
		 * @method onError
		 * @param [callback] {Function} The callback function to invoke when
		 * the loading aborts with an error.
		 * @chainable
		 */
		this.onError = function (callback) {
			options.error = callback;
			return thisObject;
		};
	}

	function ajaxRequest(method, parameters) {
		var options = {
			method: method
		};

		if (parameters.length === 1) {
			if (typeof parameters[0] === 'object') {
				parameters[0].method = method;
				return new Request(parameters[0]);
			}
		} else if (parameters.length === 2) {
			options.type = parameters[1];
		} else {
			throw 'wrong number of arguments';
		}

		options.url = parameters[0];
		return new Request(options);
	}

	/**
	 * Retrieves a resource by using a `GET` HTTP request.
	 *
	 * @method get
	 * @for Canvace.Ajax
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents like. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this.get = function () {
		return ajaxRequest('GET', arguments);
	};

	/**
	 * Retrieves a resource by using a `POST` HTTP request.
	 *
	 * @method post
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents like. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this.post = function () {
		return ajaxRequest('POST', arguments);
	};

	/**
	 * Retrieves a resource by using a `GET` HTTP request and interprets its
	 * contents as JSON.
	 *
	 * @method getJSON
	 * @param url {String} The URL of the requested JSON resource.
	 * @param [onLoad] {Function} The callback function to invoke when the
	 * loading is complete. See the `onLoad` method of
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
	 * @param [onError] {Function} The callback function to invoke when the
	 * loading aborts with an error. See the `onError` method of
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	var request = Canvace.Ajax.getJSON('data.json');
	 *	request.onLoad(function (response) {
	 *		console.dir(response);
	 *	}).onError(function () {
	 *		alert('Load error! :(');
	 *	});
	 */
	this.getJSON = function (url, onLoad, onError) {
		return Canvace.Ajax.get({
			url: url,
			type: 'json',
			load: onLoad,
			error: onError
		});
	};
})();
