/**
 * An effect that simulates rumbling by "shaking" the viewport. This effect
 * provides a `preProcess` method and no `postProcess` method; it works by
 * modifying the canvas's projection matrix in the pre-process stage.
 *
 * @class Canvace.RumbleEffect
 * @constructor
 * @param duration {Number} The duration of the effect expressed in number of
 * frames (thus depending on the framerate).
 * @param [period] {Number} The number of frames between each shake direction
 * change. Defaults to `Canvace.RumbleEffect.defaultPeriod`.
 * @param [amplitude] {Number} The displacement (in pixels) of the viewport in
 * each shake direction. Defaults to `Canvace.RumbleEffect.defaultAmplitude`.
 * @param [horizontal] {Boolean} Indicates wether the viewport should be shaken
 * horizontally. Defaults to `true`.
 * @param [vertical] {Boolean} Indicates wether the viewport should be shaken
 * vertically. Defaults to `true`.
 */
Canvace.RumbleEffect = function (duration, period, amplitude, horizontal, vertical) {
	period     = (typeof period !== "undefined")     ? (~~period)     : Canvace.RumbleEffect.defaultPeriod;
	amplitude  = (typeof amplitude !== "undefined")  ? (~~amplitude)  : Canvace.RumbleEffect.defaultAmplitude;
	horizontal = (typeof horizontal !== "undefined") ? (!!horizontal) : true;
	vertical   = (typeof vertical !== "undefined")   ? (!!vertical)   : true;

	/**
	 * Modifies the canvas's projection matrix so as to simulate a rumble
	 * effect.
	 *
	 * @method preProcess
	 * @param context {CanvasRenderingContext2D} the rendering context of the
	 * HTML5 canvas.
	 */
	var sign = +1;
	this.preProcess = function (context) {
		if (--duration > 0) {
			sign = (0 === (duration % period)) ? (-sign) : (+sign);

			var dx = (horizontal) ? (sign * amplitude) : 0;
			var dy = (vertical)   ? (sign * amplitude) : 0;
			context.translate(dx, dy);
		}
	};

	/**
	 * Indicates whether the effect is over depending on the duration that was
	 * specified to the constructor.
	 *
	 * @method isOver
	 * @return {Boolean} `true` if the effect is over, `false` otherwise.
	 */
	this.isOver = function () {
		return (duration <= 0);
	};
};

/**
 * Property holding the default period of the rumble effect (currently `3`).
 * See the documentation of the class constructor for details.
 *
 * @property defaultPeriod
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultPeriod = 3;

/**
 * Property holding the default amplitude of the rumble effect (currently `2`).
 * See the documentation of the class constructor for details.
 *
 * @property defaultAmplitude
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultAmplitude = 2;
