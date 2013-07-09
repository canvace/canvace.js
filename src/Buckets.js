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
			frameTable.registerTile(id);
		}
		for (id in data.entities) {
			frameTable.registerEntity(id);
		}
	}());

	function Bucket() {
		var sections = {};
		var minS = 0, maxS = 0;
		this.add = function (p, width, height, getFrame, timeOffset) {
			minS = Math.min(minS, p[2]);
			maxS = Math.max(maxS, p[2]);
			if (!sections[p[2]]) {
				sections[p[2]] = new Canvace.MultiSet();
			}
			return sections[p[2]].add({
				p: p,
				width: width,
				height: height,
				getFrame: getFrame,
				timeOffset: timeOffset
			});
		};
		this.forEach = function (action) {
			for (var s = minS; s <= maxS; s++) {
				if (sections.hasOwnProperty(s)) {
					sections[s].fastForEach(action);
				}
			}
		};
	}

	var buckets = {};

	function MockElement() {
		this.updatePosition = function () {};
		this.remove = function () {};
		this.replace = function () {};
	}

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
	function Element(element, getAnimation, i, j, k) {
		if (!element.frames.length) {
			return new MockElement();
		}

		var p = view.projectElement(element, i, j, k);
		var bi = Math.floor(p[1] / height);
		var bj = Math.floor(p[0] / width);

		var animation = getAnimation();
		var timeOffset = Canvace.Timing.now();

		var removers = [];
		var removed = false;

		function addToBucket(i, j) {
			var key = i + ' ' + j;
			if (!buckets.hasOwnProperty(key)) {
				buckets[key] = new Bucket();
			}
			removers.push(buckets[key].add(p, element.width, element.height, animation, timeOffset));
		}

		function addToBuckets() {
			addToBucket(bi, bj);
			var bi1 = Math.floor((p[1] + element.height) / height);
			var bj1 = Math.floor((p[0] + element.width) / width);
			if (bi1 > bi) {
				addToBucket(bi + 1, bj);
			}
			if (bj1 > bj) {
				addToBucket(bi, bj + 1);
			}
			if ((bi1 > bi) && (bj1 > bj)) {
				addToBucket(bi + 1, bj + 1);
			}
		}

		addToBuckets();

		function remove() {
			for (var index in removers) {
				removers[index]();
			}
			removers = [];
			removed = true;
			return true;
		}

		/**
		 * Returns the entity's projected position, which is its `(i, j, k)`
		 * position left-multiplied by the projection matrix.
		 *
		 * The position is returned as an object containing three fields,
		 * `x`, `y` and `z`, containing the `i`, `j` and `k` projected
		 * coordinates, respectively.
		 *
		 * @method getProjectedPosition
		 * @return {Object} The projected position as an object containing
		 * three `x`, `y` and `z` fields.
		 */
		this.getProjectedPosition = function () {
			return {
				x: p[0] - element.offset.x,
				y: p[1] - element.offset.y,
				z: p[2]
			};
		};

		/**
		 * Returns the 2D rectangular area corresponding to the entity's
		 * bounds.
		 *
		 * The rectangle is returned as an object containing four fields:
		 * the `x` and `y` coordinates of the origin and the `width` and
		 * `height`.
		 *
		 * The coordinates of the origin are calculated by left-multiplying
		 * the `(i, j, k)` position vector of the entity by the projection
		 * matrix and adding the entity's offset. The width and height are
		 * simply copied from the entity descriptor.
		 *
		 * @method getProjectedRectangle
		 * @return {Object} An object that describes the projected rectangle
		 * and contains four fields: `x`, `y`, `width` and `height`.
		 */
		this.getProjectedRectangle = function () {
			return {
				x: p[0],
				y: p[1],
				z: p[2],
				width: element.width,
				height: element.height
			};
		};

		/**
		 * Updates the entity's position and possibly some internal data
		 * structures so that the entity is enumerated correctly by the
		 * {{#crossLink "Canvace.Buckets/forEachElement}}{{/crossLink}}
		 * method after it is repositioned.
		 *
		 * The specified `i`, `j` and `k` values may be real numbers.
		 *
		 * @method updatePosition
		 * @param i {Number} The new I coordinate.
		 * @param j {Number} The new J coordinate.
		 * @param k {Number} The new K coordinate.
		 */
		this.updatePosition = function (i1, j1, k1) {
			if (!removed) {
				var p1 = view.projectElement(element, i = i1, j = j1, k = k1);
				var bi1 = Math.floor(p[1] / height);
				var bj1 = Math.floor(p[0] / width);
				if ((p1[2] !== p[2]) || (bi1 !== bi) || (bj1 !== bj)) {
					remove();
					removed = false;
					p[0] = p1[0];
					p[1] = p1[1];
					p[2] = p1[2];
					bi = bi1;
					bj = bj1;
					addToBuckets();
				} else {
					p[0] = p1[0];
					p[1] = p1[1];
					p[2] = p1[2];
				}
			}
		};

		/**
		 * Removes the entity so that it is not enumerated by the
		 * {{#crossLink "Canvace.Buckets/forEachElement}}{{/crossLink}}
		 * method any more.
		 *
		 * This method is idempotent: it does not have any effects when it
		 * is called again after the first time.
		 *
		 * @method remove
		 * @return {Boolean} `true`.
		 */
		this.remove = remove;

		/**
		 * Indicates whether this entity has been removed from the buckets.
		 *
		 * @method isRemoved
		 * @return {Boolean} `true` if this element has been removed,
		 * `false` otherwise.
		 */
		this.isRemoved = function () {
			return removed;
		};

		/**
		 * Replaces the entity with another one identified by the specified
		 * ID. This entity is removed as if the
		 * {{#crossLink "Canvace.Buckets.Entity/remove"}}{{/crossLink}}
		 * method was called, and this
		 * {{#crossLink "Canvace.Buckets.Entity"}}Entity{{/crossLink}}
		 * object becomes useless and should be discarded.
		 *
		 * @method replace
		 * @param id {Number} The new entity's ID.
		 * @return {Canvace.Buckets.Entity} A new Entity object representing the
		 * new entity.
		 */
		this.replace = function (id) {
			if (!removed) {
				if (!(id in data.entities)) {
					throw {
						message: 'invalid entity ID',
						id: id
					};
				}

				remove();
				var entity = data.entities[id];

				return new Element(entity, function () {
					return frameTable.getEntityAnimation(id);
				}, i, j, k);
			}
		};
	}

	var eraser = {};

	function addTile(id, i, j, k) {
		if (!(id in data.tiles)) {
			throw {
				message: 'invalid tile ID',
				id: id
			};
		}

		var tile = data.tiles[id];

		var remover = new Element(tile, function () {
			return frameTable.getTileAnimation(id);
		}, i, j, k).remove;

		if (tile.mutable) {
			if (!eraser[k]) {
				eraser[k] = {};
			}
			if (!eraser[k][i]) {
				eraser[k][i] = {};
			}
			var removed = false;
			return eraser[k][i][j] = function () {
				remover();
				if (removed) {
					return false;
				} else {
					delete eraser[k][i][j];
					removed = true;
					return true;
				}
			};
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

		return new Element(entity, function () {
			return frameTable.getEntityAnimation(id);
		}, i, j, k);
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
		return eraser[k] && eraser[k][i] && eraser[k][i][j] && eraser[k][i][j]() || false;
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
		if (eraser[k] && eraser[k][i] && eraser[k][i][j] && eraser[k][i][j]()) {
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
		(function (processBucket) {
			processBucket(i, j);
			processBucket(i, j + 1);
			processBucket(i + 1, j);
			processBucket(i + 1, j + 1);
		}(function (i, j) {
			var key = i + ' ' + j;
			if (buckets.hasOwnProperty(key)) {
				var timestamp = Canvace.Timing.now();
				buckets[key].forEach(function (element) {
					if ((element.p[0] < -origin.x + width) &&
						(element.p[1] < -origin.y + height) &&
						(element.p[0] + element.width >= -origin.x) &&
						(element.p[1] + element.height >= -origin.y))
					{
						action(element.p[0], element.p[1], element.getFrame(timestamp - element.timeOffset));
					}
				});
			}
		}));
	};
};
