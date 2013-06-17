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
 * Similarly to the `StateMachine` class, the `ParametricStateMachine` class
 * allows to implement state machines with states and transitions; the main
 * difference is that the states can be parameterized.
 *
 * Objects of this class have one method for each specified transition. A
 * `ParametricStateMachine` object is initially in the specified initial state;
 * calling one of its transition methods makes it change its state depending on
 * how transitions and states are defined.
 *
 * TODO
 *
 * Note that this class defines a `getCurrentState` method, thus the
 * "getCurrentState" name is reserved and cannot be used as a transition name
 * since it would override the method provided by the class.
 *
 * For more information about defining state machines, refer to the constructor
 * documentation.
 *
 * @class Canvace.ParametricStateMachine
 * @constructor
 * @param transitions {String[]} An array of transition names.
 * @param states {Object} TODO
 * @param initialState {Mixed} TODO
 */
Canvace.ParametricStateMachine = function (transitions, states, initialState) {
	var currentState, currentStateName;

	function setState(name) {
		if (typeof name !== 'string') {
			if (0 in name) {
				var parameters = name;
				name = name[0];
				if (!(name in states)) {
					throw 'invalid state "' + name + '"';
				}
				if (typeof states[name] !== 'function') {
					currentState = states[name];
				} else {
					parameters.shift();
					currentState = states[name].apply(currentState, parameters);
				}
				currentStateName = name;
			} else {
				throw 'invalid transition: ' + name;
			}
		} else {
			if (!(name in states)) {
				throw 'invalid state "' + name + '"';
			}
			if (typeof states[name] !== 'function') {
				currentState = states[name];
			} else {
				currentState = states[name].call(currentState);
			}
			currentStateName = name;
		}
	}

	setState(initialState);

	(function (thisObject) {
		var makeState = function (transition) {
			thisObject[transition] = function () {
				if (transition in currentState) {
					if (typeof currentState[transition] !== 'function') {
						setState(currentState[transition]);
					} else {
						var result = currentState[transition].apply(currentState, arguments);
						if (typeof result !== 'undefined') {
							setState(result);
						}
					}
				}
				return currentStateName;
			};
		};

		for (var i in transitions) {
			makeState(transitions[i]);
		}
	}(this));

	/**
	 * Indicates the current state.
	 *
	 * @method getCurrentState
	 * @return {String} The name of the current state.
	 */
	this.getCurrentState = function () {
		return currentStateName;
	};
};
