var gulp = require('gulp');							// Task manager used to perform all the below tasks.
var del = require('del');							// Simple module for deleting files and folders on the HD.
var path = require('path');							// Module provides utilities for working with file and directory paths.
var argv = require('yargs').argv;					// Exposes passed arguments from the command line.
var gutil = require('gulp-util');					// Utility functions for gulp plugins, such as logging.
var source = require('vinyl-source-stream');		// Converts a stream to a virtual file.
var buffer = require('gulp-buffer');				// Converts stream to buffer
var exorcist = require('exorcist');					// Browserify writes js.map to output.js when debug=true. Exorcist pulls it out and creates external output.js.map
var gulpif = require('gulp-if');					// Adds the ability to apply conditional logic within gulp
var uglify = require('gulp-uglify');				// Adds the ability to apply conditional logic within gulp
var browserify = require('browserify');				// Converts Common.js require modules to vanilla javascript, includes dependency management.
var babelify = require('babelify');					// Converts ES6 javascript schema to browser friendly version.
var browserSync = require('browser-sync');			// Serves site files and performs reloads on file updates
var sass = require('gulp-sass');					// CSS preprocessor for converting SASS to CSS
var sourcemaps = require('gulp-sourcemaps');		// Builds a CSS sourcemap
var autoprefixer = require('gulp-autoprefixer');	// Magic task that add all the CSS browser prefixes automatically
var processHTML = require('gulp-processhtml');		// Handles build time conditions in index.html.
var hoganify = require('hoganify');                 // Compiles hogan modules from mustache templates and then embeds the result to app.min.js, so templates can be accessed as require modules.
var gulpSequence = require('gulp-sequence');

// Paths
var BUILD_PATH = './client/build';
var SCRIPTS_PATH = BUILD_PATH + '/js';
var SOURCE_PATH = './client/src';
var ASSET_PATH = SOURCE_PATH + '/assets';
var ENTRY_FILE = SOURCE_PATH + '/js/app.js';
var OUTPUT_FILE = 'app.min.js';


/*************************************************************
**
**	Deletes content in the build directory
**
**************************************************************/

function cleanBuild () {
    del([BUILD_PATH + '/**/*.*']);
}


/*************************************************************
**
**	Copies 'src/assets' folder into the '/build' folder.
**
**************************************************************/

function copyAssets () {
    return gulp.src(ASSET_PATH + '/**/*')
      .pipe(gulp.dest(BUILD_PATH + '/assets'));
}


function copyJsVendorFiles () {
    return gulp.src(SOURCE_PATH + '/js/libs' + '/**/*')
      .pipe(gulp.dest(BUILD_PATH + '/js/libs'));
}



/*************************************************************
**
**	Javascript is originally written in ES2015 script because
**	of how clean and easy to structure it is. Since there are
**	plenty of browsers that can't read it properly it's just
**	easier to translate it back to browser friendly
**	javascript.
**
**************************************************************/

function processJavascript () {

  var sourcemapPath = SCRIPTS_PATH + '/' + OUTPUT_FILE + '.map';

  // module management
  var browserified = browserify({
    paths: [ path.join(__dirname, SOURCE_PATH + '/js') ],
    entries: [ENTRY_FILE],
    debug: true
  });

	// converts ES6 format to vanilla javascript. Note: preset and plugins are NPM dependencies
  browserified.transform("glslify");
  browserified.transform(babelify, {
    "presets": ["@babel/preset-env"],
    //"plugins": ["@babel/plugin-transform-async-to-generator", "@babel/plugin-transform-runtime"]
  });
  browserified.transform(hoganify, { live:false, ext:'.html,.mustache' });

	// bundles all the "import/require" dependencies together
	var bundle = browserified.bundle().on('error', function(error){
		gutil.log(gutil.colors.red('[Build Error]', error.message));
		this.emit('end');
    });

	// add any additional js related tasks
	return bundle
    .pipe( exorcist(sourcemapPath) )
    .pipe( source(OUTPUT_FILE) )
    .pipe( buffer() )
    //.pipe( uglify() )
    .pipe( gulp.dest(SCRIPTS_PATH) )
}


/*************************************************************
**
**	Converts SASS to CSS
**
**************************************************************/

function processSASS () {

	var autoprefixerOptions = {
	 	browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
	};

	return gulp.src(SOURCE_PATH + '/scss/main.scss')
		.pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
      .pipe(gulp.dest(BUILD_PATH + '/css'))
}


/*************************************************************
**
**	Handles conditional comments in index.html
**
**************************************************************/

function processIndexHTML () {

  return gulp.src(SOURCE_PATH + '/index.html')
    .pipe( processHTML({}) )
    .pipe( gulp.dest(BUILD_PATH) )
}


/*************************************************************
**
**	Starts the Browsersync server and watches for file
**	updates, which will prompt specific build tasks to the
**	type of file updated.
**
**************************************************************/

function serve () {

    var options = {
      server: {
          baseDir: BUILD_PATH
      },
      open: false // Change it to true if you wish to allow Browsersync to open a browser window.
    };

    browserSync(options);

    // Watches for changes in files inside the './src' folder.
    gulp.watch(SOURCE_PATH + '/js/**/*.js', ['watch-js']);

    // Watches for updates to sass css preprocessor files.
    gulp.watch(SOURCE_PATH + '/scss/**/*.scss', ['watch-sass']);

    // Watches for updates in index.html
    gulp.watch(SOURCE_PATH + '/index.html', ['watch-html']);

    // Watches for updates in mustache partials and templates and reloads javascript, since the they get compiled into js objects.
    gulp.watch(SOURCE_PATH + '/views/**/*.mustache', ['watch-js']);

    // Watches for changes in files inside the './static' folder. Also sets 'keepFiles' to true (see cleanBuild()).
    gulp.watch(ASSET_PATH + '/**/*', ['watch-assets']).on('change', function() {
        return;
    });
}

// TODO: minify CSS
// TODO: watch for newly created files
// TODO: deal with babel not compiling global classes as wanted

gulp.task('clean-build', cleanBuild);
gulp.task('process-sass', processSASS);
gulp.task('process-html', processIndexHTML);
gulp.task('copy-assets', copyAssets);
gulp.task('process-javascript', processJavascript);
gulp.task('copy-js-vendor-files', copyJsVendorFiles);

gulp.task('watch-js', ['build'], browserSync.reload);
gulp.task('watch-sass', ['process-sass'], browserSync.reload);
gulp.task('watch-html', ['process-html'], browserSync.reload);
gulp.task('watch-assets', ['copy-assets'], browserSync.reload);

gulp.task('build', function(callback){
    gulpSequence('clean-build', 'copy-assets', 'process-sass', 'process-html', 'process-javascript', 'copy-js-vendor-files')(callback);
});
gulp.task('serve', function(callback){
    gulpSequence('build', serve)(callback);
});
