/**
 * This class provides useful methods for managing the rendering viewport and
 * the projection or picking of graphic elements in it.
 *
 * Note that the `width` and `height` attributes of the canvas may not change
 * after the `View` object is constructed, or inconsistent rendering may result.
 *
 * You do not usually need to construct a `View` object manually, as one is
 * automatically created by the `Stage` class.
 *
 * @class Canvace.View
 * @constructor
 * @param data {Object} The JSON data output by the Canvace Development
 * Environment.
 * @param canvas {HTMLCanvasElement} An HTML5 canvas element where rendering has
 * to be done.
 */
Canvace.View = function (data, canvas) {
	var mat = data.matrix;
	var inv = (function () {
		var det = mat[0][0] * mat[1][1] * mat[2][2] +
			mat[0][1] * mat[1][2] * mat[2][0] +
			mat[0][2] * mat[1][0] * mat[2][1] -
			mat[0][2] * mat[1][1] * mat[2][0] -
			mat[0][1] * mat[1][0] * mat[2][2] -
			mat[0][0] * mat[1][2] * mat[2][1];
		return [
			[(mat[1][1] * mat[2][2] - mat[2][1] * mat[1][2]) / det,
				(mat[0][2] * mat[2][1] - mat[2][2] * mat[0][1]) / det,
				(mat[0][1] * mat[1][2] - mat[1][1] * mat[0][2]) / det],
			[(mat[1][2] * mat[2][0] - mat[2][2] * mat[1][0]) / det,
				(mat[0][0] * mat[2][2] - mat[2][0] * mat[0][2]) / det,
				(mat[0][2] * mat[1][0] - mat[1][2] * mat[0][0]) / det],
			[(mat[1][0] * mat[2][1] - mat[2][0] * mat[1][1]) / det,
				(mat[0][1] * mat[2][0] - mat[2][1] * mat[0][0]) / det,
				(mat[0][0] * mat[1][1] - mat[1][0] * mat[0][1]) / det]
		];
	})();

	var x0 = data.x0;
	var y0 = data.y0;
	var width = canvas.width;
	var height = canvas.height;

	/**
	 * Computes the projected `x`, `y` and `z` coordinates of an element by
	 * right-multiplying an `(i, j, k)` vector by the projection matrix.
	 *
	 * Note that the computed `x` and `y` coordinates do not correspond to the
	 * actual on-screen coordinates because they vary depending on the X and Y
	 * offsets of the specific element.
	 *
	 * This method only calculates a "generic" projection, but the
	 * `projectElement` is more useful in that it calculates the actual
	 * coordinates.
	 *
	 * The computed coordinates are returned as an array containing three
	 * elements, respectively X, Y and Z.
	 *
	 * @method project
	 * @param i {Number} The I coordinate to project.
	 * @param j {Number} The J coordinate to project.
	 * @param k {Number} The K coordinate to project.
	 * @return {Array} An array containing the calculated `x`, `y` and `z`,
	 * respectively.
	 */
	this.project = function (i, j, k) {
		return [
			mat[0][0] * i + mat[0][1] * j + mat[0][2] * k,
			mat[1][0] * i + mat[1][1] * j + mat[1][2] * k,
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};

	/**
	 * Computes the projected `x`, `y` and `z` coordinates of the specified
	 * element by right-multiplying an `(i, j, k)` vector by the projection
	 * matrix and adding the X and Y offsets of the element.
	 *
	 * This method does not take into account the viewport offset (`drag` calls
	 * will not affect the result of `projectElement`).
	 *
	 * The computed coordinates are returned as an array containing three
	 * elements, respectively X, Y and Z.
	 *
	 * @method projectElement
	 * @param element {Object} A tile or entity descriptor. This object must
	 * have the same layout as tile and entity descriptors documented in
	 * Canvace's Output Format Guide. You can specify tiles and entities you
	 * find in JSON data output by the Canvace Development Environment.
	 * @param i {Number} The I coordinate to project.
	 * @param j {Number} The J coordinate to project.
	 * @param k {Number} The K coordinate to project.
	 * @return {Array} An array containing the calculated `x`, `y` and `z`,
	 * respectively.
	 */
	this.projectElement = function (element, i, j, k) {
		return [
			Math.round(mat[0][0] * i + mat[0][1] * j + mat[0][2] * k + element.offset.x),
			Math.round(mat[1][0] * i + mat[1][1] * j + mat[1][2] * k + element.offset.y),
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};

	/**
	 * Inverts the specified `x` and `y` projected coordinates returning the
	 * corresponding original `(i, j, k)` coordinates assuming that the
	 * projected point is located at the specified `k` coordinate in the
	 * original 3D space. This means that the `k` value in the returned
	 * `(i, j, k)` vector corresponds to the specified `k` value.
	 *
	 * This method is useful for implementing picking algorithms.
	 *
	 * The computed `(i, j, k)` vector is returned as an array of three
	 * elements, the `i`, `j` and `k` values respectively.
	 *
	 * @method unproject
	 * @param x {Number} The projected X value.
	 * @param y {Number} The projected Y value.
	 * @param k {Number} The K coordinate where the projected point is assumed
	 * to be.
	 * @return {Array} An array containing three elements, the `i`, `j` and `k`
	 * values, respectively.
	 */
	this.unproject = function (x, y, k) {
		var z = (k + inv[2][0] * (x0 - x) + inv[2][1] * (y0 - y)) / inv[2][2];
		var i = inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z;
		var j = inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z;
		return [i, j, k];
	};

	/**
	 * Inverts the specified `x` and `y` projected coordinates returning the
	 * integer `(i, j, k)` coordinates of the cell where the projected point is
	 * located, assuming they are located at layer `k`. The specified `k` value
	 * is simply returned as is in the resulting `(i, j, k)` vector.
	 *
	 * The resulting vector is returned as an object containing three integer
	 * fields: `i`, `j` and `k`.
	 *
	 * The only difference between this method and `unproject` is that the
	 * former always returns integer values (resulting from rounding) while the
	 * latter may return real values.
	 *
	 * @method getCell
	 * @param x {Number} The projected point's X coordinate.
	 * @param y {Number} The projected point's Y coordinate.
	 * @param k {Number} The K coordinate in the original 3D space where the
	 * projected point is assumed to be located.
	 * @return {Object} an object containing three properties, `i`, `j` and `k`.
	 */
	this.getCell = function (x, y, k) {
		var z = (k - inv[2][0] * (x - x0) - inv[2][1] * (y - y0)) / inv[2][2];
		var i = Math.round(inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z);
		var j = Math.round(inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z);
		return {
			i: i,
			j: j,
			k: k
		};
	};

	/**
	 * Returns the viewport's origin as an object containing two properties, `x`
	 * and `y`.
	 *
	 * @method getOrigin
	 * @return {Object} The viewport's origin as an object containing two
	 * properties, `x` and `y`.
	 */
	this.getOrigin = function () {
		return {
			x: x0,
			y: y0
		};
	};

	/**
	 * Returns the viewport width.
	 *
	 * @method getWidth
	 * @return {Number} The viewport width.
	 */
	this.getWidth = function () {
		return width;
	};

	/**
	 * Returns the viewport height.
	 *
	 * @method getHeight
	 * @return {Number} The viewport height.
	 */
	this.getHeight = function () {
		return height;
	};

	var dragHandlers = new Canvace.MultiSet();

	/**
	 * Drags the viewport by the specified `dx` and `dy` offsets.
	 *
	 * @method drag
	 * @param dx {Number} The drag offset along the X axis.
	 * @param dy {Number} The drag offset along the Y axis.
	 */
	this.drag = function (dx, dy) {
		x0 += dx;
		y0 += dy;
		dragHandlers.fastForEach(function (handler) {
			handler(x0, y0);
		});
	};

	/**
	 * Drags the viewport so that the origin be located at the specified `x` and
	 * `y` coordinates.
	 *
	 * @method dragTo
	 * @param x {Number} The new origin's X coordinate.
	 * @param y {Number} The new origin's Y coordinate.
	 */
	this.dragTo = function (x, y) {
		x0 = x;
		y0 = y;
		dragHandlers.fastForEach(function (handler) {
			handler(x0, y0);
		});
	};

	/**
	 * Register an event handler invoked every time the viewport's origin
	 * changes. This happens because of `drag` and `dragTo` calls.
	 *
	 * Multiple handlers may be registered. A handler may be registered more
	 * than once, in which case it gets called as many times as it was
	 * registered.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * If a handler was registered more than once, the returned function only
	 * removes its own registration, while other instances of the handler stay
	 * registered.
	 *
	 * @method onDrag
	 * @param handler {Function} A function that is invoked every time the
	 * viewport is dragged. The function receives two arguments, `x0` and `y0`,
	 * representing the new coordinates of the viewport's origin.
	 * @return {Function} A function that unregisters the handler. The returned
	 * function does not receive any arguments.
	 */
	this.onDrag = function (handler) {
		return dragHandlers.add(handler);
	};

	/**
	 * Manages the synchronization of the view on some specified entity instance
	 * of a stage, making the view always point at that entity.
	 *
	 * This class can be instantiated for a `View` using its
	 * `createSynchronizer` method. For more information on how it works, see
	 * the `createSynchronizer` method's reference.
	 *
	 * @class Canvace.View.Synchronizer
	 */
	function Synchronizer(targetAreaWidth, targetAreaHeight, delay) {
		/**
		 * "Ticks" the synchronizer, which tries to move the view according to
		 * the delay parameter so that the target entity fits into the target
		 * area.
		 *
		 * This method is typically called from within the `tick` callback
		 * function of a `RenderLoop`.
		 *
		 * @method tick
		 * @param target {Canvace.Stage.Instance} The entity instance to target.
		 */
		this.tick = function (target) {
			var x1 = x0;
			var y1 = y0;
			var frameWidth = (width - targetAreaWidth) / 2;
			var frameHeight = (height - targetAreaHeight) / 2;
			var targetRectangle = target.getProjectedRectangle();
			if (x0 + targetRectangle.x + targetRectangle.width > width - frameWidth) {
				x1 = width - targetRectangle.x - targetRectangle.width - frameWidth;
			}
			if (x0 + targetRectangle.x < frameWidth) {
				x1 = frameWidth - targetRectangle.x;
			}
			if (y0 + targetRectangle.y + targetRectangle.height > height - frameHeight) {
				y1 = height - targetRectangle.y - targetRectangle.height - frameHeight;
			}
			if (y0 + targetRectangle.y < frameHeight) {
				y1 = frameHeight - targetRectangle.y;
			}
			x0 = x0 + (x1 - x0) * (1 - delay);
			y0 = y0 + (y1 - y0) * (1 - delay);
			dragHandlers.fastForEach(function (handler) {
				handler(x0, y0);
			});
		};
	}

	/**
	 * Creates a `Synchronizer` object responsible for synchronizing the view so
	 * that it is always pointed to a specified entity.
	 *
	 * A synchronizer is defined by a "target area" and a delay parameter. The
	 * target area is a rectangular area centered in the viewport where the
	 * synchronizer constantly tries to fit the target entity by moving the
	 * view.
	 *
	 * The target entity may sometimes reside out of the target area because of
	 * the delay parameter, which indicates a delay in the movement of the view
	 * toward a fitting position. The delay parameter is a floating point number
	 * in the range `[0, 1)` where 0 indicates no delay (the target entity
	 * always resides withint the target area) and 1 indicates maximum delay
	 * (the view never moves and never reaches a fitting position).
	 *
	 * @for Canvace.View
	 * @method createSynchronizer
	 * @param targetAreaWidth {Number} The width of the target area.
	 * @param targetAreaHeight {Number} The height of the target area.
	 * @param delay {Number} The delay parameter.
	 * @return {Canvace.View.Synchronizer} A `Synchronizer` object responsible
	 * for synchronizing this `View`.
	 */
	this.createSynchronizer = function (targetAreaWidth, targetAreaHeight, delay) {
		return new Synchronizer(targetAreaWidth, targetAreaHeight, delay);
	};
};
