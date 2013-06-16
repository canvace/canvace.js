/**
 * This class provides a simple interface to perform AJAX requests.
 *
 * @class Canvace.Ajax
 * @static
 * @example
 *	Canvace.Ajax.getJSON('/data/stage1.json', function (stageData) {
 *		// ...
 *	});
 */
Canvace.Ajax = new (function () {
	/**
	 * Represents an open AJAX request.
	 *
	 * You cannot instantiate this class directly: you can obtain a new instance
	 * by using the `get`, `post` and `getJSON` methods of
	 * {{#crossLink "Canvace.Ajax"}}{{/crossLink}}.
	 *
	 * @class Canvace.Ajax.Request
	 * @constructor
	 * @param options {Object} A dictionary containing the options to use for
	 * the request.
	 * @param options.method {String} Indicates the HTTP method to use.
	 * @param options.url {String} Indicates the URL of the requested resource.
	 * @param [options.data] {Object} Provides custom parameters to pass to the
	 * server. They will be URL-encoded and appended to the URL in case of a GET
	 * request and sent in the request body in all other cases.
	 * @param [options.type=''] {String} Indicates the way the browser should
	 * interpret the resource contents. This can be an empty string, `'text'`,
	 * `'json'`, `'document'`, `'blob'` or `'arraybuffer'`. Defaults to an empty
	 * string, which means the same as `'text'`.
	 * @param [options.async=true] {Boolean} Indicates whether the request is
	 * asynchronous (`true`) or blocking (`false`). Defaults to `true`.
	 * @param [options.user=''] {String} The user name to use when
	 * authentication is required. Defaults to an empty string.
	 * @param [options.password=''] {String} The user password to use when
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

		function send(url, headers, data) {
			xhr.open(
				options.method,
				url,
				options.async,
				options.user,
				options.password
				);

			// XXX Currently 'json' is not equally supported across browsers
			xhr.responseType = (options.type === 'json') ? 'text' : options.type;

			for (var key in headers || {}) {
				if (headers.hasOwnProperty(key)) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}

			if (arguments.length < 3) {
				xhr.send();
			} else {
				xhr.send(data);
			}
		}

		if (typeof options.data !== 'undefined') {
			var encodedData = (function flatten(prefix, data) {
				switch (typeof data) {
				case 'undefined':
					return [prefix + 'undefined'];
				case 'boolean':
				case 'number':
				case 'string':
					return [prefix + encodeURIComponent('' + data)];
				case 'object':
					var parameters = [];
					if (Array.isArray(data)) {
						data.forEach(function (element, index) {
							parameters.push.apply(parameters, flatten(encodeURIComponent(prefix + '[' + index + ']') + '=', element));
						});
					} else if (data) {
						for (var key in data) {
							parameters.push.apply(parameters, flatten(encodeURIComponent(prefix + '.' + key) + '=', data[key]));
						}
					} else {
						return [prefix + 'null'];
					}
					return parameters;
				default:
					throw 'invalid data';
				}
			}('', options.data)).join('&');

			if (options.method.toUpperCase() !== 'GET') {
				send(options.url, {
					'Content-Type': 'application/x-www-form-urlencoded'
				}, encodedData);
			} else {
				send(options.url + '?' + encodedData);
			}
		} else {
			send(options.url);
		}

		/**
		 * Registers a callback function to be invoked when the loading is
		 * complete. This function is passed the response object, as interpreted
		 * according to the response type specified in the constructor.
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
		if (parameters.length < 2) {
			if (typeof parameters[0] !== 'object') {
				return new Request({
					method: method,
					url: parameters[0]
				});
			} else {
				parameters[0].method = method;
				return new Request(parameters[0]);
			}
		} else if (parameters.length < 3) {
			if (typeof parameters[1] !== 'function') {
				return new Request({
					method: method,
					url: parameters[0],
					data: parameters[1]
				});
			} else {
				return new Request({
					method: method,
					url: parameters[0],
					load: parameters[1]
				});
			}
		} else if (parameters.length < 4) {
			var options = {
				method: method,
				url: parameters[0]
			};
			if ((typeof parameters[1] === 'object') &&
				(typeof parameters[2] === 'function'))
			{
				options.data = parameters[1];
				options.load = parameters[2];
			} else if ((typeof parameters[1] === 'function') &&
				(typeof parameters[2] === 'string'))
			{
				options.load = parameters[1];
				options.type = parameters[2];
			} else {
				throw 'invalid arguments';
			}
			return new Request(options);
		} else {
			return new Request({
				method: method,
				url: parameters[0],
				data: parameters[1],
				load: parameters[2],
				type: parameters[3]
			});
		}
	}

	function bindAjaxRequest(method) {
		return function () {
			return ajaxRequest(method, arguments);
		};
	}

	/**
	 * Issues a `GET` HTTP request.
	 *
	 * @method get
	 * @for Canvace.Ajax
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this.get = bindAjaxRequest('GET');

	/**
	 * Issues a `POST` HTTP request.
	 *
	 * @method post
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this.post = bindAjaxRequest('POST');

	/**
	 * Issues a `PUT` HTTP request.
	 *
	 * @method put
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this.put = bindAjaxRequest('PUT');

	/**
	 * Issues a `DELETE` HTTP request.
	 *
	 * @method _delete
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 */
	this._delete = bindAjaxRequest('DELETE');

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
