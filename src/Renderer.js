/**
 * Manages the rendering process.
 *
 * @class Canvace.Renderer
 * @constructor
 * @param canvas {Mixed} An HTML5 canvas element used for the rendering
 * process. This parameter can be either the actual `HTMLCanvasElement`, or
 * a selector string. In the latter case, the first matching element is used,
 * and an exception is thrown if no matching element is found.
 * @param loader {Canvace.Loader} a Loader object used to get the images to
 * render. The renderer assumes the `Loader.loadImages` method has already been
 * called and only uses the `Loader.getImage` method.
 * @param view {Canvace.View} A `View` object used to project the elements to
 * render and manage the viewport.
 * @param buckets {Canvace.Buckets} A `Buckets` object used to perform efficient
 * rendering.
 * @param [preProcess] {Function} An optional callback function called by the
 * `render` method right before the rendering of a frame. The function receives
 * one argument, the "2d" context object of the specified HTML5 canvas.
 * @param [postProcess] {Function} An optional callback function called by the
 * `render` method right after the rendering of a frame. The function receives
 * one argument, the "2d" context object of the specified HTML5 canvas.
 */
Canvace.Renderer = function (canvas, loader, view, buckets, preProcess, postProcess) {
	if (typeof canvas === 'string') {
		canvas = document.querySelector(canvas);

		if (!canvas) {
			throw 'No element found matching the specified selector';
		}
	}

	var width = canvas.width;
	var height = canvas.height;
	var context = canvas.getContext('2d');

	/**
	 * Returns the `View` object used by this renderer. It is the same `view`
	 * parameter passed to the constructor.
	 *
	 * @method getView
	 * @return {Canvace.View} The `View` object used by this renderer.
	 */
	this.getView = function () {
		return view;
	};

	/**
	 * Returns the `Buckets` object used by this renderer. It is the same
	 * `buckets` parameter passed to the constructor.
	 *
	 * @method getBuckets
	 * @return {Canvace.Buckets} The `Buckets` object used by this renderer.
	 */
	this.getBuckets = function () {
		return buckets;
	};

	/**
	 * Synchronizes the underlying `Buckets` object on the specified period. The
	 * call is simply forwarded to its `synchronize` method.
	 *
	 * @method synchronize
	 * @param period {Number} The period value the buckets must be synchronized
	 * to.
	 */
	this.synchronize = buckets.synchronize;

	/**
	 * Returns the context object of the specified HTML5 canvas. This is the
	 * same context used by the renderer.
	 *
	 * @method getContext
	 * @return {CanvasRenderingContext2D} The HTML5 canvas 2D context.
	 */
	this.getContext = function () {
		return context;
	};

	/**
	 * Renders the stage to the canvas.
	 *
	 * @method render
	 */
	this.render = function () {
		var origin = view.getOrigin();
		context.setTransform(1, 0, 0, 1, origin.x, origin.y);
		context.clearRect(-origin.x, -origin.y, width, height);
		preProcess && preProcess(context);
		buckets.forEachElement(function (x, y, id) {
			context.drawImage(loader.getImage(id), x, y);
		});
		postProcess && postProcess(context);
	};
};
