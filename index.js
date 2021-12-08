const {Line, Rectangle, Util} = require('pts');
const {NodeCanvasSpace, NodeSVGSpace} = require('./NodePtsCanvas.js');

// Generate a PNG image
const space = new NodeCanvasSpace(600, 600).setup({bgcolor: '#f03'});
const form = space.getForm();

space.add( t => {
  let subs = space.innerBound.map( (p) => Line.subpoints( [p, space.pointer], 30 ) );
  let rects = Util.zip( subs ).map( (r,i) => Rectangle.corners( r ).rotate2D( i*Math.PI/60, space.pointer ) );
  form.strokeOnly("#FDC", 2).polygons( rects );
});

space.toPNG('./test.png');


// Generate a SVG image
const space_svg = new NodeSVGSpace(600, 600).setup({bgcolor: '#f03'});
const form_svg = space_svg.getForm();

space_svg.add( t => {
  let subs = space_svg.innerBound.map( (p) => Line.subpoints( [p, space_svg.pointer], 30 ) );
  let rects = Util.zip( subs ).map( (r,i) => Rectangle.corners( r ).rotate2D( i*Math.PI/60, space_svg.pointer ) );
  form_svg.strokeOnly("#FDC", 2).polygons( rects );
});

space_svg.toSVG('./test.svg');