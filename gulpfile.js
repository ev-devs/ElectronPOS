var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
	return gulp.src('./app/views/04-pos/backend/*.js')
	.pipe(concat('compiled.js'))
	.pipe(gulp.dest('./app/views/04-pos/'));
});
