// gulp
var gulp = require('gulp');

// plugins

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');

// tasks
gulp.task('lint', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**', '!./**/bundled.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('cleanDist', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
});

gulp.task('clean', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
    gulp.src('./app/js/bundled.js')
      .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = { comments:true, spare:true };
  gulp.src(['./app/**/*.css', '!./app/bower_components/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('minify-js', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(uglify({
      // inSourceMap:
      // outSourceMap: "app.js.map"
    }))
    .pipe(gulp.dest('./app'))
});

gulp.task('copy-bower-components', function () {
  gulp.src(['./app/bower_components/**/*.min.js','./app/bower_components/**/*.min.css'])
    .pipe(gulp.dest('dist/bower_components'));
});

gulp.task('copy-html-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('buildDev', function() {
  gulp.src(['app/js/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  .pipe(concat('bundled.js'))
  .pipe(gulp.dest('./app/js')).on('end', reload);
});

// gulp.task('buildDist', function() {
//   gulp.src(['app/js/main.js'])
//   .pipe(browserify({
//     insertGlobals: true,
//     debug: true
//   }))
//   .pipe(concat('bundled.js'))
//   .pipe(uglify())
//   .pipe(gulp.dest('./dist/js'))
// });

// use default task to launch Browsersync and watch JS files
gulp.task('serveDev', function () {
    // Serve files from the app folder of this project
    browserSync.init({
        open: false,
        server: {
          baseDir: "./app/"
        }
    });
});

// gulp.task('serveDist', function () {
//     // Serve files from the app folder of this project
//     browserSync.init({
//         open: false,
//         server: {
//           baseDir: "./dist/"
//         }
//     });
// });

gulp.watch(['./app/**/*.html'], reload);
gulp.watch(['./app/css/**/*.{scss,css}'], reload);
gulp.watch(['./app/js/**/*.js', '!./app/js/**/bundled.js'], ['clean', 'buildDev']);

// default task
gulp.task('default',
  ['clean', 'buildDev', 'serveDev']
);

// build task
gulp.task('build',function() {
  runSequence('clean', 'minify-css', 'minify-js', 'buildDev', 'buildDist', 'copy-html-files', 'copy-bower-components');
}
);

// gulp.task('serveDist',
//   ['serveDist']
// );