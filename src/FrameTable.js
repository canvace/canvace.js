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

Canvace.FrameTable = function (data) {
	var tileSet = {};
	var entitySet = {};

	var table = {};
	var nextId = 0;

	var synchronizers = [];

	function gcd(a, b) {
		var t;
		while (b) {
			t = b;
			b = a % b;
			a = t;
		}
		return a;
	}

	function Animation(frames) {
		var animation;
		if (frames.length < 2) {
			animation = function () {
				return frames[0];
			};
			animation.static = true;
			return animation;
		} else {
			var partialUnit = 0;
			var fullDuration = 0;
			var looping = true;
			var lastFrame;
			for (var i in frames) {
				if (frames.hasOwnProperty(i)) {
					if (frames[i].hasOwnProperty('duration')) {
						partialUnit = gcd(partialUnit, frames[i].duration);
						fullDuration += frames[i].duration;
					} else {
						looping = false;
						lastFrame = frames[i];
					}
				}
			}

			var table = {};
			var unit = 0;

			var synchronize = function (period) {
				table = {};
				unit = gcd(partialUnit, period);
				var frameIndex = 0;
				var frameTime = 0;
				for (var time = 0; time < fullDuration; time += unit, frameTime += unit) {
					if (frameTime > frames[frameIndex].duration) {
						frameIndex++;
						frameTime = 0;
					}
					table[time] = frames[frameIndex];
				}
			};

			synchronize(partialUnit);
			synchronizers.push(synchronize);

			animation = (function () {
				if (looping) {
					return function (timestamp) {
						return table[Math.floor((timestamp % fullDuration) / unit) * unit];
					};
				} else {
					return function (timestamp) {
						if (timestamp >= fullDuration) {
							return lastFrame;
						} else {
							return table[Math.floor(timestamp / unit) * unit];
						}
					};
				}
			}());
			animation.static = false;
			return animation;
		}
	}

	this.registerTile = function (id) {
		if (data.tiles.hasOwnProperty(id)) {
			table[tileSet[id] = nextId++] = new Animation(data.tiles[id].frames);
		} else {
			throw 'invalid tile ID: ' + id;
		}
	};

	this.registerEntity = function (id) {
		if (data.entities.hasOwnProperty(id)) {
			table[entitySet[id] = nextId++] = new Animation(data.entities[id].frames);
		} else {
			throw 'invalid entity ID: ' + id;
		}
	};

	this.getTileAnimation = function (tileId) {
		return table[tileSet[tileId]];
	};

	this.getEntityAnimation = function (entityId) {
		return table[entitySet[entityId]];
	};

	this.synchronize = function (period) {
		for (var i in synchronizers) {
			if (synchronizers.hasOwnProperty(i)) {
				synchronizers[i](period);
			}
		}
	};
};
