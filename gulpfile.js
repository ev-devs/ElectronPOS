var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var concat 	= require('gulp-continuous-concat');
var watch 	= require('gulp-watch');


gulp.task('default', function() {
	gutil.log('This is an empty task')
	return

	return gulp.src('./app/views/04-pos/lib/*.js')
	.pipe(concat('compiled.js'))
	.pipe(gulp.dest('./app/views/04-pos/'));
});

/*
gulp.task('stream', function(){
	return watch('./app/views/04-pos/backend/*.js', { ignoreInitial: false })
	.pipe(gulp.dest('./app/views/04-pos/backend/'));
});
*/

gulp.task('compile', function(){
	gulp.src('./app/views/04-pos/lib/*.js')
   .pipe(watch('./app/views/04-pos/lib/*.js', {ignoreInitial : false}))
   .pipe(concat('compiled.js'))
   .pipe(gulp.dest('./app/views/04-pos/'))
})
