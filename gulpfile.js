var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var concat 	= require('gulp-continuous-concat');
var watch 	= require('gulp-watch');


gulp.task('default', function() {
	gutil.log('This is an empty task')
});

gulp.task('compile', function(){
	gulp.src('./app/views/04-pos/lib/*.js')
   .pipe(watch('./app/views/04-pos/lib/*.js', {ignoreInitial : false}))
   .pipe(concat('compiled.js'))
   .pipe(gulp.dest('./app/views/04-pos/'))
})
