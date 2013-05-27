/**
 * An effect that simulates rumbling by "shaking" the viewport. This effect
 * provides a `preProcess` method and no `postProcess` method; it works by
 * modifying the canvas's projection matrix in the pre-process stage.
 *
 * @class Canvace.RumbleEffect
 * @constructor
 * @param duration {Number} The duration of the effect expressed in number of
 * frames (thus depending on the framerate).
 * @param [settings] {Object} TODO
 * @param [settings.period=Canvace.RumbleEffect.defaultPeriod] {Number} The
 * number of frames between each shake direction change. Defaults to
 * `Canvace.RumbleEffect.defaultPeriod`.
 * @param [settings.extent=Canvace.RumbleEffect.defaultExtent] {Number} The
 * displacement (in canvas units) of the viewport in each shake direction.
 * Defaults to `Canvace.RumbleEffect.defaultExtent`.
 * @param [settings.horizontal=true] {Boolean} Indicates whether the viewport
 * should be shaken horizontally. Defaults to `true`.
 * @param [settings.vertical=true] {Boolean} Indicates whether the viewport
 * should be shaken vertically. Defaults to `true`.
 */
Canvace.RumbleEffect = function (duration, settings) {
	if (typeof settings === 'undefined') {
		settings = {};
	}
	var period     = ('period' in settings)     ? ~~settings.period     : Canvace.RumbleEffect.defaultPeriod;
	var extent     = ('extent' in settings)     ? ~~settings.extent     : Canvace.RumbleEffect.defaultExtent;
	var horizontal = ('horizontal' in settings) ? !!settings.horizontal : true;
	var vertical   = ('vertical' in settings)   ? !!settings.vertical   : true;

	var sign = 1;

	/**
	 * Modifies the canvas's projection matrix so as to simulate a rumble
	 * effect.
	 *
	 * @method preProcess
	 * @param context {CanvasRenderingContext2D} the rendering context of the
	 * HTML5 canvas.
	 */
	this.preProcess = function (context) {
		if (--duration > 0) {
			sign = (duration % period) ? sign : -sign;
			var dx = horizontal ? (sign * extent) : 0;
			var dy = vertical   ? (sign * extent) : 0;
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
		return duration <= 0;
	};
};

/**
 * The default period setting, initially `3`.
 *
 * See the documentation of the class constructor for details.
 *
 * @property defaultPeriod
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultPeriod = 3;

/**
 * The default extent setting, initially `2`.
 *
 * See the documentation of the class constructor for details.
 *
 * @property defaultExtent
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultExtent = 2;
