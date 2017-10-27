var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var buffer = require('vinyl-buffer');
var imagemin = require('gulp-imagemin');
var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');
var fileinclude = require('gulp-file-include');
var htmlhint = require("gulp-htmlhint");
var minify = require('gulp-minify');
var gulpUtil = require('gulp-util');
const jshint = require('gulp-jshint');
var src = 'app';
var dst = 'dist';

gulp.task('styles', function() {
    gulp.src(src+'/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
		.pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dst+'/css/'))
		.pipe(connect.reload());
});

gulp.task('images', function() {
    gulp.src(src+'/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest(dst+'/img/'))
});

gulp.task('html', function() {
    gulp.src(src+'/*.html')
        .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
		.pipe(htmlhint())	
        .pipe(gulp.dest(dst+"/"))
		.pipe(connect.reload());
});

gulp.task('js', function() {
    gulp.src(src+'/js/**/*')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
        .pipe(minify({
			ext:{
				src:'-debug.js',
				min:'-min.js'
			},
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
		}).on('error', gulpUtil.log))
		.pipe(gulp.dest(dst+'/js'));
});

gulp.task('fonts', function() {
    gulp.src([src+'/fonts/*'])
        .pipe(gulp.dest(dst+'/fonts/'))
});

gulp.task('sprite', function () {
  var spriteData = gulp.src(src+'/sprite/*.png').pipe(spritesmith({
    imgName: '/img/sprite.png',
    cssName: '_sprite.scss'
  }));
  // Pipe image stream through image optimizer and onto disk 
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin` 
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(dst+"/"));
 
  var cssStream = spriteData.css
    .pipe(gulp.dest(src+'/scss/components/'));
 
  // Return a merged stream to handle both `end` events 
  return merge(imgStream, cssStream);
});

gulp.task('reloadHTML', function() {
  return gulp.src(dst+'/**/*.html')
	.pipe(connect.reload());
});

//Watch task
gulp.task('default',function() {
	connect.server({ root: dst,
    livereload: true,
	port: 8888});
    gulp.watch(src+'/scss/**/*.scss', ['styles']);
	gulp.watch(src+'/js/**/*.js', ['js']);
	gulp.watch('img/**/*', {cwd: src}, ['images']);
	gulp.watch('fonts/**/*', {cwd: src}, ['fonts']);
	gulp.watch(src+'/**/*.html', ['html']);
});