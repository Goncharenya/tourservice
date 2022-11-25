const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const htmlmin = require('gulp-htmlmin');
const csso = require('postcss-csso');
const rename = require('gulp-rename');
const jsmin = require('gulp-terser');
const del = require("del");
const imagemin = require("gulp-imagemin");
const webp = require('gulp-webp');
const svgStore = require('gulp-svgstore');


// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const buildHtml = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/*.html", gulp.series(buildHtml, reload));
  gulp.watch("source/js/script.js", gulp.series(buildJs));
}

// build tasks

const buildJs = () => {
  return gulp.src('source/js/*.js')
    .pipe(jsmin())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('build/js'));
  // .pipe(sync.stream());
}

exports.buildJs = buildJs;

const clean = () => {
  return del("build");
};

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
    .pipe(gulp.dest('build/img'));
}

const createWebp = () => {
  return gulp.src('source/img/**/*{jpg,png}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
}

const createSprite = () => {
  return gulp.src('source/img/icon/*.svg')
    .pipe(svgStore({
      inlineSvg: true
    }))
    .pipe(rename('sprite_v2.svg'))
    .pipe(gulp.dest('build/img'));
}

const copyOther = (done) => {
  gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
    "source/img/*.svg",
    "!source/img/icons/*.svg"
  ], {
    base: "source"
  })
    .pipe(gulp.dest('build'));
  done();
}

const build = gulp.series(
  clean,
  copyOther,
  copyImages,
  gulp.parallel(
    styles,
    buildHtml,
    buildJs,
    createSprite,
    createWebp
  ),
);

exports.build = build;

// exports.build = gulp.series(
//   build
// );

exports.default = gulp.series(
  clean,
  copyOther,
  copyImages,
  gulp.parallel(
    styles,
    buildHtml,
    buildJs,
    createSprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));

exports.build = gulp.series(
  clean,
  copyOther,
  optimizeImages,
  gulp.parallel(
    styles,
    buildHtml,
    buildJs,
    //createSprite,
    //createWebp
  )
);
