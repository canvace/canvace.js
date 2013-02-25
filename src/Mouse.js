/**
 * Helper class that eases cross-browser mouse input management.
 *
 * @class Canvace.Mouse
 * @constructor
 * @param element {HTMLElement} The HTML element that captures mouse input. This
 * is usually the HTML5 canvas.
 */
Canvace.Mouse = function (element) {
	var moveHandlers = new Canvace.MultiSet();
	var downHandlers = new Canvace.MultiSet();
	var upHandlers = new Canvace.MultiSet();
	var dragHandlers = new Canvace.MultiSet();
	var wheelHandlers = new Canvace.MultiSet();

	var dragging = false, button = 0;
	var x0, y0;

	element.addEventListener('mousedown', function (event) {
		var x = event.clientX - element.offsetLeft;
		var y = event.clientY - element.offsetTop;
		button = event.button;
		dragging = true;

		x0 = x;
		y0 = y;
		downHandlers.fastForEach(function (handler) {
			handler(x, y, event.button);
		});
	}, false);
	element.addEventListener('mousemove', function (event) {
		var x = event.clientX - element.offsetLeft;
		var y = event.clientY - element.offsetTop;
		moveHandlers.fastForEach(function (handler) {
			handler(x, y);
		});
		if (dragging) {
			dragHandlers.fastForEach(function (handler) {
				handler(x0, y0, x, y, button);
			});
			x0 = x;
			y0 = y;
		}
	}, false);
	element.addEventListener('mouseup', function (event) {
		var x = event.clientX - element.offsetLeft;
		var y = event.clientY - element.offsetTop;
		dragging = false;
		upHandlers.fastForEach(function (handler) {
			handler(x, y, event.button);
		});
	}, false);

	if (typeof element.onwheel !== 'undefined') {
		element.addEventListener('wheel', function (event) {
			var x = event.clientX - element.offsetLeft;
			var y = event.clientY - element.offsetTop;
			wheelHandlers.fastForEach(function (handler) {
				handler(x, y, -event.deltaX, -event.deltaY);
			});
		}, false);
	} else if (typeof element.onmousewheel !== 'undefined') {
		element.addEventListener('mousewheel', function (event) {
			var x = event.clientX - element.offsetLeft;
			var y = event.clientY - element.offsetTop;
			wheelHandlers.fastForEach(function (handler) {
				handler(x, y, event.wheelDeltaX, event.wheelDeltaY);
			});
		}, false);
	}

	// TODO capture touch events

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse is moved over the HTML element.
	 *
	 * The specified function receives two arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time the mouse is moved.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onMove
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onMove = function (handler) {
		return moveHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time a mouse button is pressed over the HTML element.
	 *
	 * The specified function receives three arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner, and `button`, indicating which mouse button has been pressed
	 * (`0` for left button, `1` for middle button, `2` for right button).
	 * The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time a mouse button is pressed.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onDown
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onDown = function (handler) {
		return downHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time a mouse button is depressed over the HTML element.
	 *
	 * The specified function receives three arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner, and `button`, indicating which mouse button has been pressed
	 * (`0` for left button, `1` for middle button, `2` for right button).
	 * The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time a mouse button is depressed.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onUp
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onUp = function (handler) {
		return upHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse is dragged over the HTML element.
	 *
	 * The specified function receives five arguments, `x0` and `y0`, indicating
	 * the last recorded coordinates of the mouse pointer before the drag event
	 * relative to the element's left top corner, `x` and `y`, indicating the
	 * current coordinates of the mouse pointer relative to the element's left
	 * top corner, and `button`, indicating which mouse button has initiated the
	 * drag event (`0` for left button, `1` for middle button, `2` for right
	 * button). The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * Multiple handlers may be registered.
	 *
	 * The same handler may also be registered more than once, in which case it
	 * gets called as many times as it was registered every time the mouse is
	 * dragged.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onDrag
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onDrag = function (handler) {
		return dragHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse wheel is used to scroll over the HTML element.
	 *
	 * The specified function receives four arguments, `x`, `y`, `dX` and `dY`,
	 * indicating the coordinates of the mouse pointer relative to the element's
	 * left top corner and the relative wheel movement in the X and Y
	 * directions. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time the mouse is moved.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onWheel
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives three arguments (the `x` and `y` coordinates of the
	 * mouse pointer, and the relative `dX` and `dY` movement of the mouse
	 * wheel) and its return value is ignored.
	 * The `dX` and `dY` arguments respectively assume positive values in case
	 * of a rightwards or upwards movement, and negative values in case of a
	 * leftwards or downwards movement.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onWheel = function (handler) {
		return wheelHandlers.add(handler);
	};
};
