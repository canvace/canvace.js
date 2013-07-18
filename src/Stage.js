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
 * Wraps a Canvace stage.
 *
 * While providing the `data` object output by the Canvace Development
 * Environment to the `Stage` constructor be aware that its contents may be
 * modified in order to implement some optimizations.
 *
 * @class Canvace.Stage
 * @constructor
 * @param data {Object} The JSON data output by the Canvace Development
 * Environment.
 * @param canvas {Mixed} An HTML5 canvas element used where the stage will
 * be rendered. This parameter can be either the actual `HTMLCanvasElement`, or
 * a selector string. In the latter case, the first matching element is used,
 * and an exception is thrown if no matching element is found.
 */
Canvace.Stage = function (data, canvas) {
	if (typeof canvas === 'string') {
		canvas = document.querySelector(canvas);

		if (!canvas) {
			throw 'No element found matching the specified selector';
		}
	}

	var view = new Canvace.View(data, canvas);
	var buckets = new Canvace.Buckets(view, data);

	var map = null;

	var entities = {};
	var instances = new Canvace.MultiSet();
	var instancesWithPhysics = new Canvace.MultiSet();

	function assertObject(object, properties, fallback) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key)) {
				var value;
				if (key in object) {
					value = object[key];
				} else if (key in fallback) {
					value = fallback[key];
				} else {
					return false;
				}
				if (typeof properties[key] !== 'object') {
					if (value !== properties[key]) {
						return false;
					}
				} else if ((typeof value !== 'object') ||
					!assertObject(value, properties[key], {}))
				{
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Represents an entity (not an instance).
	 *
	 * This class cannot be instantiated directly, instances are returned by
	 * various methods of the `Stage` class and subclasses.
	 *
	 * @class Canvace.Stage.Entity
	 */
	function Entity(id) {
		var entity = data.entities[id = parseInt(id, 10)];
		if (!(id in entities)) {
			entities[id] = this;
		}

		/**
		 * Returns the numeric ID of the entity.
		 *
		 * @method getId
		 * @return {Number} The numeric ID of the entity.
		 */
		this.getId = function () {
			return id;
		};

		/**
		 * Returns the entity's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the entity's properties.
		 *
		 * @method getProperties
		 * @return {Object} The entity's `properties` field containing the
		 * custom properties the user set in the Canvace Development
		 * Environment.
		 */
		this.getProperties = function () {
			return entity.properties;
		};

		/**
		 * Indicates whether physics is enabled for this entity.
		 *
		 * Instances of entities that have physics enabled are automatically
		 * "ticked" when the whole stage is ticked. "Ticking" an entity instance
		 * means calling its `tick` method (see `Canvace.Stage.Instance.tick`),
		 * while "ticking" the whole stage means calling the `Stage.tick`
		 * method.
		 *
		 * Physics in entities can be enabled or disabled in the Canvace
		 * Development Environment.
		 *
		 * @method isPhysicsEnabled
		 * @return {Boolean} `true` if physics is enabled for this entity,
		 * `false` otherwise.
		 */
		this.isPhysicsEnabled = function () {
			return entity.enablePhysics;
		};

		/**
		 * Returns a reference to an object describing the bounding box of this
		 * entity. Any modification made to the returned object will affect the
		 * way instances of this entity interact with the surrounding
		 * environment.
		 *
		 * The returned object contains four real number fields: `i0`, `j0`,
		 * `iSpan` and `jSpan`. The `i0` and `j0` fields are the offsets of the
		 * origin of the bounding box from the position of the entity along the
		 * I and J axis, respectively. The `iSpan` and `jSpan` fields are the
		 * span of the bounding box along the I and J axis, respectively.
		 *
		 * @method getBoundingBox
		 * @return {Object} An object containing four fields, `i0`, `j0`,
		 *	`iSpan` and `jSpan`, describing the bounding box.
		 */
		this.getBoundingBox = function () {
			return entity.box;
		};

		/**
		 * Enumerates all the instances of this entity currently present in the
		 * stage, filtering them based on their custom properties.
		 *
		 * The `properties` argument contains the filtering properties: an
		 * instance is enumerated only if all of its filtered properties' values
		 * correspond to those declared in the `properties` argument. All other
		 * properties in the instance are not taken into account. This means
		 * that if you specify an empty `properties` object, all the instances
		 * are enumerated.
		 *
		 * Some custom properties may actually be objects containing other
		 * properties. This method performs a recursive deep comparison: the
		 * `properties` object may have nested objects containing other
		 * filtering properties.
		 *
		 * The entity instance is filtered based on its custom *instance*
		 * properties, but its custom *entity* properties are used as a
		 * fallback: if an instance does not contain a required property it is
		 * still enumerated if its entity does.
		 *
		 * Each enumerated instance is passed to the callback function as a
		 * `Canvace.Stage.Instance` object.
		 *
		 * The enumeration can be interrupted by returning `false` in the
		 * `action` callback function.
		 *
		 * @method forEachInstance
		 * @param action {Function} A callback function that gets called for
		 * every instance.
		 *
		 * It receives one single argument of type `Canvace.Stage.Instance` and
		 * can interrupt the enumeration by returning `false`.
		 * @param [properties] {Object} The optional filtering properties.
		 * @return {Boolean} `true` if the callback function returned `false`
		 * and the enumeration was interrupted, `false` otherwise.
		 */
		this.forEachInstance = function (action, properties) {
			if (!properties) {
				properties = {};
			}
			return instances.forEach(function (instance) {
				if (id === instance.getEntityId()) {
					if (assertObject(instance.getProperties(), properties, entity.properties)) {
						return action(instance);
					}
				}
			});
		};

		/**
		 * Creates a new instance of this entity and places it in the stage at
		 * the specified `(i, j, k)` position.
		 *
		 * The new instance has the initial velocity, uniform velocity and
		 * acceleration vectors all set to `(0, 0, 0)`.
		 *
		 * The new instance is returned as a `Canvace.Stage.Instance` object.
		 *
		 * @method createInstance
		 * @param i {Number} The I coordinate where the new instance has to be
		 * placed.
		 * @param j {Number} The J coordinate where the new instance has to be
		 * placed.
		 * @param k {Number} The K coordinate where the new instance has to be
		 * placed.
		 * @return {Canvace.Stage.Instance} The newly created instance.
		 */
		this.createInstance = function (i, j, k) {
			return new Instance({
				id: id,
				i: i,
				j: j,
				k: k,
				position: {
					i: i,
					j: j,
					k: k
				},
				previousPosition: {
					i: i,
					j: j,
					k: k
				},
				velocity: {
					i: 0,
					j: 0,
					k: 0
				},
				uniformVelocity: {
					i: 0,
					j: 0,
					k: 0
				},
				acceleration: {
					i: 0,
					j: 0,
					k: 0
				},
				properties: {}
			}, buckets.addEntity(id, i, j, k));
		};
	}

	/**
	 * Represents an entity instance in the stage.
	 *
	 * This class cannot be instantiated directly, instances can be obtained
	 * using other methods such as `Canvace.Stage.forEachInstance`,
	 * `Canvace.Stage.getInstance` or their `Canvace.Stage.Entity` equivalents.
	 *
	 * In every moment, an entity instance is characterized by the following
	 * state:
	 *	<ul>
	 *	<li>a position vector,</li>
	 *	<li>a velocity vector,</li>
	 *	<li>a uniform velocity vector,</li>
	 *	<li>an acceleration vector.</li>
	 *	</ul>
	 *
	 * Each one of these vectors is a vector in a three-dimensional space and is
	 * thus characterized by three real components `i`, `j` and `k`.
	 *
	 * An instance can be "ticked". Ticking an instance means updating its state
	 * based on the following physics rules:
	 *	<ul>
	 *	<li>the acceleration vector is not changed,</li>
	 *	<li>the uniform velocity vector is not changed,</li>
	 *	<li>the velocity vector is updated by adding the acceleration
	 *		vector,</li>
	 *	<li>the position vector is updated by adding the velocity and uniform
	 *		velocity vectors.</li>
	 *	</ul>
	 *
	 * To tick an instance use the `Canvace.Stage.Instance.tick` method.
	 *
	 * Ticking an instance, and thus updating its physics state, is not enough
	 * in order to update the actual position of its frames in the graphical
	 * rendering. Another separate operation, called "update", is necessary.
	 *
	 * An instance can be updated by invoking its `update` method.
	 *
	 * You do not usually need to invoke neither the `tick` nor the `update`
	 * method directly, as they are automatically invoked by the global
	 * `Canvace.Stage.tick` and `Canvace.Stage.update` methods which, in turn,
	 * are automatically invoked by the `RenderLoop`.
	 *
	 * Both the `Canvace.Stage.Instance.tick` and the
	 * `Canvace.Stage.Instance.update` methods are invoked _only_ for the
	 * instances that have physics enabled (physics can be toggled per-entity in
	 * the Canvace Development Environment).
	 *
	 * The point in having two separate operations, "tick" and "update", to do
	 * one thing, which is moving an entity instance in the game, is that other
	 * operations can be accomplished between the two. These operations
	 * typically consist in further physics processing, e.g. collision testing.
	 *
	 * @class Canvace.Stage.Instance
	 */
	function Instance(instanceOrId, element) {
		var id, instance;
		if (typeof instanceOrId !== 'number') {
			id = null;
			instance = instanceOrId;
		} else {
			id = instanceOrId;
			instance = data.instances[id];
		}
		var entity = data.entities[instance.id];

		var remove = instances.add(this);
		if (entity.enablePhysics) {
			remove = (function (remove1, remove2) {
				return function () {
					return remove1() && remove2();
				};
			}(remove, instancesWithPhysics.add(this)));
		}

		/**
		 * Returns the numeric ID of the instance, or `null` if this instance
		 * was not initially present in the JSON data exported from the Canvace
		 * Development Environment and was later added to the stage.
		 *
		 * @method getId
		 * @return {Number} The numeric ID of the instance, or `null` if the
		 * instance has no ID.
		 */
		this.getId = function () {
			return id;
		};

		/**
		 * Returns the entity instance's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the instance's properties.
		 *
		 * @method getProperties
		 * @return {Object} The entity instance's `properties` field containing
		 * the custom properties the user set in the Canvace Development
		 * Environment.
		 */
		this.getProperties = function () {
			return instance.properties;
		};

		/**
		 * Returns the numeric ID of the entity of this instance.
		 *
		 * @method getEntityId
		 * @return {Number} The numeric ID of the entity of this instance.
		 */
		this.getEntityId = function () {
			return instance.id;
		};

		/**
		 * Returns a `Canvace.Stage.Entity` object representing the entity whose
		 * instance is represented by this object.
		 *
		 * @method getEntity
		 * @return {Canvace.Stage.Entity} This instance's entity as a
		 * `Canvace.Stage.Entity` object.
		 */
		this.getEntity = function () {
			return entities[instance.id] || new Entity(instance.id);
		};

		/**
		 * Indicates whether physics is enabled for this instance's entity.
		 *
		 * @method isPhysicsEnabled
		 * @return {Boolean} `true` if physics is enabled, `false` otherwise.
		 */
		this.isPhysicsEnabled = function () {
			return entity.enablePhysics;
		};

		/**
		 * Returns the instance's `(i, j, k)` position vector as an object
		 * containing three fields, `i`, `j` and `k`.
		 *
		 * Note that the original position vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * position of the instance. You may use the returned object to manually
		 * control the position of the instance.
		 *
		 * Also note that changing the position of an instance by modifying the
		 * returned object does not affect its _rendered_ position until the
		 * `update` method is called.
		 *
		 * @method getPosition
		 * @return {Object} An object containing three fields, `i`, `j` and `k`,
		 * indicating the current position.
		 */
		this.getPosition = function () {
			return instance.position;
		};

		/**
		 * Returns the instance's projected position, which is its `(i, j, k)`
		 * position left-multiplied by the projection matrix.
		 *
		 * Note that this method returns the last calculated projected position,
		 * which means it does not reflect changes made by the `tick` method or
		 * by changing the position, velocity or uniform velocity objects
		 * returned by the `getPosition`, `getVelocity`, and
		 * `getUniformVelocity` methods. For changes to be reflected, the
		 * instance must be first updated using the `update` method.
		 *
		 * The position is returned as an object containing three fields, `x`,
		 * `y` and `z`, containing the `i`, `j` and `k` projected coordinates,
		 * respectively.
		 *
		 * @method getProjectedPosition
		 * @return {Object} The projected position as an object containing three
		 * `x`, `y` and `z` fields.
		 */
		this.getProjectedPosition = element.getProjectedPosition.bind(element);

		/**
		 * Returns the 2D rectangular area corresponding to the instances's
		 * bounds.
		 *
		 * Note that this method returns the last calculated projected
		 * rectangle, which means it does not reflect changes made by such
		 * methods as `tick`, `moveBy`, `setPosition` and so on. For changes to
		 * be reflected, the instance must be first updated using the `update`
		 * method.
		 *
		 * The rectangle is returned as an object containing four fields: the
		 * `x` and `y` coordinates of the origin and the `width` and `height`.
		 *
		 * The coordinates of the origin are calculated by left-multiplying the
		 * `(i, j, k)` position vector of the instance by the projection matrix
		 * and adding the entity's offset. The width and height are simply
		 * copied from the entity descriptor.
		 *
		 * @method getProjectedRectangle
		 * @return {Object} An object that describes the projected rectangle and
		 * contains four fields: `x`, `y`, `width` and `height`.
		 */
		this.getProjectedRectangle = element.getProjectedRectangle.bind(element);

		/**
		 * Indicates whether the instance is in or out of range.
		 *
		 * An entity instance is in range when its projected position (as
		 * returned by the `getProjectedPosition` method) falls within the
		 * "range" area, which is a rectangular area centered in the center of
		 * the viewport. The range area is usually much larger than the viewport
		 * area.
		 *
		 * This method is useful, for example, for discarding too far entity
		 * instances when stepping/ticking the physics of the game in order to
		 * improve performance, and is used by the `Stage.Range` inner class.
		 *
		 * @method inRange
		 * @param width {Number} The width of the range area.
		 * @param height {Number} The height of the range area.
		 * @return {Boolean} `true` if this instance falls within the specified
		 * range area, `false` otherwise.
		 */
		this.inRange = (function () {
			var viewportWidth = view.getWidth();
			var viewportHeight = view.getHeight();
			return function (width, height) {
				var position = element.getProjectedPosition();
				var origin = view.getOrigin();
				var frameWidth = (width - viewportWidth) / 2;
				var frameHeight = (height - viewportHeight) / 2;
				return (position.x >= -origin.x - frameWidth) &&
					(position.x <= -origin.x + viewportWidth + frameWidth) &&
					(position.y >= -origin.y - frameHeight) &&
					(position.y <= -origin.y + viewportHeight + frameHeight);
			};
		}());

		/**
		 * Returns the velocity vector of this instance as an object containing
		 * three fields, `i`, `j` and `k`, indicating the respective components
		 * of the vector. The velocity vector is initially `(0, 0, 0)`.
		 *
		 * This velocity vector is influenced by the acceleration vector of the
		 * instance: the components of the acceleration vector are added to the
		 * respective components of the velocity vector each time the instance
		 * is ticked using the `tick` method.
		 *
		 * Note that the original velocity vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * velocity of the instance. You may use the returned object to manually
		 * control the velocity of the instance.
		 *
		 * @method getVelocity
		 * @return {Object} The instance's velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getVelocity = function () {
			return instance.velocity;
		};

		/**
		 * Returns the uniform velocity vector of this instance.
		 *
		 * The vector is returned as an object containing three fields, `i`, `j`
		 * and `k`, indicating the respective components of the vector.
		 *
		 * Note that the original uniform velocity vector object associated to
		 * the instance is returned: changes made to the returned object affect
		 * the uniform velocity of the instance. You may use the returned object
		 * to manually control the uniform velocity of the instance.
		 *
		 * @method getUniformVelocity
		 * @return {Object} The instance's uniform velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getUniformVelocity = function () {
			return instance.uniformVelocity;
		};

		/**
		 * Returns the full velocity vector of the instance.
		 *
		 * The full velocity vector is the velocity vector plus the uniform
		 * velocity vector.
		 *
		 * The vector is returned as an object containing three fields, `i`, `j`
		 * and `k`, indicating the respective components of the vector.
		 *
		 * A new object is created, filled and returned every time this method
		 * is called; modifying its content does not have any effects on the
		 * state of the instance. The velocity and uniform velocity of the
		 * instance must be controlled independently.
		 *
		 * @method getFullVelocity
		 * @return {Object} The instance's full velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getFullVelocity = (function () {
			var fullVelocity = {
				i: instance.velocity.i + instance.uniformVelocity.i,
				j: instance.velocity.j + instance.uniformVelocity.j,
				k: instance.velocity.k + instance.uniformVelocity.k
			};
			return function () {
				fullVelocity.i = instance.velocity.i + instance.uniformVelocity.i;
				fullVelocity.j = instance.velocity.j + instance.uniformVelocity.j;
				fullVelocity.k = instance.velocity.k + instance.uniformVelocity.k;
				return fullVelocity;
			};
		}());

		/**
		 * Returns the instance's own acceleration vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 *
		 * The acceleration vector is initially `(0, 0, 0)`.
		 *
		 * Note that the original acceleration vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * acceleration of the instance. You may use the returned object to
		 * manually control the acceleration of the instance.
		 *
		 * @method getAcceleration
		 * @return {Object} The instance's acceleration vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getAcceleration = function () {
			return instance.acceleration;
		};

		/**
		 * Tests for collisions between this entity instance and the tiles of
		 * the specified `Canvace.TileMap`.
		 *
		 * This method invokes the `Canvace.TileMap.rectangleCollision` using
		 * the position of the instance, its current full velocity vector and
		 * the bounding box of its entity, as set in the Canvace Development
		 * Environment.
		 *
		 * This method does not change the state of the instance in any way; it
		 * only forwards the return value of the
		 * `Canvace.TileMap.rectangleCollision` method to the caller.
		 *
		 * @method testTileCollision
		 * @param [collides] {Function} An optional user-defined callback
		 * function that is invoked by the `testTileCollision` method for every
		 * tile that collides with the instance.
		 *
		 * The function receives two arguments, the tile's solid flag and its
		 * properties, and must return a boolean value indicating whether the
		 * tile is "solid" for this instance and must be taken into account as a
		 * colliding tile. If the function returns `false` the tile is _not_
		 * taken into account.
		 * @param [tileMap] {Canvace.TileMap} An optional `Canvace.TileMap`
		 * object whose tiles are tested for collisions with this entity
		 * instance. When not specified, this stage's tile map is used.
		 * @return {Object} A vector that is computed by the method and can be
		 * used to restore a "regular" configuration where the entity instance
		 * does not collide with the tiles.
		 *
		 * See the `Canvace.TileMap.rectangleCollision` method for more
		 * information, the return value is the same.
		 */
		this.testTileCollision = function (collides, tileMap) {
			return (tileMap || map).rectangleCollision(
				Math.floor(instance.k),
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j,
				collides
				);
		};

		/**
		 * Reacts to possible collisions between this entity instance and the
		 * tiles of the specified
		 * {{#crossLink "Canvace.TileMap"}}{{/crossLink}}.
		 *
		 * This method invokes the `Canvace.TileMap.rectangleCollision` method
		 * using the position of the instance, its current full velocity vector
		 * and the bounding box of its entity, as set in the Canvace Development
		 * Environment.
		 *
		 * It then reacts to the collision by updating the state of the instance
		 * trying to resume a regular configuration where there is no collision.
		 *
		 * Specifically, the position of the instance is updated by adding the I
		 * and J components of the vector returned by
		 * `Canvace.TileMap.rectangleCollision` and each one of the I and J
		 * components of the velocity vector is set to zero only if its sign is
		 * the opposite of the corresponding component in the vector returned by
		 * `Canvace.TileMap.rectangleCollision`.
		 *
		 * Note that only the velocity vector is changed, the uniform velocity
		 * vector is not.
		 *
		 * The vector returned by `Canvace.TileMap.rectangleCollision` is also
		 * forwarded to the caller.
		 *
		 * @method tileCollision
		 * @param [collides] {Function} TODO
		 * @param [tileMap] {Canvace.TileMap} A `Canvace.TileMap` object whose
		 * tiles are tested for collisions with this entity instance.
		 * @return {Object} The vector object returned by the
		 * `rectangleCollision` method of
		 * {{#crossLink "Canvace.TileMap"}}{{/crossLink}}.
		 */
		this.tileCollision = function (collides, tileMap) {
			var v = (tileMap || map).rectangleCollision(
				Math.floor(instance.k),
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j,
				collides
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v;
		};

		/**
		 * TODO
		 *
		 * @method collidesWithTiles
		 * @param [collides] {Function} TODO
		 * @param [tileMap] {Canvace.TileMap} TODO
		 * @return {Boolean} TODO
		 */
		this.collidesWithTiles = function (collides, tileMap) {
			var v = (tileMap || map).rectangleCollision(
				Math.floor(instance.k),
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j,
				collides
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v.i || v.j;
		};

		/**
		 * Detects collisions between a rectangular area and the bounding box of
		 * this entity instance.
		 *
		 * A vector is returned indicating two I and J values that must be added
		 * to the coordinates of the rectangular area in order to resume a
		 * regular configuration where the area does not collide with the
		 * instance.
		 *
		 * In case there is not any collision, the returned vector is `(0, 0)`.
		 *
		 * The rectangular area is specified by the `i`, `j`, `di` and `dj`
		 * arguments.
		 *
		 * The implementation of this method assumes the rectangular area
		 * represents a moving entity (though not necessarily a Canvace entity)
		 * which is characterized by its own velocity vector; this vector is
		 * used in the collision algorithm in that it assumes the moving entity
		 * cannot have compenetrated the bounding box of this instance along the
		 * I or J axis more than the velocity vector component for that axis.
		 * This is necessary in order to obtain a functional physics algorithm.
		 *
		 * If the rectangular area actually is the bounding box of a Canvace
		 * entity, you can specify the I and J components of its actual velocity
		 * vector for the `vi` and `vj` arguments; such vector can be retrieved
		 * by adding the two vectors returned by the `getVelocity` and
		 * `getUniformVelocity` methods.
		 *
		 * If specifying a velocity vector is not suitable, you can specify
		 * arbitrary constant values; a good choice is usually 1 for both `vi`
		 * and `vj`. However, do not specify 0, as this would _always_ result in
		 * no collision.
		 *
		 * This method can be used to implement in-layer, bounding box based,
		 * entity vs. entity collisions. If the rectangular area represents an
		 * entity's bounding box, the `i` and `j` coordinates of its origin can
		 * be obtained using the `Canvace.Stage.Instance.getPosition` method,
		 * while the `di` and `dj` span values are usually constant and must be
		 * arbitrarily determined by the developer.
		 *
		 * @method rectangleCollision
		 * @param i {Number} The I coordinate of the origin of the rectangular
		 * area. This may be a real number.
		 * @param j {Number} The J coordinate of the origin of the rectangular
		 * area. This may be a real number.
		 * @param di {Number} The span of the rectangular area along the I axis.
		 * This may be a real number.
		 * @param dj {Number} The span of the rectangular area along the J axis.
		 * This may be a real number.
		 * @param Di {Number} TODO
		 * @param Dj {Number} TODO
		 * @return {Object} An object containing two number fields, `i` and `j`,
		 * specifying the I and J components of the computed vector.
		 */
		this.rectangleCollision = function (i, j, di, dj, Di, Dj) {
			var v = {
				i: 0,
				j: 0
			};
			if (i < instance.position.i + entity.box.i0) {
				if (i + di > instance.position.i + entity.box.i0) {
					if (j < instance.position.j + entity.box.j0) {
						if (j + dj > instance.position.j + entity.box.j0) {
							if (i + di < instance.position.i + entity.box.i0 + entity.box.iSpan) {
								v.i = instance.position.i + entity.box.i0 - i - di;
							}
							if (j + dj < instance.position.j + entity.box.j0 + entity.box.jSpan) {
								v.j = instance.position.j + entity.box.j0 - j - dj;
							}
						}
					} else if (j < instance.position.j + entity.box.j0 + entity.box.jSpan) {
						if (i + di < instance.position.i + entity.box.i0 + entity.box.iSpan) {
							v.i = instance.position.i + entity.box.i0 - i - di;
						}
						if (j + dj > instance.position.j + entity.box.j0 + entity.box.jSpan) {
							v.j = instance.position.j + entity.box.j0 - j - dj;
						}
					}
				}
			} else if (i < instance.position.i + entity.box.i0 + entity.box.iSpan) {
				if (j < instance.position.j + entity.box.j0) {
					if (j + dj > instance.position.j + entity.box.j0) {
						v.i = instance.position.i + entity.box.i0 + entity.box.iSpan - i;
						if (j + dj < instance.position.j + entity.box.j0 + entity.box.jSpan) {
							v.j = instance.position.j + entity.box.j0 - j - dj;
						}
					}
				} else if (j < instance.position.j + entity.box.j0 + entity.box.jSpan) {
					if (i + di > instance.position.i + entity.box.i0 + entity.box.iSpan) {
						v.i = instance.position.i + entity.box.i0 + entity.box.iSpan - i;
					}
					if (j + dj > instance.position.j + entity.box.j0 + entity.box.jSpan) {
						v.j = instance.position.j + entity.box.j0 + entity.box.jSpan - j;
					}
				}
			}
			if (Math.abs(v.i) > Math.abs(instance.position.i - instance.previousPosition.i - Di) + 0.001) {
				v.i = 0;
			}
			if (Math.abs(v.j) > Math.abs(instance.position.j - instance.previousPosition.j - Dj) + 0.001) {
				v.j = 0;
			}
			return v;
		};

		/**
		 * Tests for collisions between this entity instance and the specified
		 * one.
		 *
		 * This method invokes the `rectangleCollision` method of the specified
		 * _other_ instance using the position of _this_ instance, its current
		 * full velocity vector and the bounding box of its entity as set in the
		 * Canvace Development Environment.
		 *
		 * This method does not change the state of the instances in any way; it
		 * only forwards the return value of the `rectangleCollision` method to
		 * the caller.
		 *
		 * @method testCollision
		 * @param otherInstance {Canvace.Stage.Instance} Another `Instance`
		 * object that is tested for collisions with this instance.
		 * @return {Object} A vector that is computed by the method and can be
		 * used to restore a "regular" configuration where the specified
		 * instance does not collide with this instance.
		 *
		 * See the `Canvace.Stage.Instance.rectangleCollision` method for more
		 * information, the return value is the same.
		 */
		this.testCollision = function (otherInstance) {
			return otherInstance.rectangleCollision(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j
				);
		};

		/**
		 * Reacts to possible collisions between this entity instance and the
		 * specified one.
		 *
		 * This method invokes the `Canvace.Stage.Instance.rectangleCollision`
		 * method of the specified _other_ instance passing the position of
		 * _this_ instance, its current full velocity vector and the bounding
		 * box of its entity as set in the Canvace Development Environment.
		 *
		 * It then reacts to the collision by updating the state of _this_
		 * instance trying to resume a regular configuration where there is no
		 * collision.
		 *
		 * Specifically, the position of the instance is updated by adding the I
		 * and J components of the vector returned by `rectangleCollision` and
		 * each one of the I and J components of the velocity vector is set to
		 * zero only if its sign is the opposite of the corresponding component
		 * in the vector returned by `rectangleCollision`.
		 *
		 * Note that only the velocity vector is changed, the uniform velocity
		 * vector is not.
		 *
		 * The vector returned by `Canvace.Stage.Instance.rectangleCollision`
		 * is also forwarded to the caller.
		 *
		 * @method collision
		 * @param otherInstance {Canvace.Stage.Instance} Another `Instance`
		 * object that is tested for collisions with this instance.
		 * @return {Object} The vector object returned by the
		 * `Canvace.Stage.Instance.rectangleCollision` method.
		 */
		this.collision = function (otherInstance) {
			var v = otherInstance.rectangleCollision(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v;
		};

		/**
		 * TODO
		 *
		 * @method collidesWithInstance
		 * @param otherInstance {Canvace.Instance} TODO
		 * @return {Boolean} TODO
		 */
		this.collidesWithInstance = function (otherInstance) {
			var v = otherInstance.rectangleCollision(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.position.i - instance.previousPosition.i,
				instance.position.j - instance.previousPosition.j
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v.i || v.j;
		};

		/**
		 * "Ticks" the instance, updating its position based on its velocity and
		 * its velocity based on its acceleration.
		 *
		 * This method is automatically called by the `Canvace.Stage.tick`
		 * method if the entity has physics enabled.
		 *
		 * @method tick
		 * @param dt {Number} TODO
		 */
		this.tick = function (dt) {
			var dt2 = dt * dt * 0.5;
			instance.previousPosition.i = instance.position.i;
			instance.previousPosition.j = instance.position.j;
			instance.previousPosition.k = instance.position.k;
			instance.position.i += (instance.velocity.i + instance.uniformVelocity.i) * dt + instance.acceleration.i * dt2;
			instance.position.j += (instance.velocity.j + instance.uniformVelocity.j) * dt + instance.acceleration.j * dt2;
			instance.position.k += (instance.velocity.k + instance.uniformVelocity.k) * dt + instance.acceleration.k * dt2;
			instance.velocity.i += instance.acceleration.i * dt;
			instance.velocity.j += instance.acceleration.j * dt;
			instance.velocity.k += instance.acceleration.k * dt;
		};

		/**
		 * Updates the instance so that its graphical representation in
		 * subsequent renderings reflect its actual position.
		 *
		 * Since this method is potentially costly, it should be called only
		 * once per instance at each iteration of the render loop. This is what
		 * the `RenderLoop` class does.
		 *
		 * This method is automatically called by the `Canvace.Stage.update`
		 * method if the entity has physics enabled.
		 *
		 * @method update
		 */
		this.update = function () {
			element.updatePosition(instance.position.i, instance.position.j, instance.position.k);
		};

		/**
		 * Removes the entity instance from the stage. The instance will not be
		 * rendered any more by subsequent `Renderer.render` calls and will not
		 * be enumerated any more by the `Buckets.forEachElement` method.
		 *
		 * This method does not do anything if the instance has already been
		 * removed or replaced with another entity using the `replaceWith`
		 * method.
		 *
		 * @method remove
		 */
		this.remove = function () {
			element.remove();
			remove();
		};

		/**
		 * Indicates whether this instance has been removed from the stage.
		 *
		 * @method isRemoved
		 * @return {Boolean} `true` if this instance has been removed, `false`
		 * otherwise.
		 */
		this.isRemoved = element.isRemoved.bind(element);

		/**
		 * Replaces this entity instance with a new instance of another entity.
		 *
		 * After being replaced, this instance becomes invalid and this object
		 * should be discarded. The method returns a new `Stage.Instance` object
		 * that can be used to control the new instance.
		 *
		 * The new instance inherits this instance's position, velocity and
		 * acceleration vectors.
		 *
		 * This method throws an exception if it is invoked after the instance
		 * has been removed or already replaced by a previous call.
		 *
		 * @method replaceWith
		 * @param entity {Canvace.Stage.Entity} An entity to be instantiated
		 * and whose new instance must replace this one.
		 * @return {Canvace.Stage.Instance} A new `Stage.Instance` object
		 * representing the new instance.
		 */
		this.replaceWith = function (entity) {
			if (remove()) {
				return new Instance(instance, element.replace(instance.id = entity.getId()));
			} else {
				throw 'the instance cannot be replaced because it has been removed';
			}
		};

		/**
		 * Duplicates the instance, also replicating its velocity, uniform
		 * velocity and acceleration vectors.
		 *
		 * An entity may be optionally specified as a `Canvace.Stage.Entity`
		 * object to the `entity` argument so that the new instance refers to
		 * another entity.
		 *
		 * The new instance is returned as a `Canvace.Stage.Instance` object.
		 *
		 * @method fork
		 * @param [entity] {Canvace.Stage.Entity} An optional entity the new
		 * instance refers to. The new instance refers to the same entity of
		 * this instance if this argument is not specified.
		 * @return {Canvace.Stage.Instance} The new instance.
		 */
		this.fork = function (entity) {
			var id = entity ? entity.getId() : instance.id;
			return new Instance({
				id: id,
				i: instance.i,
				j: instance.j,
				k: instance.k,
				position: {
					i: instance.position.i,
					j: instance.position.j,
					k: instance.position.k
				},
				previousPosition: {
					i: instance.previousPosition.i,
					j: instance.previousPosition.j,
					k: instance.previousPosition.k
				},
				velocity: {
					i: instance.velocity.i,
					j: instance.velocity.j,
					k: instance.velocity.k
				},
				uniformVelocity: {
					i: instance.uniformVelocity.i,
					j: instance.uniformVelocity.j,
					k: instance.uniformVelocity.k
				},
				acceleration: {
					i: instance.acceleration.i,
					j: instance.acceleration.j,
					k: instance.acceleration.k
				},
				properties: {}
			}, buckets.addEntity(id, instance.position.i, instance.position.j, instance.position.k));
		};
	}

	(function () {
		map = new Canvace.TileMap(data, buckets);
		for (var id in data.instances) {
			var instance = data.instances[id];
			instance.position = {
				i: instance.i,
				j: instance.j,
				k: instance.k
			};
			instance.previousPosition = {
				i: instance.i,
				j: instance.j,
				k: instance.k
			};
			instance.velocity = {
				i: 0,
				j: 0,
				k: 0
			};
			instance.uniformVelocity = {
				i: 0,
				j: 0,
				k: 0
			};
			instance.acceleration = {
				i: 0,
				j: 0,
				k: 0
			};
			new Instance(parseInt(id, 10), buckets.addEntity(instance.id, instance.i, instance.j, instance.k));
		}
	}());

	/**
	 * Returns the stage's name.
	 *
	 * @method getName
	 * @for Canvace.Stage
	 * @return {String} The stage's name.
	 */
	this.getName = function () {
		return data.name;
	};

	/**
	 * Returns the stage's custom properties as set in the Canvace Development
	 * Environment.
	 *
	 * The original `properties` object is returned, so that modifications
	 * actually affect the stage's properties.
	 *
	 * @method getProperties
	 * @return {Object} The stage's `properties` field containing the custom
	 * properties the user set in the Canvace Development Environment.
	 */
	this.getProperties = function () {
		return data.properties;
	};

	/**
	 * Returns the HTML5 canvas where the stage is rendered. This is the same
	 * canvas object specified to the constructor.
	 *
	 * @method getCanvas
	 * @return {HTMLCanvasElement} The HTML5 canvas where the stage is rendered.
	 */
	this.getCanvas = function () {
		return canvas;
	};

	/**
	 * Returns a `View` object that can be used by a `Renderer` to render the
	 * stage. It is internally built and initialized by `Stage`'s constructor.
	 *
	 * @method getView
	 * @return {Canvace.View} A `View` object.
	 */
	this.getView = function () {
		return view;
	};

	/**
	 * Returns a {{#crossLink "Canvace.Buckets"}}{{/crossLink}} object that can
	 * be used by a {{#crossLink "Renderer"}}{{/crossLink}} to render the
	 * stage. It is internally built and initialized by `Canvace.Stage`'s
	 * constructor.
	 *
	 * @method getBuckets
	 * @return {Canvace.Buckets} A `Buckets` object.
	 */
	this.getBuckets = function () {
		return buckets;
	};

	/**
	 * TODO
	 *
	 * @method prerender
	 * @param loader {Canvace.Loader} TODO
	 */
	this.prerender = buckets.prerender;

	/**
	 * Provides a {{#crossLink "Canvace.TileMap"}}{{/crossLink}} object that
	 * allows to manage this stage's tile map.
	 *
	 * The `Canvace.TileMap` object is created lazily only once, the first time
	 * this method is called; subsequent calls return the same object.
	 *
	 * @method getTileMap
	 * @return {Canvace.TileMap} A `TileMap` object associated to this stage's
	 * tile map.
	 */
	this.getTileMap = function () {
		return map;
	};

	/**
	 * Enumerates all the entities of this stage, filtering them based on their
	 * custom properties.
	 *
	 * The `properties` argument contains the filtering properties: an entity is
	 * enumerated only if all of its filtered properties' values correspond to
	 * those declared in the `properties` argument. All other properties in the
	 * entity are not taken into account. This means that if you specify an
	 * empty `properties` object, all the entities are enumerated.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * Each enumerated entity is passed to the callback function as a
	 * `Canvace.Stage.Entity` object.
	 *
	 * The enumeration can be interrupted by returning `false` in the
	 * `action` callback function.
	 *
	 * @method forEachEntity
	 * @param action {Function} A callback function that gets called for every
	 * entity.
	 *
	 * It receives one single argument of type `Canvace.Stage.Entity` and can
	 * interrupt the enumeration by returning `false`.
	 * @param [properties] {Object} The optional filtering properties.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the enumeration was interrupted, `false` otherwise.
	 */
	this.forEachEntity = function (action, properties) {
		if (!properties) {
			properties = {};
		}
		for (var id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				if (assertObject(data.entities[id].properties, properties, {})) {
					if (action(entities[id] || new Entity(id)) === false) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * Returns an array of entities not filtered by the specified filtering
	 * properties.
	 *
	 * Entities are filtered based on their custom properties. The `properties`
	 * argument contains the filtering properties: an entity is returned only if
	 * all of its filtered properties' values correspond to those declared in
	 * the `properties` argument. All other properties in the entity are not
	 * taken into account. This means that if you specify an empty `properties`
	 * object, all the entities are returned.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The chosen entities are returned as an array of `Stage.Entity` objects.
	 *
	 * @method getEntities
	 * @param [properties] {Object} The filtering properties.
	 * @return {Canvace.Stage.Entity[]} An array of `Canvace.Stage.Entity` objects
	 * representing the returned entities.
	 */
	this.getEntities = function (properties) {
		var array = [];
		for (var id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				if (assertObject(data.entities[id].properties, properties || {}, {})) {
					array.push(entities[id] || new Entity(id));
				}
			}
		}
		return array;
	};

	/**
	 * Returns an arbitrarily chosen entity among the ones not filtered by the
	 * specified filtering properties.
	 *
	 * Entities are filtered based on their custom properties. The `properties`
	 * argument contains the filtering properties: an entity is eligible only if
	 * all of its filtered properties' values correspond to those declared in
	 * the `properties` argument. All other properties in the entity are not
	 * taken into account. This means that if you specify an empty `properties`
	 * object, all the entities are eligible.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The chosen entity is returned as a `Stage.Entity` object.
	 *
	 * @method getEntity
	 * @param [properties] {Object} The filtering properties.
	 * @return {Canvace.Stage.Entity} A `Canvace.Stage.Entity` object
	 * representing the returned entity.
	 */
	this.getEntity = function (properties) {
		for (var id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				if (assertObject(data.entities[id].properties, properties || {}, {})) {
					return entities[id] || new Entity(id);
				}
			}
		}
		return null;
	};

	/**
	 * Enumerates the entity instances currently present in the stage. Each
	 * instance is returned as a `Canvace.Stage.Instance` object.
	 *
	 * The enumeration can be interrupted by returning `false` in the `action`
	 * callback function.
	 *
	 * @method forEachInstance
	 * @param action {Function} A callback function that gets called for every
	 * instance.
	 *
	 * It receives one single argument of type `Canvace.Stage.Instance` and can
	 * interrupt the enumeration by returning `false`.
	 * @param [properties] {Object} The optional filtering properties.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the enumeration was interrupted, `false` otherwise.
	 */
	this.forEachInstance = function (action, properties) {
		return instances.forEach(function (instance) {
			if (assertObject(instance.getProperties(), properties || {}, instance.getEntity().getProperties())) {
				return action(instance);
			}
		});
	};

	/**
	 * Returns an array of entity instances among the ones currently in the
	 * stage and not filtered by the specified filtering properties.
	 *
	 * Entity instances are filtered based on their custom properties. The
	 * `properties` argument contains the filtering properties: an instance is
	 * returned only if all of its filtered properties' values correspond to
	 * those declared in the `properties` argument. All other properties in the
	 * instance are not taken into account. This means that if you specify an
	 * empty `properties` object, an array containing all the instances is
	 * returned.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The entity instances are filtered based on its custom *instance*
	 * properties, but its custom *entity* properties are used as a fallback: if
	 * an instance does not contain a required property it is still returned if
	 * its entity does.
	 *
	 * The chosen instances are returned as an array of `Canvace.Stage.Instance`
	 * objects.
	 *
	 * @method getInstances
	 * @param [properties] {Object} The filtering properties.
	 * @return {Canvace.Stage.Instance[]} An array of `Canvace.Stage.Instance`
	 * objects representing the returned entity instances.
	 */
	this.getInstances = function (properties) {
		var array = [];
		instances.forEach(function (instance) {
			if (assertObject(instance.getProperties(), properties || {}, instance.getEntity().getProperties())) {
				array.push(instance);
			}
		});
		return array;
	};

	/**
	 * Returns an arbitrarily chosen entity instance among the ones currently in
	 * the stage and not filtered by the specified filtering properties.
	 *
	 * Entity instances are filtered based on their custom properties. The
	 * `properties` argument contains the filtering properties: an instance is
	 * eligible only if all of its filtered properties' values correspond to
	 * those declared in the `properties` argument. All other properties in the
	 * instance are not taken into account. This means that if you specify an
	 * empty `properties` object, all the instances are eligible.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The entity instance is filtered based on its custom *instance*
	 * properties, but its custom *entity* properties are used as a fallback: if
	 * an instance does not contain a required property it is still eligible if
	 * its entity does.
	 *
	 * The chosen instance is returned as a `Canvace.Stage.Instance` object.
	 *
	 * @method getInstance
	 * @param [properties] {Object} The filtering properties.
	 * @return {Canvace.Stage.Instance} A `Canvace.Stage.Instance` object
	 * representing the returned entity instance.
	 */
	this.getInstance = function (properties) {
		var result = null;
		instances.forEach(function (instance) {
			if (assertObject(instance.getProperties(), properties || {}, instance.getEntity().getProperties())) {
				result = instance;
				return false;
			}
		});
		return result;
	};

	/**
	 * TODO
	 *
	 * @class Canvace.Stage.Range
	 * @constructor
	 * @param width {Number} TODO
	 * @param height {Number} TODO
	 */
	this.Range = function (width, height) {
		/**
		 * TODO
		 *
		 * @method forEachInstance
		 * @param action {Function} TODO
		 * @param [properties] {Object} TODO
		 * @return {Boolean} TODO
		 */
		this.forEachInstance = function (action, properties) {
			if (!properties) {
				properties = {};
			}
			return instances.forEach(function (instance) {
				if (instance.inRange(width, height)) {
					if (assertObject(instance.getProperties(), properties, instance.getEntity().getProperties())) {
						return action(instance);
					}
				}
			});
		};

		/**
		 * TODO
		 *
		 * @method tick
		 * @param dt {Number} TODO
		 */
		this.tick = function (dt) {
			instancesWithPhysics.fastForEach(function (instance) {
				if (instance.inRange(width, height)) {
					instance.tick(dt);
				}
			});
		};

		/**
		 * TODO
		 *
		 * @method update
		 */
		this.update = function () {
			instancesWithPhysics.fastForEach(function (instance) {
				if (instance.inRange(width, height)) {
					instance.update();
				}
			});
		};
	};

	/**
	 * "Ticks" all the entities of the stage that have physics enabled. This
	 * method simply iterates over such entities and invokes their `tick`
	 * method.
	 *
	 * You do not usually need to call this method as it is automatically called
	 * by Canvace's render loop implementation in the
	 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} class.
	 *
	 * @method tick
	 * @for Canvace.Stage
	 * @param dt {Number} TODO
	 */
	this.tick = function (dt) {
		instancesWithPhysics.fastForEach(function (instance) {
			instance.tick(dt);
		});
	};

	/**
	 * Updates all the entities of the stage that have physics enabled. This
	 * method simply iterates over such entities and invokes their `update`
	 * method.
	 *
	 * You do not usually need to call this method as it is automatically called
	 * by Canvace's render loop implementation in the
	 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} class.
	 *
	 * @method update
	 */
	this.update = function () {
		instancesWithPhysics.fastForEach(function (instance) {
			instance.update();
		});
	};
};
