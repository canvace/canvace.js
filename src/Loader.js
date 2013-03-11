/**
 * Helper class that eases the asynchronous loading of the stage data exported
 * by the Canvace Development Environment.
 *
 * @class Canvace.Loader
 * @constructor
 * @param options {Object} A dictionary containing the options for the loader.
 * @param options.basePath {String} The relative or absolute path referring to
 * the directory where the images and sounds to be loaded are located.
 * The specified path must not include any trailing slash.
 * @param options.complete {Function} A mandatory callback function to invoke
 * when the loading of the assets completes. It receives a reference to this
 * loader.
 * @param [options.progress] {Function} An optional callback function to invoke
 * when the loading of the assets progresses. It receives the current percentage
 * expressed as a real number in a `[0, 100)` range.
 * @param [options.error] {Function} An optional callback function to invoke
 * whenever a loading error occurs.
 */
Canvace.Loader = function (options) {
	if (typeof options.basePath !== 'string') {
		throw 'Invalid value specified for "basePath"';
	}

	if (typeof options.complete !== 'function') {
		throw 'Invalid callback specified for "complete"';
	}

	var loadComplete = options.complete;
	var loadProgress = options.progress || function () {};
	var loadError    = options.error    || function () {};

	var thisObject = this;
	var audio = new Canvace.Audio();

	var imageset = {};
	var imagesLoaded = false;
	var imagesProgress = 0;

	var soundset = {};
	var soundsLoaded = false;
	var soundsProgress = 0;

	var jobCount = 2;

	function updateProgress() {
		loadProgress((imagesProgress + soundsProgress) / jobCount);
	}

	function loadFinished() {
		if (imagesLoaded && soundsLoaded) {
			loadComplete(thisObject);
		}
	}

	function loadImages(data) {
		var totalCount = 0;
		var id;
		var frames;

		var reverseTileFrameTable = {};
		for (id in data.tiles) {
			if (data.tiles.hasOwnProperty(id)) {
				frames = data.tiles[id].frames;
				totalCount += frames.length;
				if (frames.length) {
					if (!reverseTileFrameTable.hasOwnProperty(frames[0].id)) {
						reverseTileFrameTable[frames[0].id] = new Canvace.MultiSet();
					}
					reverseTileFrameTable[frames[0].id].add(data.tiles[id]);
				}
			}
		}

		var reverseEntityFrameTable = {};
		for (id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				frames = data.entities[id].frames;
				totalCount += frames.length;
				if (frames.length) {
					if (!reverseEntityFrameTable.hasOwnProperty(frames[0].id)) {
						reverseEntityFrameTable[frames[0].id] = new Canvace.MultiSet();
					}
					reverseEntityFrameTable[frames[0].id].add(data.entities[id]);
				}
			}
		}

		var doProgress = (function () {
			var count = 0;
			return function doProgress() {
				imagesProgress = 100 * ++count / Math.max(1, totalCount);
				updateProgress();
				if (count >= totalCount) {
					imagesLoaded = true;
					loadFinished();
				}
			};
		}());

		function bindProgress(id) {
			return function () {
				if (reverseTileFrameTable.hasOwnProperty(id)) {
					reverseTileFrameTable[id].fastForEach(function (tile) {
						tile.width = imageset[id].width;
						tile.height = imageset[id].height;
					});
				}
				if (reverseEntityFrameTable.hasOwnProperty(id)) {
					reverseEntityFrameTable[id].fastForEach(function (entity) {
						entity.width = imageset[id].width;
						entity.height = imageset[id].height;
					});
				}
				doProgress();
			};
		}

		if (totalCount === 0) {
			doProgress();
			return thisObject;
		}

		function batchImages(descriptor) {
			for (var i in descriptor.frames) {
				(function (id) {
					if (id in imageset) {
						bindProgress(id)();
					} else {
						var image = new Image();
						imageset[id] = image;
						image.addEventListener('load', bindProgress(id), false);
						image.src = [options.basePath, id].join('/');
					}
				}(descriptor.frames[i].id));
			}
		}

		for (id in data.tiles) {
			batchImages(data.tiles[id]);
		}

		for (id in data.entities) {
			batchImages(data.entities[id]);
		}

		return thisObject;
	}

	/**
	 * Loads an image from the exported image set.
	 *
	 * @method getImage
	 * @param id {Number} The ID of the image to load.
	 * @param [callback] {Function} An optional callback function to invoke when
	 * the loading of the image is complete.
	 * @return {HTMLImageElement} The HTML image element representing the loaded
	 * image.
	 */
	this.getImage = function (id, callback) {
		if (imageset.hasOwnProperty(id)) {
			return imageset[id];
		} else {
			var image = new Image();
			if (typeof callback === 'function') {
				image.addEventListener('load', callback, false);
			}
			image.src = [options.basePath, id].join('/');
			return imageset[id] = image;
		}
	};

	function loadSounds(sources) {
		var totalCount = Object.keys(sources).length;

		var progress = (function () {
			var count = 0;

			return function () {
				soundsProgress = (100 * ++count / Math.max(1, totalCount));
				updateProgress();

				if (count >= totalCount) {
					soundsLoaded = true;
					loadFinished();
				}
			};
		}());

		if (totalCount === 0) {
			progress();
			return thisObject;
		}

		function triggerError(i) {
			return function () {
				loadError(i);
			};
		}

		function getSuitableSource(sourceList) {
			for (var i in sourceList) {
				try {
					var info = Canvace.Loader.getSourceInfo(sourceList[i]);

					if (audio.canPlayType(info.mimeType)) {
						return [options.basePath, info.url].join('/');
					}
				} catch (e) {
					return false;
				}
			}

			return false;
		}

		for (var i in sources) {
			if (i in soundset) {
				progress();
			} else {
				var source = getSuitableSource(sources[i]);

				if (false === source) {
					loadError(i);
					progress();
				} else {
					soundset[i] = audio.load(source, progress, triggerError(i));
				}
			}
		}

		return thisObject;
	}

	/**
	 * Returns a `Canvace.Audio.SourceNode` representing the audio asset
	 * identified by the specified name. This name corresponds to one of the
	 * names specified to the `loadAssets` method. This method must be called
	 * after the sounds have been loaded by the `loadAssets` method.
	 *
	 * @method getSound
	 * @param name {String} A name identifying an audio asset.
	 * @return {Canvace.Audio.SourceNode} An object that can be used to play
	 * the sound back if the specified name is known, `null` otherwise.
	 */
	this.getSound = function (name) {
		if (soundset.hasOwnProperty(name)) {
			return soundset[name];
		}
		return null;
	};

	/**
	 * Asynchronously loads all the images associated with the given Canvace
	 * stage and all the given sounds.
	 *
	 * @method loadAssets
	 * @param [imagesData] {Object} The JSON data output by the Canvace
	 * Development Environment.
	 * @param [soundsData] {Object} A map where the keys indicate the name of
	 * the sound to load, and the values are `Array`s of source descriptors,
	 * which are either `Object`s (each containing the string properties
	 * 'mimeType' and 'url') or `String`s (indicating the URL of the
	 * resource to load, in which case the loader tries to infer the MIME type
	 * from the file extension). Object and String source descriptors can be
	 * mixed.
	 *
	 * These objects represent the audio file sources that will be tried in
	 * order, falling back to the next one if the browser doesn't support
	 * playing the specified MIME type.
	 * @example
	 *	var soundResources;
	 *
	 *	// Explicit description of the sources, complete with MIME type and URL
	 *	soundResources = {
	 *		'first-sound': [{
	 *			mimeType: 'audio/mp3',
	 *			url: 'first.mp3'
	 *		}, {
	 *			mimeType: 'application/ogg',
	 *			url: 'first.ogg'
	 *		}],
	 *		'second-sound': [{
	 *			mimeType: 'audio/mp3',
	 *			url: 'second.mp3'
	 *		}, {
	 *			mimeType: 'application/ogg',
	 *			url: 'second.ogg'
	 *		}]
	 *	};
	 *
	 *	// Implicit description of the sources, with just the URL specified
	 *	soundResources = {
	 *		'first-sound': ['first.mp3', 'first.ogg'],
	 *		'second-sound': ['second.mp3', 'second.ogg']
	 *	};
	 *
	 *	// Explicit, manual loading of the JSON resource
	 *	Canvace.Ajax.getJSON('stage.json', function (stage) {
	 *		var loader = new Canvace.Loader({
	 *			basePath: 'media',
	 *			complete: function () {
	 *				// ...
	 *			}
	 *		});
	 *		loader.loadAssets(stage, soundResources);
	 *	});
	 */
	this.loadAssets = function (imagesData, soundsData) {
		imagesLoaded = (typeof imagesData === 'undefined' || imagesData === null);
		soundsLoaded = (typeof soundsData === 'undefined' || soundsData === null);

		if (imagesLoaded && soundsLoaded) {
			loadFinished();
			return;
		} else if (imagesLoaded ^ soundsLoaded) {
			jobCount = 1;
		}

		if (!imagesLoaded) {
			loadImages(imagesData);
		}

		if (!soundsLoaded) {
			loadSounds(soundsData);
		}
	};

	/**
	 * TODO
	 *
	 * @method loadStage
	 * @param canvas {Mixed} An HTML5 canvas element used where the stage
	 * will be rendered. This parameter can be either the actual
	 * `HTMLCanvasElement`, or a selector string. In the latter case, the
	 * first matching element is used, and an exception is thrown if no
	 * matching element is found.
	 * @param stageUrl {String} The URL where the JSON resource can be
	 * loaded from. The loader will automatically perform a new `GET`
	 * request to that URL.
	 * @param soundsData {Object} See the description of the omonymous
	 * parameter of the `loadAssets` function.
	 * @return TODO
	 */
	this.loadStage = function (canvas, stageUrl, soundsData) {
		Canvace.Ajax.getJSON(stageUrl, function (imagesData) {
			var originalCallback = loadComplete;
			loadComplete = function () {
				loadComplete = originalCallback;
				originalCallback(thisObject, new Canvace.Stage(imagesData, canvas));
			};
			thisObject.loadAssets(imagesData, soundsData);
		}, function () {
			loadError.apply(arguments);
		});
	};
};

/**
 * TODO
 *
 * @method guessMimeType
 * @static
 * @param source {String} TODO
 * @return {String} TODO
 * @example
 *	TODO
 */
Canvace.Loader.guessMimeType = function (source) {
	var mimeMap = [
		{
			pattern: /\.aac$/i,
			mime: 'audio/aac'
		},
		{
			pattern: /\.mp3$/i,
			mime: 'audio/mp3'
		},
		{
			pattern: /\.ogg$/i,
			mime: 'application/ogg'
		}
	];
	for (var i in mimeMap) {
		if (mimeMap[i].pattern.test(source)) {
			return mimeMap[i].mime;
		}
	}
	throw 'Couldn\'t guess the MIME type from the resource URL';
};

/**
 * TODO
 *
 * @method getSourceInfo
 * @static
 * @param source {Mixed} TODO
 * @return {Object} TODO
 * @example
 *	TODO
 */
Canvace.Loader.getSourceInfo = function (source) {
	if (typeof source === 'string') {
		return {
			url: source,
			mimeType: Canvace.Loader.guessMimeType(source)
		};
	} else if (typeof source === 'object') {
		if (source.hasOwnProperty('url') && source.hasOwnProperty('mimeType')) {
			return source;
		}
	} else {
		throw 'Invalid source specified';
	}
};

/**
 * Plays a sound represented by an audio asset previously loaded by the
 * loader. The audio asset is identified by the `name` argument, that must
 * correspond to a name passed to the `loadAssets` method.
 *
 * This method only _starts_ playing the sound, and immediately returns. It
 * works by simply calling the `play` method of the `Canvace.Audio.SourceNode`
 * interface.
 *
 * This method has no effect if the sound is already playing.
 *
 * The sound can optionally be looped: when `true` is specified to the
 * optional `loop` argument, the sound will play continuously.
 *
 * @method playSound
 * @param name {String} A name identifying the audio asset.
 * @param [loop=false] {Boolean} An optional boolean value that indicates
 * whether the sound must be looped. It defaults to `false` when not specified.
 * @return {Canvace.Audio.SourceNode} An object that can be used to play
 * the sound back if the specified name is known, `null` otherwise.
 */
Canvace.Loader.prototype.playSound = function (name, loop) {
	var sound = this.getSound(name);
	if (null !== sound) {
		sound.setLooping(!!loop);
		sound.play();
	}
	return sound;
};
