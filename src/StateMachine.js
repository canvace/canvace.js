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
 * The `StateMachine` class allows to implement generic state machines with a
 * finite set of states and transitions, also called Deterministic Finite
 * Automata, or DFAs.
 *
 * Objects of this class have one method for each specified transition. A
 * `StateMachine` object is initially in the specified initial state; calling
 * one of its transition methods makes it change its state depending on how
 * transitions and states are defined.
 *
 * The following example defines a state machine with three states and two
 * possible transitions, and indicates the target state for each starting state
 * and for each transition:
 *
 *	var sm = new Canvace.StateMachine({
 *		state0: {
 *			transition1: 'state1',
 *			transition2: 'state2'
 *		},
 *		state1: {
 *			transition1: 'state0',
 *			transition2: 'state2'
 *		},
 *		state2: {
 *			transition1: 'state0',
 *			transition2: 'state1'
 *		}
 *	}, 'state0');
 *
 *	sm.transition1(); // goes into state1
 *	sm.transition2(); // goes into state2
 *	sm.transition2(); // goes into state1
 *
 * Note that this class defines a `getCurrentState` method, thus the
 * "getCurrentState" name is reserved and cannot be used as a transition name
 * since it would override the method provided by the class.
 *
 * For more information about defining state machines, refer to the constructor
 * documentation.
 *
 * @class Canvace.StateMachine
 * @constructor
 * @param states {Object} A map of states. Each property of this object is a
 * state name and its value is a state object.
 *
 * Each state object is a map of transitions: each property is a transition name
 * and its value is a transition.
 *
 * A transition can be expressed in two possible forms: a string and a function.
 * A string indicates the target state of that transition, while a function
 * contains code that is executed every time the state machine does that
 * transition. The function may or may not return a string as a return value;
 * the optionally returned string indicates the target state. If the function
 * returns anything other than a string its return value is ignored and the
 * transition is assumed to have the current state as target state, so the
 * machine's state is not changed.
 *
 * Transition functions may accept arguments, in which case the transition
 * function exposed by the `StateMachine` object accepts the same number of
 * arguments and forwards them in the same order. This means transitions can be
 * parameterized.
 *
 * At the invocation of a transition function, `this` is set to the current
 * state object (the same object that was passed to the constructor in the
 * `states` argument).
 *
 * You do not need to specify all the possible transitions for each state when
 * defining the `states` argument: missing transitions are assumed to be strings
 * specifying the state's name, thus they do not change the machine's state.
 *
 * The set of all the possible transitions is automatically determined by the
 * `StateMachine` constructor by calculating the union of the transitions of all
 * the states.
 * @param initialState {String} The initial state.
 * @example
 *	var character = new Canvace.StateMachine({
 *		still: {
 *			walkLeft: function () {
 *				dx = -0.1; // decrease speed
 *				waving = true;
 *				return 'walkingLeft';
 *			},
 *			walkRight: function () {
 *				dx = 0.1;
 *				waving = true;
 *				return 'walkingRight';
 *			}
 *		},
 *		walkingLeft: {
 *			walkRight: function () {
 *				dx = 0;
 *				return 'walkingBoth';
 *			},
 *			stopLeft: function () {
 *				dx = 0;
 *				waving = false;
 *				return 'still';
 *			}
 *		},
 *		walkingRight: {
 *			walkLeft: function () {
 *				dx = 0;
 *				return 'walkingBoth';
 *			},
 *			stopRight: function () {
 *				dx = 0;
 *				waving = false;
 *				return 'still';
 *			}
 *		},
 *		walkingBoth: {
 *			stopLeft: function () {
 *				dx = 0.1;
 *				return 'walkingRight';
 *			},
 *			stopRight: function () {
 *				dx = -0.1;
 *				return 'walkingLeft';
 *			}
 *		}
 *	}, 'still');
 *
 *	var keyboard = new Canvace.Keyboard(window);
 *	keyboard.onKeyDown(KeyEvent.DOM_VK_LEFT, character.walkLeft);
 *	keyboard.onKeyUp(KeyEvent.DOM_VK_LEFT, character.stopLeft);
 *	keyboard.onKeyDown(KeyEvent.DOM_VK_RIGHT, character.walkRight);
 *	keyboard.onKeyUp(KeyEvent.DOM_VK_RIGHT, character.stopRight);
 */
Canvace.StateMachine = function (states, initialState) {
	var actions = (function () {
		var set = {};
		for (var stateName in states) {
			if (states.hasOwnProperty(stateName)) {
				for (var action in states[stateName]) {
					if (states[stateName].hasOwnProperty(action)) {
						set[action] = true;
					}
				}
			}
		}
		return set;
	}());

	var currentState, currentStateName;

	function setState(name) {
		if (!(name in states)) {
			throw 'invalid state "' + name + '"';
		}
		currentState = states[name];
		currentStateName = name;
	}

	setState(initialState);

	(function (thisObject) {
		var makeState = function (action) {
			return function () {
				if (action in currentState) {
					if (typeof currentState[action] === 'string') {
						var newStateName = currentState[action];
						setState(newStateName);
						return newStateName;
					} else if (typeof currentState[action] === 'function') {
						var result = currentState[action].apply(currentState, arguments);
						if (typeof result === 'string') {
							setState(result);
							return result;
						} else {
							return currentStateName;
						}
					} else {
						throw 'invalid transition "' + action + '" for state "' + currentStateName + '"';
					}
				} else {
					return currentStateName;
				}
			};
		};

		for (var action in actions) {
			if (actions.hasOwnProperty(action)) {
				thisObject[action] = makeState(action);
			}
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
