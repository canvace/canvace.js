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
 * Implements a doubly linked list.
 *
 * This can sometimes be preferrable to Javascript arrays since insertion and
 * removal operations have constant time complexity rather than linear.
 *
 * @class Canvace.List
 * @constructor
 */
Canvace.List = function () {
	var head = null;
	var tail = null;
	var count = 0;

	/**
	 * Provides access to list elements.
	 *
	 * This class cannot be instantiated directly, instances are returned by
	 * methods of the outer class.
	 *
	 * @class Canvace.List.Accessor
	 * @example
	 *	var list = new Canvace.List();
	 *	list.addTail(1);
	 *	list.addTail(2);
	 *	list.addTail(3);
	 *	for (var a = list.getHead(); a; a = a.next()) {
	 *		alert(a.element());
	 *	}
	 */
	function Accessor(node) {
		if (!node) {
			return null;
		}

		/**
		 * Returns the accessed element.
		 *
		 * @method element
		 * @return {Any} The accessed element.
		 * @example
		 *	var list = new Canvace.List();
		 *	var accessor = list.addTail('Hello, world!');
		 *	alert(accessor.element()); // alerts "Hello, world!"
		 */
		this.element = function () {
			return node.element;
		};

		/**
		 * Returns an
		 * {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLink}} for
		 * accessing the previous element of the list, or `null` if this
		 * Accessor represents the first element.
		 *
		 * An exception is thrown if the element represented by this accessor
		 * has been removed by this or any other accessor.
		 *
		 * @method previous
		 * @return {Canvace.List.Accessor} An Accessor for accessing the
		 * previous element, or `null` if this Accessor represents the first
		 * element.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	// the following reverse loop alerts, in order: 3, 2, 1
		 *	for (var a = list.getTail(); a; a = a.previous()) {
		 *		alert(a.element());
		 *	}
		 */
		this.previous = function () {
			if ('removed' in node) {
				throw {
					message: 'no previous element, this element has been removed',
					element: node.element
				};
			} else {
				return new Accessor(node.previous);
			}
		};

		/**
		 * Returns an
		 * {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLink}} for
		 * accessing the next element of the list, or `null` if this Accessor
		 * represents the last element.
		 *
		 * An exception is thrown if the element represented by this accessor
		 * has been removed by this or any other accessor.
		 *
		 * @method next
		 * @return {Canvace.List.Accessor} An Accessor for accessing the next
		 * element, or `null` if this Accessor represents the last element.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	// the following loop alerts, in order: 1, 2, 3
		 *	for (var a = list.getHead(); a; a = a.next()) {
		 *		alert(a.element());
		 *	}
		 */
		this.next = function () {
			if ('removed' in node) {
				throw {
					message: 'no next element, this element has been removed',
					element: node.element
				};
			} else {
				return new Accessor(node.next);
			}
		};

		/**
		 * Removes the element from the list.
		 *
		 * @method remove
		 * @return {Boolean} `true` if the element was successfully removed,
		 * `false` otherwise. `false` is returned if this method is called more
		 * than once, thus trying to remove the same element multiple times:
		 * only the first call returns `true`.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	for (var a = list.getHead(); a; a = a.next()) {
		 *		if (a.element() === 2) {
		 *			a.remove();
		 *		}
		 *	}
		 *	// the element 2 has been removed
		 */
		this.remove = function () {
			if ('removed' in node) {
				return false;
			} else {
				if (node.previous) {
					node.previous.next = node.next;
				}
				if (node.next) {
					node.next.previous = node.previous;
				}
				if (node === head) {
					head = node.next;
				}
				if (node === tail) {
					tail = node.previous;
				}
				node.removed = true;
				return true;
			}
		};
	}

	/**
	 * Adds the specified element to the list before the current head element.
	 *
	 * An {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLink}} to the
	 * new element is returned.
	 *
	 * @method addHead
	 * @for Canvace.List
	 * @param element {Any} The element to add.
	 * @return {Canvace.List.Accessor} An Accessor to the added element.
	 */
	this.addHead = function (element) {
		head = {
			element: element,
			previous: null,
			next: head
		};
		if (!tail) {
			tail = head;
		}
		count++;
		return new Accessor(head);
	};

	/**
	 * Returns an {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLink}}
	 * to the head element, or `null` if the list does not contain any elements.
	 *
	 * @method getHead
	 * @return {Canvace.List.Accessor} An Accessor to the current head element,
	 * or `null` if the list is empty.
	 */
	this.getHead = function () {
		return new Accessor(head);
	};

	/**
	 * Adds the specified element to the list after the current tail element.
	 *
	 * An {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLink}} to the
	 * new element is returned.
	 *
	 * @method addTail
	 * @param element {Any} The element to add.
	 * @return {Canvace.List.Accessor} An Accessor to the added element.
	 */
	this.addTail = function (element) {
		tail = {
			element: element,
			previous: tail,
			next: null
		};
		if (!head) {
			head = tail;
		}
		count++;
		return new Accessor(tail);
	};

	/**
	 * Returns an {{#crossLink "Canvace.List.Accessor"}}Accessor{{/crossLinK}}
	 * to the tail element, or `null` if the list does not contain any elements.
	 *
	 * @method getTail
	 * @return {Canvace.List.Accessor} An Accessor to the current tail element,
	 * or `null` if the list is empty.
	 */
	this.getTail = function () {
		return new Accessor(tail);
	};

	/**
	 * Returns the number of elements currently in the list.
	 *
	 * @method count
	 * @return {Number} The number of elements in the list.
	 */
	this.count = function () {
		return count;
	};

	/**
	 * Returns a boolean value indicating whether the list is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` is the list is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !count;
	};

	/**
	 * Removes all the elements from the list.
	 *
	 * This method operates in constant time.
	 *
	 * @method clear
	 */
	this.clear = function () {
		head = null;
		tail = null;
		count = 0;
	};

	/**
	 * Iterates over the contained elements, from the first to the last.
	 *
	 * This method is faster than manually iterating using
	 * {{#crossLink "Canvace.List/getHead"}}{{/crossLink}} and subsequent
	 * {{#crossLink "Canvace.List.Accessor/next"}}Accessor.next{{/crossLink}}
	 * calls because it does not instantiate accessors: the elements are
	 * returned directly.
	 *
	 * For each enumerated element the specified `action` callback function is
	 * called and is passed the element.
	 *
	 * The iteration can be interrupted by returning `false` in the callback
	 * function.
	 *
	 * @method forEach
	 * @param action {Function} A user-defined callback function that gets
	 * called for each iterated element. The function receives the current
	 * element as an argument. If the function returns `false` the iteration is
	 * interrupted.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the iteration was interrupted, `false` otherwise.
	 */
	this.forEach = function (action) {
		for (var node = head; node; node = node.next) {
			if (action(node.element) === false) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Iterates over the contained elements in reverse order, from the last to
	 * the first.
	 *
	 * This method is faster than manually iterating using
	 * {{#crossLink "Canvace.List/getTail"}}{{/crossLink}} and subsequent
	 * {{#crossLink "Canvace.List.Accessor/previous"}}Accessor.previous{{/crossLink}}
	 * calls because it does not instantiate accessors: the elements are
	 * returned directly.
	 *
	 * For each enumerated element the specified `action` callback function is
	 * called and is passed the element.
	 *
	 * The iteration can be interrupted by returning `false` in the callback
	 * function.
	 *
	 * @method forEachReverse
	 * @param action {Function} A user-defined callback function that gets
	 * called for each iterated element. The function receives the current
	 * element as an argument. If the function returns `false` the iteration is
	 * interrupted.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the iteration was interrupted, `false` otherwise.
	 */
	this.forEachReverse = function (action) {
		for (var node = tail; node; node = node.previous) {
			if (action(node.element) === false) {
				return true;
			}
		}
		return false;
	};
};
