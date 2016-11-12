import EventDispatcher from './EventDispatcher.js';

var rAF = function () {

	var lastTime = 0;

	if ( !!window.requestAnimationFrame ) {

		return window.requestAnimationFrame;

	} else {

		return function( callback, element ) {

			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = setTimeout(
				function() { callback( currTime + timeToCall ); }, 
				timeToCall
			);
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

export default class Renderer {

	constructor ( images, params ) {

		this.count = -1;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning   = (params && params.running !== undefined) ? params.running : true;
		this.inTranstion = false;
		this.duration = params && params.duration || 1000;
		this.interval = Math.max( params && params.interval || 5000, this.duration );
		this.isUpdated = true;
		this.domElement = params && params.canvas || document.createElement( 'canvas' );
		this.images = [];

		images.forEach( function ( image, i ) { this.insert( image, i ); }.bind( this ) );

	}

	transition ( to ) {


		if ( this.domElement.width != this.domElement.offsetWidth || this.domElement.height != this.domElement.offsetHeight ) {
			this.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight);
		}

		//this.from.setImage( this.images[ this.count ] );
		this.from.setImage( this.to.image );

		if (to >= this.images.length ) {
			this.to.setImage(); // Load a bland image
		} else {
			this.to.setImage( this.images[ to ] );
		}

		this.transitionStartTime = Date.now();
		this.startTime = Date.now();
		this.count = to;
		this.inTranstion = true;
		this.isUpdated = true;
		this.dispatchEvent( { type: 'transitionStart' } );

	}

	setSize ( w, h ) {

		this.domElement.width  = w;
		this.domElement.height = h;
		this.isUpdated = true;

	}

	// setEconomyMode ( state ) {

	// 	// TODO
	// 	// LINEAR_MIPMAP_LINEAR to low
	// 	// lowFPS
	// 	// and othres
	// 	this.isEconomyMode = state;

	// }

	tick () {

		var next = 0;

		if ( this.isRunning ) {
			this.elapsedTime = Date.now() - this.startTime;
		}

		if ( this.interval + this.duration < this.elapsedTime && this.isRunning ) {
			next = this.getNext();
			this.transition( next );
			// transition start
		}

		rAF( this.tick.bind( this ) );

		if ( this.isUpdated ) { this.render(); }

	}

	render () {}

	play () {

		var pauseElapsedTime = 0;

		if ( this.isRunning ) { return this; }

		pauseElapsedTime = Date.now() - this.pauseStartTime;
		this.startTime += pauseElapsedTime;
		this.isRunning = true;

		delete this._pauseStartTime;
		return this;

	}

	pause () {

		if ( !this.isRunning ) { return this; }

		this.isRunning = false;
		this.pauseStartTime = Date.now();

		return this;

	}

	getCurrent () {

		return this.count;

	}

	getNext () {

		return ( this.count < this.images.length - 1 ) ? this.count + 1 : 0;

	}

	getPrev () {

		return ( this.count !== 0 ) ? this.count - 1 : this.images.length;

	}

	insert ( image, order ) {

		var src;
		var onload = function ( e ) {

			this.isUpdated = true;
			e.target.removeEventListener( 'load', onload );

		}.bind( this );

		if ( image instanceof Image ) {

			image.addEventListener( 'load', onload );

		} else if ( typeof image === 'string' ) {

			src = image;
			image = new Image();
			image.addEventListener( 'load', onload );
			image.src = src;

		} else {

			image.addEventListener( 'load', onload );
			//return;

		}

		this.images.splice( order, 0, image );

		return image;
	}

	remove ( order ) {
		if ( this.images.length === 0 ) {
			return;
		}

		this.images.splice( order, 1 );
	}
}

EventDispatcher.prototype.apply( Renderer.prototype );
