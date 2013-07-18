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
	this.elements = {};
	this.nextId = 0;
	this.count = 0;
	this.fastAdd.apply(this, arguments);
};

/**
 * Inserts an element into the container in amortized constant time. The
 * element can be of any type (numbers, strings, objects, etc.) and can be
 * inserted many times.
 *
 * The {{#crossLink "Canvace.MultiSet/add}}{{/crossLink}} method returns a
 * function that removes the element. The returned function is idempotent:
 * it does not have any effect when called again after the first time.
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
 * @param element {Any} The element to be inserted in the
 * {{#crossLink "Canvace.MultiSet"}}MultiSet{{/crossLink}}.
 * @return {Function} A function that removes the inserted element.
 */
Canvace.MultiSet.prototype.add = function (element) {
	var id = this.nextId++;
	this.elements[id] = element;
	this.count++;
	return function () {
		if (this.elements.hasOwnProperty(id)) {
			delete this.elements[id];
			this.count--;
			return true;
		} else {
			return false;
		}
	}.bind(this);
};

/**
 * Inserts zero or more elements into the container in amortized constant time.
 * The elements can be of any type (numbers, strings, objects, etc.) and can be
 * inserted many times.
 *
 * This method is faster than
 * {{#crossLink "Canvace.MultiSet/add"}}{{/crossLink}} because it doesn't
 * generate any closures; infact it doesn't return anything.
 *
 * @method fastAdd
 * @param [elements...] {Any} Zero or more elements to insert in the
 * {{#crossLink "Canvace.MultiSet"}}MultiSet{{/crossLink}}.
 * @example
 *	var ms = new Canvace.MultiSet(1, 2);
 *	ms.fastAdd(3, 4); // ms now contains four elements: 1, 2, 3 and 4
 */
Canvace.MultiSet.prototype.fastAdd = function () {
	for (var i in arguments) {
		this.elements[this.nextId++] = arguments[i];
	}
	this.count += arguments.length;
};

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
 * {{#crossLink "Canvace.MultiSet/forEach"}}{{/crossLink}} enumerates the
 * elements in the same order they are inserted by
 * {{#crossLink "Canvace.MultiSet/add"}}{{/crossLink}}, but you must not
 * depend on that assumption.
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
 * {{#crossLink "Canvace.MultiSet/forEach"}}{{/crossLink}} returns `false`
 * if the iteration completed and `true` if it was interrupted, which is
 * suitable for implementing finding algorithms.
 *
 * @method forEach
 * @param action {Function} The callback function that gets called for each
 * element of the multiset. It receives the current element and a callback
 * function suitable for deleting it from the
 * {{#crossLink "Canvace.MultiSet"}}MultiSet{{/crossLink}}.
 * @return {Boolean} `true` if `action` returned `false`, `false` if it did
 * not and all the elements were enumerated.
 */
Canvace.MultiSet.prototype.forEach = function (action) {
	for (var id in this.elements) {
		if (this.elements.hasOwnProperty(id)) {
			if (action(this.elements[id], function (id) {
				return function () {
					if (this.elements.hasOwnProperty(id)) {
						delete this.elements[id];
						this.count--;
						return true;
					} else {
						return false;
					}
				}.bind(this);
			}.call(this, id)) === false) {
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
 * This method is similar to the
 * {{#crossLink "Canvace.MultiSet/forEach"}}{{/crossLink}} method except it
 * can be faster on some browsers because it does not generate a closure
 * (the element's removal function) at each iterated element and does not
 * analyze the return value of the callback function. Infact, the iterated
 * elements cannot be removed and the iteration cannot be interrupted.
 *
 * You usually use the
 * {{#crossLink "Canvace.MultiSet/forEach"}}{{/crossLink}} method, but you
 * may also use {{#crossLink "Canvace.MultiSet/fastForEach"}}{{/crossLink}}
 * if your callback function does not use its second argument (the removal
 * function) and never returns `false`.
 *
 * Note that the order of iteration is undefined as it depends on the order
 * of iteration over object properties implemented by the underlying
 * JavaScript engine. This is typically the insertion order, which means
 * {{#crossLink "Canvace.MultiSet/fastForEach"}}{{/crossLink}} enumerates
 * the elements in the same order they are inserted by
 * {{#crossLink "Canvace.MultiSet/add"}}{{/crossLink}}, but you must not
 * rely on that assumption.
 *
 * @method fastForEach
 * @param action {Function} The callback function that gets called for each
 * element of the multiset. It receives the current element as an argument.
 * The return value is ignored.
 */
Canvace.MultiSet.prototype.fastForEach = function (action) {
	for (var id in this.elements) {
		if (this.elements.hasOwnProperty(id)) {
			action(this.elements[id]);
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
Canvace.MultiSet.prototype.count = function () {
	return this.count;
};

/**
 * Indicates whether the container is empty or not.
 *
 * @method isEmpty
 * @return {Boolean} `true` if the container is empty, `false` otherwise.
 */
Canvace.MultiSet.prototype.isEmpty = function () {
	return !this.count;
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
Canvace.MultiSet.prototype.clear = function () {
	this.elements = {};
	this.count = 0;
};
