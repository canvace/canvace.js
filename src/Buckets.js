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
 * This class allows for efficient rendering of graphic elements by implementing
 * an algorithm that automatically discards the elements located out of the
 * viewport.
 *
 * You can add any tiles or entities to the buckets using the provided `addXxx`
 * methods, the {{#crossLink "Canvace.Buckets/forEachElement"}}{{/crossLink}}
 * method will then enumerate only the elements in the current view.
 *
 * The `Buckets` class also supports animated elements by enumerating the
 * correct frame for each element depending on the current timestamp as per
 * {{#crossLink "Canvace.Timing/now"}}{{/crossLink}}.
 *
 * Before adding tiles and entities with the `addXxx` methods, tile and entity
 * descriptors must be registered using the provided `registerXxx` methods. This
 * is required in order to support animations.
 *
 * You do not usually need to use this class directly, as it is automatically
 * used by the {{#crossLink "Canvace.Stage"}}Stage{{/crossLink}} and
 * {{#crossLink "Canvace.StageRenderer"}}StageRenderer{{/crossLink}} classes.
 *
 * @class Canvace.Buckets
 * @constructor
 * @param view {Canvace.View} A View object used to project the graphic
 * elements.
 * @param data {Object} The JSON data output by the Canvace Development
 * Environment.
 */
Canvace.Buckets = function (view, data) {
	var width = view.getWidth();
	var height = view.getHeight();
	var frameTable = new Canvace.FrameTable(data);

	(function () {
		var id;
		for (id in data.tiles) {
			if (data.tiles.hasOwnProperty(id)) {
				frameTable.registerTile(id);
			}
		}
		for (id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				frameTable.registerEntity(id);
			}
		}
	}());

	function Bucket() {
		this.sections = {};
		this.minS = 0;
		this.maxS = 0;
	}

	Bucket.prototype.add = function (p, width, height, getFrame, timeOffset) {
		this.minS = Math.min(this.minS, p[2]);
		this.maxS = Math.max(this.maxS, p[2]);
		if (!this.sections[p[2]]) {
			this.sections[p[2]] = new Canvace.MultiSet();
		}
		return this.sections[p[2]].add({
			p: p,
			width: width,
			height: height,
			static: getFrame.static,
			getFrame: getFrame,
			timeOffset: timeOffset
		});
	};

	Bucket.prototype.prerender = function (loader) {
		for (var s in this.sections) {
			if (this.sections.hasOwnProperty(s)) {
				var renderableElements = [];
				this.sections[s].forEach(function (element, remove) {
					if (element.static) {
						element.remove = remove;
						renderableElements.push(element);
					}
				});
				if (renderableElements.length) {
					var firstElement = renderableElements[0];
					var left = renderableElements.reduce(function (left, element) {
						return Math.min(left, element.p[0]);
					}, firstElement.p[0]);
					var top = renderableElements.reduce(function (top, element) {
						return Math.min(top, element.p[1]);
					}, firstElement.p[1]);
					var right = renderableElements.reduce(function (right, element) {
						return Math.max(right, element.p[0] + element.width);
					}, firstElement.p[0] + firstElement.width);
					var bottom = renderableElements.reduce(function (bottom, element) {
						return Math.max(bottom, element.p[1] + element.height);
					}, firstElement.p[0] + firstElement.height);
					(function (canvas) {
						canvas.width = right - left + 1;
						canvas.height = bottom - top + 1;
						var context = canvas.getContext('2d');
						renderableElements.forEach(function (element) {
							context.drawImage(loader.getImage(element.getFrame(0)), element.p[0] - left, element.p[1] - top);
							element.remove();
						});
						this.sections[s].add({
							p: [left, top, parseInt(s, 10)],
							width: right - left + 1,
							height: bottom - top + 1,
							static: true,
							getFrame: function () {
								return canvas;
							},
							timeOffset: 0
						});
					}(document.createElement('canvas')));
				}
			}
		}
	};

	Bucket.prototype.enumerateSection = function (s, action) {
		if (this.sections.hasOwnProperty(s)) {
			this.sections[s].fastForEach(action);
		}
	};

	var buckets = {};

	function getBucket(i, j) {
		var key = i + ' ' + j;
		if (buckets.hasOwnProperty(key)) {
			return buckets[key];
		} else {
			return buckets[key] = new Bucket();
		}
	}

	function MockElement() {}
	MockElement.prototype.updatePosition = function () {};
	MockElement.prototype.remove = function () {};
	MockElement.prototype.replace = function () {};

	/*
	 * XXX the `Element` inner class is documented as it were named `Entity`
	 * because there ideally is an `Entity` inner class that inherits `Element`.
	 * There is no actual `Entity` class because it would not add anything to
	 * `Element`.
	 */

	/**
	 * Represents an entity.
	 *
	 * This class cannot be instantiated directly, instances are returned by
	 * the {{#crossLink "Canvace.Buckets/addEntity"}}{{/crossLink}} method.
	 *
	 * @class Canvace.Buckets.Entity
	 */
	function Element(element, animation, i, j, k) {
		if (!element.frames.length) {
			return new MockElement();
		}

		this.element = element;
		this.animation = animation;
		this.i = i;
		this.j = j;
		this.k = k;

		this.p = view.projectElement(this.element, this.i, this.j, this.k);
		this.bi = Math.floor(this.p[1] / height);
		this.bj = Math.floor(this.p[0] / width);

		this.removers = [];
		this.removed = false;

		this.timeOffset = Canvace.Timing.now();

		this.addToBuckets();
	}

	Element.prototype.addToBucket = function (i, j) {
		this.removers.push(getBucket(i, j).add(
			this.p, this.element.width, this.element.height, this.animation, this.timeOffset
			));
	};

	Element.prototype.addToBuckets = function () {
		this.addToBucket(this.bi, this.bj);
		var bi1 = Math.floor((this.p[1] + this.element.height) / height);
		var bj1 = Math.floor((this.p[0] + this.element.width) / width);
		if (bi1 > this.bi) {
			this.addToBucket(this.bi + 1, this.bj);
		}
		if (bj1 > this.bj) {
			this.addToBucket(this.bi, this.bj + 1);
		}
		if ((bi1 > this.bi) && (bj1 > this.bj)) {
			this.addToBucket(this.bi + 1, this.bj + 1);
		}
	};

	/**
	 * Removes the entity so that it is not enumerated by the
	 * {{#crossLink "Canvace.Buckets/forEachElement}}{{/crossLink}} method any
	 * more.
	 *
	 * This method is idempotent: it does not have any effects when it is called
	 * again after the first time.
	 *
	 * @method remove
	 * @return {Boolean} `true`.
	 */
	Element.prototype.remove = function remove() {
		for (var index in this.removers) {
			if (this.removers.hasOwnProperty(index)) {
				this.removers[index]();
			}
		}
		this.removers = [];
		return this.removed = true;
	};

	/**
	 * Indicates whether this entity has been removed from the buckets.
	 *
	 * @method isRemoved
	 * @return {Boolean} `true` if this element has been removed, `false`
	 * otherwise.
	 */
	Element.prototype.isRemoved = function () {
		return this.removed;
	};

	/**
	 * Returns the entity's projected position, which is its `(i, j, k)`
	 * position left-multiplied by the projection matrix.
	 *
	 * The position is returned as an object containing three fields, `x`, `y`
	 * and `z`, containing the `i`, `j` and `k` projected coordinates,
	 * respectively.
	 *
	 * @method getProjectedPosition
	 * @return {Object} The projected position as an object containing three
	 * `x`, `y` and `z` fields.
	 */
	Element.prototype.getProjectedPosition = function () {
		return {
			x: this.p[0] - this.element.offset.x,
			y: this.p[1] - this.element.offset.y,
			z: this.p[2]
		};
	};

	/**
	 * Returns the 2D rectangular area corresponding to the entity's bounds.
	 *
	 * The rectangle is returned as an object containing four fields: the `x`
	 * and `y` coordinates of the origin and the `width` and `height`.
	 *
	 * The coordinates of the origin are calculated by left-multiplying the
	 * `(i, j, k)` position vector of the entity by the projection matrix and
	 * adding the entity's offset. The width and height are simply copied from
	 * the entity descriptor.
	 *
	 * @method getProjectedRectangle
	 * @return {Object} An object that describes the projected rectangle and
	 * contains four fields: `x`, `y`, `width` and `height`.
	 */
	Element.prototype.getProjectedRectangle = function () {
		return {
			x: this.p[0],
			y: this.p[1],
			z: this.p[2],
			width: this.element.width,
			height: this.element.height
		};
	};

	/**
	 * Updates the entity's position and possibly some internal data structures
	 * so that the entity is enumerated correctly by the
	 * {{#crossLink "Canvace.Buckets/forEachElement}}{{/crossLink}} method after
	 * it is repositioned.
	 *
	 * The specified `i`, `j` and `k` values may be real numbers.
	 *
	 * @method updatePosition
	 * @param i {Number} The new I coordinate.
	 * @param j {Number} The new J coordinate.
	 * @param k {Number} The new K coordinate.
	 */
	Element.prototype.updatePosition = function (i1, j1, k1) {
		if (!this.removed) {
			var p1 = view.projectElement(this.element, this.i = i1, this.j = j1, this.k = k1);
			var bi1 = Math.floor(this.p[1] / height);
			var bj1 = Math.floor(this.p[0] / width);
			if ((p1[2] !== this.p[2]) || (bi1 !== this.bi) || (bj1 !== this.bj)) {
				this.remove();
				this.removed = false;
				this.p[0] = p1[0];
				this.p[1] = p1[1];
				this.p[2] = p1[2];
				this.bi = bi1;
				this.bj = bj1;
				this.addToBuckets();
			} else {
				this.p[0] = p1[0];
				this.p[1] = p1[1];
				this.p[2] = p1[2];
			}
		}
	};

	/**
	 * Replaces the entity with another one identified by the specified ID. This
	 * entity is removed as if the
	 * {{#crossLink "Canvace.Buckets.Entity/remove"}}{{/crossLink}} method was
	 * called, and this
	 * {{#crossLink "Canvace.Buckets.Entity"}}Entity{{/crossLink}} object
	 * becomes useless and should be discarded.
	 *
	 * @method replace
	 * @param id {Number} The new entity's ID.
	 * @return {Canvace.Buckets.Entity} A new Entity object representing the new
	 * entity.
	 */
	Element.prototype.replace = function (id) {
		if (!this.removed) {
			if (!(id in data.entities)) {
				throw {
					message: 'invalid entity ID',
					id: id
				};
			}

			this.remove();
			var entity = data.entities[id];

			var animation = frameTable.getEntityAnimation(id);
			animation.static = false;
			return new Element(entity, animation, this.i, this.j, this.k);
		}
	};

	var eraser = new Canvace.Matrix();

	function addTile(id, i, j, k) {
		if (!(id in data.tiles)) {
			throw {
				message: 'invalid tile ID',
				id: id
			};
		}

		var tile = data.tiles[id];

		var animation = frameTable.getTileAnimation(id);
		animation.static = animation.static && !tile.mutable;
		var element = new Element(tile, animation, i, j, k);
		var remover = element.remove.bind(element);

		if (tile.mutable) {
			var removed = false;
			eraser.put(i, j, k, function () {
				remover();
				if (removed) {
					return false;
				} else {
					eraser.erase(i, j, k);
					removed = true;
					return true;
				}
			});
		} else {
			return remover;
		}
	}

	/**
	 * Adds a tile to the buckets and returns a function that removes it.
	 *
	 * If the tile was configured as mutable in the Canvace Development
	 * Environment it can also be removed using the
	 * {{#crossLink "Canvace.Buckets/removeTile"}}{{/crossLink}} method or
	 * replaced using the
	 * {{#crossLink "Canvace.Buckets/replaceTile"}}{{/crossLink}} method.
	 *
	 * The returned function does not receive any arguments and always
	 * returns `true`, and can remove the tile even if it was not configured
	 * as mutable.
	 *
	 * @method addTile
	 * @for Canvace.Buckets
	 * @param id {Number} The tile's ID.
	 * @param i {Number} The integer I position where the tile is located.
	 * @param j {Number} The integer J position where the tile is located.
	 * @param k {Number} The integer K position where the tile is located.
	 * @return {Function} A function that removes the inserted tile. The
	 * function does not receive any arguments, always returns `true` and is
	 * idempotent: it does not have any effets when called again after the
	 * first time.
	 */
	this.addTile = addTile;

	/**
	 * Adds an entity to the buckets. The specified I, J and K coordinates
	 * can be real values.
	 *
	 * @method addEntity
	 * @param id {Number} The entity's ID.
	 * @param i {Number} The I coordinate where the entity is located.
	 * @param j {Number} The J coordinate where the entity is located.
	 * @param k {Number} The K coordinate where the entity is located.
	 * @return {Canvace.Buckets.Entity} An Entity object representing the
	 * inserted entity.
	 */
	this.addEntity = function (id, i, j, k) {
		if (!(id in data.entities)) {
			throw {
				message: 'invalid entity ID',
				id: id
			};
		}

		var entity = data.entities[id];
		var animation = frameTable.getEntityAnimation(id);
		animation.static = false;
		return new Element(entity, animation, i, j, k);
	};

	/**
	 * Removes the mutable tile located at the (integer) coordinates
	 * `(i, j, k)`.
	 *
	 * Note that a tile is not removed by this method if it is not mutable, even
	 * though it is located at the specified coordinates.
	 *
	 * @method removeTile
	 * @param i {Number} The tile's I coordinate.
	 * @param j {Number} The tile's J coordinate.
	 * @param k {Number} The tile's K coordinate.
	 * @return {Boolean} `true` on success, `false` on failure.
	 */
	this.removeTile = function (i, j, k) {
		if (eraser.has(i, j, k)) {
			return eraser.get(i, j, k)();
		} else {
			return false;
		}
	};

	/**
	 * Replaces the mutable tile located at the specified `i`, `j` and `k`
	 * integer coordinates with another tile.
	 *
	 * This method has no effect if no mutable tile is found at the
	 * specified coordinates; this includes both the following cases: no
	 * mutable tile found and no tile at all.
	 *
	 * When a mutable tile is found and successfully removed, the specified
	 * tile is inserted at its location and a function to remove it is
	 * returned (similarly to the
	 * {{#crossLink "Canvace.Buckets/addTile"}}{{/crossLink}} method).
	 *
	 * @method replaceTile
	 * @param i {Number} The I coordinate where the tile to replace is
	 * located.
	 * @param j {Number} The J coordinate where the tile to replace is
	 * located.
	 * @param k {Number} The K coordinate where the tile to replace is
	 * located.
	 * @param newTileId {Number} The new tile's ID.
	 * @return {Function} A function that removes the inserted tile, or
	 * `undefined` if a mutable tile could not be found at the specified
	 * position.
	 *
	 * The returned function does not receive any arguments, always returns
	 * `true` and is idempotent: it does not have any effets when called
	 * again after the first time.
	 */
	this.replaceTile = function (i, j, k, newTileId) {
		if (eraser.has(i, j, k)) {
			eraser.get(i, j, k)();
			return addTile(newTileId, i, j, k);
		}
	};

	/**
	 * TODO
	 *
	 * @method synchronize
	 * @param period {Number} TODO
	 */
	this.synchronize = frameTable.synchronize;

	/**
	 * Invokes the given callback function for each element within the
	 * viewport.
	 *
	 * For each enumerated element, the specified `action` callback function
	 * receives the element's projected X coordinate, projected Y coordinate
	 * and current frame image ID.
	 *
	 * @method forEachElement
	 * @param action {Function} A callback function to invoke for each
	 * enumerated element.
	 * @param action.x {Number} The current element's projected X
	 * coordinate.
	 * @param action.y {Number} The current element's projected Y
	 * coordinate.
	 * @param action.id {String} An image ID that can be used to render the
	 * current element (animations are taken into account).
	 */
	this.forEachElement = function (action) {
		var origin = view.getOrigin();
		var i = Math.floor(-origin.y / height);
		var j = Math.floor(-origin.x / width);

		var bucket1 = getBucket(i, j);
		var bucket2 = getBucket(i, j + 1);
		var bucket3 = getBucket(i + 1, j);
		var bucket4 = getBucket(i + 1, j + 1);

		var minS = Math.min(
			bucket1.minS,
			bucket2.minS,
			bucket3.minS,
			bucket4.minS
			);
		var maxS = Math.max(
			bucket1.maxS,
			bucket2.maxS,
			bucket3.maxS,
			bucket4.maxS
			);

		var timestamp = Canvace.Timing.now();

		function yieldElement(element) {
			if ((element.p[0] < -origin.x + width) &&
				(element.p[1] < -origin.y + height) &&
				(element.p[0] + element.width >= -origin.x) &&
				(element.p[1] + element.height >= -origin.y))
			{
				var frame = element.getFrame(timestamp - element.timeOffset);
				action(element.p[0], element.p[1], frame.id, frame.x, frame.y, frame.width, frame.height);
			}
		}

		for (var s = minS; s <= maxS; s++) {
			bucket1.enumerateSection(s, yieldElement);
			bucket2.enumerateSection(s, yieldElement);
			bucket3.enumerateSection(s, yieldElement);
			bucket4.enumerateSection(s, yieldElement);
		}
	};

	/**
	 * Prerenders the "static" parts of the stage to internal canvases so as to
	 * speed up the final rendering: after calling this method, the
	 * {{#crossLink "Canvace.Buckets/forEachElement"}}{{/crossLink}} method will
	 * return less elements in that some of them will have been joined, and less
	 * `drawImage` calls will be required by the
	 * {{#crossLink "Canvace.Buckets/forEachElement"}}forEachElement{{/crossLink}}
	 * caller.
	 *
	 * Only static tiles whose animations include only one frame are considered
	 * "static" parts of the stage and taken into account for prerendering.
	 *
	 * Call this method _after_ adding _all_ the various elements with the
	 * {{#crossLink "Canvace.Buckets/addEntity"}}{{/crossLink}} and
	 * {{#crossLink "Canvace.Buckets/addTile"}}{{/crossLink}} methods.
	 *
	 * @method prerender
	 * @param loader {Canvace.Loader} A Loader object used to obtain the actual
	 * Image objects given the image IDs.
	 */
	this.prerender = function (loader) {
		for (var key in buckets) {
			if (buckets.hasOwnProperty(key)) {
				buckets[key].prerender(loader);
			}
		}
	};
};
