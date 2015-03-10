
;( function () {

  window.TWM2 = window.TWM2 || {};
  TWM2.header3d = {};
  var ns = TWM2.header3d;

  var MIN_WIDTH = 320;

  ns.el = document.querySelector( '.TWM2-pageHeader__logo' );
  ns.width  = Math.max( MIN_WIDTH, window.innerWidth );
  ns.height = 250;
  ns.needUpdate = false;
  ns.defaultCameraPosition = new THREE.Vector3( 0, 2, 20 );

  var cubes;

  ns.init = function () {
    var ambientLight,
        directionalLight;

    ns.scene = new THREE.Scene();
    ns.scene.fog = new THREE.FogExp2( 0x01131D, 0.06 );

    ns.camera = new THREE.PerspectiveCamera( 40, ns.width / ns.height, 1, 100 );
    // ns.camera.position = ns.defaultCameraPosition.clone();
    onscroll()

    ns.renderer = new THREE.WebGLRenderer( { antialias: true } );
    ns.renderer.setSize( ns.width, ns.height );
    ns.renderer.setPixelRatio( window.devicePixelRatio );
    ns.renderer.setClearColor( 0x01131D, 1 );
    ns.renderer.autoClear = false;
    ns.renderer.shadowMapEnabled = true;
    ns.renderer.shadowMapSoft = true;
    ns.el.removeChild( ns.el.querySelector( 'img' ) );
    ns.el.appendChild( ns.renderer.domElement );

    ns.postprocessing = {};
initPostprocessing();

    ambientLight = new THREE.AmbientLight( 0x666666 )
    ns.scene.add( ambientLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 10, 20 );
    directionalLight.target.position.set( 0, 0, 0 );
    // directionalLight.castShadow = true;
    // directionalLight.shadowMapWidth = 512;
    // directionalLight.shadowMapHeight = 512;
    // directionalLight.shadowCameraNear = 1;
    // directionalLight.shadowCameraFar = 30;
    // directionalLight.shadowCameraLeft = -12;
    // directionalLight.shadowCameraRight = 12;
    // directionalLight.shadowCameraTop = 8;
    // directionalLight.shadowCameraBottom = -8;
    // directionalLight.shadowDarkness = .3;
    // directionalLight.shadowCameraVisible = true;
    ns.scene.add( directionalLight );

    window.addEventListener( 'scroll', onscroll );

    window.addEventListener( 'mousemove', function ( e ) {
      var x = e.clientX / ns.width * 2 - 1;
      ns.camera.position.x = x * 3;
      ns.camera.position.z = - Math.abs( x * x );
      ns.camera.lookAt(
        new THREE.Vector3(
          0,
          ns.camera.position.y,
          -10
        )
      )
      ns.needUpdate = true;
    } );
  }

  function onscroll () {

    var scrollY = window.pageYOffset;
    if ( ns.height < scrollY ) {
      return;
    }
    ns.camera.position.y = ns.defaultCameraPosition.y - scrollY / 150;
    ns.needUpdate = true;

  }

  function initPostprocessing() {

    var renderPass = new THREE.RenderPass( ns.scene, ns.camera );

    var bokehPass = new THREE.BokehPass( ns.scene, ns.camera, {
      focus:    1.0,
      aperture: 0.025,
      maxblur:  1.0,

      width: ns.width,
      height: ns.height
    } );

    bokehPass.renderToScreen = true;

    var composer = new THREE.EffectComposer( ns.renderer );

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    ns.postprocessing.composer = composer;
    ns.postprocessing.bokeh = bokehPass;

  }

  ns.renderLoop = function () {

    requestAnimationFrame( ns.renderLoop );
    ns.checkWindowConditions();

    if ( !!cubes ) {
      cubes.rotation.x += 0.0003;
      cubes.rotation.y += 0.0004;
      cubes.rotation.z += 0.0005;
    }

    // if (
    //   !ns.needUpdate ||
    //   ns.height < window.pageYOffset
    // ) {

    //   return;

    // }

    ns.needUpdate = false;
    // ns.renderer.render( ns.scene, ns.camera );
    ns.postprocessing.composer.render( 0.1 ); //xxx

  };

  ns.checkWindowConditions = function () {

    if ( ns.width != window.innerWidth ) {

      ns.width = Math.max( MIN_WIDTH, window.innerWidth );
      ns.renderer.setSize( ns.width, ns.height );
      ns.camera.aspect = ns.width / ns.height;
      ns.camera.updateProjectionMatrix();
      ns.needUpdate = true;

    }

  };

  ns.Cubes = function () {

    THREE.EventDispatcher.prototype.apply( this );
    var that = this;

    var i = 0;
    // var cubes;
    var mergedGeo = new THREE.Geometry();
    var width  = 50;
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
    
    ns.scene.add( cubes );
    ns.needUpdate = true;

  };

  ns.Logo = function () {
    // THREE.EventDispatcher.prototype.apply( this );
    var that = this;
    var loader = new THREE.JSONLoader();
    loader.load( './assets/models/logo/webgl.js', function( geometry, materials ) {
      console.log( geometry, materials );
      materials[ 0 ] = new THREE.MeshPhongMaterial( {
        color: 0xa90000,
        specular: 0xffffff,
        emissive: 0x000000,
        shininess: 100,
        ambient: 0x000000
      } );
      that.mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshFaceMaterial( materials )
      );
      // that.mesh.traverse( function ( child ) {
      //   child.castShadow = true;
      //   child.receiveShadow = false;
      // } );
      that.mesh.rotation.x = THREE.Math.degToRad( 90 );
      that.mesh.position.set( -4, 1.5, -8 );
      that.mesh.scale.set( 3, 3, 3 );
      // that.dispatchEvent( { type: 'loaded' } );
      ns.scene.add( that.mesh );
      ns.needUpdate = true;
    } );
  };

  ns.Text = function ( text ) {

    THREE.EventDispatcher.prototype.apply( this );
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
    this.mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

    this.mesh.traverse( function ( child ) {

      child.castShadow = true;
      child.receiveShadow = false;

    } );

    this.mesh.position.y = -geometryTemporary.boundingBox.max.y / 2;
    this.mesh.scale.set( 3, 3, 3 );
    this.mesh.position.set( 0, .2, -8 );
    // this.dispatchEvent( { type: 'loaded' } );
    ns.scene.add( this.mesh );
    ns.needUpdate = true;

  };


  TWM2.header3d.init();
  TWM2.header3d.renderLoop();
  _cubes = new TWM2.header3d.Cubes();
  var logo = new TWM2.header3d.Logo();
  var text = new TWM2.header3d.Text( [ 'MEETUP', 'TOKYO' ] );

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
