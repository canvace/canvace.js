/**
 * Computes interpolated animations for entity instances.
 *
 * An `Animator` object is actually a `tick`-like function that may be used in a
 * `RenderLoop`; furthermore the `Animator` provides methods that can start
 * interpolated animations on specific entity instances.
 *
 * An interpolated animation is performed by updating an instance's position,
 * velocity, uniform velocity or acceleration at every tick; all of these
 * objects have `i`, `j` and `k` fields and you can choose what fields must be
 * interpolated. You also have to define the target values for each and the
 * overall duration (in milliseconds) of the animation.
 *
 * When using an `Animator` as the `tick` callback of a `RenderLoop` you can
 * still specify your own additional `tick` callback by passing it to the
 * `Animator` constructor; such function has the same prototype as the `tick`
 * function you would pass to the `RenderLoop` and is executed at each tick
 * _after_ the update procedures for the current animations.
 *
 * Note that the `Animator` does not invoke the `update` method of the animated
 * instances, so, for animations to have effect, either physics must be enabled
 * for animated entities or you must invoke `update` manually (you can do that
 * in your `tick` callback function).
 *
 * @class Canvace.Animator
 * @extends Function
 * @constructor
 * @param [tick] {Function} An optional user-defined `tick` callback function.
 * It is invoked at each tick using this `Animator` object as `this`.
 *
 * You can also specify this later using the `tick` method.
 *
 * @example
 *	TODO
 */
Canvace.Animator = function (tick) {
	var animations = new Canvace.MultiSet();

	function Animation(object, stop, duration, easing, callback) {
		var i0 = object.i;
		var j0 = object.j;
		var k0 = object.k;
		var di = stop.i - object.i;
		var dj = stop.j - object.j;
		var dk = stop.k - object.k;
		var startTime = Canvace.Timing.now();
		var endTime = startTime + duration;
		this.tick = function (timestamp) {
			var progress = easing((timestamp - startTime) / duration);
			if ('i' in stop) {
				object.i = i0 + di * progress;
			}
			if ('j' in stop) {
				object.j = j0 + dj * progress;
			}
			if ('k' in stop) {
				object.k = k0 + dk * progress;
			}
			return timestamp < endTime;
		};
		this.callback = callback;
	}

	var thisObject = function () {
		var timestamp = Canvace.Timing.now();
		animations.forEach(function (animation, remove) {
			if (!animation.tick(timestamp)) {
				remove();
				animation.callback && animation.callback();
			}
		});
		tick && tick.call(thisObject);
	};

	function bindInterpolate(getter) {
		return function (instance, target, duration, options) {
			if (arguments.length < 4) {
				options = {};
			}
			if (typeof options.easing === 'string') {
				options.easing = Canvace.Animator.Easing[options.easing];
			}
			if (typeof options.easing === 'undefined') {
				options.easing = Canvace.Animator.Easing.linear;
			}
			if (typeof options.callback !== 'undefined') {
				options.callback = (function (callback) {
					return function () {
						callback.call(instance);
					};
				}(options.callback));
			}
			animations.add(new Animation(instance[getter](), target, duration, options.easing, options.callback));
		};
	}

	/**
	 * Sets the `tick` callback.
	 *
	 * This method allows to define a callback later than construction time.
	 *
	 * If you do not specify a callback function, the previously set callback
	 * function is unset and the `Animator` will not invoke any.
	 *
	 * @method tick
	 * @chainable
	 * @param [callback] {Function} A user-defined `tick` callback function.
	 */
	thisObject.tick = function (callback) {
		tick = callback;
		return thisObject;
	};

	/**
	 * Animates the specified entity instance by interpolating values for its
	 * position.
	 *
	 * @method interpolatePosition
	 * @param instance {Canvace.Stage.Instance} The entity instance whose
	 * position must be interpolated.
	 * @param stop {Object} An object containing target values for the `i`, `j`
	 * and `k` fields of the instance's position. The target values are the
	 * values that will result when the animation is over.
	 *
	 * The `i`, `j` and `k` fields of this object are optional: missing fields
	 * will not be interpolated.
	 * @param [stop.i] {Number} The target value for the `i` component of the
	 * instance's position.
	 * @param [stop.j] {Number} The target value for the `j` component of the
	 * instance's position.
	 * @param [stop.k] {Number} The target value for the `k` component of the
	 * instance's position.
	 * @param duration {Number} The duration of the animation, in milliseconds.
	 * @param [options] {Object} An optional object specifying further options.
	 * @param [options.easing] {Function} The easing function for the
	 * animation.
	 *
	 * This is a user-defined one-argument function taking a floating point
	 * number and returning another floating point number.
	 *
	 * If `f` is the specified function, `f` must have the following properties:
	 * <ul>
	 * <li>must be defined in the range `[0, 1]`</li>
	 * <li>`f(0) = 0`</li>
	 * <li>`f(1) = 1`</li>
	 * </ul>
	 *
	 * You can use one of the predefined easing functions provided by
	 * {{#crossLink "Canvace.Animator.Easing"}}{{/crossLink}}. You can also
	 * specify a predefined easing function by passing its method name string.
	 *
	 * This option defaults to `Canvace.Animator.Easing.linear`, that is the
	 * identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 */
	thisObject.interpolatePosition = bindInterpolate('getPosition');

	/**
	 * Animates the specified entity instance by interpolating values for its
	 * velocity.
	 *
	 * @method interpolateVelocity
	 * @param instance {Canvace.Stage.Instance} The entity instance whose
	 * velocity must be interpolated.
	 * @param stop {Object} An object containing target values for the `i`, `j`
	 * and `k` fields of the instance's velocity. The target values are the
	 * values that will result when the animation is over.
	 *
	 * The `i`, `j` and `k` fields of this object are optional: missing fields
	 * will not be interpolated.
	 * @param [stop.i] {Number} The target value for the `i` component of the
	 * instance's velocity.
	 * @param [stop.j] {Number} The target value for the `j` component of the
	 * instance's velocity.
	 * @param [stop.k] {Number} The target value for the `k` component of the
	 * instance's velocity.
	 * @param duration {Number} The duration of the animation, in milliseconds.
	 * @param [options] {Object} An optional object specifying further options.
	 * @param [options.easing] {Function} The easing function for the
	 * animation.
	 *
	 * This is a user-defined one-argument function taking a floating point
	 * number and returning another floating point number.
	 *
	 * If `f` is the specified function, `f` must have the following properties:
	 * <ul>
	 * <li>must be defined in the range `[0, 1]`</li>
	 * <li>`f(0) = 0`</li>
	 * <li>`f(1) = 1`</li>
	 * </ul>
	 *
	 * You can use one of the predefined easing functions provided by
	 * {{#crossLink "Canvace.Animator.Easing"}}{{/crossLink}}. You can also
	 * specify a predefined easing function by passing its method name string.
	 *
	 * This option defaults to `Canvace.Animator.Easing.linear`, that is the
	 * identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 */
	thisObject.interpolateVelocity = bindInterpolate('getVelocity');

	/**
	 * Animates the specified entity instance by interpolating values for its
	 * uniform velocity.
	 *
	 * @method interpolateUniformVelocity
	 * @param instance {Canvace.Stage.Instance} The entity instance whose
	 * uniform velocity must be interpolated.
	 * @param stop {Object} An object containing target values for the `i`, `j`
	 * and `k` fields of the instance's uniform velocity. The target values are
	 * the values that will result when the animation is over.
	 *
	 * The `i`, `j` and `k` fields of this object are optional: missing fields
	 * will not be interpolated.
	 * @param [stop.i] {Number} The target value for the `i` component of the
	 * instance's uniform velocity.
	 * @param [stop.j] {Number} The target value for the `j` component of the
	 * instance's uniform velocity.
	 * @param [stop.k] {Number} The target value for the `k` component of the
	 * instance's uniform velocity.
	 * @param duration {Number} The duration of the animation, in milliseconds.
	 * @param [options] {Object} An optional object specifying further options.
	 * @param [options.easing] {Function} The easing function for the
	 * animation.
	 *
	 * This is a user-defined one-argument function taking a floating point
	 * number and returning another floating point number.
	 *
	 * If `f` is the specified function, `f` must have the following properties:
	 * <ul>
	 * <li>must be defined in the range `[0, 1]`</li>
	 * <li>`f(0) = 0`</li>
	 * <li>`f(1) = 1`</li>
	 * </ul>
	 *
	 * You can use one of the predefined easing functions provided by
	 * {{#crossLink "Canvace.Animator.Easing"}}{{/crossLink}}. You can also
	 * specify a predefined easing function by passing its method name string.
	 *
	 * This option defaults to `Canvace.Animator.Easing.linear`, that is the
	 * identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 */
	thisObject.interpolateUniformVelocity = bindInterpolate('getUniformVelocity');

	/**
	 * Animates the specified entity instance by interpolating values for its
	 * acceleration.
	 *
	 * @method interpolateAcceleration
	 * @param instance {Canvace.Stage.Instance} The entity instance whose
	 * acceleration must be interpolated.
	 * @param stop {Object} An object containing target values for the `i`, `j`
	 * and `k` fields of the instance's acceleration. The target values are the
	 * values that will result when the animation is over.
	 *
	 * The `i`, `j` and `k` fields of this object are optional: missing fields
	 * will not be interpolated.
	 * @param [stop.i] {Number} The target value for the `i` component of the
	 * instance's acceleration.
	 * @param [stop.j] {Number} The target value for the `j` component of the
	 * instance's acceleration.
	 * @param [stop.k] {Number} The target value for the `k` component of the
	 * instance's acceleration.
	 * @param duration {Number} The duration of the animation, in milliseconds.
	 * @param [options] {Object} An optional object specifying further options.
	 * @param [options.easing] {Function} The easing function for the
	 * animation.
	 *
	 * This is a user-defined one-argument function taking a floating point
	 * number and returning another floating point number.
	 *
	 * If `f` is the specified function, `f` must have the following properties:
	 * <ul>
	 * <li>must be defined in the range `[0, 1]`</li>
	 * <li>`f(0) = 0`</li>
	 * <li>`f(1) = 1`</li>
	 * </ul>
	 *
	 * You can use one of the predefined easing functions provided by
	 * {{#crossLink "Canvace.Animator.Easing"}}{{/crossLink}}. You can also
	 * specify a predefined easing function by passing its method name string.
	 *
	 * This option defaults to `Canvace.Animator.Easing.linear`, that is the
	 * identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 */
	thisObject.interpolateAcceleration = bindInterpolate('getAcceleration');

	return thisObject;
};

/**
 * Static object holding various predefined easing functions ready to use with
 * the `interpolateXxx` methods of
 * {{#crossLink "Canvace.Animator"}}{{/crossLink}}.
 *
 * @class Canvace.Animator.Easing
 * @static
 */
Canvace.Animator.Easing = {
	/**
	 * Identity function.
	 * See [here](http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427ehqs1nv9907)
	 * for a plot of the function graph.
	 *
	 * @property linear
	 * @type function
	 * @static
	 */
	linear: function (x) {
		return x;
	},

	/**
	 * Acceleration function.
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427e7stk11iilk" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property acceleration
	 * @type function
	 * @static
	 */
	acceleration: function (x) {
		return x * x;
	},

	/**
	 * Deceleration function.
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427eb0umq33b2k" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property deceleration
	 * @type function
	 * @static
	 */
	deceleration: function (x) {
		return 1 - Math.pow(x - 1, 2);
	},

	/**
	 * Function that goes back and forth between bigger and smaller values.
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427esfu8sff4au" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property backAndForth
	 * @type function
	 * @static
	 */
	backAndForth: function (x) {
		return Math.pow(2 * x - 1, 3) - x + 1;
	}
};
