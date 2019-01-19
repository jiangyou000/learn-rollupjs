import { readFile } from 'fs'
import { createServer as createHttpsServer } from 'https'
import { createServer } from 'http'
import { resolve } from 'path'

//设置JavaScript MIME 类型的包
import mime from 'mime'

//该包可以打开浏览器 文件夹什么的，对一些命令封装了一下
import opener from 'opener'

let server

export default function serve (options = { contentBase: '' }) {
  //如果options是数组或者字符串
  if (Array.isArray(options) || typeof options === 'string') {
    options = { contentBase: options }
  }
  //如果contentBase是数组就不处理，不是数组就变成数组
  options.contentBase = Array.isArray(options.contentBase) ? options.contentBase : [options.contentBase]
  options.host = options.host || 'localhost'
  options.port = options.port || 10001
  options.headers = options.headers || {}
  options.https = options.https || false
  options.openPage = options.openPage || ''
  //设置默认mime
  mime.default_type = 'text/plain'

  const requestListener = (request, response) => {
    // Remove querystring
    //获取url并移除其中的querystring
    const urlPath = decodeURI(request.url.split('?')[0])

    //设置header
    Object.keys(options.headers).forEach((key) => {
      response.setHeader(key, options.headers[key])
    })

    //调用readFileFromContentBase，传入三个参数
    readFileFromContentBase(options.contentBase, urlPath, function (error, content, filePath) {
      if (!error) {
        //查找到就返回指定页面
        return found(response, filePath, content)
      }
      //错误处理
      if (error.code !== 'ENOENT') {
        response.writeHead(500)
        response.end('500 Internal Server Error' +
          '\n\n' + filePath +
          '\n\n' + Object.values(error).join('\n') +
          '\n\n(rollup-plugin-serve)', 'utf-8')
        return
      }
      //如果设置了historyApiFallback为true
      if (options.historyApiFallback) {
        //如果historyApiFallback是个字符串就给fallbackPath赋值这个字符串否则赋值为'/index.html'
        var fallbackPath = typeof options.historyApiFallback === 'string' ? options.historyApiFallback : '/index.html'
        //
        readFileFromContentBase(options.contentBase, fallbackPath, function (error, content, filePath) {
          if (error) {
            notFound(response, filePath)
          } else {
            found(response, filePath, content)
          }
        })
      } else {
        notFound(response, filePath)
      }
    })
  }

  // release previous server instance if rollup is reloading configuration in watch mode
  //close()是node createServer的方法
  if (server) {
    server.close()
  }

  // If HTTPS options are available, create an HTTPS server
  //创建一个http或者https服务器,server为新建的server实例
  if (options.https) {
    server = createHttpsServer(options.https, requestListener).listen(options.port, options.host)
  } else {
    server = createServer(requestListener).listen(options.port, options.host)
  }

  //监听结束server的信号,然后结束server
  closeServerOnTermination(server)

  //options.verbose控制台显示服务器地址
  var running = options.verbose === false

  return {
    name: 'serve',
    generateBundle () {
      //配置了显示地址
      if (!running) {
        //再次把running设置为true
        running = true

        // Log which url to visit
        //打印log
        const url = (options.https ? 'https' : 'http') + '://' + options.host + ':' + options.port
        options.contentBase.forEach(base => {
          console.log(green(url) + ' -> ' + resolve(base))
        })

        // Open browser
        //打开浏览器
        if (options.open) {
          opener(url + options.openPage)
        }
      }
    }
  }
}

//从contentBase读取文件
function readFileFromContentBase (contentBase, urlPath, callback) {
  //获得require路径并且和contentBase拼接
  let filePath = resolve(contentBase[0] || '.', '.' + urlPath)

  // Load index.html in directories
  //如果是以 / 结尾 就访问下面的index.html
  if (urlPath.endsWith('/')) {
    filePath = resolve(filePath, 'index.html')
  }

  //读取内容
  readFile(filePath, (error, content) => {
    if (error && contentBase.length > 1) {
      // Try to read from next contentBase
      //如果读取错误就去读下一个contentBase
      readFileFromContentBase(contentBase.slice(1), urlPath, callback)
    } else {
      // We know enough
      //调用callback
      callback(error, content, filePath)
    }
  })
}
//404错误处理
function notFound (response, filePath) {
  response.writeHead(404)
  response.end('404 Not Found' +
    '\n\n' + filePath +
    '\n\n(rollup-plugin-serve)', 'utf-8')
}
//查找到返回指定content
function found (response, filePath, content) {
  response.writeHead(200, { 'Content-Type': mime.getType(filePath) })
  response.end(content, 'utf-8')
}

function green (text) {
  return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
}


//终止server程序监听
function closeServerOnTermination (server) {
  const terminationSignals = ['SIGINT', 'SIGTERM']
  //按下ctrl c后操作系统会发送一个SIGINT信号，来进行一些操作
  terminationSignals.forEach((signal) => {
    process.on(signal, () => {
      //下面这两行如果注释掉的话cmd中ctrl c就无法推出程序，其他shell中仍然可以推出，可能是做了默认处理
      server.close()
      process.exit()
    })
  })
}