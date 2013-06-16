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
	 * by using the {{#crossLink "Canvace.Ajax/get"}}{{/crossLink}},
	 * {{#crossLink "Canvace.Ajax/post"}}{{/crossLink}},
	 * {{#crossLink "Canvace.Ajax/put"}}{{/crossLink}},
	 * {{#crossLink "Canvace.Ajax/_delete"}}{{/crossLink}} and
	 * {{#crossLink "Canvace.Ajax/getJSON"}}{{/crossLink}} methods.
	 *
	 * @class Canvace.Ajax.Request
	 * @constructor
	 * @param options {Object} A dictionary containing the options to use for
	 * the request.
	 * @param options.method {String} Indicates the HTTP method to use.
	 * @param options.url {String} Indicates the URL of the requested resource.
	 *
	 * Do not include a hash part, as a `?` and URL-encoded data will be
	 * directly appended in case of `GET` requests with data.
	 * @param [options.data] {Object} Provides custom parameters to pass to the
	 * server. They will be URL-encoded and appended to the URL in case of a GET
	 * request and sent in the request body in all other cases.
	 *
	 * The specified object may contain nested objects and arrays at any depth.
	 * @param [options.headers] {Object} Allows to specify HTTP request headers
	 * to send.
	 * Each key of the specified dictionary is a header name, while each value
	 * is the corresponding value. For example, to specify `Content-Type` and
	 * `Accept` headers:
	 *
	 *	{
	 *		'Content-Type': 'application/x-www-form-urlencoded'
	 *		'Accept': 'application/json'
	 *	}
	 *
	 * @param [options.type=''] {String} Indicates the way the browser should
	 * interpret the resource contents. This can be an empty string, `'text'`,
	 * `'json'`, `'document'`, `'blob'` or `'arraybuffer'`.
	 *
	 * Defaults to an empty string, which means the same as `'text'`.
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
	 * @example
	 *	Canvace.Ajax.post({
	 *		url: '/threads',
	 *		data: {
	 *			subject: 'Great news',
	 *			message: 'Lorem ipsum dolor sit blah blah'
	 *		},
	 *		type: 'json',
	 *		load: function (response) {
	 *			if (response.success) {
	 *				window.location = '/threads/' + response.id;
	 *			} else {
	 *				alert(response.message);
	 *			}
	 *		},
	 *		error: function (statusCode, statusText) {
	 *			alert(statusText);
	 *		}
	 *	});
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

			function setHeaders(headers) {
				for (var key in headers) {
					if (headers.hasOwnProperty(key)) {
						xhr.setRequestHeader(key, headers[key]);
					}
				}
			}

			setHeaders(headers);
			setHeaders(options.headers);

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
		 * complete.
		 *
		 * @method onLoad
		 * @chainable
		 * @param [callback] {Function} The callback function to invoke when the
		 * loading is complete.
		 * @param callback.response {Mixed} the response object, as interpreted
		 * according to the response type specified in the constructor.
		 * @example
		 *	var request = Canvace.Ajax.get('/data/stage1.json');
		 *	request.onLoad = function (stageData) {
		 *		// ...
		 *	};
		 */
		this.onLoad = function (callback) {
			options.load = callback;
			return thisObject;
		};

		/**
		 * Registers a callback function to be invoked in case of load errors.
		 *
		 * @method onError
		 * @chainable
		 * @param [callback] {Function} The callback function to invoke when
		 * the loading aborts with an error.
		 * @param callback.statusCode {Number} The HTTP status code.
		 * @param callback.statusText {String} The HTTP status text.
		 * @example
		 *	var request = Canvace.Ajax.get('/data/stage1.json');
		 *	request.onError = function (statusCode, statusText) {
		 *		alert(statusText);
		 *	};
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
				return (function () {
					var options = {};
					/*
					 * XXX the object must be entirely copied because the one
					 * specified to Request must not be a user-managed object as
					 * Request will be needing it even after sending the
					 * request.
					 */
					for (var key in parameters[0]) {
						if (parameters[0].hasOwnProperty(key)) {
							options[key] = parameters[0][key];
						}
					}
					options.method = method;
					return new Request(options);
				}());
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
			return (function () {
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
			}());
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
	 * Issues a `GET` HTTP request and returns a corresponding new
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} object.
	 *
	 * @method get
	 * @for Canvace.Ajax
	 * @static
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [data] {Object} Optional custom parameters to send to the server.
	 * Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [load] {Function} An optional callback function that gets called
	 * as soon as the server response arrives and the request completes
	 * successfully. Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	Canvace.Ajax.get('/data/stage1.json', function (stageData) {
	 *		// ...
	 *	}, 'json');
	 */
	this.get = bindAjaxRequest('GET');

	/**
	 * Issues a `POST` HTTP request and returns a corresponding new
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} object.
	 *
	 * @method post
	 * @for Canvace.Ajax
	 * @static
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [data] {Object} Optional custom parameters to send to the server.
	 * Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [load] {Function} An optional callback function that gets called
	 * as soon as the server response arrives and the request completes
	 * successfully. Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	Canvace.Ajax.post('/threads', {
	 *		subject: 'Great news',
	 *		message: 'Lorem ipsum dolor sit blah blah'
	 *	}, function (response) {
	 *		window.location = '/threads/' + response.threadId;
	 *	}, 'json');
	 */
	this.post = bindAjaxRequest('POST');

	/**
	 * Issues a `PUT` HTTP request and returns a corresponding new
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} object.
	 *
	 * @method put
	 * @for Canvace.Ajax
	 * @static
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [data] {Object} Optional custom parameters to send to the server.
	 * Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [load] {Function} An optional callback function that gets called
	 * as soon as the server response arrives and the request completes
	 * successfully. Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	Canvace.Ajax.put('/user', {
	 *		profilePicture: 'http://www.gravatar.com/avatar/blahblah'
	 *	}, function (response) {
	 *		if (!response.success) {
	 *			alert(response.message);
	 *		}
	 *	}, 'json');
	 */
	this.put = bindAjaxRequest('PUT');

	/**
	 * Issues a `DELETE` HTTP request and returns a corresponding new
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} object.
	 *
	 * @method _delete
	 * @for Canvace.Ajax
	 * @static
	 * @param url {Mixed} This first parameter is either a string representing
	 * the URL of the requested resource, or a dictionary of options to pass to
	 * the constructor of {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}}.
	 *
	 * See its documentation for more details about the allowed options.
	 * @param [data] {Object} Optional custom parameters to send to the server.
	 * Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [load] {Function} An optional callback function that gets called
	 * as soon as the server response arrives and the request completes
	 * successfully. Ignored if the first parameter is not a string.
	 *
	 * See the {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} constructor
	 * for more information.
	 * @param [type] {String} Indicates how the browser should interpret the
	 * resource contents. Ignored if the first parameter is not a string.
	 * Defaults to an empty string.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	Canvace.Ajax._delete('/threads', {
	 *		id: 1234
	 *	}, function (response) {
	 *		if (response.success) {
	 *			alert('Thread deleted');
	 *		} else {
	 *			alert(response.message);
	 *		}
	 *	});
	 */
	this._delete = bindAjaxRequest('DELETE');

	/**
	 * Retrieves a resource by using a `GET` HTTP request and interprets its
	 * contents as JSON.
	 *
	 * Returns a new {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} object.
	 *
	 * @method getJSON
	 * @static
	 * @param url {String} The URL of the requested JSON resource.
	 * @param [onLoad] {Function} The callback function to invoke when the
	 * loading is complete. See the `onLoad` method of
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
	 * @param [onError] {Function} The callback function to invoke when the
	 * loading aborts with an error. See the `onError` method of
	 * {{#crossLink "Canvace.Ajax.Request"}}{{/crossLink}} for details.
	 * @return {Canvace.Ajax.Request} The instantiated request object.
	 * @example
	 *	Canvace.Ajax.getJSON('/data/stage1.json', function (stageData) {
	 *		// ...
	 *	}, function (statusCode, statusText) {
	 *		alert(statusText);
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
