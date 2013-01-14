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
	var view = stage.getView();
	this.isOver = function () {
		return false;
	};
	this.postProcess = function (context) {
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
			context.fillStyle = options.solidMapStyle || '#FF0000';
			stage.getTileMap().forEachTile(function (id) {
				// TODO draw box if solid and in view
			});
		}
		context.restore();
	};
};
