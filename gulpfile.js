var path = require('path'),
    options = {};

// #############################
// Edit these paths and options.
// #############################

// The root paths are used to construct all the other paths in this
// configuration. The "project" root path is where this gulpfile.js is located.
// While Zen distributes this in the theme root folder, you can also put this
// (and the package.json) in your project's root folder and edit the paths
// accordingly.
options.rootPath = {
  assets       : 'assets/'
};

options.assets = {
  root    : options.rootPath.assets,
  css     : options.rootPath.assets + 'css/',
  sass    : options.rootPath.assets + 'scss/',
  js      : options.rootPath.assets + 'js/',
  images  : options.rootPath.assets + 'img/'
};

// Define the path to the project's .scss-lint.yml.
options.scssLint = {
  yml: options.assets.sass + '.scss-lint.yml'
};

// ################################
// Load Gulp and tools we will use.
// ################################
var gulp        = require('gulp'),
    gcmq        = require('gulp-group-css-media-queries'),
    del         = require('del'),
    plugins     = require('gulp-load-plugins')({
      replaceString: /\bgulp[\-.]/
    });

// Default Task
gulp.task('default', ['build', ]);

// #################
// Build everything.
// #################
gulp.task('build', ['lint', 'styles']);

// ##########
// Build CSS.
// ##########
gulp.task('styles', function () {
  return gulp.src([
    options.assets.sass + '*.scss'
  ])
  .pipe(plugins.sassGlob())
  .pipe(plugins.sass({errLogToConsole: true}))
  .pipe(gcmq())
  .pipe(plugins.autoprefixer({
      browsers: ['> 0.05%', 'last 2 versions'],
      cascade: false
  }))
  .pipe(gulp.dest(options.assets.css));
});

// #########
// Build JS.
// #########
gulp.task('script', function() {
  return gulp.src([
      options.assets.js + 'lib/*',
      options.assets.js + 'global.js'
    ])
    .pipe(plugins.uglify())
    .pipe(plugins.concat('script.min.js'))
    .pipe(gulp.dest(options.assets.js + 'min'));
});

// #########################
// Lint Sass and JavaScript.
// #########################
gulp.task('lint', ['lint:sass']);

gulp.task('lint:sass', function() {
  return gulp.src(options.assets.sass + '**/*.scss')
    .pipe(plugins.scssLint({'config': options.scssLint.yml}));
});

// ##############################
// Watch for changes and rebuild.
// ##############################
gulp.task('watch', function() {
    gulp.watch(options.assets.sass + '**/*.scss', ['lint', 'styles']);
});

// #####################################
// Minify images, and create svg sprite.
// #####################################
gulp.task('images', function () {
  return gulp
    .src(options.assets.images + 'svg/*.svg')
    .pipe(plugins.cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(plugins.imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(plugins.svgstore())
    .pipe(gulp.dest(options.assets.images));
});

// ######################
// Clean all directories.
// ######################
gulp.task('clean', ['clean:css']);

// Clean CSS files.
gulp.task('clean:css', function() {
  return del([
      options.assets.root + '**/.sass-cache',
      options.assets.css + '**/*.css',
      options.assets.css + '**/*.map'
    ], {force: true});
});
