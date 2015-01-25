var jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    gulp   = require('gulp');

gulp.task('lint', function() {
  return gulp.src(['./lib/**/*.js', './test/**/*.js', './index'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('test', function () {
  return gulp.src('./test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['lint', 'test']);
