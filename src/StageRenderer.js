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
 * Automates the rendering process of a Canvace stage and its initialization and
 * manages rendering effects.
 *
 * This class extends `Renderer` and constructs it using the `View` and
 * `Buckets` objects provided by the `Stage`.
 *
 * @class Canvace.StageRenderer
 * @extends Canvace.Renderer
 * @constructor
 * @param stage {Canvace.Stage} The stage to render.
 * @param loader {Canvace.Loader} A Loader object used to get the images to
 * render.
 */
Canvace.StageRenderer = function (stage, loader) {
	var effects = [];
	var renderer = new Canvace.Renderer(stage.getCanvas(), loader, stage.getView(), stage.getBuckets(), function (context) {
		for (var i = 0; i < effects.length; i++) {
			if (effects[i].isOver()) {
				effects.splice(i--, 1);
			} else if (effects[i].preProcess) {
				effects[i].preProcess(context);
			}
		}
	}, function (context) {
		for (var i = effects.length - 1; i >= 0; i--) {
			if (effects[i].postProcess) {
				effects[i].postProcess(context);
			}
		}
	});

	/**
	 * Adds an effect to the effect chain.
	 *
	 * An effect is an object containing an optional `preProcess` method, an
	 * optional `postProcess` method and a mandatory `isOver` method.
	 *
	 * The `preProcess` and `postProcess` methods are used by the underlying
	 * `Renderer` and thus receive a `context` argument, which is the "2d"
	 * context of the HTML5 canvas (see the constructor of the `Renderer`
	 * class).
	 *
	 * The `isOver` method does not receive any arguments and must return a
	 * boolean value indicating whether the effect must be disapplied, in which
	 * case it is automatically removed by the `StageRenderer`.
	 *
	 * Effects can be chained: the `addEffect` method may be called any number
	 * of times to add any number of effects.
	 *
	 * During the rendering of a frame, the `preProcess` methods of each effect
	 * in the chain are called in effect insertion order while the `postProcess`
	 * methods are called in reverse order.
	 *
	 * @method addEffect
	 * @param effect {Object} An effect object.
	 */
	renderer.addEffect = function (effect) {
		effects.push(effect);
	};

	return renderer;
};
