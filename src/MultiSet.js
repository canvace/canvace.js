/**
 * Implements a multi-set, a set with possibly repeated elements.
 *
 * This container allows insertion and removal of elements in constant time
 * assuming the implementation of the underlying JavaScript engine manages in
 * amortizing insertion and removal of properties in objects to constant time.
 *
 * The arguments you specify to the MultiSet constructor are immediately
 * inserted into the container. For example:
 *
 *	var ms = new Canvace.MultiSet(1, 2, 3); // ms contains 1, 2 and 3
 *
 * The previous snippet is equivalent to:
 *
 *	var ms = new Canvace.MultiSet();
 *	ms.add(1);
 *	ms.add(2);
 *	ms.add(3);
 *
 * @class Canvace.MultiSet
 * @constructor
 * @param [elements]* {Object} The elements to add initially to the `MultiSet`.
 */
Canvace.MultiSet = function () {
	var elements = {};
	var nextId = 0;
	var count = 0;

	function add(element) {
		var id = nextId++;
		elements[id] = element;
		count++;
		return function () {
			if (elements.hasOwnProperty(id)) {
				delete elements[id];
				count--;
				return true;
			} else {
				return false;
			}
		};
	}

	(function (elements) {
		for (var i in elements) {
			add(elements[i]);
		}
	})(arguments);

	/**
	 * Inserts an element into the container in amortized constant time. The
	 * element can be of any type (numbers, strings, objects, etc.) and can be
	 * inserted many times.
	 *
	 * The `add` function returns a function that removes the element. The
	 * returned function is idempotent: it does not have any effect when called
	 * again after the first time.
	 *
	 * Example:
	 *
	 *	var ms = new Canvace.MultiSet(1, 2);
	 *	var remove = ms.add(3); // ms now contains three elements: 1, 2 and 3
	 *	remove(); // ms now contains two elements: 1 and 2
	 *	remove(); // no effect, ms still contains 1 and 2
	 *
	 * The returned function returns a boolean value indicating whether the
	 * element was present and could be removed or not. `false` indicates the
	 * element was not present because it had already been removed by a previous
	 * call.
	 *
	 * Example:
	 *
	 *	var ms = new Canvace.MultiSet();
	 *	var remove = ms.add(3);
	 *	if (remove()) {
	 *		alert('removed!');
	 *	}
	 *	if (remove()) {
	 *		alert('this is never alerted');
	 *	}
	 *
	 * @method add
	 * @param element {Any} The element to be inserted in the `MultiSet`.
	 * @return {Function} A function that removes the inserted element.
	 */
	this.add = add;

	/**
	 * Iterates over the container and calls the specified function `action` for
	 * each iterated element.
	 *
	 * The `action` function receives two arguments: the element and a function
	 * that removes it if called. The removing function stays valid forever,
	 * even after the whole `forEach` call is over, and is idempotent: it does
	 * not have any effects after it is called once.
	 *
	 * The following example inserts some numbers into the container and then
	 * removes only the numbers equal to 3:
	 *
	 *	var ms = new Canvace.MultiSet(1, 3, 7, 6, 3, 4, 3, 3, 5);
	 *	ms.forEach(function (element, remove) {
	 *		if (element === 3) {
	 *			remove();
	 *		}
	 *	});
	 *	// ms now contains 1, 7, 6, 4, 5
	 *
	 * Elements with repetitions are iterated as many times as they are
	 * repeated. For example, in the previous snippet the number 3 is iterated
	 * (and removed) four times.
	 *
	 * Note that the order of iteration is undefined as it depends on the order
	 * of iteration over object properties implemented by the underlying
	 * JavaScript engine. This is typically the insertion order, which means
	 * `MultiSet.forEach` enumerates the elements in the same order they are
	 * inserted by `MultiSet.add`, but you must not depend on that assumption.
	 *
	 * The iteration is interrupted if the `action` function returns `false`.
	 * The following example adds some numbers to the container, then iterates
	 * over it and interrupts when it encounters the number 3:
	 *
	 *	var ms = new Canvace.MultiSet(1, 2, 3, 4);
	 *	ms.forEach(function (element) {
	 *		if (element === 3) {
	 *			return false;
	 *		}
	 *	});
	 *
	 * The number 4 is not enumerated.
	 *
	 * `MultiSet.forEach` returns `false` if the iteration completed and `true`
	 * if it was interrupted, which is suitable for implementing finding
	 * algorithms.
	 *
	 * @method forEach
	 * @param action {Function} The callback function that gets called for each
	 * element of the multiset. It receives the current element and a callback
	 * function suitable for deleting it from the `MultiSet`.
	 * @return {Boolean} `true` if `action` returned `false`, `false` if it did
	 * not and all the elements were enumerated.
	 */
	this.forEach = function (action) {
		var makeRemover = function (id) {
			return function () {
				if (elements.hasOwnProperty(id)) {
					delete elements[id];
					count--;
					return true;
				} else {
					return false;
				}
			};
		};

		for (var id in elements) {
			if (elements.hasOwnProperty(id)) {
				if (action(elements[id], makeRemover(id)) === false) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Iterates over the container and calls the specified function `action` for
	 * each iterated element.
	 *
	 * The `action` function receives one argument, the current element. Any
	 * return value is ignored.
	 *
	 * This method is similar to the `forEach` method except it can be faster on
	 * some browsers because it does not generate a closure (the element's
	 * removal function) at each iterated element and does not analyze the
	 * return value of the callback function. Infact, the iterated elements
	 * cannot be removed and the iteration cannot be interrupted.
	 *
	 * You usually use the `forEach` method, but you may also use `fastForEach`
	 * if your callback function does not use its second argument (the removal
	 * function) and never returns `false`.
	 *
	 * Note that the order of iteration is undefined as it depends on the order
	 * of iteration over object properties implemented by the underlying
	 * JavaScript engine. This is typically the insertion order, which means
	 * `MultiSet.fastForEach` enumerates the elements in the same order they are
	 * inserted by `MultiSet.add`, but you must not depend on that assumption.
	 *
	 * @method fastForEach
	 * @param action {Function} The callback function that gets called for each
	 * element of the multiset. It receives the current element as an argument.
	 * The return value is ignored.
	 */
	this.fastForEach = function (action) {
		for (var id in elements) {
			if (elements.hasOwnProperty(id)) {
				action(elements[id]);
			}
		}
	};

	/**
	 * Returns the number of elements currently contained.
	 *
	 * If an element is inserted more than once, it counts as many times as it
	 * is inserted.
	 *
	 * This method operates in constant time.
	 *
	 * @method count
	 * @return {Number} The number of contained elements.
	 * @example
	 *	var ms = new Canvace.MultiSet(1, 2, 2, 3, 3);
	 *	alert(ms.count()); // alerts 5
	 */
	this.count = function () {
		return count;
	};

	/**
	 * Indicates whether the container is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` if the container is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !count;
	};

	/**
	 * Empties the container: every element is removed and the count is reset to
	 * zero.
	 *
	 * This method operates in constant time.
	 *
	 * @method clear
	 * @example
	 *	var ms = new Canvace.MultiSet(1, 2, 3, 4, 5);
	 *	ms.clear();
	 *	alert(ms.count()); // alerts 0
	 */
	this.clear = function () {
		elements = {};
		count = 0;
	};
};
