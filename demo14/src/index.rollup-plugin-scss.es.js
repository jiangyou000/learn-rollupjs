import { existsSync, mkdirSync, writeFile } from 'fs'
import { dirname } from 'path'
import { createFilter } from 'rollup-pluginutils'

export default function css (options = {}) {
  const filter = createFilter(options.include || ['/**/*.css', '/**/*.scss', '/**/*.sass'], options.exclude)
  let dest = options.output

  //缓存不同入口的符合条件的代码
  const styles = {}

  //获取includePaths不存在的话设置为空数组
  //为了是作为node-sass的参数传入
  let includePaths = options.includePaths || []
  /*
    __dirname：    获得当前执行文件所在目录的完整目录名
    __filename：   获得当前执行文件的带有完整绝对路径的文件名
    process.cwd()：获得当前执行node命令时候的文件夹目录名 
    ./：           文件所在目录
  */

  //将当前的命令运行路径push到includePaths数组
  //如果提前设置了includePaths就会在原值上push新的值
  includePaths.push(process.cwd())

  const compileToCSS = function (scss) {
    // Compile SASS to CSS
    if (scss.length) {
      //如果符合条件的代码存在
      //返回一个新数组，包含通过测试的元素
      //数组去重，能满足当前场景，路径字符串数组去重
      includePaths = includePaths.filter((v, i, a) => a.indexOf(v) === i)
      try {
          //renderSync是node-sass的方法 同步render
        const css = require('node-sass').renderSync(Object.assign({
          //data接受原scss代码
          data: scss,
          //includePaths路径
          includePaths
          //传入options里面设置的选项，输出css字符串
        }, options)).css.toString()
        // Possibly process CSS (e.g. by PostCSS)
        // 如果设置了processor比如postcss
        if (typeof options.processor === 'function') {
            //就用这个函数（插件处理编译生成的css）
          return options.processor(css, styles)
        }
        //返回最终处理完的css字符串
        return css
      } catch (e) {
        //错误处理
        if (options.failOnError) {
          throw e
        }
        console.log()
        console.log(red('Error:\n\t' + e.message))
        if (e.message.includes('Invalid CSS')) {
          console.log(green('Solution:\n\t' + 'fix your Sass code'))
          console.log('Line:   ' + e.line)
          console.log('Column: ' + e.column)
        }
        if (e.message.includes('node-sass') && e.message.includes('find module')) {
          console.log(green('Solution:\n\t' + 'npm install --save node-sass'))
        }
        if (e.message.includes('node-sass') && e.message.includes('bindigs')) {
          console.log(green('Solution:\n\t' + 'npm rebuild node-sass --force'))
        }
        console.log()
      }
    }
  }

  return {
    name: 'css',
    transform (code, id) {
      //import的不是符合要求的文件直接跳过
      if (!filter(id)) {
        return
      }

      //当禁用输出时，样式表将作为字符串导出
      //api 解释禁用任何样式输出或回调，导入为字符串
      // When output is disabled, the stylesheet is exported as a string
      if (options.output === false) {
        const css = compileToCSS(code)
        //编译完毕css，按照rollup要求返回指定格式的对象
        return {
          code: 'export default ' + JSON.stringify(css),
          map: { mappings: '' }
        }
      }

      //如果没有禁用输出则将路径push到includePaths
      // Map of every stylesheet
      styles[id] = code
      includePaths.push(dirname(id))

      return ''
    },
    generateBundle (opts) {
      // No stylesheet needed
      if (options.output === false) {
        return
      }

      // Combine all stylesheets
      let scss = ''
      //合并所有scss代码（这时还没有编译）
      for (const id in styles) {
        scss += styles[id] || ''
      }

      //编译scss
      const css = compileToCSS(scss)

      // Resolve if porcessor returned a Promise
      Promise.resolve(css).then(css => {
        // Emit styles through callback
        //如果output是个函数则运行这个函数
        if (typeof options.output === 'function') {
          options.output(css, styles)
          return
        }

        //如果没有定义output
        if (typeof dest !== 'string') {
          // Don't create unwanted empty stylesheets
          //css为空什么都不做
          if (!css.length) {
            return
          }

          // Guess destination filename
          //css不为空给dest赋值
          dest = opts.dest || opts.file || 'bundle.js'
          if (dest.endsWith('.js')) {
            dest = dest.slice(0, -3)
          }
          dest = dest + '.css'
        }

        // Ensure that dest parent folders exist (create the missing ones)
        //创建文件夹
        ensureParentDirsSync(dirname(dest))

        // Emit styles to file
        //写入文件
        writeFile(dest, css, (err) => {
          if (opts.verbose !== false) {
            if (err) {
              console.error(red(err))
            } else {
              console.log(green(dest), getSize(css.length))
            }
          }
        })
      })
    }
  }
}


//red green getSize是错误输出和日志打印相关函数
function red (text) {
  return '\x1b[1m\x1b[31m' + text + '\x1b[0m'
}

function green (text) {
  return '\x1b[1m\x1b[32m' + text + '\x1b[0m'
}

function getSize (bytes) {
  return bytes < 10000
    ? bytes.toFixed(0) + ' B'
    : bytes < 1024000
    ? (bytes / 1024).toPrecision(3) + ' kB'
    : (bytes / 1024 / 1024).toPrecision(4) + ' MB'
}

function ensureParentDirsSync (dir) {
  if (existsSync(dir)) {
    return
  }

  try {
    mkdirSync(dir)
  } catch (err) {
    if (err.code === 'ENOENT') {
      ensureParentDirsSync(dirname(dir))
      ensureParentDirsSync(dir)
    }
  }
}