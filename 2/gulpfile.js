'use strict';

var path         = require( 'path' );
// var del          = require( 'del' );
var es           = require( 'event-stream' );
var browserSync  = require( 'browser-sync' );
var reload       = browserSync.reload;
var runSequence  = require( 'run-sequence' );
// var exec         = require( 'child_process' ).exec;

var gulp         = require( 'gulp' );

var iconfont     = require( 'gulp-iconfont' );
var consolidate  = require( 'gulp-consolidate' );

var autoprefixer = require( 'gulp-autoprefixer' );
var concat       = require( 'gulp-concat' );
var minifyCSS    = require( 'gulp-minify-css' );
var plumber      = require( 'gulp-plumber' );
var rename       = require( 'gulp-rename' );
var sass         = require( 'gulp-sass' );
var uglify       = require( 'gulp-uglify' );
var watch        = require( 'gulp-watch' );

// ---

var autoprefixerBrowsers = [
  'ie >= 9',
  'ios >= 6',
  'android >= 3.0'
];
var root = path.resolve( __dirname, '../' );

// ---
gulp.task( 'iconfont', function () {
  
  var fontName = 'icon';

  return gulp.src( [ './assets/icon/src/*.svg' ] )
  .pipe( iconfont( {
    fontName: fontName,
    appendCodepoints: true
  } ) )
  .on( 'codepoints', function( codepoints, options ) {
 
    // CSS templating, e.g.
    gulp.src( './assets/icon/src/_icon.scss' )
    .pipe( consolidate( 'underscore', {
      glyphs: codepoints,
      fontName: fontName,
      fontPath: '../fonts/',
      prefix: 'TWM2-icon'
    } ) )
    .pipe( gulp.dest( './assets/css/src/' ) );
 
  } )
  .pipe( gulp.dest( './assets/fonts/' ) );
 
} );


gulp.task( 'sass', function () {

  return gulp.src( 'assets/css/src/**/*.scss' )
         .pipe( plumber() )
         .pipe( sass( { bundleExec: true } ) )
         .pipe( autoprefixer( autoprefixerBrowsers ) )
         .pipe( gulp.dest( 'assets/css/' ) )
         .pipe( minifyCSS() )
         .pipe( rename( { extname: '.min.css' } ) )
         .pipe( gulp.dest( 'assets/css/' ) );

} );

gulp.task( 'scripts:js', function () {

  return gulp.src( [
          'assets/js/src/header3d.js',
          'assets/js/src/ui.js',
          'assets/js/src/gmap.js'
         ] )
         .pipe( plumber() )
         .pipe( concat( 'scripts.js' ) )
         .pipe( gulp.dest( 'assets/js/') )
         .pipe( uglify() )
         .pipe( rename( { extname: '.min.js' } ) )
         .pipe( gulp.dest( 'assets/js/') );

} );

gulp.task( 'scripts:lib', function () {

  return gulp.src( [
          'assets/js/vendor/three.min.js',

          'assets/js/vendor/shaders/CopyShader.js',
          'assets/js/vendor/shaders/BokehShader.js',

          'assets/js/vendor/postprocessing/EffectComposer.js',
          'assets/js/vendor/postprocessing/RenderPass.js',
          'assets/js/vendor/postprocessing/ShaderPass.js',
          'assets/js/vendor/postprocessing/MaskPass.js',
          'assets/js/vendor/postprocessing/BokehPass.js',

          'assets/js/vendor/gentilis_bold.typeface.subset.min.js'
         ] )
         .pipe( plumber() )
         .pipe( concat( 'lib.js' ) )
         .pipe( gulp.dest( 'assets/js/') );

} );

gulp.task( 'browser-sync', function () {

  browserSync( {
    server: {
      baseDir: './',
      directory: true,
    },
  } );

} );

gulp.task( 'watch', function() {

  gulp.watch( [ 'assets/css/src/**/*.scss' ], [ 'sass', reload ] );
  gulp.watch( [ 'assets/js/src/**/*.js' ],    [ 'scripts:js', reload ] );
  gulp.watch( [ 'assets/js/vendor/**/*.js' ], [ 'scripts:lib', reload ] );
  gulp.watch( [ '**/*.html' ], reload );

} );

gulp.task( 'build', function( callback ) {

  runSequence(
    'iconfont', [ 'sass', 'scripts:js', 'scripts:lib' ],
    callback
  );

} );

gulp.task( 'default', function( callback ) {

  runSequence( 'build', 'watch', 'browser-sync', callback );

} );
