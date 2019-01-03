var gulp			= require('gulp'),
  autoprefixer	= require('autoprefixer'),
  nano			= require('cssnano'),
  concat			= require('gulp-concat'),
  less			= require('gulp-less'),
  postcss			= require('gulp-postcss'),
  uglify			= require('gulp-uglify'),
  watch			= require('gulp-watch'),
  rename			= require('gulp-rename'),
  sourcemaps		= require('gulp-sourcemaps'),
  plumber			= require('gulp-plumber'),
  options			= {
    sourcePathStyles		: 'public/less',
    sourcePathScripts		: 'public/javascripts',
    sourcePathImages		: 'public/images',
    destinationPathStyles	: 'public/stylesheets'
  };

gulp.task('less', function() {
  return gulp.src([options.sourcePathStyles + '/styles.less'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(options.destinationPathStyles))
    ;
});

gulp.task('styles:min', gulp.series('less', function() {
  return gulp.src(options.destinationPathStyles + '/*[!(.min)].css')
    .pipe(postcss([
      nano()
    ]))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest(options.destinationPathStyles));
}));

gulp.task('jsMain:min', function() {
  return gulp.src([options.sourcePathScripts + '/main.js'])
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest(options.sourcePathScripts));
});

gulp.task('jsLibs:concat', function() {
  return gulp.src([
    options.sourcePathScripts + '/jquery-3.3.1.min.js',
    options.sourcePathScripts + '/fancybox.min.js',
    options.sourcePathScripts + '/modernizr.min.js',
    options.sourcePathScripts + '/panzoom.min.js'
  ])
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(options.sourcePathScripts));
});

gulp.task('jsLibs:uglify', gulp.series('jsLibs:concat', function() {
  return gulp.src([options.sourcePathScripts + '/libs.js'])
    .pipe(uglify())
    .pipe(rename('libs.min.js'))
    .pipe(gulp.dest(options.sourcePathScripts));
}));

gulp.task('watch', function() {
  gulp.watch(options.sourcePathStyles + '/**/*.less', gulp.series('less'));
});

gulp.task('default', gulp.series('less', 'watch', 'jsLibs:concat'));
gulp.task('release', gulp.series('styles:min', 'jsMain:min', 'jsLibs:uglify'));


