/*!
 * @author yomotsu / http://yomotsu.net/
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GLSlideshow = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _Renderer2 = require('./Renderer.js');

var _Renderer3 = _interopRequireDefault(_Renderer2);

var _Texture = require('./Texture.js');

var _Texture2 = _interopRequireDefault(_Texture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * Canvas Renderer class.
 * @class CanvasRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 */

var CanvasRenderer = function (_Renderer) {
	_inherits(CanvasRenderer, _Renderer);

	function CanvasRenderer(images, params) {
		_classCallCheck(this, CanvasRenderer);

		var _this = _possibleConstructorReturn(this, _Renderer.call(this, images, params));

		_this.context = _this.domElement.getContext('2d');

		_this.from = new _Texture2.default(_this.images[_this.count]);
		_this.to = new _Texture2.default(_this.images[_this.getNext()]);

		_this.from.addEventListener('updated', _this.updateTexture.bind(_this));
		_this.to.addEventListener('updated', _this.updateTexture.bind(_this));

		_this.setSize(params.width || _this.domElement.width, params.height || _this.domElement.height);
		_this.tick();

		return _this;
	}

	CanvasRenderer.prototype.updateTexture = function updateTexture() {

		this.isUpdated = true;
	};

	CanvasRenderer.prototype.render = function render() {

		var transitionElapsedTime = 0;
		var progress = 1;
		var width = this.domElement.width;
		var height = this.domElement.height;

		if (this.inTranstion) {

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

			if (progress !== 1) {

				this.context.drawImage(this.from.image, 0, 0, width, height);
				this.context.globalAlpha = progress;
				this.context.drawImage(this.to.image, 0, 0, width, height);
				this.context.globalAlpha = 1;
			} else {

				this.context.drawImage(this.to.image, 0, 0, width, height);
				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				this.dispatchEvent({ type: 'transitionEnd' });
				// transitionEnd!
			}
		} else {

			this.context.drawImage(this.images[this.count], 0, 0, width, height);
			this.isUpdated = false;
		}
	};

	CanvasRenderer.prototype.dispose = function dispose() {

		this.isRunning = false;
		this.inTranstion = false;

		this.tick = function () {};

		this.setSize(1, 1);

		if (!!this.domElement.parentNode) {

			this.domElement.parentNode.removeChild(this.domElement);
		}

		delete this.from;
		delete this.to;
		delete this.domElement;
	};

	return CanvasRenderer;
}(_Renderer3.default);

exports.default = CanvasRenderer;
module.exports = exports['default'];

},{"./Renderer.js":4,"./Texture.js":5}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
/*!
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function EventDispatcher() {};

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function apply(object) {

		object.addEventListener = EventDispatcher.prototype.addEventListener;
		object.hasEventListener = EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;
	},

	addEventListener: function addEventListener(type, listener) {

		if (this._listeners === undefined) this._listeners = {};

		var listeners = this._listeners;

		if (listeners[type] === undefined) {

			listeners[type] = [];
		}

		if (listeners[type].indexOf(listener) === -1) {

			listeners[type].push(listener);
		}
	},

	hasEventListener: function hasEventListener(type, listener) {

		if (this._listeners === undefined) return false;

		var listeners = this._listeners;

		if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {

			return true;
		}

		return false;
	},

	removeEventListener: function removeEventListener(type, listener) {

		if (this._listeners === undefined) return;

		var listeners = this._listeners;
		var listenerArray = listeners[type];

		if (listenerArray !== undefined) {

			var index = listenerArray.indexOf(listener);

			if (index !== -1) {

				listenerArray.splice(index, 1);
			}
		}
	},

	dispatchEvent: function dispatchEvent(event) {

		if (this._listeners === undefined) return;

		var listeners = this._listeners;
		var listenerArray = listeners[event.type];

		if (listenerArray !== undefined) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;

			for (var i = 0; i < length; i++) {

				array[i] = listenerArray[i];
			}

			for (var i = 0; i < length; i++) {

				array[i].call(this, event);
			}
		}
	}

};

exports.default = EventDispatcher;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _WebGLRenderer = require('./WebGLRenderer.js');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _CanvasRenderer = require('./CanvasRenderer.js');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

var _autoDetectRenderer = require('./autoDetectRenderer.js');

var _autoDetectRenderer2 = _interopRequireDefault(_autoDetectRenderer);

var _shaderLib = require('./shaderLib.js');

var _shaderLib2 = _interopRequireDefault(_shaderLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	hasCanvas: _utils2.default.hasCanvas,
	hasWebGL: _utils2.default.hasWebGL,
	autoDetectRenderer: _autoDetectRenderer2.default,
	WebGLRenderer: _WebGLRenderer2.default,
	CanvasRenderer: _CanvasRenderer2.default,
	shaderLib: _shaderLib2.default

};
module.exports = exports['default'];

},{"./CanvasRenderer.js":1,"./WebGLRenderer.js":6,"./autoDetectRenderer.js":7,"./shaderLib.js":8,"./utils.js":9}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _EventDispatcher = require('./EventDispatcher.js');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rAF = function () {

	var lastTime = 0;

	if (!!window.requestAnimationFrame) {

		return window.requestAnimationFrame;
	} else {

		return function (callback, element) {

			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
}();

/**
 * Primitive Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 */

var Renderer = function () {
	function Renderer(images, params) {
		_classCallCheck(this, Renderer);

		this.count = 0;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning = params && params.running !== undefined ? params.running : true;
		this.inTranstion = false;
		this.duration = params && params.duration || 1000;
		this.interval = Math.max(params && params.interval || 5000, this.duration);
		this.isUpdated = true;
		this.domElement = params && params.canvas || document.createElement('canvas');
		this.images = [];

		images.forEach(function (image, i) {
			this.insert(image, i);
		}.bind(this));
	}

	Renderer.prototype.transition = function transition(to) {

		if (this.domElement.width != this.domElement.offsetWidth || this.domElement.height != this.domElement.offsetHeight) {
			this.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight);
		}

		//this.from.setImage( this.images[ this.count ] );
		this.from.setImage(this.to.image);

		if (to >= this.images.length) {
			this.to.setImage(); // Load a bland image
		} else {
			this.to.setImage(this.images[to]);
		}

		this.transitionStartTime = Date.now();
		this.startTime = Date.now();
		this.count = to;
		this.inTranstion = true;
		this.isUpdated = true;
		this.dispatchEvent({ type: 'transitionStart' });
	};

	Renderer.prototype.setSize = function setSize(w, h) {

		this.domElement.width = w;
		this.domElement.height = h;
		this.isUpdated = true;
	};

	// setEconomyMode ( state ) {

	// 	// TODO
	// 	// LINEAR_MIPMAP_LINEAR to low
	// 	// lowFPS
	// 	// and othres
	// 	this.isEconomyMode = state;

	// }

	Renderer.prototype.tick = function tick() {

		var next = 0;

		if (this.isRunning) {
			this.elapsedTime = Date.now() - this.startTime;
		}

		if (this.interval + this.duration < this.elapsedTime && this.isRunning) {
			next = this.getNext();
			this.transition(next);
			// transition start
		}

		rAF(this.tick.bind(this));

		if (this.isUpdated) {
			this.render();
		}
	};

	Renderer.prototype.render = function render() {};

	Renderer.prototype.play = function play() {

		var pauseElapsedTime = 0;

		if (this.isRunning) {
			return this;
		}

		pauseElapsedTime = Date.now() - this.pauseStartTime;
		this.startTime += pauseElapsedTime;
		this.isRunning = true;

		delete this._pauseStartTime;
		return this;
	};

	Renderer.prototype.pause = function pause() {

		if (!this.isRunning) {
			return this;
		}

		this.isRunning = false;
		this.pauseStartTime = Date.now();

		return this;
	};

	Renderer.prototype.getCurrent = function getCurrent() {

		return this.count;
	};

	Renderer.prototype.getNext = function getNext() {

		return this.count < this.images.length - 1 ? this.count + 1 : 0;
	};

	Renderer.prototype.getPrev = function getPrev() {

		return this.count !== 0 ? this.count - 1 : this.images.length;
	};

	Renderer.prototype.insert = function insert(image, order) {

		var src;
		var onload = function (e) {

			this.isUpdated = true;
			e.target.removeEventListener('load', onload);
		}.bind(this);

		if (image instanceof Image) {

			image.addEventListener('load', onload);
		} else if (typeof image === 'string') {

			src = image;
			image = new Image();
			image.addEventListener('load', onload);
			image.src = src;
		} else {

			image.addEventListener('load', onload);
			//return;
		}

		this.images.splice(order, 0, image);
	};

	Renderer.prototype.remove = function remove(order) {

		if (this.images.length === 1) {

			return;
		}

		this.images.splice(order, 1);
	};

	return Renderer;
}();

exports.default = Renderer;


_EventDispatcher2.default.prototype.apply(Renderer.prototype);
module.exports = exports['default'];

},{"./EventDispatcher.js":2}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _EventDispatcher = require('./EventDispatcher.js');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {Image} image HTMLImageElement
 * @param {WebGLRenderingContext} gl
 */

var WebGLTexture = function () {
	function WebGLTexture(image, gl) {
		_classCallCheck(this, WebGLTexture);

		if (image === undefined) {
			image = defaultImage;
		}

		this.image = image;

		if (!!gl && gl instanceof WebGLRenderingContext) {
			this.gl = gl;
			this.texture = gl.createTexture();
		};

		this.setImage(this.image);
	}

	WebGLTexture.prototype.isLoaded = function isLoaded() {

		return this.image !== undefined && this.image.naturalWidth !== 0 && defaultImage !== this.image;
	};

	WebGLTexture.prototype.onload = function onload() {

		var onload = function () {

			this.image.removeEventListener('load', onload);
			this.setImage(this.image);
		}.bind(this);

		if (this.isLoaded()) {

			this.setImage(this.image);
			return;
		}

		this.image.addEventListener('load', onload);
	};

	WebGLTexture.prototype.setImage = function setImage(image) {

		var _gl = this.gl;
		var _image;

		this.valid = true;
		if (image === undefined) {
			image = defaultImage;
			this.valid = false;
		}

		this.image = image;

		if (this.isLoaded()) {
			_image = this.image;
		} else {
			_image = defaultImage;
			this.onload();

			this.valid = false;
		}

		if (!_gl) {

			this.dispatchEvent({ type: 'updated' });
			return;
		}

		_gl.bindTexture(_gl.TEXTURE_2D, this.texture);
		_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
		_gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
		_gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image);
		_gl.bindTexture(_gl.TEXTURE_2D, null);

		this.dispatchEvent({ type: 'updated' });
	};

	return WebGLTexture;
}();

exports.default = WebGLTexture;


_EventDispatcher2.default.prototype.apply(WebGLTexture.prototype);
module.exports = exports['default'];

},{"./EventDispatcher.js":2}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _Renderer2 = require('./Renderer.js');

var _Renderer3 = _interopRequireDefault(_Renderer2);

var _Texture = require('./Texture.js');

var _Texture2 = _interopRequireDefault(_Texture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var vertexShaderSource = '\n\tattribute vec2 position;\n\n\tvoid main () { \n\t\tgl_Position =  vec4(position, 1., 1. );\n\t}\n\n';

/**
 * WebGL Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.effect
 */

var WebGLRenderer = function (_Renderer) {
	_inherits(WebGLRenderer, _Renderer);

	function WebGLRenderer(images, params) {
		_classCallCheck(this, WebGLRenderer);

		var _this = _possibleConstructorReturn(this, _Renderer.call(this, images, params));

		_this.context = _this.domElement.getContext('webgl') || _this.domElement.getContext('experimental-webgl');

		_this.resolution = new Float32Array([params && params.width || _this.domElement.width, params && params.height || _this.domElement.height]);

		_this.vertexShader = _this.context.createShader(_this.context.VERTEX_SHADER);
		_this.context.shaderSource(_this.vertexShader, vertexShaderSource);
		_this.context.compileShader(_this.vertexShader);
		_this.setEffect(params && params.effect || 'crossFade');

		_this.blank = _this.context.createTexture();
		_this.context.bindTexture(_this.context.TEXTURE_2D, _this.blank);
		_this.context.texImage2D(_this.context.TEXTURE_2D, 0, _this.context.RGBA, 256, 256, 0, _this.context.RGBA, _this.context.UNSIGNED_BYTE, null);
		_this.context.pixelStorei(_this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		_this.context.texParameteri(_this.context.TEXTURE_2D, _this.context.TEXTURE_WRAP_S, _this.context.CLAMP_TO_EDGE);
		_this.context.texParameteri(_this.context.TEXTURE_2D, _this.context.TEXTURE_WRAP_T, _this.context.CLAMP_TO_EDGE);
		_this.context.texParameteri(_this.context.TEXTURE_2D, _this.context.TEXTURE_MIN_FILTER, _this.context.NEAREST);

		_this.tick();

		return _this;
	}

	WebGLRenderer.prototype.setEffect = function setEffect(effectName, params) {

		var i = 0;
		var position;
		var FSSource = GLSlideshow.shaderLib[effectName].source;
		var uniforms = GLSlideshow.shaderLib[effectName].uniforms;

		if (this.program) {

			this.context.deleteTexture(this.from.texture);
			this.context.deleteTexture(this.to.texture);
			this.context.deleteBuffer(this.vertexBuffer);
			this.context.deleteShader(this.fragmentShader);
			this.context.deleteProgram(this.program);
		}

		this.fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
		this.context.shaderSource(this.fragmentShader, FSSource);
		this.context.compileShader(this.fragmentShader);

		this.program = this.context.createProgram();
		this.context.attachShader(this.program, this.vertexShader);
		this.context.attachShader(this.program, this.fragmentShader);
		this.context.linkProgram(this.program);
		this.context.useProgram(this.program);

		this.vertexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vertexBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), this.context.STATIC_DRAW);

		position = this.context.getAttribLocation(this.program, 'position');
		this.context.vertexAttribPointer(position, 2, this.context.FLOAT, false, 0, 0);
		this.context.enableVertexAttribArray(position);

		this.uniforms = {
			progress: this.context.getUniformLocation(this.program, 'progress'),
			resolution: this.context.getUniformLocation(this.program, 'resolution'),
			resolutionFrom: this.context.getUniformLocation(this.program, 'resolutionFrom'),
			resolutionTo: this.context.getUniformLocation(this.program, 'resolutionTo'),
			from: this.context.getUniformLocation(this.program, 'from'),
			to: this.context.getUniformLocation(this.program, 'to')
		};

		for (i in uniforms) {

			this.uniforms[i] = this.context.getUniformLocation(this.program, i);
			this.setUniform(i, uniforms[i].value, uniforms[i].type);
		}

		this.from = new _Texture2.default(this.images[this.count], this.context);
		this.to = new _Texture2.default(this.images[this.getNext()], this.context);

		this.from.addEventListener('updated', this.updateTexture.bind(this));
		this.to.addEventListener('updated', this.updateTexture.bind(this));

		this.setSize(this.resolution[0], this.resolution[1]);

		this.updateTexture();
	};

	WebGLRenderer.prototype.setUniform = function setUniform(key, value, type) {

		// TODO
		var uniformLocation = this.context.getUniformLocation(this.program, key);

		if (type === 'float') {

			this.context.uniform1f(uniformLocation, value);
		} else if (type === 'vec2') {

			// this.context.uniform2fv

		}
	};

	WebGLRenderer.prototype.updateTexture = function updateTexture() {

		this.context.uniform1f(this.uniforms.progress, 0);

		this.context.activeTexture(this.context.TEXTURE0);
		this.context.uniform1i(this.uniforms.from, 0);
		if (this.from.valid) {
			this.context.bindTexture(this.context.TEXTURE_2D, this.from.texture);

			if (this.from.image.tagName !== undefined && this.from.image.tagName === "VIDEO") {
				this.context.uniform2fv(this.uniforms.resolutionFrom, [this.from.image.videoWidth, this.from.image.videoHeight]);
			} else {
				this.context.uniform2fv(this.uniforms.resolutionFrom, [this.from.image.naturalWidth, this.from.image.naturalHeight]);
			}
		} else {
			this.context.uniform2fv(this.uniforms.resolutionFrom, this.resolution);
			this.context.bindTexture(this.context.TEXTURE_2D, this.blank);
		}

		this.context.activeTexture(this.context.TEXTURE1);
		this.context.uniform1i(this.uniforms.to, 1);
		if (this.to.valid) {
			this.context.bindTexture(this.context.TEXTURE_2D, this.to.texture);
			if (this.to.image.tagName !== undefined && this.to.image.tagName === "VIDEO") {
				this.context.uniform2fv(this.uniforms.resolutionTo, [this.to.image.videoWidth, this.to.image.videoHeight]);
			} else {
				this.context.uniform2fv(this.uniforms.resolutionTo, [this.to.image.naturalWidth, this.to.image.naturalHeight]);
			}
			this.isUpdated = true;
		} else {
			this.context.uniform2fv(this.uniforms.resolutionTo, this.resolution);
			this.context.bindTexture(this.context.TEXTURE_2D, this.blank);
		}
	};

	WebGLRenderer.prototype.setSize = function setSize(w, h) {

		_Renderer.prototype.setSize.call(this, w, h);

		this.domElement.width = w;
		this.domElement.height = h;
		this.resolution[0] = w;
		this.resolution[1] = h;
		this.context.viewport(0, 0, w, h);
		this.context.uniform2fv(this.uniforms.resolution, this.resolution);
		this.isUpdated = true;
	};

	WebGLRenderer.prototype.render = function render() {

		var transitionElapsedTime = 0;
		var progress = 1;

		if (this.inTranstion) {
			// Stop video
			if (this.from.image.tagName !== undefined && this.from.image.tagName === "VIDEO") {
				this.from.image.pause();
				this.from.image.currentTime = 0;
			}

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

			this.context.clearColor(0, 0, 0, 0); // Make background transparent
			this.context.uniform1f(this.uniforms.progress, progress);
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			this.context.drawArrays(this.context.TRIANGLES, 0, 6);
			this.context.flush();

			if (progress === 1) {

				// Start video
				if (this.to.image.tagName !== undefined && this.to.image.tagName === "VIDEO") {
					this.to.image.pause();
					this.to.image.currentTime = 0;
					this.to.image.play();
					this.to.needsUpdate = true;
				}

				this.inTranstion = false; // may move to tick()
				this.isUpdated = true;
				this.dispatchEvent({ type: 'transitionEnd' });
				// transitionEnd!
			}
		} else {

			this.context.clearColor(0, 0, 0, 0); // Make background transparent
			//this.context.uniform1f( this.uniforms.progress, 1 );
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

			// Load the video frames
			if (this.to.valid && this.to.image.tagName !== undefined && this.to.image.tagName === "VIDEO") {
				this.context.texSubImage2D(this.context.TEXTURE_2D, 0, 0, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.to.image);
			}

			this.context.drawArrays(this.context.TRIANGLES, 0, 6);
			this.context.flush();

			// Only stop rendering loop if not a video
			if (this.to.image.tagName !== undefined && this.to.image.tagName !== "VIDEO") {
				this.isUpdated = false;
			}
		}
	};

	WebGLRenderer.prototype.dispose = function dispose() {

		this.isRunning = false;
		this.inTranstion = false;

		this.tick = function () {};

		if (this.program) {

			this.context.activeTexture(this.context.TEXTURE0);
			this.context.bindTexture(this.context.TEXTURE_2D, null);
			this.context.activeTexture(this.context.TEXTURE1);
			this.context.bindTexture(this.context.TEXTURE_2D, null);
			this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
			// this.context.bindBuffer( this.context.ELEMENT_ARRAY_BUFFER, null );
			// this.context.bindRenderbuffer( this.context.RENDERBUFFER, null );
			// this.context.bindFramebuffer( this.context.FRAMEBUFFER, null );

			this.context.deleteTexture(this.from.texture);
			this.context.deleteTexture(this.to.texture);
			this.context.deleteBuffer(this.vertexBuffer);
			// this.context.deleteRenderbuffer( ... );
			// this.context.deleteFramebuffer( ... );
			this.context.deleteShader(this.vertexShader);
			this.context.deleteShader(this.fragmentShader);
			this.context.deleteProgram(this.program);
		}

		this.setSize(1, 1);

		if (!!this.domElement.parentNode) {

			this.domElement.parentNode.removeChild(this.domElement);
		}

		delete this.from;
		delete this.to;
		delete this.domElement;
	};

	return WebGLRenderer;
}(_Renderer3.default);

exports.default = WebGLRenderer;
module.exports = exports['default'];

},{"./Renderer.js":4,"./Texture.js":5}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports.default = function (images, params) {

	if (!_utils2.default.hasCanvas) {

		// your browser is not available both canvas and webgl
		return;
	}

	if (!_utils2.default.hasWebGL) {

		return new _CanvasRenderer2.default(images, params);
	}

	return new _WebGLRenderer2.default(images, params);
};

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _WebGLRenderer = require('./WebGLRenderer.js');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _CanvasRenderer = require('./CanvasRenderer.js');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

},{"./CanvasRenderer.js":1,"./WebGLRenderer.js":6,"./utils.js":9}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = {

	crossFade: {

		uniforms: {},
		source: '\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\t\t\tuniform sampler2D from, to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\n\t\t\tvoid main() {\n\t\t\t\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\t\t\t\t// gl_FragColor =texture2D( from, p );\n\t\t\t\t// gl_FragColor=texture2D( to, p );\n\t\t\t\tgl_FragColor = mix( texture2D( from, p ), texture2D( to, p ), progress );\n\n\t\t\t}\n\t\t'
	},

	crossZoom: {

		// by http://transitions.glsl.io/transition/b86b90161503a0023231

		uniforms: {
			strength: { value: 0.4, type: 'float' }
		},
		source: '\n\t\t\t// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag\n\t\t\t// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js\n\t\t\t// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib\n\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\t\t\tuniform sampler2D from, to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\t\t\tuniform vec2 resolutionFrom;\n\t\t\tuniform vec2 resolutionTo;\n\n\t\t\tuniform float strength;\n\n\t\t\tvarying vec2 vTextureCoord;\n\n\t\t\tconst float PI = 3.141592653589793;\n\n\t\t\tfloat Linear_ease(in float begin, in float change, in float duration, in float time) {\n\t\t\t\treturn change * time / duration + begin;\n\t\t\t}\n\n\t\t\tfloat Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {\n\t\t\t\tif (time == 0.0)\n\t\t\t\t\treturn begin;\n\t\t\t\telse if (time == duration)\n\t\t\t\t\treturn begin + change;\n\t\t\t\ttime = time / (duration / 2.0);\n\t\t\t\tif (time < 1.0)\n\t\t\t\t\treturn change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;\n\t\t\t\treturn change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;\n\t\t\t}\n\n\t\t\tfloat Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {\n\t\t\t\treturn -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;\n\t\t\t}\n\n\t\t\t/* random number between 0 and 1 */\n\t\t\tfloat random(in vec3 scale, in float seed) {\n\t\t\t\t/* use the fragment position for randomness */\n\t\t\t\treturn fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n\t\t\t}\n\n\t\t\tvec4 crossFade(in vec2 uv, in vec2 uv2, in float dissolve) {\n\t\t\t\tvec4 fromPixel = texture2D(from, uv);\n\t\t\t\tvec4 toPixel = texture2D(to, uv2);\n\n\t\t\t\t //Dont show pixels that are outside of the texture\n\t\t\t\tif ( uv.x > 1. || uv.y > 1. || uv.x < 0. || uv.y < 0. ) {\n\t\t\t\t\tfromPixel = vec4 (0, 0, 0, 1); // Black\n\t\t\t\t}\n\t\t\t\tif ( uv2.x > 1. || uv2.y > 1. || uv2.x < 0. || uv2.y < 0. ) {\n\t\t\t\t\ttoPixel = vec4 (0, 0, 0, 1); // Black\n\t\t\t\t}\n\n\t\t\t\treturn mix(fromPixel, toPixel, dissolve);\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\tvec2 texCoordFrom = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tvec2 texCoordTo = gl_FragCoord.xy / resolution.xy;\n\n\t\t\t\tfloat ratioFrom = resolutionFrom.y / resolutionFrom.x;\n\t\t\t\tfloat ratioTo = resolutionTo.y / resolutionTo.x;\n\t\t\t\tfloat ratio = resolution.y / resolution.x;\n\t\t\t\t//ratioFrom = 3000./2000.;\n\t\t\t\t//ratio =   300./200.;\n\n\t\t\t\tif (ratio<ratioFrom) { // Full width\n\t\t\t\t\tfloat stretch = (resolutionFrom.y / resolutionFrom.x) * (resolution.x / resolution.y) ;\n\t\t\t\t\ttexCoordFrom.x = (texCoordFrom.x - .5) + (.5/stretch);\n\t\t\t\t\ttexCoordFrom = texCoordFrom * vec2(stretch, 1.);\n\t\t\t\t} else { // Full height\n\t\t\t\t\tfloat stretch = (resolutionFrom.x / resolutionFrom.y) * (resolution.y / resolution.x) ;\n\t\t\t\t\ttexCoordFrom.y = (texCoordFrom.y - .5) + (.5/stretch);\n\t\t\t\t\ttexCoordFrom = texCoordFrom * vec2(1., stretch);\n\t\t\t\t}\n\n\t\t\t\tif (ratio<ratioTo) { // Horizontal view\n\t\t\t\t\tfloat stretch = (resolutionTo.y / resolutionTo.x) * (resolution.x / resolution.y);\n\t\t\t\t\ttexCoordTo.x = (texCoordTo.x - .5) + (.5/stretch);\n\t\t\t\t\ttexCoordTo = texCoordTo * vec2(stretch, 1.);\n\t\t\t\t} else { // Vertical view\n\t\t\t\t\tfloat stretch = (resolutionTo.x / resolutionTo.y) * (resolution.y / resolution.x) ;\n\t\t\t\t\ttexCoordTo.y = (texCoordTo.y - .5) + (.5/stretch);\n\t\t\t\t\ttexCoordTo = texCoordTo * vec2(1., stretch);\n\t\t\t\t}\n\n\t\t\t\t// Linear interpolate center across center half of the image\n\t\t\t\tvec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);\n\t\t\t\tfloat dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress) ;\n\n\t\t\t\t// Mirrored sinusoidal loop. 0->strength then strength->0\n\t\t\t\tfloat strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);\n\n\t\t\t\tvec4 color = vec4(0.0);\n\t\t\t\tfloat total = 0.0;\n\t\t\t\tvec2 toCenterFrom = center - texCoordFrom;\n\t\t\t\tvec2 toCenterTo = center - texCoordTo;\n\n\t\t\t\t/* randomize the lookup values to hide the fixed number of samples */\n\t\t\t\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n\t\t\t\tfor (float t = 0.0; t <= 40.0; t++) {\n\t\t\t\t\tfloat percent = (t + offset) / 40.0;\n\t\t\t\t\tfloat weight = 4.0 * (percent - percent * percent);\n\t\t\t\t\tcolor += crossFade(\n\t\t\t\t\t\ttexCoordFrom + toCenterFrom * percent * strength,\n\t\t\t\t\t\ttexCoordTo + toCenterTo * percent * strength, \n\t\t\t\t\t\tdissolve\n\t\t\t\t\t) * weight;\n\t\t\t\t\ttotal += weight;\n\t\t\t\t}\n\t\t\t\t//gl_FragColor = vec4(color / total, 1);\n\t\t\t\tgl_FragColor = color / total;\n\t\t\t}\n\t\t'
	},

	cube: {

		// by http://transitions.glsl.io/transition/ee15128c2b87d0e74dee

		uniforms: {
			persp: { value: 0.7, type: 'float' },
			unzoom: { value: 0.3, type: 'float' },
			reflection: { value: 0.4, type: 'float' },
			floating: { value: 3, type: 'float' }
		},
		source: '\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\t\t\tuniform sampler2D from, to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\n\t\t\tuniform float persp;\n\t\t\tuniform float unzoom;\n\t\t\tuniform float reflection;\n\t\t\tuniform float floating;\n\n\t\t\tvec2 project (vec2 p) {\n\t\t\t\treturn p * vec2(1.0, -1.2) + vec2(0.0, -floating/100.);\n\t\t\t}\n\n\t\t\tbool inBounds (vec2 p) {\n\t\t\t\treturn all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));\n\t\t\t}\n\n\t\t\tvec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {\n\t\t\t\tvec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n\t\t\t\tpfr = project(pfr);\n\t\t\t\tif (inBounds(pfr)) {\n\t\t\t\t\tc += mix(vec4(0.0), texture2D(from, pfr), reflection * mix(1.0, 0.0, pfr.y));\n\t\t\t\t}\n\t\t\t\tpto = project(pto);\n\t\t\t\tif (inBounds(pto)) {\n\t\t\t\t\tc += mix(vec4(0.0), texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));\n\t\t\t\t}\n\t\t\t\treturn c;\n\t\t\t}\n\n\t\t\t// p : the position\n\t\t\t// persp : the perspective in [ 0, 1 ]\n\t\t\t// center : the xcenter in [0, 1]  0.5 excluded\n\t\t\tvec2 xskew (vec2 p, float persp, float center) {\n\t\t\t\tfloat x = mix(p.x, 1.0-p.x, center);\n\t\t\t\treturn (\n\t\t\t\t\t(\n\t\t\t\t\t\tvec2( x, (p.y - 0.5*(1.0-persp) * x) / (1.0+(persp-1.0)*x) )\n\t\t\t\t\t\t- vec2(0.5-distance(center, 0.5), 0.0)\n\t\t\t\t\t)\n\t\t\t\t\t* vec2(0.5 / distance(center, 0.5) * (center<0.5 ? 1.0 : -1.0), 1.0)\n\t\t\t\t\t+ vec2(center<0.5 ? 0.0 : 1.0, 0.0)\n\t\t\t\t);\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\tvec2 op = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tfloat uz = unzoom * 2.0*(0.5-distance(0.5, progress));\n\t\t\t\tvec2 p = -uz*0.5+(1.0+uz) * op;\n\t\t\t\tvec2 fromP = xskew(\n\t\t\t\t\t(p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0),\n\t\t\t\t\t1.0-mix(progress, 0.0, persp),\n\t\t\t\t\t0.0\n\t\t\t\t);\n\t\t\t\tvec2 toP = xskew(\n\t\t\t\t\tp / vec2(progress, 1.0),\n\t\t\t\t\tmix(pow(progress, 2.0), 1.0, persp),\n\t\t\t\t\t1.0\n\t\t\t\t);\n\t\t\t\tif (inBounds(fromP)) {\n\t\t\t\t\tgl_FragColor = texture2D(from, fromP);\n\t\t\t\t}\n\t\t\t\telse if (inBounds(toP)) {\n\t\t\t\t\tgl_FragColor = texture2D(to, toP);\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\tgl_FragColor = bgColor(op, fromP, toP);\n\t\t\t\t}\n\t\t\t}\n\t\t'
	},

	wind: {

		// by http://transitions.glsl.io/transition/7de3f4b9482d2b0bf7bb

		uniforms: {
			size: { value: 0.2, type: 'float' }
		},
		source: '\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\n\t\t\t// General parameters\n\t\t\tuniform sampler2D from;\n\t\t\tuniform sampler2D to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\n\t\t\t// Custom parameters\n\t\t\tuniform float size;\n\n\t\t\tfloat rand (vec2 co) {\n\t\t\t\treturn fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tfloat r = rand(vec2(0, p.y));\n\t\t\t\tfloat m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));\n\t\t\t\tgl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n\t\t\t}\n\t\t'
	},

	ripple: {

		// by http://transitions.glsl.io/transition/94ffa2725b65aa8b9979

		uniforms: {
			amplitude: { value: 100, type: 'float' },
			speed: { value: 50, type: 'float' }
		},
		source: '\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\n\t\t\t// General parameters\n\t\t\tuniform sampler2D from;\n\t\t\tuniform sampler2D to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\n\t\t\tuniform float amplitude;\n\t\t\tuniform float speed;\n\n\t\t\tvoid main()\n\t\t\t{\n\t\t\t\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\t\t\t\tvec2 dir = p - vec2(.5);\n\t\t\t\tfloat dist = length(dir);\n\t\t\t\tvec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30.;\n\t\t\t\tgl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), smoothstep(0.2, 1.0, progress));\n\t\t\t}\n\t\t'
	},

	pageCurl: {

		// by http://transitions.glsl.io/transition/166e496a19a4fdbf1aae

		uniforms: {},
		source: '\n\t\t\t#ifdef GL_ES\n\t\t\tprecision highp float;\n\t\t\t#endif\n\t\t\tuniform sampler2D from, to;\n\t\t\tuniform float progress;\n\t\t\tuniform vec2 resolution;\n\n\t\t\t// Adapted by Sergey Kosarevsky from:\n\t\t\t// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html\n\n\t\t\t/*\n\t\t\tCopyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.\n\n\t\t\tRedistribution and use in source and binary forms, with or without\n\t\t\tmodification, are permitted provided that the following conditions are\n\t\t\tmet:\n\n\t\t\t   * Redistributions of source code must retain the above copyright\n\t\t\t\t notice, this list of conditions and the following disclaimer.\n\t\t\t   * Redistributions in binary form must reproduce the above\n\t\t\t\t copyright notice, this list of conditions and the following disclaimer\n\t\t\t\t in the documentation and/or other materials provided with the\n\t\t\t\t distribution.\n\t\t\t   * Neither the name of Hewlett-Packard nor the names of its\n\t\t\t\t contributors may be used to endorse or promote products derived from\n\t\t\t\t this software without specific prior written permission.\n\n\t\t\tTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\t\t\t"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n\t\t\tLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n\t\t\tA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n\t\t\tOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n\t\t\tSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n\t\t\tLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n\t\t\tDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n\t\t\tTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n\t\t\t(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n\t\t\tOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\t\t\tin vec2 texCoord;\n\t\t\t*/\n\n\t\t\tconst float MIN_AMOUNT = -0.16;\n\t\t\tconst float MAX_AMOUNT = 1.3;\n\t\t\tfloat amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;\n\n\t\t\tconst float PI = 3.141592653589793;\n\n\t\t\tconst float scale = 512.0;\n\t\t\tconst float sharpness = 3.0;\n\n\t\t\tfloat cylinderCenter = amount;\n\t\t\t// 360 degrees * amount\n\t\t\tfloat cylinderAngle = 2.0 * PI * amount;\n\n\t\t\tconst float cylinderRadius = 1.0 / PI / 2.0;\n\n\t\t\tvec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)\n\t\t\t{\n\t\t\t\tfloat hitPoint = hitAngle / (2.0 * PI);\n\t\t\t\tpoint.y = hitPoint;\n\t\t\t\treturn rrotation * point;\n\t\t\t}\n\n\t\t\tvec4 antiAlias(vec4 color1, vec4 color2, float distanc)\n\t\t\t{\n\t\t\t\tdistanc *= scale;\n\t\t\t\tif (distanc < 0.0) return color2;\n\t\t\t\tif (distanc > 2.0) return color1;\n\t\t\t\tfloat dd = pow(1.0 - distanc / 2.0, sharpness);\n\t\t\t\treturn ((color2 - color1) * dd) + color1;\n\t\t\t}\n\n\t\t\tfloat distanceToEdge(vec3 point)\n\t\t\t{\n\t\t\t\tfloat dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);\n\t\t\t\tfloat dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);\n\t\t\t\tif (point.x < 0.0) dx = -point.x;\n\t\t\t\tif (point.x > 1.0) dx = point.x - 1.0;\n\t\t\t\tif (point.y < 0.0) dy = -point.y;\n\t\t\t\tif (point.y > 1.0) dy = point.y - 1.0;\n\t\t\t\tif ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);\n\t\t\t\treturn min(dx, dy);\n\t\t\t}\n\n\t\t\tvec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)\n\t\t\t{\n\t\t\t\tfloat hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);\n\t\t\t\tvec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);\n\t\t\t\tif (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))\n\t\t\t\t{\n\t\t\t\t  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\t\t\t\treturn texture2D(to, texCoord);\n\t\t\t\t}\n\n\t\t\t\tif (yc > 0.0) return texture2D(from, p);\n\n\t\t\t\tvec4 color = texture2D(from, point.xy);\n\t\t\t\tvec4 tcolor = vec4(0.0);\n\n\t\t\t\treturn antiAlias(color, tcolor, distanceToEdge(point));\n\t\t\t}\n\n\t\t\tvec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)\n\t\t\t{\n\t\t\t\tfloat shadow = distanceToEdge(point) * 30.0;\n\t\t\t\tshadow = (1.0 - shadow) / 3.0;\n\n\t\t\t\tif (shadow < 0.0) shadow = 0.0; else shadow *= amount;\n\n\t\t\t\tvec4 shadowColor = seeThrough(yc, p, rotation, rrotation);\n\t\t\t\tshadowColor.r -= shadow;\n\t\t\t\tshadowColor.g -= shadow;\n\t\t\t\tshadowColor.b -= shadow;\n\n\t\t\t\treturn shadowColor;\n\t\t\t}\n\n\t\t\tvec4 backside(float yc, vec3 point)\n\t\t\t{\n\t\t\t\tvec4 color = texture2D(from, point.xy);\n\t\t\t\tfloat gray = (color.r + color.b + color.g) / 15.0;\n\t\t\t\tgray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));\n\t\t\t\tcolor.rgb = vec3(gray);\n\t\t\t\treturn color;\n\t\t\t}\n\n\t\t\tvec4 behindSurface(float yc, vec3 point, mat3 rrotation)\n\t\t\t{\n\t\t\t\tfloat shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;\n\t\t\t\tshado *= 1.0 - abs(point.x - 0.5);\n\n\t\t\t\tyc = (-cylinderRadius - cylinderRadius - yc);\n\n\t\t\t\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\t\t\t\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\t\t\t\tif (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))\n\t\t\t\t{\n\t\t\t\t\tshado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0));\n\t\t\t\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\t\t\t\tshado *= 0.5;\n\t\t\t\t}\n\t\t\t\telse\n\t\t\t\t{\n\t\t\t\t\tshado = 0.0;\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n\t\t\t\treturn vec4(texture2D(to, texCoord).rgb - shado, 1.0);\n\t\t\t}\n\n\t\t\tvoid main()\n\t\t\t{\n\t\t\t\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\t\t\t\n\t\t\t\tconst float angle = 30.0 * PI / 180.0;\n\t\t\t\tfloat c = cos(-angle);\n\t\t\t\tfloat s = sin(-angle);\n\n\t\t\t\tmat3 rotation = mat3( c, s, 0,\n\t\t\t\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t\t\t\t0.12, 0.258, 1\n\t\t\t\t\t\t\t\t\t\t\t);\n\t\t\t\tc = cos(angle);\n\t\t\t\ts = sin(angle);\n\n\t\t\t\tmat3 rrotation = mat3(\tc, s, 0,\n\t\t\t\t\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t\t\t\t\t0.15, -0.5, 1\n\t\t\t\t\t\t\t\t\t\t\t);\n\n\t\t\t\tvec3 point = rotation * vec3(texCoord, 1.0);\n\n\t\t\t\tfloat yc = point.y - cylinderCenter;\n\n\t\t\t\tif (yc < -cylinderRadius)\n\t\t\t\t{\n\t\t\t\t\t// Behind surface\n\t\t\t\t\tgl_FragColor = behindSurface(yc, point, rrotation);\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tif (yc > cylinderRadius)\n\t\t\t\t{\n\t\t\t\t\t// Flat surface\n\t\t\t\t\tgl_FragColor = texture2D(from, texCoord);\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\n\t\t\t\tfloat hitAngleMod = mod(hitAngle, 2.0 * PI);\n\t\t\t\tif ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))\n\t\t\t\t{\n\t\t\t\t\tgl_FragColor = seeThrough(yc, texCoord, rotation, rrotation);\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\t\t\t\tif (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)\n\t\t\t\t{\n\t\t\t\t\tgl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tvec4 color = backside(yc, point);\n\n\t\t\t\tvec4 otherColor;\n\t\t\t\tif (yc < 0.0)\n\t\t\t\t{\n\t\t\t\t\tfloat shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);\n\t\t\t\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\t\t\t\tshado *= 0.5;\n\t\t\t\t\totherColor = vec4(0.0, 0.0, 0.0, shado);\n\t\t\t\t}\n\t\t\t\telse\n\t\t\t\t{\n\t\t\t\t\totherColor = texture2D(from, texCoord);\n\t\t\t\t}\n\n\t\t\t\tcolor = antiAlias(color, otherColor, cylinderRadius - abs(yc));\n\n\t\t\t\tvec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\t\t\t\tfloat dist = distanceToEdge(point);\n\n\t\t\t\tgl_FragColor = antiAlias(color, cl, dist);\n\t\t\t}\n\t\t'
	}
};
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = {

	hasCanvas: function () {

		var canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	}(),

	hasWebGL: function () {

		try {

			var canvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch (e) {

			return false;
		}
	}()

};
module.exports = exports['default'];

},{}]},{},[3])(3)
});