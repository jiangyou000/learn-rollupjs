import { createFilter } from 'rollup-pluginutils'
import fs from 'fs'
import path from 'path'
import stylus from 'stylus'

// 递归创建文件夹
function mkdirs(dir) {
    return new Promise((resolve, reject) => {
        //判断文件夹
        fs.exists(dir, (exist) => {
            if (exist) {
                //文件夹存在的话直接变成resolve状态
                resolve()
            } else {
                //否则创建文件夹
                mkdirs(path.dirname(dir)).then(() => {
                    fs.mkdir(dir, (err) => {
                        if (err) {
                            reject()
                        } else {
                            resolve()
                        }
                    })
                })
            }
        })
    })
}

// 导出一个function
export default function stylusPlugin(options = {}) {
    // 创建一个文件过滤器，过滤以css，styl结尾的文件
    /**
     * 相对于process.cwd（），`options.include`和`options.exclude`都可以是minimatch模式或minimatch模式数组。
     */
    const stylusFilter = createFilter(options.include || ['**/*.css', '**/*.styl'], options.exclude)
    console.log(options)

    // dest用来保存指定的输出路径
    let dest = options.output,
    // styleNodes用来暂存不同文件的css代码
        styleNodes = {}

    // 编译stylus文件
    //complier过程异步处理返回promise
    function complier(str, stylusOpt) {
        return new Promise((resolve, reject) => {
            //这里是stylus包的api
            stylus.render(str, stylusOpt, (err, css) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(css)
                }
            })
        })
    }

    return {
        // 插件名称
        name: 'rollup-plugin-stylus',

        // 解析import时调用，获取文件名称和具体代码，将它们保存起来
        //本例子中共两个资源文件
        transform (code, id) {
            /**
             * 这里code为文件代码，
             * id为文件路径
             */
            /**
             * 如果省略`options.include`或者长度为零，则默认情况下filter将返回`true`。
             * 否则，ID必须与一个或多个迷你匹配模式匹配，并且不得与任何`options.exclude`模式匹配。
             */
            console.log('----------------')
            console.log(id)
            console.log(stylusFilter(id))
            console.log(code)
            console.log('----------------')
            
            //如果不是css styl，则直接返回
            if (!stylusFilter(id)) {
                return
            }
            //如果import的是符合条件（css，scss）的文件，就把代码放入对象中
            styleNodes[id] = code
            console.log(styleNodes)
            return ''
        },
        // generate时调用，用stylus解析代码，并输出到指定目录中
        /**
         * 该函数在bundle.generate()和bundle.write()调用之前运行，接收outputOptions作为参数
         * 异步处理
         */
        async generateBundle (genOpt) {
            let css = ''
            //循环styleNodes，合并其中的代码
            for (let id in styleNodes) {
                // 合并所有css代码
                css += styleNodes[id] || ''
            }

            // 如果css中存在代码则编译stylus代码
            if (css.length) {
                try {
                    //编译stylus代码使用await
                    css = await complier(css, Object.assign({}, options.stylusOpt))
                } catch (error) {
                    console.log(error)
                }
            }

            // 没有指定输出文件路径时，设置一个默认文件
            //如果没有指定options.output
            if (typeof dest !== 'string') {
                //不存在css的话不需要处理
                if (!css.length) {
                    return
                }

                //直接使用rullop的output 不存在的话直接设置bundle.js
                dest = genOpt.dest || 'bundle.js'
                //如果默认的输出文件是'.js'结尾，就把'.js'后缀删除掉
                if (dest.endsWith('.js')) {
                    dest = dest.slice(0, -3)
                }
                //添加css后缀
                dest = dest + '.css'
            }

            // 创建目录
            await mkdirs(path.dirname(dest))
            //将css写入到结果文件内
            return new Promise((resolve, reject) => {
                fs.writeFile(dest, css, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }
}