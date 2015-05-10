
;( function () {

  'use strict';

  var MIN_WIDTH  = 320;
  var MAX_HEIGHT = 280;
  var el = document.querySelector( '.TWM2-pageHeader__logo' );
  var width  = el.offsetWidth;
  var height = width / MAX_HEIGHT < 3 ? 120 : MAX_HEIGHT;
  var camera;
  var scene;
  var renderer;
  var postprocessing = {};

  var defaultCameraPosition = new THREE.Vector3( 0, 2, 20 );

  var cubes, logo, text;

  var initScene = function () {

    var ambientLight,
        directionalLight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x01131D, 0.06 );

    camera = new THREE.PerspectiveCamera( 40, width / height, 1, 100 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( width, height );
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( 0x01131D, 1 );
    renderer.autoClear = false;
    el.removeChild( el.querySelector( 'img' ) );
    el.appendChild( renderer.domElement );

    ambientLight = new THREE.AmbientLight( 0x666666 )
    scene.add( ambientLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 10, 20 );
    directionalLight.target.position.set( 0, 0, 0 );
    scene.add( directionalLight );

  }

  var initPostprocessing = function () {

    var composer = new THREE.EffectComposer( renderer );

    var renderPass = new THREE.RenderPass( scene, camera );
    var bokehPass = new THREE.BokehPass( scene, camera, {
      focus:    1.0,
      aperture: 0.025,
      maxblur:  1.0,
      width:    width,
      height:   height
    } );

    bokehPass.renderToScreen = true;

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    postprocessing.composer = composer;
    postprocessing.bokeh    = bokehPass;

  }

  var onscroll = function ( e ) {

    var scrollY = window.pageYOffset;
    if ( height < scrollY ) {
      return;
    }
    camera.position.y = defaultCameraPosition.y - scrollY / 150;

  }

  var onmousemove = function ( e ) {

    var x = e.clientX / width * 2 - 1;
    camera.position.x = x * 3;
    camera.position.z = - Math.abs( x * x );
    camera.lookAt( new THREE.Vector3( 0, camera.position.y, -10 ) );

  }

  var checkWindowConditions = function () {

    if ( width != window.innerWidth ) {

      width  = Math.max( MIN_WIDTH, el.offsetWidth );
      height = width / MAX_HEIGHT < 3 ? 120 : MAX_HEIGHT;

      renderer.setSize( width, height );

      postprocessing.composer.setSize( width, height );
      postprocessing.bokeh.uniforms[ 'aspect' ].value = camera.aspect;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

    }

  };

  var renderLoop = function () {

    requestAnimationFrame( renderLoop );
    checkWindowConditions();

    if ( !!cubes ) {
      cubes.rotation.x += 0.0003;
      cubes.rotation.y += 0.0004;
      cubes.rotation.z += 0.0005;
    }

    // renderer.render( scene, camera );
    postprocessing.composer.render( 0.1 );

  };

  var addCubes = function () {

    var i = 0;
    var mergedGeo = new THREE.Geometry();
    var width = 50;
    var cubeSize = 1;
    var matrix = new THREE.Matrix4();
    var geometry;
    var material = new THREE.MeshBasicMaterial( { color: 0x0BD3D7 } );

    for ( i = 0; i < 1000; i++ ) {

      matrix.set(
        1, 0, 0, Math.random() * width - width / 2,
        0, 1, 0, Math.random() * width - width / 2,
        0, 0, 1, Math.random() * width - width / 2,
        0, 0, 0, 1
      );

      cubeSize = Math.random() * 1;
      geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
      geometry.applyMatrix ( matrix )

      mergedGeo.merge( geometry );

    }

    cubes = new THREE.Mesh( mergedGeo, material );
    
    scene.add( cubes );

  };

  var addLogo = function () {

    var logo;
    var loader = new THREE.JSONLoader();

    loader.load( './assets/models/logo/webgl.js', function( geometry, materials ) {

      materials[ 0 ] = new THREE.MeshPhongMaterial( {
        color: 0xa90000,
        specular: 0xffffff,
        emissive: 0x000000,
        shininess: 100,
        ambient: 0x000000
      } );

      logo = new THREE.Mesh(
        geometry,
        new THREE.MeshFaceMaterial( materials )
      );

      logo.rotation.x = THREE.Math.degToRad( 90 );
      logo.position.set( -4, 1.5, -8 );
      logo.scale.set( 3, 3, 3 );
      scene.add( logo );

    } );

  };

  var addText = function ( text ) {

    var i, l,
        ii, ll,
        text = text,
        size = .5,
        totalLineHeight = 0,
        geometryTemporary,
        geometry = new THREE.Geometry(),
        materials = [],
        meshTemporary,
        mesh;

    for ( i = 0, l = text.length; i < l; i ++ ) {

      geometryTemporary = new THREE.TextGeometry( text[ i ], {
        size: size,
        height: size * 0.1,
        curveSegments: 4,
        font : 'gentilis',
        weight: 'bold',
        style: 'normal',
        bevelThickness: size * 0.05,
        bevelSize: size * 0.025,
        bevelEnabled: true,
        material: 0,
        extrudeMaterial: 1
      } );

      for ( var ii = 0, ll = geometryTemporary.vertices.length; ii < ll; ii ++ ) {

        geometryTemporary.vertices[ ii ].y += totalLineHeight;

      };

      geometryTemporary.computeBoundingBox();
      geometryTemporary.computeVertexNormals();
      geometry.merge( geometryTemporary );

      materials.push( new THREE.MeshPhongMaterial( {
        color: 0xcccccc,
        specular: 0xffffff,
        emissive: 0x000000,
        shininess: 100,
        ambient: 0x000000,
        shading: THREE.FlatShading
      } ) );   // front

      materials.push( new THREE.MeshPhongMaterial( {
        color: 0xcccccc,
        specular: 0xffffff,
        emissive: 0x000000,
        shininess: 100,
        ambient: 0x000000,
        shading: THREE.SmoothShading
      } ) ); // side

      totalLineHeight += geometryTemporary.boundingBox.max.y;

    }

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

    mesh.position.y = -geometryTemporary.boundingBox.max.y / 2;
    mesh.scale.set( 3, 3, 3 );
    mesh.position.set( 0, .2, -8 );
    scene.add( mesh );

  };

  initScene()
  initPostprocessing();
  onscroll();

  addCubes();
  addLogo();
  addText( [ 'MEETUP', 'TOKYO' ] );

  renderLoop();

  window.addEventListener( 'scroll', onscroll );
  window.addEventListener( 'mousemove', onmousemove );

} )();

;( function () {

  $( function () {

    console.log( 111 );
    $( '.TWM2-speaker__details' ).each( function () {

      var $this = $( this );
      var $button = $this.find( '.TWM2-speaker__detailExpander' );
      var $body   = $this.find( '.TWM2-speaker__bio' );

      $button.on( 'click', function () {

        $body.slideToggle();

      } );
      

    } );

  } );

} )();

;( function () {

  var center = new google.maps.LatLng( 35.656681, 139.782140 );
  var params = {
    center: center,
    zoom: 17,
    draggable: false,
    scrollwheel: false,
    panControl: false,
  };

  var map = new google.maps.Map( document.getElementById( 'TWM2-map' ), params );

  var marker = new google.maps.Marker( {
    position: center,
    map: map
  } );

} )();
