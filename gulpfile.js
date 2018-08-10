const gulp = require('gulp')
const babel = require('gulp-babel')
const insert = require('gulp-insert')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const stripCode = require('gulp-strip-code')
const pump = require('pump')
const comment = `/*!
 * ISON v${require('./package.json').version}
 * (c) 2018 Rich Infante
 * Released under the MIT License.
 */
`

gulp.task('default', (cb) => {
    pump([
      gulp.src('parser.js'),
      rename({
        basename: 'ison'
      }),
      insert.prepend(comment),
      gulp.dest('dist'),
      sourcemaps.init(),
      stripCode({
        start_comment: "debug-block",
        end_comment: "end-debug-block"
      }),
      babel({
        presets: [["env", {
          "targets": {
            "browsers": ["last 2 versions", "cover 99.9%"]
          }
        }]],
      }),
      uglify({
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
      }),
      insert.prepend(comment),
      sourcemaps.write('.'),
      rename({
        suffix: ".min"
      }),
      gulp.dest('dist')
    ], cb)
})