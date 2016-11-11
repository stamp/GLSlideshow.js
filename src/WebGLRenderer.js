import Renderer from './Renderer.js';
import Texture  from './Texture.js';

var vertexShaderSource = `
	attribute vec2 position;

	void main () { 
		gl_Position =  vec4(position, 1., 1. );
	}

`;

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

export default class WebGLRenderer extends Renderer {

	constructor ( images, params ) {

		super( images, params );

		this.context = this.domElement.getContext( 'webgl' ) ||
		               this.domElement.getContext( 'experimental-webgl' );

		this.resolution = new Float32Array( [
			params && params.width  || this.domElement.width,
			params && params.height || this.domElement.height
		] );

		this.vertexShader = this.context.createShader( this.context.VERTEX_SHADER );
		this.context.shaderSource( this.vertexShader, vertexShaderSource );
		this.context.compileShader( this.vertexShader );
		this.setEffect( params && params.effect || 'crossFade' );

		this.blank = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, this.blank);
		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, 256, 256, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, null);
		this.context.pixelStorei( this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);

		this.tick();

	}

	setEffect ( effectName, params ) {

		var i = 0;
		var position;
		var FSSource = GLSlideshow.shaderLib[ effectName ].source;
		var uniforms = GLSlideshow.shaderLib[ effectName ].uniforms;

		if ( this.program ) {

			this.context.deleteTexture( this.from.texture );
			this.context.deleteTexture( this.to.texture );
			this.context.deleteBuffer( this.vertexBuffer );
			this.context.deleteShader( this.fragmentShader );
			this.context.deleteProgram( this.program );

		}

		this.fragmentShader = this.context.createShader( this.context.FRAGMENT_SHADER );
		this.context.shaderSource( this.fragmentShader, FSSource );
		this.context.compileShader( this.fragmentShader );

		this.program = this.context.createProgram();
		this.context.attachShader( this.program, this.vertexShader );
		this.context.attachShader( this.program, this.fragmentShader );
		this.context.linkProgram( this.program );
		this.context.useProgram( this.program );

		this.vertexBuffer = this.context.createBuffer();
		this.context.bindBuffer( this.context.ARRAY_BUFFER, this.vertexBuffer );
		this.context.bufferData( this.context.ARRAY_BUFFER, new Float32Array( [
			- 1.0, - 1.0,
			  1.0, - 1.0,
			- 1.0,   1.0,
			  1.0, - 1.0,
			  1.0,   1.0,
			- 1.0,   1.0
		] ), this.context.STATIC_DRAW );

		position = this.context.getAttribLocation( this.program, 'position' );
		this.context.vertexAttribPointer( position, 2, this.context.FLOAT, false, 0, 0 );
		this.context.enableVertexAttribArray( position );

		this.uniforms = {
			progress  : this.context.getUniformLocation( this.program, 'progress' ),
			resolution: this.context.getUniformLocation( this.program, 'resolution' ),
			resolutionFrom: this.context.getUniformLocation( this.program, 'resolutionFrom' ),
			resolutionTo: this.context.getUniformLocation( this.program, 'resolutionTo' ),
			from      : this.context.getUniformLocation( this.program, 'from' ),
			to        : this.context.getUniformLocation( this.program, 'to' )
		};

		for ( i in uniforms ) {

			this.uniforms[ i ] = this.context.getUniformLocation( this.program, i );
			this.setUniform(
				i,
				uniforms[ i ].value,
				uniforms[ i ].type
			);

		}

		this.from = new Texture( this.images[ this.count     ], this.context );
		this.to   = new Texture( this.images[ this.getNext() ], this.context );

		this.from.addEventListener( 'updated', this.updateTexture.bind( this ) );
		this.to.addEventListener  ( 'updated', this.updateTexture.bind( this ) );

		this.setSize( this.resolution[ 0 ], this.resolution[ 1 ] );

		this.updateTexture();

	}

	setUniform ( key, value, type ) {

		// TODO
		var uniformLocation = this.context.getUniformLocation( this.program, key );

		if ( type === 'float' ) {

			this.context.uniform1f( uniformLocation, value );

		} else if ( type === 'vec2' ) {

			// this.context.uniform2fv

		}

	}

	updateTexture () {

		this.context.uniform1f( this.uniforms.progress, 0 );

		this.context.activeTexture( this.context.TEXTURE0 );
		this.context.uniform1i( this.uniforms.from, 0 );
		if ( this.from.valid ) {
			this.context.bindTexture( this.context.TEXTURE_2D, this.from.texture );

			if ( this.from.image.tagName !== undefined && this.from.image.tagName === "VIDEO" ) {
				this.context.uniform2fv( this.uniforms.resolutionFrom, [this.from.image.videoWidth, this.from.image.videoHeight] ) 
			} else {
				this.context.uniform2fv( this.uniforms.resolutionFrom, [this.from.image.naturalWidth, this.from.image.naturalHeight] ) 
			}
		} else {
			this.context.uniform2fv( this.uniforms.resolutionFrom, this.resolution) 
			this.context.bindTexture( this.context.TEXTURE_2D, this.blank);
		}

		this.context.activeTexture( this.context.TEXTURE1 );
		this.context.uniform1i( this.uniforms.to, 1 );
		if ( this.to.valid ) {
			this.context.bindTexture( this.context.TEXTURE_2D, this.to.texture );
			if ( this.to.image.tagName !== undefined &&this.to.image.tagName === "VIDEO" ) {
				this.context.uniform2fv( this.uniforms.resolutionTo, [this.to.image.videoWidth,  this.to.image.videoHeight] );
			} else {
				this.context.uniform2fv( this.uniforms.resolutionTo, [this.to.image.naturalWidth, this.to.image.naturalHeight] ) 
			}
			this.isUpdated = true;
		} else {
			this.context.uniform2fv( this.uniforms.resolutionTo, this.resolution) 
			this.context.bindTexture( this.context.TEXTURE_2D, this.blank);
		}
	}

	setSize ( w, h ) {

		super.setSize( w, h );

		this.domElement.width  = w;
		this.domElement.height = h;
		this.resolution[ 0 ] = w;
		this.resolution[ 1 ] = h;
		this.context.viewport( 0, 0, w, h );
		this.context.uniform2fv( this.uniforms.resolution, this.resolution );
		this.isUpdated = true;

	}

	render () {

		var transitionElapsedTime = 0;
		var progress = 1;

		if ( this.inTranstion ) {
			// Stop video
			if ( this.from.image.tagName !== undefined && this.from.image.tagName === "VIDEO" ) {
				this.from.image.pause();
				this.from.image.currentTime = 0;
			}

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min( transitionElapsedTime / this.duration, 1 ) : 0;

			this.context.clearColor( 0, 0, 0, 0 ); // Make background transparent
			this.context.uniform1f( this.uniforms.progress, progress );
			this.context.clear( this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT );
			this.context.drawArrays( this.context.TRIANGLES, 0, 6 );
			this.context.flush();

			if ( progress === 1 ) {

				// Start video
				if ( this.to.image.tagName !== undefined && this.to.image.tagName === "VIDEO" ) {
					this.to.image.pause();
					this.to.image.currentTime = 0;
					this.to.image.play();
					this.to.needsUpdate = true;
				}

				this.inTranstion = false; // may move to tick()
				this.isUpdated = true;
				this.dispatchEvent( { type: 'transitionEnd' } );
				// transitionEnd!

			}

		} else {

			this.context.clearColor( 0, 0, 0, 0 ); // Make background transparent
			//this.context.uniform1f( this.uniforms.progress, 1 );
			this.context.clear( this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT );

			// Load the video frames
			if ( this.to.valid && this.to.image.tagName !== undefined && this.to.image.tagName === "VIDEO" ) {
				this.context.texSubImage2D(
					this.context.TEXTURE_2D, 0, 0, 0, this.context.RGBA,
					this.context.UNSIGNED_BYTE, this.to.image
				);
			}

			this.context.drawArrays( this.context.TRIANGLES, 0, 6 );
			this.context.flush();

			// Only stop rendering loop if not a video
			if ( this.to.image.tagName !== undefined && this.to.image.tagName !== "VIDEO" ) {
				this.isUpdated = false;
			}
		}

	}

	dispose () {

		this.isRunning   = false;
		this.inTranstion = false;

		this.tick = function () {}

		if ( this.program ) {

			this.context.activeTexture( this.context.TEXTURE0 );
			this.context.bindTexture( this.context.TEXTURE_2D, null );
			this.context.activeTexture( this.context.TEXTURE1 );
			this.context.bindTexture( this.context.TEXTURE_2D, null );
			this.context.bindBuffer( this.context.ARRAY_BUFFER, null );
			// this.context.bindBuffer( this.context.ELEMENT_ARRAY_BUFFER, null );
			// this.context.bindRenderbuffer( this.context.RENDERBUFFER, null );
			// this.context.bindFramebuffer( this.context.FRAMEBUFFER, null );

			this.context.deleteTexture( this.from.texture );
			this.context.deleteTexture( this.to.texture );
			this.context.deleteBuffer( this.vertexBuffer );
			// this.context.deleteRenderbuffer( ... );
			// this.context.deleteFramebuffer( ... );
			this.context.deleteShader( this.vertexShader );
			this.context.deleteShader( this.fragmentShader );
			this.context.deleteProgram( this.program );

		}

		this.setSize( 1, 1 );

		if ( !!this.domElement.parentNode ) {

			this.domElement.parentNode.removeChild( this.domElement );

		}

		delete this.from;
		delete this.to;
		delete this.domElement;

	}

}
