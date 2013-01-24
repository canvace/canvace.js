/**
 * Provides a main loop implementation for the specified `Stage`.
 *
 * The loop runs at the specified rate (expressed in iterations per second).
 *
 * At each iteration, first all the entities that have physics enabled are
 * ticked and then a rendering is performed.
 *
 * The loop is not initially running: it starts when the `start` method is
 * called. It can be later suspended, resumed and eventually stopped.
 *
 * @class Canvace.RenderLoop
 * @constructor
 * @param stage {Canvace.Stage} The stage to render.
 * @param range {Canvace.Stage.Range} An optional `Canvace.Stage.Range` object
 * used to step only the currently visible part of a stage, potentially
 * resulting in better performances. If `null` is specified, the whole stage is
 * stepped at each iteration of the loop.
 * @param loader {Canvace.Loader} A `Loader` object used to get the necessary
 * images to render.
 * @param [userTick] {Function} An optional callback function that gets called
 * at each iteration of the render loop, _after_ the stage is ticked but
 * _before_ it is updated and rendered.
 * @param [synchronizeView] {Function} An optional callback function that gets
 * called at each iteration of the render loop, _after_ the stage is updated but
 * _before_ it is rendered.
 *
 * This second callback function is usually used to synchronize the view through
 * its synchronizer (see the `View.Synchronizer` class), hence its name.
 *
 * The function does not receive any arguments and its return value is ignored.
 */
Canvace.RenderLoop = (function () {
	var loopType = 'auto';
	var loopRate = 60;

	var thisObject = function (stage, range, loader, userTick, synchronizeView) {
		var renderer = new Canvace.StageRenderer(stage, loader);

		var rate = loopRate;
		var period = Math.floor(1000.0 / rate);
		var running = false;
		var banned = false;

		var stepInterface = range || stage;
		var canvas = stage.getCanvas();

		var requestAnimationFrame = Canvace.Polyfill.getPrefixedProperty('requestAnimationFrame');
		var cancelAnimationFrame = Canvace.Polyfill.getPrefixedProperty('cancelAnimationFrame');
		var token;

		renderer.synchronize(period);

		/**
		 * Returns the desired frame rate, that corresponds to the `rate`
		 * argument that was specified to the constructor.
		 *
		 * See also `getActualRate`.
		 *
		 * @method getRate
		 * @return {Number} The desired frame rate.
		 */
		this.getRate = function () {
			return rate;
		};

		/*
		 * TODO questo contatore viene incrementato all'infinito, e anche molto
		 * rapidamente. bisogna limitarlo usando come modulo l'mcm tra tutte le
		 * durate totali di tutte le animazioni. questo valore va ottenuto dalla
		 * frame table.
		 */
		var counter = 0;

		/**
		 * Returns the actual frame rate, which is the number of frames per
		 * seconds that the machine is actually managing to render.
		 *
		 * This value is always lower than or at most equal to the desired frame
		 * rate specified to the constructor.
		 *
		 * This method returns `null` if the render loop is not currently
		 * running.
		 *
		 * @method getActualRate
		 * @return {Number} The actual frame rate, or `null` if the render loop
		 * is not currently running.
		 */
		this.getActualRate = (function () {
			var lastTimestamp = Canvace.Timing.now();
			return function () {
				if (running && !banned) {
					var currentTimestamp = Canvace.Timing.now();
					var result = counter * 1000 / (currentTimestamp - lastTimestamp);
					counter = 0;
					lastTimestamp = currentTimestamp;
					return result;
				} else {
					return null;
				}
			};
		})();

		/**
		 * Returns the "period", which is the inverse of the specified rate.
		 *
		 * The period is measured in milliseconds and is an integer number, so
		 * it is calculated as
		 *
		 *	Math.floor(1000 / rate)
		 *
		 * where "rate" is the _desired_ rate that was specified to the
		 * constructor (the same value returned by `RenderLoop.getRate`).
		 *
		 * @method getPeriod
		 * @return {Number} The period.
		 */
		this.getPeriod = function () {
			return period;
		};

		/**
		 * Returns the `Stage` rendererd by this render loop. This is the same
		 * object specified to the constructor.
		 *
		 * @method getStage
		 * @return {Canvace.Stage} The `Stage` rendered by this render loop.
		 */
		this.getStage = function () {
			return stage;
		};

		/**
		 * Returns the `StageRenderer` instance used to render the stage.
		 *
		 * @method getRenderer
		 * @return {Canvace.StageRenderer} The `StageRenderer` used to render
		 * the stage.
		 */
		this.getRenderer = function () {
			return renderer;
		};

		function step(dt) {
			stepInterface.tick(dt);
			if (typeof userTick === 'function') {
				userTick(dt);
			}
		}

		function updateLoop(delta, elapsed) {
			while (delta > period) {
				step(period / 1000.0);
				delta -= period;
			}
			step(delta / 1000.0);
			stepInterface.update();
			if (typeof synchronizeView === 'function') {
				synchronizeView();
			}

			counter++;
			renderer.render(elapsed);
		}

		function requestBasedLoop() {
			if (!running || banned) {
				running = true;
				banned = false;

				var startTimestamp = Canvace.Timing.now();
				var lastTimestamp = startTimestamp;
				token = requestAnimationFrame(function tick() {
					var timestamp = Canvace.Timing.now();
					var elapsed = (timestamp - startTimestamp);
					var delta = (timestamp - lastTimestamp);
					lastTimestamp = timestamp;

					updateLoop(delta, elapsed);
					token = requestAnimationFrame(tick);
				}, canvas);
			}
		}

		function intervalBasedLoop() {
			if (!running || banned) {
				running = true;
				banned = false;

				var startTimestamp = Canvace.Timing.now();
				var lastTimestamp = startTimestamp;
				token = setInterval(function () {
					var timestamp = Canvace.Timing.now();
					var elapsed = (timestamp - startTimestamp);
					var delta = (timestamp - lastTimestamp);
					lastTimestamp = timestamp;

					updateLoop(delta, elapsed);
				}, period);
			}
		}

		var clearLoop;
		if (loopType === 'request') {
			clearLoop = cancelAnimationFrame;
		} else if (loopType === 'interval') {
			clearLoop = clearInterval;
		} else if (requestAnimationFrame) {
			clearLoop = cancelAnimationFrame;
		} else {
			clearLoop = clearInterval;
		}

		/**
		 * Runs the render loop.
		 *
		 * If the loop has just been constructed and not yet started, it is
		 * started.
		 *
		 * If the loop is suspended, it is resumed.
		 *
		 * If it is running or it has been stopped by the `stop` method, this
		 * method does not have any effects.
		 *
		 * @method run
		 */
		if (loopType === 'request') {
			this.run = requestBasedLoop;
		} else if (loopType === 'interval') {
			this.run = intervalBasedLoop;
		} else if (requestAnimationFrame) {
			this.run = requestBasedLoop;
		} else {
			this.run = intervalBasedLoop;
		}

		/**
		 * Suspends the loop if it is currently running. Otherwise this method
		 * does not have any effects.
		 *
		 * @method suspend
		 */
		this.suspend = function () {
			if (running && !banned) {
				clearLoop(token);
				banned = true;
			}
		};

		/**
		 * Indicates whether the loop was running and has been suspended and not
		 * yet resumed or stopped.
		 *
		 * @method isSuspended
		 * @return {Boolean} `true` if the loop has been suspended, `false`
		 * otherwise.
		 */
		this.isSuspended = function () {
			return running && banned;
		};

		/**
		 * Definitely stops the loop. This means the loop will not be running
		 * any more, not even if the `start` method is called again.
		 *
		 * If you just want to suspend the loop and resume it later, use the
		 * `suspend` method.
		 *
		 * @method stop
		 */
		this.stop = function () {
			if (running) {
				clearLoop(token);
				running = false;
				banned = true;
			}
		};

		/**
		 * Indicates whether the loop has been stopped by the `stop` method.
		 *
		 * @method isStopped
		 * @return {Boolean} `true` if the loop has been stopped, `false`
		 * otherwise.
		 */
		this.isStopped = function () {
			return !running && banned;
		};
	};

	/**
	 * Configures loop settings. The settings are changed globally and affect
	 * only `RenderLoop` objects created since the last `setLoop` call.
	 *
	 * @method setLoop
	 * @static
	 * @param type {String} The loop type. Can be 'request', 'interval' or
	 * 'auto'. 'request' means the `requestAnimationFrame` API is used.
	 * 'interval' means the `setInterval` API is used. 'auto' means
	 * `requestAnimationFrame` is used by default and `setInterval` is used as a
	 * fallback where `requestAnimationFrame` is not available. The default
	 * value is 'auto'.
	 * @param [rate] {Number} The desidred loop execution rate. This parameter
	 * is only meaningful when the `setInterval` API is used. The default value
	 * is 60.
	 */
	thisObject.setLoop = function (type, rate) {
		if (type in {
			'request': true,
			'interval': true,
			'auto': true
		}) {
			loopType = type;
			if (typeof rate === 'number') {
				loopRate = rate;
			}
		} else {
			throw 'invalid loop type; only "request", "interval" and "auto" are allowed.';
		}
	};

	return thisObject;
})();
