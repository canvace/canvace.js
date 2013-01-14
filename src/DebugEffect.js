/**
 * TODO
 *
 * @class Canvace.DebugEffect
 * @constructor
 * @param stage {Canvace.Stage} TODO
 * @param options {Object} TODO
 * @param options.drawBoundingBoxes {Boolean} TODO
 * @param options.boundingBoxColor {Mixed} TODO
 */
Canvace.DebugEffect = function (stage, options) {
	this.isOver = function () {
		return false;
	};
	this.postProcess = function (context) {
		context.save();
		if (options.drawBoundingBoxes) {
			context.strokeStyle = options.boundingBoxColor || '#FF0000';
			stage.forEachInstance(function (instance) {
				// TODO draw bounding box
			});
		}
		context.restore();
	};
};
