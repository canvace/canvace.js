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
 * Implements a heap using standard algorithms.
 *
 * A heap is a data structure consisting in a complete binary tree where each
 * element is more "extreme" than both of its children, for a user-defined
 * comparison.
 *
 * A heap can be seen as a prioritized queue and can provide a significant
 * performance boost in several algorithms, particularly the A* pathfinding
 * algorithm.
 *
 * @class Canvace.Heap
 * @constructor
 * @param compare {Function} A function used by a heap object to compare
 * elements. The function is passed two arguments, the two elements to compare,
 * and must return a negative number if the first element is more "extreme"
 * (less or greater, depending on the user-defined criteria) than the second, a
 * positive number if the first is less extreme than the second and zero if they
 * are "equal".
 * @param [same] {Function} A function used by a heap object to determine
 * whether two specified elements are exactly the same element.
 *
 * The `same` function is passed two arguments, the two elements to compare, and
 * returns a boolean value indicating whether they are the same element.
 *
 * `compare` must return zero for two elements if `same` returns `true`, but the
 * opposite is not necessarily true: `same` can return `false` even for two
 * elements that are compared to be equal by `compare`.
 *
 * If the `same` argument is not specified, the === operator is used.
 *
 * This function is useful in cases where the same element may be represented by
 * different physical objects, and it is used by the `contains`, `find` and
 * `decreaseKey` methods.
 */
Canvace.Heap = function (compare, same) {
	if (!same) {
		same = function (first, second) {
			return first === second;
		};
	}

	var heap = [];

	function left(i) {
		return i * 2 + 1;
	}

	function right(i) {
		return i * 2 + 2;
	}

	function parent(i) {
		return Math.floor((i - 1) / 2);
	}

	function smaller(i, j) {
		return compare(heap[i], heap[j]) < 0;
	}

	function swap(i, j) {
		var temp = heap[i];
		heap[i] = heap[j];
		heap[j] = temp;
	}

	function heapify(i) {
		var l = left(i);
		var r = right(i);
		var min = i;
		if ((heap.length > l) && smaller(l, i)) {
			min = l;
		}
		if ((heap.length > r) && smaller(r, min)) {
			min = r;
		}
		if (min > i) {
			swap(i, min);
			heapify(min);
		}
	}

	function find(element, index, callback) {
		if (index < heap.length) {
			if (same(element, heap[index])) {
				if (typeof callback === 'function') {
					callback(index);
				}
				return true;
			} else if (compare(element, heap[index]) < 0) {
				return false;
			} else {
				return find(element, left(index), callback) ||
					find(element, right(index), callback);
			}
		} else {
			return false;
		}
	}

	/**
	 * Inserts the specified element into the heap and resorts the heap using
	 * standard algorithms until its properties hold again.
	 *
	 * This method operates in logarithmic time.
	 *
	 * @method push
	 * @param element {Any} The element to be inserted.
	 */
	this.push = function (element) {
		var index = heap.length;
		heap.push(element);
		var parentIndex = parent(index);
		while (index && smaller(index, parentIndex)) {
			swap(index, parentIndex);
			index = parentIndex;
			parentIndex = parent(index);
		}
	};

	/**
	 * Extracts the lowest priority element from the heap in logarithmic time
	 * using standard algorithms.
	 *
	 * The element's priority is determined by comparison with other elements
	 * using the `compare` function specified during construction.
	 *
	 * @method pop
	 * @return {Any} The extracted element.
	 */
	this.pop = function () {
		var result = heap[0];
		var last = heap.pop();
		if (heap.length) {
			heap[0] = last;
			heapify(0);
		}
		return result;
	};

	/**
	 * Returns the lowest priority element without extracting it from the heap.
	 *
	 * The element's priority is determined by comparison with other elements
	 * using the `compare` function specified during construction.
	 *
	 * The return value is undefined if the heap does not contain any elements.
	 *
	 * This method operates in constant time.
	 *
	 * @method peek
	 * @return {Any} The lowest priority element, or `undefined` if the heap is
	 * empty.
	 */
	this.peek = function () {
		if (heap.length > 0) {
			return heap[0];
		}
	};

	/**
	 * Searches the specified element in the heap and returns a boolean value
	 * indicating whether it was found.
	 *
	 * The specified element does not have to be exactly the same physical
	 * object as the one previously inserted in the heap, it only has to
	 * represent the same element; the actual comparison to determine whether
	 * the two objects represent the same element is done by using the `same`
	 * function specified at construction time.
	 *
	 * This method operates in linear time.
	 *
	 * @method contains
	 * @param element {Any} A `same`-equivalent element to look for.
	 * @return {Boolean} `true` if the element was found in the heap, `false`
	 * otherwise.
	 */
	this.contains = function (element) {
		return find(element, 0);
	};

	/**
	 * Searches the specified element in the heap and returns it if it can be
	 * found.
	 *
	 * The return value is defined _only_ if the element is found, otherwise
	 * this method does not return anything. You can test whether an element was
	 * found or not using the `typeof` operator and checking against the string
	 * `'undefined'`, as in the following example:
	 *
	 *	var result = heap.find(...);
	 *	if (typeof result !== 'undefined') {
	 *		// the element has been found in the heap
	 *		// and is contained in the `result` variable
	 *	} else {
	 *		// the element was NOT found in the heap
	 *	}
	 *
	 * The specified element does not have to be exactly the same physical
	 * object as the one previously inserted in the heap, it only has to
	 * represent the same element; the actual comparison to determine whether
	 * the two objects represent the same element is done by using the `same`
	 * function specified at construction time.
	 *
	 * This method operates in linear time.
	 *
	 * @method find
	 * @param element {Any} A `same`-equivalent element to look for.
	 * @return {Mixed} The original element that was inserted into the heap, or
	 * nothing if no element was found.
	 */
	this.find = function (element) {
		var result;
		if (find(element, 0, function (index) {
			result = heap[index];
		})) {
			return result;
		}
	};

	/**
	 * Decreases the specified element's priority and resorts the heap using
	 * standard algorithms; as a consequence, the specified element will
	 * typically move higher within the heap (which means gaining a lower
	 * priority and being extracted earlier).
	 *
	 * This method has no effect if the heap does not contain the specified
	 * element.
	 *
	 * @method decreaseKey
	 * @param element {Any} The element whose key/priority has to be decreased.
	 *
	 * This argument doesn't need to be exactly the same physical object as the
	 * previously inserted element: it only has to represent the same element;
	 * the actual comparison to determine whether the two objects represent the
	 * same element is done by using the `same` function specified at
	 * construction time.
	 * @param decrease {Function} A user-specified function that does the actual
	 * decreasing.
	 *
	 * This is called during the execution of `decreaseKey` and receives one
	 * argument, the element whose key is being decreased; note that the
	 * original element contained in the heap, not the possibly alternate
	 * version specified to the `element` argument, is passed to the `decrease`
	 * callback function.
	 *
	 * The main purpose of the `decrease` function is to decrease the key so
	 * that changes are reflected by subsequent `compare` and `same` calls.
	 *
	 * The return value of the `decrease` function is ignored.
	 */
	this.decreaseKey = function (element, decrease) {
		return find(element, 0, function (index) {
			decrease(heap[index]);
			var parentIndex = parent(index);
			while (index && smaller(index, parentIndex)) {
				swap(index, parentIndex);
				index = parentIndex;
				parentIndex = parent(index);
			}
		});
	};

	/**
	 * Returns the number of elements inserted in the heap so far.
	 *
	 * @method count
	 * @return {Number} The number of elements in the heap.
	 */
	this.count = function () {
		return heap.length;
	};

	/**
	 * Indicates whether the heap is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` if the heap is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !heap.length;
	};

	/**
	 * Empties the heap. This method operates in constant time.
	 *
	 * @method clear
	 */
	this.clear = function () {
		heap = [];
	};
};
