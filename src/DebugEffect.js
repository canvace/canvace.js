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
 * This effect draws some overlays useful for diagnostic purposes during the
 * post-processing rendering stage.
 *
 * The effect may be disabled and reenabled using the provided `disable`,
 * `enable` or `toggle` methods, and is initially enabled.
 *
 * @class Canvace.DebugEffect
 * @constructor
 * @param stage {Canvace.Stage} The stage being rendered.
 * @param options {Object} An options object specifying what overlays must be
 * drawn and their drawing style.
 * @param [options.drawBoundingBoxes=false] {Boolean} Indicates whether
 * entities' bounding boxes must be drawn. Only entities with physics enabled
 * are taken into account.
 * @param [options.boundingBoxStyle='red'] {Mixed} Indicates the CSS color to
 * use to draw the bounding boxes.
 * @param [options.drawVelocity=false] {Boolean} Indicates whether velocity
 * vectors must be drawn. Only entities with physics enabled are taken into
 * account.
 * @param [options.velocityStyle='red'] {Mixed} Indicates the CSS color to use
 * to draw velocity vectors.
 * @param [options.drawUniformVelocity=false] {Boolean} Indicates whether
 * uniform velocity vectors must be drawn. Only entities with physics enabled
 * are taken into account.
 * @param [options.uniformVelocityStyle='red'] {Mixed} Indicates the CSS color
 * to use to draw uniform velocity vectors.
 * @param [options.drawAcceleration=false] {Boolean} Indicates whether
 * acceleration vectors must be drawn. Only entities with physics enabled are
 * taken into account.
 * @param [options.accelerationStyle='red'] {Mixed} Indicates the CSS color to
 * use to draw acceleration vectors.
 * @param [options.drawSolidMap=false] {Boolean} TODO
 * @param [options.solidMapStyle='red'] {Mixed} TODO
 * @example
 *	var stage = new Canvace.Stage(data, canvas);
 *	stage.getRenderer().addEffect(new Canvace.DebugEffect(stage, {
 *		drawVelocity: true,
 *		velocityStyle: '#00FF00',
 *		drawSolidMap: true
 *	}));
 */
Canvace.DebugEffect = function (stage, options) {
	var enabled = true;
	var view = stage.getView();

	/**
	 * Enables the effect.
	 *
	 * @method enable
	 */
	this.enable = function () {
		enabled = true;
	};

	/**
	 * Disables the effect.
	 *
	 * The effect can then be reenabled using the `enable` method.
	 *
	 * @method disable
	 */
	this.disable = function () {
		enabled = false;
	};

	/**
	 * Toggles the effect and returns a boolean value indicating whether the
	 * effect was enabled or disabled.
	 *
	 * @method toggle
	 * @param {Boolean} [on] When specified, the effect is enabled or disabled
	 * depending on the specified boolean value (respectively `true` or
	 * `false`).
	 *
	 * When not specified, the effect's enable status is inverted.
	 * @return {Boolean} `true` if the effect has been enabled, `false`
	 * otherwise.
	 */
	this.toggle = function (on) {
		if (arguments.length < 1) {
			return enabled = !enabled;
		} else {
			return enabled = !!on;
		}
	};

	/**
	 * Indicates whether the effect is currently enabled.
	 *
	 * @method isEnabled
	 * @return {Boolean} `true` if the effect is enabled, `false` otherwise.
	 */
	this.isEnabled = function () {
		return enabled;
	};

	/**
	 * Returns the current value for the specified option.
	 *
	 * See the constructor reference for more details about the available
	 * options.
	 *
	 * @method getOption
	 * @param name {String} The option name.
	 * @return {Any} The current value for the option.
	 */
	this.getOption = function (name) {
		return options[name];
	};

	/**
	 * Sets the specified option.
	 *
	 * See the constructor reference for more details about the available
	 * options.
	 *
	 * @method setOption
	 * @param name {String} The name of the option to set.
	 * @param value {Any} The new value for the option.
	 */
	this.setOption = function (name, value) {
		options[name] = value;
	};

	/**
	 * Returns `false`.
	 *
	 * @method isOver
	 * @return {Boolean} `false`.
	 */
	this.isOver = function () {
		return false;
	};

	function drawQuadrilateral(context, i0, j0, k, iSpan, jSpan) {
		var points = [
			view.project(i0, j0, k),
			view.project(i0 + iSpan, j0, k),
			view.project(i0 + iSpan, j0 + jSpan, k),
			view.project(i0, j0 + jSpan, k)
		];
		context.moveTo(points[0][0], points[0][1]);
		context.lineTo(points[1][0], points[1][1]);
		context.lineTo(points[2][0], points[2][1]);
		context.lineTo(points[3][0], points[3][1]);
		context.lineTo(points[0][0], points[0][1]);
	}

	function drawVector(context, origin, vector) {
		var p0 = view.project(origin.i, origin.j, origin.k);
		var p1 = view.project(origin.i + vector.i, origin.j + vector.j, origin.k + vector.k);
		context.moveTo(p0[0], p0[1]);
		context.lineTo(p1[0], p1[1]);
		// TODO draw arrow tip
	}

	/**
	 * Draws the enabled overlay elements.
	 *
	 * @method postProcess
	 * @param context {CanvasRenderingContext2D} the rendering context of the
	 * HTML5 canvas.
	 */
	this.postProcess = function (context) {
		if (enabled) {
			context.save();
			context.globalAlpha = 1;
			context.globalCompositeOperation = 'source-over';
			context.lineWidth = 1;
			context.lineCap = 'butt';
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.shadowColor = 'transparent';
			if (options.drawBoundingBoxes) {
				context.strokeStyle = options.boundingBoxStyle || '#FF0000';
				context.beginPath();
				stage.forEachInstance(function (instance) {
					var position = instance.getPosition();
					var box = instance.getEntity().getBoundingBox();
					drawQuadrilateral(context, position.i + box.i0, position.j + box.j0, position.k, box.iSpan, box.jSpan);
				});
				context.stroke();
			}
			if (options.drawVelocity) {
				context.strokeStyle = options.velocityStyle || '#FF0000';
				context.beginPath();
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						drawVector(context, instance.getPosition(), instance.getVelocity());
					}
				});
				context.stroke();
			}
			if (options.drawUniformVelocity) {
				context.strokeStyle = options.uniformVelocityStyle || '#FF0000';
				context.beginPath();
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						drawVector(context, instance.getPosition(), instance.getUniformVelocity());
					}
				});
				context.stroke();
			}
			if (options.drawAcceleration) {
				context.strokeStyle = options.accelerationStyle || '#FF0000';
				context.beginPath();
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						drawVector(context, instance.getPosition(), instance.getAcceleration());
					}
				});
				context.stroke();
			}
			if (options.drawSolidMap) {
				var map = stage.getTileMap();
				context.fillStyle = options.solidMapStyle || '#FF0000';
				context.beginPath();
				map.forEachTile(function (i, j, k) {
					if (view.intersects(i, j, k, 1, 1, 1) && !map.getTile(map.getAt(i, j, k)).isWalkable()) {
						drawQuadrilateral(context, i, j, k, 1, 1);
					}
				});
				context.fill();
			}
			context.restore();
		}
	};
};
