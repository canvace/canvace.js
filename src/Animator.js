/*
 *	Canvace's JavaScript Game Engine, canvace.js
 *	Copyright (C) 2013  Canvace Srl  <http://www.canvace.com/>
 *
 *	Dual licensed under the MIT and GPLv3 licenses.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Computes interpolated animations for entity instances.
 *
 * An `Animator` object is actually a `tick`-like function that may be used in a
 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} and provides methods to
 * animate entity instances.
 *
 * An interpolated animation is performed by updating an instance's position,
 * velocity, uniform velocity or acceleration at every tick; all of these
 * objects have `i`, `j` and `k` fields and you can choose what fields must be
 * interpolated. You also have to define the target values for each and the
 * overall duration (in milliseconds) of the animation.
 *
 * When using an `Animator` as the `tick` callback of a
 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} you can still specify your
 * own additional `tick` callback by either passing it to the `Animator`
 * constructor or {{#crossLink "Canvace.Animator/tick"}}{{/crossLink}} method.
 * The specified `tick` callback is executed at each tick _after_ the update
 * procedures for the current animations.
 *
 * Note that the `Animator` does not invoke the
 * {{#crossLink "Canvace.Stage.Instance/update"}}{{/crossLink}} method of the
 * animated instances, so, for animations to have effect, either physics must be
 * enabled on the animated entities or you must invoke
 * {{#crossLink "Canvace.Stage.Instance/update"}}{{/crossLink}} manually (you
 * can do that in your `tick` callback function).
 *
 * @class Canvace.Animator
 * @extends Function
 * @constructor
 * @param [tick] {Function} An optional user-defined `tick` callback function.
 * It is invoked at each tick using this `Animator` object as `this`.
 *
 * You can also specify this later using the
 * {{#crossLink "Canvace.Animator/tick"}}{{/crossLink}} method.
 *
 * @example
 *	var animator = new Canvace.Animator(function () {
 *		// Custom tick function. Here we can update the gameplay. We do that
 *		// here because we can't specify a tick function to the renderloop - we
 *		// already specifying the animator.
 *		// Sample gameplay code follows.
 *		
 *		enemies.forEach(function (enemy) {
 *			if (enemy.isNearTo(character)) {
 *				enemy.attack(character);
 *			}
 *		});
 *	});
 *	
 *	var mainLoop = new Canvace.RenderLoop(stage, null, loader, animator);
 *	mainLoop.run();
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
	 * @example
	 *	var animator = new Canvace.Animator();
	 *	var mainLoop = new Canvace.RenderLoop(stage, null, loader, animator);
	 *	
	 *	// ...
	 *	
	 *	animator.tick(function () {
	 *		// custom tick code
	 *	});
	 *	
	 *	mainLoop.run();
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
	 *
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
	 * This option defaults to
	 * {{#crossLink "Canvace.Animator.Easing/linear:property"}}{{/crossLink}},
	 * that is the identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 500, {
	 *		easing: Canvace.Animator.Easing.deceleration,
	 *		callback: function () {
	 *			// ...
	 *		}
	 *	});
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
	 *
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
	 * This option defaults to
	 * {{#crossLink "Canvace.Animator.Easing/linear:property"}}{{/crossLink}},
	 * that is the identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 * @example
	 *	animator.interpolateVelocity(character, {
	 *		i: 0,
	 *		j: 0
	 *	}, 1500, {
	 *		easing: function (x) {
	 *			return 1 - x; // slow down (reduce velocity linearly)
	 *		},
	 *		callback: function () {
	 *			// ...
	 *		}
	 *	});
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
	 *
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
	 * This option defaults to
	 * {{#crossLink "Canvace.Animator.Easing/linear:property"}}{{/crossLink}},
	 * that is the identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 * @example
	 *	animator.interpolateUniformVelocity(character, {
	 *		i: 0,
	 *		j: 0
	 *	}, 1500, {
	 *		easing: function (x) {
	 *			return 1 - x; // slow down (reduce velocity linearly)
	 *		},
	 *		callback: function () {
	 *			// ...
	 *		}
	 *	});
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
	 *
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
	 * This option defaults to
	 * {{#crossLink "Canvace.Animator.Easing/linear:property"}}{{/crossLink}},
	 * that is the identity function.
	 *
	 * @param [options.callback] {Function} An optional user-defined callback
	 * function called when the animation is over.
	 * @example
	 *	animator.interpolateAcceleration(character, {
	 *		i: maxAcceleration.i,
	 *		j: maxAcceleration.j
	 *	}, 2000, {
	 *		easing: Canvace.Animator.Easing.linear,
	 *		callback: function () {
	 *			// ...
	 *		}
	 *	});
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
	 *
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427ehqs1nv9907" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property linear
	 * @type Function
	 * @static
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 1000, {
	 *		easing: Canvace.Animator.Easing.linear
	 *	});
	 */
	linear: function (x) {
		return x;
	},

	/**
	 * Acceleration function.
	 *
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427e7stk11iilk" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property acceleration
	 * @type Function
	 * @static
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 1000, {
	 *		easing: Canvace.Animator.Easing.acceleration
	 *	});
	 */
	acceleration: function (x) {
		return x * x;
	},

	/**
	 * Deceleration function.
	 *
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427eb0umq33b2k" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property deceleration
	 * @type Function
	 * @static
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 1000, {
	 *		easing: Canvace.Animator.Easing.deceleration
	 *	});
	 */
	deceleration: function (x) {
		return 1 - Math.pow(x - 1, 2);
	},

	/**
	 * A function that goes back and forth between bigger and smaller values.
	 *
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427esfu8sff4au" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property backAndForth
	 * @type Function
	 * @static
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 1000, {
	 *		easing: Canvace.Animator.Easing.backAndForth
	 *	});
	 */
	backAndForth: function (x) {
		return Math.pow(2 * x - 1, 3) - x + 1;
	},

	/**
	 * A function that oscillates harmonically.
	 *
	 * See <a href="http://www.wolframalpha.com/share/clip?f=d41d8cd98f00b204e9800998ecf8427ef17c2o8td0" target="_blank">here</a>
	 * for a plot of the function graph.
	 *
	 * @property harmonic
	 * @type Function
	 * @static
	 * @example
	 *	animator.interpolatePosition(character, {
	 *		i: target.i,
	 *		j: target.j
	 *	}, 1000, {
	 *		easing: Canvace.Animator.Easing.harmonic
	 *	});
	 */
	harmonic: function (x) {
		return 1 - Math.sin(50 * x) / (50 * x);
	}
};
