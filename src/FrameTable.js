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
		if (frames.length < 2) {
			return function () {
				return frames[0].id;
			};
		} else {
			var partialUnit = 0;
			var fullDuration = 0;
			var looping = true;
			var lastFrameId;
			for (var i in frames) {
				if (frames[i].hasOwnProperty('duration')) {
					partialUnit = gcd(partialUnit, frames[i].duration);
					fullDuration += frames[i].duration;
				} else {
					looping = false;
					lastFrameId = frames[i].id;
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
					table[time] = frames[frameIndex].id;
				}
			};

			synchronize(partialUnit);
			synchronizers.push(synchronize);

			if (looping) {
				return function (timestamp) {
					return table[Math.floor((timestamp % fullDuration) / unit) * unit];
				};
			} else {
				return function (timestamp) {
					if (timestamp >= fullDuration) {
						return lastFrameId;
					} else {
						return table[Math.floor((timestamp % fullDuration) / unit) * unit];
					}
				};
			}
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
			synchronizers[i](period);
		}
	};
};
