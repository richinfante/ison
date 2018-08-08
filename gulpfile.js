const gulp = require('gulp')
const babel = require('gulp-babel')
const insert = require('gulp-insert')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const stripCode = require('gulp-strip-code')
const comment = `/*!
ISON v${require('./package.json').version}
(c) 2018 Rich Infante
Released under the MIT License.
*/
`

gulp.task('default', () =>
  gulp.src('parser.js')
    .pipe(gulp.dest('dist'))
    .pipe(sourcemaps.init())
    .pipe(stripCode({
      start_comment: "debug-block",
      end_comment: "end-debug-block"
    }))
    .pipe(babel({
        presets: ['env'],
    }))
    .pipe(uglify({
      compress:{
        pure_funcs: [
          'console.log',
          'debug.log',
          'debug.array',
          'debug.object',
          'debug.skip',
          'debug.string',
          'debug.types'
        ]
      }
    }))
    .pipe(insert.prepend(comment))
    .pipe(sourcemaps.write('.'))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('dist'))
)