jshint = require 'gulp-jshint'
stylish = require 'jshint-stylish'
mocha = require 'gulp-mocha'
coffee = require 'gulp-coffee'
gulp   = require 'gulp'

gulp.task "lint", ->
  gulp.src([ "./lib/**/*.js", "./index" ])
    .pipe(jshint())
    .pipe jshint.reporter(stylish)

gulp.task "test", ->
  gulp.src("./test/**/*.coffee", read: false)
    .pipe mocha
      reporter: "spec"
      compilers: "coffee:coffee-script/register"

gulp.task "coffee", ->
  gulp.src("./src/**/*.coffee")
    .pipe(coffee(bare: true))
    .pipe gulp.dest("./lib/")

gulp.task "default", ["coffee", "lint", "test"]
