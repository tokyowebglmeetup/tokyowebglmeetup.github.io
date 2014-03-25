module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-cssmin'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks "grunt-contrib-connect"

  grunt.initConfig

    uglify:
      jsSrc:
        src: 'assets/js/header3d.js'
        dest: 'assets/js/header3d.min.js'
      font:
        src: 'assets/js/vendor/gentilis_bold.typeface.subset.js'
        dest: 'assets/js/vendor/gentilis_bold.typeface.subset.min.js'

    concat:
      libs:
        src: [
          'assets/js/vendor/three.min.js'
          '<%= uglify.jsSrc.dest %>'
          '<%= uglify.font.dest %>'
        ]
        dest: 'assets/js/all.min.js'

    sass:
      dist:
        options:
          style: 'expanded'
        files:
          'assets/css/all.css': 'assets/scss/all.scss'

    cssmin:
      cssAll:
        src: 'assets/css/all.css'
        dest: 'assets/css/all.min.css'

    watch:
      js:
        files: [ 'assets/js/*.js' ]
        tasks: [ 'uglify', 'concat' ]
      sass:
        files: [ 'assets/scss/*.scss' ]
        tasks: [ 'sass', 'cssmin'  ]
      options:
        livereload: true

    connect:
      server:
        options:
          port: process.env[ 'PORT' ] or 8888
          base: './'
          open: true

  grunt.registerTask 'compile', [ 'uglify', 'concat', 'sass', 'cssmin' ]
  grunt.registerTask 'default', [ 'compile', 'connect', 'watch' ]