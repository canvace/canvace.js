/**
 * Provides a generic epsilon-admissible implementation of the A* pathfinding
 * algorithm.
 *
 * `Astar` objects provide a
 * {{#crossLink "Canvace.Astar/findPath"}}{{/crossLink}} method that finds an
 * admissible path between two nodes of a graph.
 *
 * Given that any path between two nodes has a cost greater than zero, the
 * algorithm tries to find either an optimal one (one of those with the least
 * cost) or an admissible one (one whose cost is at most `1 + epsilon` times the
 * optimal cost).
 *
 * The `epsilon` parameter must be greater than zero and is optional: it is
 * assumed to be zero when not specified. Specifying a non-zero epsilon value
 * will construct an object that can perform significantly faster and still
 * yield almost optimal paths.
 *
 * Refer to the documentation of the
 * {{#crossLink "Canvace.Astar/findPath"}}{{/crossLink}} method for more
 * information about specifying the graph.
 *
 * @class Canvace.Astar
 * @constructor
 * @param [epsilon] {Number} The optional epsilon parameter, defaults to zero.
 * @example
 *	// Elaborate a random labyrinth represented by a boolean matrix.
 *	// True means there is a wall, false means the cell is walkable.
 *	var matrix = [];
 *	for (var i = 0; i < 100; i++) {
 *		var row = [];
 *		for (var j = 0; j < 100; j++) {
 *			row[j].push(Math.random() > 0.3);
 *		}
 *		matrix.push(row);
 *	}
 *	console.dir(matrix);
 *	
 *	// Create a path finder
 *	var pathFinder = new Canvace.Astar();
 *	
 *	// Implement a node of the graph.
 *	// Heuristics are taxicab distances from cell (99, 99).
 *	function Node(i, j) {
 *		this.id = '(' + i + ', ' + j + ')';
 *		this.heuristic = 198 - i - j;
 *		this.distance = function () {
 *			return 1;
 *		};
 *		this.neighbors = {};
 *		if (j > 0) {
 *			this.neighbors.left = function () {
 *				return new Node(i, j - 1);
 *			};
 *		}
 *		if (j < 100) {
 *			this.neighbors.right = function () {
 *				return new Node(i, j + 1);
 *			};
 *		}
 *		if (i > 0) {
 *			this.neighbors.up = function () {
 *				return new Node(i - 1, j);
 *			};
 *		}
 *		if (i < 100) {
 *			this.neighbors.down = function () {
 *				return new Node(i + 1, j);
 *			};
 *		}
 *	}
 *	
 *	// find the path from (0, 0) to (99, 99)
 *	console.dir(pathFinder.findPath(new Node(0, 0)));
 */
Canvace.Astar = function (epsilon) {
	if (typeof epsilon !== 'number') {
		epsilon = 0;
	} else if (epsilon < 0) {
		throw 'the epsilon parameter must be positive';
	}

	/**
	 * This is not an actual inner class, it just documents what graph nodes
	 * must implement in order to be suitable for the
	 * {{#crossLink "Canvace.Astar/findPath"}}{{/crossLink}} method.
	 *
	 * Objects providing these properties and methods are usable as graph nodes
	 * and may be passed as arguments to
	 * {{#crossLink "Canvace.Astar/findPath"}}{{/crossLink}}.
	 *
	 * @class Canvace.Astar.Node
	 * @static
	 */

	/**
	 * A unique ID assigned to the node. Different nodes in the graph must have
	 * different IDs.
	 *
	 * @property id
	 * @type String
	 */

	/**
	 * The heuristically estimated cost to walk up to the target node.
	 *
	 * @property heuristic
	 * @type Number
	 */

	/**
	 * A map object whose keys are edge labels and whose values are functions.
	 * Each function returns the neighbor graph
	 * {{#crossLink "Canvace.Astar.Node"}}node{{/crossLink}} connected to this
	 * node through the edge.
	 *
	 * @property neighbors
	 * @type Object
	 */

	/**
	 * A function used by {{#crossLink "Canvace.Astar"}}{{/crossLink}} to
	 * determine edge weights.
	 *
	 * You can always return `1` or another non-zero constant value if your
	 * graph is not weighted.
	 *
	 * Edge labels are implementation-defined; they only need to be consistent
	 * with the keys of the
	 * {{#crossLink "Canvace.Astar.Node/neighbors:property"}}{{/crossLink}}
	 * method map.
	 *
	 * @method distance
	 * @param edgeLabel {String} A label identifying the incident edge whose
	 * weight is to be retrieved.
	 * @return {Number} The requested edge weight.
	 */

	/**
	 * Finds a path between two nodes of a graph. A path is always found if one
	 * exists, otherwise `null` is returned.
	 *
	 * The found path is always _admissible_, which means its cost is either
	 * optimal (the least possible one) or is at most `1 + epsilon` times the
	 * optimal one, where `epsilon` is the parameter specified to the
	 * {{#crossLink "Canvace.Astar"}}{{/crossLink}} constructor.
	 *
	 * `startNode` is an {{#crossLink "Canvace.Astar.Node"}}{{/crossLink}}-like
	 * object representing the first node of the path to find;
	 * {{#crossLink "Canvace.Astar.Node"}}{{/crossLink}}-like means it has to
	 * provide the same properties and methods described by the documentation of
	 * the {{#crossLink "Canvace.Astar.Node"}}{{/crossLink}} pseudo-class.
	 *
	 * The target node is identified when the estimated distance from it,
	 * provided by each node, is zero; the algorithm stops when this happens.
	 *
	 * {{#crossLink "Canvace.Astar.Node"}}{{/crossLink}} objects allow to
	 * specify a directed graph with weighted and labeled edges. Edge weights
	 * are real numbers and are used to compute the cost of a path. Edge labels
	 * are strings and are used when describing the computed path as an array of
	 * edges to walk.
	 *
	 * The computed path, if one exists, is returned as an array of strings.
	 * `null` is returned if the target node is unreachable from the start node.
	 *
	 * @method findPath
	 * @for Canvace.Astar
	 * @param startNode {Canvace.Astar.Node} The starting node.
	 * @return {String[]} An array of edge labels that identify the edges that
	 * form the computed path, or `null` if no path can be found.
	 */
	this.findPath = function (startNode) {
		var closedSet = {};
		var openScore = {};
		var backLink = {};

		var heap = new Canvace.Heap(function (u, v) {
			var fu = openScore[u.id] + u.heuristic * (1 + epsilon);
			var fv = openScore[v.id] + v.heuristic * (1 + epsilon);
			if (fu < fv) {
				return -1;
			} else if (fu > fv) {
				return 1;
			} else {
				return 0;
			}
		}, function (u, v) {
			return u.id === v.id;
		});

		var node;
		openScore[startNode.id] = 0;
		heap.push(startNode);
		while (!heap.isEmpty()) {
			var currentNode = heap.pop();
			var score = openScore[currentNode.id];
			delete openScore[currentNode.id];
			if (currentNode.heuristic) {
				closedSet[currentNode.id] = true;
				for (var edge in currentNode.neighbors) {
					if (currentNode.neighbors.hasOwnProperty(edge)) {
						node = currentNode.neighbors[edge]();
						if (!closedSet.hasOwnProperty(node.id)) {
							var cost = score + currentNode.distance(edge);
							if (openScore.hasOwnProperty(node.id)) {
								if (cost < openScore[node.id]) {
									heap.decreaseKey(node, function (node) {
										openScore[node.id] = cost;
										backLink[node.id] = {
											parent: currentNode,
											edge: edge
										};
									});
								}
							} else {
								openScore[node.id] = cost;
								backLink[node.id] = {
									parent: currentNode,
									edge: edge
								};
								heap.push(node);
							}
						}
					}
				}
			} else {
				var path = [];
				for (node = currentNode; backLink.hasOwnProperty(node.id); node = backLink[node.id].parent) {
					path.push(backLink[node.id].edge);
				}
				return path.reverse();
			}
		}
		return null;
	};
};
