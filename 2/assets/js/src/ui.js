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
