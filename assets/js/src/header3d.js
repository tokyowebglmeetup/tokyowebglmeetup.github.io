
;( function () {

  window.tokyo = window.tokyo || {};
  tokyo.header3d = {};
  var ns = tokyo.header3d;

  var MIN_WIDTH = 1024;

  ns.el = document.querySelector( '.tokyo-pageHeader__logo' );
  ns.width  = Math.max( MIN_WIDTH, window.innerWidth );
  ns.height = 250;
  ns.needUpdate = false;
  ns.defaultCameraPosition = new THREE.Vector3( 0, 2, 20 );

  ns.init = function () {
    var ambientLight,
        directionalLight;

    ns.scene = new THREE.Scene();
    ns.scene.fog = new THREE.FogExp2( 0x111111, 0.05 );

    ns.camera = new THREE.PerspectiveCamera( 40, ns.width / ns.height, 1, 100 );
    ns.camera.position = ns.defaultCameraPosition.clone();

    ns.renderer = new THREE.WebGLRenderer( { antialias: true } );
    ns.renderer.setSize( ns.width, ns.height );
    ns.renderer.setClearColor( 0x111111, 1 );
    ns.renderer.shadowMapEnabled = true;
    ns.renderer.shadowMapSoft = true;
    ns.el.removeChild( ns.el.querySelector( 'img' ) );
    ns.el.appendChild( ns.renderer.domElement );

    ambientLight = new THREE.AmbientLight( 0x666666 )
    ns.scene.add( ambientLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 10, 20 );
    directionalLight.target.position.set( 0, 0, 0 );
    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = 512;
    directionalLight.shadowMapHeight = 512;
    directionalLight.shadowCameraNear = 1;
    directionalLight.shadowCameraFar = 30;
    directionalLight.shadowCameraLeft = -12;
    directionalLight.shadowCameraRight = 12;
    directionalLight.shadowCameraTop = 8;
    directionalLight.shadowCameraBottom = -8;
    directionalLight.shadowDarkness = .3;
    // directionalLight.shadowCameraVisible = true;
    ns.scene.add( directionalLight );

    window.addEventListener( 'scroll', function () {
      var scrollY = window.pageYOffset;
      if ( ns.height < scrollY ) {
        return;
      }
      ns.camera.position.y = ns.defaultCameraPosition.y - scrollY / 150;
      ns.needUpdate = true;
    } );

    window.addEventListener( 'mousemove', function ( e ) {
      var x = e.clientX / ns.width * 2 - 1;
      ns.camera.position.x = x * 3;
      ns.needUpdate = true;
    } );
  }

  ns.renderLoop = function () {
    requestAnimationFrame( ns.renderLoop );
    ns.checkWindowConditions();
    if (
      !ns.needUpdate ||
      ns.height < window.pageYOffset
    ) {
      return;
    }
    ns.needUpdate = false;
    ns.renderer.render( ns.scene, ns.camera );
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

  ns.Karesansui = function () {
    THREE.EventDispatcher.prototype.apply( this );
    var that = this;
    var loader = new THREE.JSONLoader();
    loader.load( './assets/models/karesansui/karesansui.js', function( geometry, materials ) {
      materials.forEach( function ( mat ) {
        if ( !mat.map ) {
          return;
        }
        mat.map.addEventListener( 'update', function () {
          ns.needUpdate = true;
        } );
      } );

      that.mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshFaceMaterial( materials )
      );
      that.mesh.traverse( function ( child ) {
        child.castShadow = false;
        child.receiveShadow = true;
      } );
      // that.dispatchEvent( { type: 'loaded' } );
      ns.scene.add( that.mesh );
      ns.needUpdate = true;
    } );
  };

  ns.Logo = function () {
    THREE.EventDispatcher.prototype.apply( this );
    var that = this;
    var loader = new THREE.JSONLoader();
    loader.load( './assets/models/logo/webgl.js', function( geometry, materials ) {
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
      that.mesh.traverse( function ( child ) {
        child.castShadow = true;
        child.receiveShadow = false;
      } );
      that.mesh.rotation.x = THREE.Math.degToRad( 90 );
      that.mesh.scale.set( 3, 3, 3 );
      that.mesh.position.set( -4, 1.5, 12 );
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
      THREE.GeometryUtils.merge( geometry, geometryTemporary );
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
    this.mesh.position.set( 0, .2, 12 );
    // this.dispatchEvent( { type: 'loaded' } );
    ns.scene.add( this.mesh );
    ns.needUpdate = true;
  };


  tokyo.header3d.init();
  tokyo.header3d.renderLoop();
  var karesansui = new tokyo.header3d.Karesansui();
  var logo = new tokyo.header3d.Logo();
  var text = new tokyo.header3d.Text( [ 'MEETUP', 'TOKYO' ] );

} )();
