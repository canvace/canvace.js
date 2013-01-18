/**
 * Provides functionalities to manage a stage's tile map. You do not usually
 * need to instantiate this object directly, you can get an instance using the
 * `Stage.getTileMap` method.
 *
 * @class Canvace.TileMap
 * @constructor
 * @param data {Object} The JSON object produced by the Canvace Development
 * Environment.
 * @param buckets {Canvace.Buckets} A `Canvace.Buckets` object that is updated
 * along with the map, so that changes in the map are reflected by subsequent
 * renderings.
 */
Canvace.TileMap = function (data, buckets) {
	var map = data.map;

	var tileCache = {};

	/**
	 * This class wraps a tile descriptor.
	 *
	 * @class Canvace.TileMap.Tile
	 */
	function Tile(id) {
		var tile = data.tiles[id];

		/**
		 * Indicates whether this descriptor describes a walkable tile or not.
		 *
		 * @method isWalkable
		 * @return {Boolean} `true` if this tile is walkable, `false` otherwise.
		 */
		this.isWalkable = function () {
			return tile.walkable;
		};

		/**
		 * Returns the tile's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the tile's properties.
		 *
		 * @method getProperties
		 * @return {Object} The tile's `properties` field containing the custom
		 * properties the user set in the Canvace Development Environment.
		 */
		this.getProperties = function () {
			return tile.properties;
		};
	}

	/**
	 * Enumerates the numbers of the layers currently in the tile map.
	 *
	 * For each enumerated layer the `action` callback function is called and
	 * receives a numeric argument, the layer number.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachLayer` method, otherwise `false` is returned.
	 *
	 * @method forEachLayer
	 * @for Canvace.TileMap
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated layer.
	 *
	 * The function receives one argument, the layer number.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachLayer = function (action) {
		for (var k in map) {
			if (action(parseInt(k, 10)) === false) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Enumerates the tiles currently in the map.
	 *
	 * For each enumerated tile the `action` callback function is called and
	 * receives three integer arguments, the `i`, `j` and `k` coordinates of the
	 * tile. The tile itself can then be retrieved as a `TileMap.Tile` object by
	 * calling the `TileMap.getAt` method.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachTile` method, otherwise `false` is returned.
	 *
	 * @method forEachTile
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated tile.
	 *
	 * The function receives three integer arguments: the `i`, `j` and `k`
	 * coordinates of the tile, respectively.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachTile = function (action) {
		for (var k in map) {
			k = parseInt(k, 10);
			for (var i in map[k]) {
				i = parseInt(i, 10);
				for (var j in map[k][i]) {
					j = parseInt(j, 10);
					if (action(i, j, k) === false) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * Enumerates the tiles in the specified layer of the map.
	 *
	 * For each enumerated tile the `action` callback function is called and
	 * receives two integer arguments, the `i` and `j` coordinates of the tile.
	 * The tile itself can then be retrieved as a `TileMap.Tile` object by
	 * calling the `TileMap.getAt` method.
	 *
	 * An exception is thrown if the `k` argument does not represent a valid
	 * layer of the map. This includes empty layers: if a tile map contains
	 * tiles at layers `0` and `2` but none at layer `1` you cannot specify `1`
	 * for the `k` argument because the map does not contain the layer `1`.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachTileInLayer` method, otherwise `false` is returned.
	 *
	 * @method forEachTileInLayer
	 * @param k {Number} The layer number.
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated tile.
	 *
	 * The function receives two integer arguments: the `i` and `j` coordinates
	 * of the tile, respectively.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachTileInLayer = function (k, action) {
		if (!(k in map)) {
			throw 'invalid layer number: ' + k;
		}
		for (var i in map[k]) {
			i = parseInt(i, 10);
			for (var j in map[k][i]) {
				j = parseInt(j, 10);
				if (action(i, j) === false) {
					return true;
				}
			}
		}
		return false;
	};

	function assertObject(object, properties) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key)) {
				var value;
				if (key in object) {
					value = object[key];
				} else {
					return false;
				}
				if (typeof properties[key] !== 'object') {
					if (value !== properties[key]) {
						return false;
					}
				} else if ((typeof value !== 'object') ||
					!assertObject(value, properties[key]))
				{
					return false;
				}
			}
		}
		return true;
	}

	function getTileIds(properties) {
		var ids = [];
		for (var id in data.tiles) {
			if (assertObject(data.tiles[id].properties, properties)) {
				ids.push(id);
			}
		}
		return ids;
	}

	/**
	 * TODO
	 *
	 * @method getTileIds
	 * @param [properties] {Object} TODO
	 * @return {Number[]} TODO
	 */
	this.getTileIds = getTileIds;

	function getTileId(properties) {
		for (var id in data.tiles) {
			if (assertObject(data.tiles[id].properties, properties)) {
				return id;
			}
		}
	}

	/**
	 * TODO
	 *
	 * @method getTileId
	 * @param [properties] {Object} TODO
	 * @return {Number} TODO
	 */
	this.getTileId = getTileId;

	/**
	 * Returns a `Tile` object that describes the requested tile.
	 *
	 * A tile can be identified either by ID or filtering properties; TODO
	 *
	 * This method throws an exception if the ID is not valid, i.e. it is not
	 * present in the JSON data output by the Canvace Development Environment.
	 *
	 * @method getTile
	 * @param idOrProperties {Mixed} A tile ID or filtering properties object.
	 * @return {Canvace.TileMap.Tile} A `Tile` object describing the requested
	 * tile.
	 */
	this.getTile = function (idOrProperties) {
		var id;
		if (typeof idOrProperties !== 'object') {
			id = idOrProperties;
			if (id in data.tiles) {
				return tileCache[id] || (tileCache[id] = new Tile(id));
			} else {
				throw 'invalid tile id: ' + id;
			}
		} else {
			id = getTileId(idOrProperties);
			return tileCache[id] || (tileCache[id] = new Tile(id));
		}
	};

	/**
	 * TODO
	 *
	 * @method getTiles
	 * @param [properties] {Object} TODO
	 * @return {Canvace.TileMap.Tile[]} TODO
	 */
	this.getTiles = function (properties) {
		var ids = getTileIds(properties);
		var tiles = [];
		for (var i in ids) {
			tiles.push(tileCache[ids[i]] || (tileCache[ids[i]] = new Tile(ids[i])));
		}
		return tiles;
	};

	/**
	 * Returns the ID of the tile located at the specified `(i, j, k)` position
	 * of the map, or `false` if no tile is located at that position.
	 *
	 * @method getAt
	 * @param i {Number} An integer I coordinate.
	 * @param j {Number} An integer J coordinate.
	 * @param k {Number} An integer K coordinate.
	 * @return {Number} The requested tile ID, or `false` if no tile is found.
	 */
	this.getAt = function (i, j, k) {
		return map[k] && map[k][i] && map[k][i][j] || false;
	};

	/**
	 * Puts the specified tile in the specified position of the map. If a
	 * mutable tile is already present in that position, it is first removed. If
	 * a non-mutable tile is present, the operation fails.
	 *
	 * A boolean value is returned indicating whether the operation succeeded or
	 * not.
	 *
	 * @method putAt
	 * @param i {Number} The I coordinate of the map cell.
	 * @param j {Number} The J coordinate of the map cell.
	 * @param k {Number} The K coordinate of the map cell.
	 * @param id {Number} The new tile's ID.
	 * @return {Boolean} `true` if the specified tile was successfully placed at
	 * the specified position, `false` if that position is already occupied by a
	 * non-mutable tile.
	 */
	this.putAt = function (i, j, k, id) {
		if (!(id in data.tiles)) {
			throw {
				message: 'invalid tile ID',
				id: id
			};
		}
		if ((k in map) && (i in map[k]) && (j in map[k][i])) {
			if (buckets.replaceTile(i, j, k, id)) {
				map[k][i][j] = id;
			} else {
				return false;
			}
		} else {
			if (!(k in map)) {
				map = {};
			}
			if (!(i in map[k])) {
				map[k] = {};
			}
			map[k][i][j] = id;
			buckets.addTile(id, i, j, k);
			return true;
		}
	};

	/**
	 * Constructs an object that satisfies the `Astar.Node` requirements and
	 * represents a tile of the map as a node of a graph. The returned object
	 * allows to traverse a graph where each node represents a walkable tile and
	 * each edge allows to walk from a tile to another adjacent tile.
	 *
	 * The returned graph is characterized by a _target node_ and each node also
	 * provides a heuristic estimate of the distance between the target node and
	 * itself. This makes the graph usable with the `Astar` class.
	 *
	 * The target node is the tile identified by the coordinates `i1`, `j1` and
	 * `k`.
	 *
	 * @method getGraphNode
	 * @param i {Number} The I coordinate of the requested node.
	 * @param j {Number} The J coordinate of the requested node.
	 * @param k {Number} The number of the layer containing both the requested
	 * and the target node.
	 * @param i1 {Number} The I coordinate of the target node.
	 * @param j1 {Number} The J coordinate of the target node.
	 * @return {Canvace.Astar.Node} A node object that satisfies the
	 * `Astar.Node` requirements and can be passed to the `Astar.findPath`
	 * method.
	 */
	this.getGraphNode = function (i, j, k, i1, j1) {
		return (function makeNode(i, j) {
			function bind(i, j) {
				return function () {
					return makeNode(i, j);
				};
			}
			var di = Math.abs(i1 - i);
			var dj = Math.abs(j1 - j);
			var node = {
				id: i + ' ' + j + ' ' + k,
				heuristic: Math.sqrt(Math.pow(Math.min(di, dj), 2) * 2) +
					Math.max(di, dj) - Math.min(di, dj),
				neighbors: {},
				distance: function (index) {
					if (parseInt(index, 10) % 2) {
						return 1;
					} else {
						return Math.sqrt(2);
					}
				}
			};
			(function () {
				function walkable(i, j) {
					return (i in map[k]) && (j in map[k][i]) &&
						data.tiles[map[k][i][j]].walkable;
				}
				for (var index = 0; index < 9; index++) {
					var i1 = i + [-1, -1, -1, 0, 0, 0, 1, 1, 1][index];
					var j1 = j + [-1, 0, 1, -1, 0, 1, -1, 0, 1][index];
					if ((i1 !== i) && (j1 !== j) && walkable(i1, j1)) {
						if ((index % 2) || walkable(i, j1) && walkable(i1, j)) {
							node.neighbors[index] = bind(i1, j1);
						}
					}
				}
			})();
			return node;
		})(i, j);
	};

	/**
	 * Detects collisions between a rectangular area and non-walkable tiles of
	 * a specified map layer.
	 *
	 * A vector is returned indicating two I and J values that must be added to
	 * the coordinates of the rectangular area in order to resume a regular
	 * configuration where the area does not collide with the tiles.
	 *
	 * In case there is not any collision, the returned vector is `(0, 0)`.
	 *
	 * The rectangular area is specified by the `i`, `j`, `di` and `dj`
	 * arguments.
	 *
	 * The implementation of this method assumes the rectangular area represents
	 * a moving entity (though not necessarily a Canvace entity). The collision
	 * algorithm assumes the moving entity cannot have compenetrated a tile
	 * along the I or J axis more than specified amounts `Di` and `Dj`,
	 * respectively; this is necessary in order to obtain a functional physics
	 * algorithm.
	 *
	 * This method can be used to implement in-layer, bounding box based, entity
	 * vs. tiles collisions. If the rectangular area represents the bounding box
	 * of an entity, its origin's `i` and `j` coordinates can be obtained using
	 * the `Stage.Instance.getPosition` method, while the `di` and `dj` span
	 * values are usually per-entity constant and must be arbitrarily determined
	 * by the developer.
	 *
	 * If the rectangular area actually is the bounding box of a Canvace entity,
	 * you can specify the distance the entity has gone along the I and J axes
	 * since the last step as values for the `Di` and `Dj` arguments; you can do
	 * that by caching the values of the `i` and `j` components of the entity's
	 * position and subtracting them to their respective values of the current
	 * position at each step. This is actually what the `testTileCollision`
	 * method of the `Stage.Instance` class does.
	 *
	 * @method rectangleCollision
	 * @param k {Number} The number of the layer containing the tiles against
	 * which the collision must be tested.
	 * @param i {Number} The I coordinate of the origin of the rectangular area.
	 * This may be a real number.
	 * @param j {Number} The J coordinate of the origin of the rectangular area.
	 * This may be a real number.
	 * @param di {Number} The span of the rectangular area along the I axis.
	 * This may be a real number.
	 * @param dj {Number} The span of the rectangular area along the J axis.
	 * This may be a real number.
	 * @param Di {Number} TODO
	 * @param Dj {Number} TODO
	 * @param [collides] {Function} An optional user-defined callback function
	 * that is invoked by the `rectangleCollision` method for every tile that
	 * collides with the specified rectangle.
	 *
	 * The function receives two arguments, the tile's walkable flag and its
	 * properties, and must return a boolean value indicating whether the tile
	 * must be taken into account as a colliding tile. If the function returns
	 * `false` the tile is _not_ taken into account.
	 * @return {Object} An object containing two number fields, `i` and `j`,
	 * specifying the I and J components of the computed vector.
	 */
	this.rectangleCollision = function (k, i, j, di, dj, Di, Dj, collides) {
		var viu = 0;
		var vio = 0;
		var vju = 0;
		var vjo = 0;

		var map = data.map;
		if (k in data.map) {
			var tiles = data.tiles;

			var solidTileAt = (function () {
				if (typeof collides !== 'function') {
					return function (i, j) {
						return (i in map[k]) && (j in map[k][i]) && !tiles[map[k][i][j]].walkable;
					};
				} else {
					return function (i, j) {
						var tile = tiles[map[k][i][j]];
						return (i in map[k]) && (j in map[k][i]) && collides(tile.walkable, tile.properties);
					};
				}
			})();

			var i0 = Math.floor(i);
			var j0 = Math.floor(j);
			var i1 = Math.ceil(i + di) - 1;
			var j1 = Math.ceil(j + dj) - 1;

			for (var j2 = j0; j2 <= j1; j2++) {
				if (solidTileAt(i0, j2)) {
					if ((i0 === i1) || !solidTileAt(i0 + 1, j2)) {
						viu = i0 + 1 - i;
					}
				}
				if (solidTileAt(i1, j2)) {
					if ((i0 === i1) || !solidTileAt(i1 - 1, j2)) {
						vio = i1 - i - di;
					}
				}
			}

			for (var i2 = i0; i2 <= i1; i2++) {
				if (solidTileAt(i2, j0)) {
					if ((j0 === j1) || !solidTileAt(i2, j0 + 1)) {
						vju = j0 + 1 - j;
					}
				}
				if (solidTileAt(i2, j1)) {
					if ((j0 === j1) || !solidTileAt(i2, j1 - 1)) {
						vjo = j1 - j - dj;
					}
				}
			}
		}

		var v = {};

		if (viu && vio) {
			v.i = 0;
		} else if (viu) {
			v.i = viu;
		} else {
			v.i = vio;
		}
		if (vju && vjo) {
			v.j = 0;
		} else if (vju) {
			v.j = vju;
		} else {
			v.j = vjo;
		}

		if (Math.abs(v.i) > Math.abs(Di) + 0.001) {
			v.i = 0;
		}
		if (Math.abs(v.j) > Math.abs(Dj) + 0.001) {
			v.j = 0;
		}

		return v;
	};
};
