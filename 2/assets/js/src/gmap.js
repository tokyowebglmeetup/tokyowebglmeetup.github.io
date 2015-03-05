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
