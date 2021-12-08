/*! Source code licensed under Apache License 2.0. Copyright © 2021-current William Ngan and contributors. (https://github.com/williamngan/pts) */

/**
 * [experimental] These classes support node-canvas drawing using the Pts library (https://ptsjs.org).
 */

 const { Bound, CanvasForm, Util, Pt } = require("pts");
 const { createCanvas } = require("canvas");
 const fs = require('fs');
 
 
 /**
  * The basic function of CanvasForm should work as is for node-canvas. 
  * Note that the text, image, and filter functions are yet to be implemented
  */
 class NodeCanvasForm extends CanvasForm {
   constructor( ctx ) {
     super(undefined);
 
     this._ctx = ctx;
     this._ctx.fillStyle = this._style.fillStyle;
     this._ctx.strokeStyle = this._style.strokeStyle;    
     this._ctx.lineJoin = "bevel";
     this._ctx.font = this._font.value;
     this._ready = true;
   }
 }
 
 
 /**
  * NodePtsSpace maps to the API of Pts' Space class. Please refers to the `Space` documentation in ptsjs.org.
  * This is a very basic implementation. Some features are missing. 
  */
 class NodePtsSpace {
   
   _canvas;
   _bgcolor = "#e1e9f0";
   _ctx;
   _size;
 
   bound = new Bound();
   players = {};
   playerCount = 0;
 
   constructor(...args) {
     this._size = new Pt( (args.length>0) ? Util.getArgs(args) : [500,500] );
     this.bound = Bound.fromArray( [[0,0], this._size.clone()] );
   }
   
   setup( opt ) {
     this._bgcolor = opt.bgcolor ? opt.bgcolor : "transparent";
     return this;
   }
 
   getForm() { return new NodeCanvasForm( this._ctx ); }
   
   get ctx() { return this._ctx; }
 
   get size() { return this._size; }
 
   get center() { return this._size.$divide(2); }
 
   get innerBound() { return this.bound; }
 
   get outerBound() { return this.bound; }
 
   get width() { return this._size.x; }
 
   get heigght() { return this._size.y; }
 
   get pointer() { return this.center; }
 
   get ready() { return true; }
 
   get background() { return this._bgcolor; }
 
   get pixelScale() { return 1; }
 
   get element() { return this._canvas; }
 
   get canvas() { return this._canvas; }
 
   
   clear( bg ) {
     
     if (bg) this._bgcolor = bg;
     const lastColor = this._ctx.fillStyle;
     
     if (!this._bgcolor || this._bgcolor === "transparent") {
       this._ctx.clearRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
     } else { 
       // semi-transparent bg needs to be cleared first
       if (this._bgcolor.indexOf("rgba") === 0 || (this._bgcolor.length === 9 && this._bgcolor.indexOf("#") === 0) )  { 
         this._ctx.clearRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
       }
       this._ctx.fillStyle = this._bgcolor;
       this._ctx.fillRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
     }
     
     this._ctx.fillStyle = lastColor;
     return this;
   }
   
   playItems( time ) {
     this.clear();
     for (let k in this.players) {
       if (this.players[k]) {
         // @ts-ignore
         this.players[k].animate( time, 1, this );
       }
     }
   }
 
   add( p ) {
     let player = (typeof p == "function") ? { animate: p } : p;
     
     let k = this.playerCount++;
     let pid = this.id + k;
     
     this.players[pid] = player;
     player.animateID = pid;
     if (player.resize && this.bound.inited) player.resize( this.bound ); 
         
     return this;
   }
 
   /**
    * Return a data url which can be used in <img src="..." />
    */
   toDataURL() {
     this.playItems(0);
     return this._canvas.toDataURL();
   }
 
 }
 
 
 /**
  * NodeCanvasSpace maps to the API of Pts' CanvasSpace class. Please refers to the `CanvasSpace` documentation in ptsjs.org.
  * This is a very basic implementation. Some features are missing. 
  */
 class NodeCanvasSpace extends NodePtsSpace {
   constructor(...args) {
     super(...args);
     this._canvas = createCanvas( this._size[0], this._size[1] );
     this._ctx = this._canvas.getContext('2d');
   }
 
 
   /**
    * Save as a png file
    * @param {*} path 
    * @param {*} options 
    * @returns 
    */
   toPNG( path, options={compressionLevel: 5} ) {
     if (!path) {
       console.error("Please specify a path to the file. Eg, ./test.png");
       return;
     }
     this.playItems(0);
     const out = fs.createWriteStream( path )
     const stream = this._canvas.createPNGStream( options )
     stream.pipe(out)
     out.on('finish', () =>  console.log(`PNG file saved in ${path}`));
   }
 
   toJPG( path, options={quality: 0.95, chromaSubsampling: false} ) {
     if (!path) {
       console.error("Please specify a path to the file. Eg, ./test.jpg");
       return;
     }
     this.playItems(0);
     const out = fs.createWriteStream( path )
     const stream = this._canvas.createJPEGStream( options )
     stream.pipe(out)
     out.on('finish', () =>  console.log(`JPG file saved in ${path}`));
   }
 }
 
 
 /**
  * NodeSVGSpace maps to the API of Pts' CanvasSpace class but will use node-canvas to generate SVG. Please refers to the `CanvasSpace` documentation in ptsjs.org.
  * This is a very basic implementation. Some features are missing. 
  */
 class NodeSVGSpace extends NodePtsSpace {
   constructor(...args) {
     super(...args);
     this._canvas = createCanvas( this._size[0], this._size[1], 'svg' );
     this._ctx = this._canvas.getContext('2d');
   }
 
   toSVG( path ) {
     if (!path) {
       console.error("Please specify a path to the file. Eg, ./test.svg");
       return;
     }
     this.playItems(0);
     fs.writeFileSync(path, this._canvas.toBuffer());
     console.log(`SVG file saved in ${path}` )
   }
 }
 
 module.exports = { NodeCanvasForm, NodeCanvasSpace, NodeSVGSpace, NodePtsSpace }