/**
 * Manages the rendering process.
 *
 * @class Canvace.Renderer
 * @constructor
 * @param canvas {HTMLCanvasElement} An HTML5 canvas element used for the
 * rendering process.
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
	 * @param counter {Number} A timestamp expressed in milliseconds. This is
	 * necessary in order to render the correct frame for animated elements.
	 */
	this.render = function (counter) {
		var origin = view.getOrigin();
		context.setTransform(1, 0, 0, 1, origin.x, origin.y);
		context.clearRect(-origin.x, -origin.y, width, height);
		preProcess && preProcess(context);
		buckets.forEachElement(counter, function (x, y, id) {
			context.drawImage(loader.getImage(id), x, y);
		});
		postProcess && postProcess(context);
	};
};
