mocha = require 'gulp-mocha'
coffee = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
gulp   = require 'gulp'

gulp.task "lint", ->
  gulp.src('./src/**/*.coffee')
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())

gulp.task "test", ->
  gulp.src("./test/**/*.coffee", read: false)
    .pipe mocha
      reporter: "spec"
      compilers: "coffee:coffee-script/register"

gulp.task "coffee", ->
  gulp.src("./src/**/*.coffee")
    .pipe(coffee(bare: true))
    .pipe gulp.dest("./lib/")

gulp.task "default", ["lint", "test"]
