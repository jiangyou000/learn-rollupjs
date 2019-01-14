/**
 * 将node内置模块打包到bundle文件中，
 * 不使用rollup-plugin-node-builtins插件时，node内置模块会以外部模块的方式引入，
 * 使用了后会把相应的代码打包到bundle中
 */
import builtins from 'rollup-plugin-node-builtins'
export default {
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs'
    },
    plugins:[
        builtins()
    ]
}