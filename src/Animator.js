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
 * @param [tick] {Function} TODO
 * @example
 *	TODO
 */
Canvace.Animator = function (tick) {
	var animations = new Canvace.MultiSet();

	function Animation(object, stop, duration, transition, callback) {
		var start = {
			i: object.i,
			j: object.j,
			k: object.k
		};
		var startTime = Canvace.Timing.now();
		var endTime = startTime + duration;
		this.tick = function (timestamp) {
			var progress = transition((timestamp - startTime) / duration);
			if ('i' in stop) {
				object.i = start.i + (stop.i - start.i) * progress;
			}
			if ('j' in stop) {
				object.j = start.j + (stop.j - start.j) * progress;
			}
			if ('k' in stop) {
				object.k = start.k + (stop.k - start.k) * progress;
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

	function linearTransition(x) {
		return x;
	}

	function bindInterpolate(getter) {
		return function (instance, target, duration, options) {
			if (arguments.length < 4) {
				options = {};
			}
			if (typeof options.transition === 'undefined') {
				options.transition = linearTransition;
			}
			if (typeof options.callback !== 'undefined') {
				options.callback = (function (callback) {
					return function () {
						callback.call(instance);
					};
				}(options.callback));
			}
			animations.add(new Animation(instance[getter](), target, duration, options.transition, options.callback));
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
	 * @param stop.i {Number} The target value for the `i` component of the
	 * instance's position.
	 * @param stop.j {Number} The target value for the `j` component of the
	 * instance's position.
	 * @param stop.k {Number} The target value for the `k` component of the
	 * instance's position.
	 * @param duration {Number} The duration of the animation, in milliseconds.
	 * @param [options] {Object} An optional object specifying further options.
	 * @param [options.transition] {Function} The transition function for the
	 * animation.
	 *
	 * This is a user-defined one-argument function taking a floating point
	 * number and returning another floating point number.
	 *
	 * If `f` is the specified function, `f` must have the following properties:
	 * - must be defined in the range `[0, 1]`
	 * - `f(0) = 0`
	 * - `f(1) = 1`
	 *
	 * This option defaults to the identity function when not specified, which
	 * produces a linear transition. Using quadratic functions produces
	 * accelerations or decelerations. Some examples follow:
	 *
	 *	function linearTransition(x) {
	 *		return x;
	 *	}
	 *
	 *	function accelerationTransition(x) {
	 *		return x * x;
	 *	}
	 *
	 *	function decelerationTransition(x) {
	 *		return 1 - Math.pow(x - 1, 2);
	 *	}
	 *
	 *	function backAndForthTransition(x) {
	 *		return Math.pow(2 * x - 1, 3) - x + 1;
	 *	}
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 */
	thisObject.interpolatePosition = bindInterpolate('getPosition');

	/**
	 * TODO
	 *
	 * @method interpolateVelocity
	 * @param instance {Canvace.Stage.Instance} TODO
	 * @param stop {Object} TODO
	 * @param stop.i {Number} TODO
	 * @param stop.j {Number} TODO
	 * @param stop.k {Number} TODO
	 * @param duration {Number} TODO
	 * @param [options] {Object} TODO
	 * @param [options.transition] {Function} TODO
	 * @param [options.callback] {Function} TODO
	 */
	thisObject.interpolateVelocity = bindInterpolate('getVelocity');

	/**
	 * TODO
	 *
	 * @method interpolateUniformVelocity
	 * @param instance {Canvace.Stage.Instance} TODO
	 * @param stop {Object} TODO
	 * @param stop.i {Number} TODO
	 * @param stop.j {Number} TODO
	 * @param stop.k {Number} TODO
	 * @param duration {Number} TODO
	 * @param [options] {Object} TODO
	 * @param [options.transition] {Function} TODO
	 * @param [options.callback] {Function} TODO
	 */
	thisObject.interpolateUniformVelocity = bindInterpolate('getUniformVelocity');

	/**
	 * TODO
	 *
	 * @method interpolateAcceleration
	 * @param instance {Canvace.Stage.Instance} TODO
	 * @param stop {Object} TODO
	 * @param stop.i {Number} TODO
	 * @param stop.j {Number} TODO
	 * @param stop.k {Number} TODO
	 * @param duration {Number} TODO
	 * @param [options] {Object} TODO
	 * @param [options.transition] {Function} TODO
	 * @param [options.callback] {Function} TODO
	 */
	thisObject.interpolateAcceleration = bindInterpolate('getAcceleration');

	return thisObject;
};
