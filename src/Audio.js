/**
 * This class provides the needed functionalities to load audio resources and
 * control them. It uses WebAudio where available, and will default to
 * `HTMLAudioElement` otherwise.
 *
 * @class Canvace.Audio
 * @constructor
 */
Canvace.Audio = function () {
	var createAudioElement = function () {
		return (function () {
			try {
				return new Audio();
			} catch (e) {
				return document.createElement('audio');
			}
		}());
	};

	var AudioContext = Canvace.Polyfill.getPrefixedProperty('AudioContext');
	var audioElement = createAudioElement();

	/**
	 * Tries to load the requested audio resource.
	 * You are not required to use this method to manually load the audio
	 * resources: you can rely on the functionalities exposed by
	 * {{#crossLink "Canvace.Loader"}}{{/crossLink}} to load multiple resources
	 * in one call and get notified of the loading progress.
	 *
	 * @method load
	 * @param url {String} The URL where the audio resource resides.
	 * @param [onload] {Function} An optional callback function to invoke when
	 * the loading of the resource completes. This function gets passed the
	 * `Canvace.Audio.SourceNode` that has just finished loading.
	 * @param [onerror] {Function} An optional callback function to invoke if
	 * the loading of the resource fails with an error.
	 * @return {Canvace.Audio.SourceNode} An audio node instance.
	 */
	this.load = function (url, onload, onerror) {
		return new SourceNode(url, onload, onerror);
	};

	/**
	 * Determines if the browser supports playing the requested MIME type.
	 *
	 * @example
	 *	var audio = new Canvace.Audio();
	 *	var playSound = function (node) {
	 *		node.play();
	 *	};
	 *	if (audio.canPlayType('audio/mp3')) {
	 *		audio.load('audio/foo.mp3', playSound);
	 *	} else if (audio.canPlayType('application/ogg')) {
	 *		audio.load('audio/bar.ogg', playSound);
	 *	} else {
	 *		alert('No suitable audio resource available!');
	 *	}
	 *
	 * @method canPlayType
	 * @param mimeType {String} The MIME type to check for.
	 * @return {Boolean} A boolean result.
	 */
	this.canPlayType = function (mimeType) {
		return (audioElement.canPlayType(mimeType) !== '');
	};

	var SourceNode = null;

	if (typeof AudioContext !== 'undefined') {
		var context = new AudioContext();

		/**
		 * This class represents a sound resource that the browser is capable
		 * of playing. If the browser supports WebAudio, this class wraps around
		 * an `AudioSourceNode`; if it doesn't, this class wraps around an
		 * `HTMLAudioElement`.
		 *
		 * You cannot instantiate this class directly: you can obtain a new
		 * instance by using the `load` method of
		 * {{#crossLink "Canvace.Audio"}}{{/crossLink}}, or with the methods
		 * `getSound` and `playSound` made available by
		 * {{#crossLink "Canvace.Loader"}}{{/crossLink}}.
		 *
		 * @class Canvace.Audio.SourceNode
		 */
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var sourceNode = null;
			var bufferData = null;
			var currentTime = 0;
			var noteOnAt = 0;
			var looping = false;
			var loaded = false;

			/**
			 * Plays the associated sound resource, resuming from the last
			 * position.
			 *
			 * @method play
			 * @chainable
			 */
			this.play = function () {
				var position = currentTime / 1000;
				var remaining = bufferData.duration - position;
				if (bufferData) {
					sourceNode = context.createBufferSource();
					sourceNode.buffer = bufferData;
					sourceNode.loop = looping;
					sourceNode.connect(context.destination);

					noteOnAt = Canvace.Timing.now();
					sourceNode.noteGrainOn(0, position, remaining);
				}
				return thisObject;
			};

			/**
			 * Pauses the playback of the associated sound resource.
			 *
			 * @method pause
			 * @chainable
			 */
			this.pause = function () {
				if (sourceNode) {
					sourceNode.noteOff(0);
					sourceNode.disconnect();

					currentTime += Canvace.Timing.now() - noteOnAt;
				}
				return thisObject;
			};

			/**
			 * Returns a clone of this `Canvace.Audio.SourceNode` instance.
			 * The new instance will have the same sound resource associated
			 * and the same flags applied (e.g., if this instance is set to be
			 * looping, the cloned one will be as well).
			 *
			 * @method clone
			 * @return {Canvace.Audio.SourceNode} The clone of this instance.
			 */
			this.clone = function () {
				var clone = new SourceNode(bufferData);
				clone.setLooping(looping);
				return clone;
			};

			/**
			 * Tells if the associated sound resource has completed loading.
			 *
			 * @method isLoaded
			 * @return {Boolean} Indicates whether it has completed loading or
			 * not.
			 */
			this.isLoaded = function () {
				return loaded;
			};

			/**
			 * Marks the sound resource as looping (i.e., it will start playing
			 * again as soon as it ends its playback).
			 *
			 * @method setLooping
			 * @param shouldLoop {Boolean} Indicates whether the playback should
			 * loop or not.
			 * @chainable
			 */
			this.setLooping = function (shouldLoop) {
				looping = shouldLoop;
				if (sourceNode) {
					sourceNode.loop = shouldLoop;
				}
				return thisObject;
			};

			if (typeof source !== 'string') {
				bufferData = source;
				return this;
			}

			var request = new XMLHttpRequest();
			request.addEventListener('load', function () {
				context.decodeAudioData(request.response, function (buffer) {
					bufferData = buffer;
					loaded = true;
					if (typeof onload === 'function') {
						onload(thisObject);
					}
				}, function () {
					if (typeof onerror === 'function') {
						// FIXME: we should pass back something about the error
						// occurred, not the requested URL that failed loading.
						onerror(source);
					}
				});
			}, false);
			request.addEventListener('error', function (e) {
				if (typeof onerror === 'function') {
					onerror(e);
				}
			}, false);
			request.open('GET', source, true);
			request.responseType = 'arraybuffer';
			request.send();
			return this;
		};
	} else if (typeof audioElement !== 'undefined') {
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var appended = false;
			var loaded = false;
			var context = null;

			this.play = function () {
				if (!appended) {
					document.body.appendChild(context);
					appended = true;
				}
				context.play();
				return thisObject;
			};

			this.pause = function () {
				context.pause();
				return thisObject;
			};

			this.clone = function () {
				var clone = new SourceNode(context.cloneNode(true));
				clone.setLooping(context.loop);
				return clone;
			};

			this.isLoaded = function () {
				return loaded;
			};

			this.setLooping = function (shouldLoop) {
				context.loop = (!!shouldLoop);
				return thisObject;
			};

			if (typeof source !== 'string') {
				context = source;
				loaded = true;
			} else {
				context = createAudioElement();
				context.addEventListener('canplay', function () {
					if (!loaded) {
						loaded = true;
						if (typeof onload === 'function') {
							onload(thisObject);
						}
					}
				}, false);
				context.addEventListener('error', function (e) {
					if (typeof onerror === 'function') {
						onerror(e);
					}
				}, false);
				context.setAttribute('src', source);
				context.load();
			}

			context.addEventListener('ended', function () {
				if (appended && !context.loop) {
					document.body.removeChild(context);
					appended = false;
				}
			}, false);
			return this;
		};
	}

	SourceNode.prototype.playClone = function () {
		var clone = this.clone();
		clone.play();
		return clone;
	};
};
