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

	var AudioContext = Canvace.Polyfill.getPrefixedConstructor('AudioContext');
	var audioElement = createAudioElement();

	/**
	 * Tries to load the requested audio resource.
	 *
	 * You are not required to use this method to manually load the audio
	 * resources: you can rely on the functionalities exposed by
	 * {{#crossLink "Canvace.Loader"}}Loader{{/crossLink}} to load multiple
	 * resources in one call and get notified of the loading progress.
	 *
	 * @method load
	 * @param url {String} The URL where the audio resource resides.
	 * @param [onload] {Function} An optional callback function to invoke when
	 * the loading of the resource completes.
	 * @param onload.node {Canvace.Audio.SourceNode} The
	 * {{#crossLink "Canvace.Audio.SourceNode"}}SourceNode{{/crossLink}} that
	 * has just finished loading.
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
	 * @method canPlayType
	 * @param mimeType {String} The MIME type to check for.
	 * @return {Boolean} `true` if the browser can play the specified MIME type,
	 * `false` otherwise.
	 * @example
	 *	var audio = new Canvace.Audio();
	 *	
	 *	function playSound(node) {
	 *		node.play();
	 *	}
	 *	
	 *	if (audio.canPlayType('audio/mp3')) {
	 *		audio.load('audio/foo.mp3', playSound);
	 *	} else if (audio.canPlayType('application/ogg')) {
	 *		audio.load('audio/bar.ogg', playSound);
	 *	} else {
	 *		alert('No suitable audio resource available!');
	 *	}
	 */
	this.canPlayType = function (mimeType) {
		return (audioElement.canPlayType(mimeType) !== '');
	};

	var SourceNode;

	if (typeof AudioContext !== 'undefined') {
		var context = new AudioContext();

		/**
		 * This class represents a sound resource that the browser is capable
		 * of playing.
		 *
		 * If the browser supports WebAudio, this class wraps around an
		 * `AudioSourceNode`; if it doesn't, this class wraps around an
		 * `HTMLAudioElement`.
		 *
		 * You cannot instantiate this class directly: you can obtain a new
		 * instance by using the
		 * {{#crossLink "Canvace.Audio/load"}}Audio.load{{/crossLink}},
		 * {{#crossLink "Canvace.Loader/getSound"}}Loader.getSound{{/crossLink}}
		 * or
		 * {{#crossLink "Canvace.Loader/playSound"}}Loader.playSound{{/crossLink}}
		 * method.
		 *
		 * @class Canvace.Audio.SourceNode
		 */
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var currentTime = 0;
			var noteOnAt = 0;
			var looping = false;
			var loaded = false;
			var sourceNode;
			var bufferData;

			/**
			 * Plays the associated sound resource, resuming from the last
			 * position.
			 *
			 * @method play
			 * @chainable
			 */
			this.play = function () {
				if (bufferData) {
					sourceNode = context.createBufferSource();
					sourceNode.buffer = bufferData;
					sourceNode.loop = looping;
					sourceNode.connect(context.destination);

					var remaining = (bufferData.duration - currentTime);
					noteOnAt = context.currentTime;
					if (sourceNode.start) {
						sourceNode.start(0, currentTime, remaining);
					} else if (sourceNode.noteGrainOn) {
						sourceNode.noteGrainOn(0, currentTime, remaining);
					}
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
					if (sourceNode.stop) {
						sourceNode.stop(0);
					} else if (sourceNode.nodeOff) {
						sourceNode.noteOff(0);
					}
					sourceNode.disconnect();

					currentTime += (context.currentTime - noteOnAt) % bufferData.duration;
				}
				return thisObject;
			};

			/**
			 * Returns a clone of this
			 * {{#crossLink "Canvace.Audio.SourceNode"}}SourceNode{{/crossLink}}
			 * instance.
			 *
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
			 * Indicates whether the associated sound resource has completed
			 * loading.
			 *
			 * @method isLoaded
			 * @return {Boolean} `true` if the associated sound resource has
			 * completed loading, `false` otherwise.
			 */
			this.isLoaded = function () {
				return loaded;
			};

			/**
			 * Marks the sound resource as looping (i.e., it will start playing
			 * again as soon as it ends its playback).
			 *
			 * @method setLooping
			 * @param loop {Boolean} Indicates whether the playback should loop
			 * or not.
			 * @chainable
			 */
			this.setLooping = function (loop) {
				looping = loop;
				if (sourceNode) {
					sourceNode.loop = loop;
				}
				return thisObject;
			};

			if (typeof source !== 'string') {
				bufferData = source;
				return this;
			}

			Canvace.Ajax.get({
				type: 'arraybuffer',
				url: source,
				load: function (response) {
					context.decodeAudioData(response, function (buffer) {
						bufferData = buffer;
						loaded = true;
						if (typeof onload === 'function') {
							onload(thisObject);
						}
					}, function () {
						if (typeof onerror === 'function') {
							// FIXME: we should pass back something about the
							// error occurred, not the requested URL that failed
							// loading.
							onerror(source);
						}
					});
				},
				error: function () {
					if (typeof onerror === 'function') {
						onerror();
					}
				}
			});

			return this;
		};
	} else if (typeof audioElement !== 'undefined') {
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var appended = false;
			var loaded = false;
			var context;

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

				(function (setLoadCallback) {
					setLoadCallback('canplay');
					setLoadCallback('canplaythrough');
				}(function (eventName) {
					context.addEventListener(eventName, function _onload() {
						context.removeEventListener(eventName, _onload, false);
						if (!loaded) {
							loaded = true;
							if (typeof onload === 'function') {
								onload(thisObject);
							}
						}
					}, false);
				}));

				context.addEventListener('error', function (e) {
					if (typeof onerror === 'function') {
						onerror(e);
					}
				}, false);

				context.setAttribute('preload', 'auto');
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
