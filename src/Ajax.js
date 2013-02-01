/**
 * This class provides a simple interface to perform AJAX requests.
 *
 * @class Canvace.Ajax
 * @static
 */
Canvace.Ajax = (function () {
	/**
	 * Represents an open AJAX request.
	 *
	 * You cannot instantiate this class directly: you can obtain a new
	 * instance by using the `get`, `post` and `getJson` methods of
	 * {{#crossLink "Canvace.Ajax"}}{{/crossLink}}.
	 *
	 * @class Canvace.Ajax.Request
	 * @param options {Object} A dictionary containing the options to use for
	 * the request.
	 * @param options.method {String} Indicates the HTTP method to use.
	 * @param options.url {String} Indicates the URL of the requested resource.
	 * @param [options.type] {String} Indicates the way the browser should
	 * interpret the resource contents like. This can be an empty string,
	 * `'text'`, `'json'`, `'document'`, `'blob'` or `'arraybuffer'`.
	 * Defaults to an empty string, which means the same as `'text'`.
	 * @param [options.async] {Boolean} Indicates whether the request is
	 * asynchronous (`true`) or blocking (`false`). Defaults to `true`.
	 * @param [options.user] {String} The user name to use when an
	 * authentication is required. Defaults to an empty string.
	 * @param [options.password] {String} The user password to use when an
	 * authentication is required. Defaults to an empty string.
	 * @param [options.onload] {Function} The callback function to invoke when
	 * the loading is complete. See the `onLoad` method for details.
	 * @param [options.onerror] {Function} The callback function to invoke when
	 * the loading aborts with an error. See the `onError` method for details.
	 * @constructor
	 */
	var Request = function (options) {
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
			if (typeof options.onload === 'function') {
				options.onload((function () {
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
			if (typeof options.onerror === 'function') {
				options.onerror(xhr.status, xhr.statusText);
			}
		}, false);

		xhr.open(
			options.method,
			options.url,
			options.async,
			options.user,
			options.password);

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
			options.onload = callback;
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
			options.onerror = callback;
			return thisObject;
		};
	};

	var _ajaxRequest = function (method, parameters) {
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
	};

	return {
		/**
		 * Retrieves a resource by using a `GET` HTTP request.
		 *
		 * @method get
		 * @for Canvace.Ajax
		 * @param url {Mixed} This first parameter is either a string
		 * representing the URL of the requested resource, or a dictionary
		 * of options to pass to the constructor of
		 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
		 * See its documentation for more details about the allowed options.
		 * @param [type] {String} Indicates how the browser should interpret
		 * the resource contents like. Ignored if the first parameter is not a
		 * string. Defaults to an empty string.
		 * @return {Canvace.Ajax.Request} The instantiated request object.
		 */
		get: function () {
			return _ajaxRequest('GET', arguments);
		},

		/**
		 * Retrieves a resource by using a `POST` HTTP request.
		 *
		 * @method post
		 * @param url {Mixed} This first parameter is either a string
		 * representing the URL of the requested resource, or a dictionary
		 * of options to pass to the constructor of
		 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
		 * See its documentation for more details about the allowed options.
		 * @param [type] {String} Indicates how the browser should interpret
		 * the resource contents like. Ignored if the first parameter is not a
		 * string. Defaults to an empty string.
		 * @return {Canvace.Ajax.Request} The instantiated request object.
		 */
		post: function () {
			return _ajaxRequest('POST', arguments);
		},

		/**
		 * Retrieves a resource by using a `GET` HTTP request, and interprets
		 * its contents as JSON.
		 *
		 * @example
		 *	var req = Canvace.Ajax.getJson('loadstage.php?id=10');
		 *	req.onLoad(function (response) {
		 *		console.dir(response);
		 *	}).onError(function () {
		 *		alert('Load error! :(');
		 *	});
		 *
		 * @method getJson
		 * @param url {String} The URL of the requested JSON resource.
		 * @param [onload] {Function} The callback function to invoke when the
		 * loading is complete. See the `onLoad` method of
		 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
		 * @param [onerror] {Function} The callback function to invoke when the
		 * loading aborts with an error. See the `onError` method of
		 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
		 * @return {Canvace.Ajax.Request} The instantiated request object.
		 */
		getJson: function (url, onload, onerror) {
			return Canvace.Ajax.get({
				url: url,
				type: 'json',
				onload: onload,
				onerror: onerror
			});
		}
	};
}());