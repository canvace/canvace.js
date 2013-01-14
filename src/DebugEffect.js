/**
 * TODO
 *
 * @class Canvace.DebugEffect
 * @constructor
 * @param stage {Canvace.Stage} TODO
 * @param options {Object} TODO
 * @param options.drawBoundingBoxes {Boolean} TODO
 * @param options.boundingBoxStyle {Mixed} TODO
 * @param options.drawVelocity {Boolean} TODO
 * @param options.velocityStyle {Mixed} TODO
 * @param options.drawUniformVelocity {Boolean} TODO
 * @param options.uniformVelocityStyle {Mixed} TODO
 * @param options.drawAcceleration {Boolean} TODO
 * @param options.accelerationStyle {Mixed} TODO
 * @param options.drawSolidMap {Boolean} TODO
 * @param options.solidMapStyle {Mixed} TODO
 */
Canvace.DebugEffect = function (stage, options) {
	var enabled = true;
	var view = stage.getView();

	/**
	 * TODO
	 *
	 * @method enable
	 */
	this.enable = function () {
		enabled = true;
	};

	/**
	 * TODO
	 *
	 * @method disable
	 */
	this.disable = function () {
		enabled = false;
	};

	/**
	 * TODO
	 *
	 * @method toggle
	 * @return {Boolean} TODO
	 */
	this.toggle = function (on) {
		if (arguments.length < 1) {
			return enabled = !enabled;
		} else {
			return enabled = !!on;
		}
	};

	/**
	 * TODO
	 *
	 * @method isEnabled
	 * @return {Boolean} TODO
	 */
	this.isEnabled = function () {
		return enabled;
	};

	/**
	 * TODO
	 *
	 * @method getOption
	 * @param name {String} TODO
	 * @return {Any} TODO
	 */
	this.getOption = function (name) {
		return options[name];
	};

	/**
	 * TODO
	 *
	 * @method setOption
	 * @param name {String} TODO
	 * @param value {Any} TODO
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

	/**
	 * TODO
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
				stage.forEachInstance(function (instance) {
					// TODO draw bounding box
				});
			}
			if (options.drawVelocity) {
				context.strokeStyle = options.velocityStyle || '#FF0000';
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						// TODO draw velocity
					}
				});
			}
			if (options.drawUniformVelocity) {
				context.strokeStyle = options.uniformVelocityStyle || '#FF0000';
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						// TODO draw uniform velocity
					}
				});
			}
			if (options.drawAcceleration) {
				context.strokeStyle = options.accelerationStyle || '#FF0000';
				stage.forEachInstance(function (instance) {
					if (instance.isPhysicsEnabled()) {
						// TODO draw acceleration
					}
				});
			}
			if (options.drawSolidMap) {
				var map = stage.getTileMap();
				context.fillStyle = options.solidMapStyle || '#FF0000';
				context.beginPath();
				map.forEachTile(function (i, j, k) {
					if (view.intersects(i, j, k, 1, 1, 1)) {
						if (map.getTile(map.getAt(i, j, k)).isWalkable()) {
							var points = [
								view.project(i, j, k),
								view.project(i, j + 1, k),
								view.project(i + 1, j + 1, k),
								view.project(i + 1, j, k)
							];
							context.moveTo(points[0][0], points[0][1]);
							context.lineTo(points[1][0], points[1][1]);
							context.lineTo(points[2][0], points[2][1]);
							context.lineTo(points[3][0], points[3][1]);
							context.lineTo(points[0][0], points[0][1]);
						}
					}
				});
				context.fill();
			}
			context.restore();
		}
	};
};
