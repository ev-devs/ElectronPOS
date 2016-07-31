var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var concat 	= require('gulp-concat');
var watch 	= require('gulp-watch');

gulp.task('default', function() {
	gutil.log('Started default gulp task')
	return gulp.src('./app/views/04-pos/backend/*.js')
	.pipe(concat('compiled.js'))
	.pipe(gulp.dest('./app/views/04-pos/'));
});

gulp.task('stream', function(){
	return watch('./app/views/04-pos/backend/*.js', { ignoreInitial: false })
	 .pipe(gulp.dest('./app/views/04-pos/'));
})
