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
 * @class Canvace.Animator
 * @extends Function
 * @constructor
 * @param [tick] {Function} TODO
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
			return timestamp >= endTime;
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
			animations.add(new Animation(instance[getter](), target, duration, options.transition, options.callback));
		};
	}

	/**
	 * TODO
	 *
	 * @method interpolatePosition
	 * @param instance {Canvace.Stage.Instance} TODO
	 * @param stop {Object} TODO
	 * @param duration {Number} TODO
	 * @param [options={}] {Object} TODO
	 * @param [options.transition] {Function} TODO
	 * @param [options.callback] {Function} TODO
	 */
	thisObject.interpolatePosition = bindInterpolate('getPosition');

	/**
	 * TODO
	 *
	 * @method interpolateVelocity
	 * @param instance {Canvace.Stage.Instance} TODO
	 * @param stop {Object} TODO
	 * @param duration {Number} TODO
	 * @param [options={}] {Object} TODO
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
	 * @param duration {Number} TODO
	 * @param [options={}] {Object} TODO
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
	 * @param duration {Number} TODO
	 * @param [options={}] {Object} TODO
	 * @param [options.transition] {Function} TODO
	 * @param [options.callback] {Function} TODO
	 */
	thisObject.interpolateAcceleration = bindInterpolate('getAcceleration');

	return thisObject;
};
