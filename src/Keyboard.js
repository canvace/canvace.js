if (typeof window.KeyEvent === 'undefined') {
	window.KeyEvent = {
		DOM_VK_CANCEL: 3,
		DOM_VK_HELP: 6,
		DOM_VK_BACK_SPACE: 8,
		DOM_VK_TAB: 9,
		DOM_VK_CLEAR: 12,
		DOM_VK_RETURN: 13,
		DOM_VK_ENTER: 14,
		DOM_VK_SHIFT: 16,
		DOM_VK_CONTROL: 17,
		DOM_VK_ALT: 18,
		DOM_VK_PAUSE: 19,
		DOM_VK_CAPS_LOCK: 20,
		DOM_VK_KANA: 21,
		DOM_VK_HANGUL: 21,
		DOM_VK_EISU: 22,
		DOM_VK_JUNJA: 23,
		DOM_VK_FINAL: 24,
		DOM_VK_HANJA: 25,
		DOM_VK_KANJI: 25,
		DOM_VK_ESCAPE: 27,
		DOM_VK_CONVERT: 28,
		DOM_VK_NONCONVERT: 29,
		DOM_VK_ACCEPT: 30,
		DOM_VK_MODECHANGE: 31,
		DOM_VK_SPACE: 32,
		DOM_VK_PAGE_UP: 33,
		DOM_VK_PAGE_DOWN: 34,
		DOM_VK_END: 35,
		DOM_VK_HOME: 36,
		DOM_VK_LEFT: 37,
		DOM_VK_UP: 38,
		DOM_VK_RIGHT: 39,
		DOM_VK_DOWN: 40,
		DOM_VK_SELECT: 41,
		DOM_VK_PRINT: 42,
		DOM_VK_EXECUTE: 43,
		DOM_VK_PRINTSCREEN: 44,
		DOM_VK_INSERT: 45,
		DOM_VK_DELETE: 46,
		DOM_VK_0: 48,
		DOM_VK_1: 49,
		DOM_VK_2: 50,
		DOM_VK_3: 51,
		DOM_VK_4: 52,
		DOM_VK_5: 53,
		DOM_VK_6: 54,
		DOM_VK_7: 55,
		DOM_VK_8: 56,
		DOM_VK_9: 57,
		DOM_VK_COLON: 58,
		DOM_VK_SEMICOLON: 59,
		DOM_VK_LESS_THAN: 60,
		DOM_VK_EQUALS: 61,
		DOM_VK_GREATER_THAN: 62,
		DOM_VK_QUESTION_MARK: 63,
		DOM_VK_AT: 64,
		DOM_VK_A: 65,
		DOM_VK_B: 66,
		DOM_VK_C: 67,
		DOM_VK_D: 68,
		DOM_VK_E: 69,
		DOM_VK_F: 70,
		DOM_VK_G: 71,
		DOM_VK_H: 72,
		DOM_VK_I: 73,
		DOM_VK_J: 74,
		DOM_VK_K: 75,
		DOM_VK_L: 76,
		DOM_VK_M: 77,
		DOM_VK_N: 78,
		DOM_VK_O: 79,
		DOM_VK_P: 80,
		DOM_VK_Q: 81,
		DOM_VK_R: 82,
		DOM_VK_S: 83,
		DOM_VK_T: 84,
		DOM_VK_U: 85,
		DOM_VK_V: 86,
		DOM_VK_W: 87,
		DOM_VK_X: 88,
		DOM_VK_Y: 89,
		DOM_VK_Z: 90,
		DOM_VK_WIN: 91,
		DOM_VK_CONTEXT_MENU: 93,
		DOM_VK_SLEEP: 95,
		DOM_VK_NUMPAD0: 96,
		DOM_VK_NUMPAD1: 97,
		DOM_VK_NUMPAD2: 98,
		DOM_VK_NUMPAD3: 99,
		DOM_VK_NUMPAD4: 100,
		DOM_VK_NUMPAD5: 101,
		DOM_VK_NUMPAD6: 102,
		DOM_VK_NUMPAD7: 103,
		DOM_VK_NUMPAD8: 104,
		DOM_VK_NUMPAD9: 105,
		DOM_VK_MULTIPLY: 106,
		DOM_VK_ADD: 107,
		DOM_VK_SEPARATOR: 108,
		DOM_VK_SUBTRACT: 109,
		DOM_VK_DECIMAL: 110,
		DOM_VK_DIVIDE: 111,
		DOM_VK_F1: 112,
		DOM_VK_F2: 113,
		DOM_VK_F3: 114,
		DOM_VK_F4: 115,
		DOM_VK_F5: 116,
		DOM_VK_F6: 117,
		DOM_VK_F7: 118,
		DOM_VK_F8: 119,
		DOM_VK_F9: 120,
		DOM_VK_F10: 121,
		DOM_VK_F11: 122,
		DOM_VK_F12: 123,
		DOM_VK_F13: 124,
		DOM_VK_F14: 125,
		DOM_VK_F15: 126,
		DOM_VK_F16: 127,
		DOM_VK_F17: 128,
		DOM_VK_F18: 129,
		DOM_VK_F19: 130,
		DOM_VK_F20: 131,
		DOM_VK_F21: 132,
		DOM_VK_F22: 133,
		DOM_VK_F23: 134,
		DOM_VK_F24: 135,
		DOM_VK_NUM_LOCK: 144,
		DOM_VK_SCROLL_LOCK: 145,
		DOM_VK_CIRCUMFLEX: 160,
		DOM_VK_EXCLAMATION: 161,
		DOM_VK_DOUBLE_QUOTE: 162,
		DOM_VK_HASH: 163,
		DOM_VK_DOLLAR: 164,
		DOM_VK_PERCENT: 165,
		DOM_VK_AMPERSAND: 166,
		DOM_VK_UNDERSCORE: 167,
		DOM_VK_OPEN_PAREN: 168,
		DOM_VK_CLOSE_PAREN: 169,
		DOM_VK_ASTERISK: 170,
		DOM_VK_PLUS: 171,
		DOM_VK_PIPE: 172,
		DOM_VK_HYPHEN_MINUS: 173,
		DOM_VK_OPEN_CURLY_BRACKET: 174,
		DOM_VK_CLOSE_CURLY_BRACKET: 175,
		DOM_VK_TILDE: 176,
		DOM_VK_COMMA: 188,
		DOM_VK_PERIOD: 190,
		DOM_VK_SLASH: 191,
		DOM_VK_BACK_QUOTE: 192,
		DOM_VK_OPEN_BRACKET: 219,
		DOM_VK_BACK_SLASH: 220,
		DOM_VK_CLOSE_BRACKET: 221,
		DOM_VK_QUOTE: 222,
		DOM_VK_META: 224,
		DOM_VK_ALTGR: 225,
		DOM_KEY_LOCATION_STANDARD: 0,
		DOM_KEY_LOCATION_LEFT: 1,
		DOM_KEY_LOCATION_RIGHT: 2,
		DOM_KEY_LOCATION_NUMPAD: 3,
		DOM_KEY_LOCATION_MOBILE: 4,
		DOM_KEY_LOCATION_JOYSTICK: 5
	};
}

/**
 * Helper class that eases cross-browser keyboard input management.
 *
 * @class Canvace.Keyboard
 * @constructor
 * @param element {HTMLElement} A DOM element used to capture keyboard input.
 * @param [preventDefaultActions] {Boolean} Indicates whether default actions
 * must be automatically prevented by the `Keyboard` class for handled keys.
 * Unhandled keys keep their default behavior.
 *
 * This argument defaults to `true`.
 */
Canvace.Keyboard = function (element, preventDefaultActions) {
	function Handlers() {
		var handlers = {};
		function register(keyCode, handler) {
			if (!(keyCode in handlers)) {
				handlers[keyCode] = new Canvace.MultiSet();
			}
			return handlers[keyCode].add(handler || function () {});
		}
		this.register = function (keyCode, handler) {
			if (typeof keyCode === 'number') {
				return register(keyCode, handler);
			} else {
				var removers = [];
				for (var i in keyCode) {
					removers.push(register(keyCode[i], handler));
				}
				return function () {
					for (var i in removers) {
						removers[i]();
					}
				};
			}
		};
		this.fire = function (keyCode) {
			if (keyCode in handlers) {
				handlers[keyCode].fastForEach(function (handler) {
					handler(keyCode);
				});
				return true;
			} else {
				return false;
			}
		};
	}

	var keys = {};
	var prevent = {};
	var keyDownHandlers = new Handlers();
	var keyUpHandlers = new Handlers();
	var keyPressHandlers = new Handlers();

	if ((preventDefaultActions === true) || (typeof preventDefaultActions === 'undefined')) {
		element.addEventListener('keydown', function (event) {
			var code = event.charCode || event.keyCode;
			if (keys[code]) {
				if (prevent[code]) {
					event.preventDefault();
				}
			} else {
				keys[code] = true;
				if (keyDownHandlers.fire(code)) {
					prevent[code] = true;
					event.preventDefault();
				}
			}
		}, false);
		element.addEventListener('keypress', function (event) {
			if (keyPressHandlers.fire(event.charCode || event.keyCode)) {
				event.preventDefault();
			}
		}, false);
		element.addEventListener('keyup', function (event) {
			var code = event.charCode || event.keyCode;
			delete keys[code];
			delete prevent[code];
			if (keyUpHandlers.fire(code)) {
				event.preventDefault();
			}
		}, false);
	} else {
		element.addEventListener('keydown', function (event) {
			var code = event.charCode || event.keyCode;
			if (!keys[code]) {
				keys[code] = true;
				keyDownHandlers.fire(code);
			}
		}, false);
		element.addEventListener('keypress', function (event) {
			keyPressHandlers.fire(event.charCode || event.keyCode);
		}, false);
		element.addEventListener('keyup', function (event) {
			var code = event.charCode || event.keyCode;
			delete keys[code];
			keyUpHandlers.fire(code);
		}, false);
	}

	/**
	 * Indicates whether the key identified by the specified virtual key code is
	 * currently pressed. You can safely use DOM\_VK\_XXX codes from the
	 * `KeyEvent` global object: Canvace normalizes it across browsers.
	 *
	 * @method isKeyDown
	 * @param keyCode {Number} The virtual key code to test.
	 * @return {Boolean} `true` if the specified key is currently pressed,
	 * `false` otherwise.
	 */
	this.isKeyDown = function (keyCode) {
		return keyCode in keys;
	};

	/**
	 * Indicates whether the specified keys are currently pressed. This method
	 * accepts any number of arguments and each argument is a virtual key code.
	 * You can safely use the DOM\_VK\_XXX codes from the `KeyEvent` global
	 * object: Canvace normalizes it across browsers.
	 *
	 * @method areKeysDown
	 * @param [keyCodes]* {Number} Any number of virtual key codes.
	 * @return {Boolean} `false` if any of the specified keys is not currently
	 * pressed, `true` otherwise. If no keys are specified `true` is returned.
	 */
	this.areKeysDown = function () {
		for (var i in arguments) {
			if (!keys[arguments[i]]) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Registers a key handler that gets called when the specified key or keys
	 * are pressed.
	 *
	 * This method returns a function that unregister the registered handler.
	 * The returned function does not receive any arguments, does not return
	 * anything and is idempotent: it does not have any effects when called
	 * again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyDown
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param [handler] {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 *
	 * When not specified defaults to an empty function.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyDown = keyDownHandlers.register;

	/**
	 * Registers a key handler that gets called when the specified key is
	 * depressed or all of the specified keys are depressed, depending on
	 * whether you specify one or more key codes.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * The returned function does not receive any arguments, does not return
	 * anything and is idempotent: it does not have any effects when called
	 * again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyUp
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param [handler] {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 *
	 * When not specified defaults to an empty function.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyUp = function (keyCode, handler) {
		if (typeof keyCode !== 'number') {
			return keyUpHandlers.register(keyCode, function () {
				for (var i in keyCode) {
					if (keys[keyCode[i]]) {
						return;
					}
				}
				return handler.apply(this, arguments);
			});
		} else {
			return keyUpHandlers.register(keyCode, handler);
		}
	};

	/**
	 * Registers a key handler that gets called after the specified key or keys
	 * are pressed.
	 *
	 * The only difference between the "keyDown" and "keyPress" events of this
	 * class is that, in case a key is held down, the latter is fired multiple
	 * times while the former is fired only once.
	 *
	 * The only difference between the "keyUp" and "keyPress" events of this
	 * class is that the handlers for the latter gets all called before the
	 * handlers for the former.
	 *
	 * This method returns a function that unregister the registered handler.
	 * The returned function does not receive any arguments, does not
	 * return anything and is idempotent: it does not have any effects when
	 * called again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyPress
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param [handler] {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 *
	 * When not specified defaults to an empty function.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyPress = keyPressHandlers.register;
};
