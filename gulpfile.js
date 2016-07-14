var path = {
    src     : 'src',
    dist    : 'slides'
};

var gulp = require('gulp');
var browsersync = require('browser-sync');
var beep = require('beepbeep');
var colors = require('colors');
var merge = require('merge-stream');
var del = require('del');
var cp = require('child_process');
var runSequence = require('run-sequence');
var gulpLoadPlugins = require('gulp-load-plugins');


var $ = gulpLoadPlugins();


// ERROR HANDLER ========================================
  var onError = function(err) {
    beep([200, 200]);
    console.log(
      '\n\n****************************************************\n'.bold.gray +
      '*****************'.bold.gray + ' \(╯°□°)╯'.bold.red + ' ︵ '.bold.gray +'ɹoɹɹǝ '.bold.blue + '*****************'.bold.gray +
      '\n****************************************************\n\n'.bold.gray +
      String(err) +
      '\n\n***************************************************\n\n'.bold.gray );
    this.emit('end');
  };


// CLEAN ================================================
gulp.task('clean', function(callback) {
    del(
        [ path.dist ],
        function(err, deletedFiles) {
            console.log('Files deleted:\n'.bold.green , deletedFiles.join(',\n '));
            callback();
    });
});


// HTML ==================================================
gulp.task('jekyll', function(done) {
    return cp.spawn('bundle',
        [
        'exec',
        'jekyll',
        'build',
        '-q',
        '--config=_config.yml'
        ], { stdio: 'inherit' })
    .on('close', done);
});

gulp.task('html', ['jekyll'], function() {
    return browsersync.reload();
});


// STYLES ===============================================
gulp.task('css', function() {
    return gulp.src( path.src + '/scss/*.scss' )
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.sass())
        .pipe(gulp.dest( path.dist + '/css' ));
});


// FONTS ================================================
gulp.task('fonts', function() {
    return gulp.src( path.src + '/fonts/**/*.*' )
        .pipe(gulp.dest( path.dist + '/fonts' ));
});


// JS ===================================================
gulp.task('js', function() {
    var scripts =  gulp.src([ path.src + '/js/**/*.js', '!' + path.src + '/js/reveal/*.js'])
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.concat('main.js'))
        .pipe(gulp.dest( path.dist + '/js' ));

    var scripts_min =  gulp.src([
            path.src + '/js/reveal/*.js',
            path.src + '/js/reveal/plugins/**/*.+(html|js)'
        ])
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe(gulp.dest( path.dist + '/js/reveal' ));

    return merge(scripts, scripts_min);
});


// IMAGES ===============================================
gulp.task('images', function() {
    return gulp.src( path.src + '/img/**/*.+(png|jpg|gif)' )
        .pipe($.changed( path.dist + '/img' ))
        .pipe(gulp.dest( path.dist + '/img' ));
});

gulp.task('svg', function() {
    return gulp.src( path.src + '/img/**/*.svg' )
        .pipe($.changed('dist/img'))
        .pipe(gulp.dest( path.dist + '/img/' ));
});



// BROWSER SYNC =========================================
gulp.task('browsersync', function() {
    browsersync({
        server: { baseDir: path.dist },
        port: 8000,
        files: [  path.dist + '/css/*.css']
    });
});


// WATCH ================================================
gulp.task('watch', ['browsersync'], function() {
    gulp.watch( path.src + '/**/*.html',            ['html'] );
    gulp.watch( path.src + '/scss/**/*.scss',       ['css'] );
    gulp.watch( path.src + '/js/**/*.js',           ['js'] );
    gulp.watch( path.src + '/img/**/*.+(png|jpg)',  ['images'] );
    gulp.watch( path.src + '/img/**/*.svg',         ['svg'] );
});

// BUILD ================================================
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        [
            'html',
            'images',
            'svg',
            'css',
            'fonts',
            'js'
        ],
    callback);
});

gulp.task('default', function(callback) {
    runSequence(
        'build',
        ['watch'],
    callback);
});